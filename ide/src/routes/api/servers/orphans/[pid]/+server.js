/**
 * Kill a single orphaned process by PID.
 * DELETE /api/servers/orphans/{pid}
 *
 * Safety validations:
 * - PID is numeric
 * - Process exists (/proc/{pid})
 * - Process owned by current user
 * - Process cwd is under ~/code/
 * - Process name is node or workerd
 * - PID is not the IDE server process
 */

import { json } from '@sveltejs/kit';
import { readlinkSync, readFileSync, statSync } from 'fs';

/**
 * Validate and kill a single orphan process.
 * @param {number} pid
 * @returns {{ success: boolean, error?: string }}
 */
function validateAndKill(pid) {
	const HOME = process.env.HOME || '';

	// Must not be our own process
	if (pid === process.pid) {
		return { success: false, error: 'Cannot kill IDE server process' };
	}

	// Check process exists
	try {
		statSync(`/proc/${pid}`);
	} catch {
		return { success: false, error: 'Process does not exist' };
	}

	// Check ownership - process must be owned by current user
	try {
		const stat = statSync(`/proc/${pid}`);
		if (stat.uid !== process.getuid()) {
			return { success: false, error: 'Process not owned by current user' };
		}
	} catch {
		return { success: false, error: 'Cannot verify process ownership' };
	}

	// Check cwd is under ~/code/
	let cwd;
	try {
		cwd = readlinkSync(`/proc/${pid}/cwd`);
	} catch {
		return { success: false, error: 'Cannot read process cwd' };
	}

	if (!cwd.startsWith(`${HOME}/code/`)) {
		return { success: false, error: 'Process cwd is not under ~/code/' };
	}

	// Check process name contains node or workerd
	let processName;
	try {
		const comm = readFileSync(`/proc/${pid}/comm`, 'utf-8').trim();
		processName = comm;
	} catch {
		return { success: false, error: 'Cannot read process name' };
	}

	if (!processName.startsWith('node') && !processName.startsWith('workerd')) {
		return { success: false, error: `Process is ${processName}, not node/workerd` };
	}

	// Kill with SIGTERM
	try {
		process.kill(pid, 'SIGTERM');
	} catch (err) {
		return { success: false, error: `Failed to send SIGTERM: ${err.message}` };
	}

	// Check after brief delay if still alive, then SIGKILL
	setTimeout(() => {
		try {
			// Check if process still exists
			statSync(`/proc/${pid}`);
			// Still alive, force kill
			try {
				process.kill(pid, 'SIGKILL');
			} catch { /* already dead */ }
		} catch {
			// Process already gone, good
		}
	}, 2000);

	return { success: true };
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	const pid = parseInt(params.pid, 10);

	if (isNaN(pid) || pid <= 0) {
		return json({ error: 'Invalid PID' }, { status: 400 });
	}

	const result = validateAndKill(pid);

	if (!result.success) {
		return json({ error: result.error }, { status: 400 });
	}

	return json({ success: true, pid, message: `Sent SIGTERM to process ${pid}` });
}
