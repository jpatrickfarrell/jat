# PRD: Ingest Architecture Clean Break

## Product overview

### Document title and version

**PRD: Ingest Architecture Clean Break**
Version 1.0 — April 2026

### Product summary

JAT currently maintains two SQLite databases for task-related data: a per-project `tasks.db` that holds all task records and a global `ingest.db` that serves as a deduplication index and metadata store for tasks arriving from external adapters (Slack, Telegram, feedback widget, voice, quick-task, Supabase). This split-database design was useful during early development but has become a liability: it requires cross-database joins for simple queries, causes the History tab in the jat-feedback widget to silently omit voice tasks, and introduces operational complexity with no material benefit.

This document covers the complete migration to a single-store design where all ingest metadata — source identity, external deduplication keys, and rich metadata such as console logs and network requests — lives directly on the `tasks` table in `tasks.db`. The global `ingest.db` is retired except for a lightweight daemon-cursor file that replaces the `adapter_state` table. The public API surface of the feedback widget endpoints does not change.

---

## Goals

### Business goals

- Eliminate cross-database query complexity in the IDE API layer.
- Make the feedback History tab complete and correct by unifying widget-submitted and voice-submitted tasks under a single query.
- Reduce operational surface: one fewer SQLite file to back up, debug, or accidentally lose.
- Establish a clean schema foundation for future ingest sources without requiring schema changes to `ingest.db`.

### User goals

- Users of the jat-feedback widget see all their submitted feedback — including voice notes — in the History tab.
- Developers working on integrations no longer need to understand or query a second database.
- Agents that query task data via `jt show` gain access to source and metadata fields without any additional tooling.

### Non-goals

- This migration does not change Meadow or any other JST-template project that uses Supabase `project_tasks`. Those projects are entirely separate.
- This migration does not alter the API surface of `POST /api/feedback/report`, `GET /api/feedback/reports`, or `POST /api/tasks/voice`.
- This migration does not add new ingest adapters or modify adapter behavior beyond the minimum changes required for deduplication.
- This migration does not implement real-time streaming of ingest events; the poll-based daemon loop is unchanged.
- This migration does not remove the `jat-ingest` daemon process, the integrations config file, or any adapter plugin code beyond the `ingest.db` write calls.

---

## User personas

### Key user types

1. **IDE developer (internal)** — the primary builder and maintainer of JAT, who runs the ingest daemon locally and queries task data regularly.
2. **Feedback widget end user** — a developer or tester using a JAT-powered app who submits bug reports or voice notes via the `<jat-feedback>` widget and checks the History tab.
3. **Integration author** — someone adding or maintaining an ingest adapter (Slack, Telegram, custom).

### Basic persona details

**IDE developer**
- Deep familiarity with the codebase, runs `db-query` and `jt show` frequently.
- Frustrated by the need to open two databases to correlate ingest metadata with task details.
- Wants a single source of truth for all task data.

**Feedback widget end user**
- Submits a mix of text reports and voice notes.
- Expects the History tab to show everything they submitted.
- Currently sees voice tasks silently missing — a confusing UX regression.

**Integration author**
- Builds adapters against the plugin interface.
- Currently writes to two stores; wants a simpler contract with one write operation.

### Role-based access

No new access control model is introduced. All reads and writes to `tasks.db` continue to use the existing file-level permissions and the `jt` CLI / `better-sqlite3` library access patterns already in place.

---

## Functional requirements

### Schema changes (priority: P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Add `source TEXT` column to the `tasks` table with allowed values: `feedback-widget`, `slack`, `telegram`, `voice`, `quick-task`, `supabase`, and `NULL` for manually created tasks. | P0 |
| FR-002 | Add `source_item_id TEXT` column to the `tasks` table to store the external deduplication key (e.g., Slack message timestamp, feedback report ID). | P0 |
| FR-003 | Add `metadata TEXT` column to the `tasks` table as a JSON blob for rich payload data: `console_logs`, `network_requests`, `selected_elements`, screenshots metadata, and any adapter-specific fields. | P0 |
| FR-004 | Create a unique partial index `idx_tasks_source_item ON tasks(source, source_item_id) WHERE source_item_id IS NOT NULL` to enforce deduplication at the database level. | P0 |
| FR-005 | The schema changes must be applied as `ALTER TABLE` migrations that do not require rebuilding or re-creating existing `tasks.db` files. | P0 |

### Adapter changes (priority: P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006 | Update the Slack adapter to pass `source = 'slack'` and `source_item_id = item.id` when calling `createTask()`. Remove the subsequent `recordItem()` call to `ingest.db`. | P0 |
| FR-007 | Update the Telegram adapter identically: pass `source = 'telegram'` and `source_item_id`, remove `recordItem()`. | P0 |
| FR-008 | Update the feedback-widget adapter to pass `source = 'feedback-widget'` and `source_item_id`, remove `recordItem()`. | P0 |
| FR-009 | Update the quick-task adapter to pass `source = 'quick-task'` and `source_item_id`, remove `recordItem()`. | P0 |
| FR-010 | Update the Supabase adapter to pass `source = 'supabase'` and `source_item_id`, remove `recordItem()`. | P0 |
| FR-011 | Deduplication for all adapters must rely solely on the unique index on `tasks(source, source_item_id)`. An `INSERT OR IGNORE` equivalent (or constraint-conflict handling via `jt create`) must silently skip already-ingested items. | P0 |

### Daemon cursor migration (priority: P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012 | Replace the `adapter_state` table in `ingest.db` with a JSON file at `~/.config/jat/daemon-state.json`. The file holds a single object where keys are `source_id` strings and values are cursor state objects — identical in structure to the current `state_json` column values. | P0 |
| FR-013 | On daemon startup, if `~/.config/jat/daemon-state.json` does not exist, automatically attempt a one-time migration: read all rows from `adapter_state` in `ingest.db` (if present) and write them to the JSON file. | P0 |
| FR-014 | After a successful cursor-state migration, the daemon must no longer open or write to `ingest.db` for any purpose. | P0 |

### API changes (priority: P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015 | Rewrite `GET /api/feedback/reports` to query only `tasks.db`. The new query must return tasks where `source IN ('feedback-widget', 'voice')` or (for backward compatibility during the transition period) `labels_text LIKE '%widget%'` or `labels_text LIKE '%voice%'`. | P0 |
| FR-016 | The rewritten `GET /api/feedback/reports` must populate `console_logs` and `network_requests` from the `metadata` JSON column on the task row rather than from `ingest.db.ingested_items.origin_metadata`. | P0 |
| FR-017 | `POST /api/feedback/report` must write `source = 'feedback-widget'` and a deterministic `source_item_id` to the task on creation. It must stop writing to `ingest.db`. | P0 |
| FR-018 | `POST /api/tasks/voice` must write `source = 'voice'` to each task it creates. | P0 |
| FR-019 | All three endpoints must continue to return the same JSON shape to the widget client. No breaking API changes. | P0 |

### One-time backfill migration (priority: P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020 | Provide a standalone migration script (`scripts/migrate-ingest-to-tasks.js`) that, when run once against an existing installation, backfills `source`, `source_item_id`, and `metadata` on existing tasks by joining `ingested_items` to `tasks` on `task_id`. | P1 |
| FR-021 | The migration script must set `source = 'voice'` for tasks where `source` is still NULL and `labels_text LIKE '%voice%'`. | P1 |
| FR-022 | The migration script must set `source = 'feedback-widget'` for tasks where `source` is still NULL and `labels_text LIKE '%widget%'`. | P1 |
| FR-023 | The migration script must be idempotent: running it twice must produce the same result as running it once. | P1 |
| FR-024 | The migration script must log a summary of rows updated per source type and any rows skipped due to conflicts. | P1 |

### Cleanup (priority: P2)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025 | Remove `poll_log` table usage from the ingest daemon. The table is audit-only and not load-bearing. | P2 |
| FR-026 | Remove `thread_replies` table usage. Thread reply tracking is already handled by sidecar JSON via `feedbackThreads.js`. | P2 |
| FR-027 | Remove `ingested_items` table usage from all call sites once the migration is confirmed complete. | P2 |
| FR-028 | Remove the `ingest.db` open/initialization code from `dedup.js` after all table usage is removed. | P2 |
| FR-029 | Update `jat-ingest-status` CLI tool to read statistics from `tasks.db` (grouped by `source`) rather than from `ingest.db`. | P2 |

---

## User experience

### Entry points

- **Feedback widget History tab** — the primary visible change for end users. Voice tasks now appear alongside widget-submitted reports, ordered by `created_at` descending.
- **JAT IDE `/tasks` page** — no visible change. Tasks created via ingest continue to appear normally; the new `source` column is not surfaced in the default task list UI.
- **JAT IDE task detail drawer** — no visible change in this iteration. Future iterations may surface the `source` badge and metadata viewer here.
- **`jt show <id>` CLI** — no visible change. The new columns are present in the SQLite row but `jt show` does not render them unless a future update adds support.

### Core experience

The core experience change is invisible to end users: the History tab in the feedback widget loads faster (single-database query vs cross-database join) and shows a complete list including voice notes. For the IDE developer, `db-query` against the project's `tasks.db` now surfaces all ingest metadata without needing to open a second database.

### Advanced features

- The `metadata` JSON column enables future features such as a "Console Logs" inspector panel in the task detail drawer, searchable network request replay, and richer agent context injection when an agent picks up a feedback task.
- The `source` column enables future ingest source filtering in the task list UI (e.g., "show only Slack tasks").

### UI/UX highlights

- No UI changes are required for the core migration.
- The feedback widget History tab gains voice task visibility without any widget package changes.
- Error states in the rewritten `GET /api/feedback/reports` must be graceful: if the `tasks.db` query fails, return `{ reports: [], error: "..." }` with HTTP 500, matching the existing contract.

---

## Narrative

A developer using a JAT-powered application submits three bug reports during a testing session: two via the feedback widget's text form and one as a voice note recorded on their phone. Later, they open the History tab in the widget to check the status of their reports. Today, only the two text reports appear — the voice note is invisible because it lives in a separate code path that was never wired into the history query. After this migration, all three reports appear in the History tab, sorted chronologically, with the console logs and network requests from the text reports accessible to the developer reviewing the bug. The developer sees a complete picture of what they reported without any change to how they submitted the reports or how the widget looks.

---

## Success metrics

### User-centric metrics

- Voice tasks appear in `GET /api/feedback/reports` for 100% of installations after the migration script is run.
- Zero feedback reports are lost or duplicated during the migration.
- The History tab load time does not regress; single-database query should be equal to or faster than the previous cross-database join.

### Business metrics

- `ingest.db` is no longer opened by any process in normal operation after the migration.
- The `dedup.js` module no longer references `ingest.db` after the cleanup phase.
- All five adapter types (Slack, Telegram, feedback-widget, quick-task, Supabase) write `source` and `source_item_id` to new tasks.

### Technical metrics

- The migration script completes without errors on a live `tasks.db` containing existing tasks.
- The unique index on `(source, source_item_id)` correctly prevents duplicate ingest on re-poll, verified by running a poll cycle twice and confirming no duplicate tasks are created.
- `npm run build` in `ide/` passes without type errors related to the new columns (TypeScript definitions updated).
- No regressions in `GET /api/feedback/reports` response shape as confirmed by existing widget integration tests.

---

## Technical considerations

### Integration points

- **`tools/ingest/lib/dedup.js`** — currently the central module that opens `ingest.db` and provides `isDuplicate()`, `recordItem()`, `getAdapterState()`, `setAdapterState()`, `logPoll()`, `registerThread()`, etc. After the migration: `getAdapterState()` and `setAdapterState()` are reimplemented against `daemon-state.json`; `isDuplicate()` and `recordItem()` are removed; thread-related functions are removed. The module may be renamed to `adapterState.js` to reflect its reduced scope.
- **`tools/ingest/lib/taskCreator.js`** — `createTask()` must accept and forward `source` and `source_item_id` to the `jt create` CLI. Because `jt create` is invoked via `execFileSync`, these values must either be passed as new CLI flags (requires `jt` CLI changes) or written via a direct SQLite `UPDATE` immediately after task creation. The direct SQLite update path is lower risk since it does not require changes to the `jt` CLI.
- **`ide/src/routes/api/feedback/report/+server.js`** — currently writes to `ingest.db` after calling `createTask()`. The `ingest.db` write block must be replaced with a direct `UPDATE tasks SET source=?, source_item_id=?, metadata=? WHERE id=?` using `better-sqlite3`.
- **`ide/src/routes/api/feedback/reports/+server.js`** — replace the `ingest.db` `SELECT` and per-row `getTaskById()` calls with a single `SELECT` on `tasks.db`. The `console_logs` and `network_requests` fields must be parsed from `task.metadata` JSON.
- **`ide/src/lib/server/jat-tasks.js`** — `createTask()` in this module (IDE-side, distinct from the ingest-side `taskCreator.js`) should be updated to optionally accept and persist `source`, `source_item_id`, and `metadata`.

### Data storage and privacy

- The `metadata` column may contain user-submitted console logs and network requests, which could include PII or credentials. This is unchanged from the current behavior (this data was already stored in `ingest.db`). No new data categories are introduced.
- `~/.config/jat/daemon-state.json` stores only adapter cursor positions (timestamps, message IDs) — no user-submitted content.
- The per-project `tasks.db` already stores task descriptions including page URLs and console logs. Moving metadata there does not change the effective data residency.

### Scalability and performance

- The `(source, source_item_id)` unique partial index makes deduplication O(log n) in the number of ingested tasks, which is a performance improvement over the current `INSERT OR IGNORE` into `ingested_items` followed by a separate `createTask()` call.
- The single-database `GET /api/feedback/reports` query eliminates the N+1 pattern (one `getTaskById()` call per row from `ingested_items`) that currently exists. Expected speedup: 10–50ms on small datasets.
- `daemon-state.json` is read once on daemon startup and written after each successful poll cycle. File I/O for a 6-row JSON object is negligible.
- The `metadata` TEXT column stores JSON blobs that may be 50–500 KB for reports with full console logs. SQLite handles this within normal operating parameters. No size cap is enforced in this iteration.

### Potential challenges

- **`jt create` does not currently accept `--source` or `--source_item_id` flags.** The safest path is to call `createTask()` as today, then immediately run a direct SQLite `UPDATE` on the returned task ID to set the three new columns. This requires that `taskCreator.js` opens the project's `tasks.db` directly after task creation, or that a new helper function is added to `jt` for this purpose.
- **Partial migration state.** If the daemon is restarted mid-migration (between schema change and adapter code deployment), some new tasks will have `source = NULL`. The backfill script handles this case by using `labels_text` as a fallback signal. Operators should be advised to stop the daemon before migrating.
- **Thread reply routing still uses `findThreadByParentItemId()` from `dedup.js`.** This function queries `thread_replies` in `ingest.db`. Thread reply routing must be migrated to the sidecar JSON approach (already used by the feedback widget) or to a new `tasks.db`-based lookup before `thread_replies` is dropped. This is an implicit dependency that must be resolved in the cleanup phase.
- **The `getOriginByTaskId()` function in `dedup.js`** is used by `jat-reply-router` to look up channel/sender info for outbound replies. After the migration, this lookup must query `tasks.metadata` JSON instead of `ingested_items`.
- **`jat-ingest-status`** currently queries `ingested_items` and `poll_log` for its statistics display. It must be updated to query `tasks` grouped by `source` before `ingest.db` is decommissioned.

---

## Milestones and sequencing

### Project estimate

Medium effort — estimated 3–5 days for a single developer working sequentially through the phases below. The schema change and backfill are low risk; the adapter and API rewrites are straightforward but require care around the dedup contract.

### Team size

1–2 developers. One agent can own the schema + backfill + daemon-state work; a second can own the IDE API rewrites in parallel.

### Suggested phases

**Phase 1 — Schema and daemon-state foundation (days 1–2)**

Deploy the schema changes and daemon-state migration first. This is fully additive and does not break anything.

- Add `source`, `source_item_id`, `metadata` columns via `ALTER TABLE` in the tasks schema initializer.
- Create the unique partial index.
- Implement `daemon-state.json` read/write in a new `adapterState.js` module.
- Add the one-time migration from `adapter_state` on daemon startup.
- Run `scripts/migrate-ingest-to-tasks.js` against the live database to backfill existing tasks.
- Verify: `db-query "SELECT source, COUNT(*) FROM tasks GROUP BY source"` shows expected counts.

**Phase 2 — Adapter rewrites (day 2–3)**

Update each adapter to write `source` and `source_item_id` to the task and stop writing to `ingest.db`. Run each adapter in `--dry-run` mode to confirm before enabling.

- Update `taskCreator.js` to accept and persist `source` and `source_item_id` via post-creation `UPDATE`.
- Update all five adapters: Slack, Telegram, feedback-widget, quick-task, Supabase.
- Update `jat-reply-router` to read origin data from `tasks.metadata` instead of `ingested_items`.
- Verify: poll Slack source twice, confirm no duplicate tasks created.

**Phase 3 — IDE API rewrites (day 3–4)**

Rewrite the two feedback API routes to use only `tasks.db`.

- Rewrite `GET /api/feedback/reports` — single query, parse `metadata` JSON for `console_logs` and `network_requests`.
- Rewrite `POST /api/feedback/report` — remove `ingest.db` write, add `source`/`source_item_id`/`metadata` to task on creation.
- Update `POST /api/tasks/voice` — add `source = 'voice'` to created tasks.
- Verify: feedback widget History tab shows both widget reports and voice tasks.

**Phase 4 — Cleanup and decommission (day 4–5)**

Remove all remaining `ingest.db` dependencies and retire the database.

- Remove `poll_log` and `thread_replies` usage from the daemon.
- Remove `ingested_items` write and read calls from all remaining call sites.
- Remove `ingest.db` open/init code from `dedup.js` (or delete the module if fully replaced).
- Update `jat-ingest-status` to query `tasks.db`.
- Update `schema.sql` in `tools/ingest/` to document the removed tables.
- Verify: `lsof | grep ingest.db` returns nothing during normal daemon operation.

---

## User stories

### Schema and migration

**US-001**
**Title:** Apply additive schema migration to tasks.db
**Description:** As an IDE developer, I want the three new columns added to every project's `tasks.db` on first startup after the update, so that existing data is preserved and new data can be written immediately.
**Acceptance criteria:**
- Running the IDE or `jt` CLI against an existing `tasks.db` that lacks the new columns automatically runs `ALTER TABLE tasks ADD COLUMN source TEXT`, `ALTER TABLE tasks ADD COLUMN source_item_id TEXT`, and `ALTER TABLE tasks ADD COLUMN metadata TEXT`.
- The migration is guarded by a column-existence check (e.g., `PRAGMA table_info`) so it does not fail on already-migrated databases.
- Existing tasks retain all prior field values unchanged.
- The unique partial index `idx_tasks_source_item` is created if not present.
- The migration runs within 100ms on a database with 10,000 existing tasks.

**US-002**
**Title:** Migrate daemon cursor state to JSON file
**Description:** As the ingest daemon operator, I want cursor positions (last-seen Slack timestamp, last Telegram update ID, etc.) to survive a database decommission, so that the daemon does not re-ingest old items after the migration.
**Acceptance criteria:**
- On first startup after the update, if `~/.config/jat/daemon-state.json` does not exist and `~/.local/share/jat/ingest.db` does exist, the daemon reads all rows from `adapter_state` and writes them to the JSON file.
- The JSON file is created at `~/.config/jat/daemon-state.json` with the format `{ "<source_id>": { ...state_json }, ... }`.
- Subsequent startups read from the JSON file and do not attempt to migrate again.
- If `ingest.db` does not exist and the JSON file does not exist, the daemon starts with empty cursor state (first-run behavior unchanged).
- The JSON file is written atomically (write to `.tmp`, rename) to prevent corruption on crash.

**US-003**
**Title:** Run backfill script to populate source fields on existing tasks
**Description:** As an IDE developer performing the migration, I want a script that sets `source`, `source_item_id`, and `metadata` on tasks that already exist in `tasks.db`, so that the History tab is complete after migration without re-ingesting anything.
**Acceptance criteria:**
- Running `node scripts/migrate-ingest-to-tasks.js` reads all rows from `ingested_items` in `ingest.db` (if present) and updates matching tasks in `tasks.db` using `task_id` as the join key.
- For tasks with a match, `source` is set to `origin_adapter_type`, `source_item_id` is set to `item_id`, and `metadata` is set to `origin_metadata`.
- For tasks with no match in `ingested_items` where `labels_text LIKE '%voice%'` and `source IS NULL`, the script sets `source = 'voice'`.
- For tasks with no match in `ingested_items` where `labels_text LIKE '%widget%'` and `source IS NULL`, the script sets `source = 'feedback-widget'`.
- Running the script twice produces identical results (idempotent).
- The script prints a summary: rows updated per source type, rows skipped (already had source), rows where `task_id` not found in `tasks.db`.
- The script exits with code 0 on success and code 1 on fatal error (e.g., `tasks.db` not found).

### Ingest daemon and adapters

**US-004**
**Title:** Slack adapter sets source fields on created tasks
**Description:** As an integration author, I want Slack-ingested tasks to carry `source = 'slack'` and `source_item_id = '<slack-message-ts>'`, so that deduplication works without `ingest.db` and tasks are identifiable by origin.
**Acceptance criteria:**
- After the adapter calls `createTask()` and receives a task ID, it immediately updates `tasks.source = 'slack'` and `tasks.source_item_id = item.id` (the Slack message timestamp) on that task row.
- The adapter no longer calls `recordItem()` or writes to `ingest.db`.
- On the next poll cycle, if the same Slack message is encountered again, `createTask()` either handles the unique-index conflict gracefully (no duplicate task created) or the adapter detects the item is already present and skips it.
- The adapter's reply-routing behavior (`pollReplies`, thread tracking) continues to function correctly.

**US-005**
**Title:** Telegram adapter sets source fields on created tasks
**Description:** As an integration author, I want Telegram-ingested tasks to carry `source = 'telegram'` and `source_item_id`, so that deduplication and origin tracking work without `ingest.db`.
**Acceptance criteria:**
- Same as US-004, with `source = 'telegram'` and `source_item_id` set to the Telegram update ID or message ID used as the item's external key.
- The adapter no longer calls `recordItem()`.
- Duplicate prevention on re-poll is confirmed by running `jat-ingest --once --source <telegram-source-id>` twice and verifying no duplicate tasks appear in `tasks.db`.

**US-006**
**Title:** Feedback-widget adapter sets source fields on created tasks
**Description:** As an integration author, I want feedback-widget tasks created via the ingest adapter path to carry `source = 'feedback-widget'` and a deterministic `source_item_id`, so that they appear in the History tab.
**Acceptance criteria:**
- Tasks created by the feedback-widget adapter have `source = 'feedback-widget'` and a non-null `source_item_id` set immediately after creation.
- The adapter no longer writes to `ingest.db`.
- The `metadata` column is populated with the full console_logs and network_requests payload from `origin_metadata`.

**US-007**
**Title:** Quick-task adapter sets source fields on created tasks
**Description:** As an integration author, I want quick-task-ingested tasks to carry `source = 'quick-task'` and `source_item_id`.
**Acceptance criteria:**
- Same pattern as US-004. `source = 'quick-task'` and `source_item_id` is the external item identifier for the quick-task source.
- No writes to `ingest.db`.

**US-008**
**Title:** Supabase adapter sets source fields on created tasks
**Description:** As an integration author, I want Supabase-ingested tasks to carry `source = 'supabase'` and `source_item_id`.
**Acceptance criteria:**
- Same pattern as US-004. `source = 'supabase'` and `source_item_id` is the Supabase row identifier.
- No writes to `ingest.db`.

**US-009**
**Title:** Daemon cursor reads and writes to JSON file, not ingest.db
**Description:** As the ingest daemon, I want to persist my poll cursor state to `daemon-state.json` so that I resume from the correct position after restart without any dependency on `ingest.db`.
**Acceptance criteria:**
- `getAdapterState(sourceId)` reads from `~/.config/jat/daemon-state.json` and returns the cursor object for the given source, or `{}` if not present.
- `setAdapterState(sourceId, state)` writes the updated cursor back to `daemon-state.json` atomically.
- Concurrent writes from multiple adapter poll cycles are handled safely (either via a file lock or by limiting writes to a single async writer queue).
- No call to `getDb()` or any `ingest.db` function occurs during a normal poll cycle.

**US-010**
**Title:** Deduplication enforced by unique index, not ingested_items lookup
**Description:** As the ingest daemon, I want task deduplication to be handled by the database constraint on `tasks(source, source_item_id)`, so that I do not need a pre-check lookup and the logic is atomic.
**Acceptance criteria:**
- When `createTask()` is called for an item that already exists (same `source` + `source_item_id`), the resulting SQLite constraint violation is caught and the adapter treats the item as already-processed (no duplicate task, no error logged, no crash).
- The constraint violation path can be tested by running `jat-ingest --once` twice on the same source and confirming task count does not change on the second run.
- The existing `isDuplicate()` pre-check call is removed from all adapter code paths.

**US-011**
**Title:** Reply routing reads origin data from tasks.metadata
**Description:** As the reply router, I want to look up channel and sender information for outbound replies from `tasks.metadata` rather than from `ingested_items`, so that reply routing continues to work after `ingest.db` is retired.
**Acceptance criteria:**
- `jat-reply-router` (or the equivalent call site using `getOriginByTaskId()`) resolves `adapterType`, `channelId`, `senderId`, and `threadId` from `JSON.parse(task.metadata)` for the given task ID.
- Reply routing works end-to-end for a Slack-originated chat task: agent runs `jat-signal reply`, message is delivered to the correct Slack thread.
- The `getOriginByTaskId()` function in `dedup.js` is either updated to query `tasks.db` or removed and replaced by a direct query at the call site.

### IDE API routes

**US-012**
**Title:** POST /api/feedback/report writes source fields to tasks.db and stops writing to ingest.db
**Description:** As a developer submitting a bug report via the feedback widget, I want my report to be stored correctly in `tasks.db` with source metadata, so that it appears in the History tab immediately.
**Acceptance criteria:**
- After creating the task, the route sets `source = 'feedback-widget'`, `source_item_id = 'feedback-<taskId>'`, and `metadata = JSON.stringify({ console_logs, network_requests })` on the task row.
- The route does not attempt to open or write to `~/.local/share/jat/ingest.db`.
- If `ingest.db` does not exist on the server, the route functions without error.
- The response shape `{ ok: true, id: "<taskId>", message: "..." }` is unchanged.

**US-013**
**Title:** POST /api/tasks/voice writes source = 'voice' to created tasks
**Description:** As a developer submitting a voice note via the feedback widget, I want the resulting task to carry `source = 'voice'` so that it appears in the History tab alongside widget reports.
**Acceptance criteria:**
- Every task created by `POST /api/tasks/voice` has `source = 'voice'` set in `tasks.db`.
- The route does not write to `ingest.db`.
- Voice tasks created before the migration (backfilled by the migration script) also appear in the History tab.

**US-014**
**Title:** GET /api/feedback/reports queries only tasks.db and returns unified results
**Description:** As a feedback widget user, I want the History tab to show all my submitted reports — both text reports and voice notes — so that I have a complete record of what I submitted.
**Acceptance criteria:**
- The route executes a single SQL query on `tasks.db`: `SELECT * FROM tasks WHERE source IN ('feedback-widget', 'voice') OR labels_text LIKE '%widget%' OR labels_text LIKE '%voice%' ORDER BY created_at DESC LIMIT 100`.
- The route does not open `ingest.db` at any point.
- Voice tasks appear in the response with `type: 'task'`, `console_logs: null`, `network_requests: null` (unchanged from the current voice-task section behavior).
- Feedback-widget tasks include `console_logs` and `network_requests` parsed from `task.metadata` JSON.
- The thread data (from `feedbackThreads.js` sidecar JSON) continues to be loaded and returned correctly.
- Screenshot URLs continue to be resolved from `task-images.json` correctly.
- The response shape `{ reports: [...] }` is unchanged.
- If `tasks.db` does not exist or the query fails, the route returns `{ reports: [], error: "..." }` with HTTP 500.

**US-015**
**Title:** GET /api/feedback/reports returns correct status mapping for all source types
**Description:** As a feedback widget user, I want the `status` field in History to correctly reflect the current task state for both widget reports and voice tasks.
**Acceptance criteria:**
- `mapTaskStatusToReportStatus()` is applied identically to all returned tasks regardless of source.
- A voice task with `status = 'closed'` and `close_reason` containing "accepted" returns `status: 'accepted'` in the API response.
- A feedback-widget task with `status = 'in_progress'` returns `status: 'in_progress'`.

### Cleanup

**US-016**
**Title:** Remove poll_log writes from the ingest daemon
**Description:** As an IDE developer, I want the daemon to stop writing to the `poll_log` table so that `ingest.db` has no active writers after the migration.
**Acceptance criteria:**
- All calls to `logPoll()` in `scheduler.js` and any adapter code are removed.
- The daemon runs a complete poll cycle without any `ingest.db` write operation occurring.
- Removing `poll_log` writes does not break any observable daemon behavior (poll cycles still execute, errors are still logged to stdout/stderr).

**US-017**
**Title:** Remove thread_replies writes from the ingest daemon
**Description:** As an IDE developer, I want the daemon to stop using the `thread_replies` table since thread tracking is already handled by sidecar JSON files.
**Acceptance criteria:**
- All calls to `registerThread()`, `getActiveThreads()`, `updateThreadCursor()`, and `deactivateThread()` that reference `ingest.db` are removed or redirected to the sidecar JSON approach.
- Thread reply routing continues to work for Slack and Telegram sources using the existing sidecar JSON mechanism.
- No `ingest.db` write occurs during thread-reply handling.

**US-018**
**Title:** Decommission ingest.db entirely
**Description:** As an IDE developer, I want `ingest.db` to no longer be opened by any JAT process during normal operation, so that it can be safely archived or deleted.
**Acceptance criteria:**
- Running `lsof | grep ingest.db` returns no results while the ingest daemon and IDE are running normally.
- The `getDb()` function in `dedup.js` is either deleted or never called.
- If `ingest.db` still exists on disk (not yet manually deleted), no process opens or writes to it.
- `jat-ingest-status` renders statistics from `tasks.db` grouped by `source` column.

**US-019**
**Title:** Update jat-ingest-status to query tasks.db
**Description:** As an IDE developer running `jat-ingest-status`, I want to see per-source ingestion counts and last-ingest timestamps drawn from `tasks.db`, so that the status tool works after `ingest.db` is decommissioned.
**Acceptance criteria:**
- `jat-ingest-status` executes `SELECT source, COUNT(*) as total, MAX(created_at) as last_ingested FROM tasks WHERE source IS NOT NULL GROUP BY source` (or equivalent) against the project's `tasks.db`.
- The output format matches the existing display (source name, item count, last ingested timestamp) as closely as possible.
- The tool does not open `ingest.db`.

### Error and edge cases

**US-020**
**Title:** Graceful handling when ingest.db is absent on an upgraded installation
**Description:** As an IDE developer who deleted ingest.db before running the new code, I want all routes and daemon processes to start successfully without errors referencing the missing file.
**Acceptance criteria:**
- `POST /api/feedback/report` does not attempt to open `ingest.db` and does not emit a warning about it being absent.
- `GET /api/feedback/reports` does not attempt to open `ingest.db`.
- The ingest daemon starts and completes a poll cycle without referencing `ingest.db`.
- No `SQLITE_CANTOPEN` or `ENOENT` errors appear in the IDE server log for `ingest.db`.

**US-021**
**Title:** Graceful handling of tasks with no source set (legacy tasks)
**Description:** As a feedback widget user on an installation where the migration script has not yet been run, I want the History tab to still show my old reports even if they lack `source` values, by falling back to label-based filtering.
**Acceptance criteria:**
- The `GET /api/feedback/reports` query includes the `labels_text LIKE '%widget%'` and `labels_text LIKE '%voice%'` fallback clauses so that pre-migration tasks appear.
- Tasks matched by label fallback are returned with the same response shape as tasks matched by `source`.
- Once the migration script is run and `source` is set on all eligible tasks, the label fallback clauses continue to work harmlessly (they may match duplicates, which the `seenTaskIds` dedup set prevents from being returned twice).

**US-022**
**Title:** Unique index constraint violation is silently ignored on duplicate ingest
**Description:** As the ingest daemon, I want attempts to ingest an already-seen item to fail silently without logging an error or crashing the poll loop.
**Acceptance criteria:**
- When `UPDATE tasks SET source=?, source_item_id=? WHERE id=?` encounters a unique index conflict (because a task with the same `source` + `source_item_id` already exists), the operation is treated as a successful no-op.
- Alternatively, if deduplication is detected before task creation, `createTask()` is never called for the duplicate item.
- The poll loop continues to the next item without incrementing an error counter.
- The daemon log does not emit a warning for expected duplicate skips (only for unexpected errors).

**US-023**
**Title:** Migration script handles missing or empty ingest.db gracefully
**Description:** As an IDE developer running the migration script on a fresh installation (where ingest.db was never created), I want the script to complete without error and simply report zero rows migrated.
**Acceptance criteria:**
- If `~/.local/share/jat/ingest.db` does not exist, the script skips the `ingested_items` join phase and proceeds directly to the label-based backfill.
- The script exits with code 0 and prints a message indicating that `ingest.db` was not found and label-based backfill was applied instead.
- The label-based backfill still runs and sets `source` on tasks that have voice or widget labels but no source value.

**US-024**
**Title:** Metadata JSON is safely parsed with error isolation in GET /api/feedback/reports
**Description:** As a developer who may have malformed metadata stored from an earlier version, I want the reports endpoint to return remaining reports even if one task's metadata fails to parse.
**Acceptance criteria:**
- If `JSON.parse(task.metadata)` throws for a given task row, that task is still included in the response with `console_logs: null` and `network_requests: null`.
- The parse error is logged to the server console but does not propagate to the HTTP response.
- Other task rows in the same response are unaffected.
