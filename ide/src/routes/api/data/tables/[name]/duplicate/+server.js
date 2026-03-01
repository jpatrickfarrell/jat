/**
 * Duplicate Table API
 * POST /api/data/tables/[name]/duplicate  - Duplicate a table (schema + data + metadata)
 */
import { json } from '@sveltejs/kit';
import { duplicateDataTable } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const sourceName = params.name;

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

	const targetName = newName?.trim() || `${sourceName}_copy`;

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		duplicateDataTable(path, sourceName, targetName);
		return json({ success: true, sourceName, newName: targetName });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status = message.includes('already exists') ? 409 : message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
}
