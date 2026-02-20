/**
 * Browser Sessions API
 * GET /api/browser-sessions - Read browser session registry and return enriched data
 */

import { json } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const REGISTRY_PATH = '/tmp/jat-browser-sessions.json';

interface BrowserSession {
	port: number;
	pid: number | null;
	agentName: string;
	taskId: string;
	project: string;
	claimedAt: string;
	alive: boolean;
	portListening: boolean;
}

function isPidAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function isPortListening(port: number): boolean {
	try {
		const result = execSync(`ss -tlnp 2>/dev/null | grep -q ':${port} '`, {
			encoding: 'utf-8',
			timeout: 2000
		});
		return true;
	} catch {
		return false;
	}
}

export async function GET() {
	try {
		if (!existsSync(REGISTRY_PATH)) {
			return json({ sessions: {}, timestamp: new Date().toISOString() });
		}

		const raw = readFileSync(REGISTRY_PATH, 'utf-8');
		const registry = JSON.parse(raw);
		const sessions: Record<string, BrowserSession> = {};

		for (const [port, entry] of Object.entries(registry.sessions || {})) {
			const e = entry as any;
			const pid = e.pid ?? null;
			const alive = pid ? isPidAlive(pid) : false;
			const portListening = isPortListening(parseInt(port));

			sessions[port] = {
				port: e.port,
				pid,
				agentName: e.agentName,
				taskId: e.taskId,
				project: e.project,
				claimedAt: e.claimedAt,
				alive,
				portListening
			};
		}

		return json({
			sessions,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		return json({
			sessions: {},
			error: (err as Error).message,
			timestamp: new Date().toISOString()
		});
	}
}
