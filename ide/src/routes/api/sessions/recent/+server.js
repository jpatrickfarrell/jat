/**
 * Recent Closed Sessions API
 * GET /api/sessions/recent - Returns recently closed sessions from signal files
 *
 * Query params:
 *   ?offset=0  - Number of sessions to skip (default: 0)
 *   ?limit=20  - Number of sessions to return (default: 20)
 *
 * Primary source: /tmp/jat-signal-tmux-jat-*.json (ephemeral, lost on reboot)
 * Fallback source: .jat/signals/*.jsonl across all projects (persistent)
 *
 * The fallback ensures session history survives crashes and reboots.
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { singleFlight, cacheKey } from '$lib/server/cache.js';
import { getAllProjects } from '$lib/utils/projectConfig.js';
import { getTaskById } from '$lib/server/jat-tasks.js';
import { lookupIntegrations } from '$lib/server/integrationLookup.js';

const execAsync = promisify(exec);

const SIGNAL_PREFIX = 'jat-signal-tmux-jat-';
const SIGNAL_SUFFIX = '.json';

/**
 * Look up taskTitle from a persistent .jat/signals/{taskId}.jsonl file
 * by scanning backwards for the most recent line that has it.
 * @param {string} taskId - Task ID (e.g., "flush-k9iv7")
 * @returns {string|null} Task title or null
 */
function lookupTaskTitleFromPersistent(taskId) {
	if (!taskId) return null;
	const project = taskId.includes('-') ? taskId.split('-')[0] : null;
	if (!project) return null;

	const homeDir = process.env.HOME || '/home/jw';
	const signalFile = join(homeDir, 'code', project, '.jat', 'signals', `${taskId}.jsonl`);

	try {
		if (!existsSync(signalFile)) return null;
		const content = readFileSync(signalFile, 'utf-8');
		const lines = content.trim().split('\n').filter(l => l.trim());
		// Scan backwards for taskTitle
		for (let i = lines.length - 1; i >= 0; i--) {
			try {
				const entry = JSON.parse(lines[i]);
				if (entry.data?.taskTitle) return entry.data.taskTitle;
			} catch { /* skip */ }
		}
	} catch { /* file not readable */ }
	return null;
}

/**
 * Parse a /tmp signal file and extract normalized session info
 * @param {string} filePath - Full path to signal file
 * @param {string} sessionName - tmux session name (e.g., "jat-AgentName")
 * @returns {object|null} Parsed session info or null if unparseable
 */
function parseSignalFile(filePath, sessionName) {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const signal = JSON.parse(content);
		const mtime = statSync(filePath).mtime;

		const agentName = signal.agentName
			|| signal.data?.agentName
			|| sessionName.replace(/^jat-/, '');

		const taskId = signal.taskId || signal.task_id
			|| signal.data?.taskId
			|| null;

		let taskTitle = signal.taskTitle
			|| signal.data?.taskTitle
			|| null;

		// If /tmp signal doesn't have title, look it up from persistent signals
		if (!taskTitle && taskId) {
			taskTitle = lookupTaskTitleFromPersistent(taskId);
		}

		const project = signal.project
			|| signal.data?.project
			|| (taskId && taskId.includes('-') ? taskId.split('-')[0] : null);

		const sessionId = signal.session_id || null;

		let lastState = signal.type;
		if (signal.type === 'state' && signal.state) {
			lastState = signal.state;
		}

		return {
			sessionName,
			agentName,
			taskId,
			taskTitle,
			project,
			sessionId,
			lastState,
			timestamp: mtime.toISOString(),
			mtime: mtime.getTime()
		};
	} catch {
		return null;
	}
}

/**
 * Parse a persistent .jat/signals/{taskId}.jsonl file to reconstruct session info.
 * Uses the last line for current state, but scans backwards to find taskTitle
 * since completion signals often omit it.
 * @param {string} filePath - Full path to the JSONL signal file
 * @returns {object|null} Parsed session info or null
 */
function parsePersistentSignalFile(filePath) {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const lines = content.trim().split('\n').filter(l => l.trim());
		if (lines.length === 0) return null;

		const lastSignal = JSON.parse(lines[lines.length - 1]);
		const mtime = statSync(filePath).mtime;

		const agentName = lastSignal.agent_name || null;
		if (!agentName) return null;

		const sessionName = lastSignal.tmux_session || `jat-${agentName}`;
		const taskId = lastSignal.task_id || null;
		const sessionId = lastSignal.session_id || null;

		let taskTitle = lastSignal.data?.taskTitle || null;
		if (!taskTitle) {
			for (let i = lines.length - 2; i >= 0; i--) {
				try {
					const prev = JSON.parse(lines[i]);
					if (prev.data?.taskTitle) {
						taskTitle = prev.data.taskTitle;
						break;
					}
				} catch { /* skip malformed lines */ }
			}
		}

		const project = taskId && taskId.includes('-') ? taskId.split('-')[0] : null;

		let lastState = lastSignal.type;
		if (lastSignal.type === 'state' && lastSignal.state) {
			lastState = lastSignal.state;
		}

		return {
			sessionName,
			agentName,
			taskId,
			taskTitle,
			project,
			sessionId,
			lastState,
			timestamp: lastSignal.timestamp || mtime.toISOString(),
			mtime: mtime.getTime()
		};
	} catch {
		return null;
	}
}

/**
 * Get all project paths from config + ~/code/ scan
 * @returns {Set<string>}
 */
function getProjectPaths() {
	const homeDir = process.env.HOME || '/home/jw';
	const projectPaths = new Set();

	try {
		const projects = getAllProjects();
		for (const [, config] of projects) {
			if (config.path) {
				projectPaths.add(config.path.replace(/^~/, homeDir));
			}
		}
	} catch { /* Config not available */ }

	try {
		const codeDir = join(homeDir, 'code');
		const entries = readdirSync(codeDir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isDirectory()) {
				projectPaths.add(join(codeDir, entry.name));
			}
		}
	} catch { /* Can't read ~/code */ }

	return projectPaths;
}

/**
 * Build full sorted list of all closed sessions from both /tmp and persistent signals.
 * Cached for 10 seconds to avoid repeated filesystem scans on rapid pagination.
 * @param {Set<string>} activeSessions - Currently active tmux session names
 * @returns {Array} Sorted array of session objects (newest first)
 */
function buildFullSessionList(activeSessions) {
	const allSessions = [];
	const seenAgents = new Set();

	// Phase 1: /tmp signal files (ephemeral, most accurate for recent sessions)
	try {
		const signalFiles = readdirSync('/tmp')
			.filter(f => f.startsWith(SIGNAL_PREFIX) && f.endsWith(SIGNAL_SUFFIX));

		for (const filename of signalFiles) {
			const sessionName = filename
				.slice('jat-signal-tmux-'.length, -SIGNAL_SUFFIX.length);

			if (activeSessions.has(sessionName)) continue;

			const parsed = parseSignalFile(`/tmp/${filename}`, sessionName);
			if (parsed) {
				allSessions.push(parsed);
				seenAgents.add(parsed.agentName);
			}
		}
	} catch { /* /tmp not readable */ }

	// Phase 2: Persistent .jat/signals/ files (survive crashes/reboots)
	const projectPaths = getProjectPaths();

	for (const projectPath of projectPaths) {
		const signalsDir = join(projectPath, '.jat', 'signals');
		if (!existsSync(signalsDir)) continue;

		let files;
		try {
			files = readdirSync(signalsDir).filter(f => f.endsWith('.jsonl'));
		} catch {
			continue;
		}

		for (const file of files) {
			const filePath = join(signalsDir, file);
			const parsed = parsePersistentSignalFile(filePath);
			if (!parsed) continue;
			if (activeSessions.has(parsed.sessionName)) continue;
			if (seenAgents.has(parsed.agentName)) continue;

			allSessions.push(parsed);
			seenAgents.add(parsed.agentName);
		}
	}

	// Sort by time descending (newest first)
	allSessions.sort((a, b) => b.mtime - a.mtime);
	return allSessions;
}

/**
 * Get set of active tmux session names
 * @returns {Promise<Set<string>>}
 */
async function getActiveSessions() {
	try {
		const { stdout } = await execAsync('tmux list-sessions -F "#{session_name}" 2>/dev/null');
		return new Set(stdout.trim().split('\n').filter(Boolean));
	} catch {
		return new Set();
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
		const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));

		const key = cacheKey('sessions-recent-full');

		// Cache the full sorted list for 10s, then slice for pagination
		const allSessions = await singleFlight(key, async () => {
			const activeSessions = await getActiveSessions();
			return buildFullSessionList(activeSessions);
		}, 10000);

		const page = allSessions.slice(offset, offset + limit);
		const sessions = page.map(({ mtime, ...rest }) => rest);
		const hasMore = offset + limit < allSessions.length;

		// Enrich sessions with actual task data from database
		for (const session of sessions) {
			if (session.taskId) {
				try {
					const task = getTaskById(session.taskId);
					if (task) {
						session.taskStatus = task.status;
						session.taskCreatedAt = task.created_at;
						session.taskClosedAt = task.closed_at;
						session.taskUpdatedAt = task.updated_at;
						session.taskPriority = task.priority;
						session.taskType = task.issue_type;
					}
				} catch { /* DB not available, skip */ }
			}
		}

		// Enrich sessions with integration source info
		const taskIdsWithSessions = sessions.filter(s => s.taskId).map(s => s.taskId);
		if (taskIdsWithSessions.length > 0) {
			const integrations = lookupIntegrations(taskIdsWithSessions);
			for (const session of sessions) {
				if (session.taskId && integrations[session.taskId]) {
					session.integration = integrations[session.taskId];
				}
			}
		}

		return json({
			sessions,
			count: sessions.length,
			total: allSessions.length,
			offset,
			limit,
			hasMore,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in GET /api/sessions/recent:', error);
		return json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
