/**
 * TSV/CSV parser with multi-line cell support.
 *
 * Handles "sloppy" spreadsheet exports where multi-line cells are NOT quoted.
 * Detection: lines with fewer delimiters than expected are continuations of
 * the previous row's last populated field.
 */

/**
 * Auto-detect delimiter from content.
 * @param {string} text
 * @param {string} [formatHint] - 'tsv' or 'csv'
 * @returns {string}
 */
export function detectDelimiter(text, formatHint) {
	if (formatHint === 'csv') return ',';
	if (formatHint === 'tsv') return '\t';

	const firstLine = text.split('\n')[0] || '';
	const tabs = (firstLine.match(/\t/g) || []).length;
	const commas = (firstLine.match(/,/g) || []).length;
	return tabs >= commas ? '\t' : ',';
}

/**
 * Parse sloppy TSV/CSV with unquoted multi-line cells.
 *
 * @param {string} text  Raw file content
 * @param {object} [opts]
 * @param {string} [opts.format] - 'tsv', 'csv', or auto-detect
 * @param {Record<string, string>} [opts.columnMap] - Rename parsed headers: {from: to}
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function parseDelimited(text, opts = {}) {
	const delimiter = detectDelimiter(text, opts.format);
	const lines = text.split('\n');
	if (lines.length === 0) return { headers: [], rows: [] };

	// Header line
	const headerLine = lines[0];
	const rawHeaders = headerLine.split(delimiter);
	const expectedDelimiters = rawHeaders.length - 1;

	// Normalize headers: lowercase, spaces→underscores, strip non-alphanum
	let headers = rawHeaders
		.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))
		.filter((h) => h.length > 0);

	if (headers.length === 0) {
		throw new Error('No valid headers found in first line');
	}

	const delimRegex = new RegExp(delimiter === '\t' ? '\t' : ',', 'g');
	const rows = [];
	let currentRow = null;

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];

		// Skip completely empty lines at end
		if (line.trim() === '' && i === lines.length - 1) continue;

		const delimCount = (line.match(delimRegex) || []).length;

		if (delimCount >= expectedDelimiters - 1) {
			// New row (allow one missing delimiter for trailing empty columns)
			const cells = line.split(delimiter);
			const row = {};
			for (let c = 0; c < headers.length; c++) {
				row[headers[c]] = (cells[c] || '').trim();
			}
			rows.push(row);
			currentRow = row;
		} else if (currentRow) {
			// Continuation — append to last non-empty field
			let lastField = null;
			for (let c = headers.length - 1; c >= 0; c--) {
				if (currentRow[headers[c]] && currentRow[headers[c]].length > 0) {
					lastField = headers[c];
					break;
				}
			}
			if (lastField) {
				currentRow[lastField] += '\n' + line;
			}
		}
	}

	// Apply column mapping
	const columnMap = opts.columnMap || {};
	if (Object.keys(columnMap).length > 0) {
		for (const row of rows) {
			for (const [from, to] of Object.entries(columnMap)) {
				if (from in row) {
					row[to] = row[from];
					delete row[from];
				}
			}
		}
		headers = headers.map((h) => columnMap[h] || h);
	}

	return { headers, rows };
}
