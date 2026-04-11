#!/usr/bin/env node
/**
 * End-to-end test for lib/tasks-graduate.js.
 *
 * Creates a fresh test project with a seeded SQLite db, temporarily adds it
 * to projects.json, graduates it to a throwaway Postgres database, and
 * verifies that every row landed in Postgres with correct ids / deps /
 * labels.  Covers dry-run, full graduation, idempotency, and the
 * non-empty-target guard.
 *
 * Skipped with exit 0 when JAT_PG_TEST_URL is not set so `npm test` stays
 * green locally.  To run:
 *
 *   docker run -d --name jat-pg-test -p 55432:5432 \
 *     -e POSTGRES_PASSWORD=jat -e POSTGRES_DB=jat_test postgres:16
 *   export JAT_PG_TEST_URL=postgres://postgres:jat@127.0.0.1:55432/jat_test
 *   node lib/tasks-graduate.test.mjs
 *   docker rm -f jat-pg-test
 *
 * Restores projects.json from a backup on exit (regardless of pass/fail).
 */

import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import Database from 'better-sqlite3';
import pg from 'pg';

import { graduateProject, exportFromSqlite } from './tasks-graduate.js';

const PG_URL = process.env.JAT_PG_TEST_URL;

if (!PG_URL) {
  console.log('ℹ️  Skipping lib/tasks-graduate.test.mjs');
  console.log('    Set JAT_PG_TEST_URL to a writable Postgres DSN to enable.');
  console.log('    Example: postgres://postgres:jat@127.0.0.1:55432/jat_test');
  process.exit(0);
}

const CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');
const BACKUP_PATH = CONFIG_PATH + '.graduate-test-backup';

const TEST_ROOT = join(tmpdir(), 'jat-graduate-test-' + Date.now());
const PROJECT_KEY = 'graduate-test-' + Date.now().toString(36);

let passCount = 0;
let failCount = 0;

function assert(cond, msg) {
  if (cond) {
    passCount++;
    console.log(`  ✓ ${msg}`);
  } else {
    failCount++;
    console.log(`  ✗ ${msg}`);
  }
}

function assertEq(actual, expected, msg) {
  assert(actual === expected, `${msg} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
}

async function main() {
  // --- Backup projects.json ---
  copyFileSync(CONFIG_PATH, BACKUP_PATH);
  console.log(`backup: ${BACKUP_PATH}`);

  try {
    await runTests();
  } finally {
    copyFileSync(BACKUP_PATH, CONFIG_PATH);
    rmSync(BACKUP_PATH, { force: true });
    if (existsSync(TEST_ROOT)) rmSync(TEST_ROOT, { recursive: true, force: true });
    console.log('cleanup: projects.json restored, TEST_ROOT removed');
  }

  // --- Wipe the test Postgres tables for next run ---
  const pool = new pg.Pool({ connectionString: PG_URL });
  try {
    await pool.query('DROP TABLE IF EXISTS comments, dependencies, labels, tasks CASCADE');
  } finally {
    await pool.end();
  }

  console.log('');
  console.log(`${passCount} passed, ${failCount} failed`);
  process.exit(failCount > 0 ? 1 : 0);
}

async function runTests() {
  // --- 1. Seed a test project with a real SQLite tasks.db ---
  mkdirSync(join(TEST_ROOT, '.jat'), { recursive: true });
  const dbPath = join(TEST_ROOT, '.jat', 'tasks.db');

  const schema = readFileSync('/home/jw/code/jat/lib/tasks-schema.sql', 'utf-8');
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.exec(schema);

  const ts1 = '2026-04-01T10:00:00.000Z';
  const ts2 = '2026-04-02T11:00:00.000Z';
  const ts3 = '2026-04-03T12:00:00.000Z';

  // Three tasks: parent epic + two children, one of which depends on the other.
  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee,
                       parent_id, created_at, updated_at, closed_at, close_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('grad-epic1', 'Epic One', 'Top-level epic', 'open', 1, 'epic', null, null, ts1, ts1, null, '');

  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee,
                       parent_id, created_at, updated_at, closed_at, close_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('grad-child1', 'Child One', 'First child', 'closed', 2, 'task', 'Alice', 'grad-epic1', ts2, ts2, ts2, 'Done');

  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee,
                       parent_id, created_at, updated_at, closed_at, close_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('grad-child2', 'Child Two', 'Second child', 'in_progress', 2, 'task', 'Bob', 'grad-epic1', ts3, ts3, null, '');

  // Labels
  db.prepare('INSERT INTO labels (issue_id, label) VALUES (?, ?)').run('grad-child1', 'urgent');
  db.prepare('INSERT INTO labels (issue_id, label) VALUES (?, ?)').run('grad-child1', 'backend');
  db.prepare('INSERT INTO labels (issue_id, label) VALUES (?, ?)').run('grad-child2', 'frontend');

  // Dependency: child2 depends on child1
  db.prepare('INSERT INTO dependencies (issue_id, depends_on_id, type) VALUES (?, ?, ?)')
    .run('grad-child2', 'grad-child1', 'blocks');

  // Comment
  db.prepare('INSERT INTO comments (issue_id, author, text, created_at) VALUES (?, ?, ?, ?)')
    .run('grad-child1', 'Alice', 'Shipped it', ts2);

  db.close();

  // --- 2. Register in projects.json ---
  const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  cfg.projects[PROJECT_KEY] = {
    name: PROJECT_KEY.toUpperCase(),
    path: TEST_ROOT,
    port: null,
    database_url: null,
    hidden: true,
  };
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');

  // --- 3. Export-only sanity check ---
  console.log('\nexport sanity check');
  const exported = exportFromSqlite(TEST_ROOT);
  assertEq(exported.tasks.length, 3, 'exports 3 tasks');
  assertEq(exported.dependencies.length, 1, 'exports 1 dependency');
  assertEq(exported.labels.length, 3, 'exports 3 labels');
  assertEq(exported.comments.length, 1, 'exports 1 comment');

  // --- 4. Dry-run ---
  console.log('\ndry-run');
  const dry = await graduateProject({
    projectNameOrPath: PROJECT_KEY,
    postgresUrl: PG_URL,
    dryRun: true,
  });
  assertEq(dry.status, 'dry_run', 'dry-run returns dry_run status');
  assertEq(dry.summary.tasks, 3, 'dry-run counts 3 tasks');
  assert(existsSync(dbPath), 'dry-run leaves sqlite db in place');

  // --- 5. Full graduation ---
  console.log('\nfull graduation');
  const result = await graduateProject({
    projectNameOrPath: PROJECT_KEY,
    postgresUrl: PG_URL,
  });
  assertEq(result.status, 'graduated', 'graduation returns graduated status');
  assert(result.archivePath && result.archivePath.includes('sqlite-backup-'), 'archive path returned');
  assert(!existsSync(dbPath), 'sqlite db was renamed (original gone)');
  assert(existsSync(result.archivePath), 'archive file exists at returned path');

  // --- 6. Verify config flip ---
  const cfgAfter = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  assertEq(cfgAfter.projects[PROJECT_KEY].backend, 'postgres', 'projects.json backend flipped to postgres');
  assertEq(cfgAfter.projects[PROJECT_KEY].backend_url, PG_URL, 'projects.json backend_url set');

  // --- 7. Verify Postgres contents ---
  console.log('\npg verification');
  const pool = new pg.Pool({ connectionString: PG_URL });
  try {
    const tasks = await pool.query('SELECT * FROM tasks ORDER BY id');
    assertEq(tasks.rows.length, 3, 'pg has 3 tasks');

    const epic = tasks.rows.find(r => r.id === 'grad-epic1');
    assert(!!epic, 'epic row imported by id');
    assertEq(epic?.title, 'Epic One', 'epic title preserved');
    assertEq(epic?.parent_id, null, 'epic parent_id is null');
    assertEq(epic?.created_at, ts1, 'epic created_at preserved');

    const child1 = tasks.rows.find(r => r.id === 'grad-child1');
    assertEq(child1?.parent_id, 'grad-epic1', 'child1 parent_id set');
    assertEq(child1?.status, 'closed', 'child1 status preserved');
    assertEq(child1?.close_reason, 'Done', 'child1 close_reason preserved');
    assertEq(child1?.closed_at, ts2, 'child1 closed_at preserved');
    assertEq(child1?.assignee, 'Alice', 'child1 assignee preserved');

    const child2 = tasks.rows.find(r => r.id === 'grad-child2');
    assertEq(child2?.status, 'in_progress', 'child2 status preserved');
    assertEq(child2?.assignee, 'Bob', 'child2 assignee preserved');

    const deps = await pool.query('SELECT * FROM dependencies');
    assertEq(deps.rows.length, 1, 'pg has 1 dependency');
    assertEq(deps.rows[0].issue_id, 'grad-child2', 'dep issue_id preserved');
    assertEq(deps.rows[0].depends_on_id, 'grad-child1', 'dep depends_on_id preserved');

    const labels = await pool.query('SELECT * FROM labels ORDER BY issue_id, label');
    assertEq(labels.rows.length, 3, 'pg has 3 labels');
    const child1Labels = labels.rows.filter(r => r.issue_id === 'grad-child1').map(r => r.label).sort();
    assertEq(JSON.stringify(child1Labels), JSON.stringify(['backend', 'urgent']), 'child1 labels preserved');

    // labels_sync trigger should have repopulated labels_text to match
    const taskLabelsText = await pool.query("SELECT id, labels_text FROM tasks WHERE id = 'grad-child1'");
    const lt = taskLabelsText.rows[0].labels_text;
    assert(lt.includes('backend') && lt.includes('urgent'), 'labels_text was synced by trigger');

    const comments = await pool.query('SELECT * FROM comments');
    assertEq(comments.rows.length, 1, 'pg has 1 comment');
    assertEq(comments.rows[0].text, 'Shipped it', 'comment text preserved');
    assertEq(comments.rows[0].author, 'Alice', 'comment author preserved');

    // tsvector FTS column should be populated by the STORED generated column
    const fts = await pool.query("SELECT COUNT(*)::int AS n FROM tasks WHERE tasks_fts_doc @@ plainto_tsquery('english', 'epic')");
    assertEq(fts.rows[0].n, 1, 'tsvector fts_doc generated for "epic" search');
  } finally {
    await pool.end();
  }

  // --- 8. Idempotency: re-run should be no-op ---
  console.log('\nidempotency');
  const rerun = await graduateProject({
    projectNameOrPath: PROJECT_KEY,
    postgresUrl: PG_URL,
  });
  assertEq(rerun.status, 'already_graduated', 'second run returns already_graduated');
  assert(!!rerun.message, 'already_graduated includes a message');

  // --- 9. Non-empty target safety check ---
  console.log('\nnon-empty target guard');
  // Manually flip the config back to sqlite (simulating a misconfigured retry)
  // while leaving the postgres database populated.
  const cfg3 = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  delete cfg3.projects[PROJECT_KEY].backend;
  delete cfg3.projects[PROJECT_KEY].backend_url;
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg3, null, 2) + '\n');

  // And restore the sqlite file from the archive so step 3 (export) doesn't fail.
  copyFileSync(result.archivePath, dbPath);

  try {
    await graduateProject({
      projectNameOrPath: PROJECT_KEY,
      postgresUrl: PG_URL,
    });
    assert(false, 'non-empty target should throw');
  } catch (err) {
    assert(/already contains/.test(err.message), 'non-empty target error mentions existing rows');
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  copyFileSync(BACKUP_PATH, CONFIG_PATH).catch?.(() => {});
  process.exit(1);
});
