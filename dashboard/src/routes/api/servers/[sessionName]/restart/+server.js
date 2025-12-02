/**
 * Servers API - Restart Server Session
 * POST /api/servers/{sessionName}/restart - Restart a server session
 *
 * Sends Ctrl+C to stop the current process, then re-runs the server command.
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function POST({ params }) {
	const { sessionName } = params;

	if (!sessionName) {
		return json(
			{ error: 'Missing session name' },
			{ status: 400 }
		);
	}

	// Validate session name format (must start with server-)
	if (!sessionName.startsWith('server-')) {
		return json(
			{
				error: 'Invalid session name',
				message: 'Server sessions must have names starting with "server-"'
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

		// Get the project name from session name
		const projectName = sessionName.replace(/^server-/, '');

		// Get project path from jat config or use default
		let projectPath = null;
		try {
			const configPath = `${process.env.HOME}/.config/jat/projects.json`;
			const { stdout: configOutput } = await execAsync(
				`jq -r '.projects["${projectName}"].path // empty' "${configPath}" 2>/dev/null`
			);
			const path = configOutput.trim();
			if (path) {
				projectPath = path.replace(/^~/, process.env.HOME || '');
			}
		} catch {
			// Config not available
		}

		// Fall back to default path
		if (!projectPath) {
			projectPath = `${process.env.HOME}/code/${projectName}`;
		}

		// Send Ctrl+C to stop the current server
		await execAsync(`tmux send-keys -t "${sessionName}" C-c`);

		// Wait for graceful shutdown
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Clear the terminal
		await execAsync(`tmux send-keys -t "${sessionName}" "clear" Enter`);
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Re-run npm run dev (the most common command)
		// In future, we could track the original command and replay it
		await execAsync(`tmux send-keys -t "${sessionName}" "npm run dev" Enter`);

		// Wait a moment and get output
		await new Promise((resolve) => setTimeout(resolve, 500));

		let output = '';
		let lineCount = 0;
		try {
			const { stdout } = await execAsync(
				`tmux capture-pane -p -e -t "${sessionName}" -S -50`,
				{ maxBuffer: 1024 * 1024 }
			);
			output = stdout;
			lineCount = stdout.split('\n').length;
		} catch {
			// Session might not have output yet
		}

		return json({
			success: true,
			message: `Restarted server session: ${sessionName}`,
			session: {
				mode: 'server',
				sessionName,
				projectName,
				status: 'starting',
				output,
				lineCount,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		console.error('Error in POST /api/servers/[sessionName]/restart:', error);
		return json(
			{
				error: 'Failed to restart server session',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
