/**
 * Postgres adapter for JAT knowledge bases.
 *
 * Mirrors the CRUD surface of lib/bases.js (SQLite) but backed by a Postgres
 * database (typically Supabase for graduated projects).  Used when a project's
 * projects.json entry declares `backend="postgres"`; routing between the two
 * backends happens in the IDE's /api/bases routes.
 *
 * All exports are async.  Row shapes returned from here match parseBaseRow()
 * in lib/bases.js so downstream consumers don't need to branch on backend.
 *
 * Schema reference: supabase/migrations/{ts}_data_bases.sql (meadow-i9hgz)
 */

import pg from 'pg';
import { randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// Pool management (keyed by DSN; cheap to share across callers)
// ---------------------------------------------------------------------------

/** @type {Map<string, import('pg').Pool>} */
const _pools = new Map();

function getPool(connectionString) {
    if (!connectionString) {
        throw new Error('bases-postgres: connection string is required');
    }
    let pool = _pools.get(connectionString);
    if (!pool) {
        pool = new pg.Pool({ connectionString, max: 10 });
        pool.on('error', (err) => {
            console.error('bases-postgres pool error:', err.message);
        });
        _pools.set(connectionString, pool);
    }
    return pool;
}

export async function closeAllPools() {
    const pools = Array.from(_pools.values());
    _pools.clear();
    await Promise.all(pools.map((p) => p.end().catch(() => {})));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now() {
    return new Date().toISOString();
}

function generateId() {
    return randomBytes(4).toString('hex');
}

function normalizeBlocks(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw) {
        try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
}

function normalizeConfig(raw) {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw) {
        try { return JSON.parse(raw); } catch { return {}; }
    }
    return {};
}

function inferSourceType(blocks, config) {
    if (config._migrated_source_type) return config._migrated_source_type;
    if (blocks.some((b) => b.type === 'table_view')) return 'data_table';
    if (config.sender_key) return 'conversation';
    if (config.url || config.coda_doc_id || config.gsheet_id) return 'external';
    return 'manual';
}

function toIsoString(value) {
    if (value == null) return null;
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

/**
 * Convert a raw postgres row from the `bases` table into the shape returned
 * by lib/bases.js::parseBaseRow so callers don't need to branch on backend.
 */
function rowToBase(row) {
    if (!row) return null;
    const blocks = normalizeBlocks(row.blocks);
    const sourceConfig = normalizeConfig(row.source_config);

    const textBlocks = blocks.filter((b) => b.type === 'text');
    const content = textBlocks.map((b) => b.content).join('\n\n') || null;
    const contextQuery = sourceConfig.context_query || null;

    return {
        id: row.id,
        name: row.name,
        description: row.description || null,
        project: row.project,
        blocks,
        source_config: sourceConfig,
        always_inject: row.always_inject === true,
        token_estimate: row.token_estimate ?? null,
        // icon / sort_order aren't part of the postgres schema yet — surface
        // the same defaults the SQLite parseBaseRow uses so callers see a
        // consistent shape across backends.
        icon: row.icon || null,
        sort_order: row.sort_order ?? 0,
        source_type: inferSourceType(blocks, sourceConfig),
        content,
        context_query: contextQuery,
        created_at: toIsoString(row.created_at),
        updated_at: toIsoString(row.updated_at),
    };
}

// ---------------------------------------------------------------------------
// CRUD: bases
// ---------------------------------------------------------------------------

/**
 * List bases for a project, optionally filtered to always_inject=true only.
 * @param {string} connectionString
 * @param {{ project?: string, alwaysInjectOnly?: boolean }} [opts]
 */
export async function listBases(connectionString, opts = {}) {
    const pool = getPool(connectionString);
    const { project, alwaysInjectOnly = false } = opts;

    const conds = [];
    const params = [];
    if (project) {
        params.push(project);
        conds.push(`project = $${params.length}`);
    }
    if (alwaysInjectOnly) {
        conds.push('always_inject = true');
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const sql = `SELECT * FROM bases ${where} ORDER BY name ASC`;

    try {
        const { rows } = await pool.query(sql, params);
        return rows.map(rowToBase);
    } catch (err) {
        if (err.code === '42P01') return []; // bases table not yet migrated
        throw err;
    }
}

/**
 * Fetch a single base by id.  Returns null if not found.
 */
export async function getBase(connectionString, id) {
    const pool = getPool(connectionString);
    const { rows } = await pool.query('SELECT * FROM bases WHERE id = $1', [id]);
    return rows[0] ? rowToBase(rows[0]) : null;
}

/**
 * Create a base.  Supports the same input variants as the SQLite adapter:
 *   - block-based: pass `blocks`
 *   - legacy: pass `source_type` + `content` (auto-converted to a text block)
 */
export async function createBase(connectionString, input) {
    if (!input || !input.name) throw new Error('Name is required');

    const pool = getPool(connectionString);
    const id = input.id || generateId();
    const ts = now();

    let blocks = input.blocks || [];
    if (blocks.length === 0 && input.content) {
        blocks = [{ type: 'text', id: generateId(), content: input.content }];
    }

    const sourceConfig = input.source_config ? { ...input.source_config } : {};
    if (input.source_type) sourceConfig._migrated_source_type = input.source_type;
    if (input.context_query) sourceConfig.context_query = input.context_query;

    const { rows } = await pool.query(
        `INSERT INTO bases (id, name, project, blocks, description, always_inject, token_estimate, source_config, created_at, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8::jsonb, $9, $10)
         RETURNING *`,
        [
            id,
            input.name,
            input.project || 'default',
            JSON.stringify(blocks),
            input.description || null,
            !!input.always_inject,
            input.token_estimate ?? null,
            JSON.stringify(sourceConfig),
            ts,
            ts,
        ]
    );
    return rowToBase(rows[0]);
}

/**
 * Update a base.  Only fields present in `input` are touched.
 * Supports the legacy `content` and `context_query` shims.
 */
export async function updateBase(connectionString, id, input) {
    const pool = getPool(connectionString);
    const existingRes = await pool.query('SELECT * FROM bases WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) throw new Error(`Base "${id}" not found`);

    const sets = [];
    const values = [];
    const add = (col, val, cast = '') => {
        values.push(val);
        sets.push(`${col} = $${values.length}${cast}`);
    };

    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    if (input.blocks !== undefined) add('blocks', JSON.stringify(input.blocks), '::jsonb');
    if (input.always_inject !== undefined) add('always_inject', !!input.always_inject);
    if (input.token_estimate !== undefined) add('token_estimate', input.token_estimate);
    if (input.project !== undefined) add('project', input.project);

    // Legacy `content` → update the text block in-place
    if (input.content !== undefined && input.blocks === undefined) {
        const currentBlocks = normalizeBlocks(existing.blocks);
        const textBlock = currentBlocks.find((b) => b.type === 'text');
        if (textBlock) {
            textBlock.content = input.content;
        } else {
            currentBlocks.unshift({ type: 'text', id: generateId(), content: input.content });
        }
        add('blocks', JSON.stringify(currentBlocks), '::jsonb');
    }

    if (input.source_config !== undefined) {
        add('source_config', JSON.stringify(input.source_config), '::jsonb');
    } else if (input.context_query !== undefined) {
        const config = { ...normalizeConfig(existing.source_config) };
        config.context_query = input.context_query;
        add('source_config', JSON.stringify(config), '::jsonb');
    }

    if (sets.length === 0) return rowToBase(existing);

    add('updated_at', now());
    values.push(id);
    const sql = `UPDATE bases SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const { rows } = await pool.query(sql, values);
    return rowToBase(rows[0]);
}

/**
 * Delete a base.  Returns { changes } matching the SQLite adapter's shape.
 */
export async function deleteBase(connectionString, id) {
    const pool = getPool(connectionString);
    const { rowCount } = await pool.query('DELETE FROM bases WHERE id = $1', [id]);
    return { changes: rowCount ?? 0 };
}

/**
 * Case-insensitive substring search on name + description.
 * Returns bases for a project (or all if project is omitted).
 */
export async function searchBases(connectionString, { project, query, limit = 20 } = {}) {
    if (!query) return [];
    const pool = getPool(connectionString);
    const like = `%${query}%`;
    const params = [like, like];
    let sql = 'SELECT * FROM bases WHERE (name ILIKE $1 OR description ILIKE $2)';
    if (project) {
        params.push(project);
        sql += ` AND project = $${params.length}`;
    }
    params.push(limit);
    sql += ` ORDER BY updated_at DESC NULLS LAST LIMIT $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return rows.map(rowToBase);
}

// ---------------------------------------------------------------------------
// Task ↔ base attachment
// ---------------------------------------------------------------------------

export async function attachBaseToTask(connectionString, taskId, baseId, opts = {}) {
    const pool = getPool(connectionString);
    const baseCheck = await pool.query('SELECT id FROM bases WHERE id = $1', [baseId]);
    if (baseCheck.rowCount === 0) {
        throw new Error(`Base "${baseId}" not found`);
    }

    const already = await pool.query(
        'SELECT 1 FROM task_bases WHERE task_id = $1 AND base_id = $2',
        [taskId, baseId]
    );
    if (already.rowCount > 0) return { attached: false };

    await pool.query(
        'INSERT INTO task_bases (task_id, base_id, attached_at, attached_by) VALUES ($1, $2, $3, $4)',
        [taskId, baseId, now(), opts.attached_by || null]
    );
    return { attached: true };
}

export async function detachBaseFromTask(connectionString, taskId, baseId) {
    const pool = getPool(connectionString);
    const { rowCount } = await pool.query(
        'DELETE FROM task_bases WHERE task_id = $1 AND base_id = $2',
        [taskId, baseId]
    );
    return { changes: rowCount ?? 0 };
}

/**
 * Return bases attached to a task, ordered by attach time.  Each row carries
 * attached_at / attached_by alongside the standard base shape.
 */
export async function getTaskBases(connectionString, taskId) {
    const pool = getPool(connectionString);
    const { rows } = await pool.query(
        `SELECT b.*, tb.attached_at AS tb_attached_at, tb.attached_by AS tb_attached_by
         FROM bases b
         JOIN task_bases tb ON tb.base_id = b.id
         WHERE tb.task_id = $1
         ORDER BY tb.attached_at ASC`,
        [taskId]
    );
    return rows.map((row) => ({
        ...rowToBase(row),
        attached_at: toIsoString(row.tb_attached_at),
        attached_by: row.tb_attached_by || null,
    }));
}
