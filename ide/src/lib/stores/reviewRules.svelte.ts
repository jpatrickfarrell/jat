/**
 * Review Rules Store
 *
 * Centralized store for review rules configuration.
 * Fetched once by layout and accessible throughout the app.
 */

import type { ReviewRule } from '$lib/utils/reviewStatusUtils';

// Reactive state
let reviewRulesState = $state<ReviewRule[]>([]);
let isLoaded = $state(false);

/**
 * Get the current review rules
 */
export function getReviewRules(): ReviewRule[] {
	return reviewRulesState;
}

/**
 * Check if review rules have been loaded
 */
export function getIsLoaded(): boolean {
	return isLoaded;
}

/**
 * Set the review rules (called by layout after fetch)
 */
export function setReviewRules(rules: ReviewRule[]): void {
	reviewRulesState = rules;
	isLoaded = true;
}

/**
 * Fetch and set review rules from API
 */
export async function fetchReviewRules(): Promise<ReviewRule[]> {
	try {
		const response = await fetch('/api/review-rules');
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const data = await response.json();
		const rules = data.rules || [];
		setReviewRules(rules);
		return rules;
	} catch (error) {
		console.error('Failed to fetch review rules:', error);
		setReviewRules([]);
		return [];
	}
}
