/**
 * Task Integration Lookup API
 *
 * GET /api/tasks/integrations?taskIds=id1,id2,...
 *
 * Looks up which integration source (if any) created each task by querying
 * the ingest database's ingested_items table, then joining with integrations.json.
 *
 * Returns a map of taskId → { sourceId, sourceType, sourceName, sourceEnabled }
 */

import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const INGEST_DB_PATH = join(homedir(), '.local/share/jat/ingest.db');
const INTEGRATIONS_CONFIG_PATH = join(homedir(), '.config/jat/integrations.json');

function loadIntegrationsConfig() {
	try {
		if (!existsSync(INTEGRATIONS_CONFIG_PATH)) return { sources: [] };
		return JSON.parse(readFileSync(INTEGRATIONS_CONFIG_PATH, 'utf-8'));
	} catch {
		return { sources: [] };
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const taskIdsParam = url.searchParams.get('taskIds');
	if (!taskIdsParam) {
		return json({ integrations: {} });
	}

	const taskIds = taskIdsParam.split(',').filter(Boolean).slice(0, 200);
	if (taskIds.length === 0) {
		return json({ integrations: {} });
	}

	if (!existsSync(INGEST_DB_PATH)) {
		return json({ integrations: {} });
	}

	let db;
	try {
		db = new Database(INGEST_DB_PATH, { readonly: true });

		// Query ingested_items for all matching task_ids
		const placeholders = taskIds.map(() => '?').join(',');
		const rows = db.prepare(
			`SELECT task_id, source_id FROM ingested_items WHERE task_id IN (${placeholders})`
		).all(...taskIds);

		if (rows.length === 0) {
			return json({ integrations: {} });
		}

		// Load integrations config to get source metadata
		const config = loadIntegrationsConfig();
		/** @type {Map<string, any>} */
		const sourceMap = new Map();
		for (const source of config.sources || []) {
			sourceMap.set(source.id, source);
		}

		// Build result map: taskId → integration info
		/** @type {Record<string, { sourceId: string, sourceType: string, sourceName: string, sourceEnabled: boolean }>} */
		const integrations = {};
		for (const row of /** @type {any[]} */ (rows)) {
			const source = sourceMap.get(row.source_id);
			integrations[row.task_id] = {
				sourceId: row.source_id,
				sourceType: source?.type || 'unknown',
				sourceName: source ? (source.channel || source.feedUrl || source.chatId || source.id) : row.source_id,
				sourceEnabled: source?.enabled ?? false
			};
		}

		return json({ integrations });
	} catch (error) {
		console.error('Error looking up task integrations:', error);
		return json({ error: 'Failed to look up integrations' }, { status: 500 });
	} finally {
		db?.close();
	}
}
