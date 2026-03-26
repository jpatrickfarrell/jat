/**
 * Swipe-to-reveal action configuration for mobile session cards.
 *
 * Users can assign any session action to left/right swipe directions.
 * Persisted to localStorage.
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'mobile-swipe-actions';

export interface SwipeActionDef {
	id: string;
	label: string;
	icon: string; // SVG path (24x24 viewBox, stroke)
	color: string; // oklch background color
	variant: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export interface SwipeConfig {
	rightSwipe: string; // action ID for left-to-right swipe
	leftSwipe: string;  // action ID for right-to-left swipe
}

/** All available actions that can be assigned to swipe gestures */
export const SWIPE_ACTION_CATALOG: Record<string, SwipeActionDef> = {
	'complete': {
		id: 'complete',
		label: 'Complete',
		icon: 'M4.5 12.75l6 6 9-13.5',
		color: 'oklch(0.50 0.15 145)',
		variant: 'success'
	},
	'attach': {
		id: 'attach',
		label: 'Attach',
		icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244',
		color: 'oklch(0.55 0.15 240)',
		variant: 'info'
	},
	'view-task': {
		id: 'view-task',
		label: 'Details',
		icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
		color: 'oklch(0.50 0.12 270)',
		variant: 'default'
	},
	'pause': {
		id: 'pause',
		label: 'Pause',
		icon: 'M15.75 5.25v13.5m-7.5-13.5v13.5',
		color: 'oklch(0.55 0.12 75)',
		variant: 'warning'
	},
	'kill': {
		id: 'kill',
		label: 'Kill',
		icon: 'M6 18L18 6M6 6l12 12',
		color: 'oklch(0.50 0.15 25)',
		variant: 'error'
	},
	'interrupt': {
		id: 'interrupt',
		label: 'Interrupt',
		icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
		color: 'oklch(0.55 0.15 60)',
		variant: 'warning'
	}
};

const DEFAULT_CONFIG: SwipeConfig = {
	rightSwipe: 'complete',
	leftSwipe: 'view-task'
};

let currentConfig: SwipeConfig = { ...DEFAULT_CONFIG };

export function initSwipeActions(): void {
	if (!browser) return;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			if (parsed.rightSwipe && parsed.rightSwipe in SWIPE_ACTION_CATALOG) {
				currentConfig.rightSwipe = parsed.rightSwipe;
			}
			if (parsed.leftSwipe && parsed.leftSwipe in SWIPE_ACTION_CATALOG) {
				currentConfig.leftSwipe = parsed.leftSwipe;
			}
		} catch { /* use defaults */ }
	}
}

function save(): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
}

export function getSwipeConfig(): SwipeConfig {
	return { ...currentConfig };
}

export function setSwipeAction(direction: 'rightSwipe' | 'leftSwipe', actionId: string): void {
	if (!(actionId in SWIPE_ACTION_CATALOG)) return;
	currentConfig[direction] = actionId;
	save();
}

export function resetSwipeActions(): void {
	currentConfig = { ...DEFAULT_CONFIG };
	save();
}

export function getSwipeActionDef(actionId: string): SwipeActionDef | undefined {
	return SWIPE_ACTION_CATALOG[actionId];
}
