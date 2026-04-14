/**
 * JAT SQLite Task Backend
 *
 * Concrete implementation of {@link TaskBackend} backed by per-project
 * `.jat/tasks.db` SQLite databases (via better-sqlite3).
 *
 * The shipping implementation lives here; `lib/tasks.js` is a thin
 * compatibility shim that instantiates a singleton of this class and
 * re-exports bound methods under their legacy names.
 */

// @ts-ignore - better-sqlite3 types may not match exactly
import Database from 'better-sqlite3';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { randomBytes } from 'crypto';

import { TaskBackend } from './tasks-backend.js';

// ---------------------------------------------------------------------------
// Schema (embedded for initProject)
// ---------------------------------------------------------------------------

// In dev, import.meta.url points to this file in lib/. In production (Vite bundle),
// it points to build/server/chunks/ where .sql files aren't copied. Fall back to
// walking up to the project root and resolving from lib/.
function resolveSchemaPath(filename) {
  const direct = new URL(`./${filename}`, import.meta.url);
  const directPath = fileURLToPath(direct);
  if (existsSync(directPath)) return directPath;

  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, 'lib', filename);
    if (existsSync(candidate)) return candidate;
    dir = dirname(dir);
  }
  return directPath;
}

const SCHEMA_PATH = resolveSchemaPath('tasks-schema.sql');
let _schemaSQL = null;

function getSchemaSQL() {
  if (!_schemaSQL) {
    _schemaSQL = readFileSync(SCHEMA_PATH, 'utf-8');
  }
  return _schemaSQL;
}

// ---------------------------------------------------------------------------
// Private helpers (module-level — not exposed on the class)
// ---------------------------------------------------------------------------

function parseReviewOverride(notes) {
  if (!notes) return null;
  const match = notes.match(/\[REVIEW_OVERRIDE:(always_review|always_auto)\]/);
  return match ? match[1] : null;
}

function readJatConfig() {
  const configPath = join(homedir(), '.config', 'jat', 'projects.json');
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch {
    return null;
  }
}

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

function ensureInternalColumn(db) {
  const cols = db.pragma('table_info(tasks)');
  if (!cols.some((/** @type {any} */ c) => c.name === 'internal')) {
    db.exec('ALTER TABLE tasks ADD COLUMN internal INTEGER NOT NULL DEFAULT 1');
  }
}

function ensurePreviousAssigneeColumn(db) {
  const cols = db.pragma('table_info(tasks)');
  if (!cols.some((/** @type {any} */ c) => c.name === 'previous_assignee')) {
    db.exec('ALTER TABLE tasks ADD COLUMN previous_assignee TEXT');
  }
  // Trigger is idempotent via CREATE TRIGGER IF NOT EXISTS, but the schema
  // file only runs on fresh DB creation, so recreate here for existing DBs.
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS tasks_stash_prev_assignee
    AFTER UPDATE OF assignee ON tasks
    WHEN NEW.assignee IS NOT OLD.assignee
    BEGIN
      UPDATE tasks SET previous_assignee = OLD.assignee WHERE id = NEW.id;
    END;
  `);
}

function ensureStatusCheckConstraint(db) {
  const row = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'"
  ).get();
  if (!row || !row.sql) return;

  // Already constrained with the 9-status set? Skip.
  if (row.sql.includes("'deployed'") && row.sql.includes("'waiting'") && row.sql.includes("'accepted'")) {
    return;
  }

  // SQLite can't ALTER a CHECK constraint in place — rebuild the table.
  // Preserve FTS by dropping/recreating via ensureFts after rebuild.
  db.exec('BEGIN');
  try {
    // Drop FTS triggers first so they don't fire during copy.
    db.exec(`
      DROP TRIGGER IF EXISTS tasks_fts_ai;
      DROP TRIGGER IF EXISTS tasks_fts_bd;
      DROP TRIGGER IF EXISTS tasks_fts_bu;
      DROP TRIGGER IF EXISTS tasks_fts_au;
      DROP TRIGGER IF EXISTS tasks_stash_prev_assignee;
      DROP TRIGGER IF EXISTS labels_ai_fts;
      DROP TRIGGER IF EXISTS labels_ad_fts;
    `);

    db.exec(`
      CREATE TABLE tasks_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','waiting','blocked','submitted','accepted','deployed','closed','dev')),
        priority INTEGER NOT NULL DEFAULT 2,
        issue_type TEXT NOT NULL DEFAULT 'task',
        assignee TEXT,
        previous_assignee TEXT,
        reserved_files TEXT,
        parent_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        command TEXT DEFAULT '/jat:start',
        agent_program TEXT,
        model TEXT,
        schedule_cron TEXT,
        next_run_at TEXT,
        due_date TEXT,
        labels_text TEXT DEFAULT '',
        internal INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        closed_at TEXT,
        close_reason TEXT DEFAULT ''
      );
    `);

    const cols = db.pragma('table_info(tasks)').map((/** @type {any} */ c) => c.name);
    const newCols = ['id','title','description','notes','status','priority','issue_type','assignee','previous_assignee','reserved_files','parent_id','command','agent_program','model','schedule_cron','next_run_at','due_date','labels_text','internal','created_at','updated_at','closed_at','close_reason'];
    const shared = newCols.filter(c => cols.includes(c));
    const colList = shared.join(', ');
    db.exec(`INSERT INTO tasks_new (${colList}) SELECT ${colList} FROM tasks;`);

    db.exec('DROP TABLE tasks');
    db.exec('ALTER TABLE tasks_new RENAME TO tasks');

    // Recreate indexes + triggers.
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_next_run ON tasks(next_run_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

      CREATE TRIGGER IF NOT EXISTS tasks_stash_prev_assignee
      AFTER UPDATE OF assignee ON tasks
      WHEN NEW.assignee IS NOT OLD.assignee
      BEGIN
        UPDATE tasks SET previous_assignee = OLD.assignee WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS labels_ai_fts AFTER INSERT ON labels BEGIN
        UPDATE tasks SET labels_text = COALESCE(
          (SELECT GROUP_CONCAT(label, ' ') FROM labels WHERE issue_id = NEW.issue_id), ''
        ) WHERE id = NEW.issue_id;
      END;

      CREATE TRIGGER IF NOT EXISTS labels_ad_fts AFTER DELETE ON labels BEGIN
        UPDATE tasks SET labels_text = COALESCE(
          (SELECT GROUP_CONCAT(label, ' ') FROM labels WHERE issue_id = OLD.issue_id), ''
        ) WHERE id = OLD.issue_id;
      END;
    `);

    // Drop FTS table so ensureFts rebuilds it fresh against the new tasks table.
    db.exec('DROP TABLE IF EXISTS tasks_fts');
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function ensureCommentsSchema(db) {
  const hasTable = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='comments'"
  ).get();
  if (!hasTable) return;

  const cols = db.pragma('table_info(comments)');
  const colNames = cols.map((/** @type {any} */ c) => c.name);
  const idCol = cols.find((/** @type {any} */ c) => c.name === 'id');
  const idIsText = idCol && String(idCol.type).toUpperCase().startsWith('TEXT');
  const hasAllNewCols = ['author_type', 'comment_type', 'session_id', 'metadata']
    .every(name => colNames.includes(name));

  if (idIsText && hasAllNewCols) return;

  // SQLite can't change a column's type or drop NOT NULL in place — rebuild
  // the table, copy rows (synthesizing a TEXT id for legacy INTEGER rows),
  // then swap.
  db.exec('BEGIN');
  try {
    db.exec(`
      CREATE TABLE comments_new (
        id TEXT PRIMARY KEY,
        issue_id TEXT NOT NULL,
        text TEXT NOT NULL,
        author TEXT,
        author_type TEXT,
        comment_type TEXT,
        session_id TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (issue_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      INSERT INTO comments_new (id, issue_id, text, author, created_at)
      SELECT CAST(id AS TEXT), issue_id, text, author, created_at
      FROM comments;
    `);

    db.exec('DROP TABLE comments');
    db.exec('ALTER TABLE comments_new RENAME TO comments');
    db.exec('CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_comments_issue_type ON comments(issue_id, comment_type)');
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function generateCommentId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(12);
  let id = '';
  for (let i = 0; i < 12; i++) id += chars[bytes[i] % chars.length];
  return `c-${id}`;
}

function ensureFts(db) {
  const hasFts = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks_fts'"
  ).get();
  if (hasFts) return;

  const cols = db.pragma('table_info(tasks)');
  const hasLabelsText = cols.some((/** @type {any} */ c) => c.name === 'labels_text');
  if (!hasLabelsText) {
    db.exec("ALTER TABLE tasks ADD COLUMN labels_text TEXT DEFAULT ''");
  }

  db.exec(`
    UPDATE tasks SET labels_text = COALESCE(
      (SELECT GROUP_CONCAT(label, ' ') FROM labels WHERE issue_id = tasks.id), ''
    )
  `);

  db.exec(`
    CREATE VIRTUAL TABLE tasks_fts USING fts5(
      title, description, labels_text,
      content=tasks, content_rowid=rowid,
      tokenize='porter unicode61'
    );

    INSERT INTO tasks_fts(rowid, title, description, labels_text)
    SELECT rowid, title, COALESCE(description, ''), COALESCE(labels_text, '')
    FROM tasks;

    CREATE TRIGGER IF NOT EXISTS tasks_fts_ai AFTER INSERT ON tasks BEGIN
      INSERT INTO tasks_fts(rowid, title, description, labels_text)
      VALUES (new.rowid, new.title, COALESCE(new.description, ''), COALESCE(new.labels_text, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_fts_bd BEFORE DELETE ON tasks BEGIN
      INSERT INTO tasks_fts(tasks_fts, rowid, title, description, labels_text)
      VALUES('delete', old.rowid, old.title, COALESCE(old.description, ''), COALESCE(old.labels_text, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_fts_bu BEFORE UPDATE OF title, description, labels_text ON tasks BEGIN
      INSERT INTO tasks_fts(tasks_fts, rowid, title, description, labels_text)
      VALUES('delete', old.rowid, old.title, COALESCE(old.description, ''), COALESCE(old.labels_text, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_fts_au AFTER UPDATE OF title, description, labels_text ON tasks BEGIN
      INSERT INTO tasks_fts(rowid, title, description, labels_text)
      VALUES (new.rowid, new.title, COALESCE(new.description, ''), COALESCE(new.labels_text, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS labels_ai_fts AFTER INSERT ON labels BEGIN
      UPDATE tasks SET labels_text = COALESCE(
        (SELECT GROUP_CONCAT(label, ' ') FROM labels WHERE issue_id = NEW.issue_id), ''
      ) WHERE id = NEW.issue_id;
    END;

    CREATE TRIGGER IF NOT EXISTS labels_ad_fts AFTER DELETE ON labels BEGIN
      UPDATE tasks SET labels_text = COALESCE(
        (SELECT GROUP_CONCAT(label, ' ') FROM labels WHERE issue_id = OLD.issue_id), ''
      ) WHERE id = OLD.issue_id;
    END;
  `);
}

function escapeFtsQuery(query) {
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '""';
  return tokens.map(t => {
    if (/^[a-zA-Z0-9_-]+$/.test(t)) return `${t}*`;
    return `"${t.replace(/"/g, '""')}"`;
  }).join(' ');
}

function now() {
  return new Date().toISOString();
}

function generateTaskId(prefix) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(5);
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${id}`;
}

function getTasksTable(_dbPath) {
  return 'tasks';
}

function loadLabels(db, taskId) {
  const rows = db.prepare('SELECT label FROM labels WHERE issue_id = ?').all(taskId);
  return rows.map((/** @type {any} */ r) => r.label);
}

function loadDependsOn(db, taskId, table) {
  const rows = db.prepare(`
    SELECT d.depends_on_id, d.type, t.title, t.status, t.priority
    FROM dependencies d
    LEFT JOIN ${table} t ON d.depends_on_id = t.id
    WHERE d.issue_id = ?
  `).all(taskId);
  return rows.map((/** @type {any} */ r) => ({
    id: r.depends_on_id,
    type: r.type,
    title: r.title,
    status: r.status,
    priority: r.priority,
  }));
}

function loadBlockedBy(db, taskId, table) {
  const rows = db.prepare(`
    SELECT d.issue_id, d.type, t.title, t.status, t.priority
    FROM dependencies d
    LEFT JOIN ${table} t ON d.issue_id = t.id
    WHERE d.depends_on_id = ?
  `).all(taskId);
  return rows.map((/** @type {any} */ r) => ({
    id: r.issue_id,
    type: r.type,
    title: r.title,
    status: r.status,
    priority: r.priority,
  }));
}

function loadComments(db, taskId) {
  return db.prepare(
    'SELECT id, author, text, created_at FROM comments WHERE issue_id = ? ORDER BY created_at ASC'
  ).all(taskId);
}

function enrichTask(db, row, table, projectName, projectPath, options = {}) {
  row.project = projectName;
  row.project_path = projectPath;
  row.internal = Boolean(row.internal ?? true);
  row.labels = loadLabels(db, row.id);
  row.depends_on = loadDependsOn(db, row.id, table);
  row.blocked_by = loadBlockedBy(db, row.id, table);
  row.review_override = parseReviewOverride(row.notes);
  if (options.includeComments) {
    row.comments = loadComments(db, row.id);
  }
  return row;
}

function findProjectForTask(taskId, projectPath, discoverProjects) {
  if (projectPath) {
    const jatDb = join(projectPath, '.jat', 'tasks.db');
    const dbPath = existsSync(jatDb) ? jatDb : null;
    if (dbPath) {
      const db = openDb(dbPath);
      const table = getTasksTable(dbPath);
      const name = projectPath.split('/').pop() || 'unknown';
      return { db, project: { name, path: projectPath, dbPath }, table };
    }
  }

  const projects = discoverProjects();
  for (const project of projects) {
    try {
      const db = openDb(project.dbPath);
      const table = getTasksTable(project.dbPath);
      const exists = db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(taskId);
      if (exists) {
        return { db, project, table };
      }
      db.close();
    } catch {
      // continue
    }
  }
  return null;
}

function getWritableDb(projectPath) {
  const dbPath = join(projectPath, '.jat', 'tasks.db');
  if (!existsSync(dbPath)) {
    throw new Error(`No .jat/ database at ${projectPath}. Run initProject() first.`);
  }
  const db = openDb(dbPath);
  const projectName = projectPath.split('/').pop() || 'unknown';
  return {
    db,
    project: { name: projectName, path: projectPath, dbPath },
    table: 'tasks',
  };
}

function searchLike(db, table, query, options) {
  const { updatedAfter, status, type, labels, limit = 50 } = options;
  const likeTerm = `%${query}%`;
  let sql = `SELECT *, 0 AS relevance FROM ${table} WHERE (title LIKE ? OR description LIKE ?)`;
  const params = [likeTerm, likeTerm];

  if (updatedAfter) { sql += ' AND updated_at >= ?'; params.push(updatedAfter); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (type) { sql += ' AND issue_type = ?'; params.push(type); }
  if (labels && labels.length > 0) {
    for (const lbl of labels) {
      sql += ' AND EXISTS (SELECT 1 FROM labels l WHERE l.issue_id = id AND l.label = ?)';
      params.push(lbl.trim());
    }
  }
  sql += ' ORDER BY updated_at DESC LIMIT ?';
  params.push(limit);
  return db.prepare(sql).all(...params);
}

// ---------------------------------------------------------------------------
// SqliteTaskBackend
// ---------------------------------------------------------------------------

export class SqliteTaskBackend extends TaskBackend {
  // ─── Project Discovery ──────────────────────────────────────────────────

  /** @returns {import('./tasks-backend.js').Project[]} */
  getProjects() {
    const projects = [];
    const seenPaths = new Set();

    const jatConfig = readJatConfig();
    if (jatConfig?.projects) {
      for (const [name, config] of Object.entries(jatConfig.projects)) {
        // Skip projects graduated to a non-sqlite backend — they live in a
        // different TaskBackend world (see lib/projects-config.js).  Default
        // is sqlite so unmarked projects fall through unchanged.
        const backend = /** @type {any} */ (config).backend;
        if (backend && backend !== 'sqlite') continue;

        const projectPath = /** @type {any} */ (config).path?.replace(/^~/, homedir());
        if (!projectPath) continue;

        const jatDb = join(projectPath, '.jat', 'tasks.db');
        if (existsSync(jatDb)) {
          projects.push({ name, path: projectPath, dbPath: jatDb });
          seenPaths.add(projectPath);
        }
      }
    }

    const codeDir = join(homedir(), 'code');
    if (existsSync(codeDir)) {
      try {
        for (const entry of readdirSync(codeDir, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const projectPath = join(codeDir, entry.name);
          if (seenPaths.has(projectPath)) continue;

          const jatDb = join(projectPath, '.jat', 'tasks.db');
          if (existsSync(jatDb)) {
            projects.push({ name: entry.name, path: projectPath, dbPath: jatDb });
          }
        }
      } catch (error) {
        console.error('Error scanning projects:', error);
      }
    }

    return projects;
  }

  /** @returns {import('./tasks-backend.js').InitProjectResult} */
  initProject(projectPath) {
    const jatDir = join(projectPath, '.jat');
    const dbPath = join(jatDir, 'tasks.db');

    if (!existsSync(jatDir)) {
      mkdirSync(jatDir, { recursive: true });
    }

    const gitignorePath = join(jatDir, '.gitignore');
    if (!existsSync(gitignorePath)) {
      writeFileSync(gitignorePath, 'tasks.db\ntasks.db-wal\ntasks.db-shm\ndata.db\ndata.db-wal\ndata.db-shm\n');
    } else {
      const content = readFileSync(gitignorePath, 'utf-8');
      if (!content.includes('data.db')) {
        writeFileSync(gitignorePath, content.trimEnd() + '\ndata.db\ndata.db-wal\ndata.db-shm\n');
      }
    }

    const db = openDb(dbPath);
    db.exec(getSchemaSQL());
    ensureInternalColumn(db);
    ensurePreviousAssigneeColumn(db);
    ensureStatusCheckConstraint(db);
    ensureCommentsSchema(db);
    db.close();

    touchLastTouched(projectPath);
    return { dbPath };
  }

  // ─── ID Generation ──────────────────────────────────────────────────────

  /** @returns {string} */
  generateId(prefix) {
    return generateTaskId(prefix);
  }

  // ─── Reads ───────────────────────────────────────────────────────────────

  /** @returns {import('./tasks-backend.js').Task[]} */
  list(options = {}) {
    const { status, priority, projectName, closedAfter, closedBefore } = options;
    const projects = this.getProjects();
    const allTasks = [];

    for (const project of projects) {
      if (projectName && project.name !== projectName) continue;

      try {
        const db = openDb(project.dbPath, true);
        const table = getTasksTable(project.dbPath);

        let query = `SELECT * FROM ${table} WHERE 1=1`;
        const params = [];

        if (status !== undefined) {
          query += ' AND status = ?';
          params.push(status);
        }
        if (priority !== undefined) {
          query += ' AND priority = ?';
          params.push(priority);
        }
        if (closedAfter !== undefined) {
          query += ' AND closed_at >= ?';
          params.push(closedAfter);
        }
        if (closedBefore !== undefined) {
          query += ' AND closed_at < ?';
          params.push(closedBefore);
        }
        query += ' ORDER BY priority ASC, created_at DESC';

        const rows = db.prepare(query).all(...params);
        for (const row of rows) {
          allTasks.push(enrichTask(db, row, table, project.name, project.path));
        }
        db.close();
      } catch (error) {
        console.error(`Error querying project ${project.name}:`, error);
      }
    }

    allTasks.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (projectName) {
      return allTasks.filter((task) => {
        const match = task.id.match(/^([a-zA-Z0-9_-]+?)-([a-zA-Z0-9.]+)$/);
        return match ? match[1] === projectName : false;
      });
    }

    return allTasks;
  }

  /** @returns {import('./tasks-backend.js').Task|null} */
  getById(taskId) {
    const projects = this.getProjects();

    for (const project of projects) {
      try {
        const db = openDb(project.dbPath, true);
        const table = getTasksTable(project.dbPath);

        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(taskId);
        if (row) {
          const task = enrichTask(db, row, table, project.name, project.path, { includeComments: true });
          db.close();
          return task;
        }
        db.close();
      } catch (error) {
        console.error(`Error querying task ${taskId} in project ${project.name}:`, error);
      }
    }
    return null;
  }

  /** @returns {import('./tasks-backend.js').Task[]} */
  getReady() {
    const allTasks = this.list({ status: 'open' });
    const readyTasks = [];

    for (const task of allTasks) {
      const fullTask = this.getById(task.id);
      if (!fullTask) continue;

      if (!fullTask.depends_on || fullTask.depends_on.length === 0) {
        readyTasks.push(fullTask);
      } else {
        const hasBlockers = fullTask.depends_on.some((dep) => dep.status !== 'closed');
        if (!hasBlockers) {
          readyTasks.push(fullTask);
        }
      }
    }

    return readyTasks;
  }

  /** @returns {import('./tasks-backend.js').Task[]} */
  getScheduled(options = {}) {
    const projects = this.getProjects();
    const allTasks = [];

    for (const project of projects) {
      try {
        const db = openDb(project.dbPath, true);
        const table = getTasksTable(project.dbPath);

        const rows = db.prepare(`SELECT * FROM ${table} WHERE (schedule_cron IS NOT NULL AND schedule_cron != '') OR (next_run_at IS NOT NULL AND next_run_at != '') ORDER BY priority ASC, next_run_at ASC`).all();
        for (const row of rows) {
          allTasks.push(enrichTask(db, row, table, project.name, project.path));
        }
        db.close();
      } catch (error) {
        console.error(`Error querying scheduled tasks in project ${project.name}:`, error);
      }
    }

    if (options.projectName) {
      return allTasks.filter((task) => {
        const match = task.id.match(/^([a-zA-Z0-9_-]+?)-([a-zA-Z0-9.]+)$/);
        return match ? match[1] === options.projectName : false;
      });
    }

    return allTasks;
  }

  /** @returns {import('./tasks-backend.js').Task[]} */
  search(query, options = {}) {
    const { updatedAfter, status, type, labels, limit = 50 } = options;
    const projects = this.getProjects();
    const results = [];

    for (const project of projects) {
      try {
        const db = openDb(project.dbPath, false);
        const table = getTasksTable(project.dbPath);

        try {
          ensureFts(db);
        } catch {
          const rows = searchLike(db, table, query, { updatedAfter, status, type, labels, limit });
          for (const row of rows) {
            results.push(enrichTask(db, row, table, project.name, project.path));
          }
          db.close();
          continue;
        }

        const filterClauses = [];
        const filterParams = [];
        if (updatedAfter) {
          filterClauses.push('t.updated_at >= ?');
          filterParams.push(updatedAfter);
        }
        if (status) {
          filterClauses.push('t.status = ?');
          filterParams.push(status);
        }
        if (type) {
          filterClauses.push('t.issue_type = ?');
          filterParams.push(type);
        }
        if (labels && labels.length > 0) {
          for (const lbl of labels) {
            filterClauses.push('EXISTS (SELECT 1 FROM labels l WHERE l.issue_id = t.id AND l.label = ?)');
            filterParams.push(lbl.trim());
          }
        }

        const filterSQL = filterClauses.length > 0 ? ' AND ' + filterClauses.join(' AND ') : '';
        const ftsQuery = escapeFtsQuery(query);

        let rows;
        try {
          rows = db.prepare(`
            SELECT t.*, ROUND(-tasks_fts.rank, 4) AS relevance
            FROM tasks_fts
            JOIN ${table} t ON t.rowid = tasks_fts.rowid
            WHERE tasks_fts MATCH ?${filterSQL}
            ORDER BY tasks_fts.rank
            LIMIT ?
          `).all(ftsQuery, ...filterParams, limit);
        } catch {
          const words = query.split(/\s+/).filter(w => w.length >= 2);
          const fallbackQuery = words.map(w => `"${w.replace(/"/g, '""')}"`).join(' ');
          try {
            rows = db.prepare(`
              SELECT t.*, ROUND(-tasks_fts.rank, 4) AS relevance
              FROM tasks_fts
              JOIN ${table} t ON t.rowid = tasks_fts.rowid
              WHERE tasks_fts MATCH ?${filterSQL}
              ORDER BY tasks_fts.rank
              LIMIT ?
            `).all(fallbackQuery, ...filterParams, limit);
          } catch {
            rows = [];
          }
        }

        for (const row of rows) {
          const task = enrichTask(db, row, table, project.name, project.path);
          task.relevance = row.relevance;
          results.push(task);
        }
        db.close();
      } catch (error) {
        console.error(`Error searching project ${project.name}:`, error);
      }
    }

    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    return results.slice(0, limit);
  }

  // ─── Writes ──────────────────────────────────────────────────────────────

  /** @returns {import('./tasks-backend.js').Task} */
  create(opts) {
    const { projectPath, title, description = '', type = 'task', priority = 2, labels = [], deps = [], assignee = null, notes = '', id: explicitId, command, agent_program, model, schedule_cron, next_run_at, due_date } = opts;
    const { db, project, table } = getWritableDb(projectPath);

    const prefix = project.name;
    const id = explicitId || this.generateId(prefix);
    const ts = now();

    try {
      db.prepare(`
        INSERT INTO ${table} (id, title, description, notes, status, priority, issue_type, assignee, command, agent_program, model, schedule_cron, next_run_at, due_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description, notes, priority, type, assignee, command || null, agent_program || null, model || null, schedule_cron || null, next_run_at || null, due_date || null, ts, ts);

      const insertLabel = db.prepare('INSERT INTO labels (issue_id, label) VALUES (?, ?)');
      for (const label of labels) {
        insertLabel.run(id, label.trim());
      }

      const insertDep = db.prepare('INSERT INTO dependencies (issue_id, depends_on_id, type) VALUES (?, ?, ?)');
      for (const depId of deps) {
        insertDep.run(id, depId, 'blocks');
      }

      touchLastTouched(projectPath);

      const task = enrichTask(db, db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id), table, project.name, projectPath, { includeComments: true });
      db.close();
      return task;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /** @returns {import('./tasks-backend.js').Task} */
  update(taskId, updates) {
    const found = findProjectForTask(taskId, updates.projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db, project, table } = found;

    try {
      const allowedFields = ['title', 'description', 'notes', 'status', 'priority', 'issue_type', 'assignee', 'command', 'agent_program', 'model', 'schedule_cron', 'next_run_at', 'due_date', 'internal'];
      const sets = [];
      const params = [];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          sets.push(`${field} = ?`);
          params.push(updates[field]);
        }
      }

      if (updates.status === 'closed') {
        sets.push('closed_at = ?');
        params.push(now());
      } else if (updates.status && updates.status !== 'closed') {
        sets.push('closed_at = NULL');
      }

      if (sets.length > 0) {
        sets.push('updated_at = ?');
        params.push(now());
        params.push(taskId);
        db.prepare(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      }

      if (updates.labels !== undefined) {
        db.prepare('DELETE FROM labels WHERE issue_id = ?').run(taskId);
        const insertLabel = db.prepare('INSERT INTO labels (issue_id, label) VALUES (?, ?)');
        for (const label of updates.labels) {
          if (label.trim()) insertLabel.run(taskId, label.trim());
        }
        if (sets.length === 0) {
          db.prepare(`UPDATE ${table} SET updated_at = ? WHERE id = ?`).run(now(), taskId);
        }
      }

      touchLastTouched(project.path);

      const task = enrichTask(db, db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(taskId), table, project.name, project.path, { includeComments: true });
      db.close();
      return task;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /** @returns {import('./tasks-backend.js').Task} */
  close(taskId, reason = '', projectPath) {
    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db, project, table } = found;

    try {
      const ts = now();
      db.prepare(`UPDATE ${table} SET status = 'closed', closed_at = ?, close_reason = ?, updated_at = ? WHERE id = ?`)
        .run(ts, reason, ts, taskId);

      // Restore the prior assignee (e.g. the user who clicked "take it" before
      // the agent was spawned). The assignee trigger stashed the original on
      // spawn; this returns the task to its original owner on completion.
      // Note: the AFTER UPDATE trigger on assignee will re-stash the current
      // (agent) value into previous_assignee, which is fine — it just means
      // the prior-owner slot now holds the agent name post-close.
      const row = db.prepare(`SELECT previous_assignee FROM ${table} WHERE id = ?`).get(taskId);
      if (row && row.previous_assignee) {
        db.prepare(`UPDATE ${table} SET assignee = ?, updated_at = ? WHERE id = ?`)
          .run(row.previous_assignee, ts, taskId);
      }

      touchLastTouched(project.path);

      const task = enrichTask(db, db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(taskId), table, project.name, project.path, { includeComments: true });
      db.close();
      return task;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /** @returns {boolean} */
  delete(taskId, projectPath) {
    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db, project, table } = found;

    try {
      const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(taskId);
      touchLastTouched(project.path);
      db.close();
      return result.changes > 0;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  // ─── Dependencies ────────────────────────────────────────────────────────

  /** @returns {boolean} */
  addDependency(taskId, dependsOnId, projectPath) {
    if (taskId === dependsOnId) {
      throw new Error('A task cannot depend on itself');
    }

    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db, project } = found;

    try {
      const wouldCycle = db.prepare(`
        WITH RECURSIVE chain(id) AS (
          SELECT ?
          UNION ALL
          SELECT d.depends_on_id FROM dependencies d
          JOIN chain c ON d.issue_id = c.id
        )
        SELECT 1 FROM chain WHERE id = ? LIMIT 1
      `).get(dependsOnId, taskId);

      if (wouldCycle) {
        db.close();
        throw new Error(`Adding dependency would create a cycle: ${taskId} -> ${dependsOnId}`);
      }

      db.prepare('INSERT OR IGNORE INTO dependencies (issue_id, depends_on_id, type) VALUES (?, ?, ?)')
        .run(taskId, dependsOnId, 'blocks');

      touchLastTouched(project.path);
      db.close();
      return true;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /** @returns {boolean} */
  removeDependency(taskId, dependsOnId, projectPath) {
    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db, project } = found;

    try {
      const result = db.prepare('DELETE FROM dependencies WHERE issue_id = ? AND depends_on_id = ?')
        .run(taskId, dependsOnId);
      touchLastTouched(project.path);
      db.close();
      return result.changes > 0;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /** @returns {import('./tasks-backend.js').DependencyTreeNode[]} */
  getDependencyTree(taskId, options = {}) {
    const found = findProjectForTask(taskId, options.projectPath, () => this.getProjects());
    if (!found) return [];
    const { db, table } = found;

    try {
      let result;
      if (options.reverse) {
        result = db.prepare(`
          WITH RECURSIVE tree(id, depth) AS (
            SELECT issue_id, 1 FROM dependencies WHERE depends_on_id = ?
            UNION ALL
            SELECT d.issue_id, t.depth + 1 FROM dependencies d
            JOIN tree t ON d.depends_on_id = t.id
            WHERE t.depth < 20
          )
          SELECT DISTINCT tree.id, tree.depth, tsk.title, tsk.status, tsk.priority
          FROM tree
          LEFT JOIN ${table} tsk ON tree.id = tsk.id
          ORDER BY tree.depth ASC, tsk.priority ASC
        `).all(taskId);
      } else {
        result = db.prepare(`
          WITH RECURSIVE tree(id, depth) AS (
            SELECT depends_on_id, 1 FROM dependencies WHERE issue_id = ?
            UNION ALL
            SELECT d.depends_on_id, t.depth + 1 FROM dependencies d
            JOIN tree t ON d.issue_id = t.id
            WHERE t.depth < 20
          )
          SELECT DISTINCT tree.id, tree.depth, tsk.title, tsk.status, tsk.priority
          FROM tree
          LEFT JOIN ${table} tsk ON tree.id = tsk.id
          ORDER BY tree.depth ASC, tsk.priority ASC
        `).all(taskId);
      }

      db.close();
      return result;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  /** @returns {import('./tasks-backend.js').Comment} */
  addComment(taskId, author, text, projectPath, extra = {}) {
    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db, project } = found;

    try {
      ensureCommentsSchema(db);
      const ts = now();
      const id = generateCommentId();
      const authorType = extra.author_type ?? null;
      const commentType = extra.comment_type ?? null;
      const sessionId = extra.session_id ?? null;
      const metadata = extra.metadata == null
        ? null
        : (typeof extra.metadata === 'string' ? extra.metadata : JSON.stringify(extra.metadata));

      db.prepare(
        `INSERT INTO comments (id, issue_id, text, author, author_type, comment_type, session_id, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, taskId, text, author, authorType, commentType, sessionId, metadata, ts);

      touchLastTouched(project.path);
      const comment = {
        id, text, author, author_type: authorType, comment_type: commentType,
        session_id: sessionId, metadata, created_at: ts,
      };
      db.close();
      return comment;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  /** @returns {Array<object>} */
  listComments(taskId, projectPath) {
    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const { db } = found;
    try {
      ensureCommentsSchema(db);
      const rows = db.prepare(
        `SELECT id, text, author, author_type, comment_type, session_id, metadata, created_at
         FROM comments WHERE issue_id = ? ORDER BY created_at ASC`
      ).all(taskId);
      db.close();
      return rows;
    } catch (err) {
      db.close();
      throw err;
    }
  }

  /** @returns {object|null} */
  findOpenQuestion(taskId, projectPath) {
    const found = findProjectForTask(taskId, projectPath, () => this.getProjects());
    if (!found) return null;
    const { db } = found;
    try {
      ensureCommentsSchema(db);
      const row = db.prepare(
        `SELECT id, text, author, author_type, comment_type, session_id, metadata, created_at
         FROM comments
         WHERE issue_id = ? AND comment_type = 'question' AND session_id IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`
      ).get(taskId);
      db.close();
      return row || null;
    } catch (err) {
      db.close();
      return null;
    }
  }
}
