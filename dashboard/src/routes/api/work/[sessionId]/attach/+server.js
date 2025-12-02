/**
 * POST /api/work/[sessionId]/attach
 * Opens a new terminal window attached to the tmux session
 *
 * Body parameters:
 * - widthPx: pixel width to resize the window to (optional, for Hyprland)
 */

import { json } from '@sveltejs/kit';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST({ params, request }) {
	const { sessionId } = params;

	if (!sessionId) {
		return json({ error: 'Session ID required' }, { status: 400 });
	}

	// Parse optional widthPx from request body
	let widthPx = null;
	try {
		const body = await request.json();
		widthPx = body.widthPx || null;
		console.log('[attach API] Received request for', sessionId, 'widthPx:', widthPx);
	} catch (e) {
		console.log('[attach API] No body or invalid JSON:', e.message);
	}

	try {
		// Check if the tmux session exists
		const { stdout: sessions } = await execAsync('tmux list-sessions -F "#{session_name}" 2>/dev/null || true');
		const sessionList = sessions.trim().split('\n').filter(Boolean);

		if (!sessionList.includes(sessionId)) {
			return json({ error: `Session '${sessionId}' not found` }, { status: 404 });
		}

		// Try to find which terminal is available
		const { stdout: whichResult } = await execAsync('which alacritty kitty gnome-terminal konsole xterm 2>/dev/null | head -1 || true');
		const terminalPath = whichResult.trim();

		if (!terminalPath) {
			return json({ error: 'No terminal emulator found' }, { status: 500 });
		}

		// Determine which terminal and build the command
		let child;
		if (terminalPath.includes('alacritty')) {
			child = spawn('alacritty', ['-e', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else if (terminalPath.includes('kitty')) {
			child = spawn('kitty', ['tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else if (terminalPath.includes('gnome-terminal')) {
			child = spawn('gnome-terminal', ['--', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else if (terminalPath.includes('konsole')) {
			child = spawn('konsole', ['--new-tab', '-e', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else {
			// xterm fallback
			child = spawn('xterm', ['-e', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		}

		// Unref so the parent doesn't wait for the child
		child.unref();

		// If widthPx is provided, resize the window to match the SessionCard width
		// This uses hyprctl for Hyprland window manager
		if (widthPx) {
			setTimeout(async () => {
				try {
					// Check if hyprctl exists (Hyprland)
					await execAsync('which hyprctl');
					// Get current window height to preserve it
					const { stdout: activeWin } = await execAsync('hyprctl activewindow -j');
					const winInfo = JSON.parse(activeWin);
					const currentHeight = winInfo.size?.[1] || 600;
					const currentWidth = winInfo.size?.[0] || 0;
					const windowTitle = winInfo.title || 'unknown';
					const windowClass = winInfo.class || 'unknown';

					console.log(`[attach API] Active window: "${windowTitle}" (${windowClass}), current size: ${currentWidth}x${currentHeight}`);
					console.log(`[attach API] Resizing to ${Math.round(widthPx)}x${currentHeight}`);

					// Resize width to match SessionCard, keep current height
					const { stdout, stderr } = await execAsync(
						`hyprctl dispatch resizewindowpixel "exact ${Math.round(widthPx)} ${currentHeight},activewindow"`
					);
					console.log(`[attach API] Resize result: ${stdout || 'ok'}`, stderr ? `stderr: ${stderr}` : '');
				} catch (e) {
					console.log(`[attach API] Resize failed:`, e.message);
				}
			}, 500);
		}

		return json({
			success: true,
			session: sessionId,
			terminal: terminalPath,
			widthPx: widthPx ? Math.round(widthPx) : null
		});
	} catch (error) {
		console.error('Failed to attach terminal:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
