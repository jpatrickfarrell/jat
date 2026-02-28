/**
 * Single Table API
 * GET /api/data/tables/[name]?project=X  - Schema + rows + column metadata
 */
import { json } from '@sveltejs/kit';
import { getTableSchema, getTableRows, getColumnMetadata } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	const limit = parseInt(url.searchParams.get('limit') || '100');
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const orderBy = url.searchParams.get('orderBy') || undefined;
	const orderDir = url.searchParams.get('orderDir') || 'ASC';

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const schema = getTableSchema(path, tableName);
		const { rows, total } = getTableRows(path, tableName, { limit, offset, orderBy, orderDir });

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

		return json({ schema, rows, total, columnMeta });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
