/**
 * JAT task-id resolver
 *
 * Maps free-text utterances like "the auth task" or "fix login" against the
 * visible-tasks slice of the interpret context. This is the JAT app's
 * registrant for the framework's `task-id` parameter type — the framework
 * itself contains zero knowledge of what a task is.
 *
 * Strategy (PRD §5.3):
 *   1. If the text already contains a known task ID verbatim, accept it.
 *   2. Otherwise tokenize, drop English stop words ("the", "task", "this"),
 *      and score every visible title by per-input-token best-match across
 *      the title's tokens (exact > Levenshtein-1 > prefix > substring).
 *   3. Final score = mean of per-token bests. Threshold 0.60 (lower than the
 *      utterance matcher's 0.70 because LLM-generated descriptions ("the auth
 *      task") have weaker overlap with canonical titles).
 *   4. If the top two scores are within AMBIGUITY_MARGIN, return all such
 *      candidates so the disambiguation overlay (jat-ho0mz.12) can show them.
 */

import { normalize, levenshtein } from '../utteranceMatcher';
import type { Resolver, ResolveResult } from '../parameterResolver';

export const TASK_ID_THRESHOLD = 0.6;
export const AMBIGUITY_MARGIN = 0.1;
export const MAX_CANDIDATES = 5;

const STOP_WORDS = new Set([
	'the',
	'a',
	'an',
	'task',
	'tasks',
	'this',
	'that',
	'my',
	'our',
	'one',
	'item'
]);

export interface VisibleTask {
	id: string;
	title: string;
	status?: string;
	priority?: number;
	updated_at?: string;
}

interface TaskIdContext {
	visibleTasks?: VisibleTask[];
}

export const resolveTaskId: Resolver = (text, ctx): ResolveResult => {
	const visibleTasks = (ctx as TaskIdContext).visibleTasks ?? [];
	if (!text || visibleTasks.length === 0) {
		return { status: 'not-found' };
	}

	// 1. Direct ID match — check before normalize (which strips dashes).
	const lowerText = text.toLowerCase().trim();
	for (const t of visibleTasks) {
		const idLower = t.id.toLowerCase();
		if (lowerText === idLower || lowerText.includes(idLower)) {
			return { status: 'resolved', value: t.id, confidence: 1.0 };
		}
	}

	const norm = normalize(text);
	const inTokens = norm
		.split(/\s+/)
		.filter((t) => t.length > 0 && !STOP_WORDS.has(t));

	if (inTokens.length === 0) {
		return { status: 'not-found' };
	}

	const scored = visibleTasks
		.map((task) => ({ task, score: scoreTitle(inTokens, normalize(task.title)) }))
		.filter((s) => s.score >= TASK_ID_THRESHOLD)
		.sort(compareScored);

	if (scored.length === 0) {
		return { status: 'not-found' };
	}

	const top = scored[0];
	const second = scored[1];

	if (second && top.score - second.score < AMBIGUITY_MARGIN) {
		const tied = scored
			.filter((s) => top.score - s.score < AMBIGUITY_MARGIN)
			.slice(0, MAX_CANDIDATES);
		return {
			status: 'ambiguous',
			candidates: tied.map((s) => ({
				value: s.task.id,
				label: `${s.task.title} (${s.task.id})`,
				confidence: s.score
			}))
		};
	}

	return { status: 'resolved', value: top.task.id, confidence: top.score };
};

/**
 * Score a tokenized utterance against a normalized title. Each input token
 * contributes its best per-title-token score; the average is returned. Stop
 * words have already been stripped from `inTokens`.
 *
 * Per-token weighting:
 *   exact match            → 1.00
 *   levenshtein ≤ 1 (≥4ch) → 0.85   (typo-tolerance for longer words)
 *   prefix match (≥3ch)    → 0.70   ("auth" matches "authorization")
 *   substring (≥3ch)       → 0.55   (last-resort partial)
 *   no match               → 0
 */
function scoreTitle(inTokens: string[], normalizedTitle: string): number {
	const titleTokens = normalizedTitle.split(/\s+/).filter(Boolean);
	if (titleTokens.length === 0) return 0;

	let total = 0;
	for (const tok of inTokens) {
		let best = 0;
		for (const tt of titleTokens) {
			let s = 0;
			if (tok === tt) {
				s = 1.0;
			} else if (Math.min(tok.length, tt.length) >= 4 && levenshtein(tok, tt) <= 1) {
				s = 0.85;
			} else if (tok.length >= 3 && tt.startsWith(tok)) {
				s = 0.7;
			} else if (tok.length >= 3 && tt.includes(tok)) {
				s = 0.55;
			}
			if (s > best) best = s;
		}
		total += best;
	}
	return total / inTokens.length;
}

function compareScored(
	a: { task: VisibleTask; score: number },
	b: { task: VisibleTask; score: number }
): number {
	if (b.score !== a.score) return b.score - a.score;
	// Tiebreak: lower priority number (P0 wins over P4)
	const pa = a.task.priority ?? 999;
	const pb = b.task.priority ?? 999;
	if (pa !== pb) return pa - pb;
	// Then more recently updated
	const ua = a.task.updated_at ? Date.parse(a.task.updated_at) : 0;
	const ub = b.task.updated_at ? Date.parse(b.task.updated_at) : 0;
	return ub - ua;
}
