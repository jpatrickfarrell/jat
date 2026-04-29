/**
 * Voice Vocabulary Data — pure, no Svelte runtime dependencies.
 *
 * Exports the static vocabulary entries (NAV + ROUTE) and a helper to build
 * the global-shortcut entries given a shortcut-id resolver. This module is
 * importable from server-side endpoints (e.g. /api/tasks/voice) where the
 * browser-only $derived store in voiceVocabulary.svelte.ts cannot run.
 *
 * The reactive client store layers user shortcut overrides on top of these
 * defaults via getGlobalShortcut(); the server uses the static defaults.
 */

/**
 * Factory-default keystrokes for each global action ID. Mirrors
 * DEFAULT_GLOBAL_SHORTCUTS in keyboardShortcuts.svelte.ts. Inlined here so
 * server-side imports of this module don't pull in the Svelte runes runtime.
 * Keep the two in sync.
 */
const DEFAULT_GLOBAL_SHORTCUT_BY_ID: Record<string, string> = {
	'new-task': 'Alt+N',
	'epic-swarm': 'Alt+E',
	'start-next': 'Alt+S',
	'add-project': 'Alt+Shift+P',
	'toggle-terminal': 'Ctrl+`',
	'global-search': 'Ctrl+K',
	'push-to-talk': 'Ctrl+Space',
	'attach-terminal': 'Alt+A',
	'kill-session': 'Alt+K',
	'interrupt-session': 'Alt+I',
	'pause-session': 'Alt+P',
	'restart-session': 'Alt+R',
	'copy-session': 'Alt+Shift+C'
};

export interface VoiceVocabularyEntry {
	phrase: string;
	aliases: string[];
	shortcut: string;
	scope: 'any' | string;
	action?: string;
	category: 'navigation' | 'global' | 'session' | 'route';
}

// =============================================================================
// UNIVERSAL NAVIGATION (listNav — j/k/Enter/Escape/?)
// =============================================================================

export const NAV_ENTRIES: VoiceVocabularyEntry[] = [
	{
		phrase: 'next item',
		aliases: ['next', 'down', 'below', 'move down', 'go down', 'next row', 'next card'],
		shortcut: 'j',
		scope: 'any',
		category: 'navigation'
	},
	{
		phrase: 'previous item',
		aliases: ['previous', 'back', 'up', 'above', 'move up', 'go up', 'prev', 'previous row', 'previous card'],
		shortcut: 'k',
		scope: 'any',
		category: 'navigation'
	},
	{
		phrase: 'select',
		aliases: ['open', 'enter', 'confirm', 'choose', 'pick', 'view details', 'open item'],
		shortcut: 'Enter',
		scope: 'any',
		category: 'navigation'
	},
	{
		phrase: 'cancel',
		aliases: ['escape', 'close', 'dismiss', 'clear focus', 'back out', 'go back', 'never mind'],
		shortcut: 'Escape',
		scope: 'any',
		category: 'navigation'
	},
	{
		phrase: 'show shortcuts',
		aliases: ['help', 'keyboard shortcuts', 'what can i say', 'show commands', 'shortcuts overlay'],
		shortcut: '?',
		scope: 'any',
		category: 'navigation'
	}
];

// =============================================================================
// ROUTE-SCOPED SHORTCUTS
// =============================================================================

export const ROUTE_ENTRIES: VoiceVocabularyEntry[] = [
	// ── /triage ────────────────────────────────────────────────────────────
	{ phrase: 'spawn agent', aliases: ['spawn', 'solve task', 'start agent', 'launch agent', 'run agent', 'assign agent'], shortcut: 's', scope: '/triage', category: 'route' },
	{ phrase: 'promote task', aliases: ['promote', 'promote to open', 'open task', 'move to open'], shortcut: 'p', scope: '/triage', category: 'route' },
	{ phrase: 'edit task', aliases: ['edit', 'modify', 'change task', 'update task'], shortcut: 'e', scope: '/triage', category: 'route' },
	{ phrase: 'close task', aliases: ['close', 'resolve', 'mark done', 'reject', 'dismiss task'], shortcut: 'r', scope: '/triage', category: 'route' },
	{ phrase: 'delete task', aliases: ['delete', 'remove', 'trash', 'discard'], shortcut: 'd', scope: '/triage', category: 'route' },
	{ phrase: 'focus search', aliases: ['search', 'find', 'filter', 'search tasks', 'type to search'], shortcut: '/', scope: '/triage', category: 'route' },

	// ── /chores ────────────────────────────────────────────────────────────
	{ phrase: 'open chore', aliases: ['view chore', 'chore detail', 'open detail'], shortcut: 'Enter', scope: '/chores', category: 'route' },

	// ── /automation ────────────────────────────────────────────────────────
	{ phrase: 'new rule', aliases: ['create rule', 'add rule', 'new automation rule'], shortcut: 'n', scope: '/automation', category: 'route' },
	{ phrase: 'toggle rule', aliases: ['enable rule', 'disable rule', 'toggle', 'activate rule', 'deactivate rule'], shortcut: 'Space', scope: '/automation', category: 'route' },
	{ phrase: 'move rule down', aliases: ['lower priority', 'demote rule', 'push rule down'], shortcut: 'Shift+J', scope: '/automation', category: 'route' },
	{ phrase: 'move rule up', aliases: ['raise priority', 'promote rule', 'push rule up'], shortcut: 'Shift+K', scope: '/automation', category: 'route' },

	// ── /kanban ────────────────────────────────────────────────────────────
	{ phrase: 'next column', aliases: ['right column', 'move right', 'next lane', 'go right'], shortcut: 'ArrowRight', scope: '/kanban', category: 'route' },
	{ phrase: 'previous column', aliases: ['left column', 'move left', 'previous lane', 'go left', 'back column'], shortcut: 'ArrowLeft', scope: '/kanban', category: 'route' },

	// ── /integrations ──────────────────────────────────────────────────────
	{ phrase: 'switch integration tab', aliases: ['installed tab', 'add integration tab', 'toggle tab'], shortcut: 'Tab', scope: '/integrations', category: 'route' },

	// ── /servers ───────────────────────────────────────────────────────────
	{ phrase: 'toggle server', aliases: ['start server', 'stop server', 'toggle start stop'], shortcut: 'Space', scope: '/servers', category: 'route' },
	{ phrase: 'restart server', aliases: ['restart', 'reboot server', 'start server'], shortcut: 'R', scope: '/servers', category: 'route' },
	{ phrase: 'stop server', aliases: ['stop', 'halt server', 'kill server process'], shortcut: 'S', scope: '/servers', category: 'route' },
	{ phrase: 'open server in browser', aliases: ['open browser', 'open url', 'launch browser', 'view server'], shortcut: 'O', scope: '/servers', category: 'route' },

	// ── /memory ────────────────────────────────────────────────────────────
	{ phrase: 'switch memory tab', aliases: ['search tab', 'browse tab', 'toggle memory tab'], shortcut: 'Tab', scope: '/memory', category: 'route' },
	{ phrase: 'search memory', aliases: ['find memory', 'memory search', 'filter memories'], shortcut: '/', scope: '/memory', category: 'route' },

	// ── /source ────────────────────────────────────────────────────────────
	{ phrase: 'stage file', aliases: ['stage', 'add to stage', 'git add', 'add file'], shortcut: 'Space', scope: '/source', category: 'route' },
	{ phrase: 'unstage file', aliases: ['unstage', 'remove from stage', 'git reset'], shortcut: 'U', scope: '/source', category: 'route' },
	{ phrase: 'discard changes', aliases: ['discard', 'revert file', 'undo changes', 'git checkout'], shortcut: 'D', scope: '/source', category: 'route' },
	{ phrase: 'switch to git tab', aliases: ['git tab', 'go to git', 'show git'], shortcut: 'Alt+G', scope: '/source', category: 'route' },
	{ phrase: 'switch to supabase tab', aliases: ['supabase tab', 'go to supabase', 'show migrations'], shortcut: 'Alt+U', scope: '/source', category: 'route' },
	{ phrase: 'switch to cloudflare tab', aliases: ['cloudflare tab', 'go to cloudflare'], shortcut: 'Alt+C', scope: '/source', category: 'route' },

	// ── /workflows ─────────────────────────────────────────────────────────
	{ phrase: 'new workflow', aliases: ['create workflow', 'add workflow', 'build workflow'], shortcut: 'n', scope: '/workflows', category: 'route' },
	{ phrase: 'save workflow', aliases: ['save', 'save current workflow'], shortcut: 'Ctrl+S', scope: '/workflows', category: 'route' },
	{ phrase: 'run workflow', aliases: ['run', 'execute workflow', 'trigger workflow', 'start workflow'], shortcut: 'Ctrl+Enter', scope: '/workflows', category: 'route' },
	{ phrase: 'undo', aliases: ['undo last', 'go back', 'revert change'], shortcut: 'Ctrl+Z', scope: '/workflows', category: 'route' },
	{ phrase: 'redo', aliases: ['redo last', 'redo change'], shortcut: 'Ctrl+Y', scope: '/workflows', category: 'route' },
	{ phrase: 'zoom in', aliases: ['zoom in canvas', 'bigger', 'increase zoom'], shortcut: 'Ctrl+=', scope: '/workflows', category: 'route' },
	{ phrase: 'zoom out', aliases: ['zoom out canvas', 'smaller', 'decrease zoom'], shortcut: 'Ctrl+-', scope: '/workflows', category: 'route' },

	// ── /files ─────────────────────────────────────────────────────────────
	{ phrase: 'save file', aliases: ['save', 'save current file', 'write file'], shortcut: 'Ctrl+S', scope: '/files', category: 'route' },
	{ phrase: 'close tab', aliases: ['close file', 'close editor tab', 'close current tab'], shortcut: 'Alt+W', scope: '/files', category: 'route' },
	{ phrase: 'next tab', aliases: ['next file', 'right tab', 'switch tab right'], shortcut: 'Alt+]', scope: '/files', category: 'route' },
	{ phrase: 'previous tab', aliases: ['previous file', 'left tab', 'switch tab left'], shortcut: 'Alt+[', scope: '/files', category: 'route' },
	{ phrase: 'quick file finder', aliases: ['find file', 'open file', 'go to file', 'file picker', 'search files'], shortcut: 'Alt+P', scope: '/files', category: 'route' },

	// ── /data ──────────────────────────────────────────────────────────────
	{ phrase: 'edit cell', aliases: ['edit', 'modify cell', 'open cell editor'], shortcut: 'Enter', scope: '/data', category: 'route' },
	{ phrase: 'next table', aliases: ['switch table', 'next project table', 'right table'], shortcut: 'Tab', scope: '/data', category: 'route' },
	{ phrase: 'previous table', aliases: ['previous project table', 'left table'], shortcut: 'Shift+Tab', scope: '/data', category: 'route' },
	{ phrase: 'next column in data', aliases: ['right cell', 'move right cell'], shortcut: 'ArrowRight', scope: '/data', category: 'route' },
	{ phrase: 'previous column in data', aliases: ['left cell', 'move left cell'], shortcut: 'ArrowLeft', scope: '/data', category: 'route' },

	// ── /open-tasks ────────────────────────────────────────────────────────
	// Filter dispatch — speak a filter and the page mutates its filter state
	// directly via registered action handlers (see /open-tasks/+page.svelte).
	{ phrase: 'show only open', aliases: ['only open', 'filter open', 'just open tasks', 'open only', 'show open tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-open', category: 'route' },
	{ phrase: 'show in progress', aliases: ['only in progress', 'show working', 'filter in progress', 'show working tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-in-progress', category: 'route' },
	{ phrase: 'show waiting', aliases: ['only waiting', 'filter waiting', 'show waiting tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-waiting', category: 'route' },
	{ phrase: 'show blocked', aliases: ['only blocked', 'filter blocked', 'show blocked tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-blocked', category: 'route' },
	{ phrase: 'show submitted', aliases: ['only submitted', 'filter submitted', 'show submitted tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-submitted', category: 'route' },
	{ phrase: 'show accepted', aliases: ['only accepted', 'filter accepted', 'show accepted tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-accepted', category: 'route' },
	{ phrase: 'show closed', aliases: ['only closed', 'filter closed', 'show done', 'show finished'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-closed', category: 'route' },
	{ phrase: 'show all statuses', aliases: ['all statuses', 'reset statuses', 'every status', 'show all states'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-status-reset', category: 'route' },

	{ phrase: 'show critical', aliases: ['priority zero', 'p zero', 'show p zero', 'critical priority'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-priority-0', category: 'route' },
	{ phrase: 'show high priority', aliases: ['priority one', 'p one', 'show p one', 'high priority'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-priority-1', category: 'route' },
	{ phrase: 'show medium priority', aliases: ['priority two', 'p two', 'show p two', 'medium priority'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-priority-2', category: 'route' },
	{ phrase: 'show low priority', aliases: ['priority three', 'p three', 'show p three', 'low priority'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-priority-3', category: 'route' },
	{ phrase: 'show lowest priority', aliases: ['priority four', 'p four', 'show p four', 'lowest priority'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-priority-4', category: 'route' },
	{ phrase: 'all priorities', aliases: ['any priority', 'clear priority', 'show all priorities'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-priority-reset', category: 'route' },

	{ phrase: 'show only bugs', aliases: ['filter bugs', 'just bugs', 'only bugs'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-type-bug', category: 'route' },
	{ phrase: 'show only features', aliases: ['filter features', 'just features', 'only features'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-type-feature', category: 'route' },
	{ phrase: 'show only tasks', aliases: ['filter tasks', 'just tasks', 'only tasks'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-type-task', category: 'route' },
	{ phrase: 'show only epics', aliases: ['filter epics', 'just epics', 'only epics'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-type-epic', category: 'route' },
	{ phrase: 'show only chores', aliases: ['filter chores', 'just chores', 'only chores'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-type-chore', category: 'route' },
	{ phrase: 'all types', aliases: ['any type', 'clear type', 'show all types'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-type-reset', category: 'route' },

	{ phrase: 'show unassigned', aliases: ['only unassigned', 'filter unassigned', 'no assignee'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-assignee-unassigned', category: 'route' },
	{ phrase: 'all assignees', aliases: ['any assignee', 'clear assignee', 'show all assignees'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-assignee-reset', category: 'route' },

	{ phrase: 'clear filters', aliases: ['reset filters', 'show all tasks', 'clear all filters', 'reset all filters'], shortcut: '', scope: '/open-tasks', action: 'open-tasks-clear-all', category: 'route' }
];

// =============================================================================
// GLOBAL ENTRIES (action IDs map to GlobalShortcutDef.id; shortcut resolved
// per-caller — browser overlays user overrides, server uses defaults)
// =============================================================================

interface GlobalEntryDef {
	phrase: string;
	aliases: string[];
	action: string;
	category: 'global' | 'session';
}

const GLOBAL_ENTRY_DEFS: GlobalEntryDef[] = [
	{ phrase: 'new task', aliases: ['create task', 'add task', 'make task', 'create new task'], action: 'new-task', category: 'global' },
	{ phrase: 'epic swarm', aliases: ['launch swarm', 'open swarm', 'swarm agents', 'start swarm'], action: 'epic-swarm', category: 'global' },
	{ phrase: 'start next task', aliases: ['start next', 'next task', 'pick up next', 'begin next'], action: 'start-next', category: 'global' },
	{ phrase: 'add project', aliases: ['new project', 'create project', 'add new project'], action: 'add-project', category: 'global' },
	{ phrase: 'toggle terminal', aliases: ['open terminal', 'close terminal', 'show terminal', 'hide terminal', 'terminal drawer'], action: 'toggle-terminal', category: 'global' },
	{ phrase: 'global search', aliases: ['search', 'find', 'command palette', 'unified search', 'search everything'], action: 'global-search', category: 'global' },
	{ phrase: 'attach terminal to session', aliases: ['attach', 'connect terminal', 'open session terminal', 'attach to agent'], action: 'attach-terminal', category: 'session' },
	{ phrase: 'kill session', aliases: ['kill', 'terminate session', 'end session', 'destroy session', 'kill agent'], action: 'kill-session', category: 'session' },
	{ phrase: 'interrupt session', aliases: ['interrupt', 'control c', 'stop agent', 'halt agent', 'send interrupt'], action: 'interrupt-session', category: 'session' },
	{ phrase: 'pause session', aliases: ['pause', 'suspend session', 'pause agent', 'pause work'], action: 'pause-session', category: 'session' },
	{ phrase: 'restart session', aliases: ['restart', 'restart agent', 'rerun session', 'restart work'], action: 'restart-session', category: 'session' },
	{ phrase: 'copy session contents', aliases: ['copy session', 'copy output', 'copy terminal output', 'copy agent output'], action: 'copy-session', category: 'session' }
];

/**
 * Build global-shortcut vocabulary entries with shortcuts resolved via the
 * supplied lookup. The browser passes the reactive getGlobalShortcut store
 * accessor; the server passes getDefaultGlobalShortcut.
 */
export function buildGlobalEntries(
	resolveShortcut: (actionId: string) => string
): VoiceVocabularyEntry[] {
	return GLOBAL_ENTRY_DEFS.map(def => ({
		phrase: def.phrase,
		aliases: def.aliases,
		shortcut: resolveShortcut(def.action),
		scope: 'any',
		action: def.action,
		category: def.category
	}));
}

/** Pure default-shortcut lookup — no user override layer. Server-safe. */
export function getDefaultGlobalShortcut(actionId: string): string {
	return DEFAULT_GLOBAL_SHORTCUT_BY_ID[actionId] || '';
}

/**
 * Full vocabulary using factory-default shortcuts. Use from server-side code
 * (e.g. mobile voice-memo intent routing) where the reactive client store is
 * unavailable. Returns NAV + GLOBAL (defaults) + ROUTE entries.
 */
export function buildStaticVocabulary(): VoiceVocabularyEntry[] {
	return [...NAV_ENTRIES, ...buildGlobalEntries(getDefaultGlobalShortcut), ...ROUTE_ENTRIES];
}

/** Filter vocabulary by route scope. Pure helper. */
export function filterByRoute(
	entries: VoiceVocabularyEntry[],
	route: string
): VoiceVocabularyEntry[] {
	return entries.filter(e => e.scope === 'any' || e.scope === route);
}
