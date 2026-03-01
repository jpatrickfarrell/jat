/**
 * Base Search API
 * GET /api/bases/search?project=X&q=QUERY[&limit=20]  - FTS search
 */
import { json } from '@sveltejs/kit';
import { searchBases } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	const query = url.searchParams.get('q');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}
	if (!query) {
		return json({ error: 'Missing required parameter: q' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const results = searchBases(path, query, { limit });
		return json({ results });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
