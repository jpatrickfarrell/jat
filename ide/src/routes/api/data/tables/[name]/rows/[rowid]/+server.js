/**
 * Single Row API
 * GET    /api/data/tables/[name]/rows/[rowid]?project=X  - Fetch single row
 * PUT    /api/data/tables/[name]/rows/[rowid]            - Update row (inline cell edit)
 * DELETE /api/data/tables/[name]/rows/[rowid]?project=X  - Delete row
 *
 * rowid is parsed as an integer for sqlite projects and passed through as a
 * string (UUID) for postgres projects. The dispatch checks isPostgresProject(project)
 * before deciding which path to take, so the same URL works for both backends.
 */
import { json } from '@sveltejs/kit';
import {
	getRow, updateRow, deleteRow, isSystemTable,
	isPostgresProject,
	pgGetRow, pgUpdateRow, pgDeleteRow,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { broadcastDataChanged } from '$lib/server/websocket';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;
	const rowidParam = params.rowid;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		if (isPostgresProject(project)) {
			const row = await pgGetRow(project, tableName, rowidParam);
			if (!row) {
				return json({ error: `Row ${rowidParam} not found in ${tableName}` }, { status: 404 });
			}
			return json({ row });
		}

		const rowid = parseInt(rowidParam);
		if (isNaN(rowid)) {
			return json({ error: 'Invalid rowid' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const row = getRow(path, tableName, rowid);
		if (!row) {
			return json({ error: `Row ${rowid} not found in ${tableName}` }, { status: 404 });
		}
		return json({ row });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	try {
		const body = await request.json();
		const { project, ...data } = body;
		const tableName = params.name;
		const rowidParam = params.rowid;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		if (isPostgresProject(project)) {
			const result = await pgUpdateRow(project, tableName, rowidParam, data);
			if (result.changes === 0) {
				return json({ error: `Row ${rowidParam} not found in ${tableName}` }, { status: 404 });
			}
			broadcastDataChanged(tableName, project, 'update');
			return json({ success: true });
		}

		const rowid = parseInt(rowidParam);
		if (isNaN(rowid)) {
			return json({ error: 'Invalid rowid' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = updateRow(path, tableName, rowid, data);
		if (result.changes === 0) {
			return json({ error: `Row ${rowid} not found in ${tableName}` }, { status: 404 });
		}
		broadcastDataChanged(tableName, project, 'update');
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;
	const rowidParam = params.rowid;

	if (isSystemTable(tableName)) {
		return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
	}

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		if (isPostgresProject(project)) {
			const result = await pgDeleteRow(project, tableName, rowidParam);
			if (result.changes === 0) {
				return json({ error: `Row ${rowidParam} not found in ${tableName}` }, { status: 404 });
			}
			broadcastDataChanged(tableName, project, 'delete');
			return json({ success: true });
		}

		const rowid = parseInt(rowidParam);
		if (isNaN(rowid)) {
			return json({ error: 'Invalid rowid' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = deleteRow(path, tableName, rowid);
		if (result.changes === 0) {
			return json({ error: `Row ${rowid} not found in ${tableName}` }, { status: 404 });
		}
		broadcastDataChanged(tableName, project, 'delete');
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
