/**
 * Epics with Ready Children API
 * GET /api/epics/with-ready
 *
 * Returns all epics (open + recently closed) that have ready children.
 * This is a bulk endpoint that avoids N+1 queries by computing everything
 * in a single pass over the task list.
 *
 * Query params:
 *   - days: how far back to include closed epics (default: 30)
 */
import { json } from '@sveltejs/kit';
import { getTasks } from '$lib/server/jat-tasks.js';
import type { RequestHandler } from './$types';

interface EpicWithReady {
	id: string;
	title: string;
	project: string;
	readyCount: number;
	totalCount: number;
	readyChildIds: string[];
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const days = parseInt(url.searchParams.get('days') || '30', 10);
		const cutoff = new Date(Date.now() - days * 86400000).toISOString();

		// Single fetch of all tasks
		const allTasks = getTasks();

		// Find all epics (open + recently closed)
		const epics = allTasks.filter((t: any) =>
			t.issue_type === 'epic' &&
			(t.status !== 'closed' || !t.closed_at || t.closed_at >= cutoff)
		);

		// Build a map of task ID → task for quick lookup
		const taskMap = new Map(allTasks.map((t: any) => [t.id, t]));

		const results: EpicWithReady[] = [];

		for (const epic of epics) {
			// Method 1: hierarchical children (dot notation)
			const childPattern = new RegExp(`^${epic.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\d+$`);
			const childIds = new Set<string>();

			for (const t of allTasks) {
				if (childPattern.test(t.id)) {
					childIds.add(t.id);
				}
			}

			// Method 2: dependency-linked children
			if (epic.depends_on && Array.isArray(epic.depends_on)) {
				for (const dep of epic.depends_on) {
					if (dep.id) childIds.add(dep.id);
				}
			}

			if (childIds.size === 0) continue;

			// Build child status map for blocking checks
			const childStatusMap = new Map<string, string>();
			for (const id of childIds) {
				const t = taskMap.get(id);
				if (t) childStatusMap.set(id, t.status);
			}

			// Find ready children (not closed, not in_progress, not blocked by sibling)
			const readyChildIds: string[] = [];
			for (const id of childIds) {
				const child = taskMap.get(id);
				if (!child || child.status === 'closed' || child.status === 'in_progress') continue;

				// Check if blocked by a sibling that's not closed
				const isBlocked = (child.depends_on || []).some((dep: any) => {
					const depStatus = childStatusMap.get(dep.id);
					return childIds.has(dep.id) && depStatus && depStatus !== 'closed';
				});

				if (!isBlocked) {
					readyChildIds.push(id);
				}
			}

			if (readyChildIds.length > 0) {
				results.push({
					id: epic.id,
					title: epic.title,
					project: epic.project || epic.id.split('-')[0],
					readyCount: readyChildIds.length,
					totalCount: childIds.size,
					readyChildIds
				});
			}
		}

		// Sort by ready count descending
		results.sort((a, b) => b.readyCount - a.readyCount);

		return json({ epics: results });
	} catch (err) {
		console.error('[epics/with-ready] Error:', err);
		return json({ epics: [], error: 'Failed to compute epics with ready children' }, { status: 500 });
	}
};
