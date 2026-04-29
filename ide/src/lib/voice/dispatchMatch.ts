/**
 * Dispatch a matched voice vocabulary entry.
 *
 * Strategy — prefer calling the *same handler* a real keystroke would invoke,
 * rather than synthesizing a KeyboardEvent:
 *
 *   1. If the entry has a registered `action` handler → call it directly.
 *      This is how global shortcuts (new-task, epic-swarm, attach-terminal…)
 *      are dispatched — identical code path to Alt+N / Alt+E / Alt+A.
 *
 *   2. Otherwise (navigation keys like j/k/Enter/Escape, route-scoped
 *      shortcuts like 's' on /triage) — dispatch a KeyboardEvent on
 *      document.body as a pragmatic fallback. These shortcuts are wired
 *      to `listNav` actions and page-local keydown listeners that don't
 *      yet expose a registry-style API.
 */

import type { VoiceVocabularyEntry } from '$lib/stores/voiceVocabulary.svelte';
import { parseShortcut } from '$lib/utils/shortcutParser';
import { getVoiceActionHandler } from './voiceActionRegistry';

export type DispatchResult = 'action-handler' | 'keyboard-event' | 'none';

export async function dispatchMatch(
	entry: VoiceVocabularyEntry
): Promise<DispatchResult> {
	// Preferred path — action handler registered by +layout.svelte
	if (entry.action) {
		const handler = getVoiceActionHandler(entry.action);
		if (handler) {
			try {
				await handler();
			} catch (err) {
				console.error(`[voice] action handler "${entry.action}" threw:`, err);
			}
			return 'action-handler';
		}
		// Action declared but not registered — log and fall through to keyboard.
		console.warn(`[voice] no registered handler for action "${entry.action}"`);
	}

	// Fallback — synthesize keystroke for nav/route-scoped shortcuts
	if (entry.shortcut) {
		const parsed = parseShortcut(entry.shortcut);
		const key = keyNameFor(parsed.key);
		const code = keyCodeFor(parsed.key);

		// Fire keydown + keyup in sequence — matches real hardware behaviour,
		// which some listeners (e.g. push-to-talk handlers) depend on.
		const target = document.activeElement instanceof HTMLElement
			? document.activeElement
			: document.body;

		const init: KeyboardEventInit = {
			key,
			code,
			bubbles: true,
			cancelable: true,
			altKey: parsed.alt,
			ctrlKey: parsed.ctrl,
			shiftKey: parsed.shift,
			metaKey: parsed.meta
		};

		target.dispatchEvent(new KeyboardEvent('keydown', init));
		target.dispatchEvent(new KeyboardEvent('keyup', init));
		return 'keyboard-event';
	}

	return 'none';
}

/**
 * Map a parsed-shortcut key to the value browsers put on `event.key` for that
 * key. parseShortcut() lowercases everything; this restores the canonical
 * casing the DOM uses.
 */
function keyNameFor(parsedKey: string): string {
	switch (parsedKey) {
		case 'space':           return ' ';
		case 'enter':           return 'Enter';
		case 'escape':          return 'Escape';
		case 'tab':             return 'Tab';
		case 'backspace':       return 'Backspace';
		case 'delete':          return 'Delete';
		case 'arrowright': case 'right': return 'ArrowRight';
		case 'arrowleft':  case 'left':  return 'ArrowLeft';
		case 'arrowup':    case 'up':    return 'ArrowUp';
		case 'arrowdown':  case 'down':  return 'ArrowDown';
		default:
			// Single letter: uppercase to match the natural event.key (shift state
			// is set via shiftKey flag above, so case here is nominal)
			return parsedKey.length === 1 ? parsedKey : parsedKey;
	}
}

/** Map a parsed key to the DOM `event.code` value. */
function keyCodeFor(parsedKey: string): string {
	switch (parsedKey) {
		case 'space':     return 'Space';
		case 'enter':     return 'Enter';
		case 'escape':    return 'Escape';
		case 'tab':       return 'Tab';
		case 'backspace': return 'Backspace';
		case 'delete':    return 'Delete';
		case 'arrowright': case 'right': return 'ArrowRight';
		case 'arrowleft':  case 'left':  return 'ArrowLeft';
		case 'arrowup':    case 'up':    return 'ArrowUp';
		case 'arrowdown':  case 'down':  return 'ArrowDown';
		default:
			if (/^[a-z]$/.test(parsedKey)) return `Key${parsedKey.toUpperCase()}`;
			if (/^[0-9]$/.test(parsedKey)) return `Digit${parsedKey}`;
			return parsedKey;
	}
}
