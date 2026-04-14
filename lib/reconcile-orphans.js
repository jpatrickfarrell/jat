/**
 * Orphan task reconciliation.
 *
 * An "orphan" is a task whose status is `in_progress` but whose assignee agent
 * no longer has a live tmux session. This happens when a session is killed
 * ungracefully (without running `/jat:complete`), leaving the task stuck
 * in_progress forever.
 *
 * reconcileOrphansForProject() finds these, resets them to status=open, and
 * appends a `paused` timeline event so they surface in the IDE's paused section
 * with reason "Session ended without completion".
 */

import { execFile } from 'child_process';
import { appendFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { homedir } from 'os';
// @ts-ignore - better-sqlite3 types may not match exactly
import Database from 'better-sqlite3';
import { resolveBackendForProject } from './projects-config.js';
import { getBackendForProject } from './tasks-backend.js';

const execFileAsync = promisify(execFile);

async function tmuxSessionExists(name) {
  try {
    await execFileAsync('tmux', ['has-session', '-t', name], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check whether an assignee name corresponds to a real agent that actually
 * ran a Claude session. Prevents fabricating paused events for free-text
 * assignees (e.g. "JAT Agent") that were never a registered agent.
 *
 * Returns true if ANY of these hold:
 *   - Assignee is registered in ~/.agent-mail.db
 *   - A timeline file /tmp/jat-timeline-jat-{assignee}.jsonl contains a
 *     prior `starting` or `working` event (proves a real session existed)
 */
async function isRealAgent(assignee) {
  if (!assignee) return false;
  // Invalid tmux session names (spaces, etc.) can never be a real agent
  if (/[\s]/.test(assignee)) {
    // Still allow if timeline proves otherwise (very unlikely), so fall through
  }

  // 1. Agent Mail DB lookup
  const dbPath = process.env.AGENT_MAIL_DB || join(homedir(), '.agent-mail.db');
  if (existsSync(dbPath)) {
    try {
      const db = new Database(dbPath, { readonly: true });
      const row = db.prepare('SELECT 1 FROM agents WHERE name = ? LIMIT 1').get(assignee);
      db.close();
      if (row) return true;
    } catch {
      // non-fatal — fall through to timeline check
    }
  }

  // 2. Timeline history check — did this agent ever emit a starting/working signal?
  const timelinePath = `/tmp/jat-timeline-jat-${assignee}.jsonl`;
  if (existsSync(timelinePath)) {
    try {
      const content = await readFile(timelinePath, 'utf-8');
      for (const line of content.split('\n')) {
        if (!line) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === 'signal' && (ev.state === 'starting' || ev.state === 'working')) {
            return true;
          }
        } catch {
          // skip malformed
        }
      }
    } catch {
      // non-fatal
    }
  }

  return false;
}

/**
 * Find orphaned in_progress tasks for a project and reset them to open.
 *
 * @param {string} projectName
 * @returns {Promise<Array<{taskId: string, agentName: string, title: string}>>}
 */
export async function reconcileOrphansForProject(projectName) {
  if (!projectName) return [];

  let backend;
  try {
    // resolveBackendForProject throws when backend=postgres but backend_url missing
    resolveBackendForProject(projectName);
    backend = await getBackendForProject(projectName);
  } catch {
    return [];
  }

  let inProgress;
  try {
    const list = backend.list({ projectName, status: 'in_progress' });
    inProgress = list && typeof list.then === 'function' ? await list : list;
  } catch {
    return [];
  }
  if (!Array.isArray(inProgress) || inProgress.length === 0) return [];

  const orphans = [];
  const nowIso = new Date().toISOString();

  for (const task of inProgress) {
    // Defensive guard: only revert in_progress orphans. Statuses like
    // waiting/blocked/submitted/accepted/deployed are intentionally parked
    // with no live session and must never be reverted by the reaper.
    if (task.status !== 'in_progress') continue;

    const assignee = task.assignee;
    if (!assignee) continue; // Nothing to check without an agent name
    const sessionName = `jat-${assignee}`;
    if (await tmuxSessionExists(sessionName)) continue;

    // Orphan — reset. Clear assignee (text) and assignee_id (UUID FK) so the
    // task reads as fully unassigned in the UI.
    try {
      const r = backend.update(task.id, { status: 'open', assignee: null, assignee_id: null });
      if (r && typeof r.then === 'function') await r;
    } catch {
      continue;
    }

    // Only emit a paused timeline event if this assignee was actually a real
    // agent with a prior session. Free-text assignees (e.g. manually-entered
    // names that never had a Claude session) would otherwise surface as
    // phantom "paused sessions" in the IDE that can never be resumed.
    if (!(await isRealAgent(assignee))) {
      orphans.push({ taskId: task.id, agentName: assignee, title: task.title });
      continue;
    }

    const event = {
      type: 'signal',
      state: 'paused',
      task_id: task.id,
      timestamp: nowIso,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        agentName: assignee,
        reason: 'Session ended without completion',
      },
    };
    try {
      await appendFile(
        `/tmp/jat-timeline-jat-${assignee}.jsonl`,
        JSON.stringify(event) + '\n',
        'utf-8'
      );
    } catch {
      // non-fatal
    }

    orphans.push({ taskId: task.id, agentName: assignee, title: task.title });
  }

  return orphans;
}
