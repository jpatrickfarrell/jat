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
 * Selection layer (opt-in via `selectable: true`):
 *
 *   V              toggle visual mode (anchor at current focus, selects it)
 *   j / k          while visual mode is on, also extends the range from anchor
 *   x              toggle selection of the focused item (no movement)
 *   Shift+J / K    toggle current + move down/up + toggle new focus (range-build)
 *   *              toggle select-all of the currently visible items
 *   Escape         backs out one layer at a time:
 *                    pending motion → visual mode → selection → focus / onEscape
 *
 *   Selected items get the `selected-class` (default `jk-selected`) so pages
 *   can style them. The controller exposes selectedIds()/clearSelection()/
 *   selectAll()/toggleSelection()/isSelecting() and fires onSelectionChange
 *   whenever the set mutates. A floating `BulkActionBar` is the canonical
 *   chip for surfacing the count + per-route bulk actions.
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
 *     selectable: true,
 *     onSelectionChange: (ids) => { selectedIds = ids; },
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

	// --- Selection layer (opt-in) -------------------------------------------------

	/**
	 * Enable the selection layer (V / Shift+J / Shift+K / x / *). Default: false.
	 * When false, those keys pass through unhandled so pages can keep them.
	 */
	selectable?: boolean;
	/** Class applied to selected items. Default: `jk-selected`. */
	selectedClass?: string;
	/** Fires whenever the selection set mutates. Receives a fresh Set snapshot. */
	onSelectionChange?: (ids: Set<string>) => void;
	/**
	 * Resolve an item's stable id. Default: `el.dataset.navId`. Override if
	 * your items use a different attribute (e.g. `data-rule-nav-id`).
	 */
	getItemId?: (el: HTMLElement) => string | null | undefined;
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

	// --- Selection layer ---------------------------------------------------------

	/** Read-only snapshot of selected item ids. */
	selectedIds(): Set<string>;
	/** Toggle selection. With no arg, toggles the focused item. */
	toggleSelection(navId?: string): void;
	/** Replace the selection with the given ids (or clear if empty). */
	setSelection(ids: Iterable<string>): void;
	/** Drop the selection and exit visual mode. */
	clearSelection(): void;
	/** Toggle select-all of the currently visible items. */
	selectAll(): void;
	/** True while visual-mode (V) is active. */
	isSelecting(): boolean;
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

	// Selection state. `selected` holds stable ids (from getItemId / data-nav-id)
	// rather than indices, since list filters can shift indices but ids persist.
	// `visualMode` flips on/off via V; while on, j/k extends the range from
	// `visualAnchor` (the index where V was first pressed) to current focus.
	const selected = new Set<string>();
	let visualMode = false;
	let visualAnchor = -1;

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

	function selectedClass(): string {
		return optsRef.current.selectedClass ?? 'jk-selected';
	}

	function getId(el: HTMLElement | null): string | null {
		if (!el) return null;
		const resolver = optsRef.current.getItemId;
		const raw = resolver ? resolver(el) : el.dataset.navId;
		return raw == null ? null : String(raw);
	}

	function applySelectionClasses(items: HTMLElement[]) {
		const cls = selectedClass();
		for (const el of items) {
			const id = getId(el);
			if (id !== null && selected.has(id)) el.classList.add(cls);
			else el.classList.remove(cls);
		}
	}

	function emitSelectionChange() {
		applySelectionClasses(resolveItems(optsRef));
		optsRef.current.onSelectionChange?.(new Set(selected));
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

	/**
	 * Re-derive the selected set from the inclusive range [anchor..focus] while
	 * visual mode is active. Items outside the range that were selected before
	 * V was pressed are preserved (additive — Vim's `V` extends, doesn't reset).
	 */
	function extendVisualRange(items: HTMLElement[]) {
		if (!visualMode || visualAnchor < 0 || focused < 0) return;
		const lo = Math.min(visualAnchor, focused);
		const hi = Math.max(visualAnchor, focused);
		// Add every id in [lo..hi]. Items outside the range are left alone so
		// existing pre-V selections survive moving the anchor to a new region.
		let mutated = false;
		for (let i = lo; i <= hi; i++) {
			const id = getId(items[i] ?? null);
			if (id !== null && !selected.has(id)) {
				selected.add(id);
				mutated = true;
			}
		}
		if (mutated) emitSelectionChange();
		else applySelectionClasses(items);
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
		// Re-paint selection classes — items may have been re-rendered, so the
		// CSS class needs to be re-applied to the new DOM nodes whose ids match.
		applySelectionClasses(items);
	}

	function toggleSelectionByIndex(items: HTMLElement[], idx: number) {
		const id = getId(items[idx] ?? null);
		if (id === null) return;
		if (selected.has(id)) selected.delete(id);
		else selected.add(id);
		emitSelectionChange();
	}

	function exitVisualMode() {
		visualMode = false;
		visualAnchor = -1;
	}

	function handleKeydown(e: KeyboardEvent): boolean {
		const opts = optsRef.current;
		if (opts.enabled === false) return false;
		if (isTypingTarget(e.target)) return false;

		const items = resolveItems(optsRef);
		const wrap = opts.wraparound ?? true;
		const selectable = opts.selectable === true;

		// --- Selection layer (opt-in) ----------------------------------------
		// These keys are only owned by the controller when `selectable` is true,
		// so existing pages without a selection model keep their bindings.
		if (selectable && !hasModifier(e)) {
			// V — toggle visual mode. First press anchors at current focus and
			// selects the focused item; second press exits visual mode while
			// keeping the existing selection (Vim parity for re-entry).
			if (e.key === 'V') {
				if (items.length === 0) return false;
				e.preventDefault();
				if (visualMode) {
					exitVisualMode();
				} else {
					if (focused < 0) apply(items, 0);
					visualMode = true;
					visualAnchor = focused;
					toggleSelectionByIndex(items, focused);
					// If the toggle deselected the anchor, re-add it — entering
					// visual mode should always include the anchor.
					const anchorId = getId(items[focused] ?? null);
					if (anchorId !== null && !selected.has(anchorId)) {
						selected.add(anchorId);
						emitSelectionChange();
					}
				}
				clearPending();
				return true;
			}

			// x — toggle selection of the focused item (no movement, no visual).
			if (e.key === 'x' && !e.shiftKey) {
				if (focused < 0 || items.length === 0) return false;
				e.preventDefault();
				toggleSelectionByIndex(items, focused);
				clearPending();
				return true;
			}

			// * — toggle select-all of currently visible items.
			if (e.key === '*') {
				if (items.length === 0) return false;
				e.preventDefault();
				const allIds: string[] = [];
				for (const el of items) {
					const id = getId(el);
					if (id !== null) allIds.push(id);
				}
				const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
				if (allSelected) {
					for (const id of allIds) selected.delete(id);
				} else {
					for (const id of allIds) selected.add(id);
				}
				emitSelectionChange();
				clearPending();
				return true;
			}

			// Shift+J / Shift+K — toggle current + move down/up + add new focus.
			// Preserves the existing /triage idiom (range-build without entering
			// visual mode). Always wraps within bounds (no wraparound for safety).
			if (e.key === 'J' || e.key === 'K') {
				if (items.length === 0) return false;
				e.preventDefault();
				const dir = e.key === 'J' ? 1 : -1;
				const before = focused < 0 ? (dir > 0 ? 0 : items.length - 1) : focused;
				const beforeId = getId(items[before] ?? null);
				if (beforeId !== null) selected.add(beforeId);
				const afterIdx = Math.max(0, Math.min(items.length - 1, before + dir));
				apply(items, afterIdx);
				const afterId = getId(items[afterIdx] ?? null);
				if (afterId !== null) selected.add(afterId);
				emitSelectionChange();
				clearPending();
				return true;
			}
		}

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
				if (selectable && visualMode) extendVisualRange(items);
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
				if (selectable && visualMode) extendVisualRange(items);
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
				// Selection cascade: visual mode → selection → focus / onEscape.
				// Each Esc backs out one layer so users can stop extending without
				// losing what they've already selected, then Esc again to clear.
				if (selectable && visualMode) {
					e.preventDefault();
					exitVisualMode();
					return true;
				}
				if (selectable && selected.size > 0) {
					e.preventDefault();
					selected.clear();
					emitSelectionChange();
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
		refresh,

		selectedIds: () => new Set(selected),
		toggleSelection: (navId?: string) => {
			const items = resolveItems(optsRef);
			if (navId === undefined) {
				if (focused < 0) return;
				toggleSelectionByIndex(items, focused);
				return;
			}
			if (selected.has(navId)) selected.delete(navId);
			else selected.add(navId);
			emitSelectionChange();
		},
		setSelection: (ids: Iterable<string>) => {
			selected.clear();
			for (const id of ids) selected.add(id);
			emitSelectionChange();
		},
		clearSelection: () => {
			if (selected.size === 0 && !visualMode) return;
			selected.clear();
			exitVisualMode();
			emitSelectionChange();
		},
		selectAll: () => {
			const items = resolveItems(optsRef);
			for (const el of items) {
				const id = getId(el);
				if (id !== null) selected.add(id);
			}
			emitSelectionChange();
		},
		isSelecting: () => visualMode
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
