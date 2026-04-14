/**
 * GET /api/ingest/task-ids
 *
 * Returns a list of task IDs that came from external integrations.
 * Previously queried ingest.db ingested_items; now queries tasks.db tasks.source.
 */
import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const projectPath = process.cwd().replace(/\/ide$/, '');
	const dbPath = join(projectPath, '.jat', 'tasks.db');

	if (!existsSync(dbPath)) {
		return json({ taskIds: [] });
	}

	try {
		const db = new Database(dbPath, { readonly: true });

		const cols = /** @type {any[]} */ (db.pragma('table_info(tasks)')).map((c) => c.name);
		if (!cols.includes('source')) {
			db.close();
			return json({ taskIds: [] });
		}

		const rows = /** @type {any[]} */ (
			db.prepare('SELECT DISTINCT id FROM tasks WHERE source IS NOT NULL').all()
		);
		db.close();

		const taskIds = rows.map((r) => r.id);
		return json({ taskIds });
	} catch (err) {
		console.warn('[ingest/task-ids] Failed to query tasks DB:', err.message);
		return json({ taskIds: [] });
	}
}
