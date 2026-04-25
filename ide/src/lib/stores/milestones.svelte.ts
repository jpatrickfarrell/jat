/**
 * Per-project milestone lookup, lazy-loaded from /api/clients.
 *
 * Mirrors the milestone resolution logic from /inbox so that any component
 * (notably TaskIdBadge) can render an M{n} badge alongside P{priority}
 * without each caller having to fetch and reduce the contracts payload.
 *
 * Usage:
 *   import { ensureProjectLoaded, getTaskMilestone } from '$lib/stores/milestones.svelte';
 *
 *   $effect(() => { void ensureProjectLoaded(project); });
 *   const milestone = $derived(getTaskMilestone(taskId));
 *
 * Loaded data is keyed by lowercase projectKey/name. The reverse index
 * (taskId → milestone) maps both `jat_id` (e.g. "meadow-71d99") and the
 * raw UUID `id`, so SQLite-backed and postgres-backed projects both work.
 */

import { browser } from "$app/environment";

export interface TaskMilestone {
	id: string;
	name: string;
	status?: string;
	sortOrder: number;
}

interface MilestoneRecord {
	id: string;
	name: string;
	status?: string;
	sortOrder: number;
	linkedTaskKeys: string[];
}

// Loaded milestones per project (lowercase key). Reactive via runes so that
// $derived consumers re-render when a project finishes loading.
let projectMilestones = $state<Map<string, MilestoneRecord[]>>(new Map());

// Reverse index: taskId → milestone. Rebuilt whenever projectMilestones
// changes. Uses both jat_id and raw UUID as keys to match SQLite/postgres
// task identifier conventions.
const milestoneByTaskId = $derived.by<Map<string, TaskMilestone>>(() => {
	const _data = projectMilestones;
	const map = new Map<string, TaskMilestone>();
	for (const records of _data.values()) {
		for (const m of records) {
			const entry: TaskMilestone = {
				id: m.id,
				name: m.name,
				status: m.status,
				sortOrder: m.sortOrder,
			};
			for (const key of m.linkedTaskKeys) {
				if (!map.has(key)) map.set(key, entry);
			}
		}
	}
	return map;
});

// Track in-flight loads so concurrent callers (multiple TaskIdBadge instances
// on the same page) share one request per project.
const inflight = new Map<string, Promise<void>>();

// Track failed projects so we don't retry on every render.
const failed = new Set<string>();

/**
 * Trigger a one-time load of milestones for the given project. Subsequent
 * calls for the same project are no-ops (returns the existing promise or
 * resolves immediately if already loaded). Safe to call from $effect.
 */
export function ensureProjectLoaded(project: string | null | undefined): Promise<void> {
	if (!browser || !project) return Promise.resolve();
	const key = project.toLowerCase();
	if (projectMilestones.has(key) || failed.has(key)) return Promise.resolve();
	const existing = inflight.get(key);
	if (existing) return existing;

	const promise = (async () => {
		try {
			const res = await fetch("/api/clients");
			if (!res.ok) {
				failed.add(key);
				return;
			}
			const data = await res.json();
			const projectData = (data.projects || []).find(
				(p: any) =>
					(p.projectKey || "").toLowerCase() === key ||
					(p.name || "").toLowerCase() === key,
			);
			const flat: MilestoneRecord[] = (projectData?.contracts || []).flatMap(
				(c: any, _ci: number) =>
					(c.milestones || []).map((m: any, mi: number) => {
						const linked: string[] = [];
						for (const t of m.linked_tasks ?? []) {
							if (t?.jat_id) linked.push(t.jat_id);
							if (t?.id) linked.push(t.id);
						}
						return {
							id: m.id,
							name: m.name,
							status: m.status,
							// Fall back to positional index when sort_order is missing
							// so every milestone still gets a stable badge number.
							sortOrder: typeof m.sort_order === "number" ? m.sort_order : mi,
							linkedTaskKeys: linked,
						};
					}),
			);
			// Sort ascending so a task linked to multiple milestones picks the
			// earliest one (matches /inbox behavior).
			flat.sort((a, b) => a.sortOrder - b.sortOrder);
			const next = new Map(projectMilestones);
			next.set(key, flat);
			projectMilestones = next;
		} catch {
			failed.add(key);
		} finally {
			inflight.delete(key);
		}
	})();

	inflight.set(key, promise);
	return promise;
}

/**
 * Look up the milestone for a task. Returns null if the project hasn't
 * been loaded yet, or if the task isn't linked to any milestone.
 */
export function getTaskMilestone(taskId: string | null | undefined): TaskMilestone | null {
	if (!taskId) return null;
	return milestoneByTaskId.get(taskId) ?? null;
}

/**
 * Force a refresh of a project's milestones (e.g. after creating one).
 * Drops cached data so the next ensureProjectLoaded call refetches.
 */
export function invalidateProject(project: string | null | undefined): void {
	if (!project) return;
	const key = project.toLowerCase();
	const next = new Map(projectMilestones);
	next.delete(key);
	projectMilestones = next;
	failed.delete(key);
	inflight.delete(key);
}
