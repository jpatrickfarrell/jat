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
import { existsSync, readFileSync } from 'fs';
import { join, resolve, extname } from 'path';
import {
    queryDataTable as pgQueryDataTable,
    insertRow as pgInsertRow,
    updateRow as pgUpdateRow,
    deleteRow as pgDeleteRow,
    getTableRows as pgGetTableRows,
    getTableSchema as pgGetTableSchema,
} from './data-postgres.js';

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
    const sql = `SELECT * FROM bases ${where} ORDER BY sort_order ASC, name ASC`;

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
    if (input.sort_order !== undefined) add('sort_order', input.sort_order);
    if (input.icon !== undefined) add('icon', input.icon);

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

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------

/**
 * Batch-update sort_order for a list of bases (drag-reorder).
 * Mirrors lib/bases.js::reorderBases for the postgres backend.
 * @param {string} connectionString
 * @param {Array<{id: string, sort_order: number}>} order
 */
export async function reorderBases(connectionString, order) {
    if (!Array.isArray(order)) throw new Error('order must be an array');
    if (order.length === 0) return { updated: 0 };

    const pool = getPool(connectionString);
    const ts = now();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of order) {
            await client.query(
                'UPDATE bases SET sort_order = $1, updated_at = $2 WHERE id = $3',
                [item.sort_order, ts, item.id]
            );
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
    } finally {
        client.release();
    }
    return { updated: order.length };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

const REFERENCE_PATTERN = /@(file|base|data):([^\s\]]+)/g;

const LANG_MAP = {
    js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
    java: 'java', c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp',
    cs: 'csharp', php: 'php', sh: 'bash', bash: 'bash',
    md: 'markdown', json: 'json', yaml: 'yaml', yml: 'yaml',
    sql: 'sql', html: 'html', css: 'css', svelte: 'svelte',
};

function formatMarkdownTable(rows) {
    const sanitize = (v) => {
        const s = String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
        return s.length > 120 ? s.slice(0, 117) + '...' : s;
    };
    const cols = Object.keys(rows[0]);
    const header = '| ' + cols.join(' | ') + ' |';
    const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
    const body = rows.map(row =>
        '| ' + cols.map(c => sanitize(row[c])).join(' | ') + ' |'
    ).join('\n');
    return `${header}\n${separator}\n${body}`;
}

async function fetchExternalContent(url, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        const text = await res.text();
        if (ct.includes('text/html')) {
            // Cheap HTML→text: strip tags and collapse whitespace
            return text
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }
        return text;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Run a context_query SELECT against the postgres data layer (data_rows
 * JSONB store) via the parser in data-postgres.js::queryDataTable.
 * Mirrors lib/bases.js::renderDataTableQuery for the postgres backend.
 */
async function renderDataTableQuery(projectName, contextQuery) {
    const trimmed = contextQuery?.trim();
    if (!trimmed) return '(empty query)';
    if (!/^SELECT\b/i.test(trimmed)) {
        return '(context_query must be a SELECT statement)';
    }

    let sql = trimmed;
    if (!/\bLIMIT\b/i.test(sql)) {
        sql = sql.replace(/;?\s*$/, ' LIMIT 100');
    }

    try {
        const rows = await pgQueryDataTable(projectName, sql);
        if (!rows || rows.length === 0) return '(no results)';
        return formatMarkdownTable(rows);
    } catch (err) {
        return `(query error: ${err.message})`;
    }
}

/**
 * Render a single table_view block by querying data_rows in postgres.
 * Honors block.controlFilters, block.sort, and the LIMIT 100 cap.
 */
async function renderTableViewBlock(projectName, block, controlValues) {
    if (!block.tableName) return '';
    try {
        const filters = {};
        if (block.controlFilters) {
            for (const [column, controlName] of Object.entries(block.controlFilters)) {
                const val = controlValues[controlName];
                if (val !== null && val !== undefined && val !== '') {
                    filters[column] = String(val);
                }
            }
        }
        const opts = { filters, limit: 100 };
        if (block.sort?.column) {
            opts.orderBy = block.sort.column;
            opts.orderDir = block.sort.direction === 'DESC' ? 'DESC' : 'ASC';
        }
        const { rows } = await pgGetTableRows(projectName, block.tableName, opts);
        if (!rows || rows.length === 0) {
            return `*Table: ${block.tableName} (no rows)*`;
        }
        return formatMarkdownTable(rows);
    } catch (err) {
        return `*Table: ${block.tableName} (error: ${err.message})*`;
    }
}

async function serializeBlocksToMarkdown(projectName, blocks) {
    if (!blocks || blocks.length === 0) return '';

    const cv = {};
    for (const block of blocks) {
        if (block.type === 'control' && block.name && cv[block.name] === undefined) {
            cv[block.name] = block.value;
        }
    }

    const sections = [];
    for (const block of blocks) {
        switch (block.type) {
            case 'text':
                if (block.content?.trim()) sections.push(block.content.trim());
                break;
            case 'formula': {
                const name = block.name || block.expression;
                let expr = block.expression || '';
                expr = expr.replace(/\{(\w+)\}/g, (_, varName) => {
                    const v = cv[varName];
                    return v !== null && v !== undefined ? String(v) : '';
                });
                if (name) sections.push(`**${name}:** ${expr}`);
                break;
            }
            case 'table_view':
                sections.push(await renderTableViewBlock(projectName, block, cv));
                break;
            case 'control':
                if (block.name) {
                    const val = cv[block.name] ?? block.value ?? '';
                    sections.push(`**${block.name}:** ${val}`);
                }
                break;
            case 'divider':
                sections.push('---');
                break;
            case 'action':
                break;
            default:
                break;
        }
    }
    return sections.filter(Boolean).join('\n\n');
}

async function renderBaseContent(connectionString, projectName, base) {
    const blocks = base.blocks || [];
    const config = base.source_config || {};

    if (config.url) {
        const fetched = await fetchExternalContent(config.url);
        if (fetched) {
            const nonText = await serializeBlocksToMarkdown(
                projectName,
                blocks.filter((b) => b.type !== 'text')
            );
            return nonText ? `${nonText}\n\n${fetched}` : fetched;
        }
        const hasContent = blocks.some((b) => b.type === 'text' && b.content?.trim());
        if (hasContent) return serializeBlocksToMarkdown(projectName, blocks);
        return '(external source unavailable)';
    }

    if (config.context_query && !blocks.some((b) => b.type === 'table_view')) {
        return renderDataTableQuery(projectName, config.context_query);
    }

    return serializeBlocksToMarkdown(projectName, blocks);
}

async function resolveReferences(connectionString, projectName, projectPath, content, visitedBaseIds = new Set(), opts = {}) {
    if (!content || !content.includes('@')) return content;
    const collapsible = opts.collapsible || false;

    // Collect all matches first since async replaceAll isn't built-in.
    const matches = [];
    const re = new RegExp(REFERENCE_PATTERN.source, 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
        matches.push({ match: m[0], type: m[1], value: m[2].trim(), index: m.index });
    }

    if (matches.length === 0) return content;

    // Resolve sequentially so @base recursion can rely on visitedBaseIds.
    /** @type {Map<number, string>} */
    const replacements = new Map();
    for (const { match, type, value, index } of matches) {
        let resolved;
        if (type === 'file') {
            resolved = resolveFileRef(projectPath, value, collapsible);
        } else if (type === 'base') {
            resolved = await resolveBaseRef(connectionString, projectName, projectPath, value, visitedBaseIds, collapsible);
        } else if (type === 'data') {
            const inner = await renderDataTableQuery(projectName, `SELECT * FROM "${value}"`);
            resolved = collapsible
                ? `<details class="ref-collapse"><summary>📊 @data:${value}</summary>\n\n${inner}\n</details>`
                : inner;
        } else {
            resolved = match;
        }
        replacements.set(index, resolved);
    }

    // Splice replacements back into the original string in reverse so indices stay valid.
    const sorted = [...matches].sort((a, b) => b.index - a.index);
    let out = content;
    for (const { match, index } of sorted) {
        const replacement = replacements.get(index) ?? match;
        out = out.slice(0, index) + replacement + out.slice(index + match.length);
    }
    return out;
}

function resolveFileRef(projectPath, filePath, collapsible) {
    if (!projectPath) return `> **@file error:** project path unavailable`;
    try {
        const fullPath = resolve(join(projectPath, filePath));
        const projectRoot = resolve(projectPath);
        if (!fullPath.startsWith(projectRoot + '/') && fullPath !== projectRoot) {
            return `> **@file error:** path outside project directory`;
        }
        if (!existsSync(fullPath)) return `> **@file error:** \`${filePath}\` not found`;
        const content = readFileSync(fullPath, 'utf-8');
        const ext = extname(filePath).replace('.', '').toLowerCase();
        const lang = LANG_MAP[ext] || ext || '';
        const codeBlock = '```' + lang + '\n' + content + '\n```';
        if (collapsible) {
            return `<details class="ref-collapse"><summary>📄 @file:${filePath}</summary>\n\n${codeBlock}\n</details>`;
        }
        return codeBlock;
    } catch (err) {
        return `> **@file error:** \`${filePath}\` — ${err.message}`;
    }
}

async function resolveBaseRef(connectionString, projectName, projectPath, baseName, visitedBaseIds, collapsible) {
    try {
        const all = await listBases(connectionString, { project: projectName });
        const target = all.find((b) => b.name.toLowerCase() === baseName.toLowerCase());
        if (!target) return `> **@base error:** "${baseName}" not found`;
        if (visitedBaseIds.has(target.id)) {
            return `> **@base error:** circular reference to "${baseName}"`;
        }
        const newVisited = new Set(visitedBaseIds);
        newVisited.add(target.id);
        const refContent = await renderBaseContent(connectionString, projectName, target);
        const resolved = await resolveReferences(connectionString, projectName, projectPath, refContent, newVisited, { collapsible });
        if (collapsible) {
            return `<details class="ref-collapse"><summary>📚 @base:${baseName}</summary>\n\n${resolved}\n</details>`;
        }
        return resolved;
    } catch (err) {
        return `> **@base error:** "${baseName}" — ${err.message}`;
    }
}

/**
 * Render a postgres-backed knowledge base for prompt injection.
 * Mirrors lib/bases.js::renderBase for the postgres backend.
 * Persists the computed token estimate back to the bases row.
 *
 * @param {string} connectionString
 * @param {{ projectName: string, projectPath?: string|null, collapsible?: boolean }} ctx
 * @param {string} id
 */
export async function renderBase(connectionString, ctx, id) {
    const projectName = ctx?.projectName;
    if (!projectName) throw new Error('renderBase: projectName is required');
    const projectPath = ctx?.projectPath || null;
    const collapsible = !!ctx?.collapsible;

    const base = await getBase(connectionString, id);
    if (!base) throw new Error(`Base "${id}" not found`);

    let content = await renderBaseContent(connectionString, projectName, base);

    const visited = new Set([id]);
    const resolvedPlain = await resolveReferences(connectionString, projectName, projectPath, content, visited);
    const tokenEstimate = Math.ceil(resolvedPlain.length / 4);

    content = collapsible
        ? await resolveReferences(connectionString, projectName, projectPath, content, new Set([id]), { collapsible: true })
        : resolvedPlain;

    if (tokenEstimate > 0) {
        try {
            const pool = getPool(connectionString);
            await pool.query('UPDATE bases SET token_estimate = $1 WHERE id = $2', [tokenEstimate, id]);
        } catch {
            // Non-critical — don't fail render for token bookkeeping
        }
    }

    return {
        id: base.id,
        name: base.name,
        type: base.source_type || 'manual',
        content,
        token_estimate: tokenEstimate,
    };
}

// ---------------------------------------------------------------------------
// Action executor (data actions only on the postgres backend)
// ---------------------------------------------------------------------------

/**
 * Run a base action against postgres-backed data tables. Mirrors the
 * dispatcher in ide/src/routes/api/bases/[id]/action/+server.js for the
 * subset of actionTypes that touch data tables. Task-scoped actions
 * (CreateTask / UpdateTask) and SpawnAgent / RunCommand are handled
 * inline in the route handler since they are backend-agnostic or are
 * wired through other postgres-aware paths.
 *
 * @param {string} _connectionString  Bases DSN (kept in the signature so
 *   callers can route this through resolveBackendForProject without
 *   threading projectName separately; data-postgres looks up the same
 *   DSN itself via projectName).
 * @param {{ projectName: string, actionType: string, actionConfig: any }} args
 */
export async function runBaseAction(_connectionString, { projectName, actionType, actionConfig }) {
    if (!projectName) return { success: false, message: 'projectName is required' };
    if (!actionType) return { success: false, message: 'actionType is required' };

    switch (actionType) {
        case 'AddRow':
            return runAddRow(projectName, actionConfig);
        case 'ModifyRows':
            return runModifyRows(projectName, actionConfig);
        case 'DeleteRows':
            return runDeleteRows(projectName, actionConfig);
        default:
            return null; // signal: not handled here, caller falls through
    }
}

async function runAddRow(projectName, actionConfig) {
    const { table, values } = actionConfig || {};
    if (!table) return { success: false, message: 'AddRow: missing "table" in config' };
    if (!values || typeof values !== 'object' || Object.keys(values).length === 0) {
        return { success: false, message: 'AddRow: missing or empty "values" in config' };
    }
    try {
        const result = await pgInsertRow(projectName, table, values);
        let newRow = null;
        try {
            const { rows } = await pgGetTableRows(projectName, table, {
                filters: { rowid: String(result.rowid) },
                limit: 1,
            });
            newRow = rows?.[0] || null;
        } catch {
            // Non-fatal
        }
        return {
            success: true,
            message: `Added row to ${table}`,
            data: newRow,
            rowsAffected: 1,
        };
    } catch (err) {
        return { success: false, message: `AddRow: ${err.message}` };
    }
}

async function runModifyRows(projectName, actionConfig) {
    const { table, filter, updates } = actionConfig || {};
    if (!table) return { success: false, message: 'ModifyRows: missing "table" in config' };
    if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
        return { success: false, message: 'ModifyRows: missing or empty "filter" in config' };
    }
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
        return { success: false, message: 'ModifyRows: missing or empty "updates" in config' };
    }

    try {
        const schema = await pgGetTableSchema(projectName, table);
        const validColumns = (schema || []).map((c) => c.name);
        for (const col of Object.keys(filter)) {
            if (!validColumns.includes(col)) {
                return { success: false, message: `ModifyRows: unknown filter column "${col}"` };
            }
        }
        for (const col of Object.keys(updates)) {
            if (!validColumns.includes(col)) {
                return { success: false, message: `ModifyRows: unknown update column "${col}"` };
            }
        }

        const stringFilter = {};
        for (const [k, v] of Object.entries(filter)) stringFilter[k] = String(v);
        const { rows: matchingRows } = await pgGetTableRows(projectName, table, {
            filters: stringFilter,
            limit: 10000,
        });
        if (!matchingRows || matchingRows.length === 0) {
            return { success: true, message: 'No rows matched the filter', rowsAffected: 0 };
        }

        let updated = 0;
        for (const row of matchingRows) {
            const result = await pgUpdateRow(projectName, table, row.rowid, updates);
            updated += result?.changes ?? 1;
        }
        return {
            success: true,
            message: `Updated ${updated} row${updated !== 1 ? 's' : ''} in ${table}`,
            rowsAffected: updated,
        };
    } catch (err) {
        return { success: false, message: `ModifyRows: ${err.message}` };
    }
}

async function runDeleteRows(projectName, actionConfig) {
    const { table, filter } = actionConfig || {};
    if (!table) return { success: false, message: 'DeleteRows: missing "table" in config' };
    if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
        return { success: false, message: 'DeleteRows: missing or empty "filter" in config' };
    }

    try {
        const schema = await pgGetTableSchema(projectName, table);
        const validColumns = (schema || []).map((c) => c.name);
        for (const col of Object.keys(filter)) {
            if (!validColumns.includes(col)) {
                return { success: false, message: `DeleteRows: unknown filter column "${col}"` };
            }
        }

        const stringFilter = {};
        for (const [k, v] of Object.entries(filter)) stringFilter[k] = String(v);
        const { rows: matchingRows } = await pgGetTableRows(projectName, table, {
            filters: stringFilter,
            limit: 10000,
        });
        if (!matchingRows || matchingRows.length === 0) {
            return { success: true, message: 'No rows matched the filter', rowsAffected: 0 };
        }

        let deleted = 0;
        for (const row of matchingRows) {
            const result = await pgDeleteRow(projectName, table, row.rowid);
            deleted += result?.changes ?? 1;
        }
        return {
            success: true,
            message: `Deleted ${deleted} row${deleted !== 1 ? 's' : ''} from ${table}`,
            rowsAffected: deleted,
        };
    } catch (err) {
        return { success: false, message: `DeleteRows: ${err.message}` };
    }
}
