/**
 * Shared keyboard-navigation action + composable for list-like UIs.
 *
 * Base motions — j/k / ArrowDown/ArrowUp with wraparound, Enter/Space to
 * trigger select, Escape to clear focus. Typing targets (input, textarea,
 * select, contenteditable) and most modifier combos are skipped so the
 * shortcuts never interfere with typing or app-level keybindings.
 *
 * Vim-motion layer (always on):
 *
 *   gg           jump to first item
 *   G            jump to last item
 *   {n}j / {n}k  move `n` items (count-prefix buffer with 1.5s timeout)
 *   {n}G, {n}gg  jump to 1-indexed line `n` (clamped to list length)
 *   Ctrl+D / Ctrl+U  move roughly half a viewport's worth of items
 *   zz           scroll the focused item to the centre of its viewport
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

/** How long a half-typed motion (count prefix, pending `g`, pending `z`) waits
 *  for its completion before resetting. Matches Vim's default `timeoutlen`. */
const MOTION_BUFFER_TIMEOUT_MS = 1500;

/** Upper cap so `99999j` can't produce pathological math. Above any list size
 *  you'd reasonably navigate with j/k. */
const MAX_COUNT = 99999;

/** Fallback half-page size when we can't measure the viewport (SSR, jsdom
 *  without layout, items not yet attached). */
const DEFAULT_HALF_PAGE = 5;

function isTypingTarget(target: EventTarget | null): boolean {
	if (typeof HTMLElement === 'undefined') return false;
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

function wrapIndex(next: number, length: number, wrap: boolean): number {
	if (length === 0) return -1;
	if (next < 0) return wrap ? ((next % length) + length) % length : 0;
	if (next >= length) return wrap ? next % length : length - 1;
	return next;
}

/**
 * Estimate how many list items fit in one "page" of the nearest scrollable
 * ancestor, then halve it. Used for Ctrl+D / Ctrl+U. Returns {@link DEFAULT_HALF_PAGE}
 * when layout isn't available (SSR, jsdom, detached elements).
 */
function getHalfPageSize(items: HTMLElement[], currentIdx: number): number {
	if (items.length === 0) return 0;
	try {
		const pivot =
			items[Math.max(0, Math.min(items.length - 1, currentIdx))] ?? items[0];
		if (!pivot || typeof window === 'undefined') return DEFAULT_HALF_PAGE;

		// Walk up looking for an ancestor that is actually scrolling.
		let scroller: HTMLElement | null = pivot.parentElement;
		while (scroller) {
			const cs = window.getComputedStyle(scroller);
			if (
				(cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
				scroller.clientHeight > 0 &&
				scroller.clientHeight < scroller.scrollHeight
			) {
				break;
			}
			scroller = scroller.parentElement;
		}

		const viewportHeight = scroller?.clientHeight ?? window.innerHeight;
		const itemHeight = pivot.getBoundingClientRect().height;
		if (viewportHeight > 0 && itemHeight > 0) {
			const fullPage = Math.max(1, Math.floor(viewportHeight / itemHeight));
			return Math.max(1, Math.floor(fullPage / 2));
		}
	} catch {
		// Fall through to default.
	}
	return DEFAULT_HALF_PAGE;
}

function makeController(optsRef: OptionsRef): ListNavController {
	let focused = -1;
	let lastEl: HTMLElement | null = null;

	// Motion-buffer state. A motion is "pending" until its follow-up key
	// arrives (e.g. the second `g` in `gg`) or the buffer times out.
	let pendingCount: number | null = null;
	let pendingG = false;
	let pendingZ = false;
	let bufferTimer: ReturnType<typeof setTimeout> | null = null;

	function clearBufferTimer() {
		if (bufferTimer !== null) {
			clearTimeout(bufferTimer);
			bufferTimer = null;
		}
	}

	function clearPending() {
		pendingCount = null;
		pendingG = false;
		pendingZ = false;
		clearBufferTimer();
	}

	function bumpTimer() {
		clearBufferTimer();
		if (typeof setTimeout !== 'undefined') {
			bufferTimer = setTimeout(clearPending, MOTION_BUFFER_TIMEOUT_MS);
		}
	}

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
		clearPending();
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

		const items = resolveItems(optsRef);
		const wrap = opts.wraparound ?? true;

		// Ctrl+D / Ctrl+U — half-page motion. Intercepted before the generic
		// Ctrl/Meta/Alt bailout so vim half-page works; every other modifier
		// combination still falls through untouched.
		if (e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
			const lower = e.key.toLowerCase();
			if (lower === 'd' || lower === 'u') {
				if (items.length === 0) return false;
				e.preventDefault();
				const half = getHalfPageSize(items, focused);
				const dir = lower === 'd' ? 1 : -1;
				const start = focused < 0 ? (dir > 0 ? 0 : items.length - 1) : focused;
				apply(items, wrapIndex(start + dir * half, items.length, wrap));
				clearPending();
				return true;
			}
		}

		if (hasModifier(e)) return false;

		// Count prefix. A leading `0` is intentionally pass-through so
		// consumers can still bind `0` themselves; subsequent digits within
		// an already-started count (e.g. `10j`) are accumulated normally.
		if (e.key.length === 1 && e.key >= '0' && e.key <= '9') {
			if (pendingCount === null && e.key === '0') return false;
			e.preventDefault();
			pendingCount = (pendingCount ?? 0) * 10 + Number(e.key);
			if (pendingCount > MAX_COUNT) pendingCount = MAX_COUNT;
			pendingG = false;
			pendingZ = false;
			bumpTimer();
			return true;
		}

		// gg — jump to first item (or to line {count} when a count is pending).
		if (e.key === 'g' && !e.shiftKey) {
			if (items.length === 0) {
				clearPending();
				return false;
			}
			e.preventDefault();
			if (pendingG) {
				const target =
					pendingCount !== null
						? Math.max(0, Math.min(items.length - 1, pendingCount - 1))
						: 0;
				apply(items, target);
				clearPending();
			} else {
				pendingG = true;
				pendingZ = false;
				bumpTimer();
			}
			return true;
		}

		// G — jump to last item (or to line {count}).
		if (e.key === 'G') {
			if (items.length === 0) {
				clearPending();
				return false;
			}
			e.preventDefault();
			const target =
				pendingCount !== null
					? Math.max(0, Math.min(items.length - 1, pendingCount - 1))
					: items.length - 1;
			apply(items, target);
			clearPending();
			return true;
		}

		// zz — centre the focused item in its viewport.
		if (e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			if (pendingZ) {
				const el = lastEl ?? items[focused] ?? null;
				el?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
				clearPending();
			} else {
				pendingZ = true;
				pendingG = false;
				bumpTimer();
			}
			return true;
		}

		switch (e.key) {
			case 'j':
			case 'ArrowDown': {
				if (items.length === 0) return false;
				e.preventDefault();
				const step = pendingCount ?? 1;
				// From an unfocused state, `{n}j` selects the n-th item
				// (1-indexed) so it mirrors `{n}G` from the top.
				const target = focused < 0 ? step - 1 : focused + step;
				apply(items, wrapIndex(target, items.length, wrap));
				clearPending();
				return true;
			}
			case 'k':
			case 'ArrowUp': {
				if (items.length === 0) return false;
				e.preventDefault();
				const step = pendingCount ?? 1;
				const target = focused < 0 ? items.length - step : focused - step;
				apply(items, wrapIndex(target, items.length, wrap));
				clearPending();
				return true;
			}
			case 'Enter':
			case ' ': {
				if (focused < 0) return false;
				const el = items[focused];
				if (!el) return false;
				e.preventDefault();
				clearPending();
				opts.onSelect?.(el, focused);
				return true;
			}
			case 'Escape': {
				// Cancel a half-typed motion first — matches vim's behaviour
				// where Esc drops the count prefix without moving the cursor.
				if (pendingCount !== null || pendingG || pendingZ) {
					e.preventDefault();
					clearPending();
					return true;
				}
				if (focused < 0 && !opts.onEscape) return false;
				e.preventDefault();
				if (opts.onEscape) opts.onEscape();
				else clear();
				return true;
			}
		}

		// Any other key terminates a half-typed motion so `gx`, `5x`, or
		// `zx` don't leave stale state around.
		if (pendingCount !== null || pendingG || pendingZ) clearPending();
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
