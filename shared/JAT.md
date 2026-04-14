# JAT Agent Essentials

Essential tools and capabilities available to all JAT agents. This context is automatically injected — you have these tools available regardless of which project you're working on.

## Task Management (jt)

`jt` works on **both SQLite and postgres-backed projects** (e.g. graduated meadow projects). For postgres projects it transparently proxies through the IDE REST API — the JAT IDE must be running (`jat` command) when working on postgres projects.

```bash
jt ready --json                    # Find available work (highest priority, no blockers)
jt show <id> --json                # View task details
jt list --status open              # List all open tasks
jt search "keyword"                # Search tasks
jt update <id> --status in_progress --assignee AgentName
jt close <id> --reason "Completed"
```

**Status values** (use underscores, not hyphens):
- Agent-workable: `open`, `in_progress`
- Paused/mid-flight: `waiting`, `blocked`, `submitted`, `accepted`, `deployed`
- Terminal/special: `closed`, `dev`
**Task types:** `bug`, `feature`, `task`, `epic`, `chore`, `chat`

> **Postgres note:** `jt ready` on postgres returns all open tasks (dependency filtering is SQLite-only). The JAT IDE at the project's configured port must be running.

### Dependencies

```bash
jt dep add parent-id child-id      # parent depends on child
jt dep tree task-id                # Show dependency tree
```

## Data Tables (jt data)

Per-project data tables stored in `.jat/data.db`. Use these commands instead of raw sqlite3.

```bash
jt data tables                     # List all tables
jt data schema <table>             # Show columns and types
jt data query "SELECT ..."         # Read-only SQL (auto LIMIT 100)
jt data exec "SQL" --force         # Write SQL (INSERT/UPDATE/DELETE)
jt data create <table> col:type .. # Create new table
jt data drop <table> --force       # Drop table
jt data import <table> <file>      # Import TSV/CSV
```

### Views (filtered subsets of tables)

```bash
jt data views [table]              # List views
jt data view <id>                  # Show view details (filters, columns, sort)
jt data view-rows <id> [--json]    # Query filtered rows from a view
```

## Knowledge Bases

Knowledge bases provide structured context to agents. They can be attached to tasks or set as always-inject for a project.

**Types:** manual (text), data_table (SQL query), conversation (channel history), external

Bases are managed via the IDE UI at `/bases`, or via the REST API:
- `GET /api/bases?project=X` — list bases
- `POST /api/bases` — create base
- Task attachment: `POST /api/tasks/{id}/bases` with `{ baseId }`

## Agent Identity

```bash
am-whoami                          # Check current identity
am-agents                          # List all registered agents
am-register --name X --program claude-code --model opus
```

## Signals (IDE State Tracking)

Emit signals so the IDE can track your state:

```bash
jat-signal starting '{"agentName":"NAME","sessionId":"ID","project":"PROJECT","model":"MODEL","gitBranch":"BRANCH","gitStatus":"clean","tools":[],"uncommittedFiles":[]}'
jat-signal working '{"taskId":"ID","taskTitle":"TITLE","approach":"PLAN"}'
jat-signal needs_input '{"taskId":"ID","question":"Q","questionType":"clarification"}'
jat-signal review '{"taskId":"ID","taskTitle":"TITLE","summary":["ITEM1"]}'
```

## Search

```bash
jat-search "query"                 # Meta search (tasks, memory, files)
jat-search tasks "query" --json    # Deep task search
jat-search memory "query"          # Past session context
jat-search files "query"           # File content search (ripgrep)
```

## Commit Messages

Use task type as prefix: `task(jat-abc): Add feature X`, `bug(jat-abc): Fix issue`

## Key Workflow

```
/jat:start          → Pick task, register, emit signals
  work...           → Code, commit, test
/jat:complete       → Close task, write memory, push
```
