/**
 * Tmux Command API - Execute tmux commands
 * POST /api/tmux/command
 *
 * Executes whitelisted tmux commands for automation.
 * Only allows safe commands: send-keys, select-pane, resize-pane
 */

import { json } from '@sveltejs/kit';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Whitelist of allowed tmux subcommands
const ALLOWED_COMMANDS = ['send-keys', 'select-pane', 'resize-pane'];

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { sessionName, command } = body;

		if (!sessionName) {
			return json({
				error: 'Missing session name',
				message: 'Session name is required'
			}, { status: 400 });
		}

		if (!command) {
			return json({
				error: 'Missing command',
				message: 'Tmux command is required'
			}, { status: 400 });
		}

		// Validate command is whitelisted
		const commandParts = command.trim().split(/\s+/);
		const subcommand = commandParts[0];

		if (!ALLOWED_COMMANDS.includes(subcommand)) {
			return json({
				error: 'Command not allowed',
				message: `Tmux subcommand '${subcommand}' is not in whitelist: ${ALLOWED_COMMANDS.join(', ')}`
			}, { status: 403 });
		}

		// Build args for tmux
		// Command format: "send-keys -t {session} Enter"
		// We need to parse and add -t if not present
		let args = commandParts;

		// If command doesn't include -t, add the session target
		if (!args.includes('-t')) {
			args = [subcommand, '-t', sessionName, ...commandParts.slice(1)];
		}

		try {
			const result = await execFileAsync('tmux', args);

			return json({
				success: true,
				sessionName,
				command,
				stdout: result.stdout,
				message: `Command executed: tmux ${args.join(' ')}`
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
				error: 'Command failed',
				message: errorMessage,
				sessionName
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error in POST /api/tmux/command:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
