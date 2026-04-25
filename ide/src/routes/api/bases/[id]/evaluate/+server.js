/**
 * Base Formula Evaluation API
 * POST /api/bases/[id]/evaluate  - Evaluate all formula blocks
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
import { getBase } from '$lib/server/jat-bases.js';
import { getTableRows, pgGetTableRows } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { evaluateFormula } from '$lib/utils/formulaEval.js';
import { resolveBackendForProject } from '../../../../../../../lib/projects-config.js';
import * as pgBases from '../../../../../../../lib/bases-postgres.js';

function getPostgresUrlForProject(projectName) {
	try {
		const cfg = resolveBackendForProject(projectName);
		return cfg.kind === 'postgres' ? cfg.url : null;
	} catch {
		return null;
	}
}

/**
 * Walk a formula expression and return the set of table names referenced via
 * TableFilter('tableName', ...). Used to pre-populate the table cache on
 * postgres-backed projects (where fetches are async) before running the
 * synchronous formula loop.
 */
function extractTableFilterTables(expression) {
	const names = new Set();
	const re = /TableFilter\s*\(\s*['"]([^'"]+)['"]/gi;
	let m;
	while ((m = re.exec(expression)) !== null) {
		names.add(m[1]);
	}
	return names;
}

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

	const tableName = args[0].replace(/^['"]|['"]$/g, '');
	const returnColumn = args[args.length - 1].replace(/^['"]|['"]$/g, '');

	const conditions = [];
	for (let i = 1; i < args.length - 1; i += 2) {
		const col = args[i].replace(/^['"]|['"]$/g, '');
		let val = args[i + 1];

		const refMatch = val.match(/^\{(.+)\}$/);
		if (refMatch) {
			val = controlRow[refMatch[1]];
		} else {
			val = val.replace(/^['"]|['"]$/g, '');
			const num = Number(val);
			if (!isNaN(num) && val !== '') val = num;
		}
		conditions.push({ col, val });
	}

	const rows = fetchTableRows(tableName);
	if (!rows || rows.length === 0) return null;

	const matchingRow = rows.find(row =>
		conditions.every(({ col, val }) => String(row[col]) === String(val))
	);

	if (!matchingRow) return null;
	return matchingRow[returnColumn] ?? null;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const baseId = params.id;

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

		const pgUrl = getPostgresUrlForProject(project);
		const base = pgUrl
			? await pgBases.getBase(pgUrl, baseId)
			: getBase(path, baseId);
		if (!base) {
			return json({ error: `Base not found: ${baseId}` }, { status: 404 });
		}

		// Find all formula blocks
		const formulaBlocks = (base.blocks || []).filter(b => b.type === 'formula');
		if (formulaBlocks.length === 0) {
			return json({ results: {} });
		}

		const controlRow = { ...controlValues };

		// Pre-populate the table cache for postgres projects so the synchronous
		// formula loop below can resolve TableFilter calls without awaiting.
		// On sqlite, fetchTableRows pulls lazily from the sync helper instead.
		const tableCache = new Map();

		if (pgUrl) {
			const tablesNeeded = new Set();
			for (const block of formulaBlocks) {
				const expr = block.expression || '';
				if (/TableFilter\s*\(/i.test(expr)) {
					for (const t of extractTableFilterTables(expr)) tablesNeeded.add(t);
				}
			}
			for (const tableName of tablesNeeded) {
				try {
					const result = await pgGetTableRows(project, tableName, { limit: 10000 });
					tableCache.set(tableName, result?.rows ?? []);
				} catch {
					tableCache.set(tableName, []);
				}
			}
		}

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

		const results = {};
		for (const block of formulaBlocks) {
			try {
				const expr = block.expression;

				if (/TableFilter\s*\(/i.test(expr)) {
					const tfMatch = expr.match(/^TableFilter\s*\(/i);
					if (tfMatch) {
						const tfResult = resolveTableFilter(expr, controlRow, fetchTableRows);
						results[block.id] = tfResult;
						continue;
					}
				}

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
