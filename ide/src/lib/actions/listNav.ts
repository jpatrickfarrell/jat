/**
 * Shared keyboard-navigation action + composable for list-like UIs.
 *
 * Handles j/k and ArrowDown/ArrowUp with wraparound, Enter/Space to trigger
 * a select callback, and Escape to clear focus. Skips events coming from
 * input fields (input, textarea, select, contenteditable) and events with
 * Ctrl/Meta/Alt so it does not interfere with browser or app shortcuts.
 *
 * Usage — action form (simplest):
 *
 *   <div use:listNav={{
 *     onSelect: (el, idx) => openDetail(el.dataset.navId!),
 *     onEscape: () => closeDetail(),
 *   }}>
 *     {#each items as item}
 *       <button data-nav-id={item.id}>{item.title}</button>
 *     {/each}
 *   </div>
 *
 * Usage — composable form (when you already have a keydown handler):
 *
 *   const nav = createListNav({
 *     getItems: () => Array.from(container.querySelectorAll('[data-nav-id]')),
 *     onSelect: (el) => openDetail(el.dataset.navId!),
 *   });
 *
 *   function onKeydown(e: KeyboardEvent) {
 *     if (nav.handleKeydown(e)) return;
 *     // ...page-specific shortcuts
 *   }
 */

import type { Action } from 'svelte/action';

export interface ListNavOptions {
	/**
	 * Return the navigable HTML elements in list order. Called on every
	 * navigation event so reactive lists stay in sync. When omitted in the
	 * action form, the action queries the node itself using {@link itemSelector}.
	 */
	getItems?: () => HTMLElement[] | ArrayLike<HTMLElement>;
	/** CSS selector used by the action to locate items. Default: `[data-nav-id]`. */
	itemSelector?: string;
	/** Fired when Enter or Space is pressed on the focused item. */
	onSelect?: (item: HTMLElement, index: number) => void;
	/** Fired when Escape is pressed. Default behaviour: clears focus. */
	onEscape?: () => void;
	/** Fired whenever the focused index changes (including cleared focus). */
	onFocusChange?: (item: HTMLElement | null, index: number) => void;
	/** When true, j at the last item wraps to first (and vice-versa). Default: true. */
	wraparound?: boolean;
	/** Class applied to the currently focused item. Default: `jk-focused`. */
	focusedClass?: string;
	/** When false, all shortcuts no-op. Default: true. */
	enabled?: boolean;
	/** Action-only. When true, listen on window; when false, on the node. Default: true. */
	global?: boolean;
}

export interface KeyboardShortcut {
	key: string;
	description: string;
}

export interface ListNavController {
	/** Returns true if the event was handled (preventDefault was called). */
	handleKeydown(event: KeyboardEvent): boolean;
	focusedIndex(): number;
	focus(index: number): void;
	focusFirst(): void;
	focusLast(): void;
	clear(): void;
	/** Re-apply the focused class after items change (e.g. after a filter). */
	refresh(): void;
}

function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
	return target.isContentEditable;
}

function hasModifier(e: KeyboardEvent): boolean {
	return e.ctrlKey || e.metaKey || e.altKey;
}

interface OptionsRef {
	current: ListNavOptions;
}

function resolveItems(optsRef: OptionsRef): HTMLElement[] {
	const getItems = optsRef.current.getItems;
	if (!getItems) return [];
	const result = getItems();
	return Array.isArray(result) ? result : Array.from(result);
}

function makeController(optsRef: OptionsRef): ListNavController {
	let focused = -1;
	let lastEl: HTMLElement | null = null;

	function focusedClass(): string {
		return optsRef.current.focusedClass ?? 'jk-focused';
	}

	function apply(items: HTMLElement[], idx: number) {
		const cls = focusedClass();
		const next = items[idx] ?? null;
		if (lastEl && lastEl !== next) lastEl.classList.remove(cls);
		if (next) {
			next.classList.add(cls);
			next.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
		}
		lastEl = next;
		focused = next ? idx : -1;
		optsRef.current.onFocusChange?.(next, focused);
	}

	function focus(idx: number) {
		const items = resolveItems(optsRef);
		if (items.length === 0) return;
		apply(items, Math.max(0, Math.min(items.length - 1, idx)));
	}

	function focusFirst() {
		focus(0);
	}

	function focusLast() {
		const items = resolveItems(optsRef);
		if (items.length) apply(items, items.length - 1);
	}

	function clear() {
		if (lastEl) lastEl.classList.remove(focusedClass());
		lastEl = null;
		focused = -1;
		optsRef.current.onFocusChange?.(null, -1);
	}

	function refresh() {
		const items = resolveItems(optsRef);
		if (items.length === 0) {
			clear();
			return;
		}
		// Re-home the focused element if the old node has been removed.
		if (lastEl && !items.includes(lastEl)) {
			const newIdx = Math.min(focused, items.length - 1);
			apply(items, Math.max(0, newIdx));
		} else if (focused >= 0 && focused < items.length) {
			apply(items, focused);
		}
	}

	function handleKeydown(e: KeyboardEvent): boolean {
		const opts = optsRef.current;
		if (opts.enabled === false) return false;
		if (isTypingTarget(e.target)) return false;
		if (hasModifier(e)) return false;

		const items = resolveItems(optsRef);
		const wrap = opts.wraparound ?? true;

		switch (e.key) {
			case 'j':
			case 'ArrowDown': {
				if (items.length === 0) return false;
				e.preventDefault();
				const next = focused < 0 ? 0 : focused + 1;
				if (next >= items.length) apply(items, wrap ? 0 : items.length - 1);
				else apply(items, next);
				return true;
			}
			case 'k':
			case 'ArrowUp': {
				if (items.length === 0) return false;
				e.preventDefault();
				const next = focused < 0 ? items.length - 1 : focused - 1;
				if (next < 0) apply(items, wrap ? items.length - 1 : 0);
				else apply(items, next);
				return true;
			}
			case 'Enter':
			case ' ': {
				if (focused < 0) return false;
				const el = items[focused];
				if (!el) return false;
				e.preventDefault();
				opts.onSelect?.(el, focused);
				return true;
			}
			case 'Escape': {
				if (focused < 0 && !opts.onEscape) return false;
				e.preventDefault();
				if (opts.onEscape) opts.onEscape();
				else clear();
				return true;
			}
		}
		return false;
	}

	return {
		handleKeydown,
		focusedIndex: () => focused,
		focus,
		focusFirst,
		focusLast,
		clear,
		refresh
	};
}

/**
 * Imperative composable — use when you already own a keydown handler and want
 * listNav to decide whether to consume the event.
 */
export function createListNav(options: ListNavOptions): ListNavController {
	const ref: OptionsRef = { current: options };
	return makeController(ref);
}

/**
 * Svelte action — attaches a keydown listener (window by default) and handles
 * j/k/ArrowDown/ArrowUp/Enter/Space/Escape navigation over children of `node`.
 */
export const listNav: Action<HTMLElement, ListNavOptions | undefined> = (node, initial = {}) => {
	const ref: OptionsRef = { current: withDefaultGetItems(node, initial) };
	const controller = makeController(ref);

	let target: EventTarget = ref.current.global === false ? node : window;

	function onKeydown(e: KeyboardEvent) {
		controller.handleKeydown(e);
	}

	function attach() {
		target = ref.current.global === false ? node : window;
		target.addEventListener('keydown', onKeydown as EventListener);
	}

	function detach() {
		target.removeEventListener('keydown', onKeydown as EventListener);
	}

	attach();

	return {
		update(next: ListNavOptions | undefined = {}) {
			const wasGlobal = ref.current.global !== false;
			ref.current = withDefaultGetItems(node, next);
			const isGlobal = ref.current.global !== false;
			if (wasGlobal !== isGlobal) {
				detach();
				attach();
			}
			controller.refresh();
		},
		destroy() {
			detach();
			controller.clear();
		}
	};
};

function withDefaultGetItems(node: HTMLElement, options: ListNavOptions): ListNavOptions {
	if (options.getItems) return options;
	const selector = options.itemSelector ?? '[data-nav-id]';
	return {
		...options,
		getItems: () => Array.from(node.querySelectorAll<HTMLElement>(selector))
	};
}
