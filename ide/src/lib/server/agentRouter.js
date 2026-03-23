/**
 * Agent Router - Decides whether to spawn locally or on VPS
 *
 * When local agent slots are full, automatically routes new spawns
 * to a configured VPS via SSH. The agent lifecycle stays identical
 * regardless of where the agent runs.
 */

import { execSync } from 'child_process';
import { cpus, totalmem } from 'os';

/**
 * Auto-detect reasonable max local agents from hardware.
 * Uses CPU cores / 2 (each agent is ~1-2 cores of load), clamped to [2, 8].
 * @returns {number}
 */
export function detectMaxLocalAgents() {
	const cores = cpus().length;
	const ramGB = totalmem() / (1024 ** 3);

	// Each agent needs ~2GB RAM and ~2 CPU cores
	const byCore = Math.floor(cores / 2);
	const byRam = Math.floor(ramGB / 2);

	return Math.max(2, Math.min(8, Math.min(byCore, byRam)));
}

/**
 * Count currently running local JAT agent tmux sessions.
 * Only counts sessions matching the jat-{AgentName} pattern.
 * @returns {number}
 */
export function countLocalAgents() {
	try {
		const output = execSync(
			'tmux list-sessions -F "#{session_name}" 2>/dev/null || true',
			{ encoding: 'utf-8', timeout: 5000 }
		).trim();

		if (!output) return 0;

		return output
			.split('\n')
			.filter(name => name.startsWith('jat-') && !name.startsWith('jat-app-') && !name.startsWith('jat-integrations'))
			.length;
	} catch {
		return 0;
	}
}

/**
 * Count currently running remote agents on the VPS.
 * @param {{ host: string, user: string }} vps
 * @returns {Promise<number>}
 */
export async function countRemoteAgents(vps) {
	try {
		const { promisify } = await import('util');
		const { exec } = await import('child_process');
		const execAsync = promisify(exec);

		const { stdout } = await execAsync(
			`ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new ${vps.user}@${vps.host} 'tmux list-sessions -F "#{session_name}" 2>/dev/null || true'`,
			{ timeout: 10000 }
		);

		if (!stdout.trim()) return 0;

		return stdout.trim()
			.split('\n')
			.filter(name => name.startsWith('jat-') && !name.startsWith('jat-app-'))
			.length;
	} catch {
		return 0;
	}
}

/**
 * Test SSH connectivity to VPS.
 * @param {{ host: string, user: string }} vps
 * @returns {Promise<{ ok: boolean, error?: string, latencyMs?: number }>}
 */
export async function testVpsConnection(vps) {
	if (!vps.host || !vps.user) {
		return { ok: false, error: 'VPS host and user must be configured' };
	}

	try {
		const { promisify } = await import('util');
		const { exec } = await import('child_process');
		const execAsync = promisify(exec);

		const start = Date.now();
		await execAsync(
			`ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new ${vps.user}@${vps.host} 'echo ok'`,
			{ timeout: 10000 }
		);
		const latencyMs = Date.now() - start;

		return { ok: true, latencyMs };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}

/**
 * Decide whether to spawn locally or on VPS.
 *
 * @param {object} opts
 * @param {object} opts.defaults - JAT defaults from config
 * @param {boolean} [opts.forceLocal] - Override: always spawn locally
 * @param {boolean} [opts.forceRemote] - Override: always spawn on VPS
 * @returns {Promise<{ target: 'local' | 'remote', reason: string, localCount: number, maxLocal: number, remoteCount?: number }>}
 */
export async function routeAgent(opts) {
	const { defaults, forceLocal, forceRemote } = opts;

	const maxLocal = defaults.max_local_agents > 0
		? defaults.max_local_agents
		: detectMaxLocalAgents();

	const localCount = countLocalAgents();

	const vps = {
		host: defaults.vps_host || '',
		user: defaults.vps_user || '',
		maxAgents: defaults.vps_max_agents || 8
	};

	// Force flags take priority
	if (forceLocal) {
		return {
			target: 'local',
			reason: 'force_local',
			localCount,
			maxLocal
		};
	}

	if (forceRemote) {
		if (!vps.host || !vps.user) {
			return {
				target: 'local',
				reason: 'force_remote_no_vps_config',
				localCount,
				maxLocal
			};
		}
		const remoteCount = await countRemoteAgents(vps);
		return {
			target: 'remote',
			reason: 'force_remote',
			localCount,
			maxLocal,
			remoteCount
		};
	}

	// Auto-routing: local if slots available
	if (localCount < maxLocal) {
		return {
			target: 'local',
			reason: 'local_slots_available',
			localCount,
			maxLocal
		};
	}

	// Local is full - try VPS overflow
	if (!vps.host || !vps.user) {
		// No VPS configured, spawn locally anyway (over limit)
		return {
			target: 'local',
			reason: 'local_full_no_vps',
			localCount,
			maxLocal
		};
	}

	// Check VPS capacity
	const remoteCount = await countRemoteAgents(vps);
	if (remoteCount >= vps.maxAgents) {
		// VPS also full, spawn locally (over limit)
		return {
			target: 'local',
			reason: 'both_full',
			localCount,
			maxLocal,
			remoteCount
		};
	}

	return {
		target: 'remote',
		reason: 'local_full_vps_available',
		localCount,
		maxLocal,
		remoteCount
	};
}
