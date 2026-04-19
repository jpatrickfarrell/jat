import type { Task, TaskActor } from '$lib/types/api.types';

export type RoutingRole = 'approver' | 'requester' | 'creator';

export interface RoutingTarget {
	actor: TaskActor;
	role: RoutingRole;
	id: string | null;
}

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveRoutingTarget(task: Task): RoutingTarget | null {
	if (task.approver) {
		return { actor: task.approver, role: 'approver', id: task.approver_id ?? null };
	}
	if (task.requester) {
		return { actor: task.requester, role: 'requester', id: task.requester_id ?? null };
	}
	if (task.creator) {
		return { actor: task.creator, role: 'creator', id: task.creator_id ?? null };
	}
	return null;
}

export function getActorDisplayName(actor: TaskActor | null | undefined): string {
	if (!actor) return 'Unknown';
	return actor.name || actor.email || actor.agent || 'Unknown';
}

export function getActorHandle(actor: TaskActor | null | undefined): string | null {
	if (!actor) return null;
	return actor.email || actor.agent || null;
}

export function isUuid(value: string | null | undefined): boolean {
	return typeof value === 'string' && UUID_RE.test(value);
}
