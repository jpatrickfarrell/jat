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
    depends_on:     [],  // no dependency table in project_tasks schema
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

      // Load comments from project_tasks_comments (keyed by UUID, not jat_id)
      try {
        const { rows: cRows } = await client.query(
          `SELECT id, author, author_type, comment_type, session_id, metadata, text, created_at
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
      creator = null,
      creator_id = null,
      requester = null,
      requester_id = null,
      approver = null,
      approver_id = null,
    } = opts;

    const prefix = this.projectName || 'task';
    const jatId = explicitId || this._generateId(prefix);
    const uuid = randomUUID();
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

    const hasIdentity = await this._detectIdentityColumns();
    const client = await this.pool.connect();
    try {
      if (hasIdentity) {
        await client.query(`
          INSERT INTO project_tasks (
            id, jat_id, title, description, notes, status, priority, issue_type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labels, labels_text, source, created_at, updated_at,
            creator_id, creator, requester_id, requester, approver_id, approver
          ) VALUES (
            $1, $2, $3, $4, $5, 'open', $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, 'jat', $17, $18,
            $19, $20::jsonb, $21, $22::jsonb, $23, $24::jsonb
          )`,
          [
            uuid, jatId, title, description, notes,
            priorityToText(priority), type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labelsArr, labelsText, now, now,
            creatorUuid,   creatorJson   ? JSON.stringify(creatorJson)   : null,
            requesterUuid, requesterJson ? JSON.stringify(requesterJson) : null,
            approverUuid,  approverJson  ? JSON.stringify(approverJson)  : null,
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
            requester
          ) VALUES (
            $1, $2, $3, $4, $5, 'open', $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, 'jat', $17, $18,
            $19
          )`,
          [
            uuid, jatId, title, description, notes,
            priorityToText(priority), type,
            assignee, command, agent_program, model, schedule_cron, next_run_at,
            due_date, labelsArr, labelsText, now, now,
            legacyRequester,
          ]
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

  async addDependency() { return false; }
  async removeDependency() { return false; }
  async getDependencyTree() { return []; }

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
   * @param {{ author: string, author_email?: string|null, text: string, author_type?: string, comment_type?: string, session_id?: string|null, metadata?: object|null }} comment
   */
  async addComment(taskId, { author, author_email = null, text, author_type = null, comment_type = null, session_id = null, metadata = null }) {
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
        `INSERT INTO project_tasks_comments (task_id, author, text, author_type, comment_type, session_id, metadata, created_at)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::jsonb, $8)
         RETURNING id, author, text, author_type, comment_type, session_id, metadata, created_at`,
        [uuid, finalAuthor, text, author_type, comment_type, session_id, metadataJson, new Date().toISOString()]
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
}

// ---------------------------------------------------------------------------
// Module-level pool cleanup
// ---------------------------------------------------------------------------

export async function closeAllProjectTasksPools() {
  const pools = Array.from(_pools.values());
  _pools.clear();
  await Promise.all(pools.map((p) => p.end().catch(() => {})));
}
