/**
 * PeekRegistry — maps a `data-nav-id` value to a peek-drawer component.
 *
 * Routes register prefixes (or arbitrary matchers) once at bootstrap, and the
 * PeekDrawer resolves an entry at render time based on the currently-peeked
 * navId. Entries are checked in registration order; first match wins.
 *
 * Typical registration in `+layout.svelte`:
 *
 *   import TaskPeekContent from '$lib/components/peek/TaskPeekContent.svelte';
 *   registerPeek({
 *       id: 'task',
 *       match: (navId) => /^[a-z][a-z0-9_-]*-[a-z0-9]+$/i.test(navId),
 *       component: TaskPeekContent,
 *       propsForId: (navId) => ({ taskId: navId }),
 *   });
 *
 * A route that wants peek disabled for certain navIds can either (a) not
 * register that prefix, or (b) skip the `use:peek` attachment entirely.
 */

import type { Component } from 'svelte';

export interface PeekEntry {
	/** Stable identifier — used for deduping if the same prefix is registered twice. */
	id: string;
	/** Return true if this entry handles the given navId. */
	match: (navId: string) => boolean;
	/** The Svelte component to render inside the peek drawer. */
	component: Component<Record<string, unknown>>;
	/** Build props for the component from the navId. */
	propsForId: (navId: string) => Record<string, unknown>;
	/** Optional label shown in the drawer header (e.g. "Task", "File"). */
	label?: string;
}

const entries: PeekEntry[] = [];

export function registerPeek(entry: PeekEntry): void {
	const existingIdx = entries.findIndex((e) => e.id === entry.id);
	if (existingIdx >= 0) {
		entries[existingIdx] = entry;
	} else {
		entries.push(entry);
	}
}

export function unregisterPeek(id: string): void {
	const idx = entries.findIndex((e) => e.id === id);
	if (idx >= 0) entries.splice(idx, 1);
}

export function getPeekEntry(navId: string): PeekEntry | null {
	for (const e of entries) {
		try {
			if (e.match(navId)) return e;
		} catch {
			// A throwing matcher shouldn't take down the whole drawer.
		}
	}
	return null;
}

export function listPeekEntries(): PeekEntry[] {
	return entries.slice();
}

/**
 * Convenience helper for the common case: match any navId starting with
 * `prefix` (case-insensitive). Returns a ready-to-register `match` function.
 */
export function matchPrefix(prefix: string): (navId: string) => boolean {
	const p = prefix.toLowerCase();
	return (navId) => navId.toLowerCase().startsWith(p);
}
