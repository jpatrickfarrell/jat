export interface ColumnSettings {
	order: string[];
	widths: Record<string, number>;
	hidden: string[];
}

/**
 * Save column settings (order, widths, hidden) to localStorage as a single JSON blob.
 */
export function saveColumnSettings(key: string, settings: ColumnSettings): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(settings));
	} catch {
		// Ignore storage errors (e.g. private browsing quota)
	}
}

/**
 * Load column settings from localStorage.
 * Merges any new column IDs (from allColumnIds) not present in the saved order,
 * appending them at the end.
 * Returns null if nothing is saved or the data cannot be parsed.
 */
export function loadColumnSettings(key: string, allColumnIds: string[]): ColumnSettings | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const saved = JSON.parse(raw);

		const order: string[] = (() => {
			if (!saved.order || !Array.isArray(saved.order)) return allColumnIds;
			const known = new Set(allColumnIds);
			const validOrder = (saved.order as string[]).filter(id => known.has(id));
			const missing = allColumnIds.filter(id => !validOrder.includes(id));
			return [...validOrder, ...missing];
		})();

		const widths: Record<string, number> =
			saved.widths && typeof saved.widths === 'object' ? saved.widths : {};

		const hidden: string[] =
			saved.hidden && Array.isArray(saved.hidden) ? saved.hidden : [];

		return { order, widths, hidden };
	} catch {
		return null;
	}
}
