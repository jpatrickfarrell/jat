/**
 * JAT Task Downgrade
 *
 * Reverse of lib/tasks-graduate.js — migrate a project's task store from
 * shared Postgres back to local SQLite.  Deliberately scarier than
 * graduation because it can orphan work from other agents on the shared db.
 *
 * Steps, in order:
 *
 *   1. Idempotency check — already backend=sqlite → no-op exit
 *   2. Connect to Postgres; export tasks, dependencies, labels, comments
 *   3. 30-day write-activity guard: count tasks with updated_at within the
 *      last 30 days and list distinct assignees.  Refuse unless --force,
 *      in which case a confirmation phrase must also be provided.
 *   4. Write an "offline export" — a fully populated SQLite file at
 *      .jat/tasks.db.postgres-backup-{ts}.  This is a frozen snapshot the
 *      operator can return to if the live db drifts later.
 *   5. Copy the offline export into place as .jat/tasks.db (the new live
 *      store).  If an existing tasks.db is present — e.g. from a prior
 *      graduation's archive being renamed back — it is moved aside as
 *      tasks.db.pre-downgrade-{ts}.
 *   6. Flip projects.json: backend="sqlite", remove backend_url
 *
 * Postgres is NOT touched by this flow.  Other agents writing to the shared
 * db will continue to do so; this project simply stops pointing at it.
 * The operator is responsible for dropping the project's data from Postgres
 * if they want it gone.
 *
 * The `jt` bash CLI cannot speak Postgres (see nsa33.4 guard), so this
 * module is invoked from tools/core/jt-downgrade.
 */

import Database from 'better-sqlite3';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  renameSync,
  copyFileSync,
  unlinkSync,
  mkdirSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

import { readProjectsConfig, getProjectConfig } from './projects-config.js';
import { PostgresTaskBackend } from './tasks-postgres.js';

const CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');

function expandHome(p) {
  if (!p) return p;
  return p.startsWith('~') ? p.replace(/^~/, homedir()) : p;
}

// ---------------------------------------------------------------------------
// Schema loading (reuse the canonical SQLite schema file)
// ---------------------------------------------------------------------------

function resolveSqliteSchemaPath() {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidate = join(here, 'tasks-schema.sql');
  if (!existsSync(candidate)) {
    throw new Error(`tasks-schema.sql not found next to tasks-downgrade.js at ${candidate}`);
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Export from Postgres
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ExportedData
 * @property {any[]} tasks
 * @property {any[]} dependencies
 * @property {any[]} labels
 * @property {any[]} comments
 */

/**
 * Read every row of tasks, dependencies, labels, and comments from the
 * shared Postgres database.  Read-only — does not mutate the db.
 *
 * @param {PostgresTaskBackend} backend
 * @returns {Promise<ExportedData>}
 */
export async function exportFromPostgres(backend) {
  const client = await backend.pool.connect();
  try {
    const tasks = (await client.query(`
      SELECT id, title, description, notes, status, priority, issue_type, assignee,
             reserved_files, parent_id, command, agent_program, model, schedule_cron,
             next_run_at, due_date, labels_text, created_at, updated_at, closed_at, close_reason
      FROM tasks
      ORDER BY created_at ASC, id ASC
    `)).rows;

    const dependencies = (await client.query(
      'SELECT issue_id, depends_on_id, type FROM dependencies'
    )).rows;

    const labels = (await client.query(
      'SELECT issue_id, label FROM labels'
    )).rows;

    const comments = (await client.query(`
      SELECT id, issue_id, author, text, created_at
      FROM comments
      ORDER BY id ASC
    `)).rows;

    return { tasks, dependencies, labels, comments };
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// 30-day write-activity guard
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} WriteActivity
 * @property {number} windowDays
 * @property {number} taskCount                 Rows with updated_at >= cutoff
 * @property {number} commentCount              Comments created within window
 * @property {string[]} assignees               Distinct non-null assignees in window
 * @property {string[]} commentAuthors          Distinct comment authors in window
 * @property {string} cutoffIso
 */

/**
 * Count write activity in the last `windowDays` days.  Activity is:
 *   - tasks with updated_at >= cutoff
 *   - comments with created_at >= cutoff
 *
 * The timestamps stored in Postgres are ISO-8601 strings (same shape as
 * SQLite) — we compare string-wise which works because ISO-8601 sorts
 * lexicographically.
 *
 * @param {PostgresTaskBackend} backend
 * @param {number} [windowDays=30]
 * @returns {Promise<WriteActivity>}
 */
export async function measureRecentWriteActivity(backend, windowDays = 30) {
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();

  const client = await backend.pool.connect();
  try {
    const tasksRes = await client.query(
      `SELECT id, assignee FROM tasks WHERE updated_at >= $1`,
      [cutoffIso],
    );
    const commentsRes = await client.query(
      `SELECT author FROM comments WHERE created_at >= $1`,
      [cutoffIso],
    );

    const assignees = Array.from(
      new Set(tasksRes.rows.map((r) => r.assignee).filter((x) => x && x.trim() !== '')),
    ).sort();
    const commentAuthors = Array.from(
      new Set(commentsRes.rows.map((r) => r.author).filter((x) => x && x.trim() !== '')),
    ).sort();

    return {
      windowDays,
      taskCount: tasksRes.rows.length,
      commentCount: commentsRes.rows.length,
      assignees,
      commentAuthors,
      cutoffIso,
    };
  } finally {
    client.release();
  }
}

/**
 * The phrase a user must type to --force past the write-activity guard.
 * Intentionally specific to the project so muscle memory doesn't carry over
 * between projects.
 *
 * @param {string} projectName
 * @returns {string}
 */
export function requiredConfirmationPhrase(projectName) {
  return `downgrade ${projectName}`;
}

// ---------------------------------------------------------------------------
// Import to a fresh SQLite file
// ---------------------------------------------------------------------------

/**
 * Build a SQLite task database at `dbPath` by applying the canonical schema
 * and inserting every exported row.  If a file already exists at dbPath it
 * is deleted first — this function owns the path.
 *
 * Runs inside a single sqlite transaction so any failure leaves an empty
 * (but schema-applied) file, which the caller can clean up.
 *
 * @param {string} dbPath
 * @param {ExportedData} data
 */
export function writeExportToSqlite(dbPath, data) {
  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (existsSync(dbPath)) unlinkSync(dbPath);

  const schema = readFileSync(resolveSqliteSchemaPath(), 'utf-8');
  const db = new Database(dbPath);
  try {
    db.pragma('foreign_keys = OFF');  // avoid parent_id ordering pain
    db.exec(schema);

    const insertTaskStmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, notes, status, priority, issue_type, assignee,
        reserved_files, parent_id, command, agent_program, model, schedule_cron,
        next_run_at, due_date, labels_text, created_at, updated_at, closed_at, close_reason
      ) VALUES (
        @id, @title, @description, @notes, @status, @priority, @issue_type, @assignee,
        @reserved_files, @parent_id, @command, @agent_program, @model, @schedule_cron,
        @next_run_at, @due_date, @labels_text, @created_at, @updated_at, @closed_at, @close_reason
      )
    `);
    const insertLabelStmt = db.prepare(
      'INSERT OR IGNORE INTO labels (issue_id, label) VALUES (?, ?)'
    );
    const insertDepStmt = db.prepare(
      'INSERT OR IGNORE INTO dependencies (issue_id, depends_on_id, type) VALUES (?, ?, ?)'
    );
    const insertCommentStmt = db.prepare(
      'INSERT INTO comments (issue_id, author, text, created_at) VALUES (?, ?, ?, ?)'
    );

    const txn = db.transaction(() => {
      for (const t of data.tasks) {
        insertTaskStmt.run({
          id: t.id,
          title: t.title,
          description: t.description || '',
          notes: t.notes || '',
          status: t.status,
          priority: t.priority ?? 2,
          issue_type: t.issue_type || 'task',
          assignee: t.assignee ?? null,
          reserved_files: t.reserved_files ?? null,
          parent_id: t.parent_id ?? null,
          command: t.command ?? '/jat:start',
          agent_program: t.agent_program ?? null,
          model: t.model ?? null,
          schedule_cron: t.schedule_cron ?? null,
          next_run_at: t.next_run_at ?? null,
          due_date: t.due_date ?? null,
          labels_text: t.labels_text || '',
          created_at: t.created_at,
          updated_at: t.updated_at,
          closed_at: t.closed_at ?? null,
          close_reason: t.close_reason || '',
        });
      }
      for (const l of data.labels) {
        insertLabelStmt.run(l.issue_id, l.label);
      }
      for (const d of data.dependencies) {
        insertDepStmt.run(d.issue_id, d.depends_on_id, d.type || 'blocks');
      }
      for (const c of data.comments) {
        insertCommentStmt.run(c.issue_id, c.author, c.text, c.created_at);
      }
    });
    txn();
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------------------
// projects.json flip
// ---------------------------------------------------------------------------

function writeProjectsConfig(cfg) {
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
}

/**
 * Set backend="sqlite" on a project entry and clear backend_url.
 *
 * @param {string} projectName - Canonical key in projects.json
 */
function flipProjectBackendToSqlite(projectName) {
  const cfg = readProjectsConfig();
  if (!cfg || !cfg.projects) {
    throw new Error('~/.config/jat/projects.json not found or unreadable');
  }
  const entry = cfg.projects[projectName];
  if (!entry) {
    throw new Error(`Project "${projectName}" not found in projects.json`);
  }
  entry.backend = 'sqlite';
  delete entry.backend_url;
  writeProjectsConfig(cfg);
}

// ---------------------------------------------------------------------------
// Top-level orchestration
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} DowngradeOptions
 * @property {string}  projectNameOrPath
 * @property {boolean} [dryRun]              Gather the preview and exit without writing
 * @property {boolean} [force]               Proceed past the 30-day write guard
 * @property {string}  [confirmationPhrase] Required when force=true + activity present
 * @property {number}  [windowDays=30]
 */

/**
 * @typedef {Object} DowngradeSummary
 * @property {string} project
 * @property {string} projectPath
 * @property {string} postgresUrl
 * @property {number} tasks
 * @property {number} dependencies
 * @property {number} labels
 * @property {number} comments
 * @property {WriteActivity} activity
 * @property {boolean} activityBlocks
 */

/**
 * @typedef {Object} DowngradeResult
 * @property {"already_sqlite"|"dry_run"|"downgraded"} status
 * @property {string} [message]
 * @property {DowngradeSummary} [summary]
 * @property {string|null} [backupPath]        Offline export file
 * @property {string|null} [liveDbPath]        Path where the new live db was placed
 * @property {string|null} [displacedPath]     Pre-existing tasks.db that was moved aside
 */

/**
 * Downgrade a project from Postgres back to SQLite.  See the module header
 * for the full contract.
 *
 * @param {DowngradeOptions} opts
 * @returns {Promise<DowngradeResult>}
 */
export async function downgradeProject(opts) {
  const {
    projectNameOrPath,
    dryRun = false,
    force = false,
    confirmationPhrase = '',
    windowDays = 30,
  } = opts;

  if (!projectNameOrPath) {
    throw new Error('downgradeProject: projectNameOrPath is required');
  }

  // 1. Resolve project
  const entry = getProjectConfig(projectNameOrPath);
  if (!entry) {
    throw new Error(
      `Project "${projectNameOrPath}" is not listed in ~/.config/jat/projects.json.`
    );
  }
  const projectName = entry.name;
  const projectPath = expandHome(entry.config.path || '');
  if (!projectPath) {
    throw new Error(`Project "${projectName}" has no path in projects.json`);
  }

  // 2. Idempotency
  const currentBackend = entry.config.backend || 'sqlite';
  if (currentBackend === 'sqlite') {
    return {
      status: 'already_sqlite',
      message: `Project "${projectName}" is already on backend=sqlite. Nothing to do.`,
    };
  }
  if (currentBackend !== 'postgres') {
    throw new Error(
      `Project "${projectName}" has unknown backend "${currentBackend}". ` +
      `Expected "sqlite" or "postgres".`
    );
  }

  const postgresUrl = entry.config.backend_url;
  if (!postgresUrl) {
    throw new Error(
      `Project "${projectName}" is backend=postgres but has no backend_url in ` +
      `projects.json — cannot export. Hand-edit the config to add backend_url ` +
      `or flip backend back to sqlite manually.`
    );
  }

  const backend = new PostgresTaskBackend({
    connectionString: postgresUrl,
    projectName,
    projectPath,
  });

  /** @type {DowngradeSummary} */
  let summary;
  try {
    // 3. Export from Postgres
    const data = await exportFromPostgres(backend);

    // 4. Write-activity guard
    const activity = await measureRecentWriteActivity(backend, windowDays);
    const activityBlocks = activity.taskCount > 0 || activity.commentCount > 0;

    summary = {
      project: projectName,
      projectPath,
      postgresUrl,
      tasks: data.tasks.length,
      dependencies: data.dependencies.length,
      labels: data.labels.length,
      comments: data.comments.length,
      activity,
      activityBlocks,
    };

    if (dryRun) {
      return { status: 'dry_run', summary };
    }

    if (activityBlocks && !force) {
      const who = activity.assignees.length
        ? ` by: ${activity.assignees.join(', ')}`
        : '';
      throw new Error(
        `Refusing to downgrade "${projectName}": ${activity.taskCount} task(s) and ` +
        `${activity.commentCount} comment(s) have been written in the last ` +
        `${windowDays} days${who}. Downgrading now would orphan that work on the ` +
        `shared Postgres database. Re-run with --force and pass the confirmation ` +
        `phrase "${requiredConfirmationPhrase(projectName)}" if you are sure.`
      );
    }

    if (activityBlocks && force) {
      const required = requiredConfirmationPhrase(projectName);
      if ((confirmationPhrase || '').trim() !== required) {
        throw new Error(
          `--force requires confirmation phrase. Expected exactly: "${required}"`
        );
      }
    }

    // 5. Write the offline export (also serves as the source for the live db)
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const jatDir = join(projectPath, '.jat');
    const backupPath = join(jatDir, `tasks.db.postgres-backup-${ts}`);
    writeExportToSqlite(backupPath, data);

    // 6. Place the new live db
    const liveDbPath = join(jatDir, 'tasks.db');
    let displacedPath = null;
    if (existsSync(liveDbPath)) {
      displacedPath = join(jatDir, `tasks.db.pre-downgrade-${ts}`);
      renameSync(liveDbPath, displacedPath);
      // Move sidecars if any
      for (const suffix of ['-wal', '-shm']) {
        const src = liveDbPath + suffix;
        if (existsSync(src)) {
          try { renameSync(src, displacedPath + suffix); } catch { /* noop */ }
        }
      }
    }
    copyFileSync(backupPath, liveDbPath);

    // 7. Flip projects.json
    try {
      flipProjectBackendToSqlite(projectName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Downgrade wrote ${liveDbPath} but failed to flip projects.json backend flag: ${msg}. ` +
        `Manually set "backend": "sqlite" and remove "backend_url" for "${projectName}".`
      );
    }

    return {
      status: 'downgraded',
      summary,
      backupPath,
      liveDbPath,
      displacedPath,
    };
  } finally {
    await backend.disconnect().catch(() => {});
  }
}
