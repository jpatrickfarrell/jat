#!/usr/bin/env node
/**
 * One-time backfill: populate tasks.source / source_item_id / metadata on
 * existing tasks so that pre-ingest-clean-break data matches the new schema.
 *
 * Strategy per project:
 *   1. JOIN ingested_items → tasks on task_id (when ingest.db exists)
 *        source          = origin_adapter_type
 *        source_item_id  = item_id
 *        metadata        = origin_metadata
 *   2. labels_text LIKE '%voice%'  AND source IS NULL → source = 'voice'
 *   3. labels_text LIKE '%widget%' AND source IS NULL → source = 'feedback-widget'
 *
 * Idempotent: every UPDATE is gated on `source IS NULL` (or, for step 1, on
 * source/source_item_id/metadata all being NULL) so re-running is a no-op.
 *
 * Usage:
 *   node scripts/migrate-ingest-to-tasks.js [--dry-run] [--project NAME]
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import Database from 'better-sqlite3';

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_PROJECT = process.argv.includes('--project')
  ? process.argv[process.argv.indexOf('--project') + 1]
  : null;

function loadProjects() {
  const cfgPath = join(homedir(), '.config', 'jat', 'projects.json');
  if (!existsSync(cfgPath)) throw new Error(`Not found: ${cfgPath}`);
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'));
  return Object.entries(cfg.projects || {}).map(([key, p]) => ({
    key,
    path: (p.path || '').replace(/^~/, homedir()),
  }));
}

function migrateProject(project) {
  const tasksDbPath = join(project.path, '.jat', 'tasks.db');
  const ingestDbPath = join(project.path, '.jat', 'ingest.db');

  if (!existsSync(tasksDbPath)) return null;

  const db = new Database(tasksDbPath);
  const result = {
    project: project.key,
    fromIngest: 0,
    voiceFallback: 0,
    widgetFallback: 0,
    alreadySet: 0,
    totalTasks: 0,
  };

  try {
    // Ensure source/source_item_id/metadata columns exist (mirrors
    // ensureSourceColumns from lib/tasks-sqlite.js — projects whose tasks.db
    // hasn't been opened since the schema change won't have them yet).
    const cols = db.pragma('table_info(tasks)');
    if (cols.length === 0) return null;
    const names = cols.map(c => c.name);
    if (!names.includes('source')) db.exec('ALTER TABLE tasks ADD COLUMN source TEXT');
    if (!names.includes('source_item_id')) db.exec('ALTER TABLE tasks ADD COLUMN source_item_id TEXT');
    if (!names.includes('metadata')) db.exec('ALTER TABLE tasks ADD COLUMN metadata TEXT');
    db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_source_item ON tasks(source, source_item_id) WHERE source_item_id IS NOT NULL'
    );

    result.totalTasks = db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n;
    result.alreadySet = db.prepare(
      'SELECT COUNT(*) AS n FROM tasks WHERE source IS NOT NULL'
    ).get().n;

    db.exec('BEGIN');

    // Step 1: read ingested_items via a separate readonly connection (the
    // ingest daemon may have the db locked for writes) and UPSERT into tasks.
    if (existsSync(ingestDbPath)) {
      const ingestDb = new Database(ingestDbPath, { readonly: true, fileMustExist: true });
      try {
        const hasTbl = ingestDb.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='ingested_items'"
        ).get();
        if (hasTbl) {
          const rows = ingestDb.prepare(`
            SELECT task_id, origin_adapter_type, item_id, origin_metadata
            FROM ingested_items
            WHERE task_id IS NOT NULL
          `).all();
          const upd = db.prepare(`
            UPDATE tasks
            SET
              source = COALESCE(source, ?),
              source_item_id = COALESCE(source_item_id, ?),
              metadata = COALESCE(metadata, ?)
            WHERE id = ?
              AND (source IS NULL OR source_item_id IS NULL OR metadata IS NULL)
          `);
          for (const r of rows) {
            const info = upd.run(r.origin_adapter_type, r.item_id, r.origin_metadata, r.task_id);
            result.fromIngest += info.changes;
          }
        }
      } finally {
        ingestDb.close();
      }
    }

    // Step 2: voice label fallback
    const voiceUpd = db.prepare(`
      UPDATE tasks
      SET source = 'voice'
      WHERE source IS NULL AND labels_text LIKE '%voice%'
    `).run();
    result.voiceFallback = voiceUpd.changes;

    // Step 3: widget label fallback
    const widgetUpd = db.prepare(`
      UPDATE tasks
      SET source = 'feedback-widget'
      WHERE source IS NULL AND labels_text LIKE '%widget%'
    `).run();
    result.widgetFallback = widgetUpd.changes;

    if (DRY_RUN) {
      db.exec('ROLLBACK');
    } else {
      db.exec('COMMIT');
    }
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch {}
    throw err;
  } finally {
    db.close();
  }

  return result;
}

function main() {
  const projects = loadProjects().filter(p =>
    p.path && existsSync(p.path) && (!ONLY_PROJECT || p.key === ONLY_PROJECT)
  );

  if (DRY_RUN) console.log('── DRY RUN (no writes) ──');
  console.log(`Scanning ${projects.length} projects…\n`);

  const totals = { fromIngest: 0, voiceFallback: 0, widgetFallback: 0, projects: 0 };
  const results = [];

  for (const project of projects) {
    try {
      const r = migrateProject(project);
      if (!r) continue;
      results.push(r);
      totals.projects++;
      totals.fromIngest += r.fromIngest;
      totals.voiceFallback += r.voiceFallback;
      totals.widgetFallback += r.widgetFallback;

      const touched = r.fromIngest + r.voiceFallback + r.widgetFallback;
      if (touched === 0 && r.totalTasks === 0) continue;
      console.log(
        `  ${project.key.padEnd(22)} ` +
        `tasks=${r.totalTasks} ` +
        `ingest=${r.fromIngest} voice=${r.voiceFallback} widget=${r.widgetFallback} ` +
        `(already-set: ${r.alreadySet})`
      );
    } catch (err) {
      console.error(`  ${project.key}: ERROR — ${err.message}`);
    }
  }

  console.log('\n── Summary ──');
  console.log(`  projects scanned:      ${totals.projects}`);
  console.log(`  updated from ingest:   ${totals.fromIngest}`);
  console.log(`  voice label fallback:  ${totals.voiceFallback}`);
  console.log(`  widget label fallback: ${totals.widgetFallback}`);
  if (DRY_RUN) console.log('\n(dry-run — no changes committed)');
}

main();
