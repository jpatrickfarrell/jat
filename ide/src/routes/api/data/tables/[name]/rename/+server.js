/**
 * Rename Table API
 * POST /api/data/tables/[name]/rename  - Rename a table
 */
import { json } from '@sveltejs/kit';
import {
	renameDataTable,
	isSystemTable,
	isPostgresProject,
	pgRenameDataTable,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const oldName = params.name;

	if (isSystemTable(oldName)) {
		return json({ error: 'Cannot rename system table (read-only)' }, { status: 403 });
	}

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

	const trimmedNewName = newName.trim();

	try {
		if (isPostgresProject(project)) {
			await pgRenameDataTable(project, oldName, trimmedNewName);
			return json({ success: true, oldName, newName: trimmedNewName });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		renameDataTable(path, oldName, trimmedNewName);
		return json({ success: true, oldName, newName: trimmedNewName });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status = message.includes('already exists') ? 409 : message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
}
