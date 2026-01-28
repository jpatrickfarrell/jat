/**
 * Work Session Input API - Send Input to Session
 * POST /api/work/[sessionId]/input
 *
 * Sends input to a work session's tmux pane. Supports:
 * - text: Regular text input (sent with Enter)
 * - enter: Just Enter key (accept highlighted option)
 * - down: Down arrow key
 * - up: Up arrow key
 * - left: Left arrow key
 * - right: Right arrow key
 * - escape: Escape key
 * - ctrl-c: Sends Ctrl+C interrupt signal
 * - ctrl-d: Sends Ctrl+D (EOF)
 * - ctrl-u: Sends Ctrl+U (clear line from cursor to beginning)
 * - ctrl-l: Sends Ctrl+L (clear screen)
 * - tab: Sends Tab key (for autocomplete)
 * - raw: Send exact keys without Enter
 *
 * Body:
 * - type: Input type (default: 'text')
 * - input: Text to send (for text/raw types)
 */

import { json } from '@sveltejs/kit';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const sessionId = params.sessionId;

		if (!sessionId) {
			return json({
				error: 'Missing session ID',
				message: 'Session ID is required'
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
				args = ['send-keys', '-t', sessionId, 'Enter'];
				break;

			case 'down':
				// Send Down arrow
				args = ['send-keys', '-t', sessionId, 'Down'];
				break;

			case 'up':
				// Send Up arrow
				args = ['send-keys', '-t', sessionId, 'Up'];
				break;

			case 'escape':
				// Send Escape key
				args = ['send-keys', '-t', sessionId, 'Escape'];
				break;

			case 'ctrl-c':
				// Send Ctrl+C (interrupt signal)
				args = ['send-keys', '-t', sessionId, 'C-c'];
				break;

			case 'ctrl-d':
				// Send Ctrl+D (EOF)
				args = ['send-keys', '-t', sessionId, 'C-d'];
				break;

			case 'ctrl-u':
				// Send Ctrl+U (clear line from cursor to beginning - for live streaming)
				args = ['send-keys', '-t', sessionId, 'C-u'];
				break;

			case 'tab':
				// Send Tab key (for autocomplete in terminal)
				args = ['send-keys', '-t', sessionId, 'Tab'];
				break;

			case 'left':
				// Send Left arrow
				args = ['send-keys', '-t', sessionId, 'Left'];
				break;

			case 'right':
				// Send Right arrow
				args = ['send-keys', '-t', sessionId, 'Right'];
				break;

			case 'ctrl-l':
				// Send Ctrl+L (clear screen)
				args = ['send-keys', '-t', sessionId, 'C-l'];
				break;

			case 'delete':
				// Send Delete key (delete character forward)
				args = ['send-keys', '-t', sessionId, 'DC'];
				break;

			case 'backspace':
				// Send Backspace key (delete character backward)
				args = ['send-keys', '-t', sessionId, 'BSpace'];
				break;

			case 'space':
				// Send Space key (for toggling options in multi-select prompts)
				args = ['send-keys', '-t', sessionId, 'Space'];
				break;

			case 'raw':
				// Send raw keys without Enter
				// Using -l flag for literal mode (no key name interpretation)
				// Using -- to stop option parsing (prevents input like "-a" being interpreted as a flag)
				args = ['send-keys', '-t', sessionId, '-l', '--', input];
				break;

			case 'text':
			default:
				// Send text followed by Enter
				// Using -l flag for literal mode, then separate Enter key
				// Using -- to stop option parsing (prevents input like "-a" being interpreted as a flag)
				args = ['send-keys', '-t', sessionId, '-l', '--', input];
				break;
		}

		try {
			await execFileAsync('tmux', args);

			// For 'text' type, send Enter separately after the literal text
			if (type === 'text' || type === undefined) {
				await execFileAsync('tmux', ['send-keys', '-t', sessionId, 'Enter']);
			}

			return json({
				success: true,
				sessionId,
				type,
				input: ['ctrl-c', 'ctrl-d', 'ctrl-u', 'ctrl-l', 'tab', 'enter', 'down', 'up', 'left', 'right', 'escape', 'delete', 'backspace', 'space'].includes(type) ? type : input,
				message: `Input sent to session ${sessionId}`,
				timestamp: new Date().toISOString()
			});
		} catch (execError) {
			const execErr = /** @type {{ stderr?: string, message?: string }} */ (execError);
			const errorMessage = execErr.stderr || execErr.message || String(execError);

			// Check if session not found
			if (errorMessage.includes("can't find session") || errorMessage.includes('no server running')) {
				return json({
					error: 'Session not found',
					message: `Session '${sessionId}' does not exist`,
					sessionId
				}, { status: 404 });
			}

			return json({
				error: 'Failed to send input',
				message: errorMessage,
				sessionId
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error in POST /api/work/[sessionId]/input:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
