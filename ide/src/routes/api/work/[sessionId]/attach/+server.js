/**
 * POST /api/work/[sessionId]/attach
 * Opens a new terminal window attached to the tmux session
 * Applies Hyprland border colors based on project configuration
 */

import { json } from '@sveltejs/kit';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const execAsync = promisify(exec);

/**
 * Session name prefix for JAT agent sessions
 */
const SESSION_PREFIX = 'jat-';

/**
 * Check if Hyprland is available
 */
async function isHyprlandAvailable() {
	try {
		await execAsync('command -v hyprctl', { timeout: 1000 });
		return true;
	} catch {
		return false;
	}
}

/**
 * Get all Hyprland window addresses
 * @returns {Promise<Set<string>>}
 */
async function getHyprlandWindowAddresses() {
	try {
		const { stdout } = await execAsync('hyprctl clients -j', { timeout: 5000 });
		const clients = JSON.parse(stdout);
		return new Set(clients.map((/** @type {{address: string}} */ c) => c.address));
	} catch {
		return new Set();
	}
}

/**
 * Apply border color directly to a window by address
 * @param {string} address - Window address
 * @param {string} activeColor - Active border color
 * @param {string} inactiveColor - Inactive border color
 */
async function applyBorderColorToWindow(address, activeColor, inactiveColor) {
	try {
		if (activeColor) {
			await execAsync(
				`hyprctl dispatch setprop "address:${address}" activebordercolor "${activeColor}"`,
				{ timeout: 2000 }
			);
		}
		if (inactiveColor) {
			await execAsync(
				`hyprctl dispatch setprop "address:${address}" inactivebordercolor "${inactiveColor}"`,
				{ timeout: 2000 }
			);
		}
		return true;
	} catch {
		return false;
	}
}

/**
 * Get project colors from config
 * @param {string} projectName
 * @returns {Promise<{activeColor: string, inactiveColor: string} | null>}
 */
async function getProjectColors(projectName) {
	try {
		const configPath = join(homedir(), '.config', 'jat', 'projects.json');
		if (!existsSync(configPath)) return null;

		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		const projectConfig = config.projects?.[projectName];
		if (!projectConfig?.active_color) return null;

		// Normalize colors to rgb() format
		const normalize = (/** @type {string} */ c) => {
			if (!c) return '';
			if (c.startsWith('rgb(')) return c;
			if (c.startsWith('#')) return `rgb(${c.slice(1)})`;
			return `rgb(${c})`;
		};

		return {
			activeColor: normalize(projectConfig.active_color),
			inactiveColor: normalize(projectConfig.inactive_color)
		};
	} catch {
		return null;
	}
}

/**
 * Find the project for a session by looking up agent files across projects
 * @param {string} agentName - Agent name to look up
 * @returns {Promise<string | null>} Project name or null
 */
async function findProjectForAgent(agentName) {
	const codeDir = join(homedir(), 'code');
	if (!existsSync(codeDir)) return null;

	try {
		const projects = readdirSync(codeDir, { withFileTypes: true })
			.filter(d => d.isDirectory() && !d.name.startsWith('.'))
			.map(d => d.name);

		for (const project of projects) {
			const sessionsDir = join(codeDir, project, '.claude', 'sessions');
			const claudeDir = join(codeDir, project, '.claude');

			// Check sessions directory
			if (existsSync(sessionsDir)) {
				const files = readdirSync(sessionsDir)
					.filter(f => f.startsWith('agent-') && f.endsWith('.txt'));
				for (const file of files) {
					const content = readFileSync(join(sessionsDir, file), 'utf-8').trim();
					if (content === agentName) {
						return project;
					}
				}
			}

			// Check legacy location
			if (existsSync(claudeDir)) {
				const files = readdirSync(claudeDir)
					.filter(f => f.startsWith('agent-') && f.endsWith('.txt'));
				for (const file of files) {
					const content = readFileSync(join(claudeDir, file), 'utf-8').trim();
					if (content === agentName) {
						return project;
					}
				}
			}
		}
	} catch {
		// Ignore errors
	}

	return null;
}

/**
 * Apply Hyprland border colors to a newly spawned window
 * Waits for the window to appear and applies colors directly by address
 * @param {Set<string>} windowsBefore - Window addresses before spawn
 * @param {string} projectName - Project name for colors
 */
async function applyHyprlandColorsToNewWindow(windowsBefore, projectName) {
	if (!await isHyprlandAvailable()) return;

	const colors = await getProjectColors(projectName);
	if (!colors) return;

	// Poll for new window (up to 3 seconds)
	for (let i = 0; i < 6; i++) {
		await new Promise(r => setTimeout(r, 500));

		const windowsAfter = await getHyprlandWindowAddresses();
		const newWindows = [...windowsAfter].filter(addr => !windowsBefore.has(addr));

		if (newWindows.length > 0) {
			// Apply colors to all new windows (usually just one)
			for (const address of newWindows) {
				const success = await applyBorderColorToWindow(address, colors.activeColor, colors.inactiveColor);
				if (success) {
					console.log(`[work/attach] Applied Hyprland colors to new window ${address}`);
				}
			}
			return;
		}
	}

	console.log('[work/attach] No new Hyprland window detected');
}

export async function POST({ params }) {
	const { sessionId } = params;

	if (!sessionId) {
		return json({ error: 'Session ID required' }, { status: 400 });
	}

	try {
		// Check if the tmux session exists
		const { stdout: sessions } = await execAsync('tmux list-sessions -F "#{session_name}" 2>/dev/null || true');
		const sessionList = sessions.trim().split('\n').filter(Boolean);

		if (!sessionList.includes(sessionId)) {
			return json({ error: `Session '${sessionId}' not found` }, { status: 404 });
		}

		// Extract agent name from session ID (strip jat- prefix)
		const agentName = sessionId.startsWith(SESSION_PREFIX)
			? sessionId.slice(SESSION_PREFIX.length)
			: sessionId;

		// Find project for this agent to determine window title and colors
		const projectName = await findProjectForAgent(agentName);
		const displayName = projectName ? projectName.toUpperCase() : 'JAT';
		const windowTitle = `${displayName}: ${sessionId}`;

		// Try to find which terminal is available
		const { stdout: whichResult } = await execAsync('which alacritty kitty gnome-terminal konsole xterm 2>/dev/null | head -1 || true');
		const terminalPath = whichResult.trim();

		if (!terminalPath) {
			return json({ error: 'No terminal emulator found' }, { status: 500 });
		}

		// Capture window addresses before spawning terminal for color application
		const windowsBefore = await getHyprlandWindowAddresses();

		// Determine which terminal and build the command
		let child;
		if (terminalPath.includes('alacritty')) {
			child = spawn('alacritty', ['-T', windowTitle, '-e', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else if (terminalPath.includes('kitty')) {
			child = spawn('kitty', ['--title', windowTitle, 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else if (terminalPath.includes('gnome-terminal')) {
			child = spawn('gnome-terminal', ['--title', windowTitle, '--', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else if (terminalPath.includes('konsole')) {
			child = spawn('konsole', ['-p', `tabtitle=${windowTitle}`, '-e', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		} else {
			// xterm fallback
			child = spawn('xterm', ['-T', windowTitle, '-e', 'tmux', 'attach-session', '-t', sessionId], {
				detached: true,
				stdio: 'ignore'
			});
		}

		// Unref so the parent doesn't wait for the child
		child.unref();

		// Apply Hyprland colors to the new window (runs in background)
		if (projectName) {
			// Don't await - run in background so we don't block the response
			applyHyprlandColorsToNewWindow(windowsBefore, projectName);
		}

		return json({
			success: true,
			session: sessionId,
			terminal: terminalPath,
			windowTitle,
			project: projectName
		});
	} catch (error) {
		const err = /** @type {Error} */ (error);
		console.error('Failed to attach terminal:', err);
		return json({ error: err.message }, { status: 500 });
	}
}
