/**
 * Voice Vocabulary Registry
 *
 * Canonical phrase → shortcut action mapping for the voice → shortcut pipeline.
 * Auto-rebuilt as a $derived store when user overrides global shortcuts.
 *
 * Entries cover three sources:
 *   1. Universal listNav shortcuts (j/k/Enter/Escape — every list route)
 *   2. Global app shortcuts (Alt+N, Alt+E, etc. — configurable by user)
 *   3. Per-route shortcuts declared in KeyboardShortcutsOverlay usages
 */

import { getGlobalShortcut } from './keyboardShortcuts.svelte';

// =============================================================================
// TYPES
// =============================================================================

export interface VoiceVocabularyEntry {
	/** Primary canonical phrase used as the voice-match target. */
	phrase: string;
	/** Alternative phrasings accepted as equivalents. */
	aliases: string[];
	/** Key or key combination to dispatch (e.g. 'j', 'Alt+N', 'Ctrl+S'). */
	shortcut: string;
	/**
	 * Where the shortcut is active.
	 * 'any' = works on every route.
	 * '/triage' etc. = active only on that route.
	 */
	scope: 'any' | string;
	/** Optional action ID matching a GlobalShortcutDef id for configurable shortcuts. */
	action?: string;
	category: 'navigation' | 'global' | 'session' | 'route';
}

// =============================================================================
// STATIC: UNIVERSAL NAVIGATION (listNav — j/k/Enter/Escape/?)
// All routes that use listNav or KeyboardShortcutsOverlay respond to these.
// =============================================================================

const NAV_ENTRIES: VoiceVocabularyEntry[] = [
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
	},
];

// =============================================================================
// STATIC: ROUTE-SCOPED SHORTCUTS
// Extracted from each route's KeyboardShortcutsOverlay declarations.
// =============================================================================

const ROUTE_ENTRIES: VoiceVocabularyEntry[] = [
	// ── /triage ────────────────────────────────────────────────────────────
	{
		phrase: 'spawn agent',
		aliases: ['spawn', 'solve task', 'start agent', 'launch agent', 'run agent', 'assign agent'],
		shortcut: 's',
		scope: '/triage',
		category: 'route'
	},
	{
		phrase: 'promote task',
		aliases: ['promote', 'promote to open', 'open task', 'move to open'],
		shortcut: 'p',
		scope: '/triage',
		category: 'route'
	},
	{
		phrase: 'edit task',
		aliases: ['edit', 'modify', 'change task', 'update task'],
		shortcut: 'e',
		scope: '/triage',
		category: 'route'
	},
	{
		phrase: 'close task',
		aliases: ['close', 'resolve', 'mark done', 'reject', 'dismiss task'],
		shortcut: 'r',
		scope: '/triage',
		category: 'route'
	},
	{
		phrase: 'delete task',
		aliases: ['delete', 'remove', 'trash', 'discard'],
		shortcut: 'd',
		scope: '/triage',
		category: 'route'
	},
	{
		phrase: 'focus search',
		aliases: ['search', 'find', 'filter', 'search tasks', 'type to search'],
		shortcut: '/',
		scope: '/triage',
		category: 'route'
	},

	// ── /chores ────────────────────────────────────────────────────────────
	{
		phrase: 'open chore',
		aliases: ['view chore', 'chore detail', 'open detail'],
		shortcut: 'Enter',
		scope: '/chores',
		category: 'route'
	},

	// ── /automation ────────────────────────────────────────────────────────
	{
		phrase: 'new rule',
		aliases: ['create rule', 'add rule', 'new automation rule'],
		shortcut: 'n',
		scope: '/automation',
		category: 'route'
	},
	{
		phrase: 'toggle rule',
		aliases: ['enable rule', 'disable rule', 'toggle', 'activate rule', 'deactivate rule'],
		shortcut: 'Space',
		scope: '/automation',
		category: 'route'
	},
	{
		phrase: 'move rule down',
		aliases: ['lower priority', 'demote rule', 'push rule down'],
		shortcut: 'Shift+J',
		scope: '/automation',
		category: 'route'
	},
	{
		phrase: 'move rule up',
		aliases: ['raise priority', 'promote rule', 'push rule up'],
		shortcut: 'Shift+K',
		scope: '/automation',
		category: 'route'
	},

	// ── /kanban ────────────────────────────────────────────────────────────
	{
		phrase: 'next column',
		aliases: ['right column', 'move right', 'next lane', 'go right'],
		shortcut: 'ArrowRight',
		scope: '/kanban',
		category: 'route'
	},
	{
		phrase: 'previous column',
		aliases: ['left column', 'move left', 'previous lane', 'go left', 'back column'],
		shortcut: 'ArrowLeft',
		scope: '/kanban',
		category: 'route'
	},

	// ── /integrations ──────────────────────────────────────────────────────
	{
		phrase: 'switch integration tab',
		aliases: ['installed tab', 'add integration tab', 'toggle tab'],
		shortcut: 'Tab',
		scope: '/integrations',
		category: 'route'
	},

	// ── /servers ───────────────────────────────────────────────────────────
	{
		phrase: 'toggle server',
		aliases: ['start server', 'stop server', 'toggle start stop'],
		shortcut: 'Space',
		scope: '/servers',
		category: 'route'
	},
	{
		phrase: 'restart server',
		aliases: ['restart', 'reboot server', 'start server'],
		shortcut: 'R',
		scope: '/servers',
		category: 'route'
	},
	{
		phrase: 'stop server',
		aliases: ['stop', 'halt server', 'kill server process'],
		shortcut: 'S',
		scope: '/servers',
		category: 'route'
	},
	{
		phrase: 'open server in browser',
		aliases: ['open browser', 'open url', 'launch browser', 'view server'],
		shortcut: 'O',
		scope: '/servers',
		category: 'route'
	},

	// ── /memory ────────────────────────────────────────────────────────────
	{
		phrase: 'switch memory tab',
		aliases: ['search tab', 'browse tab', 'toggle memory tab'],
		shortcut: 'Tab',
		scope: '/memory',
		category: 'route'
	},
	{
		phrase: 'search memory',
		aliases: ['find memory', 'memory search', 'filter memories'],
		shortcut: '/',
		scope: '/memory',
		category: 'route'
	},

	// ── /source ────────────────────────────────────────────────────────────
	{
		phrase: 'stage file',
		aliases: ['stage', 'add to stage', 'git add', 'add file'],
		shortcut: 'Space',
		scope: '/source',
		category: 'route'
	},
	{
		phrase: 'unstage file',
		aliases: ['unstage', 'remove from stage', 'git reset'],
		shortcut: 'U',
		scope: '/source',
		category: 'route'
	},
	{
		phrase: 'discard changes',
		aliases: ['discard', 'revert file', 'undo changes', 'git checkout'],
		shortcut: 'D',
		scope: '/source',
		category: 'route'
	},
	{
		phrase: 'switch to git tab',
		aliases: ['git tab', 'go to git', 'show git'],
		shortcut: 'Alt+G',
		scope: '/source',
		category: 'route'
	},
	{
		phrase: 'switch to supabase tab',
		aliases: ['supabase tab', 'go to supabase', 'show migrations'],
		shortcut: 'Alt+U',
		scope: '/source',
		category: 'route'
	},
	{
		phrase: 'switch to cloudflare tab',
		aliases: ['cloudflare tab', 'go to cloudflare'],
		shortcut: 'Alt+C',
		scope: '/source',
		category: 'route'
	},

	// ── /workflows ─────────────────────────────────────────────────────────
	{
		phrase: 'new workflow',
		aliases: ['create workflow', 'add workflow', 'build workflow'],
		shortcut: 'n',
		scope: '/workflows',
		category: 'route'
	},
	{
		phrase: 'save workflow',
		aliases: ['save', 'save current workflow'],
		shortcut: 'Ctrl+S',
		scope: '/workflows',
		category: 'route'
	},
	{
		phrase: 'run workflow',
		aliases: ['run', 'execute workflow', 'trigger workflow', 'start workflow'],
		shortcut: 'Ctrl+Enter',
		scope: '/workflows',
		category: 'route'
	},
	{
		phrase: 'undo',
		aliases: ['undo last', 'go back', 'revert change'],
		shortcut: 'Ctrl+Z',
		scope: '/workflows',
		category: 'route'
	},
	{
		phrase: 'redo',
		aliases: ['redo last', 'redo change'],
		shortcut: 'Ctrl+Y',
		scope: '/workflows',
		category: 'route'
	},
	{
		phrase: 'zoom in',
		aliases: ['zoom in canvas', 'bigger', 'increase zoom'],
		shortcut: 'Ctrl+=',
		scope: '/workflows',
		category: 'route'
	},
	{
		phrase: 'zoom out',
		aliases: ['zoom out canvas', 'smaller', 'decrease zoom'],
		shortcut: 'Ctrl+-',
		scope: '/workflows',
		category: 'route'
	},

	// ── /files ─────────────────────────────────────────────────────────────
	{
		phrase: 'save file',
		aliases: ['save', 'save current file', 'write file'],
		shortcut: 'Ctrl+S',
		scope: '/files',
		category: 'route'
	},
	{
		phrase: 'close tab',
		aliases: ['close file', 'close editor tab', 'close current tab'],
		shortcut: 'Alt+W',
		scope: '/files',
		category: 'route'
	},
	{
		phrase: 'next tab',
		aliases: ['next file', 'right tab', 'switch tab right'],
		shortcut: 'Alt+]',
		scope: '/files',
		category: 'route'
	},
	{
		phrase: 'previous tab',
		aliases: ['previous file', 'left tab', 'switch tab left'],
		shortcut: 'Alt+[',
		scope: '/files',
		category: 'route'
	},
	{
		phrase: 'quick file finder',
		aliases: ['find file', 'open file', 'go to file', 'file picker', 'search files'],
		shortcut: 'Alt+P',
		scope: '/files',
		category: 'route'
	},

	// ── /data ──────────────────────────────────────────────────────────────
	{
		phrase: 'edit cell',
		aliases: ['edit', 'modify cell', 'open cell editor'],
		shortcut: 'Enter',
		scope: '/data',
		category: 'route'
	},
	{
		phrase: 'next table',
		aliases: ['switch table', 'next project table', 'right table'],
		shortcut: 'Tab',
		scope: '/data',
		category: 'route'
	},
	{
		phrase: 'previous table',
		aliases: ['previous project table', 'left table'],
		shortcut: 'Shift+Tab',
		scope: '/data',
		category: 'route'
	},
	{
		phrase: 'next column in data',
		aliases: ['right cell', 'move right cell'],
		shortcut: 'ArrowRight',
		scope: '/data',
		category: 'route'
	},
	{
		phrase: 'previous column in data',
		aliases: ['left cell', 'move left cell'],
		shortcut: 'ArrowLeft',
		scope: '/data',
		category: 'route'
	},
];

// =============================================================================
// DYNAMIC: GLOBAL + SESSION SHORTCUTS (configurable — reads $state)
// Calling getGlobalShortcut() inside $derived.by tracks reactive changes.
// =============================================================================

function buildGlobalEntries(): VoiceVocabularyEntry[] {
	return [
		{
			phrase: 'new task',
			aliases: ['create task', 'add task', 'make task', 'create new task'],
			shortcut: getGlobalShortcut('new-task'),
			scope: 'any',
			action: 'new-task',
			category: 'global'
		},
		{
			phrase: 'epic swarm',
			aliases: ['launch swarm', 'open swarm', 'swarm agents', 'start swarm'],
			shortcut: getGlobalShortcut('epic-swarm'),
			scope: 'any',
			action: 'epic-swarm',
			category: 'global'
		},
		{
			phrase: 'start next task',
			aliases: ['start next', 'next task', 'pick up next', 'begin next'],
			shortcut: getGlobalShortcut('start-next'),
			scope: 'any',
			action: 'start-next',
			category: 'global'
		},
		{
			phrase: 'add project',
			aliases: ['new project', 'create project', 'add new project'],
			shortcut: getGlobalShortcut('add-project'),
			scope: 'any',
			action: 'add-project',
			category: 'global'
		},
		{
			phrase: 'toggle terminal',
			aliases: ['open terminal', 'close terminal', 'show terminal', 'hide terminal', 'terminal drawer'],
			shortcut: getGlobalShortcut('toggle-terminal'),
			scope: 'any',
			action: 'toggle-terminal',
			category: 'global'
		},
		{
			phrase: 'global search',
			aliases: ['search', 'find', 'command palette', 'unified search', 'search everything'],
			shortcut: getGlobalShortcut('global-search'),
			scope: 'any',
			action: 'global-search',
			category: 'global'
		},
		// Session shortcuts — require a hovered session
		{
			phrase: 'attach terminal to session',
			aliases: ['attach', 'connect terminal', 'open session terminal', 'attach to agent'],
			shortcut: getGlobalShortcut('attach-terminal'),
			scope: 'any',
			action: 'attach-terminal',
			category: 'session'
		},
		{
			phrase: 'kill session',
			aliases: ['kill', 'terminate session', 'end session', 'destroy session', 'kill agent'],
			shortcut: getGlobalShortcut('kill-session'),
			scope: 'any',
			action: 'kill-session',
			category: 'session'
		},
		{
			phrase: 'interrupt session',
			aliases: ['interrupt', 'control c', 'stop agent', 'halt agent', 'send interrupt'],
			shortcut: getGlobalShortcut('interrupt-session'),
			scope: 'any',
			action: 'interrupt-session',
			category: 'session'
		},
		{
			phrase: 'pause session',
			aliases: ['pause', 'suspend session', 'pause agent', 'pause work'],
			shortcut: getGlobalShortcut('pause-session'),
			scope: 'any',
			action: 'pause-session',
			category: 'session'
		},
		{
			phrase: 'restart session',
			aliases: ['restart', 'restart agent', 'rerun session', 'restart work'],
			shortcut: getGlobalShortcut('restart-session'),
			scope: 'any',
			action: 'restart-session',
			category: 'session'
		},
		{
			phrase: 'copy session contents',
			aliases: ['copy session', 'copy output', 'copy terminal output', 'copy agent output'],
			shortcut: getGlobalShortcut('copy-session'),
			scope: 'any',
			action: 'copy-session',
			category: 'session'
		},
	];
}

// =============================================================================
// REACTIVE STORE
// $derived.by re-evaluates whenever getGlobalShortcut() deps change ($state in
// keyboardShortcuts.svelte.ts mutates → tracker fires → this rebuilds).
//
// Svelte 5 disallows exporting `$derived` bindings from a module — consumers
// must go through a getter function that returns the current value.
// =============================================================================

const voiceVocabulary: VoiceVocabularyEntry[] = $derived.by(() => {
	return [...NAV_ENTRIES, ...buildGlobalEntries(), ...ROUTE_ENTRIES];
});

/** Snapshot of the full reactive vocabulary. Call from inside a reactive
 *  context (component, $derived, $effect) for auto-tracking. */
export function getVoiceVocabulary(): VoiceVocabularyEntry[] {
	return voiceVocabulary;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Return vocabulary entries valid on the given route.
 * Includes 'any'-scoped entries plus those whose scope matches exactly.
 */
export function getVocabularyForRoute(route: string): VoiceVocabularyEntry[] {
	return voiceVocabulary.filter(e => e.scope === 'any' || e.scope === route);
}

/**
 * Return a flat list of every phrase and alias across the vocabulary,
 * optionally scoped to a route. Useful for priming a speech recogniser with
 * a bounded vocabulary list.
 */
export function getAllPhrases(route?: string): string[] {
	const entries = route ? getVocabularyForRoute(route) : voiceVocabulary;
	const phrases: string[] = [];
	for (const e of entries) {
		phrases.push(e.phrase);
		phrases.push(...e.aliases);
	}
	return phrases;
}

/**
 * Find the vocabulary entry that best matches an utterance.
 * Performs exact phrase/alias matching (case-insensitive, trimmed).
 * Returns null if no match — fuzzy matching is handled by jat-107ll.
 */
export function findExactMatch(
	utterance: string,
	route?: string
): VoiceVocabularyEntry | null {
	const normalised = utterance.toLowerCase().trim().replace(/[.,!?]+$/, '');
	const entries = route ? getVocabularyForRoute(route) : voiceVocabulary;

	for (const entry of entries) {
		if (entry.phrase === normalised) return entry;
		if (entry.aliases.some(a => a === normalised)) return entry;
	}
	return null;
}
