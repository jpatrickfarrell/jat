/**
 * Session Management API
 * DELETE /api/sessions/[name] - Kill a session (and release task)
 * PATCH /api/sessions/[name] - Rename a session
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { appendFile, mkdir, access, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getTasks } from '$lib/server/jat-tasks.js';
import { readProjectsConfig } from '../../../../../../lib/projects-config.js';
import { getBackendForProject } from '../../../../../../lib/tasks-backend.js';

const execAsync = promisify(exec);

/**
 * Capture session scrollback and append to unified session log
 * @param {string} sessionName - tmux session name
 * @param {string} reason - compacted | paused | killed | completed
 */
async function captureSessionLog(sessionName, reason) {
	const projectPath = process.cwd().replace('/ide', '');
	const logsDir = path.join(projectPath, '.jat', 'logs');
	const logFile = path.join(logsDir, `session-${sessionName}.log`);

	// Ensure logs directory exists
	if (!existsSync(logsDir)) {
		await mkdir(logsDir, { recursive: true });
	}

	// Check if session exists
	try {
		await execAsync(`tmux has-session -t "${sessionName}" 2>/dev/null`);
	} catch {
		return null; // Session doesn't exist
	}

	// Capture scrollback
	let scrollback = '';
	try {
		const { stdout } = await execAsync(
			`tmux capture-pane -t "${sessionName}" -p -S - -E -`,
			{ maxBuffer: 10 * 1024 * 1024 }
		);
		scrollback = stdout;
	} catch {
		return null;
	}

	if (!scrollback.trim()) {
		return null;
	}

	const timestamp = new Date().toISOString();

	// Determine separator based on reason
	/** @type {Record<string, string>} */
	const separators = {
		compacted: '📦 CONTEXT COMPACTED',
		paused: '⏸️ SESSION PAUSED',
		killed: '💀 SESSION KILLED',
		completed: '✅ TASK COMPLETED'
	};
	const label = separators[reason] || '📝 LOG CAPTURED';

	const separator = `
════════════════════════════════════════════════════════════════════════════════
${label} at ${timestamp}
════════════════════════════════════════════════════════════════════════════════
`;

	// If log file doesn't exist, add header
	if (!existsSync(logFile)) {
		const header = `# Session Log: ${sessionName}
# Created: ${timestamp}
# This file accumulates session history across compactions, pauses, and completions.
================================================================================

`;
		await writeFile(logFile, header, 'utf-8');
	}

	// Append scrollback with separator
	await appendFile(logFile, scrollback + separator, 'utf-8');

	return logFile;
}

/**
 * Session name prefix for JAT agent sessions
 * Sessions are named: jat-{AgentName}
 */
const SESSION_PREFIX = 'jat-';

/**
 * Get tmux session details from route param.
 * Handles:
 * - Agent name (e.g., "DullGrove") → "jat-DullGrove"
 * - Full agent session name (e.g., "jat-DullGrove") → unchanged
 * - Non-agent tmux sessions (e.g., "sb-nucor-abc123") → unchanged
 * @param {string} name - Agent name or full tmux session name
 * @returns {{ agentName: string, sessionName: string, isAgentSession: boolean }}
 */
function resolveSessionName(name) {
	if (name.startsWith(SESSION_PREFIX)) {
		// Already has prefix - extract agent name
		return {
			agentName: name.slice(SESSION_PREFIX.length),
			sessionName: name,
			isAgentSession: true
		};
	}

	// Server/background sessions are passed as real tmux session names
	// and should not be re-prefixed or tied to task release.
	if (name.startsWith('sb-') || name.startsWith('sub-')) {
		return {
			agentName: name,
			sessionName: name,
			isAgentSession: false
		};
	}

	// Default: treat as bare agent name, add jat- prefix
	return {
		agentName: name,
		sessionName: `${SESSION_PREFIX}${name}`,
		isAgentSession: true
	};
}

/**
 * PATCH /api/sessions/[name]
 * Rename a tmux session
 * Body: { newName: string }
 */
/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const { agentName, sessionName } = resolveSessionName(params.name);
		const body = await request.json();
		const { newName } = body;

		if (!agentName) {
			return json({
				error: 'Missing agent name',
				message: 'Agent name is required'
			}, { status: 400 });
		}

		if (!newName) {
			return json({
				error: 'Missing new name',
				message: 'newName is required in request body'
			}, { status: 400 });
		}

		// Rename the tmux session (add prefix to new name as well)
		const newSessionName = `${SESSION_PREFIX}${newName}`;
		const command = `tmux rename-session -t "${sessionName}" "${newSessionName}" 2>&1`;

		try {
			await execAsync(command);

			return json({
				success: true,
				oldAgentName: agentName,
				newAgentName: newName,
				oldSessionName: sessionName,
				newSessionName,
				message: `Session renamed from '${agentName}' to '${newName}'`,
				timestamp: new Date().toISOString()
			});
		} catch (execError) {
			const execErr = /** @type {{ stderr?: string, stdout?: string, message?: string }} */ (execError);
			// With 2>&1, stderr goes to stdout, so check both
			const errorMessage = execErr.stdout || execErr.stderr || execErr.message || String(execError);

			if (errorMessage.includes("can't find session") || errorMessage.includes('no server running')) {
				return json({
					error: 'Session not found',
					message: `No active session for agent '${agentName}' (looked for tmux session '${sessionName}')`,
					agentName,
					sessionName
				}, { status: 404 });
			}

			if (errorMessage.includes('duplicate session')) {
				return json({
					error: 'Name already exists',
					message: `A session named '${newName}' already exists`,
					agentName,
					newName
				}, { status: 409 });
			}

			return json({
				error: 'Failed to rename session',
				message: errorMessage,
				agentName,
				sessionName
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error in PATCH /api/sessions/[name]:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}

/**
 * Find and release an in-progress task assigned to the given agent across all
 * postgres-backed projects. Returns the task ID if found and released, or null.
 *
 * This is the fallback for when getTasks() (SQLite-only) finds nothing.
 *
 * @param {string} agentName
 * @returns {Promise<string|null>}
 */
async function releasePostgresTask(agentName) {
	const config = readProjectsConfig();
	if (!config?.projects) return null;

	for (const [projectName, projectEntry] of Object.entries(config.projects)) {
		const backend_kind = projectEntry?.backend;
		if (backend_kind !== 'postgres') continue;

		try {
			const backend = await getBackendForProject(projectName);
			const tasks = backend.list({ status: 'in_progress' });
			const list = tasks && typeof tasks.then === 'function' ? await tasks : tasks;
			if (!Array.isArray(list) || list.length === 0) continue;

			const task = list.find(t => t.assignee === agentName);
			if (!task) continue;
			// Clear both assignee (text) and assignee_id (UUID FK) so the task
			// shows as unassigned in the UI.
			const r = backend.update(task.id, { status: 'open', assignee: null, assignee_id: null });
			if (r && typeof r.then === 'function') await r;
			return task.id;
		} catch (err) {
			console.warn(`[Session DELETE] Failed to check/release postgres task for project ${projectName}:`, err?.message || err);
		}
	}

	return null;
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	const t0 = Date.now();
	try {
		const { agentName, sessionName, isAgentSession } = resolveSessionName(params.name);
		console.log(`[Session DELETE] Starting cleanup for ${sessionName} (agent: ${agentName}, agentSession: ${isAgentSession})`);

		if (!agentName) {
			return json({
				error: 'Missing agent name',
				message: 'Agent name is required'
			}, { status: 400 });
		}

		// IMPORTANT: Capture scrollback BEFORE killing the session
		// This preserves the session history in the unified log
		let logCaptured = null;
		const t1 = Date.now();
		try {
			logCaptured = await captureSessionLog(sessionName, 'killed');
		} catch (err) {
			console.error('Failed to capture session log before kill:', err);
			// Non-fatal - continue with kill
		}
		console.log(`[Session DELETE] captureSessionLog took ${Date.now() - t1}ms (captured: ${!!logCaptured})`);

		// Kill the tmux session (with jat- prefix)
		const killCommand = `tmux kill-session -t "${sessionName}" 2>&1`;
		let sessionKilled = false;

		const t2 = Date.now();
		try {
			await execAsync(killCommand);
			sessionKilled = true;
		} catch (execError) {
			const execErr = /** @type {{ stderr?: string, stdout?: string, message?: string }} */ (execError);
			const errorMessage = execErr.stdout || execErr.stderr || execErr.message || String(execError);

			// Check if session not found - that's ok, continue to release task
			if (!errorMessage.includes("can't find session") && !errorMessage.includes('no server running')) {
				return json({
					error: 'Failed to kill session',
					message: errorMessage,
					agentName,
					sessionName
				}, { status: 500 });
			}
		}
		console.log(`[Session DELETE] tmux kill-session took ${Date.now() - t2}ms (killed: ${sessionKilled})`);

		// Release the task only for agent sessions.
		// Server/background sessions (sb-/sub-) should just be killed.
		let taskReleased = false;
		let releasedTaskId = null;

		if (isAgentSession) {
			const t3 = Date.now();
			try {
				// Use jat-tasks.js to find tasks across all SQLite projects
				const allTasks = getTasks({ status: 'in_progress' });
				const agentTask = allTasks.find(t => t.assignee === agentName);
				console.log(`[Session DELETE] getTasks scan took ${Date.now() - t3}ms (found ${allTasks.length} in_progress tasks, match: ${agentTask?.id || 'none'})`);

				if (agentTask) {
					const t4 = Date.now();
					// Release the task: set status back to open and clear assignee
					// Run jt update in the task's project directory
					await execAsync(`jt update "${agentTask.id}" --status open --assignee ""`, {
						cwd: agentTask.project_path,
						timeout: 10000
					});
					console.log(`[Session DELETE] jt update (release task) took ${Date.now() - t4}ms`);
					taskReleased = true;
					releasedTaskId = agentTask.id;
				} else {
					// SQLite scan found nothing — check postgres-backed projects directly.
					// (jt CLI requires the IDE to be running for postgres projects, so
					// we query the backend API directly here.)
					const result = await releasePostgresTask(agentName);
					if (result) {
						console.log(`[Session DELETE] Released postgres task ${result} for agent ${agentName}`);
						taskReleased = true;
						releasedTaskId = result;
					}
				}
			} catch (err) {
				// Non-fatal - session is killed, task release just failed
				console.error('Failed to release task:', err);
			}
		}

		console.log(`[Session DELETE] Total: ${Date.now() - t0}ms for ${sessionName} (log:${!!logCaptured} kill:${sessionKilled} release:${releasedTaskId || 'none'})`);

		if (!sessionKilled && !taskReleased) {
			return json({
				error: 'Session not found',
				message: `No active session for agent '${agentName}' and no task to release`,
				agentName,
				sessionName
			}, { status: 404 });
		}

		return json({
			success: true,
			agentName,
			sessionName,
			isAgentSession,
			sessionKilled,
			taskReleased,
			releasedTaskId,
			logCaptured: logCaptured ? true : false,
			logFile: logCaptured || null,
			message: taskReleased
				? `Session killed and task ${releasedTaskId} released`
				: `Session for ${agentName} killed successfully`,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in DELETE /api/sessions/[name]:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
