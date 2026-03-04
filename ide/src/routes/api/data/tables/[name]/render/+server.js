/**
 * Data Table Render API
 * POST /api/data/tables/[name]/render  - Render data table content as markdown
 *
 * Always resolves relation columns and evaluates formulas so LLM context
 * shows human-readable values (e.g. "Dave" instead of rowid 4).
 */
import { json } from '@sveltejs/kit';
import { renderDataTable } from '$lib/server/jat-bases.js';
import { getTableRows, getColumnMetadata, resolveRelationColumns } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { evaluateFormula } from '$lib/utils/formulaEval';

/**
 * Format rows as a markdown table.
 * @param {Array<Record<string, any>>} rows
 * @returns {string}
 */
function formatMarkdownTable(rows) {
	if (!rows || rows.length === 0) return '(no results)';
	const sanitize = (v) => {
		const s = String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
		return s.length > 120 ? s.slice(0, 117) + '...' : s;
	};
	const cols = Object.keys(rows[0]);
	const header = '| ' + cols.join(' | ') + ' |';
	const separator = '| ' + cols.map(() => '---').join(' | ') + ' |';
	const body = rows.map(row =>
		'| ' + cols.map(c => sanitize(row[c])).join(' | ') + ' |'
	).join('\n');
	return `${header}\n${separator}\n${body}`;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const tableName = params.name;

	try {
		const body = await request.json();
		const { project, contextQuery } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// If a custom contextQuery is provided, use the original render path
		// (custom SQL queries can't be resolved since we don't know the column mapping)
		if (contextQuery) {
			const rendered = renderDataTable(path, tableName, contextQuery);
			return json({ rendered });
		}

		// Default path: fetch rows, resolve relations + formulas, format as markdown
		const { rows: rawRows } = getTableRows(path, tableName, { limit: 100, offset: 0 });
		const metaRows = getColumnMetadata(path, tableName);

		// Build columnMeta map for formula evaluation
		const columnMeta = {};
		for (const m of metaRows) {
			columnMeta[m.column_name] = {
				semanticType: m.semantic_type,
				config: m.config,
			};
		}

		// 1. Resolve relation columns
		let rows = resolveRelationColumns(path, tableName, rawRows, metaRows);

		// 2. Evaluate formula columns
		for (const [colName, meta] of Object.entries(columnMeta)) {
			if (meta.semanticType === 'formula' && meta.config?.expression) {
				for (const row of rows) {
					try {
						row[colName] = evaluateFormula(meta.config.expression, row, rows);
					} catch { row[colName] = null; }
				}
			}
		}

		const content = formatMarkdownTable(rows);
		const rendered = {
			table_name: tableName,
			content,
			token_estimate: Math.ceil(content.length / 4),
		};

		return json({ rendered });
	} catch (/** @type {any} */ error) {
		const msg = error?.message || String(error);
		if (msg.includes('not found')) {
			return json({ error: msg }, { status: 404 });
		}
		return json({ error: msg }, { status: 500 });
	}
}
