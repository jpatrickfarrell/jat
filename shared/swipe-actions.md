## Swipe-to-Reveal Actions (Mobile)

iOS-style swipe-to-reveal action system for mobile session cards on `/tasks` (TasksActive).

### Architecture

Two independent action systems serve different UX contexts:

| System | Location | Context | Actions Available |
|--------|----------|---------|-------------------|
| **Swipe actions** | `swipeActions.ts` | Mobile swipe gestures (2 slots: left + right) | 6 universal actions |
| **Hover tray** | `statusColors.ts` → `SESSION_STATE_ACTIONS` | Desktop dropdown via `StatusActionBadge` | 16+ state-dependent actions |

Both systems share the same handler logic in `TasksActive.svelte` — swipe calls `executeSwipeAction()`, hover tray calls the `onAction` callback. The implementations are equivalent for all shared action IDs.

### Swipe Action Catalog

**File:** `ide/src/lib/config/swipeActions.ts`

6 universal actions assignable to left/right swipe:

| ID | Label | Variant | Default Slot |
|----|-------|---------|--------------|
| `complete` | Complete | success | right swipe |
| `attach` | Attach | info | — |
| `view-task` | Details | default | left swipe |
| `pause` | Pause | warning | — |
| `kill` | Kill | error | — |
| `interrupt` | Interrupt | warning | — |

**Configuration:** Users assign actions in Settings > Shortcuts tab. Persisted to `localStorage` key `mobile-swipe-actions`.

### Hover Tray Actions (SESSION_STATE_ACTIONS)

**File:** `ide/src/lib/config/statusColors.ts`

State-dependent action lists — each session state shows different actions:

| State | Actions |
|-------|---------|
| `working` | complete-kill, close-kill, pause, interrupt, attach, kill |
| `ready-for-review` | complete, complete-kill, close-kill, pause, attach, kill |
| `needs-input` | attach, escape, pause, kill |
| `completing` | attach, pause, kill |
| `completed` | cleanup, view-task, attach, pause, kill |
| `starting` | attach, interrupt, pause, kill |
| `paused` | resume, view-task, kill, close-task |
| `orphaned` | restart, view-task, unassign, kill, close-task |
| `idle` | cleanup, attach, pause, kill |
| `planning` | convert-to-tasks, attach, interrupt, kill |
| `polishing` | kill (as "Done Polishing"), attach, interrupt, pause |
| `auto-proceeding` | attach, pause, kill |
| `compacting` | attach, pause, kill |
| `ready` | start, pause, kill |

### Action Implementation Parity

All 6 swipe actions have equivalent implementations in both handlers:

| Action | executeSwipeAction | onAction | Behavior |
|--------|-------------------|----------|----------|
| `complete` | Yes | Yes | Signal completing → send `/jat:complete` |
| `attach` | Yes | Yes | `handleAttachSession()` |
| `view-task` | Yes | Yes | `onViewTask(taskId)` |
| `pause` | Yes | Yes | Optimistic state → pause API → kill session |
| `kill` | Yes | Yes | `handleKillSession()` |
| `interrupt` | Yes | Yes | Send `ctrl-c` via input API |

### Actions Only in Hover Tray

These actions are state-specific and not available as swipe actions:

| Action | States | Why not in swipe |
|--------|--------|-----------------|
| `complete-kill` | working, review | Compound action (complete + auto-kill) |
| `close-kill` | working, review | Destructive shortcut (skip completion) |
| `escape` | needs-input | Only relevant when agent is prompting |
| `resume` | paused | Only relevant for paused sessions |
| `restart` | orphaned | Only relevant for crashed sessions |
| `unassign` | orphaned | Rare administrative action |
| `close-task` | paused, orphaned | Rare cleanup action |
| `start` | ready | Only relevant for ready-state sessions |
| `cleanup` | completed, idle | Alias for kill in these states |
| `convert-to-tasks` | planning | Only relevant for planning sessions |

### Adding a New Swipe Action

1. Add entry to `SWIPE_ACTION_CATALOG` in `swipeActions.ts` (id, label, icon, color, variant)
2. Add handler case in `executeSwipeAction()` in `TasksActive.svelte`
3. Ensure the same action ID + handler exists in the `onAction` callback for `StatusActionBadge`

### Files

| File | Purpose |
|------|---------|
| `ide/src/lib/config/swipeActions.ts` | Swipe action catalog, config persistence |
| `ide/src/lib/config/statusColors.ts` | `SESSION_STATE_ACTIONS`, `getSessionStateActions()` |
| `ide/src/lib/components/sessions/TasksActive.svelte` | `executeSwipeAction()` + `onAction` handlers |
| `ide/src/lib/components/config/SwipeActionsEditor.svelte` | Settings UI for swipe assignment |
| `ide/src/lib/components/work/StatusActionBadge.svelte` | Hover tray dropdown component |
