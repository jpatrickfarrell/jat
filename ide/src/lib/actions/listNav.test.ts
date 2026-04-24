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
