#!/usr/bin/env node
/**
 * One-shot backfill: restore status + closed_at on meadow project_tasks rows
 * from SQLite backup, keyed by jat_id.
 *
 * The graduation pipeline forced all imported rows to status='dev'. This
 * script reads the pre-graduation SQLite snapshot and writes the real
 * status back into Postgres using the JAT→PT status mapping.
 *
 * Usage:
 *   node /tmp/backfill-meadow-status.mjs            # dry run
 *   node /tmp/backfill-meadow-status.mjs --apply    # execute updates
 */

import Database from 'better-sqlite3';
import pg from 'pg';
import { statusToProjectTasks } from '/home/jw/code/jat/lib/project-tasks-mapping.js';

const SQLITE_BACKUP = '/home/jw/code/meadow/.jat/tasks.db.sqlite-backup-2026-04-12T15-13-05-655Z';
const PG_URL = 'postgresql://postgres:hZlgNGgOZvtlfZp6@db.svgmzkgkoipaieknmvuk.supabase.co:5432/postgres';
const APPLY = process.argv.includes('--apply');

const sqlite = new Database(SQLITE_BACKUP, { readonly: true });
const rows = sqlite.prepare(
  `SELECT id, status, closed_at, close_reason FROM tasks`
).all();

console.log(`SQLite backup: ${rows.length} rows`);
const buckets = {};
for (const r of rows) buckets[r.status] = (buckets[r.status] || 0) + 1;
console.log('Status breakdown:', buckets);

// Map each SQLite row to the PT status we want it to end up with.
// Pass no defaultStatus so real status is preserved.
const updates = rows.map((r) => ({
  jat_id: r.id,
  pt_status: statusToProjectTasks(r.status),  // open→dev, in_progress→in_progress, closed→completed, blocked→blocked
  closed_at: r.closed_at || null,
  close_reason: r.close_reason || '',
}));

const targetStatuses = {};
for (const u of updates) targetStatuses[u.pt_status] = (targetStatuses[u.pt_status] || 0) + 1;
console.log('Target PT statuses:', targetStatuses);

if (!APPLY) {
  console.log('\nDry run — pass --apply to execute.');
  console.log('Sample updates:');
  for (const u of updates.slice(0, 5)) console.log(' ', u);
  process.exit(0);
}

const pool = new pg.Pool({ connectionString: PG_URL, max: 3 });
const client = await pool.connect();
let updated = 0;
let skipped = 0;
try {
  await client.query('BEGIN');
  for (const u of updates) {
    const res = await client.query(
      `UPDATE project_tasks
         SET status = $2,
             closed_at = $3::timestamptz,
             close_reason = $4
       WHERE jat_id = $1`,
      [u.jat_id, u.pt_status, u.closed_at, u.close_reason],
    );
    if (res.rowCount > 0) updated += res.rowCount;
    else skipped++;
  }
  await client.query('COMMIT');
  console.log(`\nUpdated: ${updated}`);
  console.log(`No-match (jat_id not in project_tasks): ${skipped}`);
} catch (e) {
  await client.query('ROLLBACK');
  console.error('ROLLBACK —', e.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
