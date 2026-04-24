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
 *   dependencies   | dependencies table     | project_tasks_dependencies (UUID FKs)
 *
 * This backend is used by getBackendForProject() when a project entry in
 * ~/.config/jat/projects.json has backend="postgres" (indicating graduation
 * via jt graduate which writes to project_tasks since jat-dplkm.3).
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
 * Normalize an actor input to a JSONB-ready object.
 * Accepts:
 *   - string  → { email, source: defaultSource }
 *   - object  → passed through (with undefined/null keys stripped)
 *   - null/undefined → null
 *
 * @param {unknown} input
 * @param {string} [defaultSource]
 * @returns {Record<string, any>|null}
 */
function normalizeActor(input, defaultSource = 'ide') {
  if (input == null) return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return { email: trimmed, source: defaultSource };
  }
  if (typeof input !== 'object') return null;
  /** @type {Record<string, any>} */
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Extract a routing email from an actor JSONB (or legacy string).
 *
 * @param {unknown} actor
 * @returns {string|null}
 */
function actorEmail(actor) {
  if (!actor) return null;
  if (typeof actor === 'string') return actor.trim() || null;
  if (typeof actor === 'object' && actor !== null) {
    /** @type {any} */
    const a = actor;
    return a.email || a.agent || a.name || null;
  }
  return null;
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
 * Normalize a timestamp field from a pg row to an ISO-8601 string.
 *
 * node-postgres returns `timestamp with time zone` columns as JS Date
 * objects. Using `String(date)` would produce Date.toString() form
 * (e.g. "Thu Apr 16 2026 14:06:28 GMT-0400 (Eastern Daylight Time)")
 * which sorts alphabetically by weekday when string-compared.
 *
 * @param {unknown} v
 * @returns {string | null}
 */
function toIso(v) {
  if (v == null) return null;
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isFinite(t) ? v.toISOString() : null;
  }
  // Already a string — trust if it parses as a date; otherwise pass through.
  if (typeof v === 'string') {
    if (!v) return null;
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toISOString() : v;
  }
  return String(v);
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
    // Postgres UUID — exposed alongside the JAT id so clients that need to
    // reference `project_tasks` by its real FK (e.g. `milestone_tasks.task_id`
    // which is a UUID column) can do so without a second round trip.
    db_id:          row.id ? String(row.id) : null,
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
    next_run_at:    toIso(row.next_run_at),
    due_date:       toIso(row.due_date),
    parent_id:      row.parent_jat_id || null,  // resolved from parent row's jat_id via LEFT JOIN
    // node-postgres returns `timestamp with time zone` columns as JS Date
    // objects. `String(date)` would produce Date.toString() form (e.g.
    // "Thu Apr 16 2026 14:06:28 GMT-0400 (Eastern Daylight Time)") which
    // sorts alphabetically by weekday name when string-compared, breaking
    // every client-side sort. Always emit ISO-8601.
    created_at:     toIso(row.created_at) ?? '',
    updated_at:     toIso(row.updated_at) ?? '',
    closed_at:      toIso(row.closed_at),
    close_reason:   row.close_reason || '',
    internal:       false,
    project:        projectName,
    project_path:   projectPath,
    labels:         parseLabels(row),
    // Populated by _enrichWithDeps() after mapRow() returns. mapRow stays sync;
    // callers batch-load the dep graph and attach via the raw row's UUID.
    depends_on:     [],
    blocked_by:     [],
    review_override: parseReviewOverride(row.notes),
    // Task identity (jat-9e5tc refactor) — JSONB actor snapshots + UUID FKs.
    // creator is immutable, requester/approver are mutable. Shape:
    // { email, name, role, source, agent? }
    creator:        row.creator || null,
    creator_id:     row.creator_id || null,
    requester:      row.requester || null,
    requester_id:   row.requester_id || null,
    approver:       row.approver || null,
    approver_id:    row.approver_id || null,
  };
}

// ---------------------------------------------------------------------------
// Dependency enrichment (batch-loads deps for a list of raw rows)
//
// project_tasks_dependencies is keyed by UUID. mapRow returns tasks with
// `id: jat_id`. After list()/getById() map their results, pass the raw rows
// (which carry `id: UUID`) to attachDeps(client, rawRows, mappedTasks) so
// deps get resolved in a single round-trip per direction rather than N+1.
// ---------------------------------------------------------------------------

/**
 * Attach depends_on / blocked_by arrays to a parallel list of mapped tasks,
 * looking up the graph via each raw row's UUID. Two queries total (one per
 * direction), regardless of task count.
 *
 * @param {import('pg').PoolClient | import('pg').Pool} client
 * @param {Array<{id: string}>} rawRows - rows with UUID id
 * @param {Array<import('./tasks-backend.js').Task>} tasks - mapped tasks, same order
 * @returns {Promise<void>}
 */
// Cache per-pool so we only warn once per graduated project missing the table
const _depsTableMissing = new WeakSet();

async function attachDeps(client, rawRows, tasks) {
  if (!tasks.length) return;
  const uuids = rawRows.map((r) => r.id);

  // Graceful degradation: if the project was graduated before
  // add_project_tasks_dependencies migration landed (jat-ikvqh.19), the table
  // won't exist. Warn once and leave depends_on/blocked_by as the default [].
  if (_depsTableMissing.has(client)) {
    return;
  }

  let depsResult, blockedResult;
  try {
    [depsResult, blockedResult] = await Promise.all([
      client.query(
        `SELECT d.task_id, d.depends_on_id, d.type,
                dest.jat_id AS dest_jat_id, dest.title, dest.status, dest.priority
         FROM project_tasks_dependencies d
         JOIN project_tasks dest ON dest.id = d.depends_on_id
         WHERE d.task_id = ANY($1::uuid[])`,
        [uuids],
      ),
      client.query(
        `SELECT d.task_id, d.depends_on_id, d.type,
                src.jat_id AS src_jat_id, src.title, src.status, src.priority
         FROM project_tasks_dependencies d
         JOIN project_tasks src ON src.id = d.task_id
         WHERE d.depends_on_id = ANY($1::uuid[])`,
        [uuids],
      ),
    ]);
  } catch (err) {
    const msg = String(err.message || '');
    if (msg.includes('project_tasks_dependencies') && msg.includes('does not exist')) {
      console.warn(
        '[ProjectTasksBackend] project_tasks_dependencies table missing. ' +
        'Apply lib/migrations/add_project_tasks_dependencies.sql to unlock dependency support.'
      );
      _depsTableMissing.add(client);
      return;
    }
    throw err;
  }

  /** @type {Map<string, Array<any>>} */
  const depsByTask = new Map();
  for (const r of depsResult.rows) {
    const arr = depsByTask.get(r.task_id) || [];
    arr.push({
      id: r.dest_jat_id,
      type: r.type,
      title: r.title,
      status: r.status,
      priority: typeof r.priority === 'string' ? priorityToInt(r.priority) : r.priority,
    });
    depsByTask.set(r.task_id, arr);
  }

  /** @type {Map<string, Array<any>>} */
  const blockedByTask = new Map();
  for (const r of blockedResult.rows) {
    const arr = blockedByTask.get(r.depends_on_id) || [];
    arr.push({
      id: r.src_jat_id,
      type: r.type,
      title: r.title,
      status: r.status,
      priority: typeof r.priority === 'string' ? priorityToInt(r.priority) : r.priority,
    });
    blockedByTask.set(r.depends_on_id, arr);
  }

  for (let i = 0; i < tasks.length; i++) {
    const uuid = rawRows[i].id;
    tasks[i].depends_on = depsByTask.get(uuid) || [];
    tasks[i].blocked_by = blockedByTask.get(uuid) || [];
  }
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
    // Resolved lazily: true if profiles.email exists, false if not (schema varies by project)
    this._profilesHasEmail = null;
    // Resolved lazily: true if project_tasks has the jat-9e5tc identity
    // columns (creator/requester/approver + _id UUIDs). Older databases
    // still use legacy `requester TEXT` and have none of the new columns.
    this._hasIdentityColumns = null;
  }

  // ─── Schema Detection ───────────────────────────────────────────────────

  async _getProfileEmailSelect() {
    if (this._profilesHasEmail === null) {
      const client = await this.pool.connect();
      try {
        const { rows } = await client.query(
          "SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email' AND table_schema='public'"
        );
        this._profilesHasEmail = rows.length > 0;
      } finally {
        client.release();
      }
    }
    return this._profilesHasEmail ? 'p.email AS assignee_email,' : 'NULL::text AS assignee_email,';
  }

  /**
   * Detect whether this project has run the jat-9e5tc identity refactor
   * migration (adds creator/requester/approver JSONB + _id UUID columns).
   * @returns {Promise<boolean>}
   */
  async _detectIdentityColumns() {
    if (this._hasIdentityColumns === null) {
      const client = await this.pool.connect();
      try {
        const { rows } = await client.query(
          `SELECT 1 FROM information_schema.columns
           WHERE table_name='project_tasks' AND table_schema='public'
             AND column_name='approver_id'`
        );
        this._hasIdentityColumns = rows.length > 0;
      } finally {
        client.release();
      }
    }
    return this._hasIdentityColumns;
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
    const { status, priority, projectName, closedAfter, closedBefore, updatedAfter, updatedBefore, statuses } = options;

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

    if (statuses !== undefined && statuses.length > 0) {
      params.push(statuses);
      clauses.push(`pt.status = ANY($${params.length})`);
    } else if (status !== undefined) {
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

    if (updatedAfter !== undefined) {
      params.push(updatedAfter);
      clauses.push(`pt.updated_at >= $${params.length}`);
    }
    if (updatedBefore !== undefined) {
      params.push(updatedBefore);
      clauses.push(`pt.updated_at < $${params.length}`);
    }

    const where = clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
    const emailSelect = await this._getProfileEmailSelect();
    const sql = `
      SELECT pt.*,
             p.full_name   AS assignee_name,
             ${emailSelect}
             p.avatar_url  AS assignee_avatar_url,
             par.jat_id    AS parent_jat_id
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      LEFT JOIN project_tasks par ON par.id = pt.parent_id
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
      const tasks = rows.map((row) => mapRow(row, pName, this.projectPath));
      await attachDeps(client, rows, tasks);
      return tasks;
    } finally {
      client.release();
    }
  }

  /**
   * @param {string} taskId   - JAT text id (e.g. "meadow-abc12")
   * @returns {Promise<import('./tasks-backend.js').Task|null>}
   */
  async getById(taskId) {
    const emailSelect = await this._getProfileEmailSelect();
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT pt.*,
                p.full_name   AS assignee_name,
                ${emailSelect}
                p.avatar_url  AS assignee_avatar_url,
                par.jat_id    AS parent_jat_id
         FROM project_tasks pt
         LEFT JOIN profiles p ON p.id = pt.assignee_id
         LEFT JOIN project_tasks par ON par.id = pt.parent_id
         WHERE pt.jat_id = $1`,
        [taskId]
      );
      if (rows.length === 0) return null;

      const task = mapRow(rows[0], this.projectName, this.projectPath);
      await attachDeps(client, rows, [task]);

      // Load comments from project_tasks_comments (keyed by UUID, not jat_id).
      // COALESCE(external, true) so rows created before the migration surface
      // as external — matches the "existing rows unchanged" acceptance.
      try {
        const { rows: cRows } = await client.query(
          `SELECT id, author, author_type, comment_type, session_id, metadata, text,
                  COALESCE(external, true) AS external, created_at
           FROM project_tasks_comments
           WHERE task_id = $1
           ORDER BY created_at ASC`,
          [rows[0].id]  // UUID from project_tasks.id
        );
        task.comments = cRows.map((c) => ({
          id: String(c.id),
          author: c.author || '',
          author_type: c.author_type ?? null,
          comment_type: c.comment_type ?? null,
          session_id: c.session_id ?? null,
          metadata: c.metadata ?? null,
          external: c.external !== false,
          text: c.text || '',
          created_at: toIso(c.created_at) ?? '',
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
    // Ready = open AND no unmet blockers (every depends_on row points to a
    // closed task). Matches the legacy SQLite behaviour from tasks-postgres.js.
    const clauses = ["pt.status = 'open'"];
    const params = [];

    if (this.projectName) {
      params.push(this.projectName);
      clauses.push(`(pt.jat_id LIKE $${params.length} || '-%' OR pt.jat_id IS NULL)`);
    }

    // Filter out anything with an unmet blocker
    clauses.push(`NOT EXISTS (
      SELECT 1 FROM project_tasks_dependencies d
      LEFT JOIN project_tasks blocker ON blocker.id = d.depends_on_id
      WHERE d.task_id = pt.id
      AND (blocker.status IS NULL OR blocker.status <> 'closed')
    )`);

    const emailSelect = await this._getProfileEmailSelect();
    const sql = `
      SELECT pt.*,
             p.full_name   AS assignee_name,
             ${emailSelect}
             p.avatar_url  AS assignee_avatar_url,
             par.jat_id    AS parent_jat_id
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      LEFT JOIN project_tasks par ON par.id = pt.parent_id
      WHERE ${clauses.join(' AND ')}
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
      let rows;
      try {
        ({ rows } = await client.query(sql, params));
      } catch (err) {
        const msg = String(err.message || '');
        if (msg.includes('project_tasks_dependencies') && msg.includes('does not exist')) {
          // Graceful fallback: no deps table yet → every open task is ready.
          console.warn(
            '[ProjectTasksBackend] project_tasks_dependencies table missing in getReady(). ' +
            'Falling back to status-only filter. Apply add_project_tasks_dependencies.sql.'
          );
          return this.list({ status: 'open' });
        }
        throw err;
      }
      const tasks = rows.map((row) => mapRow(row, this.projectName, this.projectPath));
      await attachDeps(client, rows, tasks);
      return tasks;
    } finally {
      client.release();
    }
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

    const emailSelect = await this._getProfileEmailSelect();
    const sql = `
      SELECT pt.*,
             p.full_name   AS assignee_name,
             ${emailSelect}
             p.avatar_url  AS assignee_avatar_url,
             par.jat_id    AS parent_jat_id
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      LEFT JOIN project_tasks par ON par.id = pt.parent_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY pt.next_run_at ASC NULLS LAST
    `;

    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(sql, params);
      const pName = name || this.projectName;
      const tasks = rows.map((row) => mapRow(row, pName, this.projectPath));
      await attachDeps(client, rows, tasks);
      return tasks;
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
    params.push(likeTerm);
    clauses.push(
      `(pt.title ILIKE $${params.length - 2} OR pt.description ILIKE $${params.length - 1} OR pt.jat_id ILIKE $${params.length})`
    );

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
    const emailSelect = await this._getProfileEmailSelect();
    const sql = `
      SELECT pt.*,
             p.full_name   AS assignee_name,
             ${emailSelect}
             p.avatar_url  AS assignee_avatar_url,
             par.jat_id    AS parent_jat_id
      FROM project_tasks pt
      LEFT JOIN profiles p ON p.id = pt.assignee_id
      LEFT JOIN project_tasks par ON par.id = pt.parent_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY pt.updated_at DESC
      LIMIT $${params.length}
    `;

    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(sql, params);
      const tasks = rows.map((row) => mapRow(row, this.projectName, this.projectPath));
      await attachDeps(client, rows, tasks);
      return tasks;
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
      parent_id: parentJatId = null,
      creator = null,
      creator_id = null,
      requester = null,
      requester_id = null,
      approver = null,
      approver_id = null,
    } = opts;

    const prefix = this.projectName || 'task';
    const now = new Date().toISOString();
    const labelsArr = labels.filter(Boolean).map(l => l.trim()).filter(Boolean);
    const labelsText = labelsArr.join(' ');

    // Normalize actors (accept string for back-compat, or object).
    // Defaulting rules from PRD: requester defaults to creator, approver defaults to requester.
    const creatorJson   = normalizeActor(creator, 'jat');
    const requesterJson = normalizeActor(requester, 'jat') || creatorJson;
    const approverJson  = normalizeActor(approver,  'jat') || requesterJson;
    const creatorUuid   = creator_id   || null;
    const requesterUuid = requester_id || creatorUuid;
    const approverUuid  = approver_id  || requesterUuid;

    // Resolve parent task if --parent was supplied.
    // parentJatId is the jat_id string (e.g. "meadow-9hbug"); resolve to UUID
    // and generate a hierarchical child jat_id like "meadow-9hbug.3".
    let parentUuid = null;
    let jatId = explicitId || this._generateId(prefix);

    if (parentJatId) {
      const lookupClient = await this.pool.connect();
      try {
        const { rows: parentRows } = await lookupClient.query(
          'SELECT id, jat_id FROM project_tasks WHERE jat_id = $1',
          [parentJatId],
        );
        if (parentRows.length === 0) {
          throw new Error(`Parent task not found: ${parentJatId}`);
        }
        parentUuid = parentRows[0].id;
        const parentId = parentRows[0].jat_id;

        // Find the next child index: max(N) from jat_ids like "parent.N"
        const { rows: childRows } = await lookupClient.query(
          `SELECT jat_id FROM project_tasks
           WHERE jat_id LIKE $1 AND jat_id NOT LIKE $2`,
          [`${parentId}.%`, `${parentId}.%.%`],
        );
        let maxChild = 0;
        for (const row of childRows) {
          const suffix = row.jat_id.slice(parentId.length + 1);
          const n = parseInt(suffix, 10);
          if (!isNaN(n) && n > maxChild) maxChild = n;
        }
        jatId = `${parentId}.${maxChild + 1}`;
      } finally {
        lookupClient.release();
      }
    }

    const uuid = randomUUID();
    const hasIdentity = await this._detectIdentityColumns();
    const client = await this.pool.connect();
    try {
      if (hasIdentity) {
        await client.query(`
          INSERT INTO project_tasks (
            id, jat_id, title, description, notes, status, priority, issue_type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labels, labels_text, source, created_at, updated_at,
            creator_id, creator, requester_id, requester, approver_id, approver,
            parent_id
          ) VALUES (
            $1, $2, $3, $4, $5, 'open', $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, 'jat', $17, $18,
            $19, $20::jsonb, $21, $22::jsonb, $23, $24::jsonb,
            $25
          )`,
          [
            uuid, jatId, title, description, notes,
            priorityToText(priority), type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labelsArr, labelsText, now, now,
            creatorUuid,   creatorJson   ? JSON.stringify(creatorJson)   : null,
            requesterUuid, requesterJson ? JSON.stringify(requesterJson) : null,
            approverUuid,  approverJson  ? JSON.stringify(approverJson)  : null,
            parentUuid,
          ]
        );
      } else {
        // Pre-migration schema: legacy `requester TEXT` column only.
        // Preserve back-compat by writing the approver/requester email there.
        const legacyRequester = actorEmail(approverJson) || actorEmail(requesterJson) || null;
        await client.query(`
          INSERT INTO project_tasks (
            id, jat_id, title, description, notes, status, priority, issue_type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labels, labels_text, source, created_at, updated_at,
            requester, parent_id
          ) VALUES (
            $1, $2, $3, $4, $5, 'open', $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, 'jat', $17, $18,
            $19, $20
          )`,
          [
            uuid, jatId, title, description, notes,
            priorityToText(priority), type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labelsArr, labelsText, now, now,
            legacyRequester, parentUuid,
          ]
        );
      }

      // Auto-wire epic→child dependency when a parent is set:
      // parent depends on child (child must complete before parent can close).
      if (parentUuid && parentJatId) {
        await client.query(
          `INSERT INTO project_tasks_dependencies (task_id, depends_on_id, type)
           VALUES ($1::uuid, $2::uuid, 'blocks')
           ON CONFLICT (task_id, depends_on_id) DO NOTHING`,
          [parentUuid, uuid],
        );
      }

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

    // 2. Fall back to the task's creator (immutable stakeholder snapshot).
    // Post jat-9e5tc refactor: reporter_user_id → creator_id.
    if (!restoreTo && row.creator_id) {
      restoreTo = row.creator_id;
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
    const hasIdentity = await this._detectIdentityColumns();
    const ALLOWED_BASE = [
      'title', 'description', 'notes', 'status', 'priority', 'issue_type',
      'assignee', 'assignee_id', 'command', 'agent_program', 'model', 'schedule_cron',
      'next_run_at', 'due_date', 'labels', 'reserved_files', 'parent_id',
      'close_reason', 'closed_at', 'commit_hash',
    ];
    // Task identity (jat-9e5tc): creator is immutable once set; requester
    // and approver are mutable ("on behalf of" edits, escalate to owner).
    const ALLOWED = new Set(
      hasIdentity
        ? [...ALLOWED_BASE, 'requester', 'requester_id', 'approver', 'approver_id']
        : [...ALLOWED_BASE, 'requester']  // legacy: TEXT only
    );
    // JSONB columns — value is a JS object (normalized) or null, cast to ::jsonb.
    const JSONB_FIELDS = hasIdentity ? new Set(['requester', 'approver']) : new Set();

    const setClauses = [];
    const params = [];

    for (const [key, val] of Object.entries(updates)) {
      if (!ALLOWED.has(key)) continue;
      if (JSONB_FIELDS.has(key)) {
        const actor = normalizeActor(val, 'ide');
        params.push(actor ? JSON.stringify(actor) : null);
        setClauses.push(`${key} = $${params.length}::jsonb`);
      } else if (!hasIdentity && key === 'requester') {
        // Legacy schema: coerce objects/arrays down to an email string.
        params.push(typeof val === 'string' ? val : (actorEmail(val) || null));
        setClauses.push(`${key} = $${params.length}`);
      } else {
        params.push(key === 'priority' ? priorityToText(val) : val);
        setClauses.push(`${key} = $${params.length}`);
      }
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
    const hasIdentity = await this._detectIdentityColumns();
    const client = await this.pool.connect();
    try {
      // Resolve routing target. Post jat-9e5tc migration: approver → requester
      // → creator. Pre-migration: legacy `requester TEXT` only.
      const selectSql = hasIdentity
        ? `SELECT approver, approver_id, requester, requester_id, creator, creator_id,
                  previous_assignee, previous_assignee_id
             FROM project_tasks WHERE jat_id = $1`
        : `SELECT requester, previous_assignee, previous_assignee_id
             FROM project_tasks WHERE jat_id = $1`;
      const { rows: taskRows } = await client.query(selectSql, [taskId]);
      const tr = taskRows[0] || {};

      // Pick the first non-null actor in priority order (post-migration only).
      const routingActor = hasIdentity
        ? (tr.approver || tr.requester || tr.creator || null)
        : tr.requester || null;  // legacy: string TEXT
      const routingActorId = hasIdentity
        ? (tr.approver_id || tr.requester_id || tr.creator_id || null)
        : null;
      const routingEmail = actorEmail(routingActor);

      // Self-accept: previous assignee (by id or email) matches the routing target.
      const prevAssignee    = tr.previous_assignee    || null;
      const prevAssigneeId  = tr.previous_assignee_id || null;
      const selfAccepted = Boolean(
        (routingActorId && prevAssigneeId && routingActorId === prevAssigneeId) ||
        (routingEmail   && prevAssignee   && routingEmail   === prevAssignee)
      );

      let rows;
      if (routingEmail || routingActorId) {
        const newStatus = selfAccepted ? 'accepted' : 'submitted';
        // When we have a UUID, set both assignee_id and assignee (email) so the
        // UI and CLI can both resolve the target. Otherwise only set assignee.
        const result = await client.query(
          `UPDATE project_tasks
             SET status        = $1,
                 assignee      = $2,
                 assignee_id   = COALESCE($3::uuid, assignee_id),
                 close_reason  = $4,
                 closed_at     = NULL,
                 updated_at    = $5
           WHERE jat_id = $6
           RETURNING *`,
          [newStatus, routingEmail, routingActorId, reason, now, taskId]
        );
        rows = result.rows;
      } else {
        const result = await client.query(
          `UPDATE project_tasks
             SET status = 'closed', closed_at = $1, close_reason = $2, updated_at = $1
           WHERE jat_id = $3
           RETURNING *`,
          [now, reason, taskId]
        );
        rows = result.rows;
      }

      if (!rows.length) throw new Error(`Task not found: ${taskId}`);

      // If we routed to a stakeholder, don't run the assignee-restore logic
      // (that's for terminal closes where nobody needs to accept the work).
      const hasRoute = Boolean(routingEmail || routingActorId);
      const restored = hasRoute
        ? rows[0]
        : await this._restoreAssigneeOnClose(client, taskId, rows[0]);
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

  /**
   * Add a blocks-dependency: `taskId` is blocked by (depends on) `dependsOnId`.
   * Both ids are JAT text ids (e.g. "jat-68j78.2"); they're resolved to UUIDs.
   *
   * @param {string} taskId
   * @param {string} dependsOnId
   * @param {string} [_projectPath]
   * @returns {Promise<boolean>}  true if a new dep row was created, false if already present
   */
  async addDependency(taskId, dependsOnId, _projectPath) {
    if (!taskId || !dependsOnId) return false;
    if (taskId === dependsOnId) {
      throw new Error(`Task ${taskId} cannot depend on itself`);
    }

    const client = await this.pool.connect();
    try {
      // Resolve both jat_ids to UUIDs in one query
      const { rows } = await client.query(
        `SELECT id, jat_id FROM project_tasks WHERE jat_id = ANY($1::text[])`,
        [[taskId, dependsOnId]],
      );
      const uuidByJatId = new Map(rows.map((r) => [r.jat_id, r.id]));
      const taskUuid = uuidByJatId.get(taskId);
      const depUuid = uuidByJatId.get(dependsOnId);
      if (!taskUuid) throw new Error(`Unknown task: ${taskId}`);
      if (!depUuid) throw new Error(`Unknown task: ${dependsOnId}`);

      const result = await client.query(
        `INSERT INTO project_tasks_dependencies (task_id, depends_on_id, type)
         VALUES ($1::uuid, $2::uuid, 'blocks')
         ON CONFLICT (task_id, depends_on_id) DO NOTHING`,
        [taskUuid, depUuid],
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Remove a blocks-dependency. Symmetric to addDependency().
   *
   * @param {string} taskId
   * @param {string} dependsOnId
   * @returns {Promise<boolean>} true if a row was deleted
   */
  async removeDependency(taskId, dependsOnId) {
    if (!taskId || !dependsOnId) return false;
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT id, jat_id FROM project_tasks WHERE jat_id = ANY($1::text[])`,
        [[taskId, dependsOnId]],
      );
      const uuidByJatId = new Map(rows.map((r) => [r.jat_id, r.id]));
      const taskUuid = uuidByJatId.get(taskId);
      const depUuid = uuidByJatId.get(dependsOnId);
      if (!taskUuid || !depUuid) return false;

      const result = await client.query(
        `DELETE FROM project_tasks_dependencies
         WHERE task_id = $1::uuid AND depends_on_id = $2::uuid`,
        [taskUuid, depUuid],
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Transitive dependency tree rooted at `taskId`. Returns every task that is
   * (directly or transitively) blocking the root, using a WITH RECURSIVE CTE.
   *
   * @param {string} taskId
   * @returns {Promise<Array<{id: string, title: string, status: string, depth: number}>>}
   */
  async getDependencyTree(taskId) {
    if (!taskId) return [];
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `WITH RECURSIVE tree AS (
           SELECT d.depends_on_id AS node, 1 AS depth
           FROM project_tasks pt
           JOIN project_tasks_dependencies d ON d.task_id = pt.id
           WHERE pt.jat_id = $1

           UNION ALL

           SELECT d.depends_on_id, tree.depth + 1
           FROM project_tasks_dependencies d
           JOIN tree ON d.task_id = tree.node
           WHERE tree.depth < 32
         )
         SELECT DISTINCT pt.jat_id AS id, pt.title, pt.status, tree.depth
         FROM tree
         JOIN project_tasks pt ON pt.id = tree.node
         ORDER BY tree.depth ASC, pt.jat_id ASC`,
        [taskId],
      );
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        depth: r.depth,
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Add a comment to a task.
   *
   * Identity resolution: when an `author_email` is supplied, look it up
   * against this project's `profiles` table. If a matching profile exists,
   * record the profile UUID in `metadata.author_id` (and use the profile's
   * `full_name` as the stored author when the caller didn't pass a better
   * one). This gives cross-app identity linkage without needing a per-
   * project `author_id` column: the JAT IDE operator's git email is the
   * stable anchor across Supabase projects, each of which mints its own UUID.
   *
   * @param {string} taskId
   * @param {{ author: string, author_email?: string|null, text: string, author_type?: string, comment_type?: string, session_id?: string|null, metadata?: object|null, external?: boolean }} comment
   */
  async addComment(taskId, { author, author_email = null, text, author_type = null, comment_type = null, session_id = null, metadata = null, external = true }) {
    const client = await this.pool.connect();
    try {
      const { rows: taskRows } = await client.query(
        'SELECT id FROM project_tasks WHERE jat_id = $1', [taskId]
      );
      if (!taskRows.length) throw new Error(`Task not found: ${taskId}`);
      const uuid = taskRows[0].id;

      // Resolve email → UUID. Primary source is `auth.users` (Supabase always
      // has it, and it's the only column every JST-derived project is
      // guaranteed to share). `profiles` schemas vary: meadow has `email`,
      // flush/headcount/steelbridge do not — so `profiles.email` can't be
      // relied on. We also pull `profiles.full_name` when the row exists,
      // so the comment shows each project's canonical name.
      let resolvedId = null;
      let resolvedName = null;
      if (author_email && typeof author_email === 'string') {
        const email = author_email.trim();
        try {
          const { rows: a } = await client.query(
            `SELECT au.id, p.full_name
               FROM auth.users au
          LEFT JOIN public.profiles p ON p.id = au.id
              WHERE lower(au.email) = lower($1)
              LIMIT 1`,
            [email]
          );
          if (a.length) {
            resolvedId = a[0].id ? String(a[0].id) : null;
            resolvedName = a[0].full_name || null;
          }
        } catch {
          // auth.users inaccessible (shouldn't happen with service role)
          // — try profiles as a fallback for projects with a custom email col.
          try {
            const { rows: p } = await client.query(
              'SELECT id, full_name FROM profiles WHERE lower(email) = lower($1) LIMIT 1',
              [email]
            );
            if (p.length) {
              resolvedId = p[0].id ? String(p[0].id) : null;
              resolvedName = p[0].full_name || null;
            }
          } catch {
            // leave unresolved
          }
        }
      }

      // Merge identity breadcrumbs into metadata so future features (avatars,
      // cross-app "show me tasks I'm @mentioned on") can use them without a
      // schema migration.
      const metaIn = metadata && typeof metadata === 'object' ? metadata : {};
      const metaOut = { ...metaIn };
      if (author_email) metaOut.author_email = author_email.trim();
      if (resolvedId) metaOut.author_id = resolvedId;
      const metadataJson = Object.keys(metaOut).length ? JSON.stringify(metaOut) : null;

      // Prefer the resolved full_name over the caller-supplied author so
      // comments show the canonical name in this project (e.g. Supabase
      // auth.users.full_name) rather than whatever string the client sent.
      const finalAuthor = resolvedName || author;

      const { rows } = await client.query(
        `INSERT INTO project_tasks_comments (task_id, author, text, author_type, comment_type, session_id, metadata, external, created_at)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
         RETURNING id, author, text, author_type, comment_type, session_id, metadata,
                   COALESCE(external, true) AS external, created_at`,
        [uuid, finalAuthor, text, author_type, comment_type, session_id, metadataJson, external !== false, new Date().toISOString()]
      );
      const r = rows[0];
      return {
        id: String(r.id),
        author: r.author,
        text: r.text,
        author_type: r.author_type ?? null,
        comment_type: r.comment_type ?? null,
        session_id: r.session_id ?? null,
        metadata: r.metadata ?? null,
        external: r.external !== false,
        created_at: toIso(r.created_at) ?? '',
      };
    } finally {
      client.release();
    }
  }

  /**
   * Find the most recent open agent question (has session_id, no later answer).
   * Used by the resume trigger to get the session_id to pass to `claude -r`.
   * @param {string} taskId
   * @returns {Promise<{session_id: string, author: string, text: string}|null>}
   */
  async findOpenQuestion(taskId) {
    const client = await this.pool.connect();
    try {
      const { rows: taskRows } = await client.query(
        'SELECT id FROM project_tasks WHERE jat_id = $1', [taskId]
      );
      if (!taskRows.length) return null;
      const uuid = taskRows[0].id;
      // Get all comments ordered newest-first; walk until we find a question or an answer
      const { rows } = await client.query(
        `SELECT comment_type, session_id, author, text
         FROM project_tasks_comments
         WHERE task_id = $1::uuid
         ORDER BY created_at DESC`,
        [uuid]
      );
      for (const row of rows) {
        if (row.comment_type === 'answer') return null; // already answered
        if (row.comment_type === 'question' && row.session_id) {
          return { session_id: row.session_id, author: row.author || '', text: row.text || '' };
        }
      }
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Look up a single comment by id. Returns null if not found in this project.
   * @param {string} commentId
   * @returns {Promise<object|null>}
   */
  async getComment(commentId) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT id, author, text, author_type, comment_type, session_id, metadata,
                COALESCE(external, true) AS external, created_at, task_id
         FROM project_tasks_comments
         WHERE id = $1::uuid
         LIMIT 1`,
        [commentId]
      );
      if (!rows.length) return null;
      const r = rows[0];
      return {
        id: String(r.id),
        author: r.author || '',
        text: r.text || '',
        author_type: r.author_type ?? null,
        comment_type: r.comment_type ?? null,
        session_id: r.session_id ?? null,
        metadata: r.metadata ?? null,
        external: r.external !== false,
        task_id: r.task_id ? String(r.task_id) : null,
        created_at: toIso(r.created_at) ?? '',
      };
    } finally {
      client.release();
    }
  }

  /**
   * Flip a comment's external flag. Callers must enforce the one-way rule
   * (internal → external is forbidden) before calling; this writer is
   * intentionally dumb.
   * @param {string} commentId
   * @param {boolean} external
   * @returns {Promise<object|null>}
   */
  async setCommentExternal(commentId, external) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `UPDATE project_tasks_comments
            SET external = $2
          WHERE id = $1::uuid
      RETURNING id, author, text, author_type, comment_type, session_id, metadata,
                COALESCE(external, true) AS external, created_at`,
        [commentId, external !== false]
      );
      if (!rows.length) return null;
      const r = rows[0];
      return {
        id: String(r.id),
        author: r.author || '',
        text: r.text || '',
        author_type: r.author_type ?? null,
        comment_type: r.comment_type ?? null,
        session_id: r.session_id ?? null,
        metadata: r.metadata ?? null,
        external: r.external !== false,
        created_at: toIso(r.created_at) ?? '',
      };
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
