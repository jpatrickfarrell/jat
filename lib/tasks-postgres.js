/**
 * JAT Postgres Task Backend
 *
 * Concrete implementation of {@link TaskBackend} backed by a shared Postgres
 * database (via node-postgres / `pg`).  Used by team-graduated projects where
 * multiple machines share one task store.
 *
 * ─── ASYNC CONTRACT NOTE ─────────────────────────────────────────────────────
 *
 * `lib/tasks-backend.js` declares method returns as plain values (`Task`,
 * `Task[]`, `boolean`, …).  That JSDoc shape is correct for
 * `SqliteTaskBackend` (better-sqlite3 is synchronous) but **impossible** for
 * Postgres in Node — every `pg` query is inherently async.  Every method on
 * this class therefore returns a `Promise` of the documented shape.  Callers
 * obtained via `getBackend()` must `await` every call.
 *
 * The legacy `lib/tasks.js` shim assumes sync returns and is NOT compatible
 * with this backend.  Routing between sync SQLite and async Postgres lives
 * in jat-nsa33.4 ("Add backend field to projects.json config and route
 * CLI/IDE through it"), which will introduce an async-aware entry point.
 *
 * ─── CONNECTION POOL ─────────────────────────────────────────────────────────
 *
 * A single module-level `pg.Pool` is created per connection string.  Instances
 * of `PostgresTaskBackend` share the pool, so constructing many backends is
 * cheap.  Call `PostgresTaskBackend.close()` or `pool.end()` during process
 * shutdown to release connections; tests do this explicitly.
 *
 * ─── PROJECT MODEL ───────────────────────────────────────────────────────────
 *
 * SQLite stores one .jat/tasks.db per project directory and discovers projects
 * by scanning ~/code.  Postgres stores ALL projects in one database, keyed by
 * the `id` prefix (e.g. "jat-xyz" → project "jat").  `getProjects()` returns
 * a single synthetic Project entry backed by the DSN.  `initProject` is a
 * no-op beyond applying the schema.  Project path/name defaults can be
 * injected via `PostgresTaskBackend` constructor options.
 */

import pg from 'pg';
import { randomBytes } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import { TaskBackend } from './tasks-backend.js';

// ---------------------------------------------------------------------------
// Pool management (one Pool per DSN string)
// ---------------------------------------------------------------------------

/** @type {Map<string, import('pg').Pool>} */
const _pools = new Map();

function getPool(connectionString) {
    if (!connectionString) {
        throw new Error(
            'PostgresTaskBackend requires a connection string. Set JAT_DATABASE_URL ' +
            'or pass { connectionString } to the constructor.'
        );
    }
    let pool = _pools.get(connectionString);
    if (!pool) {
        pool = new pg.Pool({ connectionString, max: 10 });
        pool.on('error', (err) => {
            console.error('Postgres pool error:', err.message);
        });
        _pools.set(connectionString, pool);
    }
    return pool;
}

// ---------------------------------------------------------------------------
// Schema loading
// ---------------------------------------------------------------------------

function resolveSchemaPath(filename) {
    const direct = new URL(`./${filename}`, import.meta.url);
    const directPath = fileURLToPath(direct);
    if (existsSync(directPath)) return directPath;

    let dir = dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 10; i++) {
        const candidate = join(dir, 'lib', filename);
        if (existsSync(candidate)) return candidate;
        dir = dirname(dir);
    }
    return directPath;
}

let _schemaSQL = null;
function getSchemaSQL() {
    if (_schemaSQL === null) {
        _schemaSQL = readFileSync(resolveSchemaPath('tasks-schema-postgres.sql'), 'utf-8');
    }
    return _schemaSQL;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function parseReviewOverride(notes) {
    if (!notes) return null;
    const match = notes.match(/\[REVIEW_OVERRIDE:(always_review|always_auto)\]/);
    return match ? match[1] : null;
}

function now() {
    return new Date().toISOString();
}

function generatePgTaskId(prefix) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = randomBytes(5);
    let id = '';
    for (let i = 0; i < 5; i++) {
        id += chars[bytes[i] % chars.length];
    }
    return `${prefix}-${id}`;
}

/**
 * Derive the project name prefix from a task id: "jat-xyz" → "jat".
 * Matches the regex used by SqliteTaskBackend's list() filter.
 */
function prefixFromId(taskId) {
    const match = taskId.match(/^([a-zA-Z0-9_-]+?)-([a-zA-Z0-9.]+)$/);
    return match ? match[1] : null;
}

/**
 * Escape a free-text query for plainto_tsquery.  plainto_tsquery handles
 * almost everything natively, but we strip characters that can upset the
 * lexer in rare cases.
 */
function escapeTsQuery(query) {
    return query.replace(/[\\\x00]/g, ' ').trim();
}

async function loadLabels(client, taskId) {
    const { rows } = await client.query(
        'SELECT label FROM labels WHERE issue_id = $1',
        [taskId]
    );
    return rows.map((r) => r.label);
}

async function loadDependsOn(client, taskId) {
    const { rows } = await client.query(
        `SELECT d.depends_on_id AS id, d.type, t.title, t.status, t.priority
         FROM dependencies d
         LEFT JOIN tasks t ON d.depends_on_id = t.id
         WHERE d.issue_id = $1`,
        [taskId]
    );
    return rows;
}

async function loadBlockedBy(client, taskId) {
    const { rows } = await client.query(
        `SELECT d.issue_id AS id, d.type, t.title, t.status, t.priority
         FROM dependencies d
         LEFT JOIN tasks t ON d.issue_id = t.id
         WHERE d.depends_on_id = $1`,
        [taskId]
    );
    return rows;
}

async function loadComments(client, taskId) {
    const { rows } = await client.query(
        `SELECT id, author, text, created_at
         FROM comments
         WHERE issue_id = $1
         ORDER BY created_at ASC, id ASC`,
        [taskId]
    );
    return rows.map((r) => ({
        id: Number(r.id),
        author: r.author,
        text: r.text,
        created_at: r.created_at,
    }));
}

/**
 * Attach labels, dependencies, and (optionally) comments to a raw task row.
 * Also stamps `project`, `project_path`, and `review_override` so the result
 * matches the SQLite adapter's enriched task exactly.
 */
async function enrichTask(client, row, context, options = {}) {
    if (!row) return null;

    const prefix = prefixFromId(row.id) || context.defaultProjectName;
    row.project = prefix;
    row.project_path = context.projectPathFor
        ? context.projectPathFor(prefix)
        : context.defaultProjectPath;
    row.labels = await loadLabels(client, row.id);
    row.depends_on = await loadDependsOn(client, row.id);
    row.blocked_by = await loadBlockedBy(client, row.id);
    row.review_override = parseReviewOverride(row.notes);
    if (options.includeComments) {
        row.comments = await loadComments(client, row.id);
    }
    return row;
}

/**
 * Run a function with a pooled client, releasing it whether or not it throws.
 */
async function withClient(pool, fn) {
    const client = await pool.connect();
    try {
        return await fn(client);
    } finally {
        client.release();
    }
}

/**
 * Run a function inside a BEGIN/COMMIT transaction.  Rolls back on throw.
 */
async function withTransaction(pool, fn) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch { /* noop */ }
        throw err;
    } finally {
        client.release();
    }
}

// ---------------------------------------------------------------------------
// PostgresTaskBackend
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} PostgresBackendOptions
 * @property {string}  [connectionString] - DSN (defaults to JAT_DATABASE_URL env var)
 * @property {string}  [projectName]      - Synthetic project name returned by getProjects()
 * @property {string}  [projectPath]      - Synthetic project path returned by getProjects()
 * @property {Record<string,string>} [projectPaths] - Optional map of id-prefix → absolute path
 *                                                    so enrichTask can resolve project_path per task
 */
export class PostgresTaskBackend extends TaskBackend {
    /** @param {PostgresBackendOptions} [options] */
    constructor(options = {}) {
        super();
        this.connectionString = options.connectionString || process.env.JAT_DATABASE_URL || '';
        this.defaultProjectName = options.projectName || process.env.JAT_PROJECT_NAME || 'jat';
        this.defaultProjectPath = options.projectPath || process.env.JAT_PROJECT_PATH || process.cwd();
        this.projectPaths = options.projectPaths || null;
        this.pool = getPool(this.connectionString);
    }

    /** Enrichment context object passed to enrichTask(). */
    _enrichContext() {
        return {
            defaultProjectName: this.defaultProjectName,
            defaultProjectPath: this.defaultProjectPath,
            projectPathFor: this.projectPaths
                ? (prefix) => this.projectPaths[prefix] || this.defaultProjectPath
                : null,
        };
    }

    /**
     * Release the shared connection pool for this DSN.  Safe to call multiple
     * times; after calling, create a new PostgresTaskBackend to reconnect.
     */
    async close() {
        const pool = _pools.get(this.connectionString);
        if (pool) {
            _pools.delete(this.connectionString);
            await pool.end();
        }
    }

    // ─── Project Discovery ──────────────────────────────────────────────────

    /**
     * Postgres stores all projects in one database, so there is no directory
     * scan.  Returns a single synthetic Project entry whose `dbPath` is the
     * connection string.
     *
     * @returns {Promise<import('./tasks-backend.js').Project[]>}
     */
    async getProjects() {
        return [{
            name: this.defaultProjectName,
            path: this.defaultProjectPath,
            dbPath: this.connectionString,
        }];
    }

    /**
     * Apply the Postgres schema to the target database.  Idempotent — all
     * statements use `IF NOT EXISTS` or equivalent guards, so it is safe to
     * call on an already-initialised database.
     *
     * @returns {Promise<import('./tasks-backend.js').InitProjectResult>}
     */
    async initProject(_projectPath) {
        await withClient(this.pool, async (client) => {
            await client.query(getSchemaSQL());
        });
        return { dbPath: this.connectionString };
    }

    // ─── ID Generation ──────────────────────────────────────────────────────

    /** @returns {string} */
    generateId(prefix) {
        return generatePgTaskId(prefix);
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
        const push = (sql, val) => { params.push(val); clauses.push(sql.replace('?', `$${params.length}`)); };

        if (status !== undefined)       push('status = ?',     status);
        if (priority !== undefined)     push('priority = ?',   priority);
        if (closedAfter !== undefined)  push('closed_at >= ?', closedAfter);
        if (closedBefore !== undefined) push('closed_at < ?',  closedBefore);
        if (projectName)                push("id LIKE ? || '-%'", projectName);

        const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
        const sql = `
            SELECT * FROM tasks
            ${where}
            ORDER BY priority ASC, created_at DESC
        `;

        return withClient(this.pool, async (client) => {
            const { rows } = await client.query(sql, params);
            const ctx = this._enrichContext();
            const out = [];
            for (const row of rows) {
                out.push(await enrichTask(client, row, ctx));
            }
            return out;
        });
    }

    /**
     * @param {string} taskId
     * @returns {Promise<import('./tasks-backend.js').Task|null>}
     */
    async getById(taskId) {
        return withClient(this.pool, async (client) => {
            const { rows } = await client.query(
                'SELECT * FROM tasks WHERE id = $1',
                [taskId]
            );
            if (rows.length === 0) return null;
            return enrichTask(client, rows[0], this._enrichContext(), { includeComments: true });
        });
    }

    /** @returns {Promise<import('./tasks-backend.js').Task[]>} */
    async getReady() {
        // A task is ready when it is open AND every dependency row it has
        // points to a closed task (or it has no dependency rows at all).
        const sql = `
            SELECT t.* FROM tasks t
            WHERE t.status = 'open'
            AND NOT EXISTS (
                SELECT 1 FROM dependencies d
                LEFT JOIN tasks blocker ON blocker.id = d.depends_on_id
                WHERE d.issue_id = t.id
                AND (blocker.status IS NULL OR blocker.status <> 'closed')
            )
            ORDER BY t.priority ASC, t.created_at DESC
        `;
        return withClient(this.pool, async (client) => {
            const { rows } = await client.query(sql);
            const ctx = this._enrichContext();
            const out = [];
            for (const row of rows) {
                out.push(await enrichTask(client, row, ctx));
            }
            return out;
        });
    }

    /**
     * @param {import('./tasks-backend.js').ScheduledOptions} [options]
     * @returns {Promise<import('./tasks-backend.js').Task[]>}
     */
    async getScheduled(options = {}) {
        const clauses = [
            "((schedule_cron IS NOT NULL AND schedule_cron <> '') OR (next_run_at IS NOT NULL AND next_run_at <> ''))",
        ];
        const params = [];
        if (options.projectName) {
            params.push(options.projectName);
            clauses.push(`id LIKE $${params.length} || '-%'`);
        }
        const sql = `
            SELECT * FROM tasks
            WHERE ${clauses.join(' AND ')}
            ORDER BY priority ASC, next_run_at ASC NULLS LAST
        `;
        return withClient(this.pool, async (client) => {
            const { rows } = await client.query(sql, params);
            const ctx = this._enrichContext();
            const out = [];
            for (const row of rows) {
                out.push(await enrichTask(client, row, ctx));
            }
            return out;
        });
    }

    /**
     * Full-text search via tsvector + ts_rank.  Fallback to ILIKE if the
     * generated column is missing (pre-v12 Postgres or a partial schema).
     *
     * @param {string} query
     * @param {import('./tasks-backend.js').SearchOptions} [options]
     * @returns {Promise<import('./tasks-backend.js').Task[]>}
     */
    async search(query, options = {}) {
        const { updatedAfter, status, type, labels, limit = 50 } = options;

        return withClient(this.pool, async (client) => {
            const hasFtsColumn = await this._hasFtsColumn(client);

            const whereClauses = [];
            const params = [];
            const push = (sql, val) => {
                params.push(val);
                whereClauses.push(sql.replace('?', `$${params.length}`));
            };

            let relevanceSelect;
            let orderBy;

            if (hasFtsColumn) {
                push('t.tasks_fts_doc @@ plainto_tsquery(?, ?)', 'english');
                params.push(escapeTsQuery(query));
                whereClauses[whereClauses.length - 1] =
                    `t.tasks_fts_doc @@ plainto_tsquery($${params.length - 1}, $${params.length})`;

                relevanceSelect = `ROUND(ts_rank(t.tasks_fts_doc, plainto_tsquery($${params.length - 1}, $${params.length}))::numeric, 4) AS relevance`;
                orderBy = 'ORDER BY relevance DESC';
            } else {
                const likeTerm = `%${query}%`;
                push('(t.title ILIKE ? OR t.description ILIKE ?)', likeTerm);
                params.push(likeTerm);
                whereClauses[whereClauses.length - 1] =
                    `(t.title ILIKE $${params.length - 1} OR t.description ILIKE $${params.length})`;
                relevanceSelect = '0::numeric AS relevance';
                orderBy = 'ORDER BY t.updated_at DESC';
            }

            if (updatedAfter) push('t.updated_at >= ?', updatedAfter);
            if (status)       push('t.status = ?',      status);
            if (type)         push('t.issue_type = ?',  type);
            if (labels && labels.length > 0) {
                for (const lbl of labels) {
                    push('EXISTS (SELECT 1 FROM labels l WHERE l.issue_id = t.id AND l.label = ?)', lbl.trim());
                }
            }

            params.push(limit);
            const limitParam = `$${params.length}`;

            const sql = `
                SELECT t.*, ${relevanceSelect}
                FROM tasks t
                WHERE ${whereClauses.join(' AND ')}
                ${orderBy}
                LIMIT ${limitParam}
            `;

            const { rows } = await client.query(sql, params);
            const ctx = this._enrichContext();
            const out = [];
            for (const row of rows) {
                const enriched = await enrichTask(client, row, ctx);
                enriched.relevance = Number(row.relevance || 0);
                out.push(enriched);
            }
            return out;
        });
    }

    /** @private */
    async _hasFtsColumn(client) {
        const { rows } = await client.query(
            `SELECT 1 FROM information_schema.columns
             WHERE table_name = 'tasks' AND column_name = 'tasks_fts_doc'
             LIMIT 1`
        );
        return rows.length > 0;
    }

    // ─── Writes ──────────────────────────────────────────────────────────────

    /**
     * @param {import('./tasks-backend.js').CreateOptions} opts
     * @returns {Promise<import('./tasks-backend.js').Task>}
     */
    async create(opts) {
        const {
            projectPath,
            title,
            description = '',
            type = 'task',
            priority = 2,
            labels = [],
            deps = [],
            assignee = null,
            notes = '',
            id: explicitId,
            command,
            agent_program,
            model,
            schedule_cron,
            next_run_at,
            due_date,
        } = opts;

        // Postgres has no filesystem project layout — the constructor's
        // defaultProjectName is the source of truth for the id prefix.  A
        // caller-supplied projectPath only overrides when the basename looks
        // like a real project name (not a /tmp/fake-* sandbox).
        const prefix = this.defaultProjectName
            || (projectPath && projectPath.split('/').pop())
            || 'jat';
        const id = explicitId || this.generateId(prefix);
        const ts = now();

        return withTransaction(this.pool, async (client) => {
            await client.query(
                `INSERT INTO tasks (
                    id, title, description, notes, status, priority, issue_type, assignee,
                    command, agent_program, model, schedule_cron, next_run_at, due_date,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, 'open', $5, $6, $7,
                    $8, $9, $10, $11, $12, $13,
                    $14, $15
                )`,
                [
                    id, title, description, notes, priority, type, assignee,
                    command || null, agent_program || null, model || null,
                    schedule_cron || null, next_run_at || null, due_date || null,
                    ts, ts,
                ]
            );

            for (const label of labels) {
                const trimmed = label.trim();
                if (trimmed) {
                    await client.query(
                        'INSERT INTO labels (issue_id, label) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [id, trimmed]
                    );
                }
            }

            for (const depId of deps) {
                await client.query(
                    'INSERT INTO dependencies (issue_id, depends_on_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [id, depId, 'blocks']
                );
            }

            const { rows } = await client.query('SELECT * FROM tasks WHERE id = $1', [id]);
            return enrichTask(client, rows[0], this._enrichContext(), { includeComments: true });
        });
    }

    /**
     * @param {string} taskId
     * @param {import('./tasks-backend.js').UpdateOptions} updates
     * @returns {Promise<import('./tasks-backend.js').Task>}
     */
    async update(taskId, updates) {
        const allowedFields = [
            'title', 'description', 'notes', 'status', 'priority', 'issue_type',
            'assignee', 'command', 'agent_program', 'model', 'schedule_cron',
            'next_run_at', 'due_date',
        ];

        return withTransaction(this.pool, async (client) => {
            const { rows: existingRows } = await client.query(
                'SELECT id FROM tasks WHERE id = $1',
                [taskId]
            );
            if (existingRows.length === 0) {
                throw new Error(`Task not found: ${taskId}`);
            }

            const sets = [];
            const params = [];
            const pushSet = (sql, val) => {
                params.push(val);
                sets.push(sql.replace('?', `$${params.length}`));
            };

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    pushSet(`${field} = ?`, updates[field]);
                }
            }

            if (updates.status === 'closed') {
                pushSet('closed_at = ?', now());
            } else if (updates.status && updates.status !== 'closed') {
                sets.push('closed_at = NULL');
            }

            if (sets.length > 0) {
                pushSet('updated_at = ?', now());
                params.push(taskId);
                await client.query(
                    `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${params.length}`,
                    params
                );
            }

            if (updates.labels !== undefined) {
                await client.query('DELETE FROM labels WHERE issue_id = $1', [taskId]);
                for (const label of updates.labels) {
                    const trimmed = label.trim();
                    if (trimmed) {
                        await client.query(
                            'INSERT INTO labels (issue_id, label) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                            [taskId, trimmed]
                        );
                    }
                }
                if (sets.length === 0) {
                    await client.query(
                        'UPDATE tasks SET updated_at = $1 WHERE id = $2',
                        [now(), taskId]
                    );
                }
            }

            const { rows } = await client.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
            return enrichTask(client, rows[0], this._enrichContext(), { includeComments: true });
        });
    }

    /**
     * @param {string} taskId
     * @param {string} [reason]
     * @param {string} [_projectPath]
     * @returns {Promise<import('./tasks-backend.js').Task>}
     */
    async close(taskId, reason = '', _projectPath) {
        return withTransaction(this.pool, async (client) => {
            const ts = now();
            const { rowCount } = await client.query(
                `UPDATE tasks
                 SET status = 'closed', closed_at = $1, close_reason = $2, updated_at = $3
                 WHERE id = $4`,
                [ts, reason, ts, taskId]
            );
            if (rowCount === 0) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const { rows } = await client.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
            return enrichTask(client, rows[0], this._enrichContext(), { includeComments: true });
        });
    }

    /**
     * @param {string} taskId
     * @param {string} [_projectPath]
     * @returns {Promise<boolean>}
     */
    async delete(taskId, _projectPath) {
        return withClient(this.pool, async (client) => {
            const { rowCount } = await client.query(
                'DELETE FROM tasks WHERE id = $1',
                [taskId]
            );
            if (rowCount === 0) {
                throw new Error(`Task not found: ${taskId}`);
            }
            return rowCount > 0;
        });
    }

    // ─── Dependencies ────────────────────────────────────────────────────────

    /**
     * @param {string} taskId
     * @param {string} dependsOnId
     * @param {string} [_projectPath]
     * @returns {Promise<boolean>}
     */
    async addDependency(taskId, dependsOnId, _projectPath) {
        if (taskId === dependsOnId) {
            throw new Error('A task cannot depend on itself');
        }

        return withTransaction(this.pool, async (client) => {
            const { rows: existingRows } = await client.query(
                'SELECT id FROM tasks WHERE id = $1',
                [taskId]
            );
            if (existingRows.length === 0) {
                throw new Error(`Task not found: ${taskId}`);
            }

            // Walk the chain from `dependsOnId` down and see whether we loop
            // back to `taskId`. Matches the SQLite recursive CTE exactly.
            const { rows: cycleRows } = await client.query(
                `WITH RECURSIVE chain(id) AS (
                    SELECT $1::text
                    UNION ALL
                    SELECT d.depends_on_id
                    FROM dependencies d
                    JOIN chain c ON d.issue_id = c.id
                )
                SELECT 1 FROM chain WHERE id = $2 LIMIT 1`,
                [dependsOnId, taskId]
            );
            if (cycleRows.length > 0) {
                throw new Error(`Adding dependency would create a cycle: ${taskId} -> ${dependsOnId}`);
            }

            const { rowCount } = await client.query(
                `INSERT INTO dependencies (issue_id, depends_on_id, type)
                 VALUES ($1, $2, 'blocks')
                 ON CONFLICT DO NOTHING`,
                [taskId, dependsOnId]
            );
            return rowCount > 0;
        });
    }

    /**
     * @param {string} taskId
     * @param {string} dependsOnId
     * @param {string} [_projectPath]
     * @returns {Promise<boolean>}
     */
    async removeDependency(taskId, dependsOnId, _projectPath) {
        return withClient(this.pool, async (client) => {
            const { rows: existingRows } = await client.query(
                'SELECT id FROM tasks WHERE id = $1',
                [taskId]
            );
            if (existingRows.length === 0) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const { rowCount } = await client.query(
                'DELETE FROM dependencies WHERE issue_id = $1 AND depends_on_id = $2',
                [taskId, dependsOnId]
            );
            return rowCount > 0;
        });
    }

    /**
     * @param {string} taskId
     * @param {import('./tasks-backend.js').DependencyTreeOptions} [options]
     * @returns {Promise<import('./tasks-backend.js').DependencyTreeNode[]>}
     */
    async getDependencyTree(taskId, options = {}) {
        const sql = options.reverse
            ? `
                WITH RECURSIVE tree(id, depth) AS (
                    SELECT issue_id, 1 FROM dependencies WHERE depends_on_id = $1
                    UNION ALL
                    SELECT d.issue_id, t.depth + 1 FROM dependencies d
                    JOIN tree t ON d.depends_on_id = t.id
                    WHERE t.depth < 20
                )
                SELECT DISTINCT tree.id, tree.depth, tsk.title, tsk.status, tsk.priority
                FROM tree
                LEFT JOIN tasks tsk ON tree.id = tsk.id
                ORDER BY tree.depth ASC, tsk.priority ASC
            `
            : `
                WITH RECURSIVE tree(id, depth) AS (
                    SELECT depends_on_id, 1 FROM dependencies WHERE issue_id = $1
                    UNION ALL
                    SELECT d.depends_on_id, t.depth + 1 FROM dependencies d
                    JOIN tree t ON d.issue_id = t.id
                    WHERE t.depth < 20
                )
                SELECT DISTINCT tree.id, tree.depth, tsk.title, tsk.status, tsk.priority
                FROM tree
                LEFT JOIN tasks tsk ON tree.id = tsk.id
                ORDER BY tree.depth ASC, tsk.priority ASC
            `;

        return withClient(this.pool, async (client) => {
            const { rows } = await client.query(sql, [taskId]);
            return rows;
        });
    }

    // ─── Comments ────────────────────────────────────────────────────────────

    /**
     * @param {string} taskId
     * @param {string} author
     * @param {string} text
     * @param {string} [_projectPath]
     * @returns {Promise<import('./tasks-backend.js').Comment>}
     */
    async addComment(taskId, author, text, _projectPath) {
        return withClient(this.pool, async (client) => {
            const ts = now();
            const { rows } = await client.query(
                `INSERT INTO comments (issue_id, author, text, created_at)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, author, text, created_at`,
                [taskId, author, text, ts]
            );
            if (rows.length === 0) {
                throw new Error(`Task not found: ${taskId}`);
            }
            return {
                id: Number(rows[0].id),
                author: rows[0].author,
                text: rows[0].text,
                created_at: rows[0].created_at,
            };
        });
    }
}

// ---------------------------------------------------------------------------
// Module-level shutdown helper
// ---------------------------------------------------------------------------

/**
 * Close every pool created by this module.  Useful in tests and scripts that
 * must let Node exit cleanly.
 */
export async function closeAllPools() {
    const pools = Array.from(_pools.values());
    _pools.clear();
    await Promise.all(pools.map((p) => p.end().catch(() => {})));
}
