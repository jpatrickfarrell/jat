/**
 * Single Table API
 * GET /api/data/tables/[name]?project=X  - Schema + rows + column metadata
 *     &resolve=true  - Resolve relation columns to display values and evaluate formulas
 */
import { json } from '@sveltejs/kit';
import { getTableSchema, getTableRows, getColumnMetadata, resolveRelationColumns, isSystemTable, getSystemTableSchema, getSystemTableRows } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { evaluateFormula } from '$lib/utils/formulaEval';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;
	const resolve = url.searchParams.get('resolve') === 'true';

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	const limit = parseInt(url.searchParams.get('limit') || '100');
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const orderBy = url.searchParams.get('orderBy') || undefined;
	const orderDir = url.searchParams.get('orderDir') || 'ASC';

	// Parse filter.column=value params for server-side WHERE filtering
	const filters = {};
	for (const [key, value] of url.searchParams.entries()) {
		if (key.startsWith('filter.') && value) {
			const column = key.slice(7); // strip 'filter.' prefix
			filters[column] = value;
		}
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// System tables (tasks.db) — read-only, no column metadata
		if (isSystemTable(tableName)) {
			const schema = getSystemTableSchema(path, tableName);
			const { rows, total } = getSystemTableRows(path, tableName, { limit, offset, orderBy, orderDir, filters });
			return json({ schema, rows, total, columnMeta: {}, _system: true });
		}

		const schema = getTableSchema(path, tableName);
		let { rows, total } = getTableRows(path, tableName, { limit, offset, orderBy, orderDir, filters });

		// Build columnMeta map { columnName: { semanticType, config, displayName, description } }
		const metaRows = getColumnMetadata(path, tableName);
		const columnMeta = {};
		for (const m of metaRows) {
			columnMeta[m.column_name] = {
				semanticType: m.semantic_type,
				config: m.config,
				displayName: m.display_name,
				description: m.description,
			};
		}

		if (resolve) {
			// 1. Resolve relation columns first
			rows = resolveRelationColumns(path, tableName, rows, metaRows);

			// 2. Evaluate formula columns (using resolved rows so formulas see display values)
			for (const [colName, meta] of Object.entries(columnMeta)) {
				if (meta.semanticType === 'formula' && meta.config?.expression) {
					for (const row of rows) {
						try {
							row[colName] = evaluateFormula(meta.config.expression, row, rows);
						} catch { row[colName] = null; }
					}
				}
			}
		}

		return json({ schema, rows, total, columnMeta });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
