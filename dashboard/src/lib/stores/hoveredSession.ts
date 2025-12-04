/**
 * Store for tracking the currently hovered session (for keyboard shortcuts)
 */
import { writable } from 'svelte/store';

// Currently hovered session name (null if none)
export const hoveredSessionName = writable<string | null>(null);

export function setHoveredSession(sessionName: string | null) {
	hoveredSessionName.set(sessionName);
}
