/**
 * Table Schema API
 * GET /api/data/tables/[name]/schema?project=X
 *   Returns the column definitions for a data table. For postgres projects,
 *   reads from data_columns; for sqlite, reads from the table's pragma +
 *   _columns metadata. Response shape:
 *     { schema: [{cid, name, type, notnull, dflt_value, pk, semanticType?, config?, displayName?, columnDescription?}], columnMeta }
 */
import { json } from '@sveltejs/kit';
import {
	getTableSchema, getColumnMetadata, isSystemTable, getSystemTableSchema,
	isPostgresProject, pgGetTableSchema, pgGetColumnMetadata,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		if (isPostgresProject(project)) {
			const [schema, meta] = await Promise.all([
				pgGetTableSchema(project, tableName),
				pgGetColumnMetadata(project, tableName),
			]);
			const columnMeta = {};
			for (const m of meta) {
				columnMeta[m.column_name] = {
					semanticType: m.semantic_type,
					config: m.config,
					displayName: m.display_name,
					description: m.description,
				};
			}
			return json({ schema, columnMeta });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		if (isSystemTable(tableName)) {
			return json({ schema: getSystemTableSchema(path, tableName), columnMeta: {}, _system: true });
		}

		const schema = getTableSchema(path, tableName);
		const meta = getColumnMetadata(path, tableName);
		const columnMeta = {};
		for (const m of meta) {
			columnMeta[m.column_name] = {
				semanticType: m.semantic_type,
				config: m.config,
				displayName: m.display_name,
				description: m.description,
			};
		}
		return json({ schema, columnMeta });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
