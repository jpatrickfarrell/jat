/**
 * JAT Knowledge Bases CRUD Library (Unified)
 *
 * All bases are stored in .jat/data.db in the `bases` table.
 * Each base is a canvas page with blocks (JSON array of CanvasBlock objects).
 * Former source types (manual, data_table, conversation, external) are now
 * represented as block arrays with metadata in source_config.
 *
 * Migrated from separate bases.db by tools/scripts/migrate-bases-to-canvas.js.
 */

// @ts-ignore - better-sqlite3 types may not match exactly
import Database from 'better-sqlite3';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, extname } from 'path';
import { randomBytes } from 'crypto';

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

function touchLastTouched(projectPath) {
  const sentinel = join(projectPath, '.jat', 'last-touched');
  writeFileSync(sentinel, String(Date.now()));
}

function openDb(dbPath, readonly = false) {
  const db = new Database(dbPath, { readonly });
  if (!readonly) {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');
  return db;
}

function now() {
  return new Date().toISOString();
}

function generateId() {
  return randomBytes(4).toString('hex');
}

// ---------------------------------------------------------------------------
// Backward Compatibility: source_type inference
// ---------------------------------------------------------------------------

/**
 * Allowed source types for backward compatibility. New code should not
 * rely on source_type — use blocks directly.
 */
const ALLOWED_SOURCE_TYPES = ['manual', 'data_table', 'conversation', 'external'];

export function validateSourceType(type) {
  if (!type) return { valid: false, error: 'Source type is required' };
  if (!ALLOWED_SOURCE_TYPES.includes(type)) {
    return { valid: false, error: `Source type must be one of: ${ALLOWED_SOURCE_TYPES.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Infer the legacy source_type from a base's blocks and source_config.
 */
function inferSourceType(base) {
  const config = base.source_config || {};
  // Check migrated source_type first
  if (config._migrated_source_type) return config._migrated_source_type;
  // Infer from blocks
  const blocks = base.blocks || [];
  if (blocks.some(b => b.type === 'table_view')) return 'data_table';
  if (config.sender_key) return 'conversation';
  if (config.url || config.coda_doc_id || config.gsheet_id) return 'external';
  return 'manual';
}

// ---------------------------------------------------------------------------
// Init / Migration
// ---------------------------------------------------------------------------

/**
 * Ensure the bases table exists in data.db.
 * Handles both fresh databases (via schema) and legacy databases
 * (with _canvas_pages that need migration).
 */
export function initBasesDb(projectPath) {
  const jatDir = join(projectPath, '.jat');
  const dbPath = join(jatDir, 'data.db');

  if (!existsSync(jatDir)) {
    mkdirSync(jatDir, { recursive: true });
  }

  const db = openDb(dbPath);

  // Check if `bases` table already exists
  const basesExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bases'").get();

  if (!basesExists) {
    // Check if old _canvas_pages exists (needs migration)
    const canvasExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_canvas_pages'").get();

    if (canvasExists) {
      // Run inline migration: add columns and rename
      const columnsToAdd = [
        { name: 'description', sql: 'ALTER TABLE _canvas_pages ADD COLUMN description TEXT' },
        { name: 'always_inject', sql: "ALTER TABLE _canvas_pages ADD COLUMN always_inject INTEGER NOT NULL DEFAULT 0" },
        { name: 'token_estimate', sql: 'ALTER TABLE _canvas_pages ADD COLUMN token_estimate INTEGER' },
        { name: 'source_config', sql: "ALTER TABLE _canvas_pages ADD COLUMN source_config TEXT DEFAULT '{}'" },
      ];
      for (const col of columnsToAdd) {
        try {
          db.prepare(`SELECT ${col.name} FROM _canvas_pages LIMIT 0`).run();
        } catch {
          db.exec(col.sql);
        }
      }
      db.exec('ALTER TABLE _canvas_pages RENAME TO bases');
    } else {
      // Fresh database — create all tables from schema
      db.exec(getSchemaSQL());
    }
  }

  // Ensure task_bases exists (may be missing in older databases)
  try {
    db.prepare('SELECT 1 FROM task_bases LIMIT 0').get();
  } catch {
    db.exec(`CREATE TABLE IF NOT EXISTS task_bases (
      task_id TEXT NOT NULL,
      base_id TEXT NOT NULL,
      attached_at TEXT NOT NULL,
      attached_by TEXT,
      PRIMARY KEY (task_id, base_id),
      FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE
    )`);
  }

  // Ensure task_tables exists
  try {
    db.prepare('SELECT 1 FROM task_tables LIMIT 0').get();
  } catch {
    db.exec(`CREATE TABLE IF NOT EXISTS task_tables (
      task_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      project TEXT NOT NULL,
      context_query TEXT,
      attached_at TEXT NOT NULL,
      attached_by TEXT,
      PRIMARY KEY (task_id, table_name, project)
    )`);
  }

  db.close();
  return { dbPath };
}

// ---------------------------------------------------------------------------
// CRUD: Bases
// ---------------------------------------------------------------------------

/**
 * List all knowledge bases.
 */
export function getBases(projectPath, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    // Check if bases table exists
    if (!tableExists(db, 'bases')) {
      db.close();
      return [];
    }

    let sql = 'SELECT * FROM bases';
    if (opts.alwaysInjectOnly) {
      sql += ' WHERE always_inject = 1';
    }
    sql += ' ORDER BY name';

    const rows = db.prepare(sql).all();
    db.close();
    return rows.map(parseBaseRow);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Get a single knowledge base by ID.
 */
export function getBase(projectPath, id) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return null;

  const db = openDb(dbPath, true);
  try {
    if (!tableExists(db, 'bases')) {
      db.close();
      return null;
    }
    const row = db.prepare('SELECT * FROM bases WHERE id = ?').get(id);
    db.close();
    return row ? parseBaseRow(row) : null;
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Create a new knowledge base.
 *
 * Supports two creation modes:
 * 1. Block-based (new): pass `blocks` array directly
 * 2. Legacy (compat): pass `source_type` + `content` — auto-converted to blocks
 */
export function createBase(projectPath, input) {
  if (!input.name) throw new Error('Name is required');

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) {
    initBasesDb(projectPath);
  }

  const db = openDb(dbPath);
  try {
    ensureBasesTable(db);

    const id = input.id || generateId();
    const ts = now();

    // Determine blocks: use provided blocks or convert from legacy fields
    let blocks = input.blocks || [];
    if (blocks.length === 0 && input.content) {
      // Legacy mode: convert content to text block
      blocks = [{ type: 'text', id: generateId(), content: input.content }];
    }

    // Build source_config
    const sourceConfig = input.source_config || {};
    if (input.source_type) {
      sourceConfig._migrated_source_type = input.source_type;
    }
    if (input.context_query) {
      sourceConfig.context_query = input.context_query;
    }

    db.prepare(`
      INSERT INTO bases (id, name, project, blocks, description, always_inject, token_estimate, source_config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.name,
      input.project || 'default',
      JSON.stringify(blocks),
      input.description || null,
      input.always_inject ? 1 : 0,
      input.token_estimate || null,
      JSON.stringify(sourceConfig),
      ts,
      ts
    );

    touchLastTouched(projectPath);

    const row = db.prepare('SELECT * FROM bases WHERE id = ?').get(id);
    db.close();
    return parseBaseRow(row);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Update an existing knowledge base.
 */
export function updateBase(projectPath, id, input) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    ensureBasesTable(db);
    const existing = db.prepare('SELECT * FROM bases WHERE id = ?').get(id);
    if (!existing) {
      db.close();
      throw new Error(`Base "${id}" not found`);
    }

    const fields = [];
    const values = [];

    if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
    if (input.description !== undefined) { fields.push('description = ?'); values.push(input.description); }
    if (input.blocks !== undefined) { fields.push('blocks = ?'); values.push(JSON.stringify(input.blocks)); }
    if (input.always_inject !== undefined) { fields.push('always_inject = ?'); values.push(input.always_inject ? 1 : 0); }
    else if (input.is_base !== undefined) { fields.push('always_inject = ?'); values.push(input.is_base ? 1 : 0); }
    if (input.token_estimate !== undefined) { fields.push('token_estimate = ?'); values.push(input.token_estimate); }
    if (input.project !== undefined) { fields.push('project = ?'); values.push(input.project); }

    // Legacy field support: content updates the text block
    if (input.content !== undefined && input.blocks === undefined) {
      const currentBlocks = existing.blocks ? JSON.parse(existing.blocks) : [];
      const textBlock = currentBlocks.find(b => b.type === 'text');
      if (textBlock) {
        textBlock.content = input.content;
      } else {
        currentBlocks.unshift({ type: 'text', id: generateId(), content: input.content });
      }
      fields.push('blocks = ?');
      values.push(JSON.stringify(currentBlocks));
    }

    // source_config update
    if (input.source_config !== undefined) {
      fields.push('source_config = ?');
      values.push(JSON.stringify(input.source_config));
    } else if (input.context_query !== undefined) {
      // Legacy: update context_query in source_config
      const config = parseJson(existing.source_config);
      config.context_query = input.context_query;
      fields.push('source_config = ?');
      values.push(JSON.stringify(config));
    }

    if (fields.length === 0) {
      db.close();
      return parseBaseRow(existing);
    }

    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);

    db.prepare(`UPDATE bases SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    touchLastTouched(projectPath);

    const row = db.prepare('SELECT * FROM bases WHERE id = ?').get(id);
    db.close();
    return parseBaseRow(row);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Delete a knowledge base.
 */
export function deleteBase(projectPath, id) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const result = db.prepare('DELETE FROM bases WHERE id = ?').run(id);
    touchLastTouched(projectPath);
    db.close();
    return { changes: result.changes };
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Task Attachment
// ---------------------------------------------------------------------------

export function attachBaseToTask(projectPath, taskId, baseId, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    ensureBasesTable(db);

    const base = db.prepare('SELECT id FROM bases WHERE id = ?').get(baseId);
    if (!base) {
      db.close();
      throw new Error(`Base "${baseId}" not found`);
    }

    const existing = db.prepare('SELECT 1 FROM task_bases WHERE task_id = ? AND base_id = ?').get(taskId, baseId);
    if (existing) {
      db.close();
      return { attached: false };
    }

    db.prepare('INSERT INTO task_bases (task_id, base_id, attached_at, attached_by) VALUES (?, ?, ?, ?)')
      .run(taskId, baseId, now(), opts.attached_by || null);

    touchLastTouched(projectPath);
    db.close();
    return { attached: true };
  } catch (error) {
    db.close();
    throw error;
  }
}

export function detachBaseFromTask(projectPath, taskId, baseId) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const result = db.prepare('DELETE FROM task_bases WHERE task_id = ? AND base_id = ?')
      .run(taskId, baseId);

    touchLastTouched(projectPath);
    db.close();
    return { changes: result.changes };
  } catch (error) {
    db.close();
    throw error;
  }
}

export function getTaskBases(projectPath, taskId) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    if (!tableExists(db, 'bases') || !tableExists(db, 'task_bases')) {
      db.close();
      return [];
    }

    const rows = db.prepare(`
      SELECT b.*, tb.attached_at, tb.attached_by
      FROM bases b
      JOIN task_bases tb ON tb.base_id = b.id
      WHERE tb.task_id = ?
      ORDER BY tb.attached_at
    `).all(taskId);

    db.close();
    return rows.map(row => ({
      ...parseBaseRow(row),
      attached_at: row.attached_at,
      attached_by: row.attached_by,
    }));
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Task ↔ Data Table Attachment
// ---------------------------------------------------------------------------

export function attachTableToTask(projectPath, taskId, tableName, project, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    ensureBasesTable(db);

    const existing = db.prepare('SELECT 1 FROM task_tables WHERE task_id = ? AND table_name = ? AND project = ?')
      .get(taskId, tableName, project);
    if (existing) {
      db.close();
      return { attached: false };
    }

    db.prepare('INSERT INTO task_tables (task_id, table_name, project, context_query, attached_at, attached_by) VALUES (?, ?, ?, ?, ?, ?)')
      .run(taskId, tableName, project, opts.context_query || null, now(), opts.attached_by || null);

    touchLastTouched(projectPath);
    db.close();
    return { attached: true };
  } catch (error) {
    db.close();
    throw error;
  }
}

export function detachTableFromTask(projectPath, taskId, tableName, project) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    const result = db.prepare('DELETE FROM task_tables WHERE task_id = ? AND table_name = ? AND project = ?')
      .run(taskId, tableName, project);

    touchLastTouched(projectPath);
    db.close();
    return { changes: result.changes };
  } catch (error) {
    db.close();
    throw error;
  }
}

export function getTaskTables(projectPath, taskId) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    if (!tableExists(db, 'task_tables')) {
      db.close();
      return [];
    }
    const rows = db.prepare('SELECT * FROM task_tables WHERE task_id = ? ORDER BY attached_at')
      .all(taskId);
    db.close();
    return rows;
  } catch (error) {
    db.close();
    if (error.message?.includes('no such table')) return [];
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Data Table / View Rendering (for context injection)
// ---------------------------------------------------------------------------

export function renderDataTable(projectPath, tableName, contextQueryOverride = null) {
  const dataDbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dataDbPath)) {
    return { table_name: tableName, content: '(data.db not found)', token_estimate: 0 };
  }

  const db = openDb(dataDbPath, true);
  try {
    let sql = contextQueryOverride;

    if (!sql) {
      const meta = db.prepare('SELECT context_query FROM _tables WHERE name = ?').get(tableName);
      sql = meta?.context_query || null;
    }

    if (!sql) {
      sql = `SELECT * FROM "${tableName}" LIMIT 50`;
    }

    const trimmed = sql.trim();
    if (!/^SELECT\b/i.test(trimmed)) {
      db.close();
      return { table_name: tableName, content: '(query must be a SELECT statement)', token_estimate: 0 };
    }

    if (!/\bLIMIT\b/i.test(trimmed)) {
      sql = trimmed.replace(/;?\s*$/, ' LIMIT 100');
    }

    const rows = db.prepare(sql).all();
    db.close();

    if (rows.length === 0) {
      return { table_name: tableName, content: '(no results)', token_estimate: 0 };
    }

    const content = formatMarkdownTable(rows);
    return { table_name: tableName, content, token_estimate: Math.ceil(content.length / 4) };
  } catch (error) {
    db.close();
    return { table_name: tableName, content: `(query error: ${error.message})`, token_estimate: 0 };
  }
}

export function renderDataView(projectPath, viewId, contextQueryOverride = null) {
  const dataDbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dataDbPath)) {
    return { view_name: viewId, table_name: '', content: '(data.db not found)', token_estimate: 0 };
  }

  const db = openDb(dataDbPath, true);
  try {
    const hasViews = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_views'"
    ).get();
    if (!hasViews) {
      db.close();
      return { view_name: viewId, table_name: '', content: '(no views table)', token_estimate: 0 };
    }

    const view = db.prepare('SELECT * FROM _views WHERE id = ?').get(viewId);
    if (!view) {
      db.close();
      return { view_name: viewId, table_name: '', content: '(view not found)', token_estimate: 0 };
    }

    const viewName = view.display_name || view.name;
    const tableName = view.table_name;

    let sql = contextQueryOverride || view.context_query;

    if (sql) {
      const trimmed = sql.trim();
      if (!/^SELECT\b/i.test(trimmed)) {
        db.close();
        return { view_name: viewName, table_name: tableName, content: '(query must be a SELECT statement)', token_estimate: 0 };
      }
      if (!/\bLIMIT\b/i.test(trimmed)) {
        sql = trimmed.replace(/;?\s*$/, ' LIMIT 100');
      }
      const rows = db.prepare(sql).all();
      db.close();
      if (rows.length === 0) {
        return { view_name: viewName, table_name: tableName, content: '(no results)', token_estimate: 0 };
      }
      const content = formatMarkdownTable(rows);
      return { view_name: viewName, table_name: tableName, content, token_estimate: Math.ceil(content.length / 4) };
    }

    const filters = view.filters ? JSON.parse(view.filters) : [];
    const conjunction = view.filter_conjunction || 'AND';
    const { whereParts, params } = buildViewWhere(filters);

    const whereClause = whereParts.length > 0
      ? 'WHERE ' + whereParts.join(` ${conjunction} `)
      : '';

    const sortCol = view.sort_column;
    const sortDir = (view.sort_direction || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = sortCol ? `ORDER BY "${sortCol}" ${sortDir}` : 'ORDER BY rowid ASC';

    const visibleCols = view.visible_columns ? JSON.parse(view.visible_columns) : null;
    const selectCols = visibleCols
      ? visibleCols.map(c => `"${c}"`).join(', ')
      : '*';

    const querySql = `SELECT ${selectCols} FROM "${tableName}" ${whereClause} ${orderClause} LIMIT 100`;
    const rows = db.prepare(querySql).all(...params);
    db.close();

    if (rows.length === 0) {
      return { view_name: viewName, table_name: tableName, content: '(no rows match filters)', token_estimate: 0 };
    }

    const content = formatMarkdownTable(rows);
    return { view_name: viewName, table_name: tableName, content, token_estimate: Math.ceil(content.length / 4) };
  } catch (error) {
    try { db.close(); } catch (_) {}
    return { view_name: viewId, table_name: '', content: `(query error: ${error.message})`, token_estimate: 0 };
  }
}

// ---------------------------------------------------------------------------
// Conversation Memory
// ---------------------------------------------------------------------------

export function findBySenderKey(projectPath, senderKey) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return null;

  const db = openDb(dbPath, true);
  try {
    if (!tableExists(db, 'bases')) {
      db.close();
      return null;
    }
    const row = db.prepare(
      "SELECT * FROM bases WHERE json_extract(source_config, '$._migrated_source_type') = 'conversation' AND json_extract(source_config, '$.sender_key') = ?"
    ).get(senderKey);
    db.close();
    return row ? parseBaseRow(row) : null;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function upsertConversationEntry(projectPath, { senderKey, senderName, entry }) {
  if (!senderKey) throw new Error('senderKey is required');
  if (!entry) throw new Error('entry is required');

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) {
    initBasesDb(projectPath);
  }

  const existing = findBySenderKey(projectPath, senderKey);

  if (existing) {
    // Append to existing text block content
    const blocks = existing.blocks || [];
    const textBlock = blocks.find(b => b.type === 'text');
    const currentContent = textBlock ? textBlock.content : '';
    const newContent = currentContent
      ? `${currentContent}\n\n---\n\n${entry}`
      : entry;

    if (textBlock) {
      textBlock.content = newContent;
    } else {
      blocks.unshift({ type: 'text', id: generateId(), content: newContent });
    }

    const updated = updateBase(projectPath, existing.id, {
      blocks,
      token_estimate: Math.ceil(newContent.length / 4),
    });

    return { base: updated, created: false };
  }

  const base = createBase(projectPath, {
    name: `Conversation: ${senderName}`,
    description: `Auto-managed conversation memory for ${senderName}. Tracks topics, resolutions, and communication patterns.`,
    source_type: 'conversation',
    content: entry,
    source_config: { sender_key: senderKey, auto_managed: true },
    always_inject: false,
    token_estimate: Math.ceil(entry.length / 4),
  });

  return { base, created: true };
}

// ---------------------------------------------------------------------------
// Search (FTS5)
// ---------------------------------------------------------------------------

export function searchBases(projectPath, query, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const { limit = 20 } = opts;

  const db = openDb(dbPath, true);
  try {
    if (!tableExists(db, 'bases_fts')) {
      db.close();
      return [];
    }

    const rows = db.prepare(`
      SELECT b.*, rank
      FROM bases_fts fts
      JOIN bases b ON b.rowid = fts.rowid
      WHERE bases_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(query, limit);

    db.close();
    return rows.map(row => {
      const parsed = parseBaseRow(row);
      parsed.rank = row.rank;
      return parsed;
    });
  } catch (error) {
    db.close();
    if (error.message && error.message.includes('fts5')) {
      return [];
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// @-Reference Resolution
// ---------------------------------------------------------------------------

const REFERENCE_PATTERN = /^@(file|base|data):(.+)$/gm;

const LANG_MAP = {
  'ts': 'typescript', 'tsx': 'typescript',
  'js': 'javascript', 'jsx': 'javascript', 'mjs': 'javascript', 'cjs': 'javascript',
  'py': 'python', 'rs': 'rust', 'go': 'go', 'java': 'java',
  'c': 'c', 'h': 'c', 'cpp': 'cpp', 'hpp': 'cpp',
  'css': 'css', 'scss': 'scss', 'html': 'html', 'htm': 'html',
  'json': 'json', 'yaml': 'yaml', 'yml': 'yaml', 'md': 'markdown',
  'sql': 'sql', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash',
  'xml': 'xml', 'svg': 'xml', 'svelte': 'svelte', 'vue': 'vue', 'toml': 'toml',
};

export function resolveReferences(projectPath, content, visitedBaseIds = new Set(), opts = {}) {
  if (!content || !content.includes('@')) return content;

  const collapsible = opts.collapsible || false;

  return content.replace(REFERENCE_PATTERN, (match, type, value) => {
    const ref = value.trim();
    switch (type) {
      case 'file':  return resolveFileRef(projectPath, ref, collapsible);
      case 'base':  return resolveBaseRef(projectPath, ref, visitedBaseIds, collapsible);
      case 'data':  return resolveDataRef(projectPath, ref, collapsible);
      default:      return match;
    }
  });
}

function resolveFileRef(projectPath, filePath, collapsible = false) {
  try {
    const fullPath = resolve(join(projectPath, filePath));
    const projectRoot = resolve(projectPath);

    if (!fullPath.startsWith(projectRoot + '/') && fullPath !== projectRoot) {
      return `> **@file error:** path outside project directory`;
    }

    if (!existsSync(fullPath)) {
      return `> **@file error:** \`${filePath}\` not found`;
    }

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

function resolveBaseRef(projectPath, baseName, visitedBaseIds, collapsible = false) {
  try {
    const bases = getBases(projectPath);
    const base = bases.find(b => b.name.toLowerCase() === baseName.toLowerCase());

    if (!base) {
      return `> **@base error:** "${baseName}" not found`;
    }

    if (visitedBaseIds.has(base.id)) {
      return `> **@base error:** circular reference to "${baseName}"`;
    }

    const newVisited = new Set(visitedBaseIds);
    newVisited.add(base.id);

    let refContent = renderBaseContentSync(projectPath, base);

    const resolved = resolveReferences(projectPath, refContent, newVisited, { collapsible });
    if (collapsible) {
      return `<details class="ref-collapse"><summary>📚 @base:${baseName}</summary>\n\n${resolved}\n</details>`;
    }
    return resolved;
  } catch (err) {
    return `> **@base error:** "${baseName}" — ${err.message}`;
  }
}

function resolveDataRef(projectPath, tableName, collapsible = false) {
  try {
    const result = renderDataTable(projectPath, tableName);
    if (collapsible) {
      return `<details class="ref-collapse"><summary>📊 @data:${tableName}</summary>\n\n${result.content}\n</details>`;
    }
    return result.content;
  } catch (err) {
    return `> **@data error:** "${tableName}" — ${err.message}`;
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

/**
 * Render a knowledge base to text content for prompt injection.
 * All bases are block-based documents — content is produced by
 * serializeBlocksToMarkdown() with @-reference resolution.
 *
 * Async because external bases may need to fetch fresh content from a URL.
 */
export async function renderBase(projectPath, id, opts = {}) {
  const base = getBase(projectPath, id);
  if (!base) throw new Error(`Base "${id}" not found`);

  let content = await renderBaseContent(projectPath, base);

  // Resolve @file:, @base:, @data: references
  const visitedBaseIds = new Set([id]);
  const resolvedPlain = resolveReferences(projectPath, content, visitedBaseIds);

  const tokenEstimate = Math.ceil(resolvedPlain.length / 4);

  content = opts.collapsible
    ? resolveReferences(projectPath, content, new Set([id]), { collapsible: true })
    : resolvedPlain;

  // Persist computed token estimate back to the database
  if (tokenEstimate > 0) {
    try {
      const dbPath = join(projectPath, '.jat', 'data.db');
      if (existsSync(dbPath)) {
        const db = openDb(dbPath);
        db.prepare('UPDATE bases SET token_estimate = ? WHERE id = ?').run(tokenEstimate, id);
        db.close();
      }
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

/**
 * Render raw content from a base's blocks (without @-reference resolution).
 * Handles all base types uniformly through the block model:
 * - text blocks → markdown text
 * - table_view blocks → SQL query → markdown table
 * - formula blocks → resolved expressions
 * - control blocks → key-value pairs
 * - external bases (source_config.url) → fetch fresh content
 * - data_table fallback (source_config.context_query, no table_view block) → SQL query
 */
async function renderBaseContent(projectPath, base) {
  const blocks = base.blocks || [];
  const config = base.source_config || {};

  // External bases: fetch fresh content from URL if available
  if (config.url) {
    const hasContent = blocks.some(b => b.type === 'text' && b.content?.trim());
    try {
      const fetched = await fetchExternalContent(config.url);
      if (fetched) {
        // Prepend any existing non-text blocks (controls, table_views) output
        const nonTextContent = serializeBlocksToMarkdown(
          blocks.filter(b => b.type !== 'text'), projectPath
        );
        return nonTextContent ? `${nonTextContent}\n\n${fetched}` : fetched;
      }
    } catch {
      // Fetch failed — fall through to stored block content
    }
    // If fetch failed and blocks have stored content, use that
    if (hasContent) {
      return serializeBlocksToMarkdown(blocks, projectPath);
    }
    return '(external source unavailable)';
  }

  // Data table fallback: bases migrated from source_type=data_table that have
  // a context_query in source_config but no table_view block yet
  if (config.context_query && !blocks.some(b => b.type === 'table_view')) {
    return renderDataTableQuery(projectPath, config.context_query);
  }

  // Standard path: serialize all blocks to markdown
  return serializeBlocksToMarkdown(blocks, projectPath);
}

/**
 * Synchronous version of renderBaseContent for use in @base: reference resolution.
 * Does not fetch external URLs — uses stored block content only.
 */
function renderBaseContentSync(projectPath, base) {
  const blocks = base.blocks || [];
  const config = base.source_config || {};

  if (config.context_query && !blocks.some(b => b.type === 'table_view')) {
    return renderDataTableQuery(projectPath, config.context_query);
  }

  return serializeBlocksToMarkdown(blocks, projectPath);
}

/**
 * Fetch content from an external URL for external-type bases.
 * Converts HTML to basic markdown, returns plain text for other content types.
 * Returns null if the fetch fails (caller should fall back to stored content).
 */
async function fetchExternalContent(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JAT-Agent/1.0 (Knowledge Base Fetch)',
        'Accept': 'text/html, application/json, text/plain, */*',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    const body = await res.text();

    if (contentType.includes('application/json')) {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        return body;
      }
    }

    if (contentType.includes('text/html')) {
      return htmlToBasicMarkdown(body);
    }

    return body;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Basic HTML to markdown conversion for external base content.
 */
function htmlToBasicMarkdown(html) {
  let md = html;
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

/**
 * Serialize an array of blocks to markdown for context injection.
 * This is equivalent to serializeCanvasToMarkdown from canvas.js.
 */
function serializeBlocksToMarkdown(blocks, projectPath) {
  if (!blocks || blocks.length === 0) return '';

  const sections = [];

  // Collect control values
  const cv = {};
  for (const block of blocks) {
    if (block.type === 'control' && block.name && cv[block.name] === undefined) {
      cv[block.name] = block.value;
    }
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'text':
        if (block.content?.trim()) {
          sections.push(block.content.trim());
        }
        break;

      case 'formula': {
        const name = block.name || block.expression;
        let value = '';
        try {
          let expr = block.expression || '';
          expr = expr.replace(/\{(\w+)\}/g, (_, varName) => {
            const v = cv[varName];
            return v !== null && v !== undefined ? String(v) : '';
          });
          value = expr;
        } catch {
          value = block.expression || '';
        }
        if (name) {
          sections.push(`**${name}:** ${value}`);
        }
        break;
      }

      case 'table_view': {
        if (!block.tableName) break;
        try {
          const dataDbPath = join(projectPath, '.jat', 'data.db');
          if (!existsSync(dataDbPath)) {
            sections.push(`*Table: ${block.tableName} (data.db not found)*`);
            break;
          }
          const db = openDb(dataDbPath, true);
          try {
            let sql = `SELECT * FROM "${block.tableName}"`;
            const whereParts = [];
            const params = [];

            if (block.controlFilters) {
              for (const [column, controlName] of Object.entries(block.controlFilters)) {
                const val = cv[controlName];
                if (val !== null && val !== undefined && val !== '') {
                  whereParts.push(`"${column}" = ?`);
                  params.push(String(val));
                }
              }
            }

            if (whereParts.length > 0) {
              sql += ' WHERE ' + whereParts.join(' AND ');
            }

            if (block.sort) {
              const dir = block.sort.direction === 'DESC' ? 'DESC' : 'ASC';
              sql += ` ORDER BY "${block.sort.column}" ${dir}`;
            }

            sql += ' LIMIT 100';

            const rows = db.prepare(sql).all(...params);
            db.close();

            if (rows.length === 0) {
              sections.push(`*Table: ${block.tableName} (no rows)*`);
            } else {
              sections.push(formatMarkdownTable(rows));
            }
          } catch (err) {
            db.close();
            sections.push(`*Table: ${block.tableName} (error: ${err.message})*`);
          }
        } catch (err) {
          sections.push(`*Table: ${block.tableName} (error: ${err.message})*`);
        }
        break;
      }

      case 'control': {
        if (block.name) {
          const val = cv[block.name] ?? block.value ?? '';
          sections.push(`**${block.name}:** ${val}`);
        }
        break;
      }

      case 'divider':
        sections.push('---');
        break;

      case 'action':
        break;

      default:
        break;
    }
  }

  return sections.join('\n\n');
}

/**
 * Render a data_table base using a context_query SQL string.
 */
function renderDataTableQuery(projectPath, contextQuery) {
  const dataDbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dataDbPath)) return '(data.db not found)';

  const db = openDb(dataDbPath, true);
  try {
    const trimmed = contextQuery.trim();
    if (!/^SELECT\b/i.test(trimmed)) {
      db.close();
      return '(context_query must be a SELECT statement)';
    }

    let sql = trimmed;
    if (!/\bLIMIT\b/i.test(sql)) {
      sql = sql.replace(/;?\s*$/, ' LIMIT 100');
    }

    const rows = db.prepare(sql).all();
    db.close();

    if (rows.length === 0) return '(no results)';
    return formatMarkdownTable(rows);
  } catch (error) {
    db.close();
    return `(query error: ${error.message})`;
  }
}

// ---------------------------------------------------------------------------
// Canvas Compatibility Layer
// ---------------------------------------------------------------------------

/**
 * List all bases (canvas pages). Replaces listCanvasPages.
 */
export function listCanvasPages(projectPath, project) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    if (!tableExists(db, 'bases')) {
      db.close();
      return [];
    }
    let rows;
    if (project) {
      rows = db.prepare('SELECT * FROM bases WHERE project = ? ORDER BY updated_at DESC').all(project);
    } else {
      rows = db.prepare('SELECT * FROM bases ORDER BY updated_at DESC').all();
    }
    db.close();
    return rows.map(parseBaseRow);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Get a single canvas page by ID. Replaces getCanvasPage.
 */
export function getCanvasPage(projectPath, pageId) {
  return getBase(projectPath, pageId);
}

/**
 * Create a canvas page. Replaces createCanvasPage.
 */
export function createCanvasPage(projectPath, data) {
  return createBase(projectPath, {
    ...data,
    project: data.project || 'default',
  });
}

/**
 * Update a canvas page. Replaces updateCanvasPage.
 */
export function updateCanvasPage(projectPath, pageId, data) {
  return updateBase(projectPath, pageId, data);
}

/**
 * Delete a canvas page. Replaces deleteCanvasPage.
 */
export function deleteCanvasPage(projectPath, pageId) {
  return deleteBase(projectPath, pageId);
}

/**
 * List canvas base pages. Replaces listCanvasBasePages.
 * In unified model, all records are bases — filter by always_inject for "active" bases.
 */
export function listCanvasBasePages(projectPath, project) {
  return getBases(projectPath, { alwaysInjectOnly: true });
}

/**
 * Serialize a base's blocks to markdown. Replaces serializeCanvasToMarkdown.
 */
export function serializeCanvasToMarkdown(page, projectPath, controlValues = {}) {
  if (!page || !page.blocks || page.blocks.length === 0) return '';
  return serializeBlocksToMarkdown(page.blocks, projectPath);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tableExists(db, tableName) {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  return !!row;
}

function ensureBasesTable(db) {
  if (!tableExists(db, 'bases')) {
    // Create from schema
    const schema = getSchemaSQL();
    db.exec(schema);
  }
  // Ensure required columns exist (inline migration for older databases)
  const columnsToAdd = [
    { name: 'description', sql: 'ALTER TABLE bases ADD COLUMN description TEXT' },
    { name: 'always_inject', sql: 'ALTER TABLE bases ADD COLUMN always_inject INTEGER NOT NULL DEFAULT 0' },
    { name: 'token_estimate', sql: 'ALTER TABLE bases ADD COLUMN token_estimate INTEGER' },
    { name: 'source_config', sql: "ALTER TABLE bases ADD COLUMN source_config TEXT DEFAULT '{}'" },
  ];
  for (const col of columnsToAdd) {
    try {
      db.prepare(`SELECT ${col.name} FROM bases LIMIT 0`).run();
    } catch {
      db.exec(col.sql);
    }
  }
}

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

function buildViewWhere(filters) {
  const whereParts = [];
  const params = [];

  for (const f of filters) {
    const col = `"${f.column}"`;
    const val = f.value ?? '';

    switch (f.operator) {
      case 'equals': whereParts.push(`${col} = ?`); params.push(val); break;
      case 'not_equals': whereParts.push(`${col} != ?`); params.push(val); break;
      case 'contains': whereParts.push(`${col} LIKE ?`); params.push(`%${val}%`); break;
      case 'not_contains': whereParts.push(`${col} NOT LIKE ?`); params.push(`%${val}%`); break;
      case 'starts_with': whereParts.push(`${col} LIKE ?`); params.push(`${val}%`); break;
      case 'ends_with': whereParts.push(`${col} LIKE ?`); params.push(`%${val}`); break;
      case 'greater_than': whereParts.push(`${col} > ?`); params.push(val); break;
      case 'less_than': whereParts.push(`${col} < ?`); params.push(val); break;
      case 'greater_equal': whereParts.push(`${col} >= ?`); params.push(val); break;
      case 'less_equal': whereParts.push(`${col} <= ?`); params.push(val); break;
      case 'is_empty': whereParts.push(`(${col} IS NULL OR ${col} = '')`); break;
      case 'is_not_empty': whereParts.push(`(${col} IS NOT NULL AND ${col} != '')`); break;
      default: whereParts.push(`${col} = ?`); params.push(val); break;
    }
  }

  return { whereParts, params };
}

function parseBaseRow(row) {
  if (!row) return null;
  const blocks = row.blocks ? JSON.parse(row.blocks) : [];
  const sourceConfig = parseJson(row.source_config);

  // Extract legacy content from text blocks for backward compatibility
  const textBlocks = blocks.filter(b => b.type === 'text');
  const content = textBlocks.map(b => b.content).join('\n\n') || null;

  // Extract context_query from source_config for backward compatibility
  const contextQuery = sourceConfig.context_query || null;

  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    project: row.project,
    // Unified fields
    blocks,
    source_config: sourceConfig,
    always_inject: row.always_inject === 1,
    is_base: row.always_inject === 1, // Canvas UI backward compat
    token_estimate: row.token_estimate,
    // Legacy compatibility fields
    source_type: sourceConfig._migrated_source_type || inferSourceType({ blocks, source_config: sourceConfig }),
    content,
    context_query: contextQuery,
    // Timestamps
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function parseJson(str) {
  if (!str) return {};
  try { return JSON.parse(str); }
  catch { return {}; }
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default {
  // Init
  initBasesDb,
  // Validation
  validateSourceType,
  // Bases CRUD
  getBases,
  getBase,
  createBase,
  updateBase,
  deleteBase,
  // Task ↔ Base attachment
  attachBaseToTask,
  detachBaseFromTask,
  getTaskBases,
  // Task ↔ Data Table attachment
  attachTableToTask,
  detachTableFromTask,
  getTaskTables,
  renderDataTable,
  renderDataView,
  // Conversation memory
  findBySenderKey,
  upsertConversationEntry,
  // Search
  searchBases,
  // Render
  renderBase,
  resolveReferences,
  // Canvas compatibility
  listCanvasPages,
  getCanvasPage,
  createCanvasPage,
  updateCanvasPage,
  deleteCanvasPage,
  listCanvasBasePages,
  serializeCanvasToMarkdown,
};
