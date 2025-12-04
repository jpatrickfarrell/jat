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

		// Get project config (path and port) from jat config
		let projectPath = null;
		let configPort = null;
		let detectedPort = null;

		// First, try to detect port from current output (most accurate - shows what's actually running)
		try {
			const { stdout: outputStdout } = await execAsync(
				`tmux capture-pane -p -t "${sessionName}" -S -500`
			);
			// Look for port patterns - prioritize localhost:port and --port patterns
			const portPatterns = [
				/localhost:(\d+)/,
				/127\.0\.0\.1:(\d+)/,
				/--port\s+(\d+)/,
				/port\s+(\d+)/i
			];
			for (const pattern of portPatterns) {
				const match = outputStdout.match(pattern);
				if (match && match[1]) {
					const port = parseInt(match[1], 10);
					if (port >= 1024 && port <= 65535) {
						detectedPort = port;
						break;
					}
				}
			}
		} catch {
			// Ignore detection errors
		}

		// Get project config as fallback
		try {
			const configPath = `${process.env.HOME}/.config/jat/projects.json`;
			const { stdout: configOutput } = await execAsync(
				`jq -r '.projects["${projectName}"] | "\\(.path // empty)|\\(.port // empty)"' "${configPath}" 2>/dev/null`
			);
			const [pathPart, portPart] = configOutput.trim().split('|');
			if (pathPart) {
				projectPath = pathPart.replace(/^~/, process.env.HOME || '');
			}
			if (portPart) {
				configPort = parseInt(portPart, 10);
			}
		} catch {
			// Config not available
		}

		// Fall back to default path
		if (!projectPath) {
			projectPath = `${process.env.HOME}/code/${projectName}`;
		}

		// Use detected port first, then config port as fallback
		const port = detectedPort || configPort;

		// Build the restart command with port if available
		const portArg = port ? ` -- --port ${port}` : '';
		const restartCommand = `npm run dev${portArg}`;

		// Kill the existing session (Ctrl+C may cause it to exit entirely)
		try {
			await execAsync(`tmux kill-session -t "${sessionName}" 2>/dev/null`);
		} catch {
			// Session may already be dead
		}

		// Wait a moment for cleanup
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Determine the correct working directory
		// Check if dashboard subdirectory exists with package.json
		let workDir = projectPath;
		try {
			const { stdout: checkResult } = await execAsync(
				`test -f "${projectPath}/dashboard/package.json" && echo "dashboard" || echo "root"`
			);
			if (checkResult.trim() === 'dashboard') {
				workDir = `${projectPath}/dashboard`;
			}
		} catch {
			// Use projectPath as-is
		}

		// Create a new session with a shell (so it survives future restarts)
		await execAsync(`tmux new-session -d -s "${sessionName}" -c "${workDir}"`);

		// Wait for session to be ready
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Send the dev command
		await execAsync(`tmux send-keys -t "${sessionName}" "${restartCommand}" Enter`);

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
			command: restartCommand,
			session: {
				mode: 'server',
				sessionName,
				projectName,
				port,
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
