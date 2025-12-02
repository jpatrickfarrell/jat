/**
 * Servers API - List Active Server Sessions
 * GET /api/servers - Return all active dev server tmux sessions with output
 *
 * Server sessions are tmux sessions running dev servers (npm run dev, etc.)
 * They use the naming convention: server-{projectName} (e.g., "server-chimaro")
 *
 * Each ServerSession includes:
 * - mode: 'server' (constant)
 * - sessionName: tmux session name (e.g., "server-chimaro")
 * - projectName: Project name extracted from session (e.g., "chimaro")
 * - displayName: Human-readable display name
 * - port: Detected port from output (e.g., 5173)
 * - portRunning: Whether the port is actively listening
 * - status: 'running' | 'starting' | 'stopped'
 * - output: Recent terminal output with ANSI codes
 * - lineCount: Number of output lines
 * - created: Session creation timestamp
 * - attached: Whether session is attached
 * - projectPath: Path to project directory
 * - command: Command being run (detected from output)
 *
 * Query params:
 * - lines: Number of output lines to capture (default: 50, max: 500)
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Strip ANSI escape codes from text
 * @param {string} text - Text with ANSI codes
 * @returns {string} - Clean text
 */
function stripAnsi(text) {
	// eslint-disable-next-line no-control-regex
	return text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

/**
 * Detect port from server output
 * Looks for common patterns like "localhost:5173", ":5173", "port 5173"
 * @param {string} output - Terminal output (may contain ANSI codes)
 * @returns {number|null} - Detected port or null
 */
function detectPort(output) {
	// Strip ANSI codes before pattern matching
	const cleanOutput = stripAnsi(output);

	// Common patterns for port detection
	const patterns = [
		/localhost:(\d+)/i,
		/127\.0\.0\.1:(\d+)/i,
		/0\.0\.0\.0:(\d+)/i,
		/:(\d{4,5})\b/,
		/port\s*[=:]\s*(\d+)/i,
		/listening\s+(?:on\s+)?(?:port\s+)?(\d+)/i,
		/http:\/\/[^:]+:(\d+)/i,
		/https:\/\/[^:]+:(\d+)/i
	];

	for (const pattern of patterns) {
		const match = cleanOutput.match(pattern);
		if (match && match[1]) {
			const port = parseInt(match[1], 10);
			// Only return valid port numbers (1024-65535 for user ports)
			if (port >= 1024 && port <= 65535) {
				return port;
			}
		}
	}
	return null;
}

/**
 * Check if a port is actively listening
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - Whether port is listening
 */
async function isPortListening(port) {
	try {
		// Use ss (faster) or netstat to check if port is listening
		const { stdout } = await execAsync(
			`ss -tlnp 2>/dev/null | grep -q ":${port} " && echo "yes" || echo "no"`
		);
		return stdout.trim() === 'yes';
	} catch {
		return false;
	}
}

/**
 * Detect server status from output
 * @param {string} output - Terminal output
 * @param {boolean} portRunning - Whether detected port is listening
 * @returns {'running' | 'starting' | 'stopped'}
 */
function detectStatus(output, portRunning) {
	// Strip ANSI codes before pattern matching
	const recentOutput = stripAnsi(output.slice(-2000));

	// Check for error patterns (server stopped/crashed)
	const errorPatterns = [
		/error:/i,
		/EADDRINUSE/i,
		/failed to start/i,
		/exit code/i,
		/npm err!/i,
		/crashed/i,
		/terminated/i
	];

	for (const pattern of errorPatterns) {
		if (pattern.test(recentOutput)) {
			return 'stopped';
		}
	}

	// If port is actively listening, server is running
	if (portRunning) {
		return 'running';
	}

	// Check for startup patterns
	const startingPatterns = [
		/starting/i,
		/compiling/i,
		/building/i,
		/bundling/i,
		/waiting for/i,
		/preparing/i
	];

	for (const pattern of startingPatterns) {
		if (pattern.test(recentOutput)) {
			return 'starting';
		}
	}

	// Check for ready patterns
	const readyPatterns = [
		/ready in/i,
		/listening on/i,
		/server running/i,
		/local:/i,
		/network:/i,
		/started server/i
	];

	for (const pattern of readyPatterns) {
		if (pattern.test(recentOutput)) {
			return 'running';
		}
	}

	// Default to starting if we have output but no clear status
	return output.length > 0 ? 'starting' : 'stopped';
}

/**
 * Detect command being run from output or process
 * @param {string} output - Terminal output
 * @returns {string} - Detected command
 */
function detectCommand(output) {
	// Strip ANSI codes and look for npm/pnpm/yarn commands in first few lines
	const firstLines = stripAnsi(output.slice(0, 500));

	if (/npm run dev/i.test(firstLines)) return 'npm run dev';
	if (/pnpm dev/i.test(firstLines)) return 'pnpm dev';
	if (/yarn dev/i.test(firstLines)) return 'yarn dev';
	if (/vite/i.test(firstLines)) return 'vite';
	if (/next dev/i.test(firstLines)) return 'next dev';
	if (/svelte.*dev/i.test(firstLines)) return 'svelte dev';

	return 'npm run dev'; // Default assumption
}

/**
 * Generate display name from project name
 * @param {string} projectName - Project name (e.g., "chimaro")
 * @returns {string} - Display name (e.g., "Chimaro Dev Server")
 */
function generateDisplayName(projectName) {
	const capitalized = projectName.charAt(0).toUpperCase() + projectName.slice(1);
	return `${capitalized} Dev Server`;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const linesParam = url.searchParams.get('lines');
		const lines = Math.min(Math.max(parseInt(linesParam || '50', 10) || 50, 1), 500);

		// Step 1: List server-* tmux sessions
		const sessionsCommand = `tmux list-sessions -F "#{session_name}:#{session_created}:#{session_attached}" 2>/dev/null || echo ""`;

		let sessionsOutput = '';
		try {
			const { stdout } = await execAsync(sessionsCommand);
			sessionsOutput = stdout.trim();
		} catch {
			// No tmux server or no sessions - return empty
			return json({
				success: true,
				sessions: [],
				count: 0,
				timestamp: new Date().toISOString()
			});
		}

		if (!sessionsOutput) {
			return json({
				success: true,
				sessions: [],
				count: 0,
				timestamp: new Date().toISOString()
			});
		}

		// Parse sessions and filter for server-* prefix
		const rawSessions = sessionsOutput
			.split('\n')
			.filter((line) => line.length > 0)
			.map((line) => {
				const [name, created, attached] = line.split(':');
				return {
					name,
					created: new Date(parseInt(created, 10) * 1000).toISOString(),
					attached: attached === '1'
				};
			})
			.filter((session) => session.name.startsWith('server-'));

		if (rawSessions.length === 0) {
			return json({
				success: true,
				sessions: [],
				count: 0,
				timestamp: new Date().toISOString()
			});
		}

		// Step 2: Build ServerSession for each tmux session
		const serverSessions = await Promise.all(
			rawSessions.map(async (session) => {
				// Extract project name from session name (server-projectName -> projectName)
				const projectName = session.name.replace(/^server-/, '');

				// Capture output
				let output = '';
				let lineCount = 0;
				try {
					const captureCommand = `tmux capture-pane -p -e -t "${session.name}" -S -${lines}`;
					const { stdout } = await execAsync(captureCommand, { maxBuffer: 1024 * 1024 * 5 });
					output = stdout;
					lineCount = stdout.split('\n').length;
				} catch {
					// Session might have closed, continue with empty output
					output = '';
					lineCount = 0;
				}

				// Detect port from output
				const port = detectPort(output);

				// Check if port is actually listening
				const portRunning = port ? await isPortListening(port) : false;

				// Detect status
				const status = detectStatus(output, portRunning);

				// Detect command
				const command = detectCommand(output);

				// Generate display name
				const displayName = generateDisplayName(projectName);

				// Try to get project path from jat config
				let projectPath = null;
				try {
					const configPath = `${process.env.HOME}/.config/jat/projects.json`;
					const { stdout: configOutput } = await execAsync(
						`jq -r '.projects["${projectName}"].path // empty' "${configPath}" 2>/dev/null`
					);
					projectPath = configOutput.trim().replace(/^~/, process.env.HOME || '');
				} catch {
					// Config not available, use default path
					projectPath = `${process.env.HOME}/code/${projectName}`;
				}

				return {
					mode: 'server',
					sessionName: session.name,
					projectName,
					displayName,
					port,
					portRunning,
					status,
					output,
					lineCount,
					created: session.created,
					attached: session.attached,
					projectPath,
					command
				};
			})
		);

		return json({
			success: true,
			sessions: serverSessions,
			count: serverSessions.length,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in GET /api/servers:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
