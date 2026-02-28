/**
 * Column Metadata API
 * PUT    /api/data/tables/[name]/columns/[column]  - Set/update semantic type + config
 * DELETE /api/data/tables/[name]/columns/[column]  - Remove metadata (revert to raw type)
 */
import { json } from '@sveltejs/kit';
import { setColumnMetadata, deleteColumnMetadata } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	try {
		const body = await request.json();
		const { project, semanticType, config, displayName, description } = body;
		const tableName = params.name;
		const columnName = params.column;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!semanticType) {
			return json({ error: 'Missing required field: semanticType' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		setColumnMetadata(path, tableName, columnName, semanticType, config || {}, {
			displayName,
			description,
		});
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;
	const columnName = params.column;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		deleteColumnMetadata(path, tableName, columnName);
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
