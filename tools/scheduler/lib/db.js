/**
 * Database functions for jat-scheduler.
 * Reads per-project .jat/tasks.db files to find due tasks.
 */

import Database from 'better-sqlite3';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';

/**
 * Extract text content from a blocks JSON string.
 */
function extractTextContent(blocksStr) {
  try {
    const blocks = JSON.parse(blocksStr || '[]');
    return blocks.filter(b => b.type === 'text').map(b => b.content).join('\n\n') || '';
  } catch { return ''; }
}

/**
 * Discover all projects with .jat/tasks.db.
 * Checks both ~/code/ directories and projects.json config.
 * @returns {Array<{name: string, path: string, dbPath: string}>}
 */
export function discoverProjects() {
  const projects = new Map(); // name -> {path, dbPath}

  // 1. Scan ~/code/ for directories with .jat/tasks.db
  const codeDir = join(homedir(), 'code');
  if (existsSync(codeDir)) {
    for (const entry of readdirSync(codeDir)) {
      const projPath = join(codeDir, entry);
      const dbPath = join(projPath, '.jat', 'tasks.db');
      try {
        if (statSync(projPath).isDirectory() && existsSync(dbPath)) {
          projects.set(entry, { path: projPath, dbPath });
        }
      } catch { /* skip inaccessible */ }
    }
  }

  // 2. Also check projects.json for custom paths
  try {
    const configPath = join(homedir(), '.config/jat/projects.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      for (const [key, proj] of Object.entries(config.projects || {})) {
        if (proj.hidden) continue;
        const projPath = (proj.path || '').replace(/^~/, homedir());
        const dbPath = join(projPath, '.jat', 'tasks.db');
        if (existsSync(dbPath) && !projects.has(key)) {
          projects.set(key, { path: projPath, dbPath });
        }
      }
    }
  } catch { /* ignore config errors */ }

  return Array.from(projects.entries()).map(([name, info]) => ({
    name,
    ...info,
  }));
}

/**
 * Get tasks that are due to run now.
 * Finds tasks where next_run_at <= now AND status = 'open'.
 * @param {string} dbPath - Path to .jat/tasks.db
 * @returns {Array<object>}
 */
export function getDueTasks(dbPath) {
  let db;
  try {
    db = new Database(dbPath, { readonly: true });
    const now = new Date().toISOString();
    const rows = db.prepare(`
      SELECT id, title, description, status, priority, issue_type,
             command, agent_program, model, schedule_cron, next_run_at
      FROM tasks
      WHERE next_run_at IS NOT NULL
        AND next_run_at <= ?
        AND status = 'open'
      ORDER BY priority ASC, next_run_at ASC
    `).all(now);
    return rows;
  } catch (err) {
    console.error(`[scheduler] Error reading ${dbPath}: ${err.message}`);
    return [];
  } finally {
    if (db) db.close();
  }
}

/**
 * Update next_run_at for a task.
 * @param {string} dbPath
 * @param {string} taskId
 * @param {string|null} nextRunAt - ISO datetime or null to clear
 */
export function updateNextRun(dbPath, taskId, nextRunAt) {
  let db;
  try {
    db = new Database(dbPath);
    db.prepare(`
      UPDATE tasks SET next_run_at = ?, updated_at = ? WHERE id = ?
    `).run(nextRunAt, new Date().toISOString(), taskId);
  } finally {
    if (db) db.close();
  }
}

/**
 * Update a child task with quick command result.
 * Stores the result in the notes field and closes the task.
 * @param {string} dbPath
 * @param {string} childId
 * @param {string} result - The quick command output
 * @param {number} [durationMs] - Execution time in ms
 */
export function updateChildResult(dbPath, childId, result, durationMs) {
  let db;
  try {
    db = new Database(dbPath);
    const now = new Date().toISOString();
    const notes = durationMs
      ? `Quick command result (${durationMs}ms):\n\n${result}`
      : `Quick command result:\n\n${result}`;

    db.prepare(`
      UPDATE tasks SET notes = ?, status = 'closed', close_reason = 'Quick command completed', closed_at = ?, updated_at = ? WHERE id = ?
    `).run(notes, now, now, childId);
  } finally {
    if (db) db.close();
  }
}

// ---------------------------------------------------------------------------
// Bases refresh scheduling
// ---------------------------------------------------------------------------

/**
 * Get external bases that are due for refresh.
 * Scans .jat/data.db for bases where source_config contains
 * _migrated_source_type='external' + refresh_cron + next_refresh_at <= now.
 * @param {string} dataDbPath - Path to .jat/data.db
 * @returns {Array<object>}
 */
export function getDueBaseRefreshes(dataDbPath) {
  let db;
  try {
    if (!existsSync(dataDbPath)) return [];
    db = new Database(dataDbPath, { readonly: true });

    // Check if bases table exists
    const hasTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bases'").get();
    if (!hasTable) return [];

    const now = new Date().toISOString();
    const rows = db.prepare(`
      SELECT id, name, blocks, source_config, token_estimate
      FROM bases
      WHERE json_extract(source_config, '$._migrated_source_type') = 'external'
    `).all();

    // Filter in JS since source_config is JSON
    return rows.filter(row => {
      try {
        const config = JSON.parse(row.source_config || '{}');
        return config.refresh_cron
          && config.next_refresh_at
          && config.next_refresh_at <= now;
      } catch { return false; }
    }).map(row => ({
      ...row,
      source_config: JSON.parse(row.source_config || '{}'),
      // Extract text content from blocks for backward compat
      content: extractTextContent(row.blocks),
    }));
  } catch (err) {
    console.error(`[scheduler] Error reading bases ${dataDbPath}: ${err.message}`);
    return [];
  } finally {
    if (db) db.close();
  }
}

/**
 * Update a base after refresh: new content (as text block), token estimate, and next_refresh_at.
 * @param {string} dataDbPath - Path to .jat/data.db
 * @param {string} baseId
 * @param {object} updates
 * @param {string} [updates.content] - New fetched content (stored as text block)
 * @param {number} [updates.token_estimate] - Rough token count
 * @param {object} [updates.source_config] - Updated source config (merged)
 */
export function updateBaseRefresh(dataDbPath, baseId, updates) {
  let db;
  try {
    db = new Database(dataDbPath);
    const now = new Date().toISOString();
    const fields = ['updated_at = ?'];
    const values = [now];

    if (updates.content !== undefined) {
      // Update content by replacing the text block in blocks JSON
      const row = db.prepare('SELECT blocks FROM bases WHERE id = ?').get(baseId);
      const blocks = row?.blocks ? JSON.parse(row.blocks) : [];
      const textBlock = blocks.find(b => b.type === 'text');
      if (textBlock) {
        textBlock.content = updates.content;
      } else {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
        blocks.unshift({ type: 'text', id, content: updates.content });
      }
      fields.push('blocks = ?');
      values.push(JSON.stringify(blocks));
    }
    if (updates.token_estimate !== undefined) {
      fields.push('token_estimate = ?');
      values.push(updates.token_estimate);
    }
    if (updates.source_config !== undefined) {
      fields.push('source_config = ?');
      values.push(JSON.stringify(updates.source_config));
    }

    values.push(baseId);
    db.prepare(`UPDATE bases SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  } finally {
    if (db) db.close();
  }
}

// ---------------------------------------------------------------------------
// Task child creation
// ---------------------------------------------------------------------------

/**
 * Generate a short random ID for child tasks.
 * @returns {string} 5-character alphanumeric ID
 */
function genId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Create a child instance task from a recurring parent.
 * Inherits command, agent_program, model from parent.
 * @param {string} dbPath
 * @param {object} parent - Parent task object
 * @param {object} [options] - Optional settings
 * @param {string} [options.dueDate] - ISO datetime for the child's due_date
 * @returns {string} ID of the created child task
 */
export function createChildTask(dbPath, parent, options = {}) {
  let db;
  try {
    db = new Database(dbPath);

    // Extract project prefix from parent ID (e.g., "jat" from "jat-abc")
    const prefix = parent.id.split('-')[0];
    const childId = `${prefix}-${genId()}`;
    const now = new Date().toISOString();
    const title = `${parent.title} (${new Date().toLocaleDateString()})`;

    db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, issue_type,
                         command, agent_program, model, parent_id, due_date, created_at, updated_at)
      VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      childId,
      title,
      parent.description || '',
      parent.priority,
      // Children of recurring chores get type 'task' (chore = recurring parent only)
      parent.issue_type === 'chore' ? 'task' : parent.issue_type,
      parent.command || '/jat:start',
      parent.agent_program || null,
      parent.model || null,
      parent.id,
      options.dueDate || null,
      now,
      now,
    );

    // Copy labels from parent
    const labels = db.prepare('SELECT label FROM labels WHERE issue_id = ?').all(parent.id);
    const insertLabel = db.prepare('INSERT INTO labels (issue_id, label) VALUES (?, ?)');
    for (const { label } of labels) {
      insertLabel.run(childId, label);
    }

    return childId;
  } finally {
    if (db) db.close();
  }
}
