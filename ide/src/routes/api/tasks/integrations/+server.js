/**
 * Task Integration Lookup API
 *
 * GET /api/tasks/integrations?taskIds=id1,id2,...  (required)
 *
 * Looks up which integration source (if any) created each task by querying
 * the ingest database's ingested_items table, then joining with integrations.json.
 * The taskIds parameter is required — the client sends only the IDs of
 * tasks currently displayed on the page.
 *
 * Returns a map of taskId → { sourceId, sourceType, sourceName, sourceEnabled,
 *   callback?, actions?, itemId?, referenceId? }
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

/**
 * Extract the external reference ID from the ingest item_id.
 * For supabase items, item_id is "supabase-{uuid}" → extract the UUID.
 * For other types, return the item_id as-is.
 */
function extractReferenceId(/** @type {string} */ itemId, /** @type {string} */ sourceType) {
	if (!itemId) return null;
	if (sourceType === 'supabase' && itemId.startsWith('supabase-')) {
		return itemId.slice('supabase-'.length);
	}
	return itemId;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	if (!existsSync(INGEST_DB_PATH)) {
		return json({ integrations: {} });
	}

	let db;
	try {
		db = new Database(INGEST_DB_PATH, { readonly: true });

		const taskIdsParam = url.searchParams.get('taskIds');
		if (!taskIdsParam) return json({ integrations: {} });

		const taskIds = taskIdsParam.split(',').filter(Boolean);
		if (taskIds.length === 0) return json({ integrations: {} });

		const placeholders = taskIds.map(() => '?').join(',');
		const rows = db.prepare(
			`SELECT task_id, source_id, item_id FROM ingested_items WHERE task_id IN (${placeholders})`
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

		// Build result map: taskId → integration info (enriched with callback/actions)
		/** @type {Record<string, any>} */
		const integrations = {};
		for (const row of /** @type {any[]} */ (rows)) {
			const source = sourceMap.get(row.source_id);
			const sourceType = source?.type || 'unknown';
			const referenceId = extractReferenceId(/** @type {string} */ (row.item_id), /** @type {string} */ (sourceType));

			/** @type {any} */
			const entry = {
				sourceId: row.source_id,
				sourceType,
				sourceName: source ? (source.channel || source.feedUrl || source.chatId || source.id) : row.source_id,
				sourceEnabled: source?.enabled ?? false,
				itemId: row.item_id || null,
				referenceId
			};

			// Include callback config if present
			if (source?.callback) {
				entry.callback = source.callback;
			}

			// Include actions if present
			if (source?.actions && Array.isArray(source.actions)) {
				entry.actions = source.actions;
			}

			// Include projectUrl for link template resolution
			if (source?.projectUrl) {
				entry.projectUrl = source.projectUrl;
			}

			integrations[row.task_id] = entry;
		}

		return json({ integrations });
	} catch (error) {
		console.error('Error looking up task integrations:', error);
		return json({ error: 'Failed to look up integrations' }, { status: 500 });
	} finally {
		db?.close();
	}
}
