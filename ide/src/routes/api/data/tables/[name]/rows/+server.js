/**
 * Table Rows API
 * POST /api/data/tables/[name]/rows  - Insert row or duplicate row
 *   Body: { project, ...data }                     - Insert new row
 *   Body: { project, action: "duplicate", rowid }  - Duplicate existing row
 */
import { json } from '@sveltejs/kit';
import { insertRow, duplicateRow, initDataDb } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { project, action } = body;
		const tableName = params.name;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		initDataDb(path);

		if (action === 'duplicate') {
			const { rowid } = body;
			if (rowid == null) {
				return json({ error: 'Missing required field: rowid' }, { status: 400 });
			}
			const result = duplicateRow(path, tableName, rowid);
			return json({ success: true, action: 'duplicate', rowid: result.rowid });
		}

		// Default: insert new row
		const { action: _action, ...data } = body;
		const result = insertRow(path, tableName, data);
		return json({ success: true, rowid: result.rowid });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
