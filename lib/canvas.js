/**
 * JAT Canvas Pages — CRUD operations for block-based interactive documents.
 *
 * Canvas pages are stored in .jat/data.db alongside data tables.
 * Blocks are stored as a JSON text column (like views store filters).
 *
 * Follows the same patterns as lib/data.js (openDb, WAL, touchLastTouched).
 */

import Database from 'better-sqlite3';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Helpers (same as data.js)
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
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const CANVAS_SCHEMA = `CREATE TABLE IF NOT EXISTS _canvas_pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  project TEXT NOT NULL,
  blocks TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

/**
 * Ensure _canvas_pages table exists in data.db (write mode only).
 * @param {import('better-sqlite3').Database} db
 */
function ensureCanvasTable(db) {
  db.exec(CANVAS_SCHEMA);

  // Migration: add is_base column if missing
  try {
    db.prepare('SELECT is_base FROM _canvas_pages LIMIT 0').run();
  } catch {
    db.exec('ALTER TABLE _canvas_pages ADD COLUMN is_base INTEGER DEFAULT 0');
  }
}

/**
 * Check if _canvas_pages table exists (safe for readonly mode).
 * @param {import('better-sqlite3').Database} db
 * @returns {boolean}
 */
function canvasTableExists(db) {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_canvas_pages'").get();
  return !!row;
}

/**
 * Parse a canvas page row, deserializing JSON fields.
 * @param {object} row
 * @returns {object}
 */
function parseRow(row) {
  if (!row) return null;
  return {
    ...row,
    blocks: row.blocks ? JSON.parse(row.blocks) : [],
    is_base: row.is_base === 1,
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * List all canvas pages for a project.
 * @param {string} projectPath
 * @param {string} [project] - Filter by project name (optional)
 * @returns {Array<object>}
 */
export function listCanvasPages(projectPath, project) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    if (!canvasTableExists(db)) {
      db.close();
      return [];
    }
    let rows;
    if (project) {
      rows = db.prepare('SELECT * FROM _canvas_pages WHERE project = ? ORDER BY updated_at DESC').all(project);
    } else {
      rows = db.prepare('SELECT * FROM _canvas_pages ORDER BY updated_at DESC').all();
    }
    db.close();
    return rows.map(parseRow);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Get a single canvas page by ID.
 * @param {string} projectPath
 * @param {string} pageId
 * @returns {object|null}
 */
export function getCanvasPage(projectPath, pageId) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return null;

  const db = openDb(dbPath, true);
  try {
    if (!canvasTableExists(db)) {
      db.close();
      return null;
    }
    const row = db.prepare('SELECT * FROM _canvas_pages WHERE id = ?').get(pageId);
    db.close();
    return parseRow(row);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Create a new canvas page.
 * @param {string} projectPath
 * @param {object} data - { name, project, blocks? }
 * @returns {object} The created canvas page
 */
export function createCanvasPage(projectPath, data) {
  if (!data.name) throw new Error('Canvas page name is required');
  if (!data.project) throw new Error('Canvas page project is required');

  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) {
    const jatDir = join(projectPath, '.jat');
    if (!existsSync(jatDir)) mkdirSync(jatDir, { recursive: true });
  }

  const db = openDb(dbPath);
  try {
    ensureCanvasTable(db);

    const id = data.id || generateId();
    const ts = now();

    db.prepare(`INSERT INTO _canvas_pages (id, name, project, blocks, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.project,
      JSON.stringify(data.blocks || []),
      ts,
      ts,
    );

    touchLastTouched(projectPath);
    const created = db.prepare('SELECT * FROM _canvas_pages WHERE id = ?').get(id);
    db.close();
    return parseRow(created);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Update an existing canvas page.
 * @param {string} projectPath
 * @param {string} pageId
 * @param {object} data - { name?, blocks? }
 * @returns {object} The updated canvas page
 */
export function updateCanvasPage(projectPath, pageId, data) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    ensureCanvasTable(db);
    const existing = db.prepare('SELECT * FROM _canvas_pages WHERE id = ?').get(pageId);
    if (!existing) throw new Error(`Canvas page not found: ${pageId}`);

    const ts = now();
    const sets = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      if (['id', 'created_at'].includes(key)) continue;
      if (key === 'blocks') {
        sets.push('blocks = ?');
        params.push(JSON.stringify(value));
      } else if (key === 'is_base') {
        sets.push('is_base = ?');
        params.push(value ? 1 : 0);
      } else {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }

    sets.push('updated_at = ?');
    params.push(ts);
    params.push(pageId);

    db.prepare(`UPDATE _canvas_pages SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    touchLastTouched(projectPath);

    const updated = db.prepare('SELECT * FROM _canvas_pages WHERE id = ?').get(pageId);
    db.close();
    return parseRow(updated);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Delete a canvas page.
 * @param {string} projectPath
 * @param {string} pageId
 * @returns {{ success: boolean }}
 */
export function deleteCanvasPage(projectPath, pageId) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) throw new Error('No data.db found');

  const db = openDb(dbPath);
  try {
    ensureCanvasTable(db);
    const result = db.prepare('DELETE FROM _canvas_pages WHERE id = ?').run(pageId);
    touchLastTouched(projectPath);
    db.close();
    return { success: result.changes > 0 };
  } catch (error) {
    db.close();
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Canvas-as-Base: serialization and base page listing
// ---------------------------------------------------------------------------

/**
 * List canvas pages flagged as knowledge bases for a project.
 * @param {string} projectPath
 * @param {string} [project] - Filter by project name
 * @returns {Array<object>}
 */
export function listCanvasBasePages(projectPath, project) {
  const dbPath = join(projectPath, '.jat', 'data.db');
  if (!existsSync(dbPath)) return [];

  const db = openDb(dbPath, true);
  try {
    if (!canvasTableExists(db)) {
      db.close();
      return [];
    }
    // Check if is_base column exists
    try {
      db.prepare('SELECT is_base FROM _canvas_pages LIMIT 0').run();
    } catch {
      db.close();
      return [];
    }
    let rows;
    if (project) {
      rows = db.prepare('SELECT * FROM _canvas_pages WHERE is_base = 1 AND project = ? ORDER BY updated_at DESC').all(project);
    } else {
      rows = db.prepare('SELECT * FROM _canvas_pages WHERE is_base = 1 ORDER BY updated_at DESC').all();
    }
    db.close();
    return rows.map(parseRow);
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Serialize a canvas page's blocks to markdown for knowledge base injection.
 *
 * Block serialization rules:
 *   - Text blocks → markdown content as-is
 *   - Formula blocks → "**{name}:** {computed_value}" or just the value
 *   - Table view blocks → markdown table (fetched from data.db)
 *   - Control blocks → "**{name}:** {current_value}"
 *   - Divider blocks → "---"
 *   - Action blocks → omitted (not relevant for context)
 *
 * @param {object} page - Canvas page with blocks
 * @param {string} projectPath - Project path for data.db access
 * @param {Record<string, unknown>} [controlValues] - Current control values
 * @returns {string} Markdown content
 */
export function serializeCanvasToMarkdown(page, projectPath, controlValues = {}) {
  if (!page || !page.blocks || page.blocks.length === 0) return '';

  const sections = [];

  // First pass: collect control values from blocks if not provided
  const cv = { ...controlValues };
  for (const block of page.blocks) {
    if (block.type === 'control' && block.name && cv[block.name] === undefined) {
      cv[block.name] = block.value;
    }
  }

  for (const block of page.blocks) {
    switch (block.type) {
      case 'text':
        if (block.content?.trim()) {
          sections.push(block.content.trim());
        }
        break;

      case 'formula': {
        const name = block.name || block.expression;
        // Try to evaluate the formula if possible
        let value = '';
        try {
          // Resolve {varName} references in the expression
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
            // Build query with control filters
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
              // Format as markdown table
              const cols = Object.keys(rows[0]);
              const sanitize = (v) => {
                const s = String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
                return s.length > 120 ? s.slice(0, 117) + '...' : s;
              };
              const header = '| ' + cols.join(' | ') + ' |';
              const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
              const body = rows.map(row =>
                '| ' + cols.map(c => sanitize(row[c])).join(' | ') + ' |'
              ).join('\n');
              sections.push(`${header}\n${separator}\n${body}`);
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
        // Omitted — not relevant for context injection
        break;

      default:
        break;
    }
  }

  return sections.join('\n\n');
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default {
  listCanvasPages,
  getCanvasPage,
  createCanvasPage,
  updateCanvasPage,
  deleteCanvasPage,
  listCanvasBasePages,
  serializeCanvasToMarkdown,
};
