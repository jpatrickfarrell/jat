#!/usr/bin/env node
/**
 * sync-sqlite-to-postgres.mjs
 *
 * Backfill tasks that exist in a project's local SQLite tasks.db but are
 * missing from the Postgres backend.  Safe to run on an already-graduated
 * project — skips any task whose jat_id already exists in project_tasks.
 *
 * Usage:
 *   node sync-sqlite-to-postgres.mjs <project-name-or-path>
 *   node sync-sqlite-to-postgres.mjs meadow --dry-run
 *   node sync-sqlite-to-postgres.mjs meadow --close meadow-q0g3d.1,meadow-q0g3d.2
 *
 * Options:
 *   --dry-run          Print what would be imported without writing
 *   --close <ids>      Comma-separated task IDs to force-close in Postgres
 *   --sqlite <path>    Explicit path to tasks.db (default: <project>/.jat/tasks.db)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
import Database from 'better-sqlite3';

import {
  mapTaskRow,
  buildIdMap,
  insertProjectTaskSQL,
  UPDATE_PARENT_SQL,
} from '../../../jat/lib/project-tasks-mapping.js';

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readProjects() {
  const raw = readFileSync(CONFIG_PATH, 'utf-8');
  const cfg = JSON.parse(raw);
  return cfg.projects || cfg; // handle both array and object formats
}

function resolveProject(nameOrPath) {
  const projects = readProjects();
  // Object-keyed format
  if (projects && typeof projects === 'object' && !Array.isArray(projects)) {
    for (const [key, val] of Object.entries(projects)) {
      if (key === nameOrPath || val.name === nameOrPath || val.path === nameOrPath) {
        return { name: key, config: val };
      }
    }
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const closeIdx = args.indexOf('--close');
  const closeIds = closeIdx !== -1 ? args[closeIdx + 1].split(',').map(s => s.trim()) : [];
  const sqliteIdx = args.indexOf('--sqlite');
  const explicitSqlite = sqliteIdx !== -1 ? args[sqliteIdx + 1] : null;
  // Flag-value pairs: skip the values after --close and --sqlite
  const flagValues = new Set();
  if (closeIdx !== -1 && args[closeIdx + 1]) flagValues.add(args[closeIdx + 1]);
  if (sqliteIdx !== -1 && args[sqliteIdx + 1]) flagValues.add(args[sqliteIdx + 1]);
  const projectArg = args.find(a => !a.startsWith('--') && !flagValues.has(a));
  return { projectArg, dryRun, closeIds, explicitSqlite };
}

// ---------------------------------------------------------------------------
// Read from SQLite
// ---------------------------------------------------------------------------

function readSqlite(dbPath) {
  if (!existsSync(dbPath)) throw new Error(`SQLite DB not found: ${dbPath}`);
  const db = new Database(dbPath, { readonly: true });
  try {
    const cols = db.pragma('table_info(tasks)');
    const hasInternal = cols.some(c => c.name === 'internal');

    const tasks = db.prepare(`
      SELECT id, title, description, notes, status, priority, issue_type, assignee,
             reserved_files, parent_id, command, agent_program, model, schedule_cron,
             next_run_at, due_date, labels_text, ${hasInternal ? 'internal' : '1 AS internal'},
             created_at, updated_at, closed_at, close_reason
      FROM tasks ORDER BY created_at ASC, id ASC
    `).all();

    const labels = db.prepare('SELECT issue_id, label FROM labels').all();
    const comments = db.prepare(
      'SELECT id, issue_id, author, text, created_at FROM comments ORDER BY id ASC'
    ).all();
    const dependencies = db.prepare(
      'SELECT issue_id, depends_on_id, type FROM dependencies'
    ).all();

    return { tasks, labels, comments, dependencies };
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------------------
// Sync missing tasks to project_tasks
// ---------------------------------------------------------------------------

async function syncMissing({ pool, data, dryRun }) {
  const client = await pool.connect();
  try {
    // Find which jat_ids already exist in project_tasks
    const jatIds = data.tasks.map(t => t.id);
    const { rows: existing } = await client.query(
      `SELECT jat_id FROM project_tasks WHERE jat_id = ANY($1::text[])`,
      [jatIds]
    );
    const existingSet = new Set(existing.map(r => r.jat_id));

    const missing = data.tasks.filter(t => !existingSet.has(t.id));
    const skipped = data.tasks.length - missing.length;

    console.log(`  SQLite total:  ${data.tasks.length}`);
    console.log(`  Already in PG: ${skipped}`);
    console.log(`  Missing:       ${missing.length}`);

    if (missing.length === 0) {
      console.log('\n✓ No missing tasks — project_tasks is fully in sync.');
      return { inserted: 0, skipped };
    }

    console.log('\nMissing tasks:');
    for (const t of missing) {
      console.log(`  [${t.status.padEnd(12)}] [${(t.issue_type||'task').padEnd(8)}] ${t.id} — ${t.title.slice(0, 55)}`);
    }

    if (dryRun) {
      console.log('\n(dry-run: no changes written)');
      return { inserted: 0, skipped, dryRun: true };
    }

    // Map rows and build UUID lookup
    const mappedRows = missing.map(t => mapTaskRow(t, { defaultStatus: undefined }));
    const idMap = buildIdMap(mappedRows);

    // Build full idMap including existing tasks (for parent resolution)
    const { rows: existingUuids } = await client.query(
      `SELECT jat_id, id FROM project_tasks WHERE jat_id = ANY($1::text[])`,
      [jatIds]
    );
    const fullIdMap = new Map([...idMap]);
    for (const row of existingUuids) fullIdMap.set(row.jat_id, row.id);

    const { sql: insertSQL, params: mkParams } = insertProjectTaskSQL();

    await client.query('BEGIN');
    try {
      // Insert missing tasks (parent_id=NULL first to avoid FK issues)
      let inserted = 0;
      for (const row of mappedRows) {
        await client.query(insertSQL, mkParams(row));
        inserted++;
        process.stdout.write(`  Inserted ${inserted}/${mappedRows.length}\r`);
      }
      console.log(`\n  Inserted ${inserted} tasks`);

      // Set parent_id for tasks that have one
      const newJatIds = new Set(mappedRows.map(r => r.jat_id));
      const parents = missing.filter(t => t.parent_id);
      if (parents.length > 0) {
        console.log(`  Linking ${parents.length} parent relationships...`);
        for (const t of parents) {
          const parentUuid = fullIdMap.get(t.parent_id);
          const childUuid = idMap.get(t.id);
          if (parentUuid && childUuid) {
            await client.query(UPDATE_PARENT_SQL, [parentUuid, childUuid]);
          }
        }
      }

      // Import labels
      const labelsByTask = new Map();
      for (const l of data.labels) {
        if (!newJatIds.has(l.issue_id)) continue;
        const arr = labelsByTask.get(l.issue_id) || [];
        arr.push(l.label);
        labelsByTask.set(l.issue_id, arr);
      }
      for (const [jatId, labels] of labelsByTask) {
        const uuid = idMap.get(jatId);
        if (uuid) {
          await client.query(
            'UPDATE project_tasks SET labels = $1 WHERE id = $2::uuid',
            [labels, uuid]
          );
        }
      }

      // Import comments
      const newComments = data.comments.filter(c => newJatIds.has(c.issue_id));
      for (const c of newComments) {
        const uuid = idMap.get(c.issue_id);
        if (uuid) {
          await client.query(
            `INSERT INTO project_tasks_comments (task_id, author, text, created_at)
             VALUES ($1::uuid, $2, $3, $4::timestamptz)`,
            [uuid, c.author, c.text, c.created_at]
          );
        }
      }

      await client.query('COMMIT');
      return { inserted, skipped };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Close stuck tasks
// ---------------------------------------------------------------------------

async function closeStuckTasks({ pool, taskIds, dryRun }) {
  if (taskIds.length === 0) return;
  const client = await pool.connect();
  try {
    // Fetch current status of each task
    const { rows } = await client.query(
      `SELECT jat_id, status, title FROM project_tasks WHERE jat_id = ANY($1::text[])`,
      [taskIds]
    );

    console.log('\nTasks to close:');
    for (const row of rows) {
      console.log(`  ${row.jat_id} [${row.status}] — ${(row.title||'').slice(0, 55)}`);
    }
    const missing = taskIds.filter(id => !rows.some(r => r.jat_id === id));
    if (missing.length > 0) {
      console.log(`  Warning: not found in project_tasks: ${missing.join(', ')}`);
    }

    if (dryRun) {
      console.log('(dry-run: no closes written)');
      return;
    }

    const now = new Date().toISOString();
    const { rowCount } = await client.query(
      `UPDATE project_tasks
       SET status = 'closed', closed_at = $1, close_reason = 'Completed — closed by sync script'
       WHERE jat_id = ANY($2::text[]) AND status != 'closed'`,
      [now, taskIds]
    );
    console.log(`  ✓ Closed ${rowCount} tasks in project_tasks`);
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { projectArg, dryRun, closeIds, explicitSqlite } = parseArgs();

  if (!projectArg) {
    console.error('Usage: node sync-sqlite-to-postgres.mjs <project-name> [--dry-run] [--close id1,id2]');
    process.exit(1);
  }

  const project = resolveProject(projectArg);
  if (!project) {
    console.error(`Project "${projectArg}" not found in ${CONFIG_PATH}`);
    process.exit(1);
  }

  const { config } = project;
  if (config.backend !== 'postgres' || !config.backend_url) {
    console.error(`Project "${projectArg}" is not on postgres backend (backend=${config.backend})`);
    process.exit(1);
  }

  const projectPath = config.path.replace(/^~/, homedir());
  const sqlitePath = explicitSqlite || join(projectPath, '.jat', 'tasks.db');

  console.log(`\nSync: ${projectArg}`);
  console.log(`  SQLite: ${sqlitePath}`);
  console.log(`  Postgres: ${config.backend_url.replace(/:([^:@]+)@/, ':***@')}`);
  if (dryRun) console.log('  Mode: DRY RUN');
  console.log('');

  const pool = new Pool({ connectionString: config.backend_url });

  try {
    const data = readSqlite(sqlitePath);

    // 1. Sync missing tasks
    const result = await syncMissing({ pool, data, dryRun });

    // 2. Close stuck tasks if requested
    if (closeIds.length > 0) {
      await closeStuckTasks({ pool, taskIds: closeIds, dryRun });
    }

    console.log('\n✓ Done.');
    if (result.inserted > 0) {
      console.log(`  Inserted ${result.inserted} previously-missing tasks.`);
    }
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
