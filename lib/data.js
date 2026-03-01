/**
 * JAT Per-Project Data Store
 *
 * Provides user-defined tables in .jat/data.db, separate from tasks.db.
 * Follows the same patterns as lib/tasks.js (openDb, WAL, touchLastTouched).
 */

// @ts-ignore - better-sqlite3 types may not match exactly
import Database from 'better-sqlite3';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA_PATH = new URL('./data-schema.sql', import.meta.url);
let _schemaSQL = null;

function getSchemaSQL() {
  if (!_schemaSQL) {
    _schemaSQL = readFileSync(SCHEMA_PATH, 'utf-8');
  }
  return _schemaSQL;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Touch .jat/last-touched to notify file watchers of a mutation.
 * @param {string} projectPath
 */
function touchLastTouched(projectPath) {
  const sentinel = join(projectPath, '.jat', 'last-touched');
  writeFileSync(sentinel, String(Date.now()));
}

/**
 * Open a database connection with WAL mode and foreign keys enabled.
 * @param {string} dbPath
 * @param {boolean} [readonly=false]
 * @returns {import('better-sqlite3').Database}
 */
function openDb(dbPath, readonly = false) {
  const db = new Database(dbPath, { readonly });
  if (!readonly) {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');
  return db;
}

/** @returns {string} */
function now() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const NAME_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;
const RESERVED_PREFIXES = ['_', 'sqlite_'];
const RESERVED_COLUMNS = ['rowid'];
const ALLOWED_TYPES = ['TEXT', 'INTEGER', 'REAL', 'BLOB', 'NUMERIC'];
const ALLOWED_SEMANTIC_TYPES = [
  'text', 'number', 'boolean', 'date', 'datetime',
  'url', 'email', 'enum', 'currency', 'percentage',
  'relation', 'formula',
];
const SEMANTIC_TO_SQLITE = {
  text: 'TEXT', number: 'REAL', boolean: 'INTEGER',
  date: 'TEXT', datetime: 'TEXT', url: 'TEXT', email: 'TEXT',
  enum: 'TEXT', currency: 'REAL', percentage: 'REAL',
  relation: 'TEXT', formula: 'TEXT',
};

/**
 * Validate a user table name.
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTableName(name) {
  if (!name) return { valid: false, error: 'Table name is required' };
  if (!NAME_RE.test(name)) {
    return { valid: false, error: 'Table name must start with a letter and contain only letters, numbers, and underscores (max 64 chars)' };
  }
  for (const prefix of RESERVED_PREFIXES) {
    if (name.toLowerCase().startsWith(prefix)) {
      return { valid: false, error: `Table name cannot start with "${prefix}"` };
    }
  }
  return { valid: true };
}

/**
 * Validate a column name.
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateColumnName(name) {
  if (!name) return { valid: false, error: 'Column name is required' };
  if (!NAME_RE.test(name)) {
    return { valid: false, error: 'Column name must start with a letter and contain only letters, numbers, and underscores (max 64 chars)' };
  }
  if (RESERVED_COLUMNS.includes(name.toLowerCase())) {
    return { valid: false, error: `"${name}" is a reserved column name` };
  }
  return { valid: true };
}

/**
 * Validate a column type.
 * @param {string} type
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateColumnType(type) {
  if (!type) return { valid: false, error: 'Column type is required' };
  if (!ALLOWED_TYPES.includes(type.toUpperCase())) {
    return { valid: false, error: `Column type must be one of: ${ALLOWED_TYPES.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Validate a semantic type string.
 * @param {string} type
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateSemanticType(type) {
  if (!type) return { valid: false, error: 'Semantic type is required' };
  if (!ALLOWED_SEMANTIC_TYPES.includes(type)) {
    return { valid: false, error: `Semantic type must be one of: ${ALLOWED_SEMANTIC_TYPES.join(', ')}` };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

/**
 * Initialize .jat/data.db with the bootstrap schema.
 * @param {string} projectPath
 * @returns {{ dbPath: string }}
 */
export function initDataDb(projectPath) {
  const jatDir = join(projectPath, '.jat');
  const dbPath = join(jatDir, 'data.db');

  if (!existsSync(jatDir)) {
    mkdirSync(jatDir, { recursive: true });
  }

  const db = openDb(dbPath);
  db.exec(getSchemaSQL());
  db.close();

  return { dbPath };
}

// ---------------------------------------------------------------------------
// Table Operations
// ---------------------------------------------------------------------------

/**
 * List all user data tables with row/column counts.
 * @param {string} projectPath
 * @returns {Array<{name: string, display_name: string, description: string, row_count: number, column_count: number, created_at: string, updated_at: string}>}
 */
export function getDataTables(projectPath) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    const tables = db.prepare('SELECT * FROM _tables ORDER BY name').all();
    const result = [];

    for (const table of tables) {
      // Verify the table actually exists in sqlite_master
      const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table.name);
      if (!exists) continue;

      const rowCount = db.prepare(`SELECT COUNT(*) as cnt FROM "${table.name}"`).get();
      const cols = db.pragma(`table_info("${table.name}")`);
      result.push({
        name: table.name,
        display_name: table.display_name || table.name,
        description: table.description || '',
        row_count: rowCount?.cnt ?? 0,
        column_count: cols.length,
        created_at: table.created_at,
        updated_at: table.updated_at,
      });
    }

    db.close();
    return result;
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Get schema (columns) for a user table, merged with _columns metadata.
 * @param {string} projectPath
 * @param {string} tableName
 * @returns {Array<{cid: number, name: string, type: string, notnull: number, dflt_value: any, pk: number, semanticType?: string, config?: object, displayName?: string, columnDescription?: string}>}
 */
export function getTableSchema(projectPath, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath, true);
  try {
    const cols = db.pragma(`table_info("${tableName}")`);

    // Merge with _columns metadata if the table exists
    const hasColumnsTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_columns'"
    ).get();

    if (hasColumnsTable) {
      const meta = db.prepare(
        'SELECT * FROM _columns WHERE table_name = ?'
      ).all(tableName);
      const metaMap = new Map(meta.map(m => [m.column_name, m]));

      for (const col of cols) {
        const m = metaMap.get(col.name);
        if (m) {
          col.semanticType = m.semantic_type;
          try { col.config = JSON.parse(m.config || '{}'); } catch { col.config = {}; }
          col.displayName = m.display_name;
          col.columnDescription = m.description;
        }
      }
    }

    db.close();
    return cols;
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Create a new user data table.
 * Columns may include semanticType/config; the SQLite type is auto-mapped.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {Array<{name: string, type: string, nullable?: boolean, semanticType?: string, config?: object}>} columns
 * @param {Object} [opts]
 * @param {string} [opts.displayName]
 * @param {string} [opts.description]
 */
export function createDataTable(projectPath, tableName, columns, opts = {}) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  if (!columns || columns.length === 0) {
    throw new Error('At least one column is required');
  }

  // Validate each column — if semanticType is provided, derive SQLite type from it
  for (const col of columns) {
    const cn = validateColumnName(col.name);
    if (!cn.valid) throw new Error(`Column "${col.name}": ${cn.error}`);

    if (col.semanticType) {
      const st = validateSemanticType(col.semanticType);
      if (!st.valid) throw new Error(`Column "${col.name}": ${st.error}`);
      // Override SQLite type from semantic mapping
      col.type = SEMANTIC_TO_SQLITE[col.semanticType];
    } else {
      const ct = validateColumnType(col.type);
      if (!ct.valid) throw new Error(`Column "${col.name}": ${ct.error}`);
    }
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  // Auto-init if needed
  if (!existsSync(dbPath)) {
    initDataDb(projectPath);
  }

  const db = openDb(dbPath);
  try {
    // Check if table already exists
    const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
    if (exists) {
      db.close();
      throw new Error(`Table "${tableName}" already exists`);
    }

    const colDefs = columns.map(col => {
      const nullable = col.nullable !== false ? '' : ' NOT NULL';
      return `"${col.name}" ${col.type.toUpperCase()}${nullable}`;
    }).join(', ');

    db.exec(`CREATE TABLE "${tableName}" (${colDefs})`);

    const ts = now();
    db.prepare('INSERT INTO _tables (name, display_name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(tableName, opts.displayName || tableName, opts.description || '', ts, ts);

    // Insert _columns metadata for columns with semantic types
    const insertMeta = db.prepare(
      'INSERT INTO _columns (table_name, column_name, semantic_type, config, display_name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const col of columns) {
      if (col.semanticType) {
        insertMeta.run(
          tableName, col.name, col.semanticType,
          JSON.stringify(col.config || {}),
          null, null, ts, ts
        );
      }
    }

    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Drop a user data table.
 * @param {string} projectPath
 * @param {string} tableName
 */
export function dropDataTable(projectPath, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    db.exec(`DROP TABLE IF EXISTS "${tableName}"`);
    db.prepare('DELETE FROM _tables WHERE name = ?').run(tableName);
    // Cascade-delete column metadata
    db.prepare('DELETE FROM _columns WHERE table_name = ?').run(tableName);

    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Rename a user data table.
 * @param {string} projectPath
 * @param {string} oldName
 * @param {string} newName
 */
export function renameDataTable(projectPath, oldName, newName) {
  const v1 = validateTableName(oldName);
  if (!v1.valid) throw new Error(v1.error);
  const v2 = validateTableName(newName);
  if (!v2.valid) throw new Error(v2.error);

  if (oldName === newName) return;

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Check source exists
    const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(oldName);
    if (!exists) {
      throw new Error(`Table "${oldName}" not found`);
    }
    // Check destination doesn't exist
    const destExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(newName);
    if (destExists) {
      throw new Error(`Table "${newName}" already exists`);
    }

    db.exec(`ALTER TABLE "${oldName}" RENAME TO "${newName}"`);
    db.prepare('UPDATE _tables SET name = ?, updated_at = ? WHERE name = ?').run(newName, now(), oldName);
    db.prepare('UPDATE _columns SET table_name = ?, updated_at = ? WHERE table_name = ?').run(newName, now(), oldName);

    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Duplicate a user data table (schema + data + metadata).
 * @param {string} projectPath
 * @param {string} sourceName
 * @param {string} newName
 */
export function duplicateDataTable(projectPath, sourceName, newName) {
  const v1 = validateTableName(sourceName);
  if (!v1.valid) throw new Error(v1.error);
  const v2 = validateTableName(newName);
  if (!v2.valid) throw new Error(v2.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Check source exists
    const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(sourceName);
    if (!exists) {
      throw new Error(`Table "${sourceName}" not found`);
    }
    // Check destination doesn't exist
    const destExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(newName);
    if (destExists) {
      throw new Error(`Table "${newName}" already exists`);
    }

    // Create table with same schema and copy data
    db.exec(`CREATE TABLE "${newName}" AS SELECT * FROM "${sourceName}"`);

    // Copy _tables metadata
    const ts = now();
    const meta = db.prepare('SELECT display_name, description FROM _tables WHERE name = ?').get(sourceName);
    db.prepare('INSERT INTO _tables (name, display_name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(newName, (meta?.display_name || newName) + ' (copy)', meta?.description || '', ts, ts);

    // Copy _columns metadata
    const colMeta = db.prepare('SELECT * FROM _columns WHERE table_name = ?').all(sourceName);
    const insertMeta = db.prepare(
      'INSERT INTO _columns (table_name, column_name, semantic_type, config, display_name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const cm of colMeta) {
      insertMeta.run(newName, cm.column_name, cm.semantic_type, cm.config, cm.display_name, cm.description, ts, ts);
    }

    touchLastTouched(projectPath);
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------------------
// Row Operations
// ---------------------------------------------------------------------------

/**
 * Get rows from a user table with pagination.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {Object} [opts]
 * @param {number} [opts.limit=100]
 * @param {number} [opts.offset=0]
 * @param {string} [opts.orderBy]
 * @param {string} [opts.orderDir]
 * @returns {{ rows: any[], total: number }}
 */
export function getTableRows(projectPath, tableName, opts = {}) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const { limit = 100, offset = 0, orderBy, orderDir = 'ASC' } = opts;

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath, true);
  try {
    const total = db.prepare(`SELECT COUNT(*) as cnt FROM "${tableName}"`).get()?.cnt ?? 0;

    let sql = `SELECT rowid, * FROM "${tableName}"`;
    if (orderBy) {
      // Validate orderBy is a real column
      const cols = db.pragma(`table_info("${tableName}")`);
      const colNames = cols.map((/** @type {any} */ c) => c.name);
      if (orderBy === 'rowid' || colNames.includes(orderBy)) {
        const dir = orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        sql += ` ORDER BY "${orderBy}" ${dir}`;
      }
    } else {
      sql += ' ORDER BY rowid ASC';
    }
    sql += ' LIMIT ? OFFSET ?';

    const rows = db.prepare(sql).all(limit, offset);
    db.close();
    return { rows, total };
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Insert a row into a user table.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {Record<string, any>} data
 * @returns {{ rowid: number }}
 */
export function insertRow(projectPath, tableName, data) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  if (!data || Object.keys(data).length === 0) {
    throw new Error('No data provided');
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Validate column names against schema
    const cols = db.pragma(`table_info("${tableName}")`);
    const colNames = new Set(cols.map((/** @type {any} */ c) => c.name));

    const keys = Object.keys(data).filter(k => colNames.has(k));
    if (keys.length === 0) {
      throw new Error('No valid columns in data');
    }

    // Load semantic type metadata for coercion
    const metaMap = new Map();
    const hasColumnsTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_columns'"
    ).get();
    if (hasColumnsTable) {
      const meta = db.prepare('SELECT column_name, semantic_type FROM _columns WHERE table_name = ?').all(tableName);
      for (const m of meta) metaMap.set(m.column_name, m.semantic_type);
    }

    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => coerceValue(data[k] ?? null, metaMap.get(k)));

    const result = db.prepare(
      `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`
    ).run(...values);

    // Update _tables timestamp
    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);

    touchLastTouched(projectPath);
    db.close();
    return { rowid: Number(result.lastInsertRowid) };
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Update a row by rowid.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {number} rowid
 * @param {Record<string, any>} data
 * @returns {{ changes: number }}
 */
export function updateRow(projectPath, tableName, rowid, data) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  if (!data || Object.keys(data).length === 0) {
    throw new Error('No data provided');
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const cols = db.pragma(`table_info("${tableName}")`);
    const colNames = new Set(cols.map((/** @type {any} */ c) => c.name));

    const keys = Object.keys(data).filter(k => colNames.has(k));
    if (keys.length === 0) {
      throw new Error('No valid columns in data');
    }

    // Load semantic type metadata for coercion
    const metaMap = new Map();
    const hasColumnsTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_columns'"
    ).get();
    if (hasColumnsTable) {
      const meta = db.prepare('SELECT column_name, semantic_type FROM _columns WHERE table_name = ?').all(tableName);
      for (const m of meta) metaMap.set(m.column_name, m.semantic_type);
    }

    const sets = keys.map(k => `"${k}" = ?`).join(', ');
    const values = keys.map(k => coerceValue(data[k] ?? null, metaMap.get(k)));
    values.push(rowid);

    const result = db.prepare(`UPDATE "${tableName}" SET ${sets} WHERE rowid = ?`).run(...values);

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
    return { changes: result.changes };
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Delete a row by rowid.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {number} rowid
 * @returns {{ changes: number }}
 */
export function deleteRow(projectPath, tableName, rowid) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const result = db.prepare(`DELETE FROM "${tableName}" WHERE rowid = ?`).run(rowid);

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
    return { changes: result.changes };
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Duplicate a row by rowid. Copies all column values into a new row.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {number} rowid
 * @returns {{ rowid: number }}
 */
export function duplicateRow(projectPath, tableName, rowid) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Get column names (excluding rowid)
    const cols = db.pragma(`table_info("${tableName}")`);
    const colNames = cols.map((/** @type {any} */ c) => c.name);

    if (colNames.length === 0) {
      throw new Error('Table has no columns');
    }

    // Get the source row
    const row = db.prepare(`SELECT ${colNames.map(c => `"${c}"`).join(', ')} FROM "${tableName}" WHERE rowid = ?`).get(rowid);
    if (!row) {
      throw new Error(`Row ${rowid} not found in ${tableName}`);
    }

    // Insert copy
    const placeholders = colNames.map(() => '?').join(', ');
    const values = colNames.map(c => row[c]);
    const result = db.prepare(
      `INSERT INTO "${tableName}" (${colNames.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`
    ).run(...values);

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
    return { rowid: Number(result.lastInsertRowid) };
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Column Metadata
// ---------------------------------------------------------------------------

/**
 * Get all column metadata for a table.
 * @param {string} projectPath
 * @param {string} tableName
 * @returns {Array<{table_name: string, column_name: string, semantic_type: string, config: object, display_name: string|null, description: string|null, created_at: string, updated_at: string}>}
 */
export function getColumnMetadata(projectPath, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    const hasTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_columns'"
    ).get();
    if (!hasTable) { db.close(); return []; }

    const rows = db.prepare('SELECT * FROM _columns WHERE table_name = ?').all(tableName);
    db.close();
    return rows.map(r => ({
      ...r,
      config: (() => { try { return JSON.parse(r.config || '{}'); } catch { return {}; } })(),
    }));
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Set or update column metadata (upsert).
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string} columnName
 * @param {string} semanticType
 * @param {object} [config={}]
 * @param {object} [opts={}]
 * @param {string} [opts.displayName]
 * @param {string} [opts.description]
 */
export function setColumnMetadata(projectPath, tableName, columnName, semanticType, config = {}, opts = {}) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateColumnName(columnName);
  if (!vc.valid) throw new Error(vc.error);
  const vs = validateSemanticType(semanticType);
  if (!vs.valid) throw new Error(vs.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Ensure _columns table exists
    db.exec(getSchemaSQL());

    const ts = now();
    db.prepare(`
      INSERT INTO _columns (table_name, column_name, semantic_type, config, display_name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(table_name, column_name) DO UPDATE SET
        semantic_type = excluded.semantic_type,
        config = excluded.config,
        display_name = excluded.display_name,
        description = excluded.description,
        updated_at = excluded.updated_at
    `).run(
      tableName, columnName, semanticType,
      JSON.stringify(config),
      opts.displayName || null,
      opts.description || null,
      ts, ts
    );

    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Delete metadata for a single column.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string} columnName
 */
export function deleteColumnMetadata(projectPath, tableName, columnName) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return;

  const db = openDb(dbPath);
  try {
    db.prepare('DELETE FROM _columns WHERE table_name = ? AND column_name = ?')
      .run(tableName, columnName);
    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Delete all column metadata for a table (used by dropDataTable).
 * @param {string} projectPath
 * @param {string} tableName
 */
export function deleteTableColumnMetadata(projectPath, tableName) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return;

  const db = openDb(dbPath);
  try {
    db.prepare('DELETE FROM _columns WHERE table_name = ?').run(tableName);
    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Column Operations (ALTER TABLE)
// ---------------------------------------------------------------------------

/**
 * Add a column to an existing user table.
 * SQLite ADD COLUMN always appends — no positional insert.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string} columnName
 * @param {string} sqliteType  - e.g. 'TEXT', 'REAL', 'INTEGER'
 * @param {string} [semanticType] - optional semantic type for _columns metadata
 * @param {object} [config={}]
 */
export function addColumn(projectPath, tableName, columnName, sqliteType, semanticType, config = {}) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateColumnName(columnName);
  if (!vc.valid) throw new Error(vc.error);
  const vtp = validateColumnType(sqliteType);
  if (!vtp.valid) throw new Error(vtp.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Check column doesn't already exist
    const cols = db.pragma(`table_info("${tableName}")`);
    if (cols.some(c => c.name === columnName)) {
      throw new Error(`Column "${columnName}" already exists in table "${tableName}"`);
    }

    db.exec(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${sqliteType.toUpperCase()}`);

    // Create metadata if semantic type provided
    if (semanticType) {
      const vs = validateSemanticType(semanticType);
      if (vs.valid) {
        const ts = now();
        db.prepare(
          'INSERT INTO _columns (table_name, column_name, semantic_type, config, display_name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(tableName, columnName, semanticType, JSON.stringify(config), null, null, ts, ts);
      }
    }

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Delete a column from a user table.
 * Requires SQLite 3.35+ (ALTER TABLE DROP COLUMN).
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string} columnName
 */
export function deleteColumn(projectPath, tableName, columnName) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const cols = db.pragma(`table_info("${tableName}")`);
    if (cols.length <= 1) {
      throw new Error('Cannot delete the last column');
    }
    if (!cols.some(c => c.name === columnName)) {
      throw new Error(`Column "${columnName}" not found in table "${tableName}"`);
    }

    db.exec(`ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`);

    // Clean up metadata
    db.prepare('DELETE FROM _columns WHERE table_name = ? AND column_name = ?')
      .run(tableName, columnName);

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Duplicate a column (schema + data + metadata).
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string} sourceColumn
 * @param {string} newName
 */
export function duplicateColumn(projectPath, tableName, sourceColumn, newName) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateColumnName(newName);
  if (!vc.valid) throw new Error(vc.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const cols = db.pragma(`table_info("${tableName}")`);
    const sourceCol = cols.find(c => c.name === sourceColumn);
    if (!sourceCol) {
      throw new Error(`Source column "${sourceColumn}" not found`);
    }
    if (cols.some(c => c.name === newName)) {
      throw new Error(`Column "${newName}" already exists`);
    }

    // Add column with same type
    db.exec(`ALTER TABLE "${tableName}" ADD COLUMN "${newName}" ${sourceCol.type || 'TEXT'}`);

    // Copy data
    db.exec(`UPDATE "${tableName}" SET "${newName}" = "${sourceColumn}"`);

    // Copy metadata if exists
    const meta = db.prepare(
      'SELECT * FROM _columns WHERE table_name = ? AND column_name = ?'
    ).get(tableName, sourceColumn);
    if (meta) {
      const ts = now();
      db.prepare(
        'INSERT INTO _columns (table_name, column_name, semantic_type, config, display_name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(tableName, newName, meta.semantic_type, meta.config, null, null, ts, ts);
    }

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Rename a column.
 * Requires SQLite 3.25+ (ALTER TABLE RENAME COLUMN).
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string} oldName
 * @param {string} newName
 */
export function renameColumn(projectPath, tableName, oldName, newName) {
  const vt = validateTableName(tableName);
  if (!vt.valid) throw new Error(vt.error);
  const vc = validateColumnName(newName);
  if (!vc.valid) throw new Error(vc.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const cols = db.pragma(`table_info("${tableName}")`);
    if (!cols.some(c => c.name === oldName)) {
      throw new Error(`Column "${oldName}" not found in table "${tableName}"`);
    }
    if (cols.some(c => c.name === newName)) {
      throw new Error(`Column "${newName}" already exists in table "${tableName}"`);
    }

    db.exec(`ALTER TABLE "${tableName}" RENAME COLUMN "${oldName}" TO "${newName}"`);

    // Update metadata column_name
    db.prepare('UPDATE _columns SET column_name = ?, updated_at = ? WHERE table_name = ? AND column_name = ?')
      .run(newName, now(), tableName, oldName);

    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Bulk Insert
// ---------------------------------------------------------------------------

/**
 * Insert multiple rows in a single transaction (fast, atomic).
 * @param {string} projectPath
 * @param {string} tableName
 * @param {Array<Record<string, any>>} rows  Array of {column: value} objects
 * @returns {{ inserted: number, rowids: number[] }}
 */
export function insertRows(projectPath, tableName, rows) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  if (!rows || rows.length === 0) {
    throw new Error('No rows provided');
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Get valid column names
    const cols = db.pragma(`table_info("${tableName}")`);
    const colNames = new Set(cols.map((/** @type {any} */ c) => c.name));

    // Load semantic type metadata for coercion
    const metaMap = new Map();
    const hasColumnsTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_columns'"
    ).get();
    if (hasColumnsTable) {
      const meta = db.prepare('SELECT column_name, semantic_type FROM _columns WHERE table_name = ?').all(tableName);
      for (const m of meta) metaMap.set(m.column_name, m.semantic_type);
    }

    // Collect all columns across all rows, filtered to valid ones
    const allKeys = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => colNames.has(k));
    if (allKeys.length === 0) {
      throw new Error('No valid columns in data');
    }

    const placeholders = allKeys.map(() => '?').join(', ');
    const insertStmt = db.prepare(
      `INSERT INTO "${tableName}" (${allKeys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`
    );

    const rowids = [];
    const runInserts = db.transaction(() => {
      for (const row of rows) {
        const values = allKeys.map(k => coerceValue(row[k] ?? null, metaMap.get(k)));
        const result = insertStmt.run(...values);
        rowids.push(Number(result.lastInsertRowid));
      }
    });
    runInserts();

    // Update _tables timestamp
    db.prepare('UPDATE _tables SET updated_at = ? WHERE name = ?').run(now(), tableName);
    touchLastTouched(projectPath);
    db.close();
    return { inserted: rowids.length, rowids };
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Type Coercion Helpers
// ---------------------------------------------------------------------------

/**
 * Coerce a value based on its column's semantic type before writing to SQLite.
 * @param {any} value
 * @param {string|undefined} semanticType
 * @returns {any}
 */
function coerceValue(value, semanticType) {
  if (value === null || value === undefined) return null;
  if (!semanticType) return value;

  switch (semanticType) {
    case 'boolean': {
      if (typeof value === 'boolean') return value ? 1 : 0;
      if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        if (lower === 'true' || lower === '1' || lower === 'yes') return 1;
        if (lower === 'false' || lower === '0' || lower === 'no' || lower === '') return 0;
      }
      return value ? 1 : 0;
    }
    case 'number':
    case 'currency':
    case 'percentage': {
      if (typeof value === 'string') {
        const cleaned = value.replace(/[,$%€£¥]/g, '').trim();
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
      }
      return value;
    }
    default:
      return value;
  }
}

// ---------------------------------------------------------------------------
// Context Views
// ---------------------------------------------------------------------------

/**
 * Get the context view for a table (context_query + context_description).
 * @param {string} projectPath
 * @param {string} tableName
 * @returns {{ context_query: string|null, context_description: string|null } | null}
 */
export function getContextView(projectPath, tableName) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return null;

  const db = openDb(dbPath, true);
  try {
    const row = db.prepare('SELECT context_query, context_description FROM _tables WHERE name = ?').get(tableName);
    db.close();
    return row ? { context_query: row.context_query || null, context_description: row.context_description || null } : null;
  } catch (error) {
    db.close();
    // Column may not exist in older databases
    if (error.message && error.message.includes('no such column')) {
      return { context_query: null, context_description: null };
    }
    throw error;
  }
}

/**
 * Set the context view for a table.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {Object} input
 * @param {string|null} [input.context_query]
 * @param {string|null} [input.context_description]
 * @returns {{ updated: boolean }}
 */
export function setContextView(projectPath, tableName, input) {
  const v = validateTableName(tableName);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    // Ensure columns exist (migration for older databases)
    migrateContextColumns(db);

    const fields = [];
    const values = [];

    if (input.context_query !== undefined) { fields.push('context_query = ?'); values.push(input.context_query); }
    if (input.context_description !== undefined) { fields.push('context_description = ?'); values.push(input.context_description); }

    if (fields.length === 0) {
      db.close();
      return { updated: false };
    }

    fields.push('updated_at = ?');
    values.push(now());
    values.push(tableName);

    db.prepare(`UPDATE _tables SET ${fields.join(', ')} WHERE name = ?`).run(...values);

    touchLastTouched(projectPath);
    db.close();
    return { updated: true };
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Run a context query against data.db and return results as a markdown table.
 * @param {string} projectPath
 * @param {string} sql
 * @returns {{ markdown: string, rowCount: number, columnCount: number }}
 */
export function previewContextQuery(projectPath, sql) {
  if (!sql || !sql.trim()) {
    return { markdown: '', rowCount: 0, columnCount: 0 };
  }

  const trimmed = sql.trim();
  if (!/^SELECT\b/i.test(trimmed)) {
    throw new Error('Context query must be a SELECT statement');
  }

  // Auto-add LIMIT if missing
  let safeSql = trimmed;
  if (!/\bLIMIT\b/i.test(safeSql)) {
    safeSql = safeSql.replace(/;?\s*$/, ' LIMIT 100');
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath, true);
  try {
    const rows = db.prepare(safeSql).all();
    db.close();

    if (rows.length === 0) return { markdown: '(no results)', rowCount: 0, columnCount: 0 };

    const cols = Object.keys(rows[0]);
    const header = '| ' + cols.join(' | ') + ' |';
    const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
    const body = rows.map(row =>
      '| ' + cols.map(c => String(row[c] ?? '')).join(' | ') + ' |'
    ).join('\n');

    return {
      markdown: `${header}\n${separator}\n${body}`,
      rowCount: rows.length,
      columnCount: cols.length,
    };
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Migrate older databases to add context_query/context_description columns.
 * @param {import('better-sqlite3').Database} db
 */
function migrateContextColumns(db) {
  const cols = db.pragma('table_info("_tables")');
  const colNames = new Set(cols.map(c => c.name));

  if (!colNames.has('context_query')) {
    db.exec('ALTER TABLE _tables ADD COLUMN context_query TEXT');
  }
  if (!colNames.has('context_description')) {
    db.exec('ALTER TABLE _tables ADD COLUMN context_description TEXT');
  }
}

// ---------------------------------------------------------------------------
// Raw SQL
// ---------------------------------------------------------------------------

/** Write keywords that queryDataTable must reject */
const WRITE_RE = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH)\b/i;

/**
 * Execute a read-only SQL query against data.db.
 * Auto-adds LIMIT 100 if no LIMIT present.
 * @param {string} projectPath
 * @param {string} sql
 * @returns {any[]}
 */
export function queryDataTable(projectPath, sql) {
  if (WRITE_RE.test(sql)) {
    throw new Error('Write operations not allowed in query mode. Use execDataSql() instead.');
  }

  // Auto-add LIMIT if missing
  if (!/\bLIMIT\b/i.test(sql)) {
    sql = sql.replace(/;?\s*$/, ' LIMIT 100');
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath, true);
  try {
    const rows = db.prepare(sql).all();
    db.close();
    return rows;
  } catch (error) {
    db.close();
    throw error;
  }
}

/** Only allow these write keywords */
const ALLOWED_WRITE_RE = /^\s*(INSERT|UPDATE|DELETE)\b/i;

/**
 * Execute a write SQL statement against data.db.
 * Only INSERT, UPDATE, DELETE allowed.
 * @param {string} projectPath
 * @param {string} sql
 * @returns {{ changes: number }}
 */
export function execDataSql(projectPath, sql) {
  if (!ALLOWED_WRITE_RE.test(sql)) {
    throw new Error('Only INSERT, UPDATE, DELETE statements are allowed');
  }

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const result = db.prepare(sql).run();
    touchLastTouched(projectPath);
    db.close();
    return { changes: result.changes };
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default {
  // Init
  initDataDb,
  // Validation
  validateTableName,
  validateColumnName,
  validateColumnType,
  validateSemanticType,
  // Tables
  getDataTables,
  getTableSchema,
  createDataTable,
  dropDataTable,
  // Column Metadata
  getColumnMetadata,
  setColumnMetadata,
  deleteColumnMetadata,
  deleteTableColumnMetadata,
  // Rows
  getTableRows,
  insertRow,
  insertRows,
  updateRow,
  deleteRow,
  duplicateRow,
  // Column Operations
  addColumn,
  deleteColumn,
  duplicateColumn,
  renameColumn,
  // Context Views
  getContextView,
  setContextView,
  previewContextQuery,
  // Raw SQL
  queryDataTable,
  execDataSql,
};
