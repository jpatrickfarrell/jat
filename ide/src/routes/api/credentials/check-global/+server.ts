/**
 * POST /api/credentials/check-global
 *
 * Checks whether one or more unprefixed (global) secret names already exist
 * in the user's jat-secret store. Used by the Create Project wizard to offer
 * "Reuse existing" for account-level secrets like cloudflare-api-token.
 *
 * Body:
 *   { keys: string[] }   // e.g. ["cloudflare-api-token", "openai-api-key"]
 *
 * Response:
 *   { success: true, exists: Record<string, boolean> }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function secretExists(name: string): Promise<boolean> {
	try {
		const { stdout } = await execAsync(`jat-secret ${JSON.stringify(name)}`, { timeout: 5_000 });
		return stdout.trim().length > 0;
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const keys = Array.isArray(body?.keys) ? body.keys.filter((k: unknown): k is string => typeof k === 'string') : [];

		if (keys.length === 0) {
			return json({ success: true, exists: {} });
		}

		const results = await Promise.all(
			keys.map(async (key: string) => [key, await secretExists(key)] as const)
		);

		const exists: Record<string, boolean> = {};
		for (const [key, found] of results) exists[key] = found;

		return json({ success: true, exists });
	} catch (error) {
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to check secrets' },
			{ status: 500 }
		);
	}
};
