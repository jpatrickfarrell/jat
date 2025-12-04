/**
 * Sparkline Preferences Utility
 *
 * Manages user preferences for sparkline visibility in the TopBar.
 * Uses localStorage for persistence.
 */

const SPARKLINE_VISIBLE_KEY = 'sparkline-visible';

/**
 * Check if sparkline is visible (default: true)
 */
export function isSparklineVisible(): boolean {
	if (typeof window === 'undefined') return true;
	const stored = localStorage.getItem(SPARKLINE_VISIBLE_KEY);
	// Default to visible if not set
	return stored === null ? true : stored === 'true';
}

/**
 * Show the sparkline
 */
export function showSparkline(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(SPARKLINE_VISIBLE_KEY, 'true');
	window.dispatchEvent(new CustomEvent('sparkline-visibility-changed', { detail: true }));
}

/**
 * Hide the sparkline
 */
export function hideSparkline(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(SPARKLINE_VISIBLE_KEY, 'false');
	window.dispatchEvent(new CustomEvent('sparkline-visibility-changed', { detail: false }));
}

/**
 * Toggle sparkline visibility
 */
export function toggleSparkline(): boolean {
	const newState = !isSparklineVisible();
	if (newState) {
		showSparkline();
	} else {
		hideSparkline();
	}
	return newState;
}
