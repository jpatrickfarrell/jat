/**
 * Server Sessions Store
 * Manages state for dev server tmux sessions using Svelte 5 runes.
 *
 * Server sessions are tmux sessions running dev servers (npm run dev, etc.)
 * This store tracks their output, status, and provides control actions.
 *
 * Interface:
 * - sessions: ServerSession[] - Array of active server sessions
 * - isLoading: boolean - Loading state
 * - error: string | null - Error message
 * - fetch(lines) - Fetch all active server sessions
 * - start(projectName) - Start dev server for project
 * - stop(sessionName) - Stop a server session
 * - restart(sessionName) - Restart a server session
 * - sendInput(sessionName, input, type) - Send input to session
 * - startPolling(intervalMs) - Start auto-refresh
 * - stopPolling() - Stop auto-refresh
 */

import type { ServerState } from '$lib/config/statusColors';

/**
 * ServerSession represents an active dev server tmux session
 */
export interface ServerSession {
	/** Mode identifier - always 'server' for server sessions */
	mode: 'server';
	/** Tmux session name (e.g., 'chimaro-dev', 'jat-dev') */
	sessionName: string;
	/** Project name (e.g., 'chimaro', 'jat') */
	projectName: string;
	/** Display name shown in UI (e.g., 'Chimaro Dev Server') */
	displayName: string;
	/** Port the server is running on (e.g., 5173) */
	port: number | null;
	/** Whether the port is actively listening */
	portRunning: boolean;
	/** Server status: 'running' | 'starting' | 'stopped' */
	status: ServerState;
	/** Recent terminal output */
	output: string;
	/** Total line count from session */
	lineCount: number;
	/** Session creation timestamp */
	created: string;
	/** Whether a terminal is attached to this session */
	attached: boolean;
	/** Project directory path */
	projectPath?: string;
	/** Server command being run (e.g., 'npm run dev') */
	command?: string;
}

interface ServerSessionsState {
	sessions: ServerSession[];
	isLoading: boolean;
	error: string | null;
	lastFetch: Date | null;
}

// Reactive state using Svelte 5 runes
let state = $state<ServerSessionsState>({
	sessions: [],
	isLoading: false,
	error: null,
	lastFetch: null
});

// Polling interval reference
let pollingInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Fetch all active server sessions from the API
 * @param lines - Number of output lines to capture (default: 50)
 */
export async function fetch(lines: number = 50): Promise<void> {
	state.isLoading = true;
	state.error = null;

	try {
		const response = await globalThis.fetch(`/api/servers?lines=${lines}`);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || data.error || 'Failed to fetch server sessions');
		}

		state.sessions = data.sessions || [];
		state.lastFetch = new Date();
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'Failed to fetch server sessions';
		console.error('serverSessions.fetch error:', err);
	} finally {
		state.isLoading = false;
	}
}

/**
 * Start a dev server for a project
 * @param projectName - Name of the project to start server for
 * @param command - Optional command to run (default: 'npm run dev')
 */
export async function start(projectName: string, command?: string): Promise<ServerSession | null> {
	try {
		const response = await globalThis.fetch('/api/servers/start', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ projectName, command })
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || data.error || 'Failed to start server');
		}

		// Add the new session to state
		if (data.session) {
			state.sessions = [...state.sessions, data.session];
		}

		return data.session || null;
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'Failed to start server';
		console.error('serverSessions.start error:', err);
		return null;
	}
}

/**
 * Stop a server session
 * @param sessionName - Name of the tmux session to stop
 */
export async function stop(sessionName: string): Promise<boolean> {
	try {
		const response = await globalThis.fetch(`/api/servers/${sessionName}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || data.error || 'Failed to stop server');
		}

		// Remove from state
		state.sessions = state.sessions.filter((s) => s.sessionName !== sessionName);
		return true;
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'Failed to stop server';
		console.error('serverSessions.stop error:', err);
		return false;
	}
}

/**
 * Restart a server session
 * @param sessionName - Name of the tmux session to restart
 */
export async function restart(sessionName: string): Promise<boolean> {
	try {
		const response = await globalThis.fetch(`/api/servers/${sessionName}/restart`, {
			method: 'POST'
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || data.error || 'Failed to restart server');
		}

		// Refresh to get updated state
		await fetch();
		return true;
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'Failed to restart server';
		console.error('serverSessions.restart error:', err);
		return false;
	}
}

/**
 * Send input to a server session
 * @param sessionName - Name of the tmux session
 * @param input - Input text to send
 * @param type - Input type: 'text' (default), 'enter', 'ctrl-c', 'ctrl-d', 'raw'
 */
export async function sendInput(
	sessionName: string,
	input: string,
	type: 'text' | 'enter' | 'ctrl-c' | 'ctrl-d' | 'raw' = 'text'
): Promise<boolean> {
	try {
		const response = await globalThis.fetch(`/api/sessions/${sessionName}/input`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ input, type })
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || data.error || 'Failed to send input');
		}

		return true;
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'Failed to send input';
		console.error('serverSessions.sendInput error:', err);
		return false;
	}
}

/**
 * Send Ctrl+C to interrupt/stop a server
 */
export async function interrupt(sessionName: string): Promise<boolean> {
	return sendInput(sessionName, '', 'ctrl-c');
}

/**
 * Start polling for session updates
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 */
export function startPolling(intervalMs: number = 2000): void {
	stopPolling(); // Clear any existing interval

	// Initial fetch
	fetch();

	// Set up polling - servers don't need as frequent updates as work sessions
	pollingInterval = setInterval(() => {
		fetch();
	}, intervalMs);
}

/**
 * Stop polling
 */
export function stopPolling(): void {
	if (pollingInterval) {
		clearInterval(pollingInterval);
		pollingInterval = null;
	}
}

/**
 * Clear error state
 */
export function clearError(): void {
	state.error = null;
}

/**
 * Get a specific session by name
 */
export function getSession(sessionName: string): ServerSession | undefined {
	return state.sessions.find((s) => s.sessionName === sessionName);
}

/**
 * Get session by project name
 */
export function getSessionByProject(projectName: string): ServerSession | undefined {
	return state.sessions.find((s) => s.projectName === projectName);
}

// Export reactive getters
export function getSessions(): ServerSession[] {
	return state.sessions;
}

export function getIsLoading(): boolean {
	return state.isLoading;
}

export function getError(): string | null {
	return state.error;
}

export function getLastFetch(): Date | null {
	return state.lastFetch;
}

// Export state for direct reactive access in components
export { state as serverSessionsState };
