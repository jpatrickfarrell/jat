/**
 * Vim-style marks & jump list for cross-route navigation.
 *
 * Marks: `m<letter>` captures the currently focused listNav item (identified by
 * its `.jk-focused` class + `data-nav-id` attribute) together with the route
 * and scroll position. `'<letter>` navigates back to that mark — it calls
 * `goto()` if the route differs, then after the page lands it re-applies the
 * focus class and scrolls to the recorded position.
 *
 * Jump list: every route change (except ones triggered by the jump list
 * itself) pushes the leaving position onto a stack. Ctrl+O walks the pointer
 * backward, Ctrl+I walks it forward, trimmed to the most recent 50 entries.
 *
 * Marks persist to localStorage (key `jat-marks-v1`). The jump list is
 * session-only — matching vim.
 */

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { tick } from 'svelte';

export interface Mark {
	letter: string; // single a-z
	route: string; // pathname including leading slash
	navId: string | null; // data-nav-id of focused list item, or null if none
	scrollY: number;
	label: string; // short preview of the target (e.g. task id, file name)
	timestamp: number;
}

export interface JumpEntry {
	route: string;
	navId: string | null;
	scrollY: number;
	label: string;
	timestamp: number;
}

const STORAGE_KEY = 'jat-marks-v1';
const JUMP_STACK_MAX = 50;
const MARK_LETTERS = /^[a-z]$/;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let marks = $state<Record<string, Mark>>({});
let jumpStack = $state<JumpEntry[]>([]);
let jumpPointer = $state(-1); // index of "current" entry in jumpStack; -1 = empty

// Set while traversing the jump list or executing a mark jump. The
// route-change effect in +layout.svelte checks this so internal jumps don't
// pollute the stack.
let internalJumping = $state(false);

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export function loadMarksFromStorage(): void {
	if (!browser) return;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw) as Record<string, Mark>;
		if (parsed && typeof parsed === 'object') marks = parsed;
	} catch {
		// Corrupt localStorage — ignore.
	}
}

function saveMarksToStorage(): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(marks));
	} catch {
		// Quota or disabled storage — silent.
	}
}

// ---------------------------------------------------------------------------
// Focus capture from DOM
// ---------------------------------------------------------------------------

interface FocusSnapshot {
	navId: string | null;
	label: string;
	scrollY: number;
}

function captureFocus(): FocusSnapshot {
	if (!browser) return { navId: null, label: '', scrollY: 0 };
	const el = document.querySelector<HTMLElement>('.jk-focused');
	const navId = el?.getAttribute('data-nav-id') ?? null;
	const label = deriveLabel(el, navId);
	return { navId, label, scrollY: window.scrollY };
}

function deriveLabel(el: HTMLElement | null, navId: string | null): string {
	if (!el) return navId ?? '';
	// Prefer an explicit data-nav-label; fall back to visible text, trimmed.
	const explicit = el.getAttribute('data-nav-label');
	if (explicit) return explicit;
	const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
	if (text) return text.length > 40 ? text.slice(0, 40) + '…' : text;
	return navId ?? '';
}

// ---------------------------------------------------------------------------
// Marks API
// ---------------------------------------------------------------------------

export function setMark(letter: string, route: string): boolean {
	if (!MARK_LETTERS.test(letter)) return false;
	const snap = captureFocus();
	marks[letter] = {
		letter,
		route,
		navId: snap.navId,
		scrollY: snap.scrollY,
		label: snap.label,
		timestamp: Date.now()
	};
	saveMarksToStorage();
	return true;
}

export async function jumpToMark(letter: string, currentRoute: string): Promise<boolean> {
	const mark = marks[letter];
	if (!mark) return false;

	// Capture current position onto the jump stack BEFORE leaving.
	pushJump({
		route: currentRoute,
		...captureFocus(),
		timestamp: Date.now()
	});

	await restorePosition(mark.route, mark.navId, mark.scrollY, currentRoute);
	return true;
}

export function deleteMark(letter: string): boolean {
	if (!(letter in marks)) return false;
	delete marks[letter];
	marks = { ...marks };
	saveMarksToStorage();
	return true;
}

export function clearAllMarks(): void {
	marks = {};
	saveMarksToStorage();
}

export function getMarks(): Record<string, Mark> {
	return marks;
}

export function getMark(letter: string): Mark | undefined {
	return marks[letter];
}

// ---------------------------------------------------------------------------
// Jump list API
// ---------------------------------------------------------------------------

export function pushJump(entry: JumpEntry): void {
	// Ignore empty entries: no navId AND scrollY == 0 means we have no
	// meaningful position to restore (likely a fresh page load).
	if (!entry.navId && entry.scrollY === 0) {
		// Still record route so Ctrl+O works across plain route changes.
	}

	// Truncate forward history past the current pointer, vim-style.
	if (jumpPointer < jumpStack.length - 1) {
		jumpStack = jumpStack.slice(0, jumpPointer + 1);
	}

	// De-dup consecutive entries for the same route+navId.
	const last = jumpStack[jumpStack.length - 1];
	if (last && last.route === entry.route && last.navId === entry.navId) {
		jumpStack[jumpStack.length - 1] = entry;
		jumpPointer = jumpStack.length - 1;
		return;
	}

	jumpStack.push(entry);
	if (jumpStack.length > JUMP_STACK_MAX) {
		jumpStack = jumpStack.slice(jumpStack.length - JUMP_STACK_MAX);
	}
	jumpPointer = jumpStack.length - 1;
}

export async function jumpBack(currentRoute: string): Promise<boolean> {
	if (jumpPointer <= 0) return false;

	// If the pointer is at the tip, stash current position so Ctrl+I can
	// return to "now" — matches vim behaviour where Ctrl+O from the tip
	// remembers where you were.
	if (jumpPointer === jumpStack.length - 1) {
		const snap = captureFocus();
		pushJumpSilent({
			route: currentRoute,
			navId: snap.navId,
			scrollY: snap.scrollY,
			label: snap.label,
			timestamp: Date.now()
		});
		// pushJumpSilent advanced the pointer to the new tip; back up one
		// extra so the next decrement lands on the intended target.
		jumpPointer -= 1;
	}

	jumpPointer -= 1;
	const target = jumpStack[jumpPointer];
	if (!target) return false;
	await restorePosition(target.route, target.navId, target.scrollY, currentRoute);
	return true;
}

export async function jumpForward(currentRoute: string): Promise<boolean> {
	if (jumpPointer < 0 || jumpPointer >= jumpStack.length - 1) return false;
	jumpPointer += 1;
	const target = jumpStack[jumpPointer];
	if (!target) return false;
	await restorePosition(target.route, target.navId, target.scrollY, currentRoute);
	return true;
}

function pushJumpSilent(entry: JumpEntry): void {
	const last = jumpStack[jumpStack.length - 1];
	if (last && last.route === entry.route && last.navId === entry.navId) {
		jumpStack[jumpStack.length - 1] = entry;
		jumpPointer = jumpStack.length - 1;
		return;
	}
	jumpStack.push(entry);
	if (jumpStack.length > JUMP_STACK_MAX) {
		jumpStack = jumpStack.slice(jumpStack.length - JUMP_STACK_MAX);
	}
	jumpPointer = jumpStack.length - 1;
}

export function getJumpStack(): { stack: JumpEntry[]; pointer: number } {
	return { stack: jumpStack, pointer: jumpPointer };
}

export function clearJumpStack(): void {
	jumpStack = [];
	jumpPointer = -1;
}

// ---------------------------------------------------------------------------
// Internal jumping flag — read by the route-change effect in +layout.svelte
// ---------------------------------------------------------------------------

export function isInternalJumping(): boolean {
	return internalJumping;
}

// ---------------------------------------------------------------------------
// Restore position helper
// ---------------------------------------------------------------------------

async function restorePosition(
	targetRoute: string,
	navId: string | null,
	scrollY: number,
	currentRoute: string
): Promise<void> {
	internalJumping = true;
	try {
		if (targetRoute !== currentRoute) {
			// Preserve any project query-string on the current URL so we
			// don't kick the user out of their selected project context.
			let url = targetRoute;
			if (browser) {
				const project = new URL(window.location.href).searchParams.get('project');
				if (project) {
					url = `${targetRoute}?project=${encodeURIComponent(project)}`;
				}
			}
			await goto(url, { noScroll: true });
			// Wait one tick + two rAF so the new page has rendered.
			await tick();
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		}

		applyFocus(navId, scrollY);
	} finally {
		// Release the flag after the route change settles. A short timeout
		// covers any trailing async work from the incoming page.
		setTimeout(() => {
			internalJumping = false;
		}, 50);
	}
}

function applyFocus(navId: string | null, scrollY: number): void {
	if (!browser) return;

	// Clear any existing focus class from stale elements.
	document.querySelectorAll<HTMLElement>('.jk-focused').forEach((el) => {
		el.classList.remove('jk-focused');
	});

	if (navId) {
		const el = document.querySelector<HTMLElement>(
			`[data-nav-id="${CSS.escape(navId)}"]`
		);
		if (el) {
			el.classList.add('jk-focused');
			el.scrollIntoView({ block: 'center', inline: 'nearest' });
			return;
		}
	}

	// Fall back to restoring scroll position if we couldn't find the item
	// (e.g. the list has changed since the mark was set).
	window.scrollTo({ top: scrollY, behavior: 'auto' });
}

// ---------------------------------------------------------------------------
// Reactive read-only accessors for components that want to subscribe
// ---------------------------------------------------------------------------

/**
 * Returns a live snapshot of the marks record. Components using Svelte 5
 * runes can call this inside a `$derived` to re-render when marks change.
 */
export function marksSnapshot(): Record<string, Mark> {
	return marks;
}

export function jumpStackSnapshot(): { stack: JumpEntry[]; pointer: number } {
	return { stack: jumpStack, pointer: jumpPointer };
}
