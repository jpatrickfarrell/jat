/**
 * Column Semantic-Metadata API
 *
 * Manages rows in `_columns` (sqlite) / `data_columns` (postgres). This is
 * the semantic-type layer (text/number/email/enum/...) on top of the raw
 * column type — it is intentionally separate from the column-operations
 * endpoint at ../columns/+server.js (which add/delete/duplicate/rename
 * actual columns on the backing table).
 *
 *   POST   /api/data/tables/[name]/column-meta
 *     Body: { project, column, semanticType, config?, displayName?, description? }
 *
 *   DELETE /api/data/tables/[name]/column-meta?project=X&column=Y
 */
import { json } from '@sveltejs/kit';
import {
	setColumnMetadata, deleteColumnMetadata, isSystemTable,
	isPostgresProject, pgSetColumnMetadata, pgDeleteColumnMetadata,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { project, column, semanticType, config, displayName, description } = body;
		const tableName = params.name;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}
		if (!project) return json({ error: 'Missing required field: project' }, { status: 400 });
		if (!column) return json({ error: 'Missing required field: column' }, { status: 400 });
		if (!semanticType) return json({ error: 'Missing required field: semanticType' }, { status: 400 });

		const opts = { displayName: displayName ?? null, description: description ?? null };

		if (isPostgresProject(project)) {
			await pgSetColumnMetadata(project, tableName, column, semanticType, config || {}, opts);
			return json({ success: true, table: tableName, column, semanticType });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) return json({ error: `Project not found: ${project}` }, { status: 404 });

		setColumnMetadata(path, tableName, column, semanticType, config || {}, opts);
		return json({ success: true, table: tableName, column, semanticType });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	try {
		const project = url.searchParams.get('project');
		const column = url.searchParams.get('column');
		const tableName = params.name;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}
		if (!project) return json({ error: 'Missing required parameter: project' }, { status: 400 });
		if (!column) return json({ error: 'Missing required parameter: column' }, { status: 400 });

		if (isPostgresProject(project)) {
			await pgDeleteColumnMetadata(project, tableName, column);
			return json({ success: true, table: tableName, column });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) return json({ error: `Project not found: ${project}` }, { status: 404 });

		deleteColumnMetadata(path, tableName, column);
		return json({ success: true, table: tableName, column });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
