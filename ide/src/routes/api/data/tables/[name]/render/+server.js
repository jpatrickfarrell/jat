/**
 * Data Table Render API
 * POST /api/data/tables/[name]/render  - Render data table content as markdown
 */
import { json } from '@sveltejs/kit';
import { renderDataTable } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const tableName = params.name;

	try {
		const body = await request.json();
		const { project, contextQuery } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const rendered = renderDataTable(path, tableName, contextQuery || null);
		return json({ rendered });
	} catch (/** @type {any} */ error) {
		const msg = error?.message || String(error);
		if (msg.includes('not found')) {
			return json({ error: msg }, { status: 404 });
		}
		return json({ error: msg }, { status: 500 });
	}
}
