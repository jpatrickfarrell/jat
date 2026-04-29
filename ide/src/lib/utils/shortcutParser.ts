/**
 * Pure keyboard-shortcut string parser.
 *
 * Lives outside `$lib/stores/` so framework code (e.g. the voice dispatcher)
 * can consume it without pulling Svelte stores into the bundle. Originally
 * extracted from `lib/stores/keyboardShortcuts.svelte.ts` — that file now
 * re-exports these symbols for backwards compatibility.
 *
 * Zero runtime dependencies. Safe to import from anywhere — server, client,
 * test environments alike.
 */

/** Parsed keyboard shortcut for matching against KeyboardEvent. */
export interface ParsedShortcut {
	key: string; // main key (lowercase, or 'space' for ' ')
	alt: boolean;
	ctrl: boolean;
	shift: boolean;
	meta: boolean; // command key on Mac
}

/** Parse a shortcut string ("Alt+Shift+S") into modifier flags + key. */
export function parseShortcut(shortcut: string): ParsedShortcut {
	const parts = shortcut.toLowerCase().split('+').map((p) => p.trim());

	const result: ParsedShortcut = {
		key: '',
		alt: false,
		ctrl: false,
		shift: false,
		meta: false
	};

	for (const part of parts) {
		switch (part) {
			case 'alt':
			case 'option':
				result.alt = true;
				break;
			case 'ctrl':
			case 'control':
				result.ctrl = true;
				break;
			case 'shift':
				result.shift = true;
				break;
			case 'meta':
			case 'cmd':
			case 'command':
			case 'win':
			case 'windows':
				result.meta = true;
				break;
			default:
				// Main key; normalize space character to 'space'.
				result.key = part === ' ' ? 'space' : part;
		}
	}

	return result;
}

/** Format a parsed shortcut back into canonical string form. */
export function formatShortcut(parsed: ParsedShortcut): string {
	const parts: string[] = [];

	if (parsed.ctrl) parts.push('Ctrl');
	if (parsed.alt) parts.push('Alt');
	if (parsed.shift) parts.push('Shift');
	if (parsed.meta) parts.push('Meta');

	if (parsed.key) {
		const displayKey =
			parsed.key.length === 1
				? parsed.key.toUpperCase()
				: parsed.key.charAt(0).toUpperCase() + parsed.key.slice(1);
		parts.push(displayKey);
	}

	return parts.join('+');
}

/** Normalize a shortcut string ("alt+c" → "Alt+C"). */
export function normalizeShortcut(shortcut: string): string {
	return formatShortcut(parseShortcut(shortcut));
}
