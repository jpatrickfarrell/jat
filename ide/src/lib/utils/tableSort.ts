/**
 * Shared table sort toggle utility.
 *
 * If `clickedField` is the currently active sort field, flip the direction.
 * Otherwise switch to the clicked field with ascending direction.
 */
export function toggleSort(
	currentField: string,
	currentDir: 'asc' | 'desc',
	clickedField: string
): { field: string; dir: 'asc' | 'desc' } {
	if (clickedField === currentField) {
		return { field: currentField, dir: currentDir === 'asc' ? 'desc' : 'asc' };
	}
	return { field: clickedField, dir: 'asc' };
}
