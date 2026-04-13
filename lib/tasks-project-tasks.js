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
 *   status         | open/in_progress/…     | dev/in_progress/completed/…
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
import { TaskBackend } from './tasks-backend.js';
import { priorityToInt, statusToJat } from './project-tasks-mapping.js';

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
// Status mapping: JAT status → array of project_tasks status values
// ---------------------------------------------------------------------------

/** @type {Record<string, string[]>} */
const JAT_TO_PT_STATUSES = {
  open:        ['dev', 'submitted', 'open'],
  in_progress: ['in_progress'],
  blocked:     ['blocked'],
  closed:      ['completed', 'accepted', 'rejected', 'wontfix', 'closed'],
  dev:         ['dev'],
  submitted:   ['submitted'],
};

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
    status:         statusToJat(row.status),
    priority:       priorityToInt(row.priority),
    issue_type:     row.issue_type || 'task',
    assignee:       row.assignee || null,
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

    // Always filter to rows with a jat_id (graduated tasks only)
    const clauses = ['pt.jat_id IS NOT NULL'];
    const params = [];

    // Filter by project name: jat_id starts with "{name}-"
    const name = projectName || this.projectName;
    if (name) {
      params.push(name);
      clauses.push(`pt.jat_id LIKE $${params.length} || '-%'`);
    }

    // Status: map JAT status → project_tasks status values
    if (status !== undefined) {
      const ptStatuses = JAT_TO_PT_STATUSES[status];
      if (ptStatuses && ptStatuses.length > 0) {
        params.push(ptStatuses);
        clauses.push(`pt.status = ANY($${params.length}::text[])`);
      }
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

    const where = 'WHERE ' + clauses.join(' AND ');
    const sql = `
      SELECT pt.*
      FROM project_tasks pt
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
        'SELECT pt.* FROM project_tasks pt WHERE pt.jat_id = $1',
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
      'pt.jat_id IS NOT NULL',
      "((pt.schedule_cron IS NOT NULL AND pt.schedule_cron <> '') OR " +
      " (pt.next_run_at IS NOT NULL AND pt.next_run_at <> ''))",
    ];
    const params = [];

    const name = options.projectName || this.projectName;
    if (name) {
      params.push(name);
      clauses.push(`pt.jat_id LIKE $${params.length} || '-%'`);
    }

    const sql = `
      SELECT pt.* FROM project_tasks pt
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

    const clauses = ['pt.jat_id IS NOT NULL'];
    const params = [];

    if (this.projectName) {
      params.push(this.projectName);
      clauses.push(`pt.jat_id LIKE $${params.length} || '-%'`);
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
      const ptStatuses = JAT_TO_PT_STATUSES[status] || [status];
      params.push(ptStatuses);
      clauses.push(`pt.status = ANY($${params.length}::text[])`);
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
      SELECT pt.*
      FROM project_tasks pt
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

  // ─── Writes (not implemented — write path uses jt CLI / SQLite backup) ───

  async create() {
    throw new Error('ProjectTasksBackend: create() not supported; use jt CLI');
  }
  async update() {
    throw new Error('ProjectTasksBackend: update() not supported; use jt CLI');
  }
  async close() {
    throw new Error('ProjectTasksBackend: close() not supported; use jt CLI');
  }
  async delete() {
    throw new Error('ProjectTasksBackend: delete() not supported; use jt CLI');
  }
  async addDependency() { return false; }
  async removeDependency() { return false; }
  async getDependencyTree() { return []; }
  async addComment() {
    throw new Error('ProjectTasksBackend: addComment() not supported');
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
