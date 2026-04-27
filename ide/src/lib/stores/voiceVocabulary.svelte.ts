/**
 * Voice Vocabulary Registry — reactive client store.
 *
 * Static entries (NAV + ROUTE) and the global-entry definitions live in
 * `$lib/voice/vocabularyData` so the server can import them without a
 * Svelte runtime. This store layers user shortcut overrides on top via the
 * reactive `getGlobalShortcut()` accessor — calling it inside `$derived.by`
 * tracks the underlying $state in keyboardShortcuts.svelte.ts.
 */

import { getGlobalShortcut } from './keyboardShortcuts.svelte';
import {
	NAV_ENTRIES,
	ROUTE_ENTRIES,
	buildGlobalEntries,
	filterByRoute,
	type VoiceVocabularyEntry
} from '$lib/voice/vocabularyData';

export type { VoiceVocabularyEntry };

// =============================================================================
// REACTIVE STORE
// =============================================================================

const voiceVocabulary: VoiceVocabularyEntry[] = $derived.by(() => {
	return [...NAV_ENTRIES, ...buildGlobalEntries(getGlobalShortcut), ...ROUTE_ENTRIES];
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
	return filterByRoute(voiceVocabulary, route);
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
