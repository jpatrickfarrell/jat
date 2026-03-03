/**
 * Data Tables API
 * GET  /api/data/tables?project=X   - List tables
 * POST /api/data/tables             - Create table
 * DELETE /api/data/tables?project=X&table=Y - Drop table
 */
import { json } from '@sveltejs/kit';
import { getDataTables, createDataTable, dropDataTable, initDataDb, getAllViews } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const tables = getDataTables(path);
		const views = getAllViews(path);
		return json({ tables, views });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/**
 * POST body columns may include: { name, type, semanticType?, config? }
 * If semanticType is provided, `type` is auto-derived from the semantic mapping.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, name, columns, displayName, description } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!name) {
			return json({ error: 'Missing required field: name' }, { status: 400 });
		}
		if (!columns || !Array.isArray(columns) || columns.length === 0) {
			return json({ error: 'At least one column is required' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Auto-init data.db if needed
		initDataDb(path);

		createDataTable(path, name, columns, { displayName, description });
		return json({ success: true, table: name });
	} catch (error) {
		const status = error.message.includes('already exists') ? 409 : 400;
		return json({ error: error.message }, { status });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ url }) {
	const project = url.searchParams.get('project');
	const table = url.searchParams.get('table');

	if (!project || !table) {
		return json({ error: 'Missing required parameters: project, table' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		dropDataTable(path, table);
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
