/**
 * View Rows API
 * GET /api/data/views/[id]/rows?project=X&limit=N&offset=N  - Get filtered rows
 *     &resolve=true  - Resolve relation columns to display values and evaluate formulas
 */
import { json } from '@sveltejs/kit';
import { getViewRows, getTableSchema, getColumnMetadata, resolveRelationColumns } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { evaluateFormula } from '$lib/utils/formulaEval';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const viewId = params.id;
	const resolve = url.searchParams.get('resolve') === 'true';

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const limit = parseInt(url.searchParams.get('limit') || '100', 10);
		const offset = parseInt(url.searchParams.get('offset') || '0', 10);
		const orderBy = url.searchParams.get('orderBy') || undefined;
		const orderDir = url.searchParams.get('orderDir') || undefined;

		const result = getViewRows(path, viewId, { limit, offset, orderBy, orderDir });

		// Include schema and columnMeta from the view's underlying table
		const tableName = result.view?.table_name;
		let schema = [];
		let columnMeta = {};
		let metaRows = [];
		if (tableName) {
			schema = getTableSchema(path, tableName);
			metaRows = getColumnMetadata(path, tableName);
			for (const m of metaRows) {
				columnMeta[m.column_name] = {
					semanticType: m.semantic_type,
					config: m.config,
					displayName: m.display_name,
					description: m.description,
				};
			}
		}

		if (resolve && tableName && result.rows) {
			// 1. Resolve relation columns
			result.rows = resolveRelationColumns(path, tableName, result.rows, metaRows);

			// 2. Evaluate formula columns
			for (const [colName, meta] of Object.entries(columnMeta)) {
				if (meta.semanticType === 'formula' && meta.config?.expression) {
					for (const row of result.rows) {
						try {
							row[colName] = evaluateFormula(meta.config.expression, row, result.rows);
						} catch { row[colName] = null; }
					}
				}
			}
		}

		return json({ ...result, schema, columnMeta });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
