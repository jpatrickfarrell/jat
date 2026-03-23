/**
 * Session Output API - Capture Session Output
 * GET /api/sessions/[name]/output
 *
 * Captures the current visible output from a tmux session pane.
 * Supports both local and remote (VPS) sessions — if the session isn't
 * found locally and VPS is configured, falls back to SSH capture.
 *
 * Query params:
 * - lines: Number of lines to capture (default: 100, max: 10000)
 * - history: Include scrollback history (default: false)
 * - remote: Force remote capture (default: false, auto-detects)
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getVpsConfig } from '$lib/server/sessions.js';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	try {
		const sessionName = params.name;

		if (!sessionName) {
			return json({
				error: 'Missing session name',
				message: 'Session name is required'
			}, { status: 400 });
		}

		// Parse query params
		const linesParam = url.searchParams.get('lines');
		const historyParam = url.searchParams.get('history');
		const forceRemote = url.searchParams.get('remote') === 'true';

		const lines = Math.min(Math.max(parseInt(linesParam || '100', 10) || 100, 1), 10000);
		const includeHistory = historyParam === 'true';

		// Build tmux capture-pane command
		let captureCmd;
		if (includeHistory) {
			captureCmd = `tmux capture-pane -p -e -t "${sessionName}" -S -${lines}`;
		} else {
			captureCmd = `tmux capture-pane -p -e -t "${sessionName}"`;
		}

		// Try local first (unless forced remote)
		if (!forceRemote) {
			try {
				const { stdout } = await execAsync(captureCmd, { maxBuffer: 1024 * 1024 * 10 });

				let outputLines = stdout.split('\n');
				if (outputLines.length > lines) {
					outputLines = outputLines.slice(-lines);
				}

				return json({
					success: true,
					sessionName,
					output: outputLines.join('\n'),
					lineCount: outputLines.length,
					truncated: stdout.split('\n').length > lines,
					location: 'local',
					timestamp: new Date().toISOString()
				});
			} catch (execError) {
				const execErr = /** @type {{ stderr?: string, message?: string }} */ (execError);
				const errorMessage = execErr.stderr || execErr.message || String(execError);

				// If session not found locally, try remote
				const isNotFound = errorMessage.includes("can't find session") ||
					errorMessage.includes('no server running');

				if (!isNotFound) {
					if (errorMessage.includes("can't find pane")) {
						return json({
							error: 'Pane not found',
							message: `No active pane in session '${sessionName}'`,
							sessionName
						}, { status: 404 });
					}
					return json({
						error: 'Failed to capture output',
						message: errorMessage,
						sessionName
					}, { status: 500 });
				}
				// Fall through to remote attempt
			}
		}

		// Try remote (VPS) capture
		const vps = getVpsConfig();
		if (!vps) {
			return json({
				error: 'Session not found',
				message: `Session '${sessionName}' not found locally and no VPS configured`,
				sessionName
			}, { status: 404 });
		}

		try {
			const sshCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new ${vps.user}@${vps.host} '${captureCmd}'`;
			const { stdout } = await execAsync(sshCmd, { maxBuffer: 1024 * 1024 * 10, timeout: 15000 });

			let outputLines = stdout.split('\n');
			if (outputLines.length > lines) {
				outputLines = outputLines.slice(-lines);
			}

			return json({
				success: true,
				sessionName,
				output: outputLines.join('\n'),
				lineCount: outputLines.length,
				truncated: stdout.split('\n').length > lines,
				location: 'remote',
				timestamp: new Date().toISOString()
			});
		} catch (remoteError) {
			const remoteErr = /** @type {{ stderr?: string, message?: string }} */ (remoteError);
			const remoteMsg = remoteErr.stderr || remoteErr.message || String(remoteError);

			if (remoteMsg.includes("can't find session")) {
				return json({
					error: 'Session not found',
					message: `Session '${sessionName}' not found on local or VPS`,
					sessionName
				}, { status: 404 });
			}

			return json({
				error: 'Remote capture failed',
				message: remoteMsg,
				sessionName
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error in GET /api/sessions/[name]/output:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
