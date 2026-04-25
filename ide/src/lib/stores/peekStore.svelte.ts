/**
 * Peek drawer state.
 *
 * Peek is a lightweight 40vw right drawer that previews the currently focused
 * listNav item. The system is global by default: a single `<PeekDrawer />`
 * mounted in the root layout listens for Space at the window-capture phase,
 * finds the focused `[data-nav-id]` element (`.jk-focused`), and toggles peek
 * for that id. j/k continues to navigate underneath; content swaps in place.
 *
 * Routes can opt OUT by setting `data-peek="false"` on a list container
 * (e.g. /servers, where Space means play/pause). Opt out is the only thing
 * routes need to think about — there is no `use:peek` action.
 *
 * Mental model: Space = glance, Enter = commit. Enter while peek is open
 * promotes — closes peek and lets listNav's onSelect fire to open the full
 * detail view.
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
 * Force peek to a new id without toggling — used by the global PeekDrawer
 * MutationObserver when j/k moves focus while peek is already open, so the
 * drawer follows the focus.
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
