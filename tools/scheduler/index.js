#!/usr/bin/env node
/**
 * jat-scheduler - Polls task databases and workflow files for scheduled execution.
 *
 * Task scheduling:
 *   Scans all projects in ~/code/ that have .jat/tasks.db for tasks where:
 *     next_run_at <= now AND status = 'open'
 *
 *   For recurring tasks (schedule_cron set):
 *     - Creates a child instance task inheriting command/agent_program/model
 *     - For regular tasks: Spawns via /api/work/spawn
 *     - For quick commands (/quick-command:{id}): Executes via /api/quick-command
 *     - For workflows (/workflow:{id}): Executes via /api/workflows/{id}/run
 *     - Computes next next_run_at from cron expression
 *
 *   For one-shot tasks (no schedule_cron, but next_run_at set):
 *     - Spawns directly using task's command/agent_program/model
 *     - Clears next_run_at after spawn
 *
 * Workflow scheduling (direct from workflow JSON files):
 *   Reads ~/.config/jat/workflows/*.json for enabled workflows with trigger_cron nodes.
 *   Tracks next_run_at per workflow in ~/.config/jat/workflows/.scheduler-state.json.
 *   Executes due workflows via POST /api/workflows/{id}/run with trigger='cron'.
 *
 * Usage:
 *   node index.js [--poll-interval 30] [--port 3334] [--verbose] [--dry-run]
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { createServer } from 'node:http';
import { discoverProjects, getDueTasks, updateNextRun, createChildTask, updateChildResult, getDueBaseRefreshes, updateBaseRefresh } from './lib/db.js';
import { nextCronRun } from './lib/cron.js';
import { getDueWorkflows, updateWorkflowNextRun, discoverCronWorkflows, getWorkflowState } from './lib/workflows.js';

// --- CLI args ---
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return args[i + 1] ?? fallback;
}
const POLL_INTERVAL = parseInt(getArg('poll-interval', '30'), 10) * 1000;
const HTTP_PORT = parseInt(getArg('port', '3334'), 10);
const IDE_URL = getArg('ide-url', 'http://127.0.0.1:3333');
const VERBOSE = args.includes('--verbose');
const DRY_RUN = args.includes('--dry-run');

// --- State ---
let running = true;
let pollCount = 0;
let lastPoll = null;
let spawned = [];  // recent spawn log [{taskId, project, time, childId?}]
let pollTimer = null;

function log(msg) { console.log(`[scheduler] ${new Date().toISOString().slice(11, 19)} ${msg}`); }
function debug(msg) { if (VERBOSE) log(msg); }

// --- Read timezone from projects.json ---
function getTimezone() {
  try {
    const configPath = join(homedir(), '.config/jat/projects.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      return config.defaults?.timezone || 'UTC';
    }
  } catch { /* ignore */ }
  return 'UTC';
}

// --- Spawn via IDE API ---
async function spawnTask(taskId, project, model, agentProgram) {
  const body = { taskId, project };
  if (model) body.model = model;
  if (agentProgram) body.agentId = agentProgram;

  debug(`Spawning task ${taskId} for project ${project} (model=${model || 'default'})`);

  if (DRY_RUN) {
    log(`[DRY-RUN] Would spawn ${taskId} in ${project}`);
    return { success: true, dryRun: true };
  }

  try {
    const res = await fetch(`${IDE_URL}/api/work/spawn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      log(`Spawn failed for ${taskId}: ${data.message || res.statusText}`);
      return { success: false, error: data.message || res.statusText };
    }
    log(`Spawned ${taskId} → agent ${data.session?.agentName || 'unknown'}`);
    return { success: true, ...data };
  } catch (err) {
    log(`Spawn error for ${taskId}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// --- Quick command template loading ---
function readTemplates() {
  try {
    const templatesFile = join(homedir(), '.config/jat/quick-commands.json');
    if (!existsSync(templatesFile)) return [];
    const content = readFileSync(templatesFile, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

// --- Execute quick command via IDE API ---
async function executeQuickCommand(task, project) {
  // Extract template ID from command: /quick-command:{templateId}
  const templateId = task.command.replace('/quick-command:', '');
  const templates = readTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template) {
    log(`Quick command template ${templateId} not found for task ${task.id}`);
    return { success: false, error: `Template ${templateId} not found` };
  }

  // Parse variable defaults from task description (stored as JSON block)
  let variables = {};
  try {
    const jsonMatch = task.description?.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) variables = JSON.parse(jsonMatch[1]);
  } catch { /* ignore parse errors */ }

  const body = {
    prompt: template.prompt,
    project,
    model: task.model || template.defaultModel || 'haiku',
    variables,
    timeout: 120000,
  };

  debug(`Executing quick command: template=${template.name}, project=${project}, model=${body.model}`);

  if (DRY_RUN) {
    log(`[DRY-RUN] Would execute quick command: ${template.name} in ${project}`);
    return { success: true, dryRun: true };
  }

  try {
    const res = await fetch(`${IDE_URL}/api/quick-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      log(`Quick command failed for ${task.id}: ${data.message || res.statusText}`);
      return { success: false, error: data.message || res.statusText };
    }
    log(`Quick command completed: ${template.name} (${data.durationMs}ms)`);
    return { success: true, result: data.result, durationMs: data.durationMs };
  } catch (err) {
    log(`Quick command error for ${task.id}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Check if a task command is a quick command.
 * @param {string} command
 * @returns {boolean}
 */
function isQuickCommand(command) {
  return command && command.startsWith('/quick-command:');
}

/**
 * Check if a task command is a workflow execution.
 * @param {string} command
 * @returns {boolean}
 */
function isWorkflow(command) {
  return command && command.startsWith('/workflow:');
}

/**
 * Check if a task is a human task (no agent spawn needed).
 * Human tasks have null, empty, or '/human' command.
 * @param {string} command
 * @returns {boolean}
 */
function isHumanTask(command) {
  return !command || command === '' || command === '/human';
}

/**
 * Execute a workflow via the IDE API.
 * @param {object} task
 * @param {string} project
 */
async function executeWorkflow(task, project) {
  const workflowId = task.command.replace('/workflow:', '');

  debug(`Executing workflow ${workflowId} for project ${project}`);

  if (DRY_RUN) {
    log(`[DRY-RUN] Would execute workflow ${workflowId} in ${project}`);
    return { success: true, dryRun: true };
  }

  try {
    const res = await fetch(`${IDE_URL}/api/workflows/${encodeURIComponent(workflowId)}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'cron', project }),
    });
    const data = await res.json();
    if (!res.ok) {
      log(`Workflow execution failed for ${task.id}: ${data.message || data.error || res.statusText}`);
      return { success: false, error: data.message || data.error || res.statusText };
    }
    log(`Workflow ${workflowId} completed (status: ${data.status})`);
    return { success: true, ...data };
  } catch (err) {
    log(`Workflow execution error for ${task.id}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// --- Base refresh: fetch external content ---

/**
 * Fetch content from a URL and extract text as markdown.
 * @param {string} url
 * @returns {Promise<{content: string, error?: string}>}
 */
async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JAT-Scheduler/1.0', 'Accept': 'text/html, text/plain, application/json, */*' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      return { content: '', error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (contentType.includes('application/json')) {
      // Pretty-print JSON
      try {
        return { content: '```json\n' + JSON.stringify(JSON.parse(text), null, 2) + '\n```' };
      } catch { return { content: text }; }
    }
    if (contentType.includes('text/html')) {
      // Strip HTML tags for a rough markdown extraction
      return { content: htmlToMarkdown(text) };
    }
    // Plain text or other
    return { content: text };
  } catch (err) {
    return { content: '', error: err.message };
  }
}

/**
 * Basic HTML to markdown conversion (strips tags, preserves structure).
 * @param {string} html
 * @returns {string}
 */
function htmlToMarkdown(html) {
  let md = html;
  // Remove script and style blocks
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Convert headers
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n');
  // Convert paragraphs and line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  // Convert lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  // Convert bold and italic
  md = md.replace(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, '**$1**');
  md = md.replace(/<(?:i|em)[^>]*>([\s\S]*?)<\/(?:i|em)>/gi, '*$1*');
  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  // Convert code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n');
  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  // Collapse excessive whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

/**
 * Refresh a single external base by fetching its content.
 * @param {object} base - Base object with parsed source_config
 * @param {string} dataDbPath - Path to data.db
 * @param {string} projectName - Project name for logging
 * @param {string} tz - Timezone
 */
async function refreshBase(base, dataDbPath, projectName, tz) {
  const config = base.source_config;
  const subtype = config.source_subtype || 'url';

  log(`Refreshing base "${base.name}" (${subtype}) in ${projectName}`);

  let result;
  if (subtype === 'url' && config.url) {
    result = await fetchUrlContent(config.url);
  } else {
    // Unsupported subtype for now
    log(`Unsupported source_subtype "${subtype}" for base ${base.id}`);
    result = { content: '', error: `Unsupported source subtype: ${subtype}` };
  }

  const updatedConfig = { ...config, fetchedAt: new Date().toISOString() };

  if (result.error) {
    updatedConfig.last_error = result.error;
    log(`Refresh error for "${base.name}": ${result.error}`);
  } else {
    delete updatedConfig.last_error;
  }

  // Compute next refresh
  if (config.refresh_cron) {
    updatedConfig.next_refresh_at = nextCronRun(config.refresh_cron, tz);
    debug(`Next refresh for "${base.name}": ${updatedConfig.next_refresh_at}`);
  }

  const content = result.content || base.content || '';
  const tokenEstimate = Math.ceil(content.length / 4);

  if (DRY_RUN) {
    log(`[DRY-RUN] Would update base "${base.name}" (${content.length} chars, ~${tokenEstimate} tokens)`);
    return;
  }

  updateBaseRefresh(dataDbPath, base.id, {
    content,
    token_estimate: tokenEstimate,
    source_config: updatedConfig,
  });

  log(`Refreshed "${base.name}" (${content.length} chars, ~${tokenEstimate} tokens)`);
}

// --- Main poll loop ---
async function poll() {
  pollCount++;
  const tz = getTimezone();
  debug(`Poll #${pollCount} (tz=${tz})`);

  const projects = discoverProjects();
  debug(`Found ${projects.length} project(s)`);

  for (const proj of projects) {
    const dueTasks = getDueTasks(proj.dbPath);
    if (dueTasks.length === 0) continue;

    debug(`${proj.name}: ${dueTasks.length} due task(s)`);

    for (const task of dueTasks) {
      const quickCmd = isQuickCommand(task.command);
      const workflowCmd = isWorkflow(task.command);

      const humanTask = isHumanTask(task.command);

      if (task.schedule_cron) {
        // Recurring: create child instance task, execute, update next_run_at
        const childId = createChildTask(proj.dbPath, task, { dueDate: task.next_run_at });
        const cmdLabel = quickCmd ? ' [quick-command]' : workflowCmd ? ' [workflow]' : humanTask ? ' [human]' : '';
        log(`Created child ${childId} from recurring ${task.id} (cron: ${task.schedule_cron})${cmdLabel}`);

        let result;
        if (humanTask) {
          // Human task: child created with due_date, no agent spawn needed
          log(`Human task ${childId} created with due date (no agent spawn)`);
          result = { success: true, human: true };
        } else if (quickCmd) {
          // Quick command: execute via /api/quick-command, store result in child
          result = await executeQuickCommand(task, proj.name);
          if (result.success && result.result) {
            updateChildResult(proj.dbPath, childId, result.result, result.durationMs);
          }
        } else if (workflowCmd) {
          // Workflow: execute via /api/workflows/{id}/run
          result = await executeWorkflow(task, proj.name);
        } else {
          // Regular task: spawn agent session
          result = await spawnTask(childId, proj.name, task.model, task.agent_program);
        }

        // Compute next run regardless of result
        const nextRun = nextCronRun(task.schedule_cron, tz);
        updateNextRun(proj.dbPath, task.id, nextRun);
        debug(`Next run for ${task.id}: ${nextRun}`);

        spawned.push({
          taskId: task.id,
          childId,
          project: proj.name,
          time: new Date().toISOString(),
          result: result.success ? 'ok' : 'failed',
          type: humanTask ? 'human' : quickCmd ? 'quick-command' : workflowCmd ? 'workflow' : 'spawn',
        });
      } else {
        // One-shot: execute directly, clear next_run_at
        let result;
        if (humanTask) {
          // Human task: nothing to spawn, just clear the schedule
          log(`One-shot human task ${task.id} marked as due (no agent spawn)`);
          result = { success: true, human: true };
        } else if (quickCmd) {
          result = await executeQuickCommand(task, proj.name);
        } else if (workflowCmd) {
          result = await executeWorkflow(task, proj.name);
        } else {
          result = await spawnTask(task.id, proj.name, task.model, task.agent_program);
        }

        // Clear next_run_at so it won't fire again
        updateNextRun(proj.dbPath, task.id, null);

        spawned.push({
          taskId: task.id,
          project: proj.name,
          time: new Date().toISOString(),
          result: result.success ? 'ok' : 'failed',
          type: humanTask ? 'human' : quickCmd ? 'quick-command' : workflowCmd ? 'workflow' : 'spawn',
        });
      }
    }
  }

  // --- Base refresh scheduling ---
  for (const proj of projects) {
    const dataDbPath = join(proj.path, '.jat', 'data.db');
    const dueBases = getDueBaseRefreshes(dataDbPath);
    if (dueBases.length === 0) continue;

    debug(`${proj.name}: ${dueBases.length} base(s) due for refresh`);

    for (const base of dueBases) {
      await refreshBase(base, dataDbPath, proj.name, tz);

      spawned.push({
        taskId: `base:${base.id}`,
        project: proj.name,
        time: new Date().toISOString(),
        result: 'ok',
        type: 'base-refresh',
      });
    }
  }

  // --- Workflow scheduling (direct from workflow JSON files) ---
  const dueWorkflows = getDueWorkflows();
  if (dueWorkflows.length > 0) {
    debug(`${dueWorkflows.length} due workflow(s)`);
  }

  for (const wf of dueWorkflows) {
    const tz = wf.timezone || getTimezone();
    log(`Executing workflow ${wf.id} (cron: ${wf.cronExpr})`);

    if (DRY_RUN) {
      log(`[DRY-RUN] Would execute workflow ${wf.id}`);
    } else {
      try {
        const res = await fetch(`${IDE_URL}/api/workflows/${encodeURIComponent(wf.id)}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger: 'cron' }),
        });
        const data = await res.json();
        if (!res.ok) {
          log(`Workflow ${wf.id} failed: ${data.message || data.error || res.statusText}`);
        } else {
          log(`Workflow ${wf.id} completed (status: ${data.status})`);
        }

        spawned.push({
          taskId: `workflow:${wf.id}`,
          project: 'workflows',
          time: new Date().toISOString(),
          result: res.ok ? 'ok' : 'failed',
          type: 'workflow-cron',
        });
      } catch (err) {
        log(`Workflow ${wf.id} error: ${err.message}`);
        spawned.push({
          taskId: `workflow:${wf.id}`,
          project: 'workflows',
          time: new Date().toISOString(),
          result: 'failed',
          type: 'workflow-cron',
        });
      }
    }

    // Always compute and store next run
    const nextRun = nextCronRun(wf.cronExpr, tz);
    updateWorkflowNextRun(wf.id, nextRun);
    debug(`Next run for workflow ${wf.id}: ${nextRun}`);
  }

  lastPoll = new Date().toISOString();

  // Trim spawn log to last 100 entries
  if (spawned.length > 100) spawned = spawned.slice(-100);
}

// --- HTTP control API ---
function startHttpServer() {
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === '/status') {
      const cronWorkflows = discoverCronWorkflows();
      const workflowState = getWorkflowState();
      res.end(JSON.stringify({
        running,
        pollInterval: POLL_INTERVAL / 1000,
        pollCount,
        lastPoll,
        recentSpawns: spawned.slice(-10),
        projectCount: discoverProjects().length,
        workflowCount: cronWorkflows.length,
        workflows: cronWorkflows.map(wf => ({
          id: wf.id,
          name: wf.name,
          cronExpr: wf.cronExpr,
          nextRunAt: workflowState[wf.id] || null,
        })),
        uptime: process.uptime(),
      }));
    } else if (req.method === 'POST' && req.url === '/start') {
      if (!running) {
        running = true;
        schedulePoll();
        log('Resumed polling');
      }
      res.end(JSON.stringify({ running: true }));
    } else if (req.method === 'POST' && req.url === '/stop') {
      running = false;
      if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
      log('Paused polling');
      res.end(JSON.stringify({ running: false }));
    } else if (req.method === 'POST' && req.url === '/poll') {
      // Trigger immediate poll
      poll().then(() => {
        res.end(JSON.stringify({ success: true, lastPoll }));
      }).catch(err => {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
      return; // Don't end res here, it's handled in the .then()
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not found' }));
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${HTTP_PORT} in use, running without HTTP API (polling still active)`);
    } else {
      log(`HTTP server error: ${err.message}`);
    }
  });

  server.listen(HTTP_PORT, '127.0.0.1', () => {
    log(`HTTP control API on http://127.0.0.1:${HTTP_PORT}`);
    log(`  GET  /status  - scheduler status`);
    log(`  POST /start   - resume polling`);
    log(`  POST /stop    - pause polling`);
    log(`  POST /poll    - trigger immediate poll`);
  });
}

// --- Scheduling ---
function schedulePoll() {
  if (!running) return;
  pollTimer = setTimeout(async () => {
    try {
      await poll();
    } catch (err) {
      log(`Poll error: ${err.message}`);
    }
    schedulePoll();
  }, POLL_INTERVAL);
}

// --- Entry point ---
log(`Starting jat-scheduler (poll=${POLL_INTERVAL / 1000}s, ide=${IDE_URL}, port=${HTTP_PORT})`);
if (DRY_RUN) log('[DRY-RUN] No tasks will actually be spawned');

startHttpServer();

// Run first poll immediately, then schedule
poll().catch(err => log(`Initial poll error: ${err.message}`));
schedulePoll();

// Graceful shutdown
process.on('SIGINT', () => { log('Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { log('Shutting down...'); process.exit(0); });
