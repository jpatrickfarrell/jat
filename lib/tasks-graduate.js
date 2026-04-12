/**
 * JAT Task Graduation
 *
 * One-way migration of a project's task store from local SQLite to shared
 * Postgres.  Performs, in order:
 *
 *   1. Idempotency check — already backend=postgres → no-op exit
 *   2. Export: read tasks, dependencies, labels, comments from .jat/tasks.db
 *   3. Summary: return counts so the caller can render a preview
 *   4. Apply Postgres schema (idempotent)
 *   5. Empty-target check (unless --force)
 *   6. Atomic import inside a single Postgres transaction, preserving
 *      ids, timestamps, and parent_id / dependency edges
 *   7. Flip projects.json backend → "postgres" + backend_url
 *   8. Rename .jat/tasks.db → tasks.db.sqlite-backup-{ts}
 *
 * On any failure during step 4–6 the Postgres transaction rolls back and
 * SQLite + projects.json remain untouched.  Failures during step 7 leave
 * Postgres populated but config un-flipped — the caller is told to retry or
 * hand-edit.  Failures during step 8 leave the SQLite file in place under
 * its original name with a warning; re-running graduate will hit the
 * idempotency check in step 1 and simply archive the db.
 *
 * The bash `jt` CLI cannot speak Postgres (see nsa33.4 guard), so this
 * module is invoked from a Node entry point at tools/core/jt-graduate and
 * from the graduation wizard's REST endpoint.
 */

import Database from 'better-sqlite3';
import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

import { readProjectsConfig, getProjectConfig } from './projects-config.js';
import { PostgresTaskBackend } from './tasks-postgres.js';

const CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');

function expandHome(p) {
  if (!p) return p;
  return p.startsWith('~') ? p.replace(/^~/, homedir()) : p;
}

// ---------------------------------------------------------------------------
// Export from SQLite
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ExportedData
 * @property {any[]} tasks
 * @property {any[]} dependencies
 * @property {any[]} labels
 * @property {any[]} comments
 */

/**
 * Read every row of tasks, dependencies, labels, and comments from a
 * project's `.jat/tasks.db` file.  Read-only — does not mutate the db.
 *
 * @param {string} projectPath - Absolute path to the project root
 * @returns {ExportedData}
 */
export function exportFromSqlite(projectPath) {
  const dbPath = join(projectPath, '.jat', 'tasks.db');
  if (!existsSync(dbPath)) {
    throw new Error(`No SQLite task database at ${dbPath}`);
  }

  const db = new Database(dbPath, { readonly: true });
  try {
    db.pragma('foreign_keys = ON');

    // Check if the internal column exists (older databases may lack it)
    const cols = db.pragma('table_info(tasks)');
    const hasInternal = cols.some((/** @type {any} */ c) => c.name === 'internal');

    const tasks = db.prepare(`
      SELECT id, title, description, notes, status, priority, issue_type, assignee,
             reserved_files, parent_id, command, agent_program, model, schedule_cron,
             next_run_at, due_date, labels_text, ${hasInternal ? 'internal' : '1 AS internal'},
             created_at, updated_at, closed_at, close_reason
      FROM tasks
      ORDER BY created_at ASC, id ASC
    `).all();

    const dependencies = db.prepare(`
      SELECT issue_id, depends_on_id, type FROM dependencies
    `).all();

    const labels = db.prepare(`
      SELECT issue_id, label FROM labels
    `).all();

    const comments = db.prepare(`
      SELECT id, issue_id, author, text, created_at
      FROM comments
      ORDER BY id ASC
    `).all();

    return { tasks, dependencies, labels, comments };
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------------------
// Import to Postgres
// ---------------------------------------------------------------------------

/**
 * Insert every exported row into an initialised Postgres database inside a
 * single transaction.  Parent-id FKs are avoided by inserting tasks with
 * parent_id=NULL and then UPDATE-ing in a second pass, so row order does
 * not matter.  Comments get fresh BIGSERIAL ids (their ids are not
 * user-visible and do not need to be preserved).
 *
 * Throws on any driver error, leaving the database unchanged via ROLLBACK.
 *
 * @param {{
 *   backend: PostgresTaskBackend,
 *   data: ExportedData,
 *   onProgress?: (event: ProgressEvent) => void,
 * }} args
 */
async function importToPostgres({ backend, data, onProgress, importStatus = null }) {
  const pool = backend.pool;
  const client = await pool.connect();
  /** @type {(phase: string, message: string, percent: number, extra?: Record<string, any>) => void} */
  const emit = (phase, message, percent, extra = {}) => {
    try { onProgress?.({ phase, message, percent, ...extra }); } catch { /* noop */ }
  };

  const parents = data.tasks.filter((t) => t.parent_id);
  try {
    await client.query('BEGIN');

    // Phase 1: tasks with parent_id nulled to avoid FK-ordering issues
    const insertTaskSQL = `
      INSERT INTO tasks (
        id, title, description, notes, status, priority, issue_type, assignee,
        reserved_files, parent_id, command, agent_program, model, schedule_cron,
        next_run_at, due_date, labels_text, internal, created_at, updated_at, closed_at, close_reason
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, NULL, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21
      )
    `;
    emit('importing_tasks', `Importing ${data.tasks.length} tasks...`, 40, {
      current: 0,
      total: data.tasks.length,
    });
    let i = 0;
    for (const t of data.tasks) {
      await client.query(insertTaskSQL, [
        t.id,
        t.title,
        t.description || '',
        t.notes || '',
        t.status,
        t.priority,
        t.issue_type,
        t.assignee,
        t.reserved_files,
        t.command,
        t.agent_program,
        t.model,
        t.schedule_cron,
        t.next_run_at,
        t.due_date,
        t.labels_text || '',
        markAllInternal ? true : Boolean(t.internal),
        t.created_at,
        t.updated_at,
        t.closed_at,
        t.close_reason || '',
      ]);
      i++;
      // Emit progress every 25 rows, and always on the last row.
      if (i % 25 === 0 || i === data.tasks.length) {
        const pct = 40 + Math.round((i / Math.max(1, data.tasks.length)) * 20);
        emit('importing_tasks', `Importing tasks (${i}/${data.tasks.length})...`, pct, {
          current: i,
          total: data.tasks.length,
        });
      }
    }

    // Phase 2: set parent_id on rows that have one
    if (parents.length > 0) {
      emit('importing_parents', `Linking ${parents.length} parent relationships...`, 62);
      for (const t of parents) {
        await client.query('UPDATE tasks SET parent_id = $1 WHERE id = $2', [
          t.parent_id,
          t.id,
        ]);
      }
    }

    // Phase 3: labels (the labels_sync_ai trigger rewrites tasks.labels_text,
    //          which is fine — it'll match what we imported anyway).
    emit('importing_labels', `Importing ${data.labels.length} labels...`, 68);
    for (const l of data.labels) {
      await client.query(
        'INSERT INTO labels (issue_id, label) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [l.issue_id, l.label],
      );
    }

    // Phase 4: dependencies
    emit(
      'importing_dependencies',
      `Importing ${data.dependencies.length} dependencies...`,
      74,
    );
    for (const d of data.dependencies) {
      await client.query(
        'INSERT INTO dependencies (issue_id, depends_on_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [d.issue_id, d.depends_on_id, d.type || 'blocks'],
      );
    }

    // Phase 5: comments (new BIGSERIAL ids; original ids are not user-visible)
    emit('importing_comments', `Importing ${data.comments.length} comments...`, 80);
    for (const c of data.comments) {
      await client.query(
        'INSERT INTO comments (issue_id, author, text, created_at) VALUES ($1, $2, $3, $4)',
        [c.issue_id, c.author, c.text, c.created_at],
      );
    }

    emit('committing', 'Committing transaction...', 84);
    await client.query('COMMIT');
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* noop */ }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Count tasks currently in the target Postgres database.  Used for the
 * empty-target safety check.  Returns 0 if the tasks table does not yet
 * exist (the schema hasn't been applied).
 *
 * @param {PostgresTaskBackend} backend
 * @returns {Promise<number>}
 */
async function countPostgresTasks(backend) {
  try {
    const client = await backend.pool.connect();
    try {
      const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM tasks');
      return rows[0]?.n ?? 0;
    } finally {
      client.release();
    }
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// projects.json flip + SQLite archive
// ---------------------------------------------------------------------------

/**
 * Write the projects config back to disk, preserving 2-space indentation.
 * Fails loudly — the caller is expected to surface the error to the user.
 *
 * @param {any} cfg
 */
function writeProjectsConfig(cfg) {
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
}

/**
 * Set `backend="postgres"` and `backend_url=<url>` on a project entry.
 *
 * @param {string} projectName - Canonical key in projects.json
 * @param {string} backendUrl
 */
function flipProjectBackend(projectName, backendUrl) {
  const cfg = readProjectsConfig();
  if (!cfg || !cfg.projects) {
    throw new Error('~/.config/jat/projects.json not found or unreadable');
  }
  const entry = cfg.projects[projectName];
  if (!entry) {
    throw new Error(`Project "${projectName}" not found in projects.json`);
  }
  entry.backend = 'postgres';
  entry.backend_url = backendUrl;
  writeProjectsConfig(cfg);
}

/**
 * Rename `.jat/tasks.db` (and any WAL/SHM sidecars) to a timestamped
 * backup filename.  Returns the archive path, or null if the db was
 * already gone.  Non-fatal: rename failures are caught upstream.
 *
 * @param {string} projectPath
 * @returns {string|null}
 */
function archiveSqliteDb(projectPath) {
  const jatDir = join(projectPath, '.jat');
  const dbPath = join(jatDir, 'tasks.db');
  if (!existsSync(dbPath)) return null;

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = join(jatDir, `tasks.db.sqlite-backup-${ts}`);
  renameSync(dbPath, archivePath);

  for (const suffix of ['-wal', '-shm']) {
    const sidecar = dbPath + suffix;
    if (existsSync(sidecar)) {
      try { renameSync(sidecar, archivePath + suffix); } catch { /* noop */ }
    }
  }
  return archivePath;
}

// ---------------------------------------------------------------------------
// Top-level orchestration
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ProgressEvent
 * @property {string} phase    - Machine-readable phase key (e.g. "exporting",
 *                               "importing_tasks", "flipping_backend")
 * @property {string} message  - Human-readable one-line status
 * @property {number} percent  - Progress percentage 0..100
 * @property {number} [current] - Current item index (for per-row phases)
 * @property {number} [total]   - Total items in this phase
 */

/**
 * @typedef {Object} GraduateOptions
 * @property {string}  projectNameOrPath - Project name or absolute path
 * @property {string}  [postgresUrl]     - Postgres DSN (required unless dryRun && not checking target)
 * @property {boolean} [dryRun]          - Print the preview and exit without writing
 * @property {boolean} [force]           - Allow import into a non-empty Postgres db
 * @property {boolean} [markAllInternal] - Set internal=true on all imported rows
 * @property {(event: ProgressEvent) => void} [onProgress] - Phase-progress callback
 */

/**
 * @typedef {Object} GraduateSummary
 * @property {string} project
 * @property {string} projectPath
 * @property {number} tasks
 * @property {number} dependencies
 * @property {number} labels
 * @property {number} comments
 * @property {string} postgresUrl
 * @property {{ byStatus: Record<string,number>, byType: Record<string,number> }} [breakdown]
 */

/**
 * @typedef {Object} GraduateResult
 * @property {"already_graduated"|"dry_run"|"graduated"} status
 * @property {string} [message]
 * @property {GraduateSummary} [summary]
 * @property {string|null} [archivePath]
 */

/**
 * Graduate a project from SQLite to Postgres.  See the module header for
 * the full step-by-step contract.
 *
 * @param {GraduateOptions} opts
 * @returns {Promise<GraduateResult>}
 */
export async function graduateProject(opts) {
  const {
    projectNameOrPath,
    postgresUrl,
    dryRun = false,
    force = false,
    markAllInternal = false,
    onProgress,
  } = opts;

  /** @type {(phase: string, message: string, percent: number, extra?: Record<string, any>) => void} */
  const emit = (phase, message, percent, extra = {}) => {
    try { onProgress?.({ phase, message, percent, ...extra }); } catch { /* noop */ }
  };

  if (!projectNameOrPath) {
    throw new Error('graduateProject: projectNameOrPath is required');
  }

  // 1. Resolve project entry in projects.json
  emit('resolving', 'Resolving project configuration...', 2);
  const entry = getProjectConfig(projectNameOrPath);
  if (!entry) {
    throw new Error(
      `Project "${projectNameOrPath}" is not listed in ~/.config/jat/projects.json. ` +
      `Add it with 'jat add' before graduating.`
    );
  }
  const projectName = entry.name;
  const projectPath = expandHome(entry.config.path || '');
  if (!projectPath) {
    throw new Error(`Project "${projectName}" has no path in projects.json`);
  }

  // 2. Idempotency check
  const currentBackend = entry.config.backend || 'sqlite';
  if (currentBackend === 'postgres') {
    return {
      status: 'already_graduated',
      message: `Project "${projectName}" is already on backend=postgres. Nothing to do.`,
    };
  }
  if (currentBackend !== 'sqlite') {
    throw new Error(
      `Project "${projectName}" has unknown backend "${currentBackend}". ` +
      `Expected "sqlite" or "postgres".`
    );
  }

  // 3. Export from SQLite (read-only)
  emit('exporting', `Exporting local tasks from ${projectName}...`, 8);
  const data = exportFromSqlite(projectPath);
  emit(
    'exported',
    `Exported ${data.tasks.length} tasks, ${data.dependencies.length} deps, ` +
      `${data.labels.length} labels, ${data.comments.length} comments.`,
    15,
  );

  // Build breakdown counts from exported task rows
  /** @type {Record<string,number>} */
  const byStatus = {};
  /** @type {Record<string,number>} */
  const byType = {};
  for (const t of data.tasks) {
    const s = /** @type {string} */ (t.status || 'open');
    const tp = /** @type {string} */ (t.issue_type || 'task');
    byStatus[s] = (byStatus[s] || 0) + 1;
    byType[tp] = (byType[tp] || 0) + 1;
  }

  /** @type {GraduateSummary} */
  const summary = {
    project: projectName,
    projectPath,
    tasks: data.tasks.length,
    dependencies: data.dependencies.length,
    labels: data.labels.length,
    comments: data.comments.length,
    postgresUrl: postgresUrl || '',
    breakdown: { byStatus, byType },
  };

  if (dryRun) {
    return { status: 'dry_run', summary };
  }

  // From here on we need a real Postgres connection.
  if (!postgresUrl) {
    throw new Error('postgresUrl is required unless --dry-run is set');
  }
  if (!postgresUrl.startsWith('postgres://') && !postgresUrl.startsWith('postgresql://')) {
    throw new Error(
      `Invalid Postgres URL: expected postgres:// or postgresql:// prefix, got "${postgresUrl}"`
    );
  }

  const backend = new PostgresTaskBackend({
    connectionString: postgresUrl,
    projectName,
    projectPath,
  });

  try {
    // 4. Apply schema (idempotent)
    emit('applying_schema', 'Applying Postgres schema...', 20);
    await backend.initProject(projectPath);

    // 5. Empty-target safety check
    emit('checking_target', 'Checking target database is empty...', 30);
    const existingCount = await countPostgresTasks(backend);
    if (existingCount > 0 && !force) {
      throw new Error(
        `Target Postgres database already contains ${existingCount} task row(s). ` +
        `Re-running graduation into a non-empty database is not supported. ` +
        `Use --force to bypass if you are sure the existing rows won't conflict ` +
        `with the ids being imported.`
      );
    }

    // 6. Atomic import
    await importToPostgres({ backend, data, onProgress, markAllInternal });
  } finally {
    // Release the pool so the calling process can exit.
    await backend.close().catch(() => {});
  }

  // 7. Flip projects.json backend flag
  try {
    emit('flipping_backend', 'Flipping backend flag to postgres...', 90);
    flipProjectBackend(projectName, postgresUrl);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Postgres import succeeded but failed to flip projects.json backend flag: ${msg}. ` +
      `Manually set "backend": "postgres" and "backend_url": "${postgresUrl}" in ~/.config/jat/projects.json.`
    );
  }

  // 8. Archive local SQLite db
  emit('archiving', 'Archiving local SQLite database...', 95);
  let archivePath = null;
  try {
    archivePath = archiveSqliteDb(projectPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 'graduated',
      summary,
      archivePath: null,
      message:
        `Graduation complete, but could not archive the local tasks.db: ${msg}. ` +
        `Manually rename .jat/tasks.db to .jat/tasks.db.sqlite-backup-<ts>.`,
    };
  }

  emit('complete', 'Graduation complete.', 100);
  return {
    status: 'graduated',
    summary,
    archivePath,
  };
}
