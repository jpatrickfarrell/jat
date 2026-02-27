/**
 * Kill all orphaned processes.
 * DELETE /api/servers/orphans
 *
 * Fetches current orphan list from the servers API data,
 * then validates and kills each one.
 */

import { json } from '@sveltejs/kit';
import { readlinkSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';

/**
 * Validate and kill a single orphan process.
 * Returns true if SIGTERM was sent successfully.
 * @param {number} pid
 * @returns {boolean}
 */
function tryKill(pid) {
	if (pid === process.pid) return false;

	try { statSync(`/proc/${pid}`); } catch { return false; }

	try {
		const stat = statSync(`/proc/${pid}`);
		if (stat.uid !== process.getuid()) return false;
	} catch { return false; }

	const HOME = homedir();
	let cwd;
	try { cwd = readlinkSync(`/proc/${pid}/cwd`); } catch { return false; }

	// Must be under user's home directory
	if (!cwd.startsWith(HOME + '/') && cwd !== HOME) return false;

	let processName;
	try { processName = readFileSync(`/proc/${pid}/comm`, 'utf-8').trim(); } catch { return false; }
	if (!processName.startsWith('node') && !processName.startsWith('workerd')) return false;

	try {
		process.kill(pid, 'SIGTERM');
	} catch { return false; }

	// Schedule SIGKILL fallback
	setTimeout(() => {
		try {
			statSync(`/proc/${pid}`);
			try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ }
		} catch { /* gone */ }
	}, 2000);

	return true;
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ fetch: svelteFetch }) {
	try {
		// Get current orphan list from the servers API
		const response = await svelteFetch('/api/servers?lines=1');
		const data = await response.json();
		const orphans = data.orphans || [];

		if (orphans.length === 0) {
			return json({ success: true, killed: 0, message: 'No orphans to kill' });
		}

		let killed = 0;
		const results = [];

		for (const orphan of orphans) {
			const success = tryKill(orphan.pid);
			if (success) killed++;
			results.push({ pid: orphan.pid, success });
		}

		return json({
			success: true,
			killed,
			total: orphans.length,
			results,
			message: `Killed ${killed} of ${orphans.length} orphaned processes`
		});
	} catch (err) {
		return json(
			{ error: 'Failed to kill orphans', message: err instanceof Error ? err.message : String(err) },
			{ status: 500 }
		);
	}
}
