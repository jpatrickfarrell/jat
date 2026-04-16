/**
 * Ready Tasks API - Get count and list of ready tasks
 * GET /api/tasks/ready
 *
 * Returns tasks that are ready to be worked on (no unmet dependencies)
 * across ALL projects (not just the current one).
 */

import { json } from '@sveltejs/kit';
import { getReadyTasks, getTasks } from '$lib/server/jat-tasks.js';
import { apiCache, cacheKey, CACHE_TTL } from '$lib/server/cache.js';
import { readProjectsConfig, resolveBackendForProject } from '../../../../../../lib/projects-config.js';
import { getBackendForProject } from '../../../../../../lib/tasks-backend.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const key = cacheKey('tasks-ready');
		const cached = apiCache.get(key);
		if (cached) {
			return json(cached);
		}

		// Get ready tasks from SQLite-backed projects
		const tasks = getReadyTasks();

		// Get active (in_progress) tasks from SQLite-backed projects
		const inProgressTasks = getTasks({ status: 'in_progress' });

		// Also include ready + in_progress tasks from postgres-graduated projects.
		// These don't flow through the SQLite backend, so they need to be fetched
		// per-project through their own backend adapter.
		const cfg = readProjectsConfig();
		if (cfg?.projects) {
			for (const [name, pconfig] of Object.entries(cfg.projects)) {
				try {
					const backend = resolveBackendForProject(name);
					if (backend.kind !== 'postgres') continue;
					const pg = await getBackendForProject(name);
					const [pgReady, pgActive] = await Promise.all([
						pg.getReady(),
						pg.list({ status: 'in_progress', projectName: name })
					]);
					for (const t of pgReady) tasks.push({ ...t, project: name });
					for (const t of pgActive) inProgressTasks.push({ ...t, project: name });
				} catch (err) {
					console.error(`Failed to fetch tasks for postgres project ${name}:`, err);
				}
			}
		}

		const responseData = {
			count: tasks.length,
			tasks: tasks.map((t) => ({
				id: t.id,
				title: t.title,
				priority: t.priority,
				type: t.issue_type,
				project: t.project
			})),
			activeTasks: inProgressTasks.map((t) => ({
				id: t.id,
				title: t.title,
				priority: t.priority,
				type: t.issue_type,
				project: t.project,
				assignee: t.assignee || null
			})),
			timestamp: new Date().toISOString()
		};

		apiCache.set(key, responseData, CACHE_TTL.SHORT);
		return json(responseData);
	} catch (error) {
		console.error('Failed to get ready tasks:', error);
		return json({
			count: 0,
			tasks: [],
			activeTasks: [],
			error: error instanceof Error ? error.message : 'Failed to get ready tasks',
			timestamp: new Date().toISOString()
		});
	}
}
