/**
 * Canvas Formula Evaluation API
 * POST /api/canvas/[id]/evaluate  - Evaluate all formula blocks
 *
 * Takes current control values, evaluates all FormulaBlocks, returns results.
 * For table-referencing formulas, fetches table data from data.db.
 *
 * Request body: { project, controlValues: { controlName: value, ... } }
 * Response: { results: { blockId: result, ... } }
 */
import { json } from '@sveltejs/kit';
import { getCanvasPage } from '$lib/server/jat-canvas.js';
import { getTableRows } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { evaluateFormula } from '$lib/utils/formulaEval.js';

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
				const rows = getTableRows(path, tableName);
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
				// Check if formula references any table data via TableFilter or aggregate functions.
				// The evaluateFormula function handles column refs from the controlRow.
				// For now, we pass controlValues as the "row" so {controlName} resolves to the value.
				const result = evaluateFormula(block.expression, controlRow);
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
