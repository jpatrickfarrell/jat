/**
 * Servers API - Start Server Session
 * POST /api/servers/start - Start a new dev server in a tmux session
 *
 * Request body:
 * - projectName: Name of the project (required)
 * - command: Command to run (optional, defaults to 'npm run dev')
 * - port: Port to use (optional, will be detected from output)
 *
 * Creates a tmux session named: server-{projectName}
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { projectName, command = 'npm run dev', port } = body;

		if (!projectName) {
			return json(
				{ error: 'Missing required field: projectName' },
				{ status: 400 }
			);
		}

		// Validate project name (alphanumeric, hyphens, underscores only)
		if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
			return json(
				{ error: 'Invalid project name. Use only letters, numbers, hyphens, and underscores.' },
				{ status: 400 }
			);
		}

		const sessionName = `server-${projectName}`;

		// Check if session already exists
		try {
			const { stdout } = await execAsync(
				`tmux has-session -t "${sessionName}" 2>/dev/null && echo "exists" || echo "no"`
			);
			if (stdout.trim() === 'exists') {
				return json(
					{
						error: 'Session already exists',
						message: `Server session "${sessionName}" is already running`
					},
					{ status: 409 }
				);
			}
		} catch {
			// tmux might not be running, continue
		}

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

		// Verify project path exists
		try {
			const { stdout } = await execAsync(`test -d "${projectPath}" && echo "exists" || echo "no"`);
			if (stdout.trim() !== 'exists') {
				return json(
					{
						error: 'Project directory not found',
						message: `Directory does not exist: ${projectPath}`
					},
					{ status: 404 }
				);
			}
		} catch {
			return json(
				{
					error: 'Failed to verify project path',
					message: `Could not check directory: ${projectPath}`
				},
				{ status: 500 }
			);
		}

		// Build the command with optional port
		let serverCommand = command;
		if (port && !command.includes('--port')) {
			serverCommand = `${command} -- --port ${port}`;
		}

		// Create tmux session and start the server
		const createCmd = `
			tmux new-session -d -s "${sessionName}" -c "${projectPath}" && \
			tmux send-keys -t "${sessionName}" "${serverCommand}" Enter
		`;

		try {
			await execAsync(createCmd);
		} catch (err) {
			return json(
				{
					error: 'Failed to create server session',
					message: err instanceof Error ? err.message : String(err)
				},
				{ status: 500 }
			);
		}

		// Wait a moment and get initial output
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
			session: {
				mode: 'server',
				sessionName,
				projectName,
				displayName: `${projectName.charAt(0).toUpperCase() + projectName.slice(1)} Dev Server`,
				port: port || null,
				portRunning: false,
				status: 'starting',
				output,
				lineCount,
				created: new Date().toISOString(),
				attached: false,
				projectPath,
				command: serverCommand
			},
			message: `Started server session: ${sessionName}`
		});
	} catch (error) {
		console.error('Error in POST /api/servers/start:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
