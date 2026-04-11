#!/usr/bin/env node
/**
 * End-to-end test for lib/tasks-downgrade.js.
 *
 * Seeds a fresh Postgres task database, registers a throwaway project in
 * projects.json pointing at it with backend=postgres, runs downgrade, and
 * verifies: the offline backup file exists with every row, the new live
 * .jat/tasks.db matches, projects.json flipped to sqlite, and the 30-day
 * write-activity guard refuses unless --force + confirmation phrase.
 *
 * Skipped with exit 0 when JAT_PG_TEST_URL is not set so `npm test` stays
 * green.  To run:
 *
 *   docker run -d --name jat-pg-test -p 55432:5432 \
 *     -e POSTGRES_PASSWORD=jat -e POSTGRES_DB=jat_test postgres:16
 *   export JAT_PG_TEST_URL=postgres://postgres:jat@127.0.0.1:55432/jat_test
 *   node lib/tasks-downgrade.test.mjs
 *   docker rm -f jat-pg-test
 *
 * Restores projects.json from a backup on exit.
 */

import {
  mkdirSync,
  rmSync,
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import Database from 'better-sqlite3';
import pg from 'pg';

import {
  downgradeProject,
  exportFromPostgres,
  measureRecentWriteActivity,
  requiredConfirmationPhrase,
} from './tasks-downgrade.js';
import { PostgresTaskBackend } from './tasks-postgres.js';

const PG_URL = process.env.JAT_PG_TEST_URL;

if (!PG_URL) {
  console.log('ℹ️  Skipping lib/tasks-downgrade.test.mjs');
  console.log('    Set JAT_PG_TEST_URL to a writable Postgres DSN to enable.');
  console.log('    Example: postgres://postgres:jat@127.0.0.1:55432/jat_test');
  process.exit(0);
}

const CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');
const BACKUP_PATH = CONFIG_PATH + '.downgrade-test-backup';

const TEST_ROOT = join(tmpdir(), 'jat-downgrade-test-' + Date.now());
const PROJECT_KEY = 'downgrade-test-' + Date.now().toString(36);

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

async function resetPgTables() {
  const pool = new pg.Pool({ connectionString: PG_URL });
  try {
    await pool.query('DROP TABLE IF EXISTS comments, dependencies, labels, tasks CASCADE');
  } finally {
    await pool.end();
  }
}

async function main() {
  copyFileSync(CONFIG_PATH, BACKUP_PATH);
  console.log(`backup: ${BACKUP_PATH}`);

  try {
    await resetPgTables();
    await runTests();
  } finally {
    copyFileSync(BACKUP_PATH, CONFIG_PATH);
    rmSync(BACKUP_PATH, { force: true });
    if (existsSync(TEST_ROOT)) rmSync(TEST_ROOT, { recursive: true, force: true });
    await resetPgTables();
    console.log('cleanup: projects.json restored, TEST_ROOT removed, pg reset');
  }

  console.log('');
  console.log(`${passCount} passed, ${failCount} failed`);
  process.exit(failCount > 0 ? 1 : 0);
}

async function seedPostgres({ staleOnly = false } = {}) {
  const backend = new PostgresTaskBackend({
    connectionString: PG_URL,
    projectName: PROJECT_KEY.toUpperCase(),
    projectPath: TEST_ROOT,
  });
  await backend.initProject(TEST_ROOT);

  // Timestamps: "stale" are >60 days ago, "recent" are today.
  const stale1 = '2026-01-01T10:00:00.000Z';
  const stale2 = '2026-01-02T10:00:00.000Z';
  const stale3 = '2026-01-03T10:00:00.000Z';
  const recent = new Date().toISOString();

  // Decide what timestamp to use per task.
  const epicUpdated = stale1;
  const child1Updated = staleOnly ? stale2 : recent;
  const child2Updated = stale3;

  const client = await backend.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee, created_at, updated_at, close_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '')`,
      ['dg-epic1', 'Epic One', 'Top-level epic', 'open', 1, 'epic', null, stale1, epicUpdated],
    );
    await client.query(
      `INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee, parent_id, created_at, updated_at, closed_at, close_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      ['dg-child1', 'Child One', 'First child', 'closed', 2, 'task', 'Alice', 'dg-epic1', stale2, child1Updated, child1Updated, 'Done'],
    );
    await client.query(
      `INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee, parent_id, created_at, updated_at, close_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '')`,
      ['dg-child2', 'Child Two', 'Second child', 'in_progress', 2, 'task', 'Bob', 'dg-epic1', stale3, child2Updated],
    );

    await client.query(`INSERT INTO labels (issue_id, label) VALUES ($1, $2)`, ['dg-child1', 'urgent']);
    await client.query(`INSERT INTO labels (issue_id, label) VALUES ($1, $2)`, ['dg-child1', 'backend']);
    await client.query(`INSERT INTO labels (issue_id, label) VALUES ($1, $2)`, ['dg-child2', 'frontend']);

    await client.query(
      `INSERT INTO dependencies (issue_id, depends_on_id, type) VALUES ($1, $2, $3)`,
      ['dg-child2', 'dg-child1', 'blocks'],
    );

    await client.query(
      `INSERT INTO comments (issue_id, author, text, created_at) VALUES ($1, $2, $3, $4)`,
      ['dg-child1', 'Alice', 'Shipped it', stale2],
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  return backend;
}

function registerProjectAsPostgres() {
  mkdirSync(join(TEST_ROOT, '.jat'), { recursive: true });
  const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  cfg.projects[PROJECT_KEY] = {
    name: PROJECT_KEY.toUpperCase(),
    path: TEST_ROOT,
    port: null,
    database_url: null,
    hidden: true,
    backend: 'postgres',
    backend_url: PG_URL,
  };
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
}

async function runTests() {
  // ===== Part A: activity blocks when recent writes exist =====
  console.log('\nseed: pg with recent write activity');
  let backend = await seedPostgres({ staleOnly: false });
  registerProjectAsPostgres();

  console.log('\nexport sanity check');
  const exported = await exportFromPostgres(backend);
  assertEq(exported.tasks.length, 3, 'exports 3 tasks');
  assertEq(exported.dependencies.length, 1, 'exports 1 dependency');
  assertEq(exported.labels.length, 3, 'exports 3 labels');
  assertEq(exported.comments.length, 1, 'exports 1 comment');

  console.log('\nwrite-activity measurement');
  const activity = await measureRecentWriteActivity(backend, 30);
  assert(activity.taskCount >= 1, 'detects at least 1 recently-updated task');
  assert(activity.assignees.includes('Alice'), 'reports Alice as a recent assignee');

  // NOTE: PostgresTaskBackend.close() is overridden by the task-close method
  // (a pre-existing quirk — two methods named `close` in the same class).
  // We rely on the module-level pool being reused across calls and the
  // process exiting to tear it down.

  console.log('\ndry-run with recent activity');
  const dry = await downgradeProject({
    projectNameOrPath: PROJECT_KEY,
    dryRun: true,
  });
  assertEq(dry.status, 'dry_run', 'dry-run returns dry_run status');
  assertEq(dry.summary.tasks, 3, 'dry-run counts 3 tasks');
  assert(dry.summary.activityBlocks === true, 'dry-run flags activity as blocking');

  console.log('\nguard: refuses without --force');
  let threw = false;
  try {
    await downgradeProject({ projectNameOrPath: PROJECT_KEY });
  } catch (err) {
    threw = true;
    assert(/Refusing to downgrade/.test(err.message), 'error mentions refusing');
    assert(/last 30 days/.test(err.message), 'error mentions window');
  }
  assert(threw, 'downgrade threw without --force when activity present');

  // Verify nothing was written.
  const jatDir = join(TEST_ROOT, '.jat');
  assert(
    !existsSync(join(jatDir, 'tasks.db')),
    'no tasks.db written after refused downgrade',
  );

  console.log('\nguard: --force requires correct confirmation phrase');
  threw = false;
  try {
    await downgradeProject({
      projectNameOrPath: PROJECT_KEY,
      force: true,
      confirmationPhrase: 'wrong phrase',
    });
  } catch (err) {
    threw = true;
    assert(/confirmation phrase/.test(err.message), 'error mentions confirmation phrase');
  }
  assert(threw, '--force with wrong phrase threw');

  console.log('\nguard: --force with correct phrase succeeds');
  // getProjectConfig returns { name: <config key>, ... }, so the
  // confirmation phrase uses the lowercase key, not the display name.
  const required = requiredConfirmationPhrase(PROJECT_KEY);
  const result = await downgradeProject({
    projectNameOrPath: PROJECT_KEY,
    force: true,
    confirmationPhrase: required,
  });
  assertEq(result.status, 'downgraded', 'forced downgrade returns downgraded');
  assert(!!result.backupPath, 'backup path returned');
  assert(result.backupPath.includes('postgres-backup-'), 'backup filename has postgres-backup prefix');
  assert(existsSync(result.backupPath), 'backup file exists');
  assert(existsSync(result.liveDbPath), 'live tasks.db exists');

  console.log('\nverify sqlite contents');
  const db = new Database(result.liveDbPath, { readonly: true });
  try {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY id').all();
    assertEq(rows.length, 3, 'sqlite has 3 tasks');
    const epic = rows.find((r) => r.id === 'dg-epic1');
    assertEq(epic?.title, 'Epic One', 'epic title preserved');
    assertEq(epic?.parent_id, null, 'epic parent_id null');

    const child1 = rows.find((r) => r.id === 'dg-child1');
    assertEq(child1?.parent_id, 'dg-epic1', 'child1 parent_id set');
    assertEq(child1?.assignee, 'Alice', 'child1 assignee preserved');
    assertEq(child1?.close_reason, 'Done', 'child1 close_reason preserved');

    const deps = db.prepare('SELECT * FROM dependencies').all();
    assertEq(deps.length, 1, 'sqlite has 1 dependency');
    assertEq(deps[0].issue_id, 'dg-child2', 'dep issue_id preserved');
    assertEq(deps[0].depends_on_id, 'dg-child1', 'dep depends_on_id preserved');

    const labels = db.prepare('SELECT * FROM labels ORDER BY issue_id, label').all();
    assertEq(labels.length, 3, 'sqlite has 3 labels');

    const comments = db.prepare('SELECT * FROM comments').all();
    assertEq(comments.length, 1, 'sqlite has 1 comment');
    assertEq(comments[0].author, 'Alice', 'comment author preserved');

    // FTS trigger should have indexed title fields.
    const ftsHit = db.prepare(
      `SELECT COUNT(*) as n FROM tasks_fts WHERE tasks_fts MATCH 'epic'`
    ).get();
    assert(ftsHit.n >= 1, 'FTS index built on rebuilt sqlite');
  } finally {
    db.close();
  }

  console.log('\nverify backup file matches live db');
  const backupDb = new Database(result.backupPath, { readonly: true });
  try {
    const backupCount = backupDb.prepare('SELECT COUNT(*) as n FROM tasks').get();
    assertEq(backupCount.n, 3, 'backup has same 3 tasks');
  } finally {
    backupDb.close();
  }

  console.log('\nverify projects.json flipped');
  const cfgAfter = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  assertEq(cfgAfter.projects[PROJECT_KEY].backend, 'sqlite', 'backend flipped to sqlite');
  assert(
    cfgAfter.projects[PROJECT_KEY].backend_url === undefined,
    'backend_url removed',
  );

  console.log('\nidempotency: re-run is a no-op');
  const rerun = await downgradeProject({ projectNameOrPath: PROJECT_KEY });
  assertEq(rerun.status, 'already_sqlite', 'second run returns already_sqlite');

  // ===== Part B: stale-only activity should not block =====
  console.log('\nreset + reseed with stale-only activity');
  await resetPgTables();
  // Flip the test project back to postgres for another round.
  const cfg2 = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  cfg2.projects[PROJECT_KEY].backend = 'postgres';
  cfg2.projects[PROJECT_KEY].backend_url = PG_URL;
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg2, null, 2) + '\n');
  // Clear out the already-written sqlite files so we're starting fresh.
  for (const name of [
    'tasks.db',
    'tasks.db-wal',
    'tasks.db-shm',
  ]) {
    const p = join(TEST_ROOT, '.jat', name);
    if (existsSync(p)) rmSync(p);
  }

  backend = await seedPostgres({ staleOnly: true });
  const staleActivity = await measureRecentWriteActivity(backend, 30);
  assertEq(staleActivity.taskCount, 0, 'no tasks updated in last 30 days (stale seed)');
  assertEq(staleActivity.commentCount, 0, 'no comments in last 30 days (stale seed)');

  console.log('\ndowngrade without --force (should succeed, no activity)');
  const cleanResult = await downgradeProject({ projectNameOrPath: PROJECT_KEY });
  assertEq(cleanResult.status, 'downgraded', 'clean downgrade succeeds without --force');
  assert(existsSync(cleanResult.backupPath), 'backup file exists');
  assert(existsSync(cleanResult.liveDbPath), 'live db exists');
  // There should be a displaced path because tasks.db was left behind from Part A.
  // Wait — we cleaned it up above, so there should NOT be a displaced file.
  assert(!cleanResult.displacedPath, 'no displaced path (cleaned fresh)');
}

main().catch((err) => {
  console.error('FATAL:', err);
  try { copyFileSync(BACKUP_PATH, CONFIG_PATH); } catch { /* noop */ }
  process.exit(1);
});
