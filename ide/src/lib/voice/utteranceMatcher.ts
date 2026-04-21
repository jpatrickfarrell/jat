/**
 * Utterance → Shortcut Matcher
 *
 * Takes a whisper transcript + current route, finds the best-matching
 * VoiceVocabularyEntry using a cascading strategy:
 *
 *   1. Normalize (lowercase, strip punctuation, collapse whitespace)
 *   2. Exact phrase match              → confidence 1.00
 *   3. Exact alias match               → confidence 0.95
 *   4. Word-order-invariant phrase     → confidence 0.82
 *   5. Word-order-invariant alias      → confidence 0.78
 *   6. Levenshtein ≤ 2 on phrase       → confidence 0.85 (short) / 0.75 (long)
 *   7. Levenshtein ≤ 2 on alias        → confidence 0.80 / 0.72
 *   8. Levenshtein ≤ 3 on phrase       → confidence 0.70
 *
 * The best score across all entries + aliases wins. Results below the
 * threshold surface as state='no-match' so the user can see the raw
 * transcript and understand why.
 */

import {
	getVocabularyForRoute,
	type VoiceVocabularyEntry
} from '$lib/stores/voiceVocabulary.svelte';

export interface MatchResult {
	/** Matched vocabulary entry, or null if no match above threshold. */
	entry: VoiceVocabularyEntry | null;
	/** Confidence in [0, 1]. 0 = no match, 1 = exact phrase. */
	confidence: number;
	/** Which strategy produced the best score. Useful for debugging. */
	reason: MatchReason;
	/** The normalized form of the input utterance. */
	normalized: string;
	/** Raw transcript (unchanged). */
	raw: string;
}

export type MatchReason =
	| 'exact-phrase'
	| 'exact-alias'
	| 'word-order-phrase'
	| 'word-order-alias'
	| 'fuzzy-phrase'
	| 'fuzzy-alias'
	| 'no-match';

export const MATCH_CONFIDENCE_THRESHOLD = 0.7;

// -----------------------------------------------------------------------------
// NORMALIZATION
// -----------------------------------------------------------------------------

/**
 * Lowercase, strip punctuation, collapse whitespace.
 * Preserves internal spaces so tokenisation works downstream.
 */
export function normalize(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFKD')
		// Strip combining diacritics
		.replace(/[̀-ͯ]/g, '')
		// Replace any punctuation (Unicode-aware) with a space so word boundaries
		// remain. Keeps letters, digits, and whitespace.
		.replace(/[^\p{L}\p{N}\s]+/gu, ' ')
		.trim()
		// Collapse runs of whitespace into a single space
		.replace(/\s+/g, ' ');
}

// -----------------------------------------------------------------------------
// LEVENSHTEIN (iterative, O(m*n) space-optimised to two rows)
// -----------------------------------------------------------------------------

export function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;

	// Two-row rolling buffer
	let prev = new Array<number>(b.length + 1);
	let curr = new Array<number>(b.length + 1);
	for (let j = 0; j <= b.length; j++) prev[j] = j;

	for (let i = 1; i <= a.length; i++) {
		curr[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
			curr[j] = Math.min(
				curr[j - 1] + 1,        // insertion
				prev[j] + 1,            // deletion
				prev[j - 1] + cost      // substitution
			);
		}
		[prev, curr] = [curr, prev];
	}

	return prev[b.length];
}

// -----------------------------------------------------------------------------
// WORD-ORDER-INVARIANT COMPARISON
// -----------------------------------------------------------------------------

/**
 * True if `a` and `b` contain the same tokens regardless of order.
 * e.g. "task new" ≡ "new task"
 */
export function wordOrderEqual(a: string, b: string): boolean {
	const aTokens = a.split(' ').filter(Boolean).sort();
	const bTokens = b.split(' ').filter(Boolean).sort();
	if (aTokens.length !== bTokens.length) return false;
	for (let i = 0; i < aTokens.length; i++) {
		if (aTokens[i] !== bTokens[i]) return false;
	}
	return true;
}

// -----------------------------------------------------------------------------
// PER-PHRASE SCORING
// -----------------------------------------------------------------------------

/**
 * Score a normalized utterance against a single candidate phrase.
 * Returns the strongest strategy that applies, or null if no strategy fires.
 */
function scoreAgainstPhrase(
	utterance: string,
	phrase: string,
	isAlias: boolean
): { confidence: number; reason: MatchReason } | null {
	const normalizedPhrase = normalize(phrase);

	// Exact match: highest confidence
	if (utterance === normalizedPhrase) {
		return {
			confidence: isAlias ? 0.95 : 1.0,
			reason: isAlias ? 'exact-alias' : 'exact-phrase'
		};
	}

	// Word-order-invariant match — same tokens, different order
	// Only meaningful if there's more than one word
	if (normalizedPhrase.includes(' ') && wordOrderEqual(utterance, normalizedPhrase)) {
		return {
			confidence: isAlias ? 0.78 : 0.82,
			reason: isAlias ? 'word-order-alias' : 'word-order-phrase'
		};
	}

	// Fuzzy (Levenshtein) match
	// Scale the edit-distance threshold with phrase length — short phrases
	// ("j", "up") can't tolerate edit-distance 2 without matching everything.
	const maxLen = Math.max(utterance.length, normalizedPhrase.length);
	const maxEdits = maxLen <= 4 ? 1 : maxLen <= 10 ? 2 : 3;
	const dist = levenshtein(utterance, normalizedPhrase);

	if (dist <= maxEdits) {
		// Higher confidence for tighter matches on shorter phrases
		let confidence: number;
		if (dist === 1 && maxLen > 4) {
			confidence = isAlias ? 0.80 : 0.85;
		} else if (dist <= 2) {
			confidence = isAlias ? 0.72 : 0.75;
		} else {
			// dist === 3 on a long phrase
			confidence = isAlias ? 0.68 : 0.70;
		}
		return {
			confidence,
			reason: isAlias ? 'fuzzy-alias' : 'fuzzy-phrase'
		};
	}

	return null;
}

// -----------------------------------------------------------------------------
// TOP-LEVEL MATCH
// -----------------------------------------------------------------------------

/**
 * Match a whisper transcript against the route-scoped vocabulary.
 *
 * Returns the highest-confidence entry. If the best score falls below
 * MATCH_CONFIDENCE_THRESHOLD, returns entry=null so the caller can
 * surface a 'no-match' UI state with the raw transcript.
 */
export function matchUtterance(
	transcript: string,
	route?: string
): MatchResult {
	const raw = transcript ?? '';
	const normalized = normalize(raw);

	if (!normalized) {
		return {
			entry: null,
			confidence: 0,
			reason: 'no-match',
			normalized,
			raw
		};
	}

	const entries = getVocabularyForRoute(route ?? '');

	let best: {
		entry: VoiceVocabularyEntry;
		confidence: number;
		reason: MatchReason;
	} | null = null;

	for (const entry of entries) {
		// Score against the primary phrase first
		const phraseScore = scoreAgainstPhrase(normalized, entry.phrase, false);
		if (phraseScore && (!best || phraseScore.confidence > best.confidence)) {
			best = { entry, confidence: phraseScore.confidence, reason: phraseScore.reason };
			if (best.confidence >= 1.0) break; // short-circuit on perfect match
		}

		// Score against each alias
		for (const alias of entry.aliases) {
			const aliasScore = scoreAgainstPhrase(normalized, alias, true);
			if (aliasScore && (!best || aliasScore.confidence > best.confidence)) {
				best = { entry, confidence: aliasScore.confidence, reason: aliasScore.reason };
			}
		}
	}

	if (!best || best.confidence < MATCH_CONFIDENCE_THRESHOLD) {
		return {
			entry: null,
			confidence: best?.confidence ?? 0,
			reason: 'no-match',
			normalized,
			raw
		};
	}

	return {
		entry: best.entry,
		confidence: best.confidence,
		reason: best.reason,
		normalized,
		raw
	};
}
