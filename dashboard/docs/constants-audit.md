# Audit: Hardcoded Constants for Centralization

**Task:** jat-oi783
**Date:** 2024-12-23
**Agent:** FreeCoast

## Summary

This audit identifies hardcoded configuration values that should be moved to `$lib/config/constants.ts` for single source of truth. Constants are categorized by priority (HIGH = should definitely move, MEDIUM = consider moving, LOW = probably fine as-is).

## Current constants.ts Structure

The existing `constants.ts` organizes values into these categories:
- `TIMEOUTS` - Millisecond values for success/error display, polling intervals
- `STATUSLINE` - UI truncation limits
- `DISPLAY_LIMITS` - Max items to display
- `AGENT_STATUS_THRESHOLDS` - Time-based agent status thresholds
- `FILTER_DEFAULTS` - Default filter selections
- `API_CONFIG` - Retry configuration
- `ANIMATIONS` - UI animation delays
- `JAT_DEFAULTS` - JAT configuration defaults (terminal, editor, model, etc.)

---

## HIGH Priority: Should Move to constants.ts

### 1. Split Panel Defaults (Repeated Pattern)

Multiple pages define identical split panel constants:

| File | Constants |
|------|-----------|
| `routes/tasks/+page.svelte:37-40` | `DEFAULT_SPLIT=60, MIN_SPLIT=20, MAX_SPLIT=80, SNAP_RESTORE_SIZE=40` |
| `routes/agents/+page.svelte:30-33` | `DEFAULT_SPLIT=40, MIN_SPLIT=20, MAX_SPLIT=80, SNAP_RESTORE_SIZE=40` |
| `routes/servers/+page.svelte:60-63` | `DEFAULT_SPLIT=50, MIN_SPLIT=20, MAX_SPLIT=80, SNAP_RESTORE_SIZE=40` |

**Recommendation:** Create `SPLIT_PANEL` config with shared MIN/MAX/SNAP and per-page defaults:
```typescript
export const SPLIT_PANEL = {
  MIN_PERCENT: 20,
  MAX_PERCENT: 80,
  SNAP_RESTORE_PERCENT: 40,
  // Page-specific defaults
  TASKS_DEFAULT: 60,
  AGENTS_DEFAULT: 40,
  SERVERS_DEFAULT: 50
} as const;
```

### 2. Cache TTL Values (Repeated)

| File | Constant | Value |
|------|----------|-------|
| `routes/api/agents/+server.js:47` | `TASK_CACHE_TTL_MS` | 5000ms |
| `routes/api/sessions/events/+server.ts:65` | `TASK_CACHE_TTL_MS` | 5000ms |
| `routes/api/work/+server.js:107` | `TASK_CACHE_TTL_MS` | 5000ms |
| `routes/api/agents/[name]/usage/+server.js:36` | `CACHE_TTL` | 60000ms |
| `routes/api/agents/sparkline/+server.js:91` | `CACHE_TTL_MS` | 300000ms |
| `routes/api/agents/sparkline/+server.js:97` | `CACHE_MAX_STALE_MS` | 1800000ms |

**Recommendation:** Create `CACHE` config:
```typescript
export const CACHE = {
  TASK_TTL_MS: 5000,
  USAGE_TTL_MS: 60 * 1000,
  SPARKLINE_TTL_MS: 5 * 60 * 1000,
  SPARKLINE_MAX_STALE_MS: 30 * 60 * 1000
} as const;
```

### 3. tmux Initialization Constants (Repeated)

| File | Constants |
|------|-----------|
| `routes/api/sessions/batch/+server.js:115-116` | `TMUX_INITIAL_WIDTH=80, TMUX_INITIAL_HEIGHT=40` |
| `routes/api/sessions/+server.js:126-127` | `TMUX_INITIAL_WIDTH=80, TMUX_INITIAL_HEIGHT=40` |
| `routes/api/work/spawn/+server.js:161-162` | `TMUX_INITIAL_WIDTH=80, TMUX_INITIAL_HEIGHT=40` |
| `routes/api/work/[sessionId]/restart/+server.js:87-88` | `TMUX_INITIAL_WIDTH=80, TMUX_INITIAL_HEIGHT=40` |
| `routes/api/work/+server.js:436-437` | `TMUX_TARGET_WIDTH=80, TMUX_TARGET_HEIGHT=40` |

**Recommendation:** Add to `JAT_DEFAULTS`:
```typescript
export const JAT_DEFAULTS = {
  // ... existing
  tmux_initial_width: 80,
  tmux_initial_height: 40
} as const;
```

### 4. Signal/Question TTL Values ✅ CENTRALIZED

**Completed:** Signal TTL constants are now centralized in `lib/config/constants.ts`:

```typescript
export const SIGNAL_TTL = {
  TRANSIENT_MS: 60 * 1000,           // 1 minute for transitional states
  USER_WAITING_MS: 30 * 60 * 1000,   // 30 minutes for states awaiting human action
  USER_WAITING_STATES: ['completed', 'review', 'needs_input'] as const
} as const;
```

**Files updated to import from constants.ts:**
- `routes/api/sessions/events/+server.ts`
- `routes/api/work/+server.js`
- `lib/components/work/SessionCard.svelte`

**Remaining (not centralized):**
| File | Constant | Value |
|------|----------|-------|
| `routes/api/sessions/[name]/custom-question/+server.ts:62` | `maxAgeMs` | 300000ms |
| `routes/api/work/[sessionId]/question/+server.js:36` | `maxAgeMs` | 300000ms |

**Note:** Question max age could be added to SIGNAL_TTL if needed.

### 5. Polling Intervals (Repeated)

| File | Constant | Value |
|------|----------|-------|
| `routes/api/sessions/events/+server.ts:55` | `POLL_INTERVAL_MS` | 1000ms |
| `routes/api/sessions/events/+server.ts:181` | `SIGNAL_DEBOUNCE_MS` | 50ms |
| `routes/api/sessions/events/+server.ts:188` | `QUESTION_DEBOUNCE_MS` | 50ms |
| `routes/triage/+page.svelte:212` | Poll interval | 2000ms |
| `routes/agents/+page.svelte:257` | Poll interval | 30000ms |
| `components/SignalDebugWidget.svelte:185` | Poll interval | 2000ms |
| `components/ServersBadge.svelte:146` | Poll interval | 5000ms |
| `components/TasksCompletedBadge.svelte:151` | Poll interval | 30000ms |

**Recommendation:** Create `POLLING` config:
```typescript
export const POLLING = {
  SSE_INTERVAL_MS: 1000,
  SIGNAL_DEBOUNCE_MS: 50,
  QUESTION_DEBOUNCE_MS: 50,
  TRIAGE_INTERVAL_MS: 2000,
  AGENTS_INTERVAL_MS: 30000,
  SERVERS_INTERVAL_MS: 5000,
  TASKS_COMPLETED_INTERVAL_MS: 30000
} as const;
```

---

## MEDIUM Priority: Consider Moving

### 6. SessionCard Layout Constants

Location: `components/work/SessionCard.svelte:1254-1266`

```typescript
const MIN_COLUMN_CHANGE = 5;
const MIN_CARD_WIDTH = 300;
const MAX_CARD_WIDTH = 1200;
const DEFAULT_CARD_WIDTH = 720;
const MIN_TMUX_HEIGHT = 20;
const MAX_TMUX_HEIGHT = 150;
```

**Recommendation:** Create `SESSION_CARD` config (add to constants.ts or create sessionCardConfig.ts):
```typescript
export const SESSION_CARD = {
  MIN_COLUMN_CHANGE: 5,
  MIN_WIDTH: 300,
  MAX_WIDTH: 1200,
  DEFAULT_WIDTH: 720,
  MIN_TMUX_HEIGHT: 20,
  MAX_TMUX_HEIGHT: 150
} as const;
```

### 7. Exec Timeout Values

| File | Value | Purpose |
|------|-------|---------|
| `routes/api/tasks/[id]/migrate/+server.js` | 30000, 10000, 5000 | bd command timeouts |
| `routes/api/tasks/next/+server.js` | 10000, 5000 | bd command timeouts |
| `routes/api/avatar/[name]/+server.js:62` | 30000 | AI avatar generation |
| `routes/api/transcribe/+server.js:77` | 120000 | Whisper transcription |
| `routes/api/projects/[name]/server/+server.js` | 5000, 2000 | Server control |

**Recommendation:** Create `EXEC_TIMEOUTS` config:
```typescript
export const EXEC_TIMEOUTS = {
  BD_COMMAND_MS: 10000,
  BD_CREATE_MS: 30000,
  BD_QUICK_MS: 5000,
  AVATAR_GENERATION_MS: 30000,
  TRANSCRIBE_MS: 120000,
  SERVER_CONTROL_MS: 5000,
  TMUX_COMMAND_MS: 2000
} as const;
```

### 8. Max Buffer Values

| File | Value | Purpose |
|------|-------|---------|
| `routes/api/sessions/[name]/output/+server.js:52` | 10MB | Session output |
| `routes/api/sessions/events/+server.ts:848` | 5MB | Event stream |
| `routes/api/work/[sessionId]/capture-log/+server.js:74` | 50MB | Log capture |
| `routes/api/work/[sessionId]/copy/+server.js:88` | 10MB | Copy buffer |
| `routes/api/work/+server.js:522` | 5MB | Work output |
| `routes/api/servers/+server.js:279-284` | 5MB | Server output |
| `routes/api/servers/start/+server.js:153` | 1MB | Server start |

**Recommendation:** Create `BUFFER_LIMITS` config:
```typescript
export const BUFFER_LIMITS = {
  SESSION_OUTPUT: 10 * 1024 * 1024,
  EVENT_STREAM: 5 * 1024 * 1024,
  LOG_CAPTURE: 50 * 1024 * 1024,
  COPY_BUFFER: 10 * 1024 * 1024,
  WORK_OUTPUT: 5 * 1024 * 1024,
  SERVER_OUTPUT: 5 * 1024 * 1024,
  SERVER_START: 1 * 1024 * 1024
} as const;
```

---

## LOW Priority: Probably Fine As-Is

### 9. Component-Specific Defaults

These are used only in their respective components and don't repeat:

| File | Constant | Purpose |
|------|----------|---------|
| `components/work/EventStack.svelte:79-80` | `maxEvents=20, pollInterval=5000` | Props with defaults |
| `components/work/TerminalActivitySparkline.svelte:38-40` | `maxBars=12, height=16, width=48` | Props with defaults |
| `components/Sparkline.svelte:134` | `height=40` | Prop default |
| `components/AgentAvatar.svelte:23` | `size=32` | Prop default |
| `components/LabelBadges.svelte:26` | `maxDisplay=3` | Prop default |
| `components/TaskDependencyGraph.svelte:52` | `height=250` | Prop default |

**Status:** These are component prop defaults - appropriate to keep in components.

### 10. UI Feedback Timeouts

| File | Value | Purpose |
|------|-------|---------|
| `components/TaskIdBadge.svelte:133` | 1500ms | Copy feedback |
| `components/work/EventStack.svelte:187,1674` | 1500ms | Copy feedback |
| `components/signals/StartingSignalCard.svelte:35` | 1500ms | Copy feedback |
| `components/config/DocsViewer.svelte:154` | 2000ms | Copy feedback |
| Various | 3000ms, 5000ms | Success/error messages |

**Status:** These match `TIMEOUTS.SUCCESS_DISPLAY_MS` and `TIMEOUTS.ERROR_DISPLAY_MS` - could use existing constants but not critical.

### 11. Existing Configs That Should Stay Separate

These configs are appropriately in their own files:

| File | Config |
|------|--------|
| `config/automationConfig.ts:22` | `DEFAULT_AUTOMATION_CONFIG` |
| `config/spawnConfig.ts:8,21` | `DEFAULT_MODEL`, `DEFAULT_AGENT_COUNT` |
| `config/statusColors.ts:388` | `DEFAULT_TYPE_VISUAL` |
| `utils/filterHelpers.ts:58,76` | `DEFAULT_FILTER_CONFIG`, `DEFAULT_FILTER_VALUES` |
| `utils/epicSwarmSettings.ts:23` | `DEFAULT_EPIC_SWARM_SETTINGS` |
| `utils/themeManager.ts:15` | `DEFAULT_THEME` |
| `utils/projectConfig.ts:95` | `DEFAULT_COLORS` |

**Status:** Keep in their respective files - they're domain-specific configs.

---

## Recommendations Summary

### Immediate Actions (HIGH Priority)

1. **Split Panel Constants** - Create `SPLIT_PANEL` in constants.ts
2. **Cache TTL Values** - Create `CACHE` in constants.ts
3. **tmux Initialization** - Add to `JAT_DEFAULTS` in constants.ts
4. **Signal TTL Values** - Create `SIGNAL` in constants.ts
5. **Polling Intervals** - Create `POLLING` in constants.ts

### Secondary Actions (MEDIUM Priority)

6. **SessionCard Layout** - Create `SESSION_CARD` in constants.ts
7. **Exec Timeouts** - Create `EXEC_TIMEOUTS` in constants.ts
8. **Buffer Limits** - Create `BUFFER_LIMITS` in constants.ts

### Estimated Impact

- **Files to modify:** ~15-20 files
- **Lines of code:** ~100-150 lines to add to constants.ts
- **Benefit:** Single source of truth, easier tuning, reduced duplication

### Migration Strategy

1. Add new constant sections to `constants.ts`
2. Update imports one file at a time
3. Test each page/API route after migration
4. Remove old inline constants after verification

---

## File Locations

**Source file:** `dashboard/src/lib/config/constants.ts`

**Files with most duplication to address:**
- `routes/api/sessions/batch/+server.js`
- `routes/api/sessions/+server.js`
- `routes/api/sessions/events/+server.ts`
- `routes/api/work/spawn/+server.js`
- `routes/api/work/+server.js`
- `routes/api/work/[sessionId]/restart/+server.js`
- `routes/tasks/+page.svelte`
- `routes/agents/+page.svelte`
- `routes/servers/+page.svelte`
