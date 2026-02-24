/**
 * Servers API - Server Session Operations
 * DELETE /api/servers/{sessionName} - Stop and kill a server session
 *
 * Operations:
 * - DELETE: Stop the server and kill the tmux session
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isServerSession } from '$lib/utils/sessionNaming.js';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	const { sessionName } = params;

	if (!sessionName) {
		return json(
			{ error: 'Missing session name' },
			{ status: 400 }
		);
	}

	// Validate session name format (must be a server session: jat-app-*, jat-{service}, or legacy server-*)
	if (!isServerSession(sessionName)) {
		return json(
			{
				error: 'Invalid session name',
				message: 'Not a recognized server session name'
			},
			{ status: 400 }
		);
	}

	try {
		// Check if session exists
		const { stdout: checkOutput } = await execAsync(
			`tmux has-session -t "${sessionName}" 2>/dev/null && echo "exists" || echo "no"`
		);

		if (checkOutput.trim() !== 'exists') {
			return json(
				{
					error: 'Session not found',
					message: `Server session "${sessionName}" does not exist`
				},
				{ status: 404 }
			);
		}

		// Send Ctrl+C first to gracefully stop the server
		try {
			await execAsync(`tmux send-keys -t "${sessionName}" C-c`);
			// Wait a moment for graceful shutdown
			await new Promise((resolve) => setTimeout(resolve, 500));
		} catch {
			// Ignore if send-keys fails
		}

		// Kill the tmux session
		await execAsync(`tmux kill-session -t "${sessionName}"`);

		return json({
			success: true,
			message: `Stopped and killed server session: ${sessionName}`,
			sessionName,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in DELETE /api/servers/[sessionName]:', error);
		return json(
			{
				error: 'Failed to stop server session',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
