/**
 * Projects Clone API
 * POST /api/projects/clone - Clone a git repository
 *
 * Request body:
 *   { url: string, targetPath?: string, branch?: string }
 *
 * Response:
 *   { success: true, path: string, repoName: string, repoMeta: { description, language, defaultBranch } }
 *   or { error: true, message: string, type: string }
 */

import { json } from '@sveltejs/kit';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { resolve, normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CLONE_TIMEOUT = 60000; // 60 seconds

/**
 * Validate a git URL (HTTPS or SSH)
 * @param {string} url
 * @returns {{ valid: boolean, repoName: string, owner: string, host: string }}
 */
function validateGitUrl(url) {
	// Clean up URL: strip trailing slashes
	const cleaned = url.replace(/\/+$/, '');

	// HTTPS: https://github.com/user/repo.git or https://github.com/user/repo
	const httpsPattern = /^https?:\/\/[^/]+\/[^/]+\/[^/]+(\.git)?$/;

	// SSH: git@github.com:user/repo.git
	const sshPattern = /^git@[^:]+:[^/]+\/[^/]+(\.git)?$/;

	// Generic git:// protocol
	const gitProtocolPattern = /^git:\/\/[^/]+\/[^/]+\/[^/]+(\.git)?$/;

	const valid = httpsPattern.test(cleaned) || sshPattern.test(cleaned) || gitProtocolPattern.test(cleaned);

	// Extract repo name and owner from URL
	let repoName = '';
	let owner = '';
	let host = '';
	if (valid) {
		// Normalize SSH (git@host:owner/repo) to slash-separated for parsing
		const normalized = cleaned.replace(/:/, '/');
		const parts = normalized.split('/');
		repoName = parts[parts.length - 1].replace(/\.git$/, '');
		owner = parts[parts.length - 2] || '';

		// Extract host
		try {
			if (cleaned.startsWith('git@')) {
				host = cleaned.split('@')[1].split(':')[0];
			} else {
				host = new URL(cleaned).hostname;
			}
		} catch { /* ignore */ }
	}

	return { valid, repoName, owner, host };
}

/**
 * Expand ~ to home directory and resolve to absolute path
 * @param {string} inputPath
 * @returns {string}
 */
function expandPath(inputPath) {
	const expanded = inputPath.replace(/^~/, homedir());
	return resolve(expanded);
}

/**
 * Check if path is safe (under home directory)
 * @param {string} absolutePath
 * @returns {boolean}
 */
function isPathAllowed(absolutePath) {
	const home = homedir();
	const normalized = normalize(absolutePath);
	return normalized.toLowerCase().startsWith(home.toLowerCase());
}

/**
 * POST /api/projects/clone
 * Clone a git repository to a target directory
 */
export async function POST({ request }) {
	try {
		const body = await request.json();

		// Validate URL
		if (!body.url || typeof body.url !== 'string') {
			return json(
				{ error: true, message: 'Git URL is required', type: 'validation_error' },
				{ status: 400 }
			);
		}

		const url = body.url.trim();
		const { valid, repoName, owner, host } = validateGitUrl(url);

		if (!valid) {
			return json(
				{ error: true, message: 'Invalid git URL. Use HTTPS (https://github.com/user/repo) or SSH (git@github.com:user/repo)', type: 'validation_error' },
				{ status: 400 }
			);
		}

		// Determine target path
		const defaultTarget = `~/code/${repoName}`;
		const targetInput = (body.targetPath && typeof body.targetPath === 'string')
			? body.targetPath.trim()
			: defaultTarget;

		const absolutePath = expandPath(targetInput);

		// Security check
		if (!isPathAllowed(absolutePath)) {
			return json(
				{ error: true, message: 'Target path must be under your home directory', type: 'security_error' },
				{ status: 403 }
			);
		}

		// Check target doesn't already exist
		if (existsSync(absolutePath)) {
			return json(
				{ error: true, message: `Target directory already exists: ${targetInput}`, type: 'conflict' },
				{ status: 409 }
			);
		}

		// Build clone command
		let cloneCmd = `git clone ${JSON.stringify(url)} ${JSON.stringify(absolutePath)}`;

		// If branch specified, clone that branch directly
		const branch = (body.branch && typeof body.branch === 'string') ? body.branch.trim() : '';
		if (branch) {
			cloneCmd = `git clone --branch ${JSON.stringify(branch)} ${JSON.stringify(url)} ${JSON.stringify(absolutePath)}`;
		}

		// Execute clone
		try {
			await execAsync(cloneCmd, { timeout: CLONE_TIMEOUT });
		} catch (cloneError) {
			const err = /** @type {{ killed?: boolean, stderr?: string, message?: string }} */ (cloneError);

			if (err.killed) {
				return json(
					{ error: true, message: 'Clone timed out after 60 seconds. The repository may be too large or the network is slow.', type: 'timeout' },
					{ status: 504 }
				);
			}

			const stderr = err.stderr || err.message || 'Unknown clone error';
			return json(
				{ error: true, message: `Clone failed: ${stderr}`, type: 'clone_failed' },
				{ status: 500 }
			);
		}

		// Fetch GitHub metadata (best-effort, doesn't block on failure)
		let repoMeta = { description: '', language: '', defaultBranch: '', openIssuesCount: 0, homepage: '', topics: [] };
		if (host === 'github.com' && owner && repoName) {
			try {
				const ghResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
					headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'jat-ide' },
					signal: AbortSignal.timeout(5000)
				});
				if (ghResponse.ok) {
					const ghData = await ghResponse.json();
					repoMeta.description = ghData.description || '';
					repoMeta.language = ghData.language || '';
					repoMeta.defaultBranch = ghData.default_branch || '';
					repoMeta.openIssuesCount = ghData.open_issues_count || 0;
					repoMeta.homepage = ghData.homepage || '';
					repoMeta.topics = ghData.topics || [];
				}
			} catch { /* best-effort */ }
		}

		return json({
			success: true,
			path: absolutePath,
			repoName,
			repoMeta
		}, { status: 200 });

	} catch (error) {
		console.error('Error in projects/clone:', error);
		return json(
			{
				error: true,
				message: error instanceof Error ? error.message : 'Internal server error',
				type: 'server_error'
			},
			{ status: 500 }
		);
	}
}
