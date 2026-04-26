/**
 * Batch Row Update API
 * POST /api/data/tables/[name]/rows/batch-update
 *   Body: { project, column, updates: [{rowid, value}] }
 *
 * Updates a single column across many rows in one transaction.
 * Used by structural undo to restore column data after an undo-delete-column.
 */
import { json } from '@sveltejs/kit';
import {
	batchUpdateRows, isSystemTable,
	isPostgresProject, pgBatchUpdateRows,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { broadcastDataChanged } from '$lib/server/websocket';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { project, column, updates } = body;
		const tableName = params.name;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}
		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!column) {
			return json({ error: 'Missing required field: column' }, { status: 400 });
		}
		if (!Array.isArray(updates)) {
			return json({ error: 'updates must be an array of {rowid, value}' }, { status: 400 });
		}

		if (isPostgresProject(project)) {
			const result = await pgBatchUpdateRows(project, tableName, column, updates);
			broadcastDataChanged(tableName, project, 'update');
			return json({ success: true, updated: result.updated });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = batchUpdateRows(path, tableName, column, updates);
		broadcastDataChanged(tableName, project, 'update');
		return json({ success: true, updated: result.updated });
	} catch (/** @type {any} */ error) {
		return json({ error: error.message }, { status: 400 });
	}
}
