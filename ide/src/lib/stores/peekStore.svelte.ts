/**
 * Peek drawer state.
 *
 * Peek is a lightweight 40vw right drawer that previews the currently focused
 * listNav item. Routes opt in by attaching the `use:peek` action to their list
 * container; Space toggles, a second Space or Esc closes, and j/k continues to
 * navigate underneath the drawer — the content swaps in place without
 * re-rendering the list.
 *
 * Distinct from the existing TaskDetailDrawer: that opens on Enter for a full
 * detail view. Peek is a faster, more ephemeral preview.
 */

import { tick } from 'svelte';

let peekNavId = $state<string | null>(null);
let peekOpenedAt = $state(0);

export function getPeekNavId(): string | null {
	return peekNavId;
}

export function isPeekOpen(): boolean {
	return peekNavId !== null;
}

export function openPeek(navId: string): void {
	if (!navId) return;
	peekNavId = navId;
	peekOpenedAt = Date.now();
}

export function closePeek(): void {
	peekNavId = null;
}

/**
 * Toggle peek for a given navId:
 * - closed          → open with navId
 * - open, same id   → close
 * - open, other id  → swap to the new id (no close/open flicker)
 */
export function togglePeek(navId: string): void {
	if (!navId) return;
	if (peekNavId === navId) {
		closePeek();
	} else {
		openPeek(navId);
	}
}

/**
 * Force peek to a new id without toggling — used by `use:peek` when j/k moves
 * focus while peek is already open, so the drawer follows the focus.
 */
export function setPeek(navId: string): void {
	if (!navId || peekNavId === navId) return;
	peekNavId = navId;
}

/** Reactive getter for components that need a $derived value. */
export const peekState = {
	get navId() {
		return peekNavId;
	},
	get isOpen() {
		return peekNavId !== null;
	},
	get openedAt() {
		return peekOpenedAt;
	},
};

/** Scroll the focused item back into view after drawer opens (40vw shift). */
export async function scrollFocusedIntoView(): Promise<void> {
	await tick();
	const el = document.querySelector<HTMLElement>('.jk-focused');
	if (!el) return;
	const rect = el.getBoundingClientRect();
	const viewportH = window.innerHeight;
	if (rect.top < 0 || rect.bottom > viewportH) {
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
}
