# Keyboard Navigation — Master Reference

Complete shortcut reference for every route. All routes support `?` to open the shortcuts overlay and `Esc` to dismiss it.

---

## Universal Shortcuts

Available on every page, regardless of context.

| Shortcut | Action |
|----------|--------|
| `?` | Open / close keyboard shortcuts overlay |
| `Esc` | Clear nav focus / dismiss overlays |

---

## Universal Peek (Space-to-Glance)

**Mental model:** `Space` = glance, `Enter` = commit.

On any list with j/k navigation, `Space` opens a 40vw right-side **peek drawer** previewing the focused item. j/k continues to navigate underneath; the drawer content swaps in place. Second `Space` (or `Esc`) closes it.

| Shortcut | Action |
|----------|--------|
| `Space` | Open peek drawer for focused item — or close if already on same item |
| `Space` (different item) | Swap drawer content to the new item (no flicker) |
| `j` / `k` while open | Move focus; drawer follows in place |
| `Enter` while open | Promote: close peek + open full detail drawer in one motion |
| `Esc` while open | Close peek without promoting |

**What gets peeked** is determined by the navId pattern:

| navId pattern | Peek content |
|---|---|
| `{project}-{hash}` (lowercase) — e.g. `jat-abc`, `linux-nfcyr.3` | Lightweight task preview (TaskPeekContent) |
| File path (contains `/` or starts with `/` or `./`) | File preview, ~80 lines (FilePeekContent) |
| Anything else | No peek — Space no-ops on that route |

**Peek is universal except `/servers`**, which keeps `Space` for start/stop toggle (server cards use `data-session-name` instead of `data-nav-id`, so they're naturally outside the peek system).

**Opt-out mechanism:** any container with `data-peek="false"` (or an ancestor that has it) is excluded from peek. Used by the UserProfile dropdown menu and `/kanban` session cards (where the navId is a session name, not a task).

**Adding a new peek content type:** register in `+layout.svelte` onMount with `registerPeek({ id, label, match, component, propsForId })`. Order matters — first match wins.

---

## Universal List Motions (Vim)

These work on every route that uses `createListNav` / `use:listNav` — i.e. every route with j/k navigation. They're layered on top of the plain `j` / `k` / Enter / Esc behaviour.

| Shortcut | Action |
|----------|--------|
| `gg` | Jump to the first item |
| `G` | Jump to the last item |
| `{n}j` / `{n}k` | Move `n` items down / up (count-prefix buffer, 1.5s timeout) |
| `{n}G` / `{n}gg` | Jump to 1-indexed line `n` (clamped to list length) |
| `Ctrl+D` / `Ctrl+U` | Move roughly half a viewport's worth of items down / up |
| `zz` | Scroll the focused item to the centre of its viewport |

A half-typed motion (`5`, `g`, `z`) is cancelled by:

- pressing Esc,
- pressing any key that isn't the motion's completion, or
- waiting 1.5 seconds.

`0` on its own is pass-through (routes may bind it for their own shortcuts); it only becomes part of a count once another digit has already started one, e.g. `10j`.

---

## Universal Bulk Selection

Routes that have j/k navigation over task lists support a consistent bulk selection pattern layered on top of single-item navigation. Currently implemented on `/inbox`, `/triage`, and `/open-tasks`.

| Shortcut | Action |
|----------|--------|
| `x` | Toggle select the focused task |
| `Shift+J` | Select focused task + move down (hold to sweep) |
| `Shift+K` | Select focused task + move up |
| `*` | Toggle select / deselect all visible tasks |
| `e` _(with selection)_ | Add selected tasks to an epic |
| `Esc` _(with selection)_ | Clear selection (before clearing nav focus) |

**Mouse:** click the status indicator (inbox) or left accent bar (triage) to toggle individual items.

**Visual cues:** selected items get a blue tint row + a filled blue ✓ indicator. When any item is selected, a floating `BulkActionBar` appears at the bottom-right with the available actions and an item count.

**Adding to a new route:**
1. Add `let selectedIds = $state<Set<string>>(new Set())` alongside existing nav state.
2. Add `x`, `J`, `K`, `*`, `e`/`Esc` (with selection guard) cases to the page's keydown handler.
3. Wire each list item's click-indicator with `e.stopPropagation()` + `toggleSelect(task.id)`.
4. Add `<BulkActionBar>` and an epic-picker modal (see `/inbox` or `/triage` for the canonical copy).
5. The route needs j/k navigation first — `x` toggles `filteredTasks[selectedIdx]`.

---

## Route-by-Route Shortcuts

### /inbox

Split-panel layout: left task list, right detail panel.

#### List zone

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next task |
| `k` / `↑` | Focus previous task |
| `Space` | Peek focused task (universal — see top of doc) |
| `Enter` | Open detail panel |
| `/` | Focus filter input |
| `u` | Undo last dismiss (while toast visible) |
| `x` | Toggle select focused task |
| `Shift+J` / `Shift+K` | Select + move down / up |
| `*` | Select / deselect all visible |
| `e` _(with selection)_ | Add selected to epic |
| `Esc` _(with selection)_ | Clear selection |
| `Esc` | Close panel / exit filter |

#### Detail zone

| Shortcut | Action |
|----------|--------|
| `r` / `c` | Jump to compose box |
| `a` | Open assign picker |
| `s` | Spawn agent on this task |
| `S` | Open status picker |
| `p` | Open priority picker |
| `t` | Open type picker |
| `e` | Open epic picker |
| `m` | Open milestone picker |
| `o` | Open full task detail drawer |
| `d` | Dismiss / close task |
| `j` / `k` | Move to next / previous task |
| `Esc` | Close detail panel |

> **Note:** Detail-zone `Space` (formerly spawn agent) was moved to lowercase `s` in jat-pgryk so `Space` is universally reserved for the peek drawer. Status picker moved from `s` to uppercase `S`.

---

### /triage

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Next item (wraps) |
| `k` / `↑` | Previous item (wraps) |
| `Enter` | Open task detail drawer |
| `x` | Toggle select focused task |
| `Shift+J` / `Shift+K` | Select + move down / up |
| `*` | Select / deselect all visible |
| `s` | Spawn agent (solve) / bulk: set status open |
| `p` | Promote to open |
| `e` | Edit task |
| `r` | Close task |
| `c` | Bulk: close selected |
| `e` | Bulk: assign to epic |
| `d` | Delete task / bulk: delete selected |
| `/` | Focus search input |
| `Esc` | Clear selection / cancel edit / clear focus |

---

### /open-tasks

Power task list with dual-mode single-key shortcuts: the same key opens the **filter** dropdown when nothing is selected, and opens the **bulk action** dropdown when tasks are selected.

#### Filter shortcuts (no selection)

| Shortcut | Action |
|----------|--------|
| `p` | Open Priority filter |
| `s` | Open Status filter |
| `a` | Open Assignee filter |
| `m` | Open Milestone filter |
| `t` | Open Type filter |
| `l` | Open Label filter |
| `/` or `f` | Focus text search input |
| `?` | Open shortcuts overlay |

#### Bulk actions (with selection)

| Shortcut | Action |
|----------|--------|
| `p` | Set priority on selected tasks |
| `s` | Set status on selected tasks |
| `a` | Assign selected tasks |
| `m` | Set milestone on selected tasks |
| `t` | Set type on selected tasks |
| `e` | Assign selected tasks to an epic |
| `c` | Close selected tasks (with undo toast) |
| `h` | Hide selected tasks (set dev status) |
| `P` | Promote selected tasks (set open status) |
| `Esc` | Clear selection / close bulk dropdowns |

**Selection:** checkbox column (click), shift-click range, `x` on focused row, select-all header checkbox.

---

### /chores

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next chore |
| `k` / `↑` | Focus previous chore |
| `Enter` | Open chore detail |
| `Esc` | Clear focus |

---

### /automation

Route URL is `/automation` (singular).

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next rule |
| `k` / `↑` | Focus previous rule |
| `Enter` | Edit focused rule |
| `n` | Create new rule |
| `Esc` | Clear focus |

---

### /integrations

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next installed source |
| `k` / `↑` | Focus previous installed source |
| `Enter` | Expand / collapse focused source |
| `Tab` | Switch between Installed / Add Integration tabs |
| `Esc` | Clear focus |

---

### /servers

Two shortcut contexts: server session cards (top panel) and project table rows (hover-activated).

#### Server Cards

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next server card |
| `k` / `↑` | Focus previous server card |
| `Enter` | Scroll focused card into view |
| `Space` | Toggle start / stop for focused card |
| `Esc` | Clear focus |

> **Note:** `/servers` is the **single carve-out** from the universal Space=peek convention — `Space` here keeps its play/pause meaning. Server cards use `data-session-name` and `server-card-focused` rather than the standard `data-nav-id`/`jk-focused`, so they're naturally outside the peek system.

#### Project Table Rows (hover)

| Shortcut | Action |
|----------|--------|
| `R` | Restart / start server |
| `S` | Stop server |
| `O` | Open `http://localhost:{port}` |

---

### /kanban

2D navigation: j/k move within a column, arrow keys move between columns.

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next card in column |
| `k` / `↑` | Focus previous card in column |
| `→` / `l` | Move to next non-empty column |
| `←` / `h` | Move to previous non-empty column |
| `Enter` | Open task detail drawer |
| `Esc` | Clear focus |

> **Note:** `/kanban` cards use session names (e.g. `jat-LoneTumbleweed`) as their navId, which aren't peekable as tasks. The board opts out of peek via `data-peek="false"` on each card wrapper, so `Space` is a no-op here. If a SessionPeekContent is added later, this can be enabled.

---

### /config

Tab cycling covers all 17 config tabs. j/k navigate items within list-bearing tabs (ClaudeMd, Docs, Tools, Projects, Commands, Templates). Non-list tabs (Hooks, Shortcuts, Autopilot, etc.) — j/k are inert.

| Shortcut | Action |
|----------|--------|
| `Tab` | Next config tab |
| `Shift+Tab` | Previous config tab |
| `j` / `↓` | Focus next item (list tabs only) |
| `k` / `↑` | Focus previous item (list tabs only) |
| `Enter` | Open / select focused item |
| `Esc` | Clear focus |

---

### /clients

Two-level navigation: contract list → milestone list.

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next contract (or milestone when drilling) |
| `k` / `↑` | Focus previous contract (or milestone when drilling) |
| `Enter` | Expand contract; second Enter focuses first milestone |
| `→` | Expand contract or drill into milestones |
| `←` | Collapse contract or return to contract list |
| `Esc` | Clear focus (or return to contract list from milestones) |

---

### /search

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next result |
| `k` / `↑` | Focus previous result |
| `Enter` | Open selected result |
| `Tab` / `←` `→` | Switch tabs (Routes / Tasks / Memory / Files / Content) |
| `/` | Focus search input |
| `Esc` | Clear selection |

---

### /dash

j/k navigate items within the focused project section (sessions + task rows as a flat list).

| Shortcut | Action |
|----------|--------|
| `Tab` / `Shift+Tab` | Next / previous project section |
| `j` / `↓` | Focus next session or task row |
| `k` / `↑` | Focus previous session or task row |
| `Enter` | Jump to session / open task detail |
| `1` | Toggle sessions section |
| `2` | Toggle tasks section |
| `Esc` | Clear item focus / exit keyboard mode |

---

### /memory

Two tabs: Browse and Search.

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next item (file or search result) |
| `k` / `↑` | Focus previous item |
| `Enter` | Open file preview |
| `Tab` | Switch between Search / Browse tabs |
| `/` | Focus search input (switches to Search tab first) |
| `Esc` | Clear focus |

---

### /source

Three panels: Git, Supabase, Cloudflare.

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next file / migration |
| `k` / `↑` | Focus previous file / migration |
| `Enter` | Load diff (Git) / preview migration SQL (Supabase) |
| `Tab` | Cycle tabs: Git → Supabase → Cloudflare |
| `Shift+Tab` | Cycle tabs in reverse |
| `Alt+G` | Switch to Git tab |
| `Alt+U` | Switch to Supabase tab |
| `Alt+C` | Switch to Cloudflare tab |
| `S` | Stage selected file (Git) |
| `U` | Unstage selected file (Git) |
| `D` | Discard changes to selected file (Git) |

> **Note:** The redundant `Space` alias for stage/unstage was removed in jat-pgryk to free `Space` for the universal peek drawer. Use uppercase `S` to stage and `U` to unstage.
| `Ctrl+\` | Toggle left panel |
| `Esc` | Clear selection |

---

### /files

Three shortcut contexts: tree navigation, editor tabs, and file operations.

#### Tree Navigation

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Move focus down in tree |
| `k` / `↑` | Move focus up in tree |
| `→` | Expand folder / open file |
| `←` | Collapse folder / go to parent |
| `Enter` | Toggle folder or open file |
| `Esc` | Clear tree focus |

#### Editor

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Alt+W` | Close current tab |
| `Alt+[` | Previous tab |
| `Alt+]` | Next tab |
| `Alt+P` | Quick file finder |
| `Ctrl+K` | Search in files |
| `Ctrl+\` | Toggle file tree |

#### File Operations (tree focused)

| Shortcut | Action |
|----------|--------|
| `F2` / `R` | Rename selected file |
| `D` / `Del` | Delete selected file |
| `F` | New file in current folder |
| `O` | New folder in current folder |
| `C` | Copy path to clipboard |
| `Ctrl+Z` | Undo last file operation |

---

### /data

Three shortcut contexts: row navigation, table switching, and cell editing.

#### Row Navigation

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Move to next row |
| `k` / `↑` | Move to previous row |
| `←` / `→` | Move between columns |
| `Enter` | Edit the focused cell |
| `Esc` | Exit cell editing / clear selection |

#### Table Switching

| Shortcut | Action |
|----------|--------|
| `Tab` | Switch to next project table |
| `Shift+Tab` | Switch to previous project table |
| `Ctrl+\` | Toggle table list panel |

**Note:** Tab / Shift+Tab only activates when no cell is selected. Press `Esc` first to deselect, then Tab to switch tables.

#### Cell Editing

| Shortcut | Action |
|----------|--------|
| Type | Overwrite focused cell |
| `Space` | Edit cell (or toggle boolean) |
| `=` | Open formula editor (formula columns) |
| `Ctrl+Enter` | Add a new row |
| `Ctrl+C` | Copy cell value |
| `Ctrl+Z` | Undo last change |

---

### /bases

Left panel: bases list. Right panel: canvas blocks.

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next base |
| `k` / `↑` | Focus previous base |
| `Enter` | Open base in canvas |
| `Tab` | Cycle canvas blocks (right panel) |
| `Shift+Tab` | Cycle canvas blocks backwards |
| `Esc` | Return focus to bases list |
| `n` | New base |
| `Ctrl+\` | Toggle bases panel |

---

### /workflows

Two contexts: workflow list and workflow editor.

#### Workflow List

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Focus next workflow |
| `k` / `↑` | Focus previous workflow |
| `Enter` | Open focused workflow |
| `n` | Create new workflow |

#### Workflow Editor

| Shortcut | Action |
|----------|--------|
| `Tab` | Select next node |
| `Shift+Tab` | Select previous node |
| `Esc` | Back to workflow list |
| `Del` / `⌫` | Delete selected node(s) or edge(s) |
| `Ctrl+A` | Select all nodes |
| `Ctrl+C` | Copy selected nodes (and edges between them) |
| `Ctrl+V` | Paste copied nodes (offset +40px, new IDs) |
| `Ctrl+D` | Duplicate selected node(s) (offset +30px) |
| `Ctrl+S` | Save workflow |
| `Ctrl+Enter` | Run workflow |
| `Ctrl+=` / `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |

---

## Global App Shortcuts

These work from any page (unless typing in an input).

| Shortcut | Action |
|----------|--------|
| `Alt+N` | Create new task |
| `Alt+E` | Open Epic Swarm modal |
| `Alt+S` | Open Start Next dropdown |
| `Alt+Shift+P` | Add new project |

---

## Session Shortcuts

Require a hovered session on the /sessions (Work) page.

| Shortcut | Action |
|----------|--------|
| `Alt+A` | Attach terminal |
| `Alt+K` | Kill session |
| `Alt+I` | Interrupt session (Ctrl+C) |
| `Alt+P` | Pause session |
| `Alt+R` | Restart session |
| `Alt+Shift+C` | Copy session contents |
| `Alt+1`–`Alt+9` | Jump to session by position |

---

## Implementation Details

### Core Primitives

| File | Purpose |
|------|---------|
| `ide/src/lib/actions/listNav.ts` | `listNav` Svelte action + `createListNav()` composable |
| `ide/src/lib/components/KeyboardShortcutsOverlay.svelte` | `?`-toggled shortcuts modal |
| `ide/src/app.css` (line ~1279) | `.jk-focused` baseline rule (outline + background tint) |

### Bulk Selection Pattern

The canonical implementation lives in `/inbox` (`src/routes/inbox/+page.svelte`). `/triage` is a second reference implementation. Both use the same keyboard shortcuts documented in the "Universal Bulk Selection" section above.

**`/open-tasks`** — uses checkbox-based selection (click, shift-click range, select-all header) with j/k navigation. Dual-mode single keys open filter dropdowns when nothing is selected and bulk action dropdowns when tasks are selected. See route section above for full shortcut table.

---

### Patterns Used Across Routes

**`use:listNav` action** — attach to a scroll container; self-contained, ideal when no existing keydown handler. Used in `/chores`.

**`createListNav()` composable** — imperative form; use when the page already owns a `svelte:window onkeydown`. Used in most routes.

**2D nav (inline)** — for grid layouts (`/kanban`). Two `$state` indices + `nonEmptyColumns` derived, no external composable.

**Typing guard** — `isTypingTarget()` in `listNav.ts` checks both `tagName` and `isContentEditable` to skip inputs, textareas, and rich text editors.

**`tr.jk-focused`** — table rows require `inset box-shadow` because CSS `outline` is unreliable on `<tr>` elements. Rule is in `app.css`.

**`data-nav-id` attribute** — stable key placed on each navigable item; `createListNav` defaults to querying `[data-nav-id]` on the container ref.

**Vim motions are baked into `listNav`** — `gg`, `G`, `{count}` prefix, `Ctrl+D` / `Ctrl+U`, and `zz` are implemented inside `createListNav` / `use:listNav` and surface automatically on every route that uses it. No per-route wiring is required. The `KeyboardShortcutsOverlay` renders them as a "List motions (Vim)" section by default; routes that render the overlay without a list can pass `showListMotions={false}` to hide it.
