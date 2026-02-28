/**
 * Column Operations API
 * POST /api/data/tables/[name]/columns - Add, delete, duplicate, or rename columns
 */
import { json } from '@sveltejs/kit';
import { addColumn, deleteColumn, duplicateColumn, renameColumn } from '$lib/server/jat-data.js';
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
		if (!action) {
			return json({ error: 'Missing required field: action' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		switch (action) {
			case 'add': {
				const { column, sqliteType, semanticType, config } = body;
				if (!column) {
					return json({ error: 'Missing required field: column' }, { status: 400 });
				}
				addColumn(path, tableName, column, sqliteType || 'TEXT', semanticType, config || {});
				return json({ success: true, action: 'add', column });
			}

			case 'delete': {
				const { column } = body;
				if (!column) {
					return json({ error: 'Missing required field: column' }, { status: 400 });
				}
				deleteColumn(path, tableName, column);
				return json({ success: true, action: 'delete', column });
			}

			case 'duplicate': {
				const { sourceColumn, newName } = body;
				if (!sourceColumn) {
					return json({ error: 'Missing required field: sourceColumn' }, { status: 400 });
				}
				if (!newName) {
					return json({ error: 'Missing required field: newName' }, { status: 400 });
				}
				duplicateColumn(path, tableName, sourceColumn, newName);
				return json({ success: true, action: 'duplicate', sourceColumn, newName });
			}

			case 'rename': {
				const { column, newName } = body;
				if (!column) {
					return json({ error: 'Missing required field: column' }, { status: 400 });
				}
				if (!newName) {
					return json({ error: 'Missing required field: newName' }, { status: 400 });
				}
				renameColumn(path, tableName, column, newName);
				return json({ success: true, action: 'rename', column, newName });
			}

			default:
				return json({ error: `Unknown action: ${action}. Valid actions: add, delete, duplicate, rename` }, { status: 400 });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
