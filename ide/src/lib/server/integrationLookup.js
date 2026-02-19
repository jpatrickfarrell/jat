/**
 * Shared integration lookup - queries ingest.db for task→integration source mappings.
 * Used by both /api/tasks (enrichment) and /api/tasks/integrations (dedicated endpoint).
 */
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

function extractReferenceId(/** @type {string} */ itemId, /** @type {string} */ sourceType) {
	if (!itemId) return null;
	if (sourceType === 'supabase' && itemId.startsWith('supabase-')) {
		return itemId.slice('supabase-'.length);
	}
	return itemId;
}

/**
 * Look up integration sources for a list of task IDs.
 * @param {string[]} taskIds
 * @returns {Record<string, any>} Map of taskId → integration info
 */
export function lookupIntegrations(taskIds) {
	if (!taskIds.length || !existsSync(INGEST_DB_PATH)) return {};

	let db;
	try {
		db = new Database(INGEST_DB_PATH, { readonly: true });

		const placeholders = taskIds.map(() => '?').join(',');
		const rows = db.prepare(
			`SELECT task_id, source_id, item_id FROM ingested_items WHERE task_id IN (${placeholders})`
		).all(...taskIds);

		if (rows.length === 0) return {};

		const config = loadIntegrationsConfig();
		/** @type {Map<string, any>} */
		const sourceMap = new Map();
		for (const source of config.sources || []) {
			sourceMap.set(source.id, source);
		}

		/** @type {Record<string, any>} */
		const integrations = {};
		for (const row of /** @type {any[]} */ (rows)) {
			const source = sourceMap.get(row.source_id);
			const sourceType = source?.type || 'unknown';
			const referenceId = extractReferenceId(row.item_id, sourceType);

			/** @type {any} */
			const entry = {
				sourceId: row.source_id,
				sourceType,
				sourceName: source ? (source.channel || source.feedUrl || source.chatId || source.id) : row.source_id,
				sourceEnabled: source?.enabled ?? false,
				itemId: row.item_id || null,
				referenceId
			};

			if (source?.callback) entry.callback = source.callback;
			if (source?.actions && Array.isArray(source.actions)) entry.actions = source.actions;
			if (source?.projectUrl) entry.projectUrl = source.projectUrl;

			integrations[row.task_id] = entry;
		}

		return integrations;
	} catch (error) {
		console.error('Error looking up task integrations:', error);
		return {};
	} finally {
		db?.close();
	}
}
