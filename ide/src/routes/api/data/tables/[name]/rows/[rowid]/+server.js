/**
 * Single Row API
 * PUT    /api/data/tables/[name]/rows/[rowid]  - Update row
 * DELETE /api/data/tables/[name]/rows/[rowid]  - Delete row
 */
import { json } from '@sveltejs/kit';
import { updateRow, deleteRow } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	try {
		const body = await request.json();
		const { project, ...data } = body;
		const tableName = params.name;
		const rowid = parseInt(params.rowid);

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (isNaN(rowid)) {
			return json({ error: 'Invalid rowid' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = updateRow(path, tableName, rowid, data);
		if (result.changes === 0) {
			return json({ error: `Row ${rowid} not found in ${tableName}` }, { status: 404 });
		}
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;
	const rowid = parseInt(params.rowid);

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}
	if (isNaN(rowid)) {
		return json({ error: 'Invalid rowid' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = deleteRow(path, tableName, rowid);
		if (result.changes === 0) {
			return json({ error: `Row ${rowid} not found in ${tableName}` }, { status: 404 });
		}
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
