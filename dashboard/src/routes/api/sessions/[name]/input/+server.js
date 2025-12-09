/**
 * Session Input API - Send Input to Session
 * POST /api/sessions/[name]/input
 *
 * Sends input to a tmux session. Supports:
 * - text: Regular text input (sent with Enter)
 * - ctrl-c: Sends Ctrl+C interrupt signal
 * - ctrl-d: Sends Ctrl+D (EOF)
 * - ctrl-u: Sends Ctrl+U (clear line)
 * - tab: Sends Tab key (for autocomplete)
 * - raw: Send exact keys without Enter
 */

import { json } from '@sveltejs/kit';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const sessionName = params.name;

		if (!sessionName) {
			return json({
				error: 'Missing session name',
				message: 'Session name is required'
			}, { status: 400 });
		}

		const body = await request.json();
		const { type = 'text', input = '' } = body;

		// Build args array for execFile (avoids shell escaping issues entirely)
		// Using execFile instead of exec means no shell interpretation of quotes, $, etc.
		/** @type {string[]} */
		let args;

		switch (type) {
			case 'enter':
				// Send just Enter (accept highlighted option in Claude Code prompts)
				args = ['send-keys', '-t', sessionName, 'Enter'];
				break;

			case 'down':
				// Send Down arrow
				args = ['send-keys', '-t', sessionName, 'Down'];
				break;

			case 'up':
				// Send Up arrow
				args = ['send-keys', '-t', sessionName, 'Up'];
				break;

			case 'escape':
				// Send Escape key
				args = ['send-keys', '-t', sessionName, 'Escape'];
				break;

			case 'ctrl-c':
				// Send Ctrl+C (interrupt signal)
				args = ['send-keys', '-t', sessionName, 'C-c'];
				break;

			case 'ctrl-d':
				// Send Ctrl+D (EOF)
				args = ['send-keys', '-t', sessionName, 'C-d'];
				break;

			case 'ctrl-u':
				// Send Ctrl+U (clear line - for live streaming input)
				args = ['send-keys', '-t', sessionName, 'C-u'];
				break;

			case 'tab':
				// Send Tab key (for autocomplete in terminal)
				args = ['send-keys', '-t', sessionName, 'Tab'];
				break;

			case 'raw':
				// Send raw keys without Enter
				// Using -l flag for literal mode (no key name interpretation)
				// Using -- to stop option parsing (prevents input like "-a" being interpreted as a flag)
				args = ['send-keys', '-t', sessionName, '-l', '--', input];
				break;

			case 'text':
			default:
				// Send text followed by Enter
				// Using -l flag for literal mode, then separate Enter key
				// Using -- to stop option parsing (prevents input like "-a" being interpreted as a flag)
				args = ['send-keys', '-t', sessionName, '-l', '--', input];
				break;
		}

		try {
			await execFileAsync('tmux', args);

			// For 'text' type, send Enter separately after the literal text
			if (type === 'text' || type === undefined) {
				await execFileAsync('tmux', ['send-keys', '-t', sessionName, 'Enter']);
			}

			return json({
				success: true,
				sessionName,
				type,
				input: type === 'ctrl-c' || type === 'ctrl-d' ? type : input,
				message: `Input sent to session ${sessionName}`,
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
				error: 'Failed to send input',
				message: errorMessage,
				sessionName
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error in POST /api/sessions/[name]/input:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
