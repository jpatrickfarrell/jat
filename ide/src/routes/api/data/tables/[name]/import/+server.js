/**
 * Table Import API
 * POST /api/data/tables/[name]/import
 *
 * Accepts:
 *   { text: "raw tsv/csv", format?: "tsv"|"csv", columnMap?: {from: to} }
 *   { rows: [{col: val}, ...] }
 */
import { json } from '@sveltejs/kit';
import { initDataDb, insertRows, getTableSchema, isSystemTable } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { parseDelimited } from '$lib/server/tsvParser.js';
import { broadcastDataChanged } from '$lib/server/websocket';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { project, text, format, columnMap, rows: rawRows } = body;
		const tableName = params.name;

		if (isSystemTable(tableName)) {
			return json({ error: 'Cannot import into system table (read-only)' }, { status: 403 });
		}

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		initDataDb(path);

		let rows;
		let headers;

		if (text) {
			// Parse TSV/CSV text
			const parsed = parseDelimited(text, { format, columnMap });
			rows = parsed.rows;
			headers = parsed.headers;
		} else if (rawRows && Array.isArray(rawRows)) {
			// Pre-parsed rows
			rows = rawRows;
			headers = rows.length > 0 ? Object.keys(rows[0]) : [];
		} else {
			return json({ error: 'Provide either "text" (TSV/CSV content) or "rows" (array of objects)' }, { status: 400 });
		}

		if (rows.length === 0) {
			return json({ error: 'No rows to import' }, { status: 400 });
		}

		// Get table schema for column matching info
		const schema = getTableSchema(path, tableName);
		const tableColumns = schema.map((/** @type {any} */ c) => c.name);

		// Find which parsed columns match table columns
		const matched = headers.filter((/** @type {string} */ h) => tableColumns.includes(h));
		const unmatched = headers.filter((/** @type {string} */ h) => !tableColumns.includes(h));

		const result = insertRows(path, tableName, rows);
		broadcastDataChanged(tableName, project, 'import');

		return json({
			success: true,
			inserted: result.inserted,
			columns: {
				matched,
				unmatched,
				tableColumns
			}
		});
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
