/**
 * Task Integration Lookup API
 *
 * GET /api/tasks/integrations?taskIds=id1,id2,...  (required)
 * GET /api/tasks/integrations?taskIds=...&project=jat  (optional project for scoped lookup)
 *
 * Looks up which integration source (if any) created each task by querying
 * tasks.source and tasks.source_item_id columns, then joining with integrations.json.
 *
 * Returns a map of taskId → { sourceId, sourceType, sourceName, sourceEnabled,
 *   callback?, actions?, itemId?, referenceId? }
 */

import { json } from '@sveltejs/kit';
import { lookupIntegrations } from '$lib/server/integrationLookup.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const taskIdsParam = url.searchParams.get('taskIds');
	if (!taskIdsParam) return json({ integrations: {} });

	const taskIds = taskIdsParam.split(',').filter(Boolean);
	if (taskIds.length === 0) return json({ integrations: {} });

	// Determine project path for tasks.db lookup
	const project = url.searchParams.get('project');
	let projectPath = null;
	if (project) {
		try { projectPath = getProjectPath(project); } catch { /* unknown project */ }
	}
	if (!projectPath) {
		// Fall back to cwd-based project root
		projectPath = process.cwd().replace(/\/ide$/, '');
	}

	const integrations = lookupIntegrations(taskIds, projectPath);
	return json({ integrations });
}
