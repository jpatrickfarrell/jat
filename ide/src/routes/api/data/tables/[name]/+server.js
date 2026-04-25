/**
 * Single Table API
 * GET    /api/data/tables/[name]?project=X  - Schema + rows + column metadata
 *     &resolve=true  - Resolve relation columns to display values and evaluate formulas (sqlite only)
 * PATCH  /api/data/tables/[name]            - Update table metadata (display_name, description)
 *     Body: { project, displayName?, description? }
 * DELETE /api/data/tables/[name]?project=X  - Drop table (alias of /api/data/tables?table=…)
 */
import { json } from '@sveltejs/kit';
import {
	getTableSchema, getTableRows, getColumnMetadata, resolveRelationColumns,
	updateDataTable, dropDataTable,
	isSystemTable, getSystemTableSchema, getSystemTableRows,
	isPostgresProject,
	pgGetTableSchema, pgGetTableRows, pgGetColumnMetadata,
	pgUpdateDataTable, pgDropDataTable, pgGetDataTable,
} from '$lib/server/jat-data.js';
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
		if (isPostgresProject(project)) {
			// System tables don't exist for postgres projects (mirror layer is sqlite-only).
			const [schema, { rows, total }, metaRows] = await Promise.all([
				pgGetTableSchema(project, tableName),
				pgGetTableRows(project, tableName, { limit, offset, orderBy, orderDir, filters }),
				pgGetColumnMetadata(project, tableName),
			]);

			const columnMeta = {};
			for (const m of metaRows) {
				columnMeta[m.column_name] = {
					semanticType: m.semantic_type,
					config: m.config,
					displayName: m.display_name,
					description: m.description,
				};
			}

			// Postgres v1: relation/formula resolution is sqlite-only. Evaluate
			// formulas in-process so /data still renders computed columns.
			if (resolve) {
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
		}

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

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const body = await request.json();
		const { project, displayName, description } = body;
		const tableName = params.name;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}
		if (displayName === undefined && description === undefined) {
			return json({ error: 'Provide at least one of: displayName, description' }, { status: 400 });
		}

		const opts = {};
		if (displayName !== undefined) opts.displayName = displayName;
		if (description !== undefined) opts.description = description;

		if (isPostgresProject(project)) {
			const exists = await pgGetDataTable(project, tableName);
			if (!exists) {
				return json({ error: `Table "${tableName}" not found` }, { status: 404 });
			}
			await pgUpdateDataTable(project, tableName, opts);
			return json({ success: true, table: tableName });
		}

		const { path, exists: projectExists } = await getProjectPath(project);
		if (!projectExists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = updateDataTable(path, tableName, opts);
		if (!result.updated) {
			return json({ error: `Table "${tableName}" not found` }, { status: 404 });
		}
		return json({ success: true, table: tableName });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}
	if (isSystemTable(tableName)) {
		return json({ error: 'Cannot delete system table' }, { status: 403 });
	}

	try {
		if (isPostgresProject(project)) {
			await pgDropDataTable(project, tableName);
			return json({ success: true });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		dropDataTable(path, tableName);
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
