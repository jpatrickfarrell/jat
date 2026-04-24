/**
 * Individual comment mutations.
 *
 * PATCH /api/tasks/[id]/comments/[commentId]
 *   body: { external?: boolean }
 *   Currently the only editable field is `external`.
 *
 *   ONE-WAY RULE: once a comment is marked internal (`external=false`), it
 *   cannot be flipped back to external. Internal stays internal forever.
 *   Attempting to flip returns 409 Conflict.
 *
 *   Rationale: a comment posted internally may reference information the
 *   external audience was never supposed to see. Allowing the flip would
 *   create a nasty "unsend" footgun.
 */
import { json } from '@sveltejs/kit';
import { SqliteTaskBackend } from '../../../../../../../../lib/tasks-sqlite.js';
import { resolveBackendForProject } from '../../../../../../../../lib/projects-config.js';

const sqlite = new SqliteTaskBackend();

async function getPgBackendForTask(taskId) {
	const match = taskId.match(/^([a-zA-Z0-9_-]+?)-[a-zA-Z0-9.]+$/);
	if (!match) return null;
	const projectName = match[1];
	try {
		const cfg = resolveBackendForProject(projectName);
		if (cfg.kind !== 'postgres') return null;
		const { getBackendForProject } = await import('../../../../../../../../lib/tasks-backend.js');
		return await getBackendForProject(projectName);
	} catch {
		return null;
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	const { id: taskId, commentId } = params;
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { external } = body || {};
	if (external === undefined) {
		return json({ error: 'No editable fields in body (expected: external)' }, { status: 400 });
	}
	if (typeof external !== 'boolean') {
		return json({ error: 'external must be a boolean' }, { status: 400 });
	}

	try {
		const pg = await getPgBackendForTask(taskId);
		if (pg) {
			const existing = await pg.getComment(commentId);
			if (!existing) return json({ error: 'Comment not found' }, { status: 404 });
			if (existing.external === false && external === true) {
				return json(
					{ error: 'Internal comments cannot be made external. Internal stays internal forever.' },
					{ status: 409 }
				);
			}
			if (existing.external === external) {
				return json({ comment: existing });
			}
			const updated = await pg.setCommentExternal(commentId, external);
			if (!updated) return json({ error: 'Comment not found' }, { status: 404 });
			return json({ comment: updated });
		}

		const existing = sqlite.getComment(commentId);
		if (!existing) return json({ error: 'Comment not found' }, { status: 404 });
		if (existing.external === false && external === true) {
			return json(
				{ error: 'Internal comments cannot be made external. Internal stays internal forever.' },
				{ status: 409 }
			);
		}
		if (existing.external === external) {
			return json({ comment: existing });
		}
		const updated = sqlite.setCommentExternal(commentId, external);
		if (!updated) return json({ error: 'Comment not found' }, { status: 404 });
		return json({ comment: updated });
	} catch (err) {
		console.error('[comments PATCH]', err);
		return json({ error: err.message || 'Failed to update comment' }, { status: 500 });
	}
}
