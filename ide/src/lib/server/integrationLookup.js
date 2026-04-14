/**
 * Shared integration lookup - maps tasks to their originating integration source.
 * Reads from tasks.source + tasks.metadata columns (added in jat-on1rt.1).
 *
 * Two usage modes:
 *   1. lookupIntegrations(tasks)           — tasks already have source/source_item_id
 *   2. lookupIntegrations(taskIds, dbPath) — query tasks.db by ID
 */
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const INTEGRATIONS_CONFIG_PATH = join(homedir(), '.config/jat/integrations.json');

function loadIntegrationsConfig() {
	try {
		if (!existsSync(INTEGRATIONS_CONFIG_PATH)) return { sources: [] };
		return JSON.parse(readFileSync(INTEGRATIONS_CONFIG_PATH, 'utf-8'));
	} catch {
		return { sources: [] };
	}
}

function extractReferenceId(/** @type {string|null} */ itemId, /** @type {string} */ sourceType) {
	if (!itemId) return null;
	if (sourceType === 'supabase' && itemId.startsWith('supabase-')) {
		let stripped = itemId.slice('supabase-'.length);
		if (stripped.startsWith('reject-')) {
			const afterReject = stripped.slice('reject-'.length);
			const uuidMatch = afterReject.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
			if (uuidMatch) return uuidMatch[1];
		}
		return stripped;
	}
	return itemId;
}

function buildEntry(row, sourceMap) {
	if (!row.source) return null;

	const isRejection = row.source_item_id && row.source_item_id.includes('-reject-');

	// Try both source type and source id as lookup keys
	const source = sourceMap.get(row.source);
	const sourceType = row.source;
	const referenceId = extractReferenceId(row.source_item_id || null, sourceType);

	/** @type {any} */
	const entry = {
		sourceId: source?.id || row.source,
		sourceType,
		sourceName: source
			? source.channel || source.feedUrl || source.chatId || source.id
			: row.source,
		sourceEnabled: source?.enabled ?? false,
		itemId: row.source_item_id || null,
		referenceId,
		_isRejection: isRejection
	};

	if (source?.callback) entry.callback = source.callback;
	if (source?.actions && Array.isArray(source.actions)) entry.actions = source.actions;
	if (source?.projectUrl) entry.projectUrl = source.projectUrl;

	return entry;
}

/**
 * Look up integration sources for a list of tasks or task IDs.
 *
 * @param {(string | { id: string; source?: string; source_item_id?: string; metadata?: string })[]} tasksOrIds
 * @param {string} [projectPath] - Project root path (only needed when passing task IDs as strings)
 * @returns {Record<string, any>} Map of taskId → integration info
 */
export function lookupIntegrations(tasksOrIds, projectPath) {
	if (!tasksOrIds.length) return {};

	const config = loadIntegrationsConfig();
	/** @type {Map<string, any>} */
	const sourceMap = new Map();
	for (const source of config.sources || []) {
		sourceMap.set(source.type, source);
		sourceMap.set(source.id, source);
	}

	// Mode 1: tasks array with source fields already populated
	if (typeof tasksOrIds[0] === 'object') {
		/** @type {Record<string, any>} */
		const integrations = {};
		for (const task of /** @type {any[]} */ (tasksOrIds)) {
			if (!task.source) continue;
			const entry = buildEntry(task, sourceMap);
			if (!entry) continue;
			if (entry._isRejection && integrations[task.id]) continue;
			delete entry._isRejection;
			integrations[task.id] = entry;
		}
		return integrations;
	}

	// Mode 2: string task IDs — query tasks.db
	const taskIds = /** @type {string[]} */ (tasksOrIds);
	if (!projectPath) return {};

	const dbPath = join(projectPath, '.jat', 'tasks.db');
	if (!existsSync(dbPath)) return {};

	let db;
	try {
		db = new Database(dbPath, { readonly: true });

		const cols = /** @type {any[]} */ (db.pragma('table_info(tasks)')).map((c) => c.name);
		if (!cols.includes('source')) return {};

		const placeholders = taskIds.map(() => '?').join(',');
		const rows = /** @type {any[]} */ (
			db
				.prepare(
					`SELECT id, source, source_item_id, metadata FROM tasks WHERE id IN (${placeholders}) AND source IS NOT NULL`
				)
				.all(...taskIds)
		);

		/** @type {Record<string, any>} */
		const integrations = {};
		for (const row of rows) {
			const entry = buildEntry(row, sourceMap);
			if (!entry) continue;
			if (entry._isRejection && integrations[row.id]) continue;
			delete entry._isRejection;
			integrations[row.id] = entry;
		}
		return integrations;
	} catch (error) {
		console.error('Error looking up task integrations:', error);
		return {};
	} finally {
		db?.close();
	}
}
