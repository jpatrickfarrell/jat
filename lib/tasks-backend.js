/**
 * JAT Task Backend Interface
 *
 * This file defines the contract every task storage backend must satisfy.
 * It contains only JSDoc types and a class stub — no implementation.
 *
 * ─── HOW TO READ THIS FILE ───────────────────────────────────────────────────
 *
 * 1. Type declarations  — all shared shapes live at the top.
 * 2. TaskBackend class  — one method per operation, body always throws.
 * 3. Design notes       — transaction boundaries, error shapes, pagination.
 *
 * ─── BACKENDS ────────────────────────────────────────────────────────────────
 *
 * lib/tasks-sqlite.js    (jat-nsa33.2) — wraps existing better-sqlite3 code
 * lib/tasks-postgres.js  (jat-nsa33.3) — new Postgres adapter (pg / postgres.js)
 *
 * Callers (jt CLI, IDE API routes) import the active backend via the factory:
 *
 *   import { getBackend } from './tasks-backend.js';
 *   const db = getBackend();          // returns the configured TaskBackend
 *   const task = db.getById('jat-abc123');
 */

// ---------------------------------------------------------------------------
// Shared Types (JSDoc)
// ---------------------------------------------------------------------------

/**
 * A discovered JAT project (a directory that contains .jat/tasks.db or the
 * Postgres equivalent).
 *
 * @typedef {Object} Project
 * @property {string} name       - Short project name, e.g. "jat"
 * @property {string} path       - Absolute path to the project root
 * @property {string} dbPath     - Absolute path to the database file / DSN string
 */

/**
 * A dependency edge between two tasks.
 *
 * @typedef {Object} Dependency
 * @property {string} id         - The other task's ID
 * @property {string} type       - Always "blocks" in current schema
 * @property {string} title      - Other task's title
 * @property {string} status     - Other task's status
 * @property {number} priority   - Other task's priority
 */

/**
 * A comment left on a task.
 *
 * @typedef {Object} Comment
 * @property {number} id         - Auto-increment row ID
 * @property {string} author     - Free-text author name
 * @property {string} text       - Comment body (plain text / markdown)
 * @property {string} created_at - ISO 8601 timestamp
 */

/**
 * A single task as returned by all read and write methods.
 *
 * All fields are present; nullable fields use `null` (never `undefined`).
 *
 * @typedef {Object} Task
 * @property {string}            id              - Unique task ID, e.g. "jat-abc12"
 * @property {string}            title           - One-line summary
 * @property {string}            description     - Full description (markdown)
 * @property {string}            notes           - Internal notes (may contain [REVIEW_OVERRIDE:…])
 * @property {string}            status          - "open" | "in_progress" | "blocked" | "closed"
 * @property {number}            priority        - 0 = highest (P0), higher = lower priority
 * @property {string}            issue_type      - "bug" | "feature" | "task" | "epic" | "chore" | "chat"
 * @property {string|null}       assignee        - Agent or user name, or null
 * @property {string|null}       command         - Shell command for chores, or null
 * @property {string|null}       agent_program   - "claude-code" | "pi" | etc., or null
 * @property {string|null}       model           - Model override, e.g. "sonnet", or null
 * @property {string|null}       schedule_cron   - Cron expression for recurring tasks, or null
 * @property {string|null}       next_run_at     - ISO datetime of next scheduled run, or null
 * @property {string|null}       due_date        - ISO date (YYYY-MM-DD), or null
 * @property {string|null}       parent_id       - Parent task ID for sub-tasks, or null
 * @property {string}            created_at      - ISO 8601 creation timestamp
 * @property {string}            updated_at      - ISO 8601 last-modified timestamp
 * @property {string|null}       closed_at       - ISO 8601 close timestamp, or null
 * @property {string}            close_reason    - Reason supplied when closing (empty string if open)
 * @property {boolean}           internal        - True if task is dev-only (hidden from client/member roles)
 * @property {string}            project         - Project name this task belongs to
 * @property {string}            project_path    - Absolute path to the project root
 * @property {string[]}          labels          - Label strings, may be empty
 * @property {Dependency[]}      depends_on      - Tasks this task depends on (blocks this)
 * @property {Dependency[]}      blocked_by      - Tasks that depend on this task (this blocks them)
 * @property {Comment[]}         [comments]      - Present only when explicitly requested (getById)
 * @property {string|null}       [review_override] - Parsed from notes: "always_review" | "always_auto" | null
 * @property {number}            [relevance]     - BM25 score from search (present only on search results)
 */

/**
 * Options accepted by {@link TaskBackend#list}.
 *
 * @typedef {Object} ListOptions
 * @property {string}  [status]       - Filter by status
 * @property {number}  [priority]     - Filter by exact priority level
 * @property {string}  [projectName]  - Filter to one project by name
 * @property {string}  [closedAfter]  - ISO timestamp lower bound on closed_at
 * @property {string}  [closedBefore] - ISO timestamp upper bound on closed_at
 */

/**
 * Options accepted by {@link TaskBackend#search}.
 *
 * @typedef {Object} SearchOptions
 * @property {string}   [updatedAfter] - ISO date string lower bound on updated_at
 * @property {string}   [status]       - Filter by status
 * @property {string}   [type]         - Filter by issue_type
 * @property {string[]} [labels]       - All listed labels must be present
 * @property {number}   [limit]        - Max results (default 50)
 */

/**
 * Options accepted by {@link TaskBackend#getScheduled}.
 *
 * @typedef {Object} ScheduledOptions
 * @property {string} [projectName] - Filter to one project by name
 */

/**
 * Options accepted by {@link TaskBackend#getDependencyTree}.
 *
 * @typedef {Object} DependencyTreeOptions
 * @property {string}  [projectPath] - Hint to find the project quickly
 * @property {boolean} [reverse]     - If true, return dependents (what blocks ON this task)
 *                                     instead of dependencies (what this task depends ON)
 */

/**
 * A node in the dependency tree as returned by {@link TaskBackend#getDependencyTree}.
 *
 * @typedef {Object} DependencyTreeNode
 * @property {string}      id       - Task ID
 * @property {number}      depth    - Distance from the root task (1 = direct dep)
 * @property {string|null} title    - Task title (null if task has been hard-deleted)
 * @property {string|null} status   - Task status (null if task has been hard-deleted)
 * @property {number|null} priority - Task priority (null if task has been hard-deleted)
 */

/**
 * Fields accepted by {@link TaskBackend#create}.
 *
 * @typedef {Object} CreateOptions
 * @property {string}   projectPath         - Absolute path to project root (required)
 * @property {string}   title               - Task title (required)
 * @property {string}   [description]       - Full description (default: "")
 * @property {string}   [type]              - issue_type (default: "task")
 * @property {number}   [priority]          - Priority level (default: 2)
 * @property {string[]} [labels]            - Initial labels (default: [])
 * @property {string[]} [deps]              - Task IDs this task depends on (default: [])
 * @property {string}   [assignee]          - Agent or user name (default: null)
 * @property {string}   [notes]             - Internal notes (default: "")
 * @property {string}   [id]                - Explicit ID (auto-generated if omitted)
 * @property {string}   [command]           - Shell command for chores
 * @property {string}   [agent_program]     - Agent program override
 * @property {string}   [model]             - Model override
 * @property {string}   [schedule_cron]     - Cron expression
 * @property {string}   [next_run_at]       - ISO datetime for next run
 * @property {string}   [due_date]          - ISO date (YYYY-MM-DD)
 */

/**
 * Fields accepted by {@link TaskBackend#update}.
 * All fields are optional — only provided fields are changed.
 *
 * @typedef {Object} UpdateOptions
 * @property {string}   [title]
 * @property {string}   [description]
 * @property {string}   [notes]
 * @property {string}   [status]         - "open" | "in_progress" | "blocked" | "closed"
 * @property {number}   [priority]
 * @property {string}   [issue_type]
 * @property {string}   [assignee]
 * @property {string[]} [labels]         - Replace all labels when provided
 * @property {string}   [command]
 * @property {string}   [agent_program]
 * @property {string}   [model]
 * @property {string}   [schedule_cron]
 * @property {string}   [next_run_at]
 * @property {string}   [due_date]
 * @property {string}   [projectPath]    - Optional hint to find the project quickly
 */

/**
 * Result returned by {@link TaskBackend#initProject}.
 *
 * @typedef {Object} InitProjectResult
 * @property {string} dbPath - Path to the created / verified database file
 */

// ---------------------------------------------------------------------------
// TaskBackend — the interface every backend must implement
// ---------------------------------------------------------------------------

/**
 * Abstract task storage backend.
 *
 * Concrete implementations extend this class and override every method.
 * The base implementations all throw `new Error('not implemented')` so
 * that missing overrides surface immediately at runtime.
 *
 * Usage by callers:
 *
 *   const backend = getBackend();     // SqliteTaskBackend | PostgresTaskBackend
 *   const task = backend.getById('jat-abc12');
 *
 * ─── DESIGN NOTES ────────────────────────────────────────────────────────────
 *
 * TRANSACTION BOUNDARIES
 *   Each method is atomic and self-contained.  When a write touches multiple
 *   tables (e.g. createTask inserts into tasks + labels + dependencies), the
 *   backend wraps those statements in a single transaction.  No method returns
 *   a partial result: either the entire operation commits or the entire
 *   operation rolls back and the error propagates to the caller.
 *
 *   Cross-task operations (e.g. cascade-closing all children of an epic) are
 *   NOT part of this interface; they belong in higher-level service code that
 *   calls multiple backend methods and wraps them in an explicit transaction
 *   if the backend supports it.
 *
 * ERROR SHAPES
 *   All errors are plain JavaScript `Error` instances with a descriptive
 *   `.message` string.  Backends MUST NOT swallow errors silently.  Common
 *   error messages callers may check for (by substring or exact match):
 *
 *   - "Task not found: <id>"        — getById / update / close / delete /
 *                                     addDependency / removeDependency returned no row
 *   - "Task not found in project"   — project lookup failed (no .jat/tasks.db)
 *   - "A task cannot depend on itself"
 *   - "Adding dependency would create a cycle: <id> -> <id>"
 *   - "Duplicate dependency"        — already exists (backends should use INSERT OR IGNORE
 *                                     and return false rather than throw)
 *
 *   Backends SHOULD NOT re-throw raw SQL/driver errors to callers; wrap them
 *   with a meaningful message that includes the task ID and operation name.
 *
 * PAGINATION
 *   The current interface does NOT expose cursor/offset pagination.  All list
 *   methods return full result sets sorted as documented.  The `limit` option
 *   on `search()` is the only result-size control.
 *
 *   When a Postgres backend is added (jat-nsa33.3) and table sizes grow,
 *   pagination can be added as optional `{ limit, offset }` parameters to
 *   `list()` and `search()` without breaking existing callers (they already
 *   pass options objects).  Backends that don't implement pagination yet
 *   should silently ignore those fields.
 *
 * NULL vs UNDEFINED
 *   All returned Task fields are present and use `null` for absent values.
 *   Backends MUST NOT return `undefined` for any Task field — callers rely on
 *   strict null checks.
 *
 * TIMESTAMPS
 *   All timestamps are ISO 8601 strings in UTC (e.g. "2026-04-11T13:17:49.000Z").
 *   Backends are responsible for generating `created_at`, `updated_at`, and
 *   `closed_at` internally; callers do not pass timestamps.
 *
 * PROJECT RESOLUTION
 *   Several write methods accept an optional `projectPath` hint.  When
 *   provided, the backend MUST use it (fast path: skip discovery scan).
 *   When omitted, the backend discovers the project by scanning known
 *   locations.  All discovery logic is internal to the backend.
 */
export class TaskBackend {
  // ─── Project Discovery ──────────────────────────────────────────────────

  /**
   * Return all projects that have a JAT task database.
   * Results are sorted: config-listed projects first, then auto-discovered.
   *
   * @returns {Project[]}
   */
  getProjects() { throw new Error('not implemented'); }

  /**
   * Initialise a JAT project at the given path, creating the database and
   * directory structure if they do not yet exist.  Idempotent — safe to call
   * on an already-initialised project.
   *
   * @param {string} projectPath - Absolute path to the project root
   * @returns {InitProjectResult}
   */
  initProject(projectPath) { throw new Error('not implemented'); }

  // ─── ID Generation ──────────────────────────────────────────────────────

  /**
   * Generate a unique task ID for the given project prefix.
   * Format: `{prefix}-{5 alphanumeric chars}`, e.g. "jat-abc12".
   *
   * @param {string} prefix - Project name, e.g. "jat"
   * @returns {string}
   */
  generateId(prefix) { throw new Error('not implemented'); }

  // ─── Reads ───────────────────────────────────────────────────────────────

  /**
   * List tasks across all projects (or a single project when `options.projectName`
   * is supplied).  Results are sorted by priority ASC, then created_at DESC.
   *
   * @param {ListOptions} [options]
   * @returns {Task[]}
   */
  list(options = {}) { throw new Error('not implemented'); }

  /**
   * Fetch a single task by ID.  Searches all projects.
   * Returns null when no task with that ID exists.
   * The returned Task includes `comments`.
   *
   * @param {string} taskId
   * @returns {Task|null}
   */
  getById(taskId) { throw new Error('not implemented'); }

  /**
   * Return all open tasks that have no unresolved dependencies
   * (i.e. every dependency is closed, or there are no dependencies).
   * Sorted by priority ASC, created_at DESC.
   *
   * @returns {Task[]}
   */
  getReady() { throw new Error('not implemented'); }

  /**
   * Return tasks that have scheduling configured
   * (`schedule_cron` or `next_run_at` is non-null/non-empty).
   * Sorted by priority ASC, next_run_at ASC.
   *
   * @param {ScheduledOptions} [options]
   * @returns {Task[]}
   */
  getScheduled(options = {}) { throw new Error('not implemented'); }

  /**
   * Full-text search across title, description, and labels.
   * Uses FTS5 (SQLite) or tsvector (Postgres) when available; falls back to
   * LIKE-based search if the FTS index is unavailable.
   * Results are sorted by relevance score DESC.
   *
   * @param {string} query
   * @param {SearchOptions} [options]
   * @returns {Task[]}
   */
  search(query, options = {}) { throw new Error('not implemented'); }

  // ─── Writes ──────────────────────────────────────────────────────────────

  /**
   * Create a new task.  Inserts task row, labels, and dependencies atomically.
   * Returns the fully-enriched Task including `comments` (empty array on creation).
   *
   * @param {CreateOptions} opts
   * @returns {Task}
   */
  create(opts) { throw new Error('not implemented'); }

  /**
   * Update fields on an existing task.  Only provided fields are changed.
   * Setting `status` to "closed" auto-sets `closed_at`; setting it to any
   * other value clears `closed_at`.
   * When `labels` is provided, the existing label set is replaced entirely.
   * Returns the fully-enriched Task after the update.
   *
   * @param {string} taskId
   * @param {UpdateOptions} updates
   * @returns {Task}
   * @throws {Error} "Task not found: {taskId}"
   */
  update(taskId, updates) { throw new Error('not implemented'); }

  /**
   * Close a task with an optional reason.  Equivalent to calling
   * `update(taskId, { status: 'closed' })` but also records `close_reason`.
   * Returns the updated Task.
   *
   * @param {string} taskId
   * @param {string} [reason]        - Human-readable close reason
   * @param {string} [projectPath]   - Optional project path hint
   * @returns {Task}
   * @throws {Error} "Task not found: {taskId}"
   */
  close(taskId, reason = '', projectPath) { throw new Error('not implemented'); }

  /**
   * Hard-delete a task.  The database schema's CASCADE rules remove labels,
   * dependencies, and comments automatically.
   * Returns true if the task was deleted, false if it did not exist.
   *
   * @param {string} taskId
   * @param {string} [projectPath] - Optional project path hint
   * @returns {boolean}
   */
  delete(taskId, projectPath) { throw new Error('not implemented'); }

  // ─── Dependencies ────────────────────────────────────────────────────────

  /**
   * Declare that `taskId` depends on `dependsOnId` (i.e. `dependsOnId` must
   * be closed before `taskId` is considered ready).
   *
   * Performs cycle detection before inserting.  If the dependency already
   * exists the method returns false without throwing.
   *
   * @param {string} taskId
   * @param {string} dependsOnId
   * @param {string} [projectPath] - Optional project path hint
   * @returns {boolean}            - true if inserted, false if already existed
   * @throws {Error} "A task cannot depend on itself"
   * @throws {Error} "Adding dependency would create a cycle: {taskId} -> {dependsOnId}"
   */
  addDependency(taskId, dependsOnId, projectPath) { throw new Error('not implemented'); }

  /**
   * Remove the dependency edge from `taskId` → `dependsOnId`.
   * Returns true if removed, false if the edge did not exist.
   *
   * @param {string} taskId
   * @param {string} dependsOnId
   * @param {string} [projectPath] - Optional project path hint
   * @returns {boolean}
   */
  removeDependency(taskId, dependsOnId, projectPath) { throw new Error('not implemented'); }

  /**
   * Return all transitive dependencies of `taskId` (or, when `reverse` is true,
   * all tasks that transitively depend on `taskId`), up to depth 20.
   * Results are ordered by depth ASC, priority ASC.
   *
   * @param {string} taskId
   * @param {DependencyTreeOptions} [options]
   * @returns {DependencyTreeNode[]}
   */
  getDependencyTree(taskId, options = {}) { throw new Error('not implemented'); }

  // ─── Comments ────────────────────────────────────────────────────────────

  /**
   * Append a comment to a task.
   * Returns the newly created Comment.
   *
   * @param {string} taskId
   * @param {string} author        - Free-text author name
   * @param {string} text          - Comment body (plain text / markdown)
   * @param {string} [projectPath] - Optional project path hint
   * @returns {Comment}
   * @throws {Error} "Task not found: {taskId}"
   */
  addComment(taskId, author, text, projectPath) { throw new Error('not implemented'); }
}

// ---------------------------------------------------------------------------
// Backend Factory
// ---------------------------------------------------------------------------

/**
 * Return the active TaskBackend.
 *
 * Selection order:
 *   1. `JAT_BACKEND` environment variable: "sqlite" (default) | "postgres"
 *   2. `JAT_DATABASE_URL` environment variable: if set and starts with "postgres",
 *      the Postgres backend is used automatically.
 *
 * This is the *global* factory — it selects a single backend for the current
 * process.  For per-project routing (e.g. one project on sqlite, another on
 * postgres), use {@link getBackendForProject} instead.
 *
 * Backends are lazy-loaded so that the unused adapter is never imported.
 *
 * @returns {Promise<TaskBackend>}
 */
export async function getBackend() {
  const env = process.env.JAT_BACKEND;
  const url = process.env.JAT_DATABASE_URL || '';

  const usePostgres =
    env === 'postgres' ||
    (!env && (url.startsWith('postgres://') || url.startsWith('postgresql://')));

  if (usePostgres) {
    const { PostgresTaskBackend } = await import('./tasks-postgres.js');
    return new PostgresTaskBackend();
  }

  const { SqliteTaskBackend } = await import('./tasks-sqlite.js');
  return new SqliteTaskBackend();
}

// Cache keyed by project name — backend instances are expensive (they open
// DB connections) and are stateless between calls, so one per project is fine.
const _projectBackendCache = new Map();

/**
 * Return the TaskBackend configured for a specific project.
 *
 * Reads `~/.config/jat/projects.json` to decide whether the project is
 * sqlite-backed (default, zero-migration) or postgres-backed.  Callers that
 * only know a task ID should resolve the project name first (the task ID
 * prefix before the first hyphen is the project name in lowercase).
 *
 * Instances are cached per project — subsequent calls with the same name
 * return the same backend.
 *
 * @param {string} nameOrPath - Project name (e.g. "jat") or absolute path
 * @returns {Promise<TaskBackend>}
 */
export async function getBackendForProject(nameOrPath) {
  if (_projectBackendCache.has(nameOrPath)) {
    return _projectBackendCache.get(nameOrPath);
  }

  const { resolveBackendForProject } = await import('./projects-config.js');
  const resolved = resolveBackendForProject(nameOrPath);

  let backend;
  if (resolved.kind === 'postgres') {
    const { PostgresTaskBackend } = await import('./tasks-postgres.js');
    backend = new PostgresTaskBackend({ connectionString: resolved.url });
  } else {
    const { SqliteTaskBackend } = await import('./tasks-sqlite.js');
    backend = new SqliteTaskBackend();
  }

  _projectBackendCache.set(nameOrPath, backend);
  return backend;
}

/**
 * Clear the per-project backend cache.  Useful for tests and for picking up
 * config changes without restarting the host process.
 */
export function resetBackendCache() {
  _projectBackendCache.clear();
}
