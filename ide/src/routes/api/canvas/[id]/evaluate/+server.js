/**
 * Canvas Formula Evaluation API
 * POST /api/canvas/[id]/evaluate  - Evaluate all formula blocks
 *
 * Takes current control values, evaluates all FormulaBlocks, returns results.
 * For table-referencing formulas, fetches table data from data.db.
 *
 * Supports TableFilter(tableName, col1, val1, col2, val2, ..., returnColumn)
 * for cross-table lookups driven by control values.
 *
 * Request body: { project, controlValues: { controlName: value, ... } }
 * Response: { results: { blockId: result, ... } }
 */
import { json } from '@sveltejs/kit';
import { getCanvasPage } from '$lib/server/jat-canvas.js';
import { getTableRows } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { evaluateFormula } from '$lib/utils/formulaEval.js';

/**
 * Execute a TableFilter call server-side.
 * TableFilter('tableName', 'col1', val1, 'col2', val2, ..., 'returnColumn')
 * - Fetches all rows from tableName
 * - Filters where col1 == val1 AND col2 == val2 ...
 * - Returns the value of returnColumn from the first matching row (or null)
 *
 * @param {string} expression - The formula expression
 * @param {Record<string, any>} controlRow - Control values for variable resolution
 * @param {function} fetchTableRows - Table row fetcher function
 * @returns {any} The resolved value or an error string
 */
function resolveTableFilter(expression, controlRow, fetchTableRows) {
	// Parse TableFilter arguments from the expression
	// TableFilter('tableName', 'col1', {control1}, 'col2', {control2}, 'returnCol')
	const match = expression.match(/^TableFilter\s*\(([\s\S]*)\)$/i);
	if (!match) return null;

	const argsStr = match[1];
	const args = [];
	let current = '';
	let inString = false;
	let stringChar = '';
	let braceDepth = 0;

	for (let i = 0; i < argsStr.length; i++) {
		const ch = argsStr[i];
		if (inString) {
			current += ch;
			if (ch === stringChar) inString = false;
		} else if (ch === '{') {
			braceDepth++;
			current += ch;
		} else if (ch === '}') {
			braceDepth--;
			current += ch;
		} else if (ch === ',' && braceDepth === 0) {
			args.push(current.trim());
			current = '';
		} else if (ch === "'" || ch === '"') {
			inString = true;
			stringChar = ch;
			current += ch;
		} else {
			current += ch;
		}
	}
	if (current.trim()) args.push(current.trim());

	if (args.length < 3 || args.length % 2 === 0) {
		return '#ERR: TableFilter requires (tableName, col1, val1, ..., returnColumn)';
	}

	// Parse table name (first arg, string literal)
	const tableName = args[0].replace(/^['"]|['"]$/g, '');

	// Parse return column (last arg, string literal)
	const returnColumn = args[args.length - 1].replace(/^['"]|['"]$/g, '');

	// Parse condition pairs (middle args)
	const conditions = [];
	for (let i = 1; i < args.length - 1; i += 2) {
		const col = args[i].replace(/^['"]|['"]$/g, '');
		let val = args[i + 1];

		// Resolve {controlName} references
		const refMatch = val.match(/^\{(.+)\}$/);
		if (refMatch) {
			val = controlRow[refMatch[1]];
		} else {
			// Strip string quotes
			val = val.replace(/^['"]|['"]$/g, '');
			// Try to parse as number
			const num = Number(val);
			if (!isNaN(num) && val !== '') val = num;
		}
		conditions.push({ col, val });
	}

	// Fetch table rows and apply filter
	const rows = fetchTableRows(tableName);
	if (!rows || rows.length === 0) return null;

	// Find first matching row
	const matchingRow = rows.find(row =>
		conditions.every(({ col, val }) => String(row[col]) === String(val))
	);

	if (!matchingRow) return null;
	return matchingRow[returnColumn] ?? null;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const pageId = params.id;

	try {
		const body = await request.json();
		const { project, controlValues = {} } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const page = getCanvasPage(path, pageId);
		if (!page) {
			return json({ error: `Canvas page not found: ${pageId}` }, { status: 404 });
		}

		// Find all formula blocks
		const formulaBlocks = page.blocks.filter(b => b.type === 'formula');
		if (formulaBlocks.length === 0) {
			return json({ results: {} });
		}

		// Build a row-like object from control values for formula evaluation.
		// Formula expressions reference controls by name using {controlName} syntax.
		const controlRow = { ...controlValues };

		// Cache for table data (avoid re-fetching same table)
		const tableCache = new Map();

		/**
		 * Fetch table rows, with caching.
		 * @param {string} tableName
		 * @returns {Array<Record<string, any>>}
		 */
		function fetchTableRows(tableName) {
			if (tableCache.has(tableName)) {
				return tableCache.get(tableName);
			}
			try {
				const result = getTableRows(path, tableName, { limit: 10000 });
				const rows = result?.rows ?? result ?? [];
				tableCache.set(tableName, rows);
				return rows;
			} catch {
				tableCache.set(tableName, []);
				return [];
			}
		}

		// Evaluate each formula block
		const results = {};
		for (const block of formulaBlocks) {
			try {
				const expr = block.expression;

				// Check for TableFilter — resolve server-side with table data
				if (/TableFilter\s*\(/i.test(expr)) {
					// If the entire expression is a single TableFilter call
					const tfMatch = expr.match(/^TableFilter\s*\(/i);
					if (tfMatch) {
						const tfResult = resolveTableFilter(expr, controlRow, fetchTableRows);
						if (typeof tfResult === 'string' && tfResult.startsWith('#ERR')) {
							results[block.id] = tfResult;
						} else {
							results[block.id] = tfResult;
						}
						continue;
					}
				}

				// Standard formula evaluation with control values as row
				const result = evaluateFormula(expr, controlRow);
				results[block.id] = result;
			} catch (err) {
				results[block.id] = `#ERR: ${err.message}`;
			}
		}

		return json({ results });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
