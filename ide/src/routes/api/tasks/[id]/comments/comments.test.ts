/**
 * Policy tests for the comments endpoint.
 *
 * Agent-authored comments are always stored as external=true, regardless of
 * what the payload says. Human-authored comments respect the payload's value.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const addCommentMock = vi.fn().mockImplementation((_taskId, _author, _text, _pp, extra) => ({
	id: 'c1',
	text: 'hi',
	author: 'x',
	author_type: extra.author_type,
	comment_type: extra.comment_type,
	external: extra.external !== false,
	metadata: extra.metadata ?? null,
	created_at: new Date().toISOString(),
}));

vi.mock('../../../../../../../lib/tasks-sqlite.js', () => ({
	SqliteTaskBackend: class {
		getById() { return { id: 'jat-test' }; }
		addComment(...args: unknown[]) { return addCommentMock(...args); }
		listComments() { return []; }
		getComment() { return null; }
		setCommentExternal() { return null; }
	},
}));

vi.mock('../../../../../../../lib/projects-config.js', () => ({
	resolveBackendForProject: () => ({ kind: 'sqlite' }),
}));

vi.mock('$lib/server/resumeOnAnswer.js', () => ({
	triggerResumeOnAnswer: vi.fn().mockResolvedValue(undefined),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function postComment(body: Record<string, unknown>) {
	const mod = await import('./+server.js');
	const mockEvent = {
		params: { id: 'jat-test' },
		request: { json: async () => body },
	} as unknown as import('./$types').RequestEvent;
	return (mod as any).POST(mockEvent);
}

beforeEach(() => {
	addCommentMock.mockClear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('POST /api/tasks/:id/comments — agent external policy', () => {
	it('forces external=true when agent posts with external=false', async () => {
		await postComment({
			text: 'agent note',
			author: 'BoldStorm',
			author_type: 'agent',
			comment_type: 'note',
			external: false,
		});

		expect(addCommentMock).toHaveBeenCalledOnce();
		const extra = addCommentMock.mock.calls[0][4];
		expect(extra.external, 'agent external=false payload must be overridden to true').toBe(true);
	});

	it('keeps external=true when agent posts without specifying external', async () => {
		await postComment({
			text: 'agent note',
			author: 'BoldStorm',
			author_type: 'agent',
			comment_type: 'note',
		});

		const extra = addCommentMock.mock.calls[0][4];
		expect(extra.external).toBe(true);
	});

	it('keeps external=true when agent posts with external=true', async () => {
		await postComment({
			text: 'agent note',
			author: 'BoldStorm',
			author_type: 'agent',
			comment_type: 'note',
			external: true,
		});

		const extra = addCommentMock.mock.calls[0][4];
		expect(extra.external).toBe(true);
	});

	it('respects external=false for human (user) comments', async () => {
		await postComment({
			text: 'internal dev note',
			author: 'jw',
			author_type: 'user',
			comment_type: 'note',
			external: false,
		});

		const extra = addCommentMock.mock.calls[0][4];
		expect(extra.external, 'user external=false must be honored').toBe(false);
	});

	it('defaults human comments to external=true when flag is omitted', async () => {
		await postComment({
			text: 'dev note',
			author: 'jw',
			author_type: 'user',
			comment_type: 'note',
		});

		const extra = addCommentMock.mock.calls[0][4];
		expect(extra.external).toBe(true);
	});
});
