/**
 * `use:peek` — opt-in Space-to-preview action.
 *
 * Attach to the same container that holds your `[data-nav-id]` items (i.e. the
 * container you pass to `createListNav`). The action listens for Space at the
 * window level, finds the currently focused listNav item (`.jk-focused` +
 * `data-nav-id`), and toggles the peek drawer via `peekStore`.
 *
 * When peek is already open and the user presses j/k (handled by listNav),
 * this action's mutation observer detects the focus class moving and updates
 * the drawer content in place — no manual wiring needed in the route.
 *
 * Example:
 *
 *   <div bind:this={listEl} use:peek>
 *     {#each tasks as t}
 *       <button data-nav-id={t.id}>{t.title}</button>
 *     {/each}
 *   </div>
 *
 * Options:
 *   - `enabled`: turn the action off without unmounting (default true)
 *   - `onToggle`: notified when peek opens/closes (for route analytics)
 *   - `itemSelector`: override the `[data-nav-id]` selector
 *   - `focusedClass`: override the `jk-focused` class listNav applies
 */

import type { Action } from 'svelte/action';
import { togglePeek, setPeek, isPeekOpen, closePeek } from '$lib/stores/peekStore.svelte';

export interface PeekActionOptions {
	enabled?: boolean;
	itemSelector?: string;
	focusedClass?: string;
	onToggle?: (open: boolean, navId: string | null) => void;
}

function isTypingTarget(t: EventTarget | null): boolean {
	if (!(t instanceof HTMLElement)) return false;
	const tag = t.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
	if (t.isContentEditable) return true;
	return false;
}

function findFocusedNavId(
	container: HTMLElement,
	itemSelector: string,
	focusedClass: string,
): string | null {
	const el = container.querySelector<HTMLElement>(`.${focusedClass}`);
	if (!el) return null;
	if (itemSelector && !el.matches(itemSelector)) return null;
	return el.dataset.navId ?? null;
}

export const peek: Action<HTMLElement, PeekActionOptions | undefined> = (node, initial) => {
	let opts: PeekActionOptions = initial ?? {};
	const focusedClass = () => opts.focusedClass ?? 'jk-focused';
	const itemSelector = () => opts.itemSelector ?? '[data-nav-id]';

	function handleKeydown(e: KeyboardEvent) {
		if (opts.enabled === false) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (isTypingTarget(e.target)) return;
		if (e.key !== ' ') return;

		// Only claim Space when there's a focused item *inside this container*.
		// Other listNav instances on the same page (e.g. a sidebar) are not
		// peek-opted-in and should continue to see the event normally.
		const focusedEl = node.querySelector<HTMLElement>(`.${focusedClass()}`);
		if (!focusedEl) return;
		if (!focusedEl.matches(itemSelector())) return;
		const navId = focusedEl.dataset.navId;
		if (!navId) return;

		// Intercept Space BEFORE listNav's own window-level listener fires so
		// Space triggers peek instead of listNav's onSelect (which would open
		// the full TaskDetailDrawer). Enter still flows through to onSelect
		// because we only guard `key === ' '`.
		e.preventDefault();
		e.stopImmediatePropagation();
		togglePeek(navId);
		opts.onToggle?.(isPeekOpen(), isPeekOpen() ? navId : null);
	}

	// When peek is open, follow the focused item as j/k moves it.
	const observer = new MutationObserver(() => {
		if (!isPeekOpen()) return;
		if (opts.enabled === false) return;
		const navId = findFocusedNavId(node, itemSelector(), focusedClass());
		if (navId) setPeek(navId);
	});

	observer.observe(node, {
		subtree: true,
		attributes: true,
		attributeFilter: ['class'],
	});

	// Capture phase so we run before listNav's bubble-phase window listener.
	window.addEventListener('keydown', handleKeydown, { capture: true });

	return {
		update(next) {
			opts = next ?? {};
		},
		destroy() {
			observer.disconnect();
			window.removeEventListener('keydown', handleKeydown, { capture: true });
			// Don't auto-close peek on unmount — the drawer is a global
			// singleton and the user may want to keep it open when navigating.
			void closePeek; // keep import referenced for tree-shaking tests
		},
	};
};
