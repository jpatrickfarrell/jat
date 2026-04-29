/**
 * Voice Action Registry
 *
 * A shared registry of global-action handlers so the voice matcher can call the
 * exact same code path as a real keyboard shortcut — no synthetic KeyboardEvent,
 * no second source of truth. `+layout.svelte` registers its globalActionHandlers
 * map on mount; `dispatchMatch()` reads from it when dispatching a matched
 * utterance.
 *
 * Keys match the `action` field on VoiceVocabularyEntry and the `id` field on
 * GlobalShortcutDef in keyboardShortcuts.svelte.ts (e.g. 'new-task',
 * 'epic-swarm', 'attach-terminal').
 */

export type VoiceActionHandler = () => void | Promise<void>;

let handlers: Record<string, VoiceActionHandler> = {};
let globalKeys: Set<string> = new Set();

/**
 * Register the full map of global action handlers. Called once from
 * +layout.svelte onMount. Passing a fresh map replaces all previously
 * registered global handlers so HMR-triggered re-registration works cleanly,
 * but preserves any route-scoped handlers added via addVoiceActionHandlers.
 */
export function registerVoiceActionHandlers(
	map: Record<string, VoiceActionHandler>
): void {
	for (const key of globalKeys) delete handlers[key];
	globalKeys = new Set(Object.keys(map));
	Object.assign(handlers, map);
}

/**
 * Additively register handlers (does not clobber existing entries) and return
 * a cleanup function that removes only the keys this call added. Use from
 * route components in onMount; call the returned function in onDestroy.
 */
export function addVoiceActionHandlers(
	map: Record<string, VoiceActionHandler>
): () => void {
	const addedKeys = Object.keys(map);
	Object.assign(handlers, map);
	return () => {
		for (const key of addedKeys) {
			if (handlers[key] === map[key]) delete handlers[key];
		}
	};
}

/** Look up a handler by action ID. Returns undefined if not registered. */
export function getVoiceActionHandler(
	action: string
): VoiceActionHandler | undefined {
	return handlers[action];
}

/** For tests — clears the registry. */
export function _resetVoiceActionRegistry(): void {
	handlers = {};
	globalKeys = new Set();
}
