/**
 * Remote Work Sessions API
 * GET /api/work/remote - List remote agent sessions on VPS
 *
 * Returns remote sessions with signal data, designed to be polled
 * at a lower frequency than the main /api/work endpoint (e.g., every 10s).
 *
 * Response includes:
 * - sessions: Array of remote session objects with signal state
 * - vpsHost: The VPS hostname for display
 * - count: Number of remote sessions
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getVpsConfig } from '$lib/server/sessions.js';
import { apiCache, CACHE_TTL } from '$lib/server/cache.js';

const execAsync = promisify(exec);
const REMOTE_CACHE_KEY = 'work:remote-sessions';

/**
 * @typedef {{
 *   sessionName: string,
 *   agentName: string,
 *   created: string | null,
 *   attached: boolean,
 *   location: 'remote',
 *   sessionState: string | null,
 *   task: { id: string, title: string | null, status: string } | null,
 *   project: string | null,
 *   model: string | null,
 *   approach: string | null
 * }} RemoteSession
 */

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const vps = getVpsConfig();
	if (!vps) {
		return json({
			success: true,
			sessions: [],
			count: 0,
			vpsHost: null,
			message: 'No VPS configured'
		});
	}

	// Cache remote sessions for 5 seconds (SSH is expensive)
	const cached = apiCache.get(REMOTE_CACHE_KEY);
	if (cached) {
		return json(cached);
	}

	try {
		// Single SSH call: list sessions + read all signal files
		const { stdout } = await execAsync(
			`ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new ${vps.user}@${vps.host} '
				echo "---SESSIONS---"
				tmux list-sessions -F "#{session_name}:#{session_created}:#{session_attached}" 2>/dev/null | grep "^jat-" || true
				echo "---SIGNALS---"
				for f in /tmp/jat-signal-tmux-jat-*.json; do
					[ -f "$f" ] || continue
					agent=$(basename "$f" | sed "s/^jat-signal-tmux-jat-//;s/\\.json$//")
					echo "AGENT:${agent}"
					cat "$f"
					echo ""
				done
			'`,
			{ timeout: 15000 }
		);

		// Parse sessions
		/** @type {RemoteSession[]} */
		const sessions = [];
		/** @type {Map<string, any>} */
		const signalMap = new Map();

		let inSessions = false;
		let inSignals = false;
		let currentAgent = '';
		let signalJson = '';

		for (const line of stdout.split('\n')) {
			if (line === '---SESSIONS---') {
				inSessions = true;
				inSignals = false;
				continue;
			}
			if (line === '---SIGNALS---') {
				inSessions = false;
				inSignals = true;
				continue;
			}

			if (inSessions && line.trim()) {
				const parts = line.split(':');
				const name = parts[0];
				const created = parts[1];
				const attached = parts[2];
				if (name && name.startsWith('jat-') && !name.startsWith('jat-app-') && !name.startsWith('jat-pending-')) {
					const agentName = name.replace(/^jat-/, '');
					if (/^[A-Z]/.test(agentName)) {
						sessions.push({
							sessionName: name,
							agentName,
							created: created ? new Date(parseInt(created, 10) * 1000).toISOString() : null,
							attached: attached === '1',
							location: 'remote',
							sessionState: null,
							task: null,
							project: null,
							model: null,
							approach: null
						});
					}
				}
			}

			if (inSignals) {
				if (line.startsWith('AGENT:')) {
					// Save previous agent's signal
					if (currentAgent && signalJson) {
						try {
							signalMap.set(currentAgent, JSON.parse(signalJson));
						} catch { /* ignore parse errors */ }
					}
					currentAgent = line.replace('AGENT:', '');
					signalJson = '';
				} else if (currentAgent) {
					signalJson += line;
				}
			}
		}
		// Save last agent's signal
		if (currentAgent && signalJson) {
			try {
				signalMap.set(currentAgent, JSON.parse(signalJson));
			} catch { /* ignore */ }
		}

		// Merge signal data into sessions
		for (const session of sessions) {
			const signal = signalMap.get(session.agentName);
			if (signal) {
				const data = signal.data || {};
				session.sessionState = signal.state || null;
				session.task = data.taskId ? {
					id: data.taskId,
					title: data.taskTitle || null,
					status: 'in_progress'
				} : null;
				session.project = data.project || (data.taskId ? data.taskId.split('-')[0] : null);
				session.model = data.model || null;
				session.approach = data.approach || null;
			}
		}

		const result = {
			success: true,
			sessions,
			count: sessions.length,
			vpsHost: vps.host,
			timestamp: new Date().toISOString()
		};

		// Cache for 5 seconds
		apiCache.set(REMOTE_CACHE_KEY, result, 5000);

		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({
			success: false,
			sessions: [],
			count: 0,
			vpsHost: vps.host,
			error: message,
			timestamp: new Date().toISOString()
		});
	}
}
