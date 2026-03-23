/**
 * Session Output API - Get terminal output for a session
 * GET /api/work/[sessionId]/output - Capture current terminal output
 *
 * Path params:
 * - sessionId: tmux session name (e.g., "jat-WisePrairie")
 *
 * Query params:
 * - lines: Number of lines to capture (default: 200)
 * - includePreCompact: Include pre-compaction scrollback if available (default: true)
 *
 * When compaction clears the terminal, this endpoint will also check for
 * saved pre-compaction scrollback and include it in the response, allowing
 * the minimap to show the complete session history.
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getVpsConfig } from '$lib/server/sessions.js';

const execAsync = promisify(exec);

/**
 * Read the unified session log file for a session
 * This log accumulates history across compactions, pauses, and completions.
 * @param {string} sessionId - tmux session name (e.g., "jat-WisePrairie")
 * @returns {Promise<{content: string, filename: string, modifiedAt: string} | null>}
 */
async function readSessionLog(sessionId) {
	const projectPath = process.cwd().replace('/ide', '');
	const logsDir = path.join(projectPath, '.jat', 'logs');
	const logFile = path.join(logsDir, `session-${sessionId}.log`);

	if (!existsSync(logFile)) {
		return null;
	}

	try {
		const content = await readFile(logFile, 'utf-8');
		const fileStat = await stat(logFile);

		return {
			content,
			filename: `session-${sessionId}.log`,
			modifiedAt: fileStat.mtime.toISOString()
		};
	} catch (err) {
		console.error('Error reading session log:', err);
		return null;
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	try {
		const { sessionId } = params;
		const lines = parseInt(url.searchParams.get('lines') || '200', 10);
		const includePreCompact = url.searchParams.get('includePreCompact') !== 'false';

		if (!sessionId) {
			return json({
				error: 'Missing session ID',
				message: 'Session ID is required in path'
			}, { status: 400 });
		}

		// Check if session exists locally
		let sessionAlive = true;
		let isRemote = false;
		try {
			await execAsync(`tmux has-session -t "${sessionId}" 2>/dev/null`);
		} catch {
			sessionAlive = false;
		}

		// If not found locally, check if it's a remote VPS session
		if (!sessionAlive) {
			const vps = getVpsConfig();
			if (vps) {
				try {
					await execAsync(
						`ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=accept-new ${vps.user}@${vps.host} 'tmux has-session -t "${sessionId}" 2>/dev/null'`,
						{ timeout: 8000 }
					);
					sessionAlive = true;
					isRemote = true;
				} catch {
					// Not found on VPS either
				}
			}
		}

		// If session is gone everywhere, return empty output with sessionEnded flag
		if (!sessionAlive) {
			let sessionLog = null;
			if (includePreCompact) {
				sessionLog = await readSessionLog(sessionId);
			}

			return json({
				success: true,
				sessionId,
				output: sessionLog ? sessionLog.content : '',
				lineCount: sessionLog ? sessionLog.content.split('\n').length : 0,
				lines,
				sessionEnded: true,
				hasSessionHistory: !!sessionLog,
				sessionLogInfo: sessionLog ? {
					filename: sessionLog.filename,
					modifiedAt: sessionLog.modifiedAt
				} : null,
				timestamp: new Date().toISOString()
			});
		}

		// Capture output (local or remote)
		let output = '';
		let lineCount = 0;
		const captureCommand = `tmux capture-pane -p -e -t "${sessionId}" -S -${lines}`;

		try {
			if (isRemote) {
				const vps = getVpsConfig();
				const sshCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new ${vps.user}@${vps.host} '${captureCommand}'`;
				const { stdout } = await execAsync(sshCmd, { maxBuffer: 5 * 1024 * 1024, timeout: 15000 });
				output = stdout;
			} else {
				const { stdout } = await execAsync(captureCommand, { maxBuffer: 5 * 1024 * 1024 });
				output = stdout;
			}
			lineCount = output.split('\n').length;
		} catch (err) {
			console.error('Failed to capture session output:', err);
		}

		// Check for unified session log if enabled
		// This log accumulates history across compactions, pauses, and completions
		let sessionLog = null;
		if (includePreCompact) {
			sessionLog = await readSessionLog(sessionId);
		}

		// If we have a session log, prepend it to the current output
		// The log already contains separators for each capture event
		let combinedOutput = output;
		let hasSessionHistory = false;

		if (sessionLog) {
			// Always prepend the session log - it contains the full history
			// The current tmux output shows only what happened after the last capture
			combinedOutput = sessionLog.content + output;
			hasSessionHistory = true;
		}

		return json({
			success: true,
			sessionId,
			output: combinedOutput,
			lineCount: combinedOutput.split('\n').length,
			lines,
			location: isRemote ? 'remote' : 'local',
			hasSessionHistory,
			sessionLogInfo: sessionLog ? {
				filename: sessionLog.filename,
				modifiedAt: sessionLog.modifiedAt
			} : null,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in GET /api/work/[sessionId]/output:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
