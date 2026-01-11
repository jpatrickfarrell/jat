/**
 * Git Discard API Endpoint
 *
 * POST /api/files/git/discard
 * Body: { project: string, paths: string[] }
 * Discards working directory changes to specified files (git restore).
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGitForProject, formatGitError } from '$lib/server/git.js';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { project, paths } = body;

	if (!paths || !Array.isArray(paths) || paths.length === 0) {
		throw error(400, 'Missing required parameter: paths (array of file paths)');
	}

	const result = await getGitForProject(project);
	if ('error' in result) {
		throw error(result.status, result.error);
	}

	const { git, projectPath } = result;

	try {
		// Use git restore to discard working directory changes
		// This is equivalent to: git restore -- <paths>
		await git.checkout(['--', ...paths]);

		return json({
			success: true,
			project,
			projectPath,
			discarded: paths,
			message: `Discarded changes to ${paths.length} file(s)`
		});
	} catch (err) {
		const gitError = formatGitError(err as Error);
		throw error(gitError.status, gitError.error);
	}
};
