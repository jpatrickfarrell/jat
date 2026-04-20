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

## Route-by-Route Shortcuts

### /triage

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Next item (wraps) |
| `k` / `↑` | Previous item (wraps) |
| `Enter` | Open task detail drawer |
| `s` | Spawn agent (solve) |
| `p` | Promote to open |
| `e` | Edit task |
| `r` | Close task |
| `d` | Delete task |
| `/` | Focus search input |
| `Esc` | Cancel edit / clear focus |

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
| `Enter` / `Space` | Open task detail drawer |
| `Esc` | Clear focus |

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
| `Space` | Stage / unstage selected file (Git) |
| `S` | Stage selected file (Git) |
| `U` | Unstage selected file (Git) |
| `D` | Discard changes to selected file (Git) |
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
| `Ctrl+S` | Save workflow |
| `Ctrl+Enter` | Run workflow |
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

### Patterns Used Across Routes

**`use:listNav` action** — attach to a scroll container; self-contained, ideal when no existing keydown handler. Used in `/chores`.

**`createListNav()` composable** — imperative form; use when the page already owns a `svelte:window onkeydown`. Used in most routes.

**2D nav (inline)** — for grid layouts (`/kanban`). Two `$state` indices + `nonEmptyColumns` derived, no external composable.

**Typing guard** — `isTypingTarget()` in `listNav.ts` checks both `tagName` and `isContentEditable` to skip inputs, textareas, and rich text editors.

**`tr.jk-focused`** — table rows require `inset box-shadow` because CSS `outline` is unreliable on `<tr>` elements. Rule is in `app.css`.

**`data-nav-id` attribute** — stable key placed on each navigable item; `createListNav` defaults to querying `[data-nav-id]` on the container ref.
