/**
 * ProjectTasksBackend
 *
 * Read-only TaskBackend for graduated projects whose tasks live in the
 * project_tasks table (JST/jat-feedback schema) rather than the JAT-native
 * `tasks` table.
 *
 * Key schema differences vs PostgresTaskBackend / tasks-schema-postgres.sql:
 *
 *   Column         | tasks (JAT native)     | project_tasks (JST)
 *   ───────────────┼────────────────────────┼──────────────────────────────
 *   primary key    | TEXT  (e.g. jat-abc12) | UUID
 *   task identifier| id                     | jat_id  (TEXT, original JAT id)
 *   priority       | INTEGER 0-5            | TEXT critical/high/medium/low
 *   status         | open/in_progress/…     | same canonical vocabulary (post-unification)
 *   labels         | separate labels table  | labels TEXT[]  (PG array)
 *   comments       | comments table         | project_tasks_comments
 *   dependencies   | dependencies table     | none (unsupported)
 *
 * This backend is used by getBackendForProject() when a project entry in
 * ~/.config/jat/projects.json has backend="postgres" (indicating graduation
 * via jt graduate which writes to project_tasks since jat-dplkm.3).
 *
 * Write operations (create, update, close, delete) are NOT implemented —
 * writes go through the jt CLI or JAT's SQLite backup while the read path
 * is unified here.
 */

import pg from 'pg';
import { randomUUID } from 'crypto';
import { TaskBackend } from './tasks-backend.js';
import {
  priorityToInt,
  priorityToText,
  insertProjectTaskSQL,
} from './project-tasks-mapping.js';
import { TERMINAL_STATUSES } from './task-statuses.js';

// ---------------------------------------------------------------------------
// Pool management (one Pool per DSN)
// ---------------------------------------------------------------------------

/** @type {Map<string, import('pg').Pool>} */
const _pools = new Map();

function getPool(connectionString) {
  if (!connectionString) {
    throw new Error(
      'ProjectTasksBackend requires a connection string. ' +
      'Set backend_url in ~/.config/jat/projects.json.'
    );
  }
  let pool = _pools.get(connectionString);
  if (!pool) {
    pool = new pg.Pool({ connectionString, max: 5 });
    pool.on('error', (err) => {
      console.error('[ProjectTasksBackend] Pool error:', err.message);
    });
    _pools.set(connectionString, pool);
  }
  return pool;
}

// ---------------------------------------------------------------------------
// Priority mapping
// ---------------------------------------------------------------------------

/** @type {Record<number, string>} */
const INT_TO_PRIORITY = {
  0: 'critical',
  1: 'high',
  2: 'medium',
  3: 'low',
  4: 'low',
  5: 'low',
};

// ---------------------------------------------------------------------------
// Row → Task mapping
// ---------------------------------------------------------------------------

function parseReviewOverride(notes) {
  if (!notes) return null;
  const match = notes.match(/\[REVIEW_OVERRIDE:(always_review|always_auto)\]/);
  return match ? match[1] : null;
}

/**
 * Parse labels from the project_tasks row.
 * Prefers the TEXT[] `labels` column; falls back to `labels_text` (space-separated).
 *
 * @param {Record<string, any>} row
 * @returns {string[]}
 */
function parseLabels(row) {
  // pg returns TEXT[] as a JS array
  if (Array.isArray(row.labels)) {
    return row.labels.filter(Boolean);
  }
  // Fallback: labels_text is space-separated (added by JAT migration)
  if (row.labels_text && typeof row.labels_text === 'string') {
    return row.labels_text.split(' ').filter(Boolean);
  }
  return [];
}

/**
 * Map a project_tasks row to the JAT Task shape expected by the IDE.
 *
 * @param {Record<string, any>} row   - Raw row from project_tasks query
 * @param {string} projectName        - Project name (e.g. "meadow")
 * @param {string} projectPath        - Absolute path to project root
 * @returns {import('./tasks-backend.js').Task}
 */
function mapRow(row, projectName, projectPath) {
  // Use jat_id as the task id so JAT tooling references tasks by their
  // original text ids. Fall back to UUID string if jat_id is missing.
  const id = row.jat_id || String(row.id);

  return {
    id,
    title:          row.title || '',
    description:    row.description || '',
    notes:          row.notes || '',
    status:         row.status,
    priority:       priorityToInt(row.priority),
    issue_type:     row.issue_type || 'task',
    assignee:       row.assignee_name || row.assignee || null,
    assignee_id:    row.assignee_id || null,
    assignee_name:  row.assignee_name || null,
    assignee_email: row.assignee_email || null,
    assignee_avatar_url: row.assignee_avatar_url || null,
    command:        row.command || null,
    agent_program:  row.agent_program || null,
    model:          row.model || null,
    schedule_cron:  row.schedule_cron || null,
    next_run_at:    row.next_run_at ? String(row.next_run_at) : null,
    due_date:       row.due_date ? String(row.due_date) : null,
    parent_id:      null,  // parent_id is a UUID FK; not mapped to JAT id
    created_at:     String(row.created_at),
    updated_at:     String(row.updated_at),
    closed_at:      row.closed_at ? String(row.closed_at) : null,
    close_reason:   row.close_reason || '',
    internal:       false,
    project:        projectName,
    project_path:   projectPath,
    labels:         parseLabels(row),
    depends_on:     [],  // no dependency table in project_tasks schema
    blocked_by:     [],
    review_override: parseReviewOverride(row.notes),
  };
}

// ---------------------------------------------------------------------------
// ProjectTasksBackend
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ProjectTasksBackendOptions
 * @property {string} [connectionString]
 * @property {string} [projectName]   - Project name (e.g. "meadow")
 * @property {string} [projectPath]   - Absolute path to project root
 */

export class ProjectTasksBackend extends TaskBackend {
  /** @param {ProjectTasksBackendOptions} [options] */
  constructor(options = {}) {
    super();
    this.connectionString = options.connectionString || process.env.JAT_DATABASE_URL || '';
    this.projectName = options.projectName || '';
    this.projectPath = options.projectPath || '';
    this.pool = getPool(this.connectionString);
  }

  // ─── Project Discovery ──────────────────────────────────────────────────

  async getProjects() {
    return [{
      name: this.projectName,
      path: this.projectPath,
      dbPath: this.connectionString,
    }];
  }

  async initProject(_projectPath) {
    return { dbPath: this.connectionString };
  }

  // ─── ID Generation ──────────────────────────────────────────────────────

  generateId(prefix) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${prefix}-${id}`;
  }

  // ─── Reads ───────────────────────────────────────────────────────────────

  /**
   * @param {import('./tasks-backend.js').ListOptions} [options]
   * @returns {Promise<import('./tasks-backend.js').Task[]>}
   */
  async list(options = {}) {
    const { status, priority, projectName, closedAfter, closedBefore } = options;

    const clauses = [];
    const params = [];

    // Filter by project name: jat_id starts with "{name}-" OR jat_id is null
    // (null = created directly in prod via /admin/tasks, no JAT origin).
    // Each Supabase DB is scoped to one project, so null-jat_id rows are
    // always this project's tasks.
    const name = projectName || this.projectName;
    if (name) {
      params.push(name);
      clauses.push(`(pt.jat_id LIKE $${params.length} || '-%' OR pt.jat_id IS NULL)`);
    }

    if (status !== undefined) {
      params.push(status);
      clauses.push(`pt.status = $${params.length}`);
    }

    // Priority: map JAT integer → project_tasks TEXT
    if (priority !== undefined) {
      const textPriority = INT_TO_PRIORITY[priority];
      if (textPriority) {
        params.push(textPriority);
        clauses.push(`pt.priority = $${params.length}`);
      }
    }

    if (closedAfter !== undefined) {
      params.push(closedAfter);
      clauses.push(`pt.closed_at >= $${params.length}`);
    }
    if (closedBefore !== undefined) {
      params.push(closedBefore);
      clauses.push(`pt.closed_at < $${params.length}`);
    }

    const where = clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
    const sql = `
      SELECT pt.*,
             p.full_name  AS assignee_name,
             p.email      AS assignee_email,
             p.avatar_url AS assignee_avatar_url
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      ${where}
      ORDER BY
        CASE pt.priority
          WHEN 'critical' THEN 0
          WHEN 'high'     THEN 1
          WHEN 'medium'   THEN 2
          WHEN 'low'      THEN 3
          ELSE 4
        END ASC,
        pt.created_at DESC
    `;

    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(sql, params);
      const pName = name || this.projectName;
      return rows.map((row) => mapRow(row, pName, this.projectPath));
    } finally {
      client.release();
    }
  }

  /**
   * @param {string} taskId   - JAT text id (e.g. "meadow-abc12")
   * @returns {Promise<import('./tasks-backend.js').Task|null>}
   */
  async getById(taskId) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT pt.*,
                p.full_name  AS assignee_name,
                p.email      AS assignee_email,
                p.avatar_url AS assignee_avatar_url
         FROM project_tasks pt
         LEFT JOIN profiles p ON p.id = pt.assignee_id
         WHERE pt.jat_id = $1`,
        [taskId]
      );
      if (rows.length === 0) return null;

      const task = mapRow(rows[0], this.projectName, this.projectPath);

      // Load comments from project_tasks_comments (keyed by UUID, not jat_id)
      try {
        const { rows: cRows } = await client.query(
          `SELECT id, author, text, created_at
           FROM project_tasks_comments
           WHERE task_id = $1
           ORDER BY created_at ASC`,
          [rows[0].id]  // UUID from project_tasks.id
        );
        task.comments = cRows.map((c, i) => ({
          id: Number(c.id) || i,
          author: c.author || '',
          text: c.text || '',
          created_at: String(c.created_at),
        }));
      } catch {
        // Comments table may not exist or be inaccessible
        task.comments = [];
      }

      return task;
    } finally {
      client.release();
    }
  }

  /** @returns {Promise<import('./tasks-backend.js').Task[]>} */
  async getReady() {
    // project_tasks has no dependency table, so all 'open' tasks are ready
    return this.list({ status: 'open' });
  }

  /**
   * @param {import('./tasks-backend.js').ScheduledOptions} [options]
   * @returns {Promise<import('./tasks-backend.js').Task[]>}
   */
  async getScheduled(options = {}) {
    const clauses = [
      "((pt.schedule_cron IS NOT NULL AND pt.schedule_cron <> '') OR " +
      " (pt.next_run_at IS NOT NULL AND pt.next_run_at <> ''))",
    ];
    const params = [];

    const name = options.projectName || this.projectName;
    if (name) {
      params.push(name);
      clauses.push(`(pt.jat_id LIKE $${params.length} || '-%' OR pt.jat_id IS NULL)`);
    }

    const sql = `
      SELECT pt.*,
             p.full_name  AS assignee_name,
             p.email      AS assignee_email,
             p.avatar_url AS assignee_avatar_url
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY pt.next_run_at ASC NULLS LAST
    `;

    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(sql, params);
      const pName = name || this.projectName;
      return rows.map((row) => mapRow(row, pName, this.projectPath));
    } finally {
      client.release();
    }
  }

  /**
   * Search tasks in project_tasks using ILIKE (FTS is JST-side, not guaranteed).
   *
   * @param {string} query
   * @param {import('./tasks-backend.js').SearchOptions} [options]
   * @returns {Promise<import('./tasks-backend.js').Task[]>}
   */
  async search(query, options = {}) {
    const { updatedAfter, status, type, labels, limit = 50 } = options;

    const clauses = [];
    const params = [];

    if (this.projectName) {
      params.push(this.projectName);
      clauses.push(`(pt.jat_id LIKE $${params.length} || '-%' OR pt.jat_id IS NULL)`);
    }

    const likeTerm = `%${query}%`;
    params.push(likeTerm);
    params.push(likeTerm);
    clauses.push(`(pt.title ILIKE $${params.length - 1} OR pt.description ILIKE $${params.length})`);

    if (updatedAfter) {
      params.push(updatedAfter);
      clauses.push(`pt.updated_at >= $${params.length}`);
    }
    if (status) {
      params.push(status);
      clauses.push(`pt.status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      clauses.push(`pt.issue_type = $${params.length}`);
    }
    if (labels && labels.length > 0) {
      for (const lbl of labels) {
        params.push(`%${lbl.trim()}%`);
        clauses.push(`pt.labels_text ILIKE $${params.length}`);
      }
    }

    params.push(limit);
    const sql = `
      SELECT pt.*,
             p.full_name  AS assignee_name,
             p.email      AS assignee_email,
             p.avatar_url AS assignee_avatar_url
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY pt.updated_at DESC
      LIMIT $${params.length}
    `;

    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(sql, params);
      return rows.map((row) => mapRow(row, this.projectName, this.projectPath));
    } finally {
      client.release();
    }
  }

  // ─── Writes ──────────────────────────────────────────────────────────────

  /**
   * Generate a JAT-style task ID: "<project>-<5 random base36 chars>".
   * @param {string} prefix
   * @returns {string}
   */
  _generateId(prefix) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let rand = '';
    for (let i = 0; i < 5; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    return `${prefix}-${rand}`;
  }

  /**
   * Create a new task in project_tasks.
   * @param {import('./tasks-backend.js').CreateOptions} opts
   * @returns {Promise<import('./tasks-backend.js').Task>}
   */
  async create(opts) {
    const {
      title,
      description = '',
      type = 'task',
      priority = 2,
      labels = [],
      deps = [],
      assignee = null,
      notes = '',
      command = null,
      agent_program = null,
      model = null,
      schedule_cron = null,
      next_run_at = null,
      due_date = null,
      id: explicitId,
    } = opts;

    const prefix = this.projectName || 'task';
    const jatId = explicitId || this._generateId(prefix);
    const uuid = randomUUID();
    const now = new Date().toISOString();
    const labelsArr = labels.filter(Boolean).map(l => l.trim()).filter(Boolean);
    const labelsText = labelsArr.join(' ');

    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO project_tasks (
          id, jat_id, title, description, notes, status, priority, issue_type,
          assignee, command, agent_program, model, schedule_cron, next_run_at,
          due_date, labels, labels_text, source, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'open', $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, 'jat', $17, $18
        )`,
        [
          uuid, jatId, title, description, notes,
          priorityToText(priority), type,
          assignee, command, agent_program, model, schedule_cron, next_run_at,
          due_date, labelsArr, labelsText, now, now,
        ]
      );

      const { rows } = await client.query(
        'SELECT * FROM project_tasks WHERE id = $1', [uuid]
      );
      return mapRow(rows[0], this.projectName, this.projectPath);
    } finally {
      client.release();
    }
  }

  /**
   * Restore the assignee on close. Prefers `previous_assignee_id` (stashed by
   * the BEFORE UPDATE trigger on spawn). Falls back to the project's configured
   * `tasks.default_assignee` when nobody owned the task before the agent.
   *
   * @param {import('pg').PoolClient} client
   * @param {string} taskId
   * @param {Record<string, any>} row  - Latest row from the close/update RETURNING
   * @returns {Promise<Record<string, any>>} The restored row (or the original if no-op)
   */
  async _restoreAssigneeOnClose(client, taskId, row) {
    // 1. Prefer the stashed prior owner
    let restoreTo = row.previous_assignee_id || null;

    // 2. Fall back to the task's reporter (who created/reported it)
    if (!restoreTo && row.reporter_user_id) {
      restoreTo = row.reporter_user_id;
    }

    // 3. Fall back to tasks.default_assignee in project_config
    if (!restoreTo) {
      try {
        const { rows: cfg } = await client.query(
          `SELECT value FROM project_config WHERE key = 'tasks.default_assignee'`
        );
        if (cfg.length && cfg[0].value) {
          // value is JSONB (e.g. "uuid-string"); pg returns it parsed
          restoreTo = typeof cfg[0].value === 'string'
            ? cfg[0].value
            : String(cfg[0].value).replace(/^"|"$/g, '');
        }
      } catch (err) {
        // project_config table may not exist in older schemas — silently skip
      }
    }

    // 4. Nothing to restore to, or already correct
    if (!restoreTo || restoreTo === row.assignee_id) return row;

    const { rows: restored } = await client.query(
      `UPDATE project_tasks
       SET assignee_id = $1, updated_at = $2
       WHERE jat_id = $3
       RETURNING *`,
      [restoreTo, new Date().toISOString(), taskId]
    );
    return restored[0] || row;
  }

  /**
   * Update fields on an existing task (looked up by jat_id).
   * @param {string} taskId  - JAT task ID (e.g. "meadow-abc12")
   * @param {import('./tasks-backend.js').UpdateOptions} updates
   * @returns {Promise<import('./tasks-backend.js').Task>}
   */
  async update(taskId, updates) {
    const ALLOWED = new Set([
      'title', 'description', 'notes', 'status', 'priority', 'issue_type',
      'assignee', 'assignee_id', 'command', 'agent_program', 'model', 'schedule_cron',
      'next_run_at', 'due_date', 'labels', 'reserved_files', 'parent_id',
      'close_reason', 'closed_at', 'commit_hash',
    ]);

    const setClauses = [];
    const params = [];

    for (const [key, val] of Object.entries(updates)) {
      if (!ALLOWED.has(key)) continue;
      params.push(key === 'priority' ? priorityToText(val) : val);
      setClauses.push(`${key} = $${params.length}`);
    }

    if (setClauses.length === 0) {
      // Nothing to update — just fetch and return current state
      const client = await this.pool.connect();
      try {
        const { rows } = await client.query(
          'SELECT * FROM project_tasks WHERE jat_id = $1', [taskId]
        );
        if (!rows.length) throw new Error(`Task not found: ${taskId}`);
        return mapRow(rows[0], this.projectName, this.projectPath);
      } finally {
        client.release();
      }
    }

    params.push(new Date().toISOString());
    setClauses.push(`updated_at = $${params.length}`);
    params.push(taskId);

    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `UPDATE project_tasks SET ${setClauses.join(', ')}
         WHERE jat_id = $${params.length}
         RETURNING *`,
        params
      );
      if (!rows.length) throw new Error(`Task not found: ${taskId}`);

      // If this update transitioned status to a terminal state (closed), run the
      // same assignee-restore the close() path
      // uses. Covers IDE paths that close tasks via update({status}) rather than
      // close() — e.g. kanban drag, bulk actions.
      if (updates.status && TERMINAL_STATUSES.has(rows[0].status)) {
        const restored = await this._restoreAssigneeOnClose(client, taskId, rows[0]);
        return mapRow(restored, this.projectName, this.projectPath);
      }
      return mapRow(rows[0], this.projectName, this.projectPath);
    } finally {
      client.release();
    }
  }

  /**
   * Close a task.
   * @param {string} taskId
   * @param {string} [reason]
   * @returns {Promise<import('./tasks-backend.js').Task>}
   */
  async close(taskId, reason = '') {
    const now = new Date().toISOString();
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `UPDATE project_tasks
         SET status = 'closed', closed_at = $1, close_reason = $2, updated_at = $1
         WHERE jat_id = $3
         RETURNING *`,
        [now, reason, taskId]
      );
      if (!rows.length) throw new Error(`Task not found: ${taskId}`);

      const restored = await this._restoreAssigneeOnClose(client, taskId, rows[0]);
      return mapRow(restored, this.projectName, this.projectPath);
    } finally {
      client.release();
    }
  }

  /**
   * Delete a task by jat_id.
   * @param {string} taskId
   * @returns {Promise<boolean>}
   */
  async delete(taskId) {
    const client = await this.pool.connect();
    try {
      const { rowCount } = await client.query(
        'DELETE FROM project_tasks WHERE jat_id = $1', [taskId]
      );
      return rowCount > 0;
    } finally {
      client.release();
    }
  }

  async addDependency() { return false; }
  async removeDependency() { return false; }
  async getDependencyTree() { return []; }

  /**
   * Add a comment to a task.
   * @param {string} taskId
   * @param {{ author: string, text: string }} comment
   */
  async addComment(taskId, { author, text }) {
    const client = await this.pool.connect();
    try {
      // Look up the UUID for this jat_id
      const { rows: taskRows } = await client.query(
        'SELECT id FROM project_tasks WHERE jat_id = $1', [taskId]
      );
      if (!taskRows.length) throw new Error(`Task not found: ${taskId}`);
      const uuid = taskRows[0].id;
      const { rows } = await client.query(
        `INSERT INTO project_tasks_comments (task_id, author, text, created_at)
         VALUES ($1::uuid, $2, $3, $4)
         RETURNING *`,
        [uuid, author, text, new Date().toISOString()]
      );
      return { id: rows[0].id, author: rows[0].author, text: rows[0].text, created_at: rows[0].created_at };
    } finally {
      client.release();
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level pool cleanup
// ---------------------------------------------------------------------------

export async function closeAllProjectTasksPools() {
  const pools = Array.from(_pools.values());
  _pools.clear();
  await Promise.all(pools.map((p) => p.end().catch(() => {})));
}
