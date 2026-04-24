/**
 * Postgres-backed implementation of the agent data layer.
 *
 * Mirrors the function signatures exported by lib/data.js but stores tables
 * in a JSONB rows layout (no dynamic DDL): data_tables + data_columns +
 * data_rows, per the migration at
 * meadow/supabase/migrations/20260423150000_data_bases.sql.
 *
 * Response shapes intentionally match the SQLite path so callers (IDE routes
 * and jt CLI consumers) do not branch on backend. All exported functions
 * return Promises.
 *
 * Callers select this module via the project's `backend` field in
 * ~/.config/jat/projects.json (see isPostgresProject below). The SQLite path
 * in lib/data.js is the default and handles every other case unchanged.
 */

import pg from 'pg';
import { resolveBackendForProject } from './projects-config.js';

// One pg.Pool per DSN; cheap to share across calls.
/** @type {Map<string, import('pg').Pool>} */
const _pools = new Map();

/** @param {string} projectName */
function getPool(projectName) {
  const { kind, url } = resolveBackendForProject(projectName);
  if (kind !== 'postgres') {
    throw new Error(`Project "${projectName}" is not postgres-backed`);
  }
  if (!url) {
    throw new Error(`Project "${projectName}" has backend=postgres but no backend_url`);
  }
  let pool = _pools.get(url);
  if (!pool) {
    pool = new pg.Pool({ connectionString: url, max: 5 });
    pool.on('error', (err) => console.error('[data-postgres] pool error:', err.message));
    _pools.set(url, pool);
  }
  return pool;
}

/**
 * True when the given project name is configured with backend="postgres".
 * Returns false (never throws) for unknown projects so callers can branch
 * without guard-try.
 * @param {string} projectName
 * @returns {boolean}
 */
export function isPostgresProject(projectName) {
  try {
    return resolveBackendForProject(projectName).kind === 'postgres';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Validation (shared rules; keep in sync with lib/data.js)
// ---------------------------------------------------------------------------

const TABLE_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const RESERVED_PREFIXES = ['sqlite_', '_', 'pg_'];

/** @param {string} name */
export function validateTableName(name) {
  if (!name || typeof name !== 'string') return { valid: false, error: 'Table name required' };
  if (!TABLE_NAME_RE.test(name)) {
    return { valid: false, error: 'Table name must be alphanumeric with underscores, starting with a letter or underscore' };
  }
  for (const p of RESERVED_PREFIXES) {
    if (name.startsWith(p)) return { valid: false, error: `Table name cannot start with "${p}"` };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// System tables (postgres projects have none — all state lives in Supabase)
// ---------------------------------------------------------------------------

/** @param {string} name */
export function isSystemTable(name) {
  // Matches lib/data.js — system tables (tasks.db mirror) do not exist
  // for postgres projects. Kept as a sync guard so callers that branch on
  // this before await-ing a postgres read can short-circuit.
  return false;
}

/** Returns [] for postgres projects; no system-table mirror exists. */
// eslint-disable-next-line no-unused-vars
export async function getSystemTables(_projectName) {
  return [];
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/**
 * List agent tables with row counts. Response shape matches SQLite path:
 *   [{ name, display_name, description, row_count, column_count, created_at, updated_at }]
 * @param {string} projectName
 */
export async function getDataTables(projectName) {
  const pool = getPool(projectName);
  // Single query with LEFT JOIN aggregates to avoid N+1.
  const sql = `
    SELECT
      t.name,
      t.display_name,
      t.description,
      t.created_at,
      t.updated_at,
      COALESCE(r.row_count, 0) AS row_count,
      COALESCE(c.column_count, 0) AS column_count
    FROM data_tables t
    LEFT JOIN (
      SELECT table_name, COUNT(*)::int AS row_count
      FROM data_rows
      GROUP BY table_name
    ) r ON r.table_name = t.name
    LEFT JOIN (
      SELECT table_name, COUNT(*)::int AS column_count
      FROM data_columns
      GROUP BY table_name
    ) c ON c.table_name = t.name
    ORDER BY t.name
  `;
  const { rows } = await pool.query(sql);
  return rows.map((r) => ({
    name: r.name,
    display_name: r.display_name || r.name,
    description: r.description || '',
    row_count: Number(r.row_count),
    column_count: Number(r.column_count),
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }));
}

/**
 * Return column metadata for a table. Shape matches the SQLite-path
 * output of getTableSchema: an array of {cid, name, type, notnull,
 * dflt_value, pk, semanticType, config, displayName, columnDescription}.
 * @param {string} projectName
 * @param {string} tableName
 */
export async function getTableSchema(projectName, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const pool = getPool(projectName);
  const { rows } = await pool.query(
    `SELECT column_name, semantic_type, config, display_name, description
       FROM data_columns
      WHERE table_name = $1
      ORDER BY column_name`,
    [tableName]
  );

  return rows.map((r, i) => ({
    cid: i,
    name: r.column_name,
    type: semanticToSqliteType(r.semantic_type),
    notnull: 0,
    dflt_value: null,
    pk: 0,
    semanticType: r.semantic_type,
    config: r.config || {},
    displayName: r.display_name,
    columnDescription: r.description,
  }));
}

/**
 * Column metadata as returned by lib/data.js getColumnMetadata.
 * Shape: [{table_name, column_name, semantic_type, config, display_name, description, ...}]
 * @param {string} projectName
 * @param {string} tableName
 */
export async function getColumnMetadata(projectName, tableName) {
  const pool = getPool(projectName);
  const { rows } = await pool.query(
    `SELECT table_name, column_name, semantic_type, config, display_name, description,
            created_at, updated_at
       FROM data_columns
      WHERE table_name = $1
      ORDER BY column_name`,
    [tableName]
  );
  return rows.map((r) => ({
    table_name: r.table_name,
    column_name: r.column_name,
    semantic_type: r.semantic_type,
    config: r.config || {},
    display_name: r.display_name,
    description: r.description,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }));
}

/**
 * Paginate rows for a table. Returns { rows, total }.
 * Each row is the flattened JSONB data + a `rowid` alias so the IDE
 * front-end (which treats `rowid` as the stable row id) continues working.
 *
 * Supports: limit, offset, orderBy (any JSONB key or "rowid"/"id"), orderDir,
 * filters (equality on JSONB keys), search (ILIKE across all JSONB values).
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {{limit?:number, offset?:number, orderBy?:string, orderDir?:string, filters?:Record<string,string>, search?:string}} [opts]
 */
export async function getTableRows(projectName, tableName, opts = {}) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const { limit = 100, offset = 0, orderBy, orderDir = 'ASC', filters = {}, search } = opts;
  const pool = getPool(projectName);

  /** @type {any[]} */
  const params = [tableName];
  const where = ['table_name = $1'];

  for (const [col, val] of Object.entries(filters || {})) {
    if (val == null || val === '') continue;
    params.push(String(val));
    where.push(`data->>${quoteIdent(col)} = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    // Cast the whole JSONB blob to text for a cheap cross-column ILIKE.
    // This avoids PostgREST's "operator does not exist: uuid ~~* unknown"
    // trap documented in meadow-qdroy.10 — we never ILIKE typed columns,
    // only the JSONB serialization.
    where.push(`data::text ILIKE $${params.length}`);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM data_rows ${whereSql}`,
    params
  );
  const total = Number(countRes.rows[0]?.cnt ?? 0);

  let orderSql = 'ORDER BY created_at ASC';
  if (orderBy) {
    const dir = String(orderDir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (orderBy === 'rowid' || orderBy === 'id') {
      orderSql = `ORDER BY id ${dir}`;
    } else {
      orderSql = `ORDER BY data->>${quoteIdent(orderBy)} ${dir}`;
    }
  }

  params.push(limit);
  params.push(offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const sql = `
    SELECT id, data, created_at, updated_at
    FROM data_rows
    ${whereSql}
    ${orderSql}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;
  const { rows } = await pool.query(sql, params);

  return {
    rows: rows.map((r) => flattenRow(r)),
    total,
  };
}

/**
 * Insert a row. Returns { rowid: <uuid-string> }.
 * @param {string} projectName
 * @param {string} tableName
 * @param {Record<string, any>} data
 */
export async function insertRow(projectName, tableName, data) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const pool = getPool(projectName);
  const { rows } = await pool.query(
    `INSERT INTO data_rows (table_name, data) VALUES ($1, $2::jsonb) RETURNING id`,
    [tableName, JSON.stringify(stripMeta(data))]
  );
  await touchTable(pool, tableName);
  return { rowid: rows[0].id };
}

/** @param {string} projectName @param {string} tableName @param {string} rowid @param {Record<string,any>} data */
export async function updateRow(projectName, tableName, rowid, data) {
  const pool = getPool(projectName);
  const result = await pool.query(
    `UPDATE data_rows
        SET data = data || $3::jsonb, updated_at = now()
      WHERE table_name = $1 AND id = $2::uuid`,
    [tableName, String(rowid), JSON.stringify(stripMeta(data))]
  );
  return { changes: result.rowCount ?? 0 };
}

/** @param {string} projectName @param {string} tableName @param {string} rowid */
export async function deleteRow(projectName, tableName, rowid) {
  const pool = getPool(projectName);
  const result = await pool.query(
    `DELETE FROM data_rows WHERE table_name = $1 AND id = $2::uuid`,
    [tableName, String(rowid)]
  );
  return { changes: result.rowCount ?? 0 };
}

/**
 * Create a new agent table. Inserts into data_tables + bulk-inserts
 * column definitions into data_columns. No DDL is executed (JSONB layout).
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {Array<{name:string, type?:string, semanticType?:string, config?:object, displayName?:string, description?:string}>} columns
 * @param {{displayName?:string, description?:string}} [opts]
 */
export async function createDataTable(projectName, tableName, columns, opts = {}) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);
  if (!columns || columns.length === 0) {
    throw new Error('At least one column is required');
  }

  const pool = getPool(projectName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const exists = await client.query(
      'SELECT 1 FROM data_tables WHERE name = $1',
      [tableName]
    );
    if (exists.rowCount) {
      throw new Error(`Table "${tableName}" already exists`);
    }

    await client.query(
      `INSERT INTO data_tables (name, display_name, description)
       VALUES ($1, $2, $3)`,
      [tableName, opts.displayName ?? null, opts.description ?? null]
    );

    for (const col of columns) {
      const cv = validateTableName(col.name);
      if (!cv.valid) throw new Error(`Invalid column name "${col.name}"`);
      const semantic = col.semanticType || col.type || 'text';
      await client.query(
        `INSERT INTO data_columns (table_name, column_name, semantic_type, config, display_name, description)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
        [
          tableName,
          col.name,
          semantic,
          JSON.stringify(col.config || {}),
          col.displayName ?? null,
          col.description ?? null,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Drop an agent table. ON DELETE CASCADE removes data_rows and data_columns.
 * @param {string} projectName
 * @param {string} tableName
 */
export async function dropDataTable(projectName, tableName) {
  const pool = getPool(projectName);
  // data_rows references data_tables(name) ON DELETE CASCADE.
  // data_columns does NOT have FK cascade — delete metadata explicitly.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM data_columns WHERE table_name = $1', [tableName]);
    const res = await client.query('DELETE FROM data_tables WHERE name = $1', [tableName]);
    await client.query('COMMIT');
    if (res.rowCount === 0) throw new Error(`Table "${tableName}" not found`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

/**
 * List saved views across all tables.
 * Shape mirrors lib/data.js getAllViews: [{id, name, table_name, description, config, ...}].
 * @param {string} projectName
 */
export async function getAllViews(projectName) {
  const pool = getPool(projectName);
  const { rows } = await pool.query(
    `SELECT id, name, table_name, description, query_config, created_at, updated_at
       FROM data_views
      ORDER BY table_name, name`
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    table_name: r.table_name,
    description: r.description,
    config: r.query_config || {},
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }));
}

// ---------------------------------------------------------------------------
// SQL translation: queryDataTable + execDataSql
//
// v1 supports a deliberately tight subset so agents get sensible errors
// rather than silent corruption when they hand-roll SQL that assumes the
// SQLite table layout. Supported:
//
//   SELECT [cols | *] FROM <table> [WHERE col = val [AND …]]
//                                   [ORDER BY col [ASC|DESC]]
//                                   [LIMIT N [OFFSET M]]
//   INSERT INTO <table> (col, …) VALUES (val, …)
//   UPDATE <table> SET col = val [, …] [WHERE col = val [AND …]]
//   DELETE FROM <table> [WHERE col = val [AND …]]
//
// JOINs, subqueries, aggregates, and functions are rejected with a clear
// error pointing agents at the REST helpers (getTableRows, insertRow, …).
// ---------------------------------------------------------------------------

const WRITE_RE = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE)\b/i;
const ALLOWED_WRITE_RE = /^\s*(INSERT|UPDATE|DELETE)\b/i;

/** @param {string} projectName @param {string} sql */
export async function queryDataTable(projectName, sql) {
  if (WRITE_RE.test(sql)) {
    throw new Error('Write operations not allowed in query mode. Use execDataSql() instead.');
  }
  const parsed = parseSelect(sql);
  const pool = getPool(projectName);

  const params = [parsed.table];
  const where = ['table_name = $1'];
  for (const [col, val] of parsed.where) {
    params.push(val);
    where.push(`data->>${quoteIdent(col)} = $${params.length}`);
  }

  const selectSql = parsed.columns === '*'
    ? 'id, data'
    : `id, jsonb_build_object(${
        parsed.columns.map((c) => `${quoteIdent(c)}, data->${quoteIdent(c)}`).join(', ')
      }) AS data`;

  let orderSql = 'ORDER BY created_at ASC';
  if (parsed.orderBy) {
    orderSql = `ORDER BY data->>${quoteIdent(parsed.orderBy.col)} ${parsed.orderBy.dir}`;
  }

  const limit = Math.min(parsed.limit ?? 100, 10000);
  const fullSql = `
    SELECT ${selectSql}, created_at, updated_at
      FROM data_rows
     WHERE ${where.join(' AND ')}
     ${orderSql}
     LIMIT ${limit}
     ${parsed.offset ? `OFFSET ${parsed.offset}` : ''}
  `;
  const { rows } = await pool.query(fullSql, params);
  return rows.map((r) => flattenRow(r));
}

/** @param {string} projectName @param {string} sql */
export async function execDataSql(projectName, sql) {
  if (!ALLOWED_WRITE_RE.test(sql)) {
    throw new Error('Only INSERT, UPDATE, DELETE statements are allowed');
  }
  const pool = getPool(projectName);
  const stmt = sql.trim().replace(/;\s*$/, '');
  const head = stmt.match(/^\s*(INSERT|UPDATE|DELETE)/i)?.[1]?.toUpperCase();

  if (head === 'INSERT') {
    const { table, data } = parseInsert(stmt);
    const res = await pool.query(
      `INSERT INTO data_rows (table_name, data) VALUES ($1, $2::jsonb)`,
      [table, JSON.stringify(data)]
    );
    await touchTable(pool, table);
    return { changes: res.rowCount ?? 0 };
  }

  if (head === 'UPDATE') {
    const { table, set, where } = parseUpdate(stmt);
    const params = [table, JSON.stringify(set)];
    const conds = ['table_name = $1'];
    for (const [col, val] of where) {
      params.push(val);
      conds.push(`data->>${quoteIdent(col)} = $${params.length}`);
    }
    const res = await pool.query(
      `UPDATE data_rows SET data = data || $2::jsonb, updated_at = now() WHERE ${conds.join(' AND ')}`,
      params
    );
    if (res.rowCount) await touchTable(pool, table);
    return { changes: res.rowCount ?? 0 };
  }

  if (head === 'DELETE') {
    const { table, where } = parseDelete(stmt);
    const params = [table];
    const conds = ['table_name = $1'];
    for (const [col, val] of where) {
      params.push(val);
      conds.push(`data->>${quoteIdent(col)} = $${params.length}`);
    }
    const res = await pool.query(
      `DELETE FROM data_rows WHERE ${conds.join(' AND ')}`,
      params
    );
    if (res.rowCount) await touchTable(pool, table);
    return { changes: res.rowCount ?? 0 };
  }

  throw new Error('Unsupported statement');
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/**
 * Map semantic types to the SQLite-path `type` string used by UI code.
 * @param {string|null|undefined} semantic
 */
function semanticToSqliteType(semantic) {
  switch (semantic) {
    case 'integer':
    case 'int':
      return 'INTEGER';
    case 'number':
    case 'float':
      return 'REAL';
    case 'boolean':
    case 'bool':
      return 'INTEGER';
    case 'json':
      return 'TEXT';
    default:
      return 'TEXT';
  }
}

/** Flatten a data_rows record { id, data, created_at, updated_at } into the shape SQLite consumers expect. */
function flattenRow(r) {
  const data = r.data && typeof r.data === 'object' ? r.data : {};
  return {
    ...data,
    rowid: r.id,
    id: r.id,
    _created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    _updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  };
}

/** Remove internal meta keys before we write user data into the JSONB blob. */
function stripMeta(data) {
  if (!data || typeof data !== 'object') return {};
  const { rowid, id, _created_at, _updated_at, ...rest } = data;
  return rest;
}

/** Identifier quoting for `data->>'col'` paths inside dynamic SQL. */
function quoteIdent(name) {
  return `'${String(name).replace(/'/g, "''")}'`;
}

/** Bump data_tables.updated_at so UI "recently modified" indicators work. */
async function touchTable(pool, tableName) {
  try {
    await pool.query('UPDATE data_tables SET updated_at = now() WHERE name = $1', [tableName]);
  } catch { /* best-effort */ }
}

// ---- SQL parsers (tight, positive-match only) -----------------------------

function parseSelect(sql) {
  const stripped = sql.trim().replace(/;\s*$/, '');
  const m = stripped.match(
    /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+([a-zA-Z_][a-zA-Z0-9_]*)(\s+(?:ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?\s*$/is
  );
  if (!m) {
    throw new Error('Unsupported SELECT. v1 supports: SELECT cols|* FROM <table> [WHERE col=val] [ORDER BY col] [LIMIT N] [OFFSET M]');
  }
  const [, colsPart, table, wherePart, orderCol, orderDir, limit, offset] = m;
  if (/\bJOIN\b|\bGROUP\b|\bHAVING\b|\bUNION\b|\(/i.test(colsPart + (wherePart || ''))) {
    throw new Error('JOIN, GROUP, HAVING, UNION, and subqueries are not supported. Use the REST helpers instead.');
  }
  const columns = colsPart.trim() === '*'
    ? '*'
    : colsPart.split(',').map((c) => c.trim().replace(/^["'`]|["'`]$/g, ''));
  const where = wherePart ? parseWhere(wherePart) : [];
  return {
    table,
    columns,
    where,
    orderBy: orderCol ? { col: orderCol, dir: (orderDir || 'ASC').trim().toUpperCase() } : null,
    limit: limit ? Number(limit) : null,
    offset: offset ? Number(offset) : null,
  };
}

function parseInsert(sql) {
  const m = sql.match(
    /^INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*$/is
  );
  if (!m) throw new Error('Unsupported INSERT. Format: INSERT INTO <table> (col, …) VALUES (val, …)');
  const [, table, colsPart, valsPart] = m;
  const cols = colsPart.split(',').map((c) => c.trim().replace(/^["'`]|["'`]$/g, ''));
  const vals = splitValues(valsPart);
  if (cols.length !== vals.length) {
    throw new Error(`Column/value count mismatch: ${cols.length} cols vs ${vals.length} vals`);
  }
  /** @type {Record<string, any>} */
  const data = {};
  for (let i = 0; i < cols.length; i++) data[cols[i]] = parseLiteral(vals[i]);
  return { table, data };
}

function parseUpdate(sql) {
  const m = sql.match(
    /^UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?\s*$/is
  );
  if (!m) throw new Error('Unsupported UPDATE. Format: UPDATE <table> SET col=val [, …] [WHERE col=val]');
  const [, table, setPart, wherePart] = m;
  /** @type {Record<string, any>} */
  const set = {};
  for (const piece of splitTopLevel(setPart, ',')) {
    const eq = piece.indexOf('=');
    if (eq === -1) throw new Error(`Malformed SET assignment: ${piece}`);
    const col = piece.slice(0, eq).trim().replace(/^["'`]|["'`]$/g, '');
    const val = piece.slice(eq + 1).trim();
    set[col] = parseLiteral(val);
  }
  const where = wherePart ? parseWhere(wherePart) : [];
  return { table, set, where };
}

function parseDelete(sql) {
  const m = sql.match(
    /^DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+WHERE\s+(.+))?\s*$/is
  );
  if (!m) throw new Error('Unsupported DELETE. Format: DELETE FROM <table> [WHERE col=val]');
  const [, table, wherePart] = m;
  return { table, where: wherePart ? parseWhere(wherePart) : [] };
}

/** Parse `col = val [AND col = val ...]` into [[col, val], ...]. */
function parseWhere(src) {
  /** @type {Array<[string, any]>} */
  const out = [];
  for (const piece of splitTopLevel(src, /\s+AND\s+/i)) {
    const eq = piece.indexOf('=');
    if (eq === -1) throw new Error(`Unsupported WHERE clause (v1 only supports "col = val" joined by AND): ${piece}`);
    const col = piece.slice(0, eq).trim().replace(/^["'`]|["'`]$/g, '');
    const val = piece.slice(eq + 1).trim();
    out.push([col, parseLiteral(val)]);
  }
  return out;
}

function parseLiteral(src) {
  const s = src.trim();
  if (/^NULL$/i.test(s)) return null;
  if (/^-?\d+$/.test(s)) return Number(s);
  if (/^-?\d+\.\d+$/.test(s)) return Number(s);
  if (/^(TRUE|FALSE)$/i.test(s)) return /^TRUE$/i.test(s);
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/""/g, '"');
  // Bare identifier treated as string (agents sometimes forget quotes)
  return s;
}

/** Split on top-level commas (ignoring commas inside quoted strings/parens). */
function splitValues(src) {
  return splitTopLevel(src, ',');
}

/** Split `src` by `sep` (string or /regex/), ignoring matches inside quoted strings. */
function splitTopLevel(src, sep) {
  /** @type {string[]} */
  const out = [];
  let buf = '';
  let inSingle = false;
  let inDouble = false;
  let i = 0;
  const isSepRe = sep instanceof RegExp;
  const sepLen = isSepRe ? 0 : /** @type {string} */ (sep).length;

  while (i < src.length) {
    const ch = src[i];
    if (!inDouble && ch === "'") { inSingle = !inSingle; buf += ch; i++; continue; }
    if (!inSingle && ch === '"') { inDouble = !inDouble; buf += ch; i++; continue; }
    if (!inSingle && !inDouble) {
      if (isSepRe) {
        const rest = src.slice(i);
        const m = rest.match(/** @type {RegExp} */ (sep));
        if (m && m.index === 0) {
          out.push(buf); buf = '';
          i += m[0].length;
          continue;
        }
      } else if (src.startsWith(/** @type {string} */ (sep), i)) {
        out.push(buf); buf = '';
        i += sepLen;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  out.push(buf);
  return out.map((s) => s.trim()).filter((s) => s.length > 0);
}
