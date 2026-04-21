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

/**
 * Register the full map of global action handlers. Called once from
 * +layout.svelte onMount. Passing a fresh map replaces the previous one so
 * HMR-triggered re-registration works cleanly.
 */
export function registerVoiceActionHandlers(
	map: Record<string, VoiceActionHandler>
): void {
	handlers = { ...map };
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
}
