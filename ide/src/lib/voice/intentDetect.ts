/**
 * Shortcut-intent detection for transcripts.
 *
 * Mobile pipeline (iOS Voice Memos → Shortcut → /api/tasks/voice) used to
 * always treat audio as a new task. With this helper, transcripts beginning
 * with "jat " or "command " (case-insensitive) are routed through the
 * utterance matcher and the matched action is returned instead. Useful while
 * walking: "jat next task", "jat open it".
 *
 * This is the server-side counterpart to push-to-talk on the desktop. It
 * only recognises and echoes the matched command — actually dispatching the
 * action on the desktop client is a separate concern.
 */

import { matchUtterance, MATCH_CONFIDENCE_THRESHOLD, type MatchResult } from './utteranceMatcher';
import { buildStaticVocabulary, filterByRoute } from './vocabularyData';

const PREFIX_PATTERN = /^\s*(jat|command)\b[\s,:.-]*/i;

export interface DetectedIntent {
	/** True if the transcript began with a recognised shortcut prefix. */
	hasPrefix: boolean;
	/** The transcript with the prefix stripped (empty if no prefix). */
	stripped: string;
	/** Matcher result against the static (default-shortcut) vocabulary. */
	match: MatchResult | null;
	/**
	 * True only when prefix was present AND a match was found above the
	 * confidence threshold. Caller uses this to skip task creation.
	 */
	matched: boolean;
}

/**
 * Inspect a transcript for shortcut intent. Returns hasPrefix=false when the
 * caller should fall through to the existing task-creation flow.
 */
export function detectShortcutIntent(transcript: string, route = 'any'): DetectedIntent {
	const raw = (transcript ?? '').trim();
	const prefixMatch = raw.match(PREFIX_PATTERN);

	if (!prefixMatch) {
		return { hasPrefix: false, stripped: '', match: null, matched: false };
	}

	const stripped = raw.slice(prefixMatch[0].length).trim();
	if (!stripped) {
		return { hasPrefix: true, stripped: '', match: null, matched: false };
	}

	const vocabulary = filterByRoute(buildStaticVocabulary(), route);
	const result = matchUtterance(stripped, vocabulary);
	const matched = !!result.entry && result.confidence >= MATCH_CONFIDENCE_THRESHOLD;

	return { hasPrefix: true, stripped, match: result, matched };
}

/**
 * Compact public summary of a matched intent — what the iOS Shortcut echoes.
 * Returns null when no match (caller should surface the raw transcript).
 */
export function summarizeMatch(intent: DetectedIntent): {
	action: string | undefined;
	phrase: string;
	shortcut: string;
	confidence: number;
	reason: string;
} | null {
	if (!intent.matched || !intent.match?.entry) return null;
	const e = intent.match.entry;
	return {
		action: e.action,
		phrase: e.phrase,
		shortcut: e.shortcut,
		confidence: intent.match.confidence,
		reason: intent.match.reason
	};
}
