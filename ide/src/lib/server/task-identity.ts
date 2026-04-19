import type { Task, TaskActor } from '$lib/types/api.types';

/**
 * Input shape for all task-creation ingest paths.
 * Every path (widget, IDE, JAT agent, Slack, voice, etc.) constructs one of
 * these and passes it to buildTaskIdentity() / buildTaskIdentityOnBehalf().
 */
export interface TaskActorInput {
	userId?: string;   // auth UUID when the actor is an authenticated user
	email?: string;
	name?: string;
	role?: string;     // patient | practitioner | admin | agent | dev | system
	source: string;   // widget | ide | jat | slack | email | api | voice
	agent?: string;   // JAT agent name when source=jat
}

/**
 * Flattened identity columns written to the task row.
 * All six fields are returned; callers spread them into the create/update payload.
 */
export interface TaskIdentityFields {
	creator_id:    string | null;
	creator:       TaskActor;
	requester_id:  string | null;
	requester:     TaskActor;
	approver_id:   string | null;
	approver:      TaskActor;
}

function toActor(input: TaskActorInput): TaskActor {
	const actor: TaskActor = { source: input.source };
	if (input.email) actor.email  = input.email;
	if (input.name)  actor.name   = input.name;
	if (input.role)  actor.role   = input.role;
	if (input.agent) actor.agent  = input.agent;
	return actor;
}

/**
 * Build identity for a first-party action: the actor is creator, requester,
 * and approver simultaneously.
 *
 * Typical uses: IDE creates task, JAT agent creates task, widget submits
 * feedback where the submitter also owns the outcome.
 */
export function buildTaskIdentity(actor: TaskActorInput): TaskIdentityFields {
	const snapshot = toActor(actor);
	const id = actor.userId ?? null;
	return {
		creator_id:   id,
		creator:      snapshot,
		requester_id: id,
		requester:    snapshot,
		approver_id:  id,
		approver:     snapshot,
	};
}

/**
 * Build identity for an "on behalf of" action: the creator (e.g. a dev or
 * system process) acts on behalf of an end user.
 *
 * creator   → the dev/system that physically created the record
 * requester → the end user who needs the work done
 * approver  → the end user (same as requester — they sign off by default)
 */
export function buildTaskIdentityOnBehalf(
	creator: TaskActorInput,
	onBehalfOf: TaskActorInput,
): TaskIdentityFields {
	const creatorSnapshot    = toActor(creator);
	const onBehalfOfSnapshot = toActor(onBehalfOf);
	return {
		creator_id:   creator.userId    ?? null,
		creator:      creatorSnapshot,
		requester_id: onBehalfOf.userId ?? null,
		requester:    onBehalfOfSnapshot,
		approver_id:  onBehalfOf.userId ?? null,
		approver:     onBehalfOfSnapshot,
	};
}

/**
 * Resolve the routing target for a completed task.
 * Priority: approver → requester → creator → null.
 * Mirrors the SQL logic in the postgres and SQLite close() paths.
 */
export function resolveRoutingTarget(task: Task): TaskActor | null {
	return task.approver ?? task.requester ?? task.creator ?? null;
}
