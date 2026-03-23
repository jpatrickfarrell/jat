#!/usr/bin/env node

/**
 * Migration: Unify bases.db and _canvas_pages into a single `bases` table in data.db.
 *
 * What this script does:
 * 1. Adds new columns to _canvas_pages in data.db (description, always_inject, token_estimate, source_config)
 * 2. Renames _canvas_pages → bases
 * 3. Converts each bases.db record into block format and inserts into the new bases table
 * 4. Copies task_bases and task_tables from bases.db → data.db
 * 5. Creates FTS5 index + triggers on the new bases table
 * 6. Renames bases.db → bases.db.bak (backup)
 *
 * Usage:
 *   node migrate-bases-to-canvas.js [project-path]
 *   node migrate-bases-to-canvas.js --dry-run [project-path]
 *
 * Default project-path: current directory (looks for .jat/ subdirectory)
 */

import Database from 'better-sqlite3';
import { existsSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const projectPath = args.filter(a => a !== '--dry-run')[0] || process.cwd();
const jatDir = join(projectPath, '.jat');
const basesDbPath = join(jatDir, 'bases.db');
const dataDbPath = join(jatDir, 'data.db');

function log(msg) { console.log(`[migrate] ${msg}`); }
function warn(msg) { console.warn(`[migrate] ⚠️  ${msg}`); }
function err(msg) { console.error(`[migrate] ❌ ${msg}`); }

function generateBlockId() {
  return randomBytes(4).toString('hex');
}

// ---------------------------------------------------------------------------
// Preflight checks
// ---------------------------------------------------------------------------

if (!existsSync(jatDir)) {
  err(`No .jat directory found at ${projectPath}`);
  process.exit(1);
}

if (!existsSync(dataDbPath)) {
  err(`No data.db found at ${dataDbPath}`);
  process.exit(1);
}

// Check if already migrated (bases table exists in data.db)
{
  const db = new Database(dataDbPath, { readonly: true });
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bases'").get();
  db.close();
  if (row) {
    log('Migration already complete — `bases` table exists in data.db');
    process.exit(0);
  }
}

if (!existsSync(basesDbPath)) {
  warn('No bases.db found — will just rename _canvas_pages and add columns');
}

log(`Project path: ${projectPath}`);
log(`Dry run: ${dryRun}`);
log('');

// ---------------------------------------------------------------------------
// Step 1: Open databases
// ---------------------------------------------------------------------------

const dataDb = new Database(dataDbPath);
dataDb.pragma('journal_mode = WAL');
dataDb.pragma('foreign_keys = ON');

let basesDb = null;
if (existsSync(basesDbPath)) {
  basesDb = new Database(basesDbPath, { readonly: true });
}

// ---------------------------------------------------------------------------
// Step 2: Add missing columns to _canvas_pages
// ---------------------------------------------------------------------------

log('Step 1: Adding columns to _canvas_pages...');

const columnsToAdd = [
  { name: 'description', sql: 'ALTER TABLE _canvas_pages ADD COLUMN description TEXT' },
  { name: 'always_inject', sql: 'ALTER TABLE _canvas_pages ADD COLUMN always_inject INTEGER NOT NULL DEFAULT 0' },
  { name: 'token_estimate', sql: 'ALTER TABLE _canvas_pages ADD COLUMN token_estimate INTEGER' },
  { name: 'source_config', sql: "ALTER TABLE _canvas_pages ADD COLUMN source_config TEXT DEFAULT '{}'" },
];

for (const col of columnsToAdd) {
  try {
    dataDb.prepare(`SELECT ${col.name} FROM _canvas_pages LIMIT 0`).run();
    log(`  Column '${col.name}' already exists`);
  } catch {
    if (!dryRun) {
      dataDb.exec(col.sql);
    }
    log(`  Added column '${col.name}'`);
  }
}

// ---------------------------------------------------------------------------
// Step 3: Rename _canvas_pages → bases
// ---------------------------------------------------------------------------

log('Step 2: Renaming _canvas_pages → bases...');

if (!dryRun) {
  // Drop is_base column by recreating table (SQLite doesn't support DROP COLUMN before 3.35)
  // Actually, we want to keep all data. Let's rename first, then we can drop is_base later.
  dataDb.exec('ALTER TABLE _canvas_pages RENAME TO bases');
}
log('  Done');

// ---------------------------------------------------------------------------
// Step 4: Migrate bases.db records into the new bases table
// ---------------------------------------------------------------------------

if (basesDb) {
  const oldBases = basesDb.prepare('SELECT * FROM bases').all();
  log(`Step 3: Migrating ${oldBases.length} bases from bases.db...`);

  const insertStmt = !dryRun ? dataDb.prepare(`
    INSERT OR IGNORE INTO bases (id, name, project, blocks, description, always_inject, token_estimate, source_config, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `) : null;

  for (const base of oldBases) {
    // Convert content to blocks based on source_type
    const blocks = convertBaseToBlocks(base);
    const blocksJson = JSON.stringify(blocks);

    // Merge source_config: preserve existing + add source_type for reference
    const existingConfig = safeParseJson(base.source_config);
    const sourceConfig = {
      ...existingConfig,
      _migrated_source_type: base.source_type,
    };
    // For data_table bases, preserve context_query in source_config
    if (base.source_type === 'data_table' && base.context_query) {
      sourceConfig.context_query = base.context_query;
    }

    log(`  [${base.source_type}] ${base.name} (${base.id}) → ${blocks.length} block(s)`);

    if (!dryRun) {
      insertStmt.run(
        base.id,
        base.name,
        'jat',  // Default project — bases.db didn't have project field
        blocksJson,
        base.description || null,
        base.always_inject || 0,
        base.token_estimate || null,
        JSON.stringify(sourceConfig),
        base.created_at,
        base.updated_at,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Step 5: Copy task_bases from bases.db → data.db
  // ---------------------------------------------------------------------------

  log('Step 4: Copying task_bases...');

  if (!dryRun) {
    dataDb.exec(`CREATE TABLE IF NOT EXISTS task_bases (
      task_id TEXT NOT NULL,
      base_id TEXT NOT NULL,
      attached_at TEXT NOT NULL,
      attached_by TEXT,
      PRIMARY KEY (task_id, base_id),
      FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE
    )`);
  }

  try {
    const taskBases = basesDb.prepare('SELECT * FROM task_bases').all();
    log(`  ${taskBases.length} task_bases records`);

    if (!dryRun && taskBases.length > 0) {
      const insertTb = dataDb.prepare(
        'INSERT OR IGNORE INTO task_bases (task_id, base_id, attached_at, attached_by) VALUES (?, ?, ?, ?)'
      );
      for (const tb of taskBases) {
        insertTb.run(tb.task_id, tb.base_id, tb.attached_at, tb.attached_by || null);
      }
    }
  } catch (e) {
    warn(`task_bases: ${e.message}`);
  }

  // ---------------------------------------------------------------------------
  // Step 6: Copy task_tables from bases.db → data.db
  // ---------------------------------------------------------------------------

  log('Step 5: Copying task_tables...');

  if (!dryRun) {
    dataDb.exec(`CREATE TABLE IF NOT EXISTS task_tables (
      task_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      project TEXT NOT NULL,
      context_query TEXT,
      attached_at TEXT NOT NULL,
      attached_by TEXT,
      PRIMARY KEY (task_id, table_name, project)
    )`);
  }

  try {
    const taskTables = basesDb.prepare('SELECT * FROM task_tables').all();
    log(`  ${taskTables.length} task_tables records`);

    if (!dryRun && taskTables.length > 0) {
      const insertTt = dataDb.prepare(
        'INSERT OR IGNORE INTO task_tables (task_id, table_name, project, context_query, attached_at, attached_by) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const tt of taskTables) {
        insertTt.run(tt.task_id, tt.table_name, tt.project, tt.context_query || null, tt.attached_at, tt.attached_by || null);
      }
    }
  } catch (e) {
    warn(`task_tables: ${e.message}`);
  }

  basesDb.close();
} else {
  log('Step 3-5: No bases.db to migrate');
}

// ---------------------------------------------------------------------------
// Step 7: Create FTS5 index on the unified bases table
// ---------------------------------------------------------------------------

log('Step 6: Creating FTS5 index...');

if (!dryRun) {
  // FTS5 on name and description (blocks is JSON, not good for FTS)
  dataDb.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS bases_fts USING fts5(
    name,
    description,
    content='bases',
    content_rowid='rowid'
  )`);

  // Triggers to keep FTS in sync
  dataDb.exec(`CREATE TRIGGER IF NOT EXISTS bases_fts_ai AFTER INSERT ON bases BEGIN
    INSERT INTO bases_fts(rowid, name, description)
    VALUES (new.rowid, new.name, new.description);
  END`);

  dataDb.exec(`CREATE TRIGGER IF NOT EXISTS bases_fts_ad AFTER DELETE ON bases BEGIN
    INSERT INTO bases_fts(bases_fts, rowid, name, description)
    VALUES ('delete', old.rowid, old.name, old.description);
  END`);

  dataDb.exec(`CREATE TRIGGER IF NOT EXISTS bases_fts_au AFTER UPDATE ON bases BEGIN
    INSERT INTO bases_fts(bases_fts, rowid, name, description)
    VALUES ('delete', old.rowid, old.name, old.description);
    INSERT INTO bases_fts(rowid, name, description)
    VALUES (new.rowid, new.name, new.description);
  END`);

  // Populate FTS from existing data
  dataDb.exec(`INSERT INTO bases_fts(rowid, name, description)
    SELECT rowid, name, description FROM bases`);
}

log('  Done');

// ---------------------------------------------------------------------------
// Step 8: Backup bases.db
// ---------------------------------------------------------------------------

if (existsSync(basesDbPath)) {
  const backupPath = basesDbPath + '.bak';
  log(`Step 7: Backing up bases.db → bases.db.bak`);
  if (!dryRun) {
    copyFileSync(basesDbPath, backupPath);
    // Also copy WAL/SHM if they exist
    if (existsSync(basesDbPath + '-wal')) copyFileSync(basesDbPath + '-wal', backupPath + '-wal');
    if (existsSync(basesDbPath + '-shm')) copyFileSync(basesDbPath + '-shm', backupPath + '-shm');
  }
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

dataDb.close();

log('');
log('✅ Migration complete!');
log('');
log('Summary:');
log('  - _canvas_pages renamed to bases in data.db');
log('  - New columns: description, always_inject, token_estimate, source_config');
log('  - Bases from bases.db converted to block format');
log('  - task_bases and task_tables copied to data.db');
log('  - FTS5 index created on bases table');
log('  - bases.db backed up to bases.db.bak');

if (dryRun) {
  log('');
  log('(Dry run — no changes were made)');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a bases.db record into an array of CanvasBlock objects.
 */
function convertBaseToBlocks(base) {
  const blocks = [];

  switch (base.source_type) {
    case 'manual':
    case 'conversation':
    case 'external':
      // All text-content bases become a single TextBlock
      if (base.content) {
        blocks.push({
          type: 'text',
          id: generateBlockId(),
          content: base.content,
        });
      }
      break;

    case 'data_table': {
      // data_table bases become a TableViewBlock
      // Try to extract table name from context_query
      const tableName = extractTableName(base.context_query);
      if (tableName) {
        blocks.push({
          type: 'table_view',
          id: generateBlockId(),
          tableName,
          controlFilters: {},
        });
      }
      // If there's also descriptive content, add it as a text block
      if (base.content) {
        blocks.push({
          type: 'text',
          id: generateBlockId(),
          content: base.content,
        });
      }
      break;
    }

    default:
      // Unknown source type — preserve content as text
      if (base.content) {
        blocks.push({
          type: 'text',
          id: generateBlockId(),
          content: base.content,
        });
      }
  }

  return blocks;
}

/**
 * Try to extract the table name from a SQL context_query.
 * e.g., "SELECT * FROM my_table LIMIT 50" → "my_table"
 */
function extractTableName(sql) {
  if (!sql) return null;
  const match = sql.match(/FROM\s+["']?(\w+)["']?/i);
  return match ? match[1] : null;
}

function safeParseJson(str) {
  if (!str) return {};
  try { return JSON.parse(str); }
  catch { return {}; }
}
