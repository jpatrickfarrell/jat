/**
 * Session Management API
 * DELETE /api/sessions/[name] - Kill a session (and release task)
 * PATCH /api/sessions/[name] - Rename a session
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getTasks } from '$lib/server/beads.js';

const execAsync = promisify(exec);

/**
 * Session name prefix for JAT agent sessions
 * Sessions are named: jat-{AgentName}
 */
const SESSION_PREFIX = 'jat-';

/**
 * Get the full tmux session name from a name parameter.
 * Handles both:
 * - Agent name (e.g., "DullGrove") → "jat-DullGrove"
 * - Full session name (e.g., "jat-DullGrove") → "jat-DullGrove" (no double prefix)
 * @param {string} name - Agent name or full session name
 * @returns {{ agentName: string, sessionName: string }}
 */
function resolveSessionName(name) {
	if (name.startsWith(SESSION_PREFIX)) {
		// Already has prefix - extract agent name
		return {
			agentName: name.slice(SESSION_PREFIX.length),
			sessionName: name
		};
	}
	// Add prefix
	return {
		agentName: name,
		sessionName: `${SESSION_PREFIX}${name}`
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

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	try {
		const { agentName, sessionName } = resolveSessionName(params.name);

		if (!agentName) {
			return json({
				error: 'Missing agent name',
				message: 'Agent name is required'
			}, { status: 400 });
		}

		// Kill the tmux session (with jat- prefix)
		const killCommand = `tmux kill-session -t "${sessionName}" 2>&1`;
		let sessionKilled = false;

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

		// Release the task assigned to this agent (search across ALL projects)
		// Find tasks where assignee = agentName and status = in_progress, set back to open with no assignee
		let taskReleased = false;
		let releasedTaskId = null;

		try {
			// Use beads.js to find tasks across all projects
			const allTasks = getTasks({ status: 'in_progress' });
			const agentTask = allTasks.find(t => t.assignee === agentName);

			if (agentTask) {
				// Release the task: set status back to open and clear assignee
				// Run bd update in the task's project directory
				await execAsync(`bd update "${agentTask.id}" --status open --assignee ""`, {
					cwd: agentTask.project_path,
					timeout: 10000
				});
				taskReleased = true;
				releasedTaskId = agentTask.id;
			}
		} catch (err) {
			// Non-fatal - session is killed, task release just failed
			console.error('Failed to release task:', err);
		}

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
			sessionKilled,
			taskReleased,
			releasedTaskId,
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
