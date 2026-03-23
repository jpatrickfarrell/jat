/**
 * GET /api/ingest/task-ids
 *
 * Returns a list of task IDs that came from external integrations (ingest DB).
 * Used by the UI to show "Reply" actions on integrated tasks.
 */
import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { join } from 'path';
import { homedir } from 'os';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const dbPath = join(homedir(), '.local', 'share', 'jat', 'ingest.db');
		const db = new Database(dbPath, { readonly: true });

		const rows = db.prepare('SELECT DISTINCT task_id FROM ingested_items WHERE task_id IS NOT NULL').all();
		db.close();

		const taskIds = rows.map(r => r.task_id);
		return json({ taskIds });
	} catch (err) {
		console.warn('[ingest/task-ids] Failed to query ingest DB:', err.message);
		return json({ taskIds: [] });
	}
}
