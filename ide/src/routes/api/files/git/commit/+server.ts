/**
 * Git Commit API Endpoint
 *
 * POST /api/files/git/commit
 * Body: { project: string, message: string }
 * Commit staged changes.
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGitForProject, formatGitError } from '$lib/server/git.js';
import { apiCache, cacheKey } from '$lib/server/cache.js';

export const POST: RequestHandler = async ({ request }) => {
	let body: { project?: string; message?: string };

	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const { project: projectName, message } = body;

	if (!projectName) {
		throw error(400, 'Missing required parameter: project');
	}

	if (!message || typeof message !== 'string' || message.trim().length === 0) {
		throw error(400, 'Missing required parameter: message');
	}

	const result = await getGitForProject(projectName);
	if ('error' in result) {
		throw error(result.status, result.error);
	}

	const { git, projectPath } = result;

	try {
		// Check if there are staged changes
		const status = await git.status();
		if (status.staged.length === 0) {
			throw error(400, 'Nothing to commit: no staged changes');
		}

		// Commit
		const commitResult = await git.commit(message.trim());

		// Invalidate git-status cache so subsequent fetchStatus() gets fresh data
		apiCache.delete(cacheKey('git-status', { project: projectName }));

		// Get fresh status after commit (ahead/behind counts change after commit)
		const postStatus = await git.status();

		return json({
			success: true,
			project: projectName,
			projectPath,
			commit: {
				hash: commitResult.commit,
				branch: commitResult.branch,
				summary: {
					changes: commitResult.summary.changes,
					insertions: commitResult.summary.insertions,
					deletions: commitResult.summary.deletions
				}
			},
			// Include fresh git status so client can update immediately
			status: {
				ahead: postStatus.ahead,
				behind: postStatus.behind,
				tracking: postStatus.tracking,
				isClean: postStatus.isClean()
			}
		});
	} catch (err) {
		// Handle the "nothing to commit" case that might slip through
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		const gitError = formatGitError(err as Error);
		throw error(gitError.status, gitError.error);
	}
};
