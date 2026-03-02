/**
 * JAT Knowledge Bases CRUD Library
 *
 * Provides knowledge base management in .jat/bases.db, separate from tasks.db
 * and data.db to avoid WAL contention. Follows the same patterns as lib/data.js.
 */

// @ts-ignore - better-sqlite3 types may not match exactly
import Database from 'better-sqlite3';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, extname } from 'path';
import { randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA_PATH = new URL('./bases-schema.sql', import.meta.url);
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

/**
 * Generate a short random ID for bases.
 * @returns {string}
 */
function generateId() {
  return randomBytes(4).toString('hex');
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const ALLOWED_SOURCE_TYPES = ['manual', 'data_table', 'conversation', 'external'];

/**
 * Validate a source_type value.
 * @param {string} type
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateSourceType(type) {
  if (!type) return { valid: false, error: 'Source type is required' };
  if (!ALLOWED_SOURCE_TYPES.includes(type)) {
    return { valid: false, error: `Source type must be one of: ${ALLOWED_SOURCE_TYPES.join(', ')}` };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

/**
 * Initialize .jat/bases.db with the bootstrap schema.
 * @param {string} projectPath
 * @returns {{ dbPath: string }}
 */
export function initBasesDb(projectPath) {
  const jatDir = join(projectPath, '.jat');
  const dbPath = join(jatDir, 'bases.db');

  if (!existsSync(jatDir)) {
    mkdirSync(jatDir, { recursive: true });
  }

  const db = openDb(dbPath);
  db.exec(getSchemaSQL());

  // Migration: add attached_by column if missing (for existing databases)
  try {
    db.prepare("SELECT attached_by FROM task_bases LIMIT 0").run();
  } catch {
    db.exec("ALTER TABLE task_bases ADD COLUMN attached_by TEXT");
  }

  // Migration: create task_tables if missing (for existing databases)
  try {
    db.prepare("SELECT 1 FROM task_tables LIMIT 0").get();
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
 * @param {string} projectPath
 * @param {Object} [opts]
 * @param {boolean} [opts.alwaysInjectOnly] - Only return bases with always_inject=1
 * @returns {Array<Object>}
 */
export function getBases(projectPath, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    let sql = 'SELECT * FROM bases';
    const params = [];
    if (opts.alwaysInjectOnly) {
      sql += ' WHERE always_inject = 1';
    }
    sql += ' ORDER BY name';

    const rows = db.prepare(sql).all(...params);
    db.close();
    return rows.map(parseBaseRow);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Get a single knowledge base by ID.
 * @param {string} projectPath
 * @param {string} id
 * @returns {Object|null}
 */
export function getBase(projectPath, id) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) return null;

  const db = openDb(dbPath, true);
  try {
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
 * @param {string} projectPath
 * @param {Object} input
 * @param {string} input.name
 * @param {string} [input.description]
 * @param {string} input.source_type
 * @param {string} [input.content]
 * @param {string} [input.context_query]
 * @param {Object} [input.source_config]
 * @param {boolean} [input.always_inject]
 * @param {number} [input.token_estimate]
 * @returns {Object} The created base
 */
export function createBase(projectPath, input) {
  if (!input.name) throw new Error('Name is required');

  const v = validateSourceType(input.source_type);
  if (!v.valid) throw new Error(v.error);

  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) {
    initBasesDb(projectPath);
  }

  const db = openDb(dbPath);
  try {
    const id = generateId();
    const ts = now();

    db.prepare(`
      INSERT INTO bases (id, name, description, source_type, content, context_query, source_config, always_inject, token_estimate, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.name,
      input.description || null,
      input.source_type,
      input.content || null,
      input.context_query || null,
      JSON.stringify(input.source_config || {}),
      input.always_inject ? 1 : 0,
      input.token_estimate || null,
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
 * @param {string} projectPath
 * @param {string} id
 * @param {Object} input - Fields to update
 * @returns {Object} The updated base
 */
export function updateBase(projectPath, id, input) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) throw new Error('No bases.db found');

  if (input.source_type) {
    const v = validateSourceType(input.source_type);
    if (!v.valid) throw new Error(v.error);
  }

  const db = openDb(dbPath);
  try {
    const existing = db.prepare('SELECT * FROM bases WHERE id = ?').get(id);
    if (!existing) {
      db.close();
      throw new Error(`Base "${id}" not found`);
    }

    const fields = [];
    const values = [];

    if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
    if (input.description !== undefined) { fields.push('description = ?'); values.push(input.description); }
    if (input.source_type !== undefined) { fields.push('source_type = ?'); values.push(input.source_type); }
    if (input.content !== undefined) { fields.push('content = ?'); values.push(input.content); }
    if (input.context_query !== undefined) { fields.push('context_query = ?'); values.push(input.context_query); }
    if (input.source_config !== undefined) { fields.push('source_config = ?'); values.push(JSON.stringify(input.source_config)); }
    if (input.always_inject !== undefined) { fields.push('always_inject = ?'); values.push(input.always_inject ? 1 : 0); }
    if (input.token_estimate !== undefined) { fields.push('token_estimate = ?'); values.push(input.token_estimate); }

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
 * @param {string} projectPath
 * @param {string} id
 * @returns {{ changes: number }}
 */
export function deleteBase(projectPath, id) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) throw new Error('No bases.db found');

  const db = openDb(dbPath);
  try {
    // task_bases rows are cascade-deleted via FK
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

/**
 * Attach a knowledge base to a task.
 * @param {string} projectPath
 * @param {string} taskId
 * @param {string} baseId
 * @param {Object} [opts]
 * @param {string} [opts.attached_by] - How the base was attached (e.g., 'manual', 'conversation')
 * @returns {{ attached: boolean }}
 */
export function attachBaseToTask(projectPath, taskId, baseId, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) throw new Error('No bases.db found');

  const db = openDb(dbPath);
  try {
    // Verify base exists
    const base = db.prepare('SELECT id FROM bases WHERE id = ?').get(baseId);
    if (!base) {
      db.close();
      throw new Error(`Base "${baseId}" not found`);
    }

    // Check if already attached
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

/**
 * Detach a knowledge base from a task.
 * @param {string} projectPath
 * @param {string} taskId
 * @param {string} baseId
 * @returns {{ changes: number }}
 */
export function detachBaseFromTask(projectPath, taskId, baseId) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) throw new Error('No bases.db found');

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

/**
 * Get all knowledge bases attached to a task.
 * @param {string} projectPath
 * @param {string} taskId
 * @returns {Array<Object>} Array of bases with attachment info
 */
export function getTaskBases(projectPath, taskId) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
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

/**
 * Attach a data table directly to a task.
 * @param {string} projectPath
 * @param {string} taskId
 * @param {string} tableName - The data table name in data.db
 * @param {string} project - Project key (e.g., "jat")
 * @param {Object} [opts]
 * @param {string} [opts.context_query] - Custom query override
 * @param {string} [opts.attached_by]
 * @returns {{ attached: boolean }}
 */
export function attachTableToTask(projectPath, taskId, tableName, project, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) throw new Error('No bases.db found');

  const db = openDb(dbPath);
  try {
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

/**
 * Detach a data table from a task.
 * @param {string} projectPath
 * @param {string} taskId
 * @param {string} tableName
 * @param {string} project
 * @returns {{ changes: number }}
 */
export function detachTableFromTask(projectPath, taskId, tableName, project) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) throw new Error('No bases.db found');

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

/**
 * Get all data tables attached to a task.
 * @param {string} projectPath
 * @param {string} taskId
 * @returns {Array<{table_name: string, project: string, context_query: string|null, attached_at: string, attached_by: string|null}>}
 */
export function getTaskTables(projectPath, taskId) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    const rows = db.prepare('SELECT * FROM task_tables WHERE task_id = ? ORDER BY attached_at')
      .all(taskId);
    db.close();
    return rows;
  } catch (error) {
    db.close();
    // Table may not exist in older DBs
    if (error.message?.includes('no such table')) return [];
    throw error;
  }
}

/**
 * Render a data table for agent context injection.
 * Uses the task-level context_query override if set, otherwise falls back to
 * the table's default context_query from data.db _tables, or SELECT * LIMIT 50.
 * @param {string} projectPath
 * @param {string} tableName
 * @param {string|null} contextQueryOverride
 * @returns {{ table_name: string, content: string, token_estimate: number }}
 */
export function renderDataTable(projectPath, tableName, contextQueryOverride = null) {
  const dataDbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dataDbPath)) {
    return { table_name: tableName, content: '(data.db not found)', token_estimate: 0 };
  }

  const db = openDb(dataDbPath, true);
  try {
    // Determine the query to run
    let sql = contextQueryOverride;

    // Fallback: table-level context_query from _tables
    if (!sql) {
      const meta = db.prepare('SELECT context_query FROM _tables WHERE name = ?').get(tableName);
      sql = meta?.context_query || null;
    }

    // Fallback: SELECT * LIMIT 50
    if (!sql) {
      sql = `SELECT * FROM "${tableName}" LIMIT 50`;
    }

    // Safety: only allow SELECT queries
    const trimmed = sql.trim();
    if (!/^SELECT\b/i.test(trimmed)) {
      db.close();
      return { table_name: tableName, content: '(query must be a SELECT statement)', token_estimate: 0 };
    }

    // Auto-add LIMIT if missing
    if (!/\bLIMIT\b/i.test(trimmed)) {
      sql = trimmed.replace(/;?\s*$/, ' LIMIT 100');
    }

    const rows = db.prepare(sql).all();
    db.close();

    if (rows.length === 0) {
      return { table_name: tableName, content: '(no results)', token_estimate: 0 };
    }

    // Format as markdown table
    // Sanitize cell values: collapse newlines to spaces, escape pipes, truncate long values
    const sanitize = (v) => { const s = String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|'); return s.length > 120 ? s.slice(0, 117) + '...' : s; };
    const cols = Object.keys(rows[0]);
    const header = '| ' + cols.join(' | ') + ' |';
    const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
    const body = rows.map(row =>
      '| ' + cols.map(c => sanitize(row[c])).join(' | ') + ' |'
    ).join('\n');

    const content = `${header}\n${separator}\n${body}`;
    return { table_name: tableName, content, token_estimate: Math.ceil(content.length / 4) };
  } catch (error) {
    db.close();
    return { table_name: tableName, content: `(query error: ${error.message})`, token_estimate: 0 };
  }
}

// ---------------------------------------------------------------------------
// Conversation Memory
// ---------------------------------------------------------------------------

/**
 * Find a conversation base by sender_key.
 * @param {string} projectPath
 * @param {string} senderKey - e.g., "telegram:-1001234:John"
 * @returns {Object|null}
 */
export function findBySenderKey(projectPath, senderKey) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) return null;

  const db = openDb(dbPath, true);
  try {
    const row = db.prepare(
      "SELECT * FROM bases WHERE source_type = 'conversation' AND json_extract(source_config, '$.sender_key') = ?"
    ).get(senderKey);
    db.close();
    return row ? parseBaseRow(row) : null;
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Upsert a conversation memory entry for a sender.
 * Creates a new conversation base if none exists, or appends to existing content.
 *
 * @param {string} projectPath
 * @param {Object} params
 * @param {string} params.senderKey - Unique sender identifier (e.g., "telegram:-1001234:John")
 * @param {string} params.senderName - Human-readable sender name
 * @param {string} params.entry - Markdown entry to append (dated section)
 * @returns {{ base: Object, created: boolean }}
 */
export function upsertConversationEntry(projectPath, { senderKey, senderName, entry }) {
  if (!senderKey) throw new Error('senderKey is required');
  if (!entry) throw new Error('entry is required');

  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) {
    initBasesDb(projectPath);
  }

  const existing = findBySenderKey(projectPath, senderKey);

  if (existing) {
    // Append to existing content
    const newContent = existing.content
      ? `${existing.content}\n\n---\n\n${entry}`
      : entry;

    const updated = updateBase(projectPath, existing.id, {
      content: newContent,
      token_estimate: Math.ceil(newContent.length / 4),
    });

    return { base: updated, created: false };
  }

  // Create new conversation base
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

/**
 * Search knowledge bases by keyword using FTS5.
 * @param {string} projectPath
 * @param {string} query
 * @param {Object} [opts]
 * @param {number} [opts.limit=20]
 * @returns {Array<Object>}
 */
export function searchBases(projectPath, query, opts = {}) {
  const dbPath = join(projectPath, '.jat', 'bases.db');
  if (!existsSync(dbPath)) return [];

  const { limit = 20 } = opts;

  const db = openDb(dbPath, true);
  try {
    // Use FTS5 MATCH with BM25 ranking
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
    // FTS query syntax errors should return empty, not throw
    if (error.message && error.message.includes('fts5')) {
      return [];
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// @-Reference Resolution
// ---------------------------------------------------------------------------

/** Regex for @-references: @file:path, @base:name, @data:table on their own line */
const REFERENCE_PATTERN = /^@(file|base|data):(.+)$/gm;

/** Map file extensions to language identifiers for code blocks */
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

/**
 * Resolve @-references in content.
 *
 * Supported:
 *   @file:path/to/file  → File contents wrapped in a fenced code block
 *   @base:Base Name     → Rendered base content inlined (recursive)
 *   @data:table_name    → Data table query results as markdown table
 *
 * @param {string} projectPath
 * @param {string} content
 * @param {Set<string>} [visitedBaseIds] - For circular reference detection
 * @param {{ collapsible?: boolean }} [opts] - Options: collapsible wraps resolved refs in <details>
 * @returns {string}
 */
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

/**
 * @file:path → read file, wrap in code block.
 */
function resolveFileRef(projectPath, filePath, collapsible = false) {
  try {
    const fullPath = resolve(join(projectPath, filePath));
    const projectRoot = resolve(projectPath);

    // Security: ensure path stays within project
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

/**
 * @base:Name → find base by name, render recursively.
 */
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

    // Get raw content by source type
    let refContent = '';
    switch (base.source_type) {
      case 'data_table':
        refContent = renderDataTableBase(projectPath, base);
        break;
      default:
        refContent = base.content || '';
    }

    // Recursively resolve @-references in the referenced base
    const resolved = resolveReferences(projectPath, refContent, newVisited, { collapsible });
    if (collapsible) {
      return `<details class="ref-collapse"><summary>📚 @base:${baseName}</summary>\n\n${resolved}\n</details>`;
    }
    return resolved;
  } catch (err) {
    return `> **@base error:** "${baseName}" — ${err.message}`;
  }
}

/**
 * @data:table_name → query data table, format as markdown table.
 */
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
 * Render a knowledge base to its textual content for prompt injection.
 * Dispatches by source_type, then resolves any @-references in the content.
 *
 * Supported @-references (on their own line):
 *   @file:path/to/file  → File contents as code block
 *   @base:Base Name     → Another base's rendered content inline
 *   @data:table_name    → Data table query results as markdown table
 *
 * @param {string} projectPath
 * @param {string} id
 * @param {{ collapsible?: boolean }} [opts] - Options: collapsible wraps resolved refs in <details>
 * @returns {{ id: string, name: string, source_type: string, content: string, token_estimate: number }}
 */
export function renderBase(projectPath, id, opts = {}) {
  const base = getBase(projectPath, id);
  if (!base) throw new Error(`Base "${id}" not found`);

  let content = '';

  switch (base.source_type) {
    case 'manual':
      content = base.content || '';
      break;

    case 'data_table':
      content = renderDataTableBase(projectPath, base);
      break;

    case 'conversation':
      content = base.content || '';
      break;

    case 'external':
      content = base.content || '';
      break;

    default:
      content = base.content || '';
  }

  // Resolve @file:, @base:, @data: references
  const visitedBaseIds = new Set([id]); // Include self to prevent self-reference
  const resolvedPlain = resolveReferences(projectPath, content, visitedBaseIds);

  // Token estimate on plain resolved content (no HTML wrapping)
  const tokenEstimate = Math.ceil(resolvedPlain.length / 4);

  // For preview: optionally wrap in collapsible <details> elements
  content = opts.collapsible
    ? resolveReferences(projectPath, content, new Set([id]), { collapsible: true })
    : resolvedPlain;

  return {
    id: base.id,
    name: base.name,
    source_type: base.source_type,
    content,
    token_estimate: tokenEstimate,
  };
}

/**
 * Render a data_table base by running context_query against data.db.
 * Returns results as a markdown table.
 * @param {string} projectPath
 * @param {Object} base
 * @returns {string}
 */
function renderDataTableBase(projectPath, base) {
  if (!base.context_query) {
    return base.content || '(no context query defined)';
  }

  const dataDbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dataDbPath)) {
    return '(data.db not found)';
  }

  const db = openDb(dataDbPath, true);
  try {
    // Safety: only allow SELECT queries
    const trimmed = base.context_query.trim();
    if (!/^SELECT\b/i.test(trimmed)) {
      db.close();
      return '(context_query must be a SELECT statement)';
    }

    // Auto-add LIMIT if missing
    let sql = trimmed;
    if (!/\bLIMIT\b/i.test(sql)) {
      sql = sql.replace(/;?\s*$/, ' LIMIT 100');
    }

    const rows = db.prepare(sql).all();
    db.close();

    if (rows.length === 0) return '(no results)';

    // Format as markdown table
    // Sanitize cell values: collapse newlines to spaces, escape pipes, truncate long values
    const sanitize = (v) => { const s = String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|'); return s.length > 120 ? s.slice(0, 117) + '...' : s; };
    const cols = Object.keys(rows[0]);
    const header = '| ' + cols.join(' | ') + ' |';
    const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
    const body = rows.map(row =>
      '| ' + cols.map(c => sanitize(row[c])).join(' | ') + ' |'
    ).join('\n');

    return `${header}\n${separator}\n${body}`;
  } catch (error) {
    db.close();
    return `(query error: ${error.message})`;
  }
}

// ---------------------------------------------------------------------------
// Row Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a raw database row into the application shape.
 * @param {Object} row
 * @returns {Object}
 */
function parseBaseRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    source_type: row.source_type,
    content: row.content,
    context_query: row.context_query,
    source_config: parseJson(row.source_config),
    always_inject: row.always_inject === 1,
    token_estimate: row.token_estimate,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Safely parse a JSON string.
 * @param {string|null} str
 * @returns {Object}
 */
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
  // Conversation memory
  findBySenderKey,
  upsertConversationEntry,
  // Search
  searchBases,
  // Render
  renderBase,
  resolveReferences,
};
