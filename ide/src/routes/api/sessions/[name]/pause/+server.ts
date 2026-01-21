/**
 * Session Pause API - Instantly pause a session without agent involvement
 *
 * POST /api/sessions/[name]/pause
 *   Writes paused signal directly to signal files and optionally kills the session.
 *   This bypasses the agent for instant UX.
 *
 * Body:
 *   - taskId: string (required) - The task being paused
 *   - taskTitle?: string - Task title for display
 *   - reason?: string - Why the session was paused
 *   - killSession?: boolean - Whether to kill the tmux session (default: true)
 *
 * Writes to:
 *   - /tmp/jat-signal-tmux-{session}.json - Current signal state
 *   - /tmp/jat-timeline-{session}.jsonl - Timeline history (append)
 */

import { json } from '@sveltejs/kit';
import { writeFileSync, appendFileSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import type { RequestHandler } from './$types';

interface PauseRequest {
	taskId: string;
	taskTitle?: string;
	reason?: string;
	killSession?: boolean;
	agentName?: string;
	sessionId?: string;
	project?: string;
}

interface PausedSignal {
	type: 'paused';
	taskId: string;
	taskTitle?: string;
	agentName?: string;
	reason?: string;
	resumable: boolean;
	sessionId?: string;
	project?: string;
	timestamp: string;
}

export const POST: RequestHandler = async ({ params, request }) => {
	const sessionName = params.name;

	if (!sessionName) {
		return json({ error: 'Missing session name' }, { status: 400 });
	}

	try {
		const body: PauseRequest = await request.json();
		const { taskId, taskTitle, reason, killSession = true, agentName, sessionId, project } = body;

		if (!taskId) {
			return json({ error: 'taskId is required' }, { status: 400 });
		}

		// Normalize session name (ensure jat- prefix)
		const tmuxSession = sessionName.startsWith('jat-') ? sessionName : `jat-${sessionName}`;
		const agentNameFromSession = tmuxSession.replace(/^jat-/, '');

		// Build the paused signal
		const timestamp = new Date().toISOString();
		const pausedSignal: PausedSignal = {
			type: 'paused',
			taskId,
			taskTitle,
			agentName: agentName || agentNameFromSession,
			reason,
			resumable: true,
			sessionId,
			project,
			timestamp
		};

		// 1. Write current signal state to signal file
		const signalFile = `/tmp/jat-signal-tmux-${tmuxSession}.json`;
		writeFileSync(signalFile, JSON.stringify(pausedSignal, null, 2));

		// 2. Append to timeline JSONL
		const timelineFile = `/tmp/jat-timeline-${tmuxSession}.jsonl`;
		const timelineEvent = {
			type: 'signal',
			session_id: sessionId || '',
			tmux_session: tmuxSession,
			timestamp,
			state: 'paused',
			task_id: taskId,
			data: pausedSignal
		};
		appendFileSync(timelineFile, JSON.stringify(timelineEvent) + '\n');

		// 3. Optionally kill the tmux session
		let sessionKilled = false;
		if (killSession) {
			try {
				// Check if session exists first
				execSync(`tmux has-session -t "${tmuxSession}" 2>/dev/null`, { encoding: 'utf-8' });
				// Kill the session
				execSync(`tmux kill-session -t "${tmuxSession}"`, { encoding: 'utf-8' });
				sessionKilled = true;
			} catch {
				// Session might not exist or already be dead - that's okay
				sessionKilled = false;
			}
		}

		return json({
			success: true,
			sessionName: tmuxSession,
			taskId,
			paused: true,
			resumable: true,
			sessionKilled,
			signalFile,
			timelineFile,
			timestamp
		});

	} catch (error) {
		console.error('Error in POST /api/sessions/[name]/pause:', error);
		return json({
			error: 'Failed to pause session',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
};

/**
 * GET /api/sessions/[name]/pause
 * Check if a session is paused (has a paused signal)
 */
export const GET: RequestHandler = async ({ params }) => {
	const sessionName = params.name;

	if (!sessionName) {
		return json({ error: 'Missing session name' }, { status: 400 });
	}

	const tmuxSession = sessionName.startsWith('jat-') ? sessionName : `jat-${sessionName}`;
	const signalFile = `/tmp/jat-signal-tmux-${tmuxSession}.json`;

	if (!existsSync(signalFile)) {
		return json({
			paused: false,
			sessionName: tmuxSession
		});
	}

	try {
		const content = readFileSync(signalFile, 'utf-8');
		const signal = JSON.parse(content);

		return json({
			paused: signal.type === 'paused',
			sessionName: tmuxSession,
			signal: signal.type === 'paused' ? signal : null
		});
	} catch {
		return json({
			paused: false,
			sessionName: tmuxSession,
			error: 'Failed to read signal file'
		});
	}
};
