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
  try {
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
  } catch (err) {
    if (err.code === '42P01') return []; // tables not yet migrated
    throw err;
  }
}

/**
 * Get a single agent table's metadata + counts. Returns null if missing.
 * Shape matches getDataTables entries.
 * @param {string} projectName
 * @param {string} tableName
 */
export async function getDataTable(projectName, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const pool = getPool(projectName);
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
      WHERE table_name = $1
      GROUP BY table_name
    ) r ON r.table_name = t.name
    LEFT JOIN (
      SELECT table_name, COUNT(*)::int AS column_count
      FROM data_columns
      WHERE table_name = $1
      GROUP BY table_name
    ) c ON c.table_name = t.name
    WHERE t.name = $1
  `;
  try {
    const { rows } = await pool.query(sql, [tableName]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      name: r.name,
      display_name: r.display_name || r.name,
      description: r.description || '',
      row_count: Number(r.row_count),
      column_count: Number(r.column_count),
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
    };
  } catch (err) {
    if (err.code === '42P01') return null; // tables not yet migrated
    throw err;
  }
}

/**
 * Update a table's display_name and/or description. Only fields explicitly
 * provided in `opts` are written (undefined = leave unchanged).
 * @param {string} projectName
 * @param {string} tableName
 * @param {{displayName?: string|null, description?: string|null}} opts
 */
export async function updateDataTable(projectName, tableName, opts = {}) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const pool = getPool(projectName);
  const fields = [];
  const params = [];
  if (opts.displayName !== undefined) {
    params.push(opts.displayName);
    fields.push(`display_name = $${params.length}`);
  }
  if (opts.description !== undefined) {
    params.push(opts.description);
    fields.push(`description = $${params.length}`);
  }
  if (fields.length === 0) return { updated: false };

  fields.push('updated_at = now()');
  params.push(tableName);
  const result = await pool.query(
    `UPDATE data_tables SET ${fields.join(', ')} WHERE name = $${params.length}`,
    params
  );
  return { updated: (result.rowCount ?? 0) > 0 };
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
  // Hide reserved metadata rows (e.g. `__conditional_format__`) from schema.
  // The sqlite path naturally avoids this because it derives schema from
  // pragma table_info, which never sees reserved-only metadata. The pg
  // backend has no DDL — schema is derived from data_columns — so we filter
  // here to keep parity. Convention: reserved column names are wrapped in
  // double-underscores (`__name__`).
  const { rows } = await pool.query(
    `SELECT column_name, semantic_type, config, display_name, description
       FROM data_columns
      WHERE table_name = $1
        AND column_name NOT LIKE '\\_\\_%' ESCAPE '\\'
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
 * Upsert semantic metadata for a single column. Mirrors the SQLite
 * setColumnMetadata signature (lib/data.js) so callers don't branch.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} columnName
 * @param {string} semanticType
 * @param {object} [config]
 * @param {{displayName?:string|null, description?:string|null}} [opts]
 */
export async function setColumnMetadata(projectName, tableName, columnName, semanticType, config = {}, opts = {}) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);

  const pool = getPool(projectName);
  await pool.query(
    `INSERT INTO data_columns (table_name, column_name, semantic_type, config, display_name, description)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6)
     ON CONFLICT (table_name, column_name) DO UPDATE SET
       semantic_type = EXCLUDED.semantic_type,
       config = EXCLUDED.config,
       display_name = COALESCE(EXCLUDED.display_name, data_columns.display_name),
       description = COALESCE(EXCLUDED.description, data_columns.description),
       updated_at = now()`,
    [
      tableName,
      columnName,
      semanticType,
      JSON.stringify(config || {}),
      opts.displayName ?? null,
      opts.description ?? null,
    ]
  );
}

/**
 * Delete metadata for a single column. No-op if the row doesn't exist.
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} columnName
 */
export async function deleteColumnMetadata(projectName, tableName, columnName) {
  const pool = getPool(projectName);
  await pool.query(
    `DELETE FROM data_columns WHERE table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
}

// ---------------------------------------------------------------------------
// Column operations (add / delete / duplicate / rename)
//
// In the JSONB-rows layout these are metadata-only against `data_columns`
// plus a single `data_rows.data` rewrite for delete/duplicate/rename so the
// stored row payloads stay in sync with the column list. SQLite signatures
// take a `sqliteType` arg for ALTER TABLE; on the postgres side that arg is
// ignored — the JSONB blob is untyped at storage and semantic_type carries
// the user-visible type.
// ---------------------------------------------------------------------------

/**
 * Add a column to a table. Inserts into data_columns; no row rewrite needed
 * because absent JSONB keys read as NULL through `data->>'col'`. The
 * `sqliteType` arg is accepted for signature parity with lib/data.js but
 * ignored — postgres rows are JSONB.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} columnName
 * @param {string} [_sqliteType]  ignored (signature parity with sqlite path)
 * @param {string} [semanticType]
 * @param {object} [config]
 */
// eslint-disable-next-line no-unused-vars
export async function addColumn(projectName, tableName, columnName, _sqliteType, semanticType, config = {}) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateTableName(columnName);
  if (!vc.valid) throw new Error(`Invalid column name "${columnName}"`);

  const pool = getPool(projectName);
  const dup = await pool.query(
    `SELECT 1 FROM data_columns WHERE table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  if (dup.rowCount) {
    throw new Error(`Column "${columnName}" already exists in table "${tableName}"`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO data_columns (table_name, column_name, semantic_type, config, display_name, description)
       VALUES ($1, $2, $3, $4::jsonb, NULL, NULL)`,
      [tableName, columnName, semanticType || 'text', JSON.stringify(config || {})]
    );
    await touchTable(client, tableName);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete a column. Removes the metadata row and strips the JSONB key from
 * every row in the table inside one transaction. Errors if it would leave
 * the table with zero columns.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} columnName
 */
export async function deleteColumn(projectName, tableName, columnName) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);

  const pool = getPool(projectName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cols = await client.query(
      `SELECT column_name FROM data_columns WHERE table_name = $1`,
      [tableName]
    );
    if (cols.rowCount <= 1) {
      throw new Error('Cannot delete the last column');
    }
    if (!cols.rows.some((r) => r.column_name === columnName)) {
      throw new Error(`Column "${columnName}" not found in table "${tableName}"`);
    }

    await client.query(
      `DELETE FROM data_columns WHERE table_name = $1 AND column_name = $2`,
      [tableName, columnName]
    );
    // Strip the key from every row's JSONB payload.
    await client.query(
      `UPDATE data_rows SET data = data - $2, updated_at = now() WHERE table_name = $1`,
      [tableName, columnName]
    );
    await touchTable(client, tableName);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Duplicate a column (metadata + per-row JSONB value) under a new name.
 * Single transaction.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} sourceColumn
 * @param {string} newName
 */
export async function duplicateColumn(projectName, tableName, sourceColumn, newName) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateTableName(newName);
  if (!vc.valid) throw new Error(`Invalid column name "${newName}"`);

  const pool = getPool(projectName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const src = await client.query(
      `SELECT semantic_type, config, display_name, description
         FROM data_columns
        WHERE table_name = $1 AND column_name = $2`,
      [tableName, sourceColumn]
    );
    if (src.rowCount === 0) {
      throw new Error(`Source column "${sourceColumn}" not found`);
    }

    const dup = await client.query(
      `SELECT 1 FROM data_columns WHERE table_name = $1 AND column_name = $2`,
      [tableName, newName]
    );
    if (dup.rowCount) {
      throw new Error(`Column "${newName}" already exists`);
    }

    const meta = src.rows[0];
    await client.query(
      `INSERT INTO data_columns (table_name, column_name, semantic_type, config, display_name, description)
       VALUES ($1, $2, $3, $4::jsonb, NULL, NULL)`,
      [tableName, newName, meta.semantic_type, JSON.stringify(meta.config || {})]
    );

    // Copy the source key's value into the new key on every row that has it.
    await client.query(
      `UPDATE data_rows
          SET data = data || jsonb_build_object($3::text, data->$2),
              updated_at = now()
        WHERE table_name = $1 AND data ? $2`,
      [tableName, sourceColumn, newName]
    );
    await touchTable(client, tableName);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Rename a column. Updates data_columns.column_name and rewrites the JSONB
 * key on every matching row (drop old key, set new key with the same value)
 * inside one transaction.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} oldName
 * @param {string} newName
 */
export async function renameColumn(projectName, tableName, oldName, newName) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateTableName(newName);
  if (!vc.valid) throw new Error(`Invalid column name "${newName}"`);

  const pool = getPool(projectName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const exists = await client.query(
      `SELECT 1 FROM data_columns WHERE table_name = $1 AND column_name = $2`,
      [tableName, oldName]
    );
    if (exists.rowCount === 0) {
      throw new Error(`Column "${oldName}" not found in table "${tableName}"`);
    }

    const dup = await client.query(
      `SELECT 1 FROM data_columns WHERE table_name = $1 AND column_name = $2`,
      [tableName, newName]
    );
    if (dup.rowCount) {
      throw new Error(`Column "${newName}" already exists in table "${tableName}"`);
    }

    await client.query(
      `UPDATE data_columns
          SET column_name = $3, updated_at = now()
        WHERE table_name = $1 AND column_name = $2`,
      [tableName, oldName, newName]
    );

    // Move the key on every row that has it: drop old, set new with prior value.
    await client.query(
      `UPDATE data_rows
          SET data = (data - $2) || jsonb_build_object($3::text, data->$2),
              updated_at = now()
        WHERE table_name = $1 AND data ? $2`,
      [tableName, oldName, newName]
    );
    await touchTable(client, tableName);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Bulk insert rows into a table inside a single transaction.
 * Used by the migrate-to-postgres path and the bulk-insert endpoint.
 * Returns { inserted, rowids }. Each row's metadata keys (id, rowid,
 * _created_at, _updated_at) are stripped before storage.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {Array<Record<string, any>>} rows
 */
export async function insertRows(projectName, tableName, rows) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No rows provided');
  }

  const pool = getPool(projectName);
  const client = await pool.connect();
  const rowids = [];
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const { rows: ret } = await client.query(
        `INSERT INTO data_rows (table_name, data) VALUES ($1, $2::jsonb) RETURNING id`,
        [tableName, JSON.stringify(stripMeta(row))]
      );
      rowids.push(ret[0].id);
    }
    await touchTable(client, tableName);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return { inserted: rowids.length, rowids };
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

/**
 * Fetch a single row by its UUID. Returns null when the row is missing
 * or the rowid is not a valid uuid.
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} rowid
 */
export async function getRow(projectName, tableName, rowid) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  if (!isValidUuid(rowid)) return null;

  const pool = getPool(projectName);
  const { rows } = await pool.query(
    `SELECT id, data, created_at, updated_at
       FROM data_rows
      WHERE table_name = $1 AND id = $2::uuid`,
    [tableName, String(rowid)]
  );
  if (rows.length === 0) return null;
  return flattenRow(rows[0]);
}

/** @param {string} projectName @param {string} tableName @param {string} rowid @param {Record<string,any>} data */
export async function updateRow(projectName, tableName, rowid, data) {
  if (!isValidUuid(rowid)) return { changes: 0 };
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
  if (!isValidUuid(rowid)) return { changes: 0 };
  const pool = getPool(projectName);
  const result = await pool.query(
    `DELETE FROM data_rows WHERE table_name = $1 AND id = $2::uuid`,
    [tableName, String(rowid)]
  );
  return { changes: result.rowCount ?? 0 };
}

/**
 * Update a single JSONB key across many rows in one transaction. Mirrors
 * lib/data.js batchUpdateRows. Used by structural undo to restore a column
 * after an undo-delete-column.
 *
 * Skips updates whose rowid is not a valid uuid — they cannot exist in
 * data_rows (id is uuid). Returns { updated } as a count of attempted
 * rows that resolved to a valid uuid (matches the sqlite return shape,
 * which counts the input array length on success).
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {string} column
 * @param {Array<{rowid: string, value: any}>} updates
 */
export async function batchUpdateRows(projectName, tableName, column, updates) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);
  if (!Array.isArray(updates) || updates.length === 0) return { updated: 0 };

  const pool = getPool(projectName);
  const client = await pool.connect();
  let attempted = 0;
  try {
    await client.query('BEGIN');
    for (const { rowid, value } of updates) {
      if (!isValidUuid(rowid)) continue;
      attempted += 1;
      // jsonb_set creates the key if missing and overwrites if present.
      // Wrap the value as a json fragment so non-string values keep their type.
      await client.query(
        `UPDATE data_rows
            SET data = jsonb_set(data, ARRAY[$3]::text[], $4::jsonb, true),
                updated_at = now()
          WHERE table_name = $1 AND id = $2::uuid`,
        [tableName, String(rowid), column, JSON.stringify(value ?? null)]
      );
    }
    await touchTable(client, tableName);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return { updated: attempted };
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

/**
 * Rename a user data table. Mirrors lib/data.js renameDataTable.
 *
 * data_rows.table_name has a FK to data_tables(name) without ON UPDATE
 * CASCADE, so we can't just `UPDATE data_tables SET name = ...`. Instead
 * we insert a new parent row, re-point children, then delete the old
 * parent — all inside one transaction.
 *
 * @param {string} projectName
 * @param {string} oldName
 * @param {string} newName
 */
export async function renameDataTable(projectName, oldName, newName) {
  const v1 = validateTableName(oldName);
  if (!v1.valid) throw new Error(v1.error);
  const v2 = validateTableName(newName);
  if (!v2.valid) throw new Error(v2.error);
  if (oldName === newName) return;

  const pool = getPool(projectName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const src = await client.query('SELECT 1 FROM data_tables WHERE name = $1', [oldName]);
    if (src.rowCount === 0) throw new Error(`Table "${oldName}" not found`);

    const dst = await client.query('SELECT 1 FROM data_tables WHERE name = $1', [newName]);
    if (dst.rowCount) throw new Error(`Table "${newName}" already exists`);

    // Insert new parent row first so FK from data_rows can be re-pointed.
    await client.query(
      `INSERT INTO data_tables (name, display_name, description, created_at, updated_at)
       SELECT $1, display_name, description, created_at, now()
         FROM data_tables WHERE name = $2`,
      [newName, oldName]
    );
    await client.query(
      `UPDATE data_rows SET table_name = $1, updated_at = now() WHERE table_name = $2`,
      [newName, oldName]
    );
    await client.query(
      `UPDATE data_columns SET table_name = $1, updated_at = now() WHERE table_name = $2`,
      [newName, oldName]
    );
    // No remaining children point at oldName; cascade is a no-op.
    await client.query('DELETE FROM data_tables WHERE name = $1', [oldName]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Duplicate a user data table (metadata + columns + rows).
 * Mirrors lib/data.js duplicateDataTable: appends " (copy)" to display_name
 * and gives the new table a fresh row id set (data_rows.id defaults to
 * gen_random_uuid()).
 *
 * @param {string} projectName
 * @param {string} sourceName
 * @param {string} newName
 */
export async function duplicateDataTable(projectName, sourceName, newName) {
  const v1 = validateTableName(sourceName);
  if (!v1.valid) throw new Error(v1.error);
  const v2 = validateTableName(newName);
  if (!v2.valid) throw new Error(v2.error);

  const pool = getPool(projectName);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const src = await client.query(
      'SELECT display_name, description FROM data_tables WHERE name = $1',
      [sourceName]
    );
    if (src.rowCount === 0) throw new Error(`Table "${sourceName}" not found`);

    const dst = await client.query('SELECT 1 FROM data_tables WHERE name = $1', [newName]);
    if (dst.rowCount) throw new Error(`Table "${newName}" already exists`);

    const srcMeta = src.rows[0];
    const newDisplay = (srcMeta.display_name || newName) + ' (copy)';

    await client.query(
      `INSERT INTO data_tables (name, display_name, description) VALUES ($1, $2, $3)`,
      [newName, newDisplay, srcMeta.description || null]
    );
    await client.query(
      `INSERT INTO data_columns (table_name, column_name, semantic_type, config, display_name, description)
         SELECT $1, column_name, semantic_type, config, display_name, description
           FROM data_columns WHERE table_name = $2`,
      [newName, sourceName]
    );
    await client.query(
      `INSERT INTO data_rows (table_name, data)
         SELECT $1, data FROM data_rows WHERE table_name = $2`,
      [newName, sourceName]
    );

    await client.query('COMMIT');
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
 * Render a `data_views` row into the SQLite-compatible flattened shape the
 * IDE consumes (filters, filter_conjunction, visible_columns, sort_column,
 * sort_direction, display_name, context_query, context_description).
 *
 * SQLite stores these as top-level columns on `_views`; we keep them in
 * the `query_config` JSONB blob in postgres but expose the same outer
 * shape so the /data UI does not branch on backend.
 */
function flattenView(row) {
  const cfg = row.query_config && typeof row.query_config === 'object' ? row.query_config : {};
  const sortDir = String(cfg.sort_direction || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return {
    id: row.id,
    table_name: row.table_name,
    name: row.name,
    display_name: cfg.display_name ?? row.name,
    description: row.description ?? '',
    filters: Array.isArray(cfg.filters) ? cfg.filters : [],
    filter_conjunction: cfg.filter_conjunction === 'OR' ? 'OR' : 'AND',
    visible_columns: cfg.visible_columns ?? null,
    sort_column: cfg.sort_column ?? null,
    sort_direction: sortDir,
    context_query: cfg.context_query ?? null,
    context_description: cfg.context_description ?? null,
    config: cfg,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

/**
 * Build the `query_config` JSONB blob from caller-supplied data, merging
 * over an existing config. Keys not present in `patch` keep `existing`'s
 * value, so PATCH-style partial updates work without losing state.
 */
function buildViewConfig(patch, existing = null) {
  const next = existing && typeof existing === 'object' ? { ...existing } : {};
  const keys = [
    'display_name', 'filters', 'filter_conjunction',
    'visible_columns', 'sort_column', 'sort_direction',
    'context_query', 'context_description',
  ];
  for (const k of keys) {
    if (k in patch) next[k] = patch[k];
  }
  return next;
}

/** Short random id for views; mirrors lib/data.js generateViewId. */
function generateViewId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/** Filter operators supported by getViewRows (mirrors sqlite filterToSql). */
const FILTER_OPS = new Set([
  'equals', 'not_equals', 'contains', 'not_contains',
  'starts_with', 'ends_with', 'greater_than', 'less_than',
  'greater_equal', 'less_equal', 'is_empty', 'is_not_empty',
]);

/**
 * Translate a single filter rule into a JSONB WHERE fragment.
 * All comparisons are done against `data->>'col'` text values; numeric
 * compares therefore use text order, the same trade-off as getTableRows
 * sort. (Documented in feedback_data_api_jsonb_sort.md.)
 *
 * @param {{column:string, operator:string, value:any}} filter
 * @param {string} colExpr - SQL fragment like `data->>'col'`
 * @param {number} startParamIdx - $N to start emitting at
 */
function jsonbFilterFragment(filter, colExpr, startParamIdx) {
  const val = filter.value;
  const text = String(val ?? '');
  const idx = `$${startParamIdx}`;
  switch (filter.operator) {
    case 'equals':         return { sql: `${colExpr} = ${idx}`,           params: [text] };
    case 'not_equals':     return { sql: `${colExpr} <> ${idx}`,          params: [text] };
    case 'contains':       return { sql: `${colExpr} ILIKE ${idx}`,       params: [`%${text}%`] };
    case 'not_contains':   return { sql: `${colExpr} NOT ILIKE ${idx}`,   params: [`%${text}%`] };
    case 'starts_with':    return { sql: `${colExpr} ILIKE ${idx}`,       params: [`${text}%`] };
    case 'ends_with':      return { sql: `${colExpr} ILIKE ${idx}`,       params: [`%${text}`] };
    case 'greater_than':   return { sql: `${colExpr} > ${idx}`,           params: [text] };
    case 'less_than':      return { sql: `${colExpr} < ${idx}`,           params: [text] };
    case 'greater_equal':  return { sql: `${colExpr} >= ${idx}`,          params: [text] };
    case 'less_equal':     return { sql: `${colExpr} <= ${idx}`,          params: [text] };
    case 'is_empty':       return { sql: `(${colExpr} IS NULL OR ${colExpr} = '')`,           params: [] };
    case 'is_not_empty':   return { sql: `(${colExpr} IS NOT NULL AND ${colExpr} <> '')`,     params: [] };
    default:               return { sql: `${colExpr} = ${idx}`,           params: [text] };
  }
}

/**
 * List saved views across all tables.
 * Shape mirrors lib/data.js getAllViews (flattened top-level fields).
 * @param {string} projectName
 */
export async function getAllViews(projectName) {
  const pool = getPool(projectName);
  try {
    const { rows } = await pool.query(
      `SELECT id, name, table_name, description, query_config, created_at, updated_at
         FROM data_views
        ORDER BY table_name, name`
    );
    return rows.map(flattenView);
  } catch (err) {
    if (err.code === '42P01') return []; // tables not yet migrated
    throw err;
  }
}

/**
 * List views for a single table.
 * @param {string} projectName
 * @param {string} tableName
 */
export async function getViews(projectName, tableName) {
  const pool = getPool(projectName);
  try {
    const { rows } = await pool.query(
      `SELECT id, name, table_name, description, query_config, created_at, updated_at
         FROM data_views
        WHERE table_name = $1
        ORDER BY name`,
      [tableName]
    );
    return rows.map(flattenView);
  } catch (err) {
    if (err.code === '42P01') return [];
    throw err;
  }
}

/**
 * Fetch a single view by id. Returns null if missing.
 * @param {string} projectName
 * @param {string} viewId
 */
export async function getView(projectName, viewId) {
  const pool = getPool(projectName);
  try {
    const { rows } = await pool.query(
      `SELECT id, name, table_name, description, query_config, created_at, updated_at
         FROM data_views
        WHERE id = $1`,
      [viewId]
    );
    if (rows.length === 0) return null;
    return flattenView(rows[0]);
  } catch (err) {
    if (err.code === '42P01') return null;
    throw err;
  }
}

/**
 * Create a saved view on `tableName`.
 *
 * Caller-side fields (filters, filter_conjunction, visible_columns,
 * sort_column, sort_direction, display_name, context_query,
 * context_description) are folded into `query_config` JSONB; the row
 * itself stores id/name/table_name/description as columns.
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {object} data
 */
export async function createView(projectName, tableName, data) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const pool = getPool(projectName);
  const id = data.id || generateViewId();
  const name = data.name || 'Untitled View';
  const description = data.description ?? '';

  const config = buildViewConfig({
    display_name: data.display_name ?? name,
    filters: Array.isArray(data.filters) ? data.filters : [],
    filter_conjunction: data.filter_conjunction === 'OR' ? 'OR' : 'AND',
    visible_columns: data.visible_columns ?? null,
    sort_column: data.sort_column ?? null,
    sort_direction: String(data.sort_direction || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
    context_query: data.context_query ?? null,
    context_description: data.context_description ?? null,
  });

  const { rows } = await pool.query(
    `INSERT INTO data_views (id, name, table_name, description, query_config)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, name, table_name, description, query_config, created_at, updated_at`,
    [id, name, tableName, description, JSON.stringify(config)]
  );
  await touchTable(pool, tableName);
  return flattenView(rows[0]);
}

/**
 * Update a view. Only the fields explicitly present in `data` are written.
 * Caller may pass any mix of column-level (name, description) and
 * config-level fields; config is merged over the existing JSONB.
 *
 * @param {string} projectName
 * @param {string} viewId
 * @param {object} data
 */
export async function updateView(projectName, viewId, data) {
  const pool = getPool(projectName);
  const existing = await pool.query(
    `SELECT id, name, table_name, description, query_config, created_at, updated_at
       FROM data_views
      WHERE id = $1`,
    [viewId]
  );
  if (existing.rows.length === 0) throw new Error(`View not found: ${viewId}`);
  const cur = existing.rows[0];
  const curCfg = cur.query_config && typeof cur.query_config === 'object' ? cur.query_config : {};

  const sets = [];
  const params = [];

  if ('name' in data) {
    params.push(data.name);
    sets.push(`name = $${params.length}`);
  }
  if ('description' in data) {
    params.push(data.description);
    sets.push(`description = $${params.length}`);
  }

  const cfgKeys = [
    'display_name', 'filters', 'filter_conjunction',
    'visible_columns', 'sort_column', 'sort_direction',
    'context_query', 'context_description',
  ];
  const cfgPatch = {};
  for (const k of cfgKeys) if (k in data) cfgPatch[k] = data[k];
  if (Object.keys(cfgPatch).length > 0) {
    const merged = buildViewConfig(cfgPatch, curCfg);
    params.push(JSON.stringify(merged));
    sets.push(`query_config = $${params.length}::jsonb`);
  }

  if (sets.length === 0) {
    // Caller passed no recognized fields — touch updated_at and return current.
    await pool.query(`UPDATE data_views SET updated_at = now() WHERE id = $1`, [viewId]);
    return flattenView(cur);
  }

  sets.push(`updated_at = now()`);
  params.push(viewId);

  const { rows } = await pool.query(
    `UPDATE data_views SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING id, name, table_name, description, query_config, created_at, updated_at`,
    params
  );
  await touchTable(pool, cur.table_name);
  return flattenView(rows[0]);
}

/**
 * Delete a view. Returns { success: boolean }.
 * @param {string} projectName
 * @param {string} viewId
 */
export async function deleteView(projectName, viewId) {
  const pool = getPool(projectName);
  const result = await pool.query(`DELETE FROM data_views WHERE id = $1`, [viewId]);
  return { success: (result.rowCount ?? 0) > 0 };
}

/**
 * Apply a saved view's filters/sort to its underlying table's rows.
 * Mirrors lib/data.js getViewRows return shape: { rows, total, view }.
 *
 * Constraints (v1, mirroring queryDataTable): filters operate on top-level
 * JSONB keys via the operators in FILTER_OPS. The sort follows the same
 * `data->>'col'` text-order trade-off as getTableRows.
 *
 * @param {string} projectName
 * @param {string} viewId
 * @param {{limit?:number, offset?:number, orderBy?:string, orderDir?:string}} [opts]
 */
export async function getViewRows(projectName, viewId, opts = {}) {
  const view = await getView(projectName, viewId);
  if (!view) throw new Error(`View not found: ${viewId}`);

  const tableName = view.table_name;
  const tv = validateTableName(tableName);
  if (!tv.valid) throw new Error(tv.error);

  const pool = getPool(projectName);

  /** @type {any[]} */
  const params = [tableName];
  /** @type {string[]} */
  const filterFragments = [];
  for (const f of view.filters || []) {
    if (!f || !f.column || !f.operator) continue;
    if (!FILTER_OPS.has(f.operator)) continue;
    const colExpr = `data->>${quoteIdent(f.column)}`;
    const { sql, params: fparams } = jsonbFilterFragment(f, colExpr, params.length + 1);
    params.push(...fparams);
    filterFragments.push(sql);
  }

  let filterClause = '';
  if (filterFragments.length > 0) {
    const conj = view.filter_conjunction === 'OR' ? 'OR' : 'AND';
    filterClause = ` AND (${filterFragments.join(` ${conj} `)})`;
  }

  const whereSql = `WHERE table_name = $1${filterClause}`;

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM data_rows ${whereSql}`,
    params
  );
  const total = Number(countRes.rows[0]?.cnt ?? 0);

  // Caller may override the view's sort via opts.orderBy/orderDir.
  const orderBy = opts.orderBy ?? view.sort_column;
  const orderDir = String(opts.orderDir ?? view.sort_direction ?? 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let orderSql = 'ORDER BY created_at ASC';
  if (orderBy) {
    if (orderBy === 'rowid' || orderBy === 'id') {
      orderSql = `ORDER BY id ${orderDir}`;
    } else {
      orderSql = `ORDER BY data->>${quoteIdent(orderBy)} ${orderDir}`;
    }
  }

  const limit = Math.min(Number(opts.limit ?? 100), 10000);
  const offset = Math.max(Number(opts.offset ?? 0), 0);
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
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
    rows: rows.map(flattenRow),
    total,
    view,
  };
}

// ---------------------------------------------------------------------------
// Context views (per-table)
// ---------------------------------------------------------------------------

/**
 * Read per-table context-view metadata.
 * Returns null when the row is missing, or {context_query, context_description}.
 * @param {string} projectName
 * @param {string} tableName
 */
export async function getContextView(projectName, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const pool = getPool(projectName);
  try {
    const { rows } = await pool.query(
      `SELECT context_query, context_description
         FROM data_tables
        WHERE name = $1`,
      [tableName]
    );
    if (rows.length === 0) return null;
    return {
      context_query: rows[0].context_query ?? null,
      context_description: rows[0].context_description ?? null,
    };
  } catch (err) {
    // Pre-migration column missing → behave like sqlite path: empty pair.
    if (err.code === '42703') return { context_query: null, context_description: null };
    if (err.code === '42P01') return null;
    throw err;
  }
}

/**
 * Update per-table context-view metadata. Only fields explicitly present
 * in `input` are written (undefined = leave unchanged).
 *
 * @param {string} projectName
 * @param {string} tableName
 * @param {{context_query?:string|null, context_description?:string|null}} input
 */
export async function setContextView(projectName, tableName, input = {}) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const fields = [];
  const params = [];
  if (input.context_query !== undefined) {
    params.push(input.context_query);
    fields.push(`context_query = $${params.length}`);
  }
  if (input.context_description !== undefined) {
    params.push(input.context_description);
    fields.push(`context_description = $${params.length}`);
  }
  if (fields.length === 0) return { updated: false };

  fields.push('updated_at = now()');
  params.push(tableName);

  const pool = getPool(projectName);
  const result = await pool.query(
    `UPDATE data_tables SET ${fields.join(', ')} WHERE name = $${params.length}`,
    params
  );
  return { updated: (result.rowCount ?? 0) > 0 };
}

/**
 * Preview a context query and render the result as a markdown table.
 * Re-uses queryDataTable's v1 SQL translator so context queries inherit
 * the same JOIN/aggregate restrictions as the rest of the postgres path.
 *
 * @param {string} projectName
 * @param {string} sql
 */
export async function previewContextQuery(projectName, sql) {
  if (!sql || !sql.trim()) {
    return { markdown: '', rowCount: 0, columnCount: 0 };
  }
  const trimmed = sql.trim();
  if (!/^SELECT\b/i.test(trimmed)) {
    throw new Error('Context query must be a SELECT statement');
  }

  const rows = await queryDataTable(projectName, trimmed);
  if (!rows || rows.length === 0) {
    return { markdown: '(no results)', rowCount: 0, columnCount: 0 };
  }

  const sanitize = (val) => {
    const s = String(val ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
    return s.length > 120 ? s.slice(0, 117) + '...' : s;
  };

  // queryDataTable returns flattenRow shape; drop the synthetic meta keys
  // so the markdown table only shows user-selected columns.
  const META = new Set(['rowid', '_created_at', '_updated_at']);
  let cols = Object.keys(rows[0]).filter((c) => !META.has(c));
  if (cols.length === 0) cols = ['id'];

  const header = '| ' + cols.join(' | ') + ' |';
  const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
  const body = rows
    .map((r) => '| ' + cols.map((c) => sanitize(r[c])).join(' | ') + ' |')
    .join('\n');

  return {
    markdown: `${header}\n${separator}\n${body}`,
    rowCount: rows.length,
    columnCount: cols.length,
  };
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

/**
 * Loose-but-strict UUID v1-v5 check used to short-circuit row lookups
 * with non-uuid rowids before they reach `$N::uuid` (which would throw
 * a 22P02 invalid_text_representation).
 * @param {string} s
 */
function isValidUuid(s) {
  if (typeof s !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
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
