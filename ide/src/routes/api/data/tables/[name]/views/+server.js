/**
 * Views API for a specific table
 * GET  /api/data/tables/[name]/views?project=X  - List views for table
 * POST /api/data/tables/[name]/views             - Create new view
 */
import { json } from '@sveltejs/kit';
import { getViews, createView, initDataDb } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const views = getViews(path, tableName);
		return json({ views });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const tableName = params.name;

	try {
		const body = await request.json();
		const { project, ...data } = body;

		if (!project) {
			return json({ error: 'Missing required parameter: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		initDataDb(path);
		const view = createView(path, tableName, data);
		return json({ view }, { status: 201 });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
