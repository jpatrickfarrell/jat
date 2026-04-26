// @vitest-environment jsdom
/**
 * Tests for the vim-motion layer added to createListNav. The base j/k/Enter/
 * Escape behaviour is exercised incidentally but the focus here is the new
 * motions: gg, G, {count} prefix, Ctrl+D / Ctrl+U, and zz.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createListNav } from './listNav';

function makeList(count: number): { container: HTMLElement; items: HTMLElement[] } {
	document.body.innerHTML = '';
	const container = document.createElement('div');
	const items: HTMLElement[] = [];
	for (let i = 0; i < count; i++) {
		const el = document.createElement('div');
		el.setAttribute('data-nav-id', String(i));
		el.textContent = `item-${i}`;
		container.appendChild(el);
		items.push(el);
	}
	document.body.appendChild(container);
	return { container, items };
}

function press(key: string, opts: Partial<KeyboardEventInit> = {}): KeyboardEvent {
	return new KeyboardEvent('keydown', { key, cancelable: true, ...opts });
}

beforeEach(() => {
	document.body.innerHTML = '';
});

afterEach(() => {
	vi.useRealTimers();
});

describe('createListNav — vim motions', () => {
	it('gg jumps to the first item', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focusLast();
		expect(nav.focusedIndex()).toBe(9);

		expect(nav.handleKeydown(press('g'))).toBe(true);
		// First `g` is pending — nothing has moved yet.
		expect(nav.focusedIndex()).toBe(9);
		expect(nav.handleKeydown(press('g'))).toBe(true);
		expect(nav.focusedIndex()).toBe(0);
	});

	it('G jumps to the last item', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		expect(nav.handleKeydown(press('G', { shiftKey: true }))).toBe(true);
		expect(nav.focusedIndex()).toBe(9);
	});

	it('{count}j moves n items down', () => {
		const { items } = makeList(20);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(5);
	});

	it('{count}k moves n items up', () => {
		const { items } = makeList(20);
		const nav = createListNav({ getItems: () => items });
		nav.focus(15);

		// Multi-digit counts accumulate until a non-digit motion.
		nav.handleKeydown(press('1'));
		nav.handleKeydown(press('0'));
		nav.handleKeydown(press('k'));
		expect(nav.focusedIndex()).toBe(5);
	});

	it('{count}G jumps to a 1-indexed line', () => {
		const { items } = makeList(20);
		const nav = createListNav({ getItems: () => items });

		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('G', { shiftKey: true }));
		expect(nav.focusedIndex()).toBe(4);
	});

	it('{count}gg jumps to a 1-indexed line', () => {
		const { items } = makeList(20);
		const nav = createListNav({ getItems: () => items });
		nav.focusLast();

		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('g'));
		nav.handleKeydown(press('g'));
		expect(nav.focusedIndex()).toBe(4);
	});

	it('{count}G clamps to the last item when count exceeds list length', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });

		nav.handleKeydown(press('9'));
		nav.handleKeydown(press('9'));
		nav.handleKeydown(press('G', { shiftKey: true }));
		expect(nav.focusedIndex()).toBe(9);
	});

	it('count prefix wraps around with j when wraparound is on (default)', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(8);

		// 8 + 5 = 13, 13 % 10 = 3
		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(3);
	});

	it('count prefix clamps with j when wraparound is off', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items, wraparound: false });
		nav.focus(8);

		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(9);
	});

	it('Ctrl+D moves focus down by about half a page', () => {
		const { items } = makeList(40);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		nav.handleKeydown(press('d', { ctrlKey: true }));
		// jsdom has no layout, so the default half-page size (5) applies.
		expect(nav.focusedIndex()).toBe(5);
	});

	it('Ctrl+U moves focus up by about half a page', () => {
		const { items } = makeList(40);
		const nav = createListNav({ getItems: () => items });
		nav.focus(20);

		nav.handleKeydown(press('u', { ctrlKey: true }));
		expect(nav.focusedIndex()).toBe(15);
	});

	it('Ctrl+D from an unfocused state starts at the top', () => {
		const { items } = makeList(40);
		const nav = createListNav({ getItems: () => items });

		nav.handleKeydown(press('d', { ctrlKey: true }));
		expect(nav.focusedIndex()).toBe(5);
	});

	it('zz scrolls the focused item into the centre of its viewport', () => {
		const { items } = makeList(5);
		const spies = items.map((el) => {
			const spy = vi.fn();
			(el as unknown as { scrollIntoView: typeof spy }).scrollIntoView = spy;
			return spy;
		});
		const nav = createListNav({ getItems: () => items });
		nav.focus(2);
		// `apply` already called scrollIntoView once with block: 'nearest'.
		expect(spies[2]).toHaveBeenCalled();
		spies[2].mockClear();

		nav.handleKeydown(press('z'));
		// First `z` is pending — no scroll yet.
		expect(spies[2]).not.toHaveBeenCalled();
		nav.handleKeydown(press('z'));
		expect(spies[2]).toHaveBeenCalledWith({ block: 'center', inline: 'nearest' });
	});

	it('pending count is cleared by an unrelated key', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('x')); // unrelated key
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(1);
	});

	it('Escape clears a half-typed motion', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		nav.handleKeydown(press('5'));
		nav.handleKeydown(press('Escape'));
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(1);
	});

	it('motion buffer expires after the timeout', () => {
		vi.useFakeTimers();
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		nav.handleKeydown(press('5'));
		vi.advanceTimersByTime(1600);
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(1);
	});

	it('a single `g` does not move focus until the second `g` arrives', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(5);

		nav.handleKeydown(press('g'));
		expect(nav.focusedIndex()).toBe(5);

		// Typing something else cancels the pending `g`.
		nav.handleKeydown(press('j'));
		expect(nav.focusedIndex()).toBe(6);
	});

	it('leading `0` is pass-through, not a count', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		const handled = nav.handleKeydown(press('0'));
		expect(handled).toBe(false);
	});

	it('motions are ignored while typing in an input', () => {
		const { items } = makeList(10);
		const input = document.createElement('input');
		document.body.appendChild(input);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		const e = new KeyboardEvent('keydown', { key: 'G', shiftKey: true });
		Object.defineProperty(e, 'target', { value: input });
		expect(nav.handleKeydown(e)).toBe(false);
		expect(nav.focusedIndex()).toBe(0);
	});

	it('gg from empty list is a safe no-op', () => {
		const nav = createListNav({ getItems: () => [] });
		nav.handleKeydown(press('g'));
		nav.handleKeydown(press('g'));
		expect(nav.focusedIndex()).toBe(-1);
	});
});

describe('createListNav — selection layer', () => {
	it('selection keys no-op when selectable is unset (back-compat)', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items });
		nav.focus(0);

		// V, x, *, Shift+J should all pass through (return false) without
		// touching the selection — pages without `selectable: true` keep their
		// own bindings for those keys.
		expect(nav.handleKeydown(press('V', { shiftKey: true }))).toBe(false);
		expect(nav.handleKeydown(press('x'))).toBe(false);
		expect(nav.handleKeydown(press('*', { shiftKey: true }))).toBe(false);
		expect(nav.handleKeydown(press('J', { shiftKey: true }))).toBe(false);
		expect(nav.selectedIds().size).toBe(0);
	});

	it('V enters visual mode and selects the focused anchor', () => {
		const { items } = makeList(5);
		const onSelectionChange = vi.fn();
		const nav = createListNav({ getItems: () => items, selectable: true, onSelectionChange });
		nav.focus(2);

		expect(nav.handleKeydown(press('V', { shiftKey: true }))).toBe(true);
		expect(nav.isSelecting()).toBe(true);
		expect(Array.from(nav.selectedIds())).toEqual(['2']);
		expect(items[2].classList.contains('jk-selected')).toBe(true);
		expect(onSelectionChange).toHaveBeenCalledWith(new Set(['2']));
	});

	it('V from an unfocused state anchors at the first item', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items, selectable: true });

		nav.handleKeydown(press('V', { shiftKey: true }));
		expect(nav.focusedIndex()).toBe(0);
		expect(Array.from(nav.selectedIds())).toEqual(['0']);
	});

	it('j/k extends the visual range from the anchor', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(3);

		nav.handleKeydown(press('V', { shiftKey: true }));
		nav.handleKeydown(press('j'));
		nav.handleKeydown(press('j'));
		// Range is [3..5] inclusive.
		expect(Array.from(nav.selectedIds()).sort()).toEqual(['3', '4', '5']);
	});

	it('visual range extends backwards when k crosses the anchor', () => {
		const { items } = makeList(10);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(5);

		nav.handleKeydown(press('V', { shiftKey: true }));
		nav.handleKeydown(press('k'));
		nav.handleKeydown(press('k'));
		// Range is [3..5] inclusive (anchor=5, focus=3).
		expect(Array.from(nav.selectedIds()).sort()).toEqual(['3', '4', '5']);
	});

	it('second V exits visual mode but keeps the selection', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(1);

		nav.handleKeydown(press('V', { shiftKey: true }));
		nav.handleKeydown(press('j'));
		expect(nav.isSelecting()).toBe(true);
		expect(nav.selectedIds().size).toBe(2);

		nav.handleKeydown(press('V', { shiftKey: true }));
		expect(nav.isSelecting()).toBe(false);
		expect(nav.selectedIds().size).toBe(2);
	});

	it('x toggles selection of the focused item without moving', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(2);

		nav.handleKeydown(press('x'));
		expect(nav.focusedIndex()).toBe(2);
		expect(Array.from(nav.selectedIds())).toEqual(['2']);

		nav.handleKeydown(press('x'));
		expect(nav.selectedIds().size).toBe(0);
	});

	it('* toggles select-all of visible items', () => {
		const { items } = makeList(4);
		const nav = createListNav({ getItems: () => items, selectable: true });

		nav.handleKeydown(press('*', { shiftKey: true }));
		expect(Array.from(nav.selectedIds()).sort()).toEqual(['0', '1', '2', '3']);

		nav.handleKeydown(press('*', { shiftKey: true }));
		expect(nav.selectedIds().size).toBe(0);
	});

	it('Shift+J selects current + new focus and moves down', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(1);

		nav.handleKeydown(press('J', { shiftKey: true }));
		expect(nav.focusedIndex()).toBe(2);
		expect(Array.from(nav.selectedIds()).sort()).toEqual(['1', '2']);
	});

	it('Shift+K selects current + new focus and moves up', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(3);

		nav.handleKeydown(press('K', { shiftKey: true }));
		expect(nav.focusedIndex()).toBe(2);
		expect(Array.from(nav.selectedIds()).sort()).toEqual(['2', '3']);
	});

	it('Shift+J at the last item stays put (no wraparound for selection)', () => {
		const { items } = makeList(3);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focusLast();

		nav.handleKeydown(press('J', { shiftKey: true }));
		expect(nav.focusedIndex()).toBe(2);
		// Only the last item is added to the selection — we don't accidentally
		// wrap around and grab item 0.
		expect(Array.from(nav.selectedIds())).toEqual(['2']);
	});

	it('Escape backs out one layer at a time', () => {
		const { items } = makeList(5);
		const onEscape = vi.fn();
		const nav = createListNav({ getItems: () => items, selectable: true, onEscape });
		nav.focus(1);

		nav.handleKeydown(press('V', { shiftKey: true }));
		nav.handleKeydown(press('j'));
		expect(nav.isSelecting()).toBe(true);
		expect(nav.selectedIds().size).toBe(2);

		// Layer 1: visual mode → exit visual, keep selection
		nav.handleKeydown(press('Escape'));
		expect(nav.isSelecting()).toBe(false);
		expect(nav.selectedIds().size).toBe(2);

		// Layer 2: selection → clear selection
		nav.handleKeydown(press('Escape'));
		expect(nav.selectedIds().size).toBe(0);

		// Layer 3: nothing left → fires onEscape
		nav.handleKeydown(press('Escape'));
		expect(onEscape).toHaveBeenCalledTimes(1);
	});

	it('clearSelection wipes both selection and visual mode', () => {
		const { items } = makeList(5);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(0);
		nav.handleKeydown(press('V', { shiftKey: true }));
		nav.handleKeydown(press('j'));

		nav.clearSelection();
		expect(nav.selectedIds().size).toBe(0);
		expect(nav.isSelecting()).toBe(false);
		expect(items[0].classList.contains('jk-selected')).toBe(false);
	});

	it('toggleSelection() with no arg toggles the focused item', () => {
		const { items } = makeList(3);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(1);

		nav.toggleSelection();
		expect(Array.from(nav.selectedIds())).toEqual(['1']);
		nav.toggleSelection();
		expect(nav.selectedIds().size).toBe(0);
	});

	it('toggleSelection(id) operates on a specific id regardless of focus', () => {
		const { items } = makeList(3);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(0);

		nav.toggleSelection('2');
		expect(nav.focusedIndex()).toBe(0);
		expect(Array.from(nav.selectedIds())).toEqual(['2']);
	});

	it('setSelection replaces the entire set', () => {
		const { items } = makeList(5);
		const onSelectionChange = vi.fn();
		const nav = createListNav({ getItems: () => items, selectable: true, onSelectionChange });
		nav.focus(0);

		nav.setSelection(['1', '3']);
		expect(Array.from(nav.selectedIds()).sort()).toEqual(['1', '3']);
		expect(items[1].classList.contains('jk-selected')).toBe(true);
		expect(items[3].classList.contains('jk-selected')).toBe(true);
		expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['1', '3']));
	});

	it('refresh re-paints selection class on re-rendered DOM nodes', () => {
		const list = makeList(3);
		const nav = createListNav({ getItems: () => list.items, selectable: true });
		nav.focus(0);
		nav.handleKeydown(press('x'));
		expect(list.items[0].classList.contains('jk-selected')).toBe(true);

		// Simulate a list re-render: same ids, new DOM elements.
		const newItems: HTMLElement[] = [];
		document.body.innerHTML = '';
		const container = document.createElement('div');
		for (let i = 0; i < 3; i++) {
			const el = document.createElement('div');
			el.setAttribute('data-nav-id', String(i));
			container.appendChild(el);
			newItems.push(el);
		}
		document.body.appendChild(container);
		list.items = newItems;

		nav.refresh();
		expect(newItems[0].classList.contains('jk-selected')).toBe(true);
	});

	it('selectedIds() returns a snapshot (mutating it does not leak)', () => {
		const { items } = makeList(3);
		const nav = createListNav({ getItems: () => items, selectable: true });
		nav.focus(0);
		nav.handleKeydown(press('x'));

		const snap = nav.selectedIds();
		snap.add('99');
		expect(nav.selectedIds().has('99')).toBe(false);
	});

	it('custom getItemId resolves selection ids from a non-default attribute', () => {
		document.body.innerHTML = '';
		const container = document.createElement('div');
		const items: HTMLElement[] = [];
		for (let i = 0; i < 3; i++) {
			const el = document.createElement('div');
			el.setAttribute('data-rule-nav-id', `rule-${i}`);
			container.appendChild(el);
			items.push(el);
		}
		document.body.appendChild(container);

		const nav = createListNav({
			getItems: () => items,
			selectable: true,
			getItemId: (el) => el.getAttribute('data-rule-nav-id')
		});
		nav.focus(0);
		nav.handleKeydown(press('x'));
		expect(Array.from(nav.selectedIds())).toEqual(['rule-0']);
	});
});
