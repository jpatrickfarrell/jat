/**
 * Session Management API - Kill Session
 * DELETE /api/sessions/[name]
 *
 * Kills a tmux session by name (format: jat-{AgentName})
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	try {
		const sessionName = params.name;

		if (!sessionName) {
			return json({
				error: 'Missing session name',
				message: 'Session name is required'
			}, { status: 400 });
		}

		// Kill the tmux session
		const command = `tmux kill-session -t "${sessionName}" 2>&1`;

		try {
			await execAsync(command);

			return json({
				success: true,
				sessionName,
				message: `Session ${sessionName} killed successfully`,
				timestamp: new Date().toISOString()
			});
		} catch (execError) {
			const execErr = /** @type {{ stderr?: string, message?: string }} */ (execError);
			const errorMessage = execErr.stderr || execErr.message || String(execError);

			// Check if session not found
			if (errorMessage.includes("can't find session") || errorMessage.includes('no server running')) {
				return json({
					error: 'Session not found',
					message: `Session '${sessionName}' does not exist`,
					sessionName
				}, { status: 404 });
			}

			return json({
				error: 'Failed to kill session',
				message: errorMessage,
				sessionName
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error in DELETE /api/sessions/[name]:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
