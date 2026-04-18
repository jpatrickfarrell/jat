# /tasks-fast Route Design

**Status:** Ideation  
**Task:** jat-qo8ig  
**Author:** WidePrairie

---

## The Problem

A developer with 100+ client stories needs to process them fast. Most stories don't need an agent — they need a comment ("that feature already exists, here's how to use it") and a reassignment back to the requester. The current `/tasks` route is built for deep session management. `/triage` is built for grooming status. Neither is built for the **reply-and-route** workflow.

The goal: get through 100 tasks in 20 minutes without touching the mouse.

---

## Core UX Concept

**The pipeline:** Navigate → Read → Comment → Send+Next

```
j/k to navigate → Space to focus detail → r to jump to comment
→ type reply → Ctrl+Enter to send, reassign, and advance
```

Everything else (assign, status, priority, spawn) is secondary and reachable with single keys.

---

## Layout

### Wide Screen (≥1280px): Push Panel

On extra-large screens, Space pushes the detail panel in from the right. The task list shrinks but stays visible. Navigating with j/k while the panel is open updates the detail panel inline — no re-opening required.

```
┌────────────────────────────────────────────────────────────────┐
│  TopBar (project filter, shortcuts badge)                       │
├───────────────────────┬────────────────────────────────────────┤
│  TASK LIST (38%)      │  TASK DETAIL (62%)                     │
│                       │                                        │
│  ○ jat-abc  P1  feat  │  ## Fix login button not working       │
│  ○ jat-def  P2  bug   │  Submitted by: alex · 2h ago           │
│  ▶ jat-ghi  P1  feat  │                                        │
│  ○ jat-jkl  P3  task  │  > user says the login button on       │
│  ○ jat-mno  P2  feat  │  > mobile doesn't work after update    │
│  ○ jat-pqr  P1  bug   │                                        │
│                       │  ─────────────────────────────────     │
│  [/] filter  [?] help │  💬 Comments                           │
│                       │                                        │
│                       │  alex: the button shows but nothing    │
│                       │  happens when I tap it on iPhone       │
│                       │                                        │
│                       │  ┌──────────────────────────────────┐  │
│                       │  │ This is a known iOS bug. Please  │  │
│                       │  │ update to v2.1.3 in the App      │  │
│                       │  │ Store — it's fixed there.        │  │
│                       │  └──────────────────────────────────┘  │
│                       │  [Enter: comment] [Ctrl+↵: send+route] │
│                       │                                        │
│                       │  [a]ssign [s]tatus [p]riority [o]pen  │
│                       │  [↵] spawn agent                      │
├───────────────────────┴────────────────────────────────────────┤
│  47 tasks · submitted+open · jat                [3 of 47]      │
└────────────────────────────────────────────────────────────────┘
```

**Left panel behavior:**
- Compact rows: status dot, task ID, priority badge, title (truncated)
- Focused row (j/k selected): highlighted with left accent bar
- If detail panel is open, j/k changes selected task AND updates right panel immediately
- Scrolls to keep focused row visible

**Right panel behavior:**
- Appears when Space is pressed (transitions in from right, pushes list left)
- Stays open while navigating — content updates as selection changes
- Closed with Escape (returns focus to list, list expands back)
- Shows: title, metadata row, description, comments thread, compose box, action bar

### Regular Screen (<1280px): Overlay Drawer

Same behavior as the existing TaskDetailDrawer — full-screen overlay from the right. Space/Enter opens it. Escape closes it.

---

## Keyboard Reference

### List Mode (focus in left panel)

| Key | Action |
|-----|--------|
| `j` / `↓` | Next task |
| `k` / `↑` | Previous task |
| `Space` | Open/focus detail panel |
| `Enter` | Open detail panel AND jump to comment box |
| `/` | Focus filter bar |
| `?` | Toggle shortcuts overlay |
| `g` | Go to task by ID (type search) |
| `Escape` | Close detail panel (if open) |

### Detail Mode (focus in right panel)

| Key | Action |
|-----|--------|
| `j` / `↓` | Next task (updates panel, stays in detail mode) |
| `k` / `↑` | Previous task (updates panel, stays in detail mode) |
| `←` / `Escape` | Return focus to list panel |
| `r` / `c` | Jump to comment compose box |
| `a` | Open assign picker |
| `s` | Open status picker |
| `p` | Open priority picker |
| `o` | Open full TaskDetailDrawer (for complete editing) |
| `Space` | Spawn agent for this task |
| `d` | Dismiss / close task (with confirmation) |
| `?` | Toggle shortcuts overlay |

### Comment Box Mode (typing)

| Key | Action |
|-----|--------|
| `Enter` | Send comment, stay on task |
| `Ctrl+Enter` | Send comment → reassign → next task |
| `Escape` | Abandon comment, return focus to detail |
| `Tab` | Cycle through action buttons (Send, Send+Route) |

---

## The Send+Route Action (Ctrl+Enter)

This is the killer feature. One keystroke does:

1. **Send comment** — POST to `/api/tasks/:id/comments` with comment text
2. **Reassign** — PUT to `/api/tasks/:id` with `assignee = requester` (or previous human assignee if no requester set)
3. **Update status** — If task was `submitted` or `open`, set to `waiting`
4. **Advance** — Move focus to next task automatically

**Reassignment logic:**
- If task has `requester` set → assign to requester
- If task has a prior human assignee (not an agent name) → assign to that person
- If neither → show a quick assign picker before sending

**Visual feedback:**
- Comment row slides in immediately (optimistic update)
- Task row in left panel gets a subtle green flash then fades to normal
- Cursor moves to next task with a smooth scroll

**Edge cases:**
- Last task in list → wrap to first OR show "All done" empty state
- Network error → comment not sent, show error toast, user can retry
- Empty comment box → Ctrl+Enter just routes (no comment) with a confirmation

---

## Filter Bar

Pressing `/` focuses an inline filter bar at the top of the list panel.

**Supported filters:**
- Status: `submitted`, `open`, `in_progress`, `waiting` (default: `submitted,open`)
- Priority: `P0`–`P4`
- Project: project name
- Type: `bug`, `feature`, `task`, etc.
- Assignee: username or `@me`
- Free text: searches title + description

**URL params:** All filters are reflected in URL for shareability (`?status=submitted&project=jat&priority=1`)

**Default view:** All `submitted` tasks across all projects, sorted by priority then created_at

---

## Detail Panel Sections

1. **Header** — Title (editable inline on click), task ID badge, issue type, priority badge
2. **Meta row** — Status, created, updated, assignee, requester
3. **Description** — Markdown rendered, collapsible if long
4. **Comments thread** — Existing `CommentsThread.svelte`, auto-scrolled to bottom
5. **Compose box** — Autogrown textarea, placeholder "Reply... (Enter to send, Ctrl+↵ to send+route)"
6. **Action bar** — Quick action buttons: assign, status, priority, open-full, spawn, dismiss

The detail panel should feel like a lightweight email client panel, not a full task editor.

---

## Implementation Notes

### Reuse Existing Components

- `CommentsThread.svelte` — drop in directly
- `TaskDetailDrawer.svelte` — used for the `o` (open full) action and for small screen fallback
- `SearchDropdown.svelte` — reuse for assign/status/priority pickers
- `KeyboardShortcutsOverlay.svelte` — from jat-wqoap.1 foundation task
- `listNav` action — from jat-wqoap.1 foundation task

### New Components Needed

- `TaskFastList.svelte` — compact task list with j/k focus management
- `TaskFastDetail.svelte` — the right panel: header, meta, description, comments, compose, actions
- `TaskFastCompose.svelte` — the comment compose box with Send and Send+Route buttons

### Route File

`ide/src/routes/tasks-fast/+page.svelte`

The page is self-contained (no child routes needed). Data is fetched client-side on mount with polling.

### State Architecture

```typescript
// Core state
let tasks = $state<Task[]>([])
let selectedIdx = $state(0)
let selectedTask = $derived(filteredTasks[selectedIdx] ?? null)
let panelOpen = $state(false)  // wide screen: panel visible
let focusZone = $state<'list' | 'detail' | 'compose'>('list')

// Filter state
let filterStatus = $state('submitted,open')
let filterProject = $state('all')
let filterSearch = $state('')

// Comment state
let commentText = $state('')
let commentSending = $state(false)
```

### Panel Animation

On wide screens, the split uses CSS `grid-template-columns` with a transition:

```css
.layout {
  display: grid;
  transition: grid-template-columns 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.layout.list-only {
  grid-template-columns: 1fr 0px;  /* list only */
}
.layout.split {
  grid-template-columns: 38fr 62fr;  /* list + detail */
}
```

Detail panel uses `overflow: hidden` so it clips cleanly during transition.

### Dependency on jat-wqoap.1

This route should wait for the `listNav` action and `KeyboardShortcutsOverlay` from the foundation task. The j/k logic should use that shared action, not reinvent keyboard handling.

---

## Comparison with Existing Routes

| Route | Primary Use Case | Primary Action |
|-------|-----------------|----------------|
| `/tasks` | Session management + project overview | Spawn/monitor agents |
| `/triage` | Groom incoming stories | Promote/reject/edit tasks |
| `/tasks-fast` | Process 100+ tasks quickly | Comment + reassign + advance |

`/tasks-fast` is NOT a replacement for `/triage`. `/triage` is for grooming (deciding what to build). `/tasks-fast` is for responding (telling clients about existing solutions, routing tasks to the right person, leaving instructions).

---

## Proposed Sidebar Nav Entry

- Icon: `⚡` or `⟵ᐅ` (fast-forward style)
- Label: "Quick Review" or "Inbox"
- URL: `/tasks-fast`
- Badge: count of `submitted` tasks (the inbox)
- Tooltip: "Keyboard-driven task queue"

Consider renaming to `/inbox` if it becomes the primary way to handle submitted stories from clients.

---

## Success Criteria

A developer can:
1. Land on the route and see their submitted task queue
2. Navigate to a task with j/k and read the description in 5 seconds
3. Leave a reply and route it to the requester with Ctrl+Enter
4. Process 10 tasks in under 3 minutes without touching the mouse

---

## Implementation Task Tree (Proposed)

After this design is approved, break into:

1. `[foundation]` Route scaffold + layout + data fetch (no keyboard nav yet)
2. `[keyboard]` j/k navigation with jat-wqoap.1 listNav action
3. `[detail]` Detail panel with comments thread + compose box
4. `[send-route]` Send+Route (Ctrl+Enter) action with reassign logic
5. `[filters]` Filter bar + URL params
6. `[actions]` Quick action bar (assign, status, priority, open-full, spawn)
7. `[polish]` Panel slide animation, status bar, keyboard overlay

Each task is ~2-4 hours of focused work.
