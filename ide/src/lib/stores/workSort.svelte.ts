/**
 * Work Sort Store
 * Shared state for SessionPanel sort options, used by TopBar and SessionPanel.
 * Persists to localStorage AND URL params for bookmarkable views.
 *
 * URL params: ?sort=priority&dir=desc
 * Priority: URL params > localStorage > defaults
 */

import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export type SortOption = 'state' | 'priority' | 'created' | 'cost' | 'manual';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
	value: SortOption;
	label: string;
	icon: string;
	defaultDir: SortDirection;
}

export const SORT_OPTIONS: SortConfig[] = [
	{ value: 'state', label: 'State', icon: '🔔', defaultDir: 'asc' },
	{ value: 'priority', label: 'Priority', icon: '⚡', defaultDir: 'asc' },
	{ value: 'created', label: 'Time', icon: '⏱', defaultDir: 'desc' },
	{ value: 'cost', label: 'Cost', icon: '💰', defaultDir: 'desc' },
	{ value: 'manual', label: 'Manual', icon: '✋', defaultDir: 'asc' }
];

// Storage keys
const SORT_STORAGE_KEY = 'work-panel-sort';
const SORT_DIR_STORAGE_KEY = 'work-panel-sort-dir';

// URL param keys
const URL_SORT_KEY = 'sort';
const URL_DIR_KEY = 'dir';

// Reactive state
let sortBy = $state<SortOption>('state');
let sortDir = $state<SortDirection>('asc');
let initialized = $state(false);

// Helper to validate sort option
function isValidSortOption(value: string | null): value is SortOption {
	return value !== null && SORT_OPTIONS.some(o => o.value === value);
}

// Helper to validate sort direction
function isValidSortDirection(value: string | null): value is SortDirection {
	return value === 'asc' || value === 'desc';
}

// Update URL params without triggering navigation
function updateUrlParams(sort: SortOption, dir: SortDirection): void {
	if (!browser) return;

	const url = new URL(window.location.href);

	// Only set URL params if they differ from defaults (keep URL clean)
	const defaultSort = 'state';
	const defaultDir = 'asc';

	if (sort !== defaultSort || dir !== defaultDir) {
		url.searchParams.set(URL_SORT_KEY, sort);
		url.searchParams.set(URL_DIR_KEY, dir);
	} else {
		// Remove params if using defaults
		url.searchParams.delete(URL_SORT_KEY);
		url.searchParams.delete(URL_DIR_KEY);
	}

	// Use replaceState to update URL without navigation
	goto(url.pathname + url.search, { replaceState: true, keepFocus: true, noScroll: true });
}

// Initialize from URL params, falling back to localStorage
export function initSort(): void {
	if (!browser || initialized) return;

	// Try URL params first (highest priority for bookmarkable views)
	const urlParams = new URLSearchParams(window.location.search);
	const urlSort = urlParams.get(URL_SORT_KEY);
	const urlDir = urlParams.get(URL_DIR_KEY);

	if (isValidSortOption(urlSort)) {
		sortBy = urlSort;
	} else {
		// Fall back to localStorage
		const savedSort = localStorage.getItem(SORT_STORAGE_KEY) as SortOption | null;
		if (savedSort && SORT_OPTIONS.some(o => o.value === savedSort)) {
			sortBy = savedSort;
		}
	}

	if (isValidSortDirection(urlDir)) {
		sortDir = urlDir;
	} else {
		// Fall back to localStorage
		const savedDir = localStorage.getItem(SORT_DIR_STORAGE_KEY) as SortDirection | null;
		if (savedDir && (savedDir === 'asc' || savedDir === 'desc')) {
			sortDir = savedDir;
		}
	}

	initialized = true;
}

// Handle sort change - toggle direction if same, switch to new sort otherwise
export function handleSortClick(value: SortOption): void {
	if (sortBy === value) {
		// Same button - toggle direction
		sortDir = sortDir === 'asc' ? 'desc' : 'asc';
	} else {
		// Different button - switch sort and use its default direction
		sortBy = value;
		const opt = SORT_OPTIONS.find(o => o.value === value);
		sortDir = opt?.defaultDir ?? 'asc';
	}

	// Persist to localStorage
	if (browser) {
		localStorage.setItem(SORT_STORAGE_KEY, sortBy);
		localStorage.setItem(SORT_DIR_STORAGE_KEY, sortDir);
	}

	// Update URL params for bookmarkable views
	updateUrlParams(sortBy, sortDir);
}

// Getters for reactive access
export function getSortBy(): SortOption {
	return sortBy;
}

export function getSortDir(): SortDirection {
	return sortDir;
}

// For direct reactive binding in components
export function getSortState(): { sortBy: SortOption; sortDir: SortDirection } {
	return { sortBy, sortDir };
}

// Export reactive state object with getters for cross-module reactivity
// Components should use workSortState.sortBy and workSortState.sortDir in $derived
export const workSortState = {
	get sortBy() {
		return sortBy;
	},
	get sortDir() {
		return sortDir;
	}
};
