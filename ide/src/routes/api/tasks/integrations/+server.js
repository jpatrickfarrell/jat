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
import { lookupIntegrations } from '$lib/server/integrationLookup.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const taskIdsParam = url.searchParams.get('taskIds');
	if (!taskIdsParam) return json({ integrations: {} });

	const taskIds = taskIdsParam.split(',').filter(Boolean);
	if (taskIds.length === 0) return json({ integrations: {} });

	const integrations = lookupIntegrations(taskIds);
	return json({ integrations });
}
