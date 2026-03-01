/**
 * Rename Table API
 * POST /api/data/tables/[name]/rename  - Rename a table
 */
import { json } from '@sveltejs/kit';
import { renameDataTable } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const oldName = params.name;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { project, newName } = body;

	if (!project) {
		return json({ error: 'Missing required field: project' }, { status: 400 });
	}
	if (!newName || !newName.trim()) {
		return json({ error: 'Missing required field: newName' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		renameDataTable(path, oldName, newName.trim());
		return json({ success: true, oldName, newName: newName.trim() });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status = message.includes('already exists') ? 409 : message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
}
