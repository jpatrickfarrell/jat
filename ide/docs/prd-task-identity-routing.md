# PRD: Task Identity & Routing Refactor

**Status:** Draft  
**Author:** HighMoor  
**Date:** 2026-04-19  

---

## Problem

Task identity is split across incompatible, overlapping columns depending on which source created the task:

| Source | Fields used | Problem |
|--------|------------|---------|
| Feedback widget | `reporter_user_id`, `reporter_email`, `reporter_name`, `reporter_role` | 4 columns for one person |
| JAT task creation | `requester TEXT` | different field, same concept |
| Ingest / integrations | nothing | no identity stored |
| Alt-N drawer | `requester TEXT` (optional) | inconsistently populated |

As a result:
- `/inbox` Ctrl+Enter routing is broken for most meadow tasks (`requester` is null because the feedback ingest never sets it)
- The compose header shows "—" instead of "Reply to: Tracy Johnson (patient)"
- No concept of who approves completed work — everything auto-closes or gets lost
- Every new task source adds its own column convention

---

## Goals

1. Single, consistent identity model across all task sources
2. Tasks-fast Ctrl+Enter always knows who to route to
3. Compose header always shows "Reply to: [name] ([role])"
4. Zero fields the user has to think about in 95% of cases
5. Meadow, Flush, Headcount, Steelbridge all write the same shape

---

## Non-goals

- Replacing Supabase auth or the profiles table
- Changing how `assignee`/`previous_assignee` work (worker track is correct)
- Adding approval UI to the feedback widget

---

## Concepts

Three distinct roles, two tracks:

```
STAKEHOLDER TRACK                    WORKER TRACK
─────────────────────────────────    ──────────────────────────
creator   — who made it (immutable)  assignee      — doing it now
requester — who needs it (mutable)   previous_assignee — last worker
approver  — who signs off (mutable)
```

**creator** defaults from auth on creation, never changes.  
**requester** defaults to creator, can be changed ("on behalf of").  
**approver** defaults to requester, can be changed ("escalate to owner").  
**assignee** is set by whoever picks up the task — orthogonal to all three.

**Routing rule on close (in priority order):**
```
approver → requester → creator → nothing
```

**Self-accept rule:**
```
if previous_assignee == approver email/id → auto-accept (no review queue)
```

---

## Schema Changes

### Postgres `project_tasks`

**Remove:**
```sql
reporter_user_id  UUID
reporter_email    TEXT
reporter_name     TEXT
reporter_role     TEXT
requester         TEXT   -- was JAT routing field
```

**Add:**
```sql
creator_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL
creator       JSONB   -- { "email", "name", "role", "source" } — immutable snapshot

requester_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL
requester     JSONB   -- { "email", "name", "role", "source" } — mutable

approver_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL
approver      JSONB   -- { "email", "name", "role", "source" } — mutable
```

**JSONB shape (all three fields):**
```typescript
interface TaskActor {
  email?:  string
  name?:   string
  role?:   string   // "patient" | "practitioner" | "admin" | "agent" | "dev" | "system"
  source?: string   // "widget" | "ide" | "jat" | "slack" | "email" | "api" | "voice"
  agent?:  string   // JAT agent name if source=jat e.g. "GrandRavine"
}
```

**Migration:**
```sql
-- 1. Add new columns
ALTER TABLE project_tasks
  ADD COLUMN creator_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN creator      JSONB,
  ADD COLUMN requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN requester    JSONB,
  ADD COLUMN approver_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN approver     JSONB;

-- 2. Backfill from existing columns
UPDATE project_tasks SET
  creator_id   = reporter_user_id,
  creator      = jsonb_build_object(
    'email',  reporter_email,
    'name',   reporter_name,
    'role',   reporter_role,
    'source', 'widget'
  ),
  requester_id = reporter_user_id,
  requester    = jsonb_build_object(
    'email',  reporter_email,
    'name',   reporter_name,
    'role',   reporter_role,
    'source', 'widget'
  ),
  approver_id  = reporter_user_id,
  approver     = jsonb_build_object(
    'email',  reporter_email,
    'name',   reporter_name,
    'role',   reporter_role,
    'source', 'widget'
  )
WHERE reporter_user_id IS NOT NULL;

-- 3. Backfill tasks that only had requester TEXT (JAT-created)
UPDATE project_tasks SET
  requester = jsonb_build_object('email', old_requester_text, 'source', 'jat'),
  approver  = jsonb_build_object('email', old_requester_text, 'source', 'jat')
WHERE old_requester_text IS NOT NULL
  AND requester IS NULL;
-- Note: store old requester TEXT in a temp column before dropping

-- 4. Drop old columns
ALTER TABLE project_tasks
  DROP COLUMN reporter_user_id,
  DROP COLUMN reporter_email,
  DROP COLUMN reporter_name,
  DROP COLUMN reporter_role;
-- Note: requester TEXT is renamed/repurposed above, drop after backfill

-- 5. Indexes
CREATE INDEX idx_project_tasks_creator_id   ON project_tasks(creator_id)   WHERE creator_id IS NOT NULL;
CREATE INDEX idx_project_tasks_requester_id ON project_tasks(requester_id) WHERE requester_id IS NOT NULL;
CREATE INDEX idx_project_tasks_approver_id  ON project_tasks(approver_id)  WHERE approver_id IS NOT NULL;
CREATE INDEX idx_project_tasks_creator_email   ON project_tasks((creator->>'email'))   WHERE creator IS NOT NULL;
CREATE INDEX idx_project_tasks_requester_email ON project_tasks((requester->>'email')) WHERE requester IS NOT NULL;

-- 6. Update RLS policies
-- Old: USING (reporter_user_id = auth.uid())
-- New: USING (creator_id = auth.uid())
```

### JAT SQLite `tasks`

```sql
-- Rename requester → approver (same semantic: who routes to on close)
-- Add creator TEXT (snapshot, no UUID available in SQLite context)
ALTER TABLE tasks RENAME COLUMN requester TO approver;
ALTER TABLE tasks ADD COLUMN creator TEXT;
-- Backfill: creator = created_by or assignee at time zero (best effort)
```

**Note:** SQLite tasks use TEXT only — no UUIDs. `approver` TEXT = email or agent name.

---

## Ingest Homogenization

Every task creation path must write the same three fields. Shared helper:

```typescript
// lib/task-identity.ts
interface TaskActorInput {
  userId?: string      // auth UUID if available
  email?: string
  name?: string
  role?: string
  source: string
  agent?: string
}

function buildTaskIdentity(actor: TaskActorInput) {
  return {
    creator_id:   actor.userId ?? null,
    creator:      { email: actor.email, name: actor.name, role: actor.role, source: actor.source },
    requester_id: actor.userId ?? null,
    requester:    { email: actor.email, name: actor.name, role: actor.role, source: actor.source },
    approver_id:  actor.userId ?? null,
    approver:     { email: actor.email, name: actor.name, role: actor.role, source: actor.source },
  }
}
```

### Source mapping

| Source | creator | requester | approver | Notes |
|--------|---------|-----------|----------|-------|
| Feedback widget | auth user | = creator | = creator | auto |
| Alt-N drawer (own task) | auth user | = creator | = creator | auto |
| Alt-N drawer (on behalf of) | auth user | user-specified | = requester | "On behalf of" field |
| Voice-to-task | auth user | = creator | = creator | auto |
| Ingest (RSS/email/Slack) | system | source email if parseable | = requester | best effort |
| JAT agent creates task | agent JSONB | = creator | = creator | agent field populated |
| JST/meadow/flush tasks.newTask() | auth user | = creator | = creator | auto |
| API (external) | API key owner | body.requester if provided | = requester | |

### Files to update

| File | Change |
|------|--------|
| `ide/src/routes/api/feedback/report/+server.js` | Replace `reporter_*` writes with `buildTaskIdentity()` |
| `ide/src/routes/api/tasks/+server.js` | POST handler: use `buildTaskIdentity()`, expose `requester`/`approver` override |
| `ide/src/routes/api/tasks/voice/+server.js` | Same |
| `ide/src/routes/api/quick-command/templates/[id]/schedule/+server.js` | Same |
| `ide/src/lib/components/TaskCreationDrawer.svelte` | Add optional "On behalf of" field, wire to requester |
| JST template `src/lib/tasks/newTask.ts` | Add `buildTaskIdentity()` call |
| Meadow/Flush/Headcount/Steelbridge equivalent | Same pattern |

---

## UI Changes

### 1. InboxCompose — "Reply to" header

Current: shows `task.requester || "—"`  
New: resolve from `approver` → `requester` → `creator`, show name + role badge

```
┌──────────────────────────────────────────────────────┐
│ Reply to  Tracy Johnson  [patient]                   │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Type your reply...                               │ │
│ └──────────────────────────────────────────────────┘ │
│ [Enter: comment]  [Ctrl+Enter: send + route]         │
└──────────────────────────────────────────────────────┘
```

Resolution helper:
```typescript
function resolveRoutingTarget(task: Task): TaskActor | null {
  return task.approver ?? task.requester ?? task.creator ?? null
}
```

### 2. InboxDetail — Meta row

Current: `Assignee | Requester`  
New: `Assignee | Reply to` (resolved target, not raw field)

- Show name + role badge
- If approver ≠ requester, show both: "Requester: X · Approver: Y"
- Greyed out if null

### 3. TaskCreationDrawer — "On behalf of" field

- Hidden by default (collapsed)
- Label: "On behalf of (optional)"  
- Placeholder: "Email or name"
- When filled: sets `requester` + `approver` to that person, keeps `creator` as current user
- Show as: "Creating on behalf of Tracy Johnson"

### 4. Task detail drawer (full edit)

- Show `creator` as read-only (name + source badge, no edit)
- Show `requester` as editable (text input or user picker)
- Show `approver` as editable (text input or user picker, defaults to requester)
- Only visible in "advanced" section — not promoted

### 5. Ctrl+Enter routing logic (InboxCompose)

Current:
```javascript
// reassign to task.requester (TEXT), set status=waiting
```

New:
```javascript
const target = resolveRoutingTarget(task)
// POST comment
// PATCH task: assignee = target.email ?? target.agent, status = "waiting"
// If target has approver_id: also set assignee_id = approver_id
```

---

## Approval Flow (future, not this sprint)

Not blocking. When approver receives the task:
- They see the comment thread
- Accept button → status = `accepted`, closes loop
- Reject button → status = `open`, reassigns back to previous_assignee
- No UI changes to feedback widget needed

---

## Task Breakdown

### Epic: Task identity & routing refactor

**P1 — Schema (must do first, everything else depends on it)**
1. Write postgres migration: add creator/requester/approver columns, backfill, drop old columns, update RLS
2. Write JAT SQLite migration: rename requester→approver, add creator TEXT
3. Update postgres backend adapter to read/write new columns
4. Update JAT SQLite task library (`lib/tasks.js`) for new column names

**P2 — Ingest homogenization**
5. Extract `buildTaskIdentity()` helper (shared lib)
6. Update feedback report ingest (`/api/feedback/report`)
7. Update task creation API (`/api/tasks` POST)
8. Update voice-to-task (`/api/tasks/voice`)
9. Update JST template `newTask()` function
10. Update meadow/flush/headcount/steelbridge task creation paths

**P3 — inbox UI**
11. InboxCompose: resolve routing target, show "Reply to: [name] [role]" header
12. InboxCompose: update Ctrl+Enter to route via new fields
13. InboxDetail: update meta row to show resolved routing target

**P4 — Task creation UI**
14. TaskCreationDrawer: add "On behalf of" field (collapsed by default)
15. Task detail drawer: show creator (read-only), requester/approver (editable, advanced section)

**P5 — Cleanup**
16. Remove dead `reporter_*` references from IDE codebase
17. Update `jt` CLI to use `approver` instead of `requester`
18. Update `/jat:complete` routing logic

---

## Success Criteria

- [ ] Ctrl+Enter in inbox routes to the correct person for 100% of meadow tasks
- [ ] "Reply to" header is never "—" for tasks with a known creator
- [ ] All new tasks from any source have `creator` populated
- [ ] No `reporter_*` columns remain in production schema
- [ ] `jt close` routes correctly using new fields
