/**
 * Rolling debug buffer for voice matching.
 *
 * Logs every utterance + match decision (including no-matches) so a developer
 * inspecting `window.__jatVoiceDebug` in the console can see why a phrase
 * didn't hit — most often a missing alias or an over-aggressive threshold.
 *
 * Fixed-size ring buffer (default 50 entries) to prevent memory growth.
 */

import type { MatchResult, MatchReason } from './utteranceMatcher';

export interface DebugEntry {
	timestamp: number;
	iso: string;
	raw: string;
	normalized: string;
	route: string;
	matched: boolean;
	phrase: string | null;
	shortcut: string | null;
	action: string | null;
	confidence: number;
	reason: MatchReason;
	/** How the match was dispatched (or why not). */
	dispatch: 'action-handler' | 'keyboard-event' | 'none' | null;
}

const BUFFER_SIZE = 50;

// Ring buffer state — module-scoped
const buffer: DebugEntry[] = [];
let writeIndex = 0;

export function recordMatch(
	result: MatchResult,
	route: string,
	dispatch: DebugEntry['dispatch']
): void {
	const entry: DebugEntry = {
		timestamp: Date.now(),
		iso: new Date().toISOString(),
		raw: result.raw,
		normalized: result.normalized,
		route,
		matched: result.entry !== null,
		phrase: result.entry?.phrase ?? null,
		shortcut: result.entry?.shortcut ?? null,
		action: result.entry?.action ?? null,
		confidence: result.confidence,
		reason: result.reason,
		dispatch
	};

	if (buffer.length < BUFFER_SIZE) {
		buffer.push(entry);
	} else {
		buffer[writeIndex] = entry;
		writeIndex = (writeIndex + 1) % BUFFER_SIZE;
	}

	// Expose in browser devtools for quick inspection.
	// Guard SSR — this module is imported from browser-only code paths, but the
	// vitest harness may evaluate it in node.
	if (typeof window !== 'undefined') {
		(window as unknown as { __jatVoiceDebug?: DebugEntry[] }).__jatVoiceDebug =
			getDebugLog();
	}
}

/** Snapshot of the buffer in chronological (oldest → newest) order. */
export function getDebugLog(): DebugEntry[] {
	if (buffer.length < BUFFER_SIZE) return [...buffer];
	// Reassemble ring in order starting from the oldest entry
	return [...buffer.slice(writeIndex), ...buffer.slice(0, writeIndex)];
}

/** Clear the buffer — used by tests and the `?` help overlay's "reset log". */
export function clearDebugLog(): void {
	buffer.length = 0;
	writeIndex = 0;
	if (typeof window !== 'undefined') {
		(window as unknown as { __jatVoiceDebug?: DebugEntry[] }).__jatVoiceDebug = [];
	}
}
