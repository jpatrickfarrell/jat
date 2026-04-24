/**
 * Bulk Row Insert API
 *   POST /api/data/tables/[name]/rows/bulk-insert
 *     Body: { project, rows: [{...}, {...}] }
 *
 * Inserts many rows in a single transaction. Used by `jt data
 * migrate-to-postgres` to copy local SQLite data up; the v1 SQL
 * translator only supports single-table CRUD with equality WHERE,
 * so batched `INSERT INTO ... VALUES (...), (...)` cannot be sent
 * through /api/data/exec.
 *
 * Returns { success, inserted, rowids }.
 */
import { json } from '@sveltejs/kit';
import {
	insertRows, isSystemTable, initDataDb,
	isPostgresProject, pgInsertRows,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { broadcastDataChanged } from '$lib/server/websocket';

const MAX_ROWS_PER_REQUEST = 5000;

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { project, rows } = body;
		const tableName = params.name;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot modify system table (read-only)' }, { status: 403 });
		}
		if (!project) return json({ error: 'Missing required field: project' }, { status: 400 });
		if (!Array.isArray(rows)) {
			return json({ error: 'Missing or invalid field: rows (array required)' }, { status: 400 });
		}
		if (rows.length === 0) {
			return json({ success: true, inserted: 0, rowids: [] });
		}
		if (rows.length > MAX_ROWS_PER_REQUEST) {
			return json({
				error: `Too many rows in one request: ${rows.length} (max ${MAX_ROWS_PER_REQUEST}). Chunk client-side.`,
			}, { status: 413 });
		}

		if (isPostgresProject(project)) {
			const result = await pgInsertRows(project, tableName, rows);
			broadcastDataChanged(tableName, project, 'insert');
			return json({ success: true, ...result });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) return json({ error: `Project not found: ${project}` }, { status: 404 });

		initDataDb(path);
		const result = insertRows(path, tableName, rows);
		broadcastDataChanged(tableName, project, 'insert');
		return json({ success: true, ...result });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
