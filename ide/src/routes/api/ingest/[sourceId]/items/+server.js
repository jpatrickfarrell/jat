/**
 * Ingest Items API
 *
 * GET /api/ingest/[sourceId]/items?limit=20&offset=0
 *
 * Returns paginated tasks for a specific source from tasks.db (tasks.source column).
 * Previously queried ingest.db ingested_items; now uses tasks.source.
 */

import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const { sourceId } = params;

	if (!sourceId) {
		return json({ error: 'Missing sourceId' }, { status: 400 });
	}

	const projectPath = process.cwd().replace(/\/ide$/, '');
	const dbPath = join(projectPath, '.jat', 'tasks.db');

	if (!existsSync(dbPath)) {
		return json({ items: [], total: 0, hasMore: false });
	}

	const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1), 100);
	const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

	let db;
	try {
		db = new Database(dbPath, { readonly: true });

		// Check source column exists
		const cols = /** @type {any[]} */ (db.pragma('table_info(tasks)')).map((c) => c.name);
		if (!cols.includes('source')) {
			return json({ items: [], total: 0, hasMore: false });
		}

		/** @type {any} */
		const countRow = db
			.prepare('SELECT COUNT(*) as total FROM tasks WHERE source = ?')
			.get(sourceId);
		const total = countRow?.total ?? 0;

		const items = db
			.prepare(
				`SELECT id as task_id, source_item_id as item_id, title, created_at as ingested_at
				 FROM tasks WHERE source = ?
				 ORDER BY created_at DESC LIMIT ? OFFSET ?`
			)
			.all(sourceId, limit, offset);

		return json({
			items,
			total,
			hasMore: offset + limit < total
		});
	} catch (error) {
		console.error('Error reading ingest items:', error);
		return json({ error: 'Failed to read ingest data' }, { status: 500 });
	} finally {
		db?.close();
	}
}
