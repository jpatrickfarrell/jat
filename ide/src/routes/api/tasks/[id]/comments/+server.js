/**
 * Task Comments API
 *
 * GET  /api/tasks/[id]/comments  → list comments ordered by created_at asc
 * POST /api/tasks/[id]/comments  → create comment
 *   body: { text, author, author_type, comment_type, session_id?, metadata? }
 *
 * Works for SQLite-backed and Postgres-backed projects.
 *
 * Resume trigger: if comment_type === 'answer' on a SQLite-backed task that
 * has an open `question` comment with a session_id, fire the resume flow
 * (claude -r + tmux inject). See lib/server/resumeOnAnswer.js.
 */
import { json } from '@sveltejs/kit';
import { SqliteTaskBackend } from '../../../../../../../lib/tasks-sqlite.js';
import { resolveBackendForProject } from '../../../../../../../lib/projects-config.js';
import { triggerResumeOnAnswer } from '$lib/server/resumeOnAnswer.js';

const sqlite = new SqliteTaskBackend();

async function getPgBackendForTask(taskId) {
	const match = taskId.match(/^([a-zA-Z0-9_-]+?)-[a-zA-Z0-9.]+$/);
	if (!match) return null;
	const projectName = match[1];
	try {
		const cfg = resolveBackendForProject(projectName);
		if (cfg.kind !== 'postgres') return null;
		const { getBackendForProject } = await import('../../../../../../../lib/tasks-backend.js');
		return await getBackendForProject(projectName);
	} catch {
		return null;
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const taskId = params.id;
	try {
		const pg = await getPgBackendForTask(taskId);
		if (pg) {
			const task = await pg.getById(taskId);
			if (!task) return json({ error: 'Task not found' }, { status: 404 });
			// Postgres project_tasks_comments lacks extended fields — normalise shape.
			const comments = (task.comments || []).map((c) => ({
				id: c.id,
				text: c.text || '',
				author: c.author || '',
				author_type: c.author_type ?? null,
				comment_type: c.comment_type ?? null,
				session_id: c.session_id ?? null,
				metadata: c.metadata ?? null,
				created_at: c.created_at,
			}));
			return json({ comments });
		}

		const task = sqlite.getById(taskId);
		if (!task) return json({ error: 'Task not found' }, { status: 404 });
		const comments = sqlite.listComments(taskId).map((c) => ({
			...c,
			metadata: c.metadata ? safeParseJson(c.metadata) : null,
		}));
		return json({ comments });
	} catch (err) {
		console.error('[comments GET]', err);
		return json({ error: err.message || 'Failed to list comments' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const taskId = params.id;
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { text, author, author_type, comment_type, session_id, metadata } = body || {};
	if (!text || typeof text !== 'string' || !text.trim()) {
		return json({ error: 'text is required' }, { status: 400 });
	}
	if (!author || typeof author !== 'string') {
		return json({ error: 'author is required' }, { status: 400 });
	}
	if (!author_type || !['agent', 'user', 'system'].includes(author_type)) {
		return json({ error: "author_type must be 'agent', 'user', or 'system'" }, { status: 400 });
	}
	if (!comment_type || !['question', 'answer', 'note', 'event'].includes(comment_type)) {
		return json(
			{ error: "comment_type must be 'question', 'answer', 'note', or 'event'" },
			{ status: 400 }
		);
	}

	try {
		const pg = await getPgBackendForTask(taskId);
		if (pg) {
			const task = await pg.getById(taskId);
			if (!task) return json({ error: 'Task not found' }, { status: 404 });
			const created = await pg.addComment(taskId, {
				author,
				text,
				author_type,
				comment_type,
				session_id: session_id ?? null,
			});
			return json(
				{
					comment: {
						...created,
						metadata: metadata ?? null,
					},
				},
				{ status: 201 }
			);
		}

		const task = sqlite.getById(taskId);
		if (!task) return json({ error: 'Task not found' }, { status: 404 });

		const comment = sqlite.addComment(taskId, author, text, undefined, {
			author_type,
			comment_type,
			session_id: session_id ?? null,
			metadata: metadata ?? null,
		});

		// Resume trigger: if this is an answer to an open agent question,
		// fire `claude -r` + tmux inject in the background.
		if (comment_type === 'answer') {
			triggerResumeOnAnswer(taskId, text).catch((err) => {
				console.error('[comments POST] resume trigger failed:', err);
			});
		}

		return json(
			{
				comment: {
					...comment,
					metadata: comment.metadata ? safeParseJson(comment.metadata) : null,
				},
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('[comments POST]', err);
		return json({ error: err.message || 'Failed to create comment' }, { status: 500 });
	}
}

function safeParseJson(s) {
	try {
		return JSON.parse(s);
	} catch {
		return s;
	}
}
