/**
 * POST /api/projects/setup-integrations
 *
 * Generic integration setup: stores secrets and creates/updates ingest sources
 * based on a jat.config.json integration declaration.
 *
 * Body:
 *   {
 *     projectKey: string,                // e.g. "myapp"
 *     secrets: {                         // Key→value map of secrets to store
 *       "supabase-url": "https://...",
 *       "supabase-service-role-key": "eyJ..."
 *     },
 *     integrations: Array<{              // Integration definitions from jat.config.json
 *       id: string,                      // Integration ID suffix: {projectKey}-{id}
 *       type: string,                    // Ingest adapter type
 *       label?: string,
 *       pollInterval?: number,
 *       taskDefaults?: object,
 *       config: object,                  // Adapter-specific config (supports $key / @key interpolation)
 *       automation?: object
 *     }>
 *   }
 *
 * Config interpolation:
 *   "$key"  → replaced with the VALUE of secret {projectKey}-{key}
 *   "@key"  → replaced with the KEY NAME "{projectKey}-{key}" (for adapters that store secret names)
 *   literal → passed through as-is
 *
 * Response:
 *   { success: true, steps: string[], integrations: string[] }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const CONFIG_DIR = join(homedir(), '.config', 'jat');
const INTEGRATIONS_PATH = join(CONFIG_DIR, 'integrations.json');
const LEGACY_PATH = join(CONFIG_DIR, 'feeds.json');

// ── Config helpers ──────────────────────────────────────────────────────────

function readIntegrations(): { version: number; sources: any[] } {
	if (existsSync(INTEGRATIONS_PATH)) {
		try {
			return JSON.parse(readFileSync(INTEGRATIONS_PATH, 'utf-8'));
		} catch {
			return { version: 1, sources: [] };
		}
	}
	if (existsSync(LEGACY_PATH)) {
		copyFileSync(LEGACY_PATH, INTEGRATIONS_PATH);
		return readIntegrations();
	}
	return { version: 1, sources: [] };
}

function writeIntegrations(config: { version: number; sources: any[] }): void {
	mkdirSync(CONFIG_DIR, { recursive: true });
	writeFileSync(INTEGRATIONS_PATH, JSON.stringify(config, null, 2) + '\n', { mode: 0o644 });
}

/**
 * Upsert a source: replaces existing entry with same id, or appends new one.
 */
function upsertSource(config: { version: number; sources: any[] }, source: any): boolean {
	const idx = config.sources.findIndex((s) => s.id === source.id);
	if (idx >= 0) {
		config.sources[idx] = source;
		return false; // updated
	}
	config.sources.push(source);
	return true; // created
}

/**
 * Store a secret via jat-secret CLI.
 */
async function storeSecret(name: string, value: string, desc?: string): Promise<void> {
	const cmd = desc
		? `jat-secret --set ${JSON.stringify(name)} ${JSON.stringify(value)} --desc ${JSON.stringify(desc)}`
		: `jat-secret --set ${JSON.stringify(name)} ${JSON.stringify(value)}`;
	await execAsync(cmd, { timeout: 10_000 });
}

/**
 * Interpolate config values:
 *   "$key"  → resolvedSecrets["{projectKey}-{key}"]
 *   "@key"  → "{projectKey}-{key}"
 *   other   → pass through unchanged
 */
function interpolateConfig(
	configObj: Record<string, any>,
	projectKey: string,
	resolvedSecrets: Record<string, string>
): Record<string, any> {
	const result: Record<string, any> = {};

	for (const [field, value] of Object.entries(configObj)) {
		if (typeof value === 'string') {
			if (value.startsWith('$')) {
				// Substitute with secret value
				const secretKey = `${projectKey}-${value.slice(1)}`;
				result[field] = resolvedSecrets[secretKey] ?? '';
			} else if (value.startsWith('@')) {
				// Substitute with secret key name
				result[field] = `${projectKey}-${value.slice(1)}`;
			} else {
				result[field] = value;
			}
		} else {
			// Objects and arrays pass through unchanged
			result[field] = value;
		}
	}

	return result;
}

// ── Request handler ─────────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { projectKey, secrets = {}, integrations = [] } = body;

		if (!projectKey || typeof projectKey !== 'string') {
			return json({ success: false, error: 'projectKey is required' }, { status: 400 });
		}

		if (integrations.length === 0) {
			return json({ success: false, error: 'No integrations provided' }, { status: 400 });
		}

		const steps: string[] = [];
		const createdIntegrations: string[] = [];

		// ── Store all secrets first ─────────────────────────────────────
		// Build a resolved map: "{projectKey}-{key}" → value
		const resolvedSecrets: Record<string, string> = {};

		for (const [key, value] of Object.entries(secrets)) {
			if (typeof value !== 'string' || !value.trim()) continue;

			const secretName = `${projectKey}-${key}`;
			resolvedSecrets[secretName] = value;

			try {
				await storeSecret(secretName, value, `${projectKey} ${key}`);
				steps.push(`Stored secret "${secretName}"`);
			} catch (err: any) {
				steps.push(`Warning: failed to store "${secretName}" — ${err?.message || 'unknown error'}`);
			}
		}

		// ── Process each integration ────────────────────────────────────
		const integrationsConfig = readIntegrations();

		for (const integ of integrations) {
			const { id, type, label, pollInterval, taskDefaults, config: integConfig = {}, automation } = integ;

			if (!id || !type) continue;

			const sourceId = `${projectKey}-${id}`;

			// Interpolate adapter-specific config
			const interpolated = interpolateConfig(integConfig, projectKey, resolvedSecrets);

			// Build the source object
			const source: Record<string, any> = {
				id: sourceId,
				type,
				enabled: true,
				project: projectKey,
				...(pollInterval != null && { pollInterval }),
				...(taskDefaults && { taskDefaults }),
				...interpolated, // Flat merge of adapter config fields
				...(automation && { automation }),
			};

			const created = upsertSource(integrationsConfig, source);
			createdIntegrations.push(sourceId);
			steps.push(
				created
					? `Created ${label || type} integration "${sourceId}"`
					: `Updated ${label || type} integration "${sourceId}"`
			);
		}

		if (steps.length === 0) {
			return json({ success: false, error: 'No secrets or integrations were processed' }, { status: 400 });
		}

		// Persist updated integrations config
		writeIntegrations(integrationsConfig);

		return json({ success: true, steps, integrations: createdIntegrations });
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to set up integrations'
			},
			{ status: 500 }
		);
	}
};
