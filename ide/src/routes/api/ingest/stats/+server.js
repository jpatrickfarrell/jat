/**
 * Ingest Stats API
 *
 * GET /api/ingest/stats
 *
 * Returns per-source task counts from tasks.db (source column).
 * Previously queried ingest.db ingested_items; now uses tasks.source.
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
		return json({ stats: {} });
	}

	let db;
	try {
		db = new Database(dbPath, { readonly: true });

		// Check source column exists
		const cols = /** @type {any[]} */ (db.pragma('table_info(tasks)')).map((c) => c.name);
		if (!cols.includes('source')) {
			return json({ stats: {} });
		}

		const rows = /** @type {any[]} */ (
			db.prepare(
				`SELECT source, COUNT(*) as total, MAX(created_at) as lastIngested
				 FROM tasks
				 WHERE source IS NOT NULL
				 GROUP BY source`
			).all()
		);

		/** @type {Record<string, { total: number, lastIngested: string | null }>} */
		const stats = {};
		for (const row of rows) {
			stats[row.source] = {
				total: row.total,
				lastIngested: row.lastIngested || null
			};
		}

		return json({ stats });
	} catch (error) {
		console.error('Error reading ingest stats:', error);
		return json({ error: 'Failed to read ingest stats' }, { status: 500 });
	} finally {
		db?.close();
	}
}
