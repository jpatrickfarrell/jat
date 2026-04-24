/**
 * Table Rows API
 * GET  /api/data/tables/[name]/rows?project=X&offset&limit&search
 *                                                     - List rows (paginated)
 * POST /api/data/tables/[name]/rows  - Insert row or duplicate row
 *   Body: { project, ...data }                     - Insert new row
 *   Body: { project, action: "duplicate", rowid }  - Duplicate existing row
 */
import { json } from '@sveltejs/kit';
import {
	insertRow, duplicateRow, initDataDb, isSystemTable,
	getTableRows, getColumnMetadata,
	isPostgresProject, pgInsertRow, pgGetTableRows, pgGetColumnMetadata,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { broadcastDataChanged } from '$lib/server/websocket';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000));
	const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0'));
	const orderBy = url.searchParams.get('orderBy') || undefined;
	const orderDir = url.searchParams.get('orderDir') || 'ASC';
	const search = url.searchParams.get('search') || undefined;

	const filters = {};
	for (const [key, value] of url.searchParams.entries()) {
		if (key.startsWith('filter.') && value) {
			filters[key.slice(7)] = value;
		}
	}

	try {
		if (isPostgresProject(project)) {
			const { rows, total } = await pgGetTableRows(project, tableName, {
				limit, offset, orderBy, orderDir, filters, search,
			});
			const columns = await pgGetColumnMetadata(project, tableName);
			return json({ rows, total, count: total, columns });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const { rows, total } = getTableRows(path, tableName, { limit, offset, orderBy, orderDir, filters });
		const columns = getColumnMetadata(path, tableName);
		return json({ rows, total, count: total, columns });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { project, action } = body;
		const tableName = params.name;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		if (isPostgresProject(project)) {
			if (action === 'duplicate') {
				return json({ error: 'duplicate action is not yet supported for postgres-backed projects' }, { status: 501 });
			}
			const { action: _action, project: _project, ...data } = body;
			const result = await pgInsertRow(project, tableName, data);
			broadcastDataChanged(tableName, project, 'insert');
			return json({ success: true, rowid: result.rowid });
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
			broadcastDataChanged(tableName, project, 'insert');
			return json({ success: true, action: 'duplicate', rowid: result.rowid });
		}

		// Default: insert new row
		const { action: _action, ...data } = body;
		const result = insertRow(path, tableName, data);
		broadcastDataChanged(tableName, project, 'insert');
		return json({ success: true, rowid: result.rowid });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
