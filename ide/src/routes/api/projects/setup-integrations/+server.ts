/**
 * POST /api/projects/setup-integrations
 *
 * Generic integration setup: stores secrets and creates/updates ingest sources
 * based on a jat.config.json integration declaration.
 *
 * Body:
 *   {
 *     projectKey: string,                // e.g. "myapp"
 *     secrets: {                         // Project-scoped key→value map
 *       "supabase-url": "https://...",   //   stored as "{projectKey}-{key}"
 *       "supabase-service-role-key": "eyJ..."
 *     },
 *     globalSecrets?: {                  // Global (unprefixed) key→value map
 *       "cloudflare-api-token": "...",   //   stored as "{key}" (shared across projects)
 *       "openai-api-key": "sk-..."
 *     },
 *     globalKeyNames?: string[],         // Every global-scoped key in play, even if
 *                                        //   no value was sent (e.g. reuse-existing).
 *                                        //   Used by interpolator to skip project prefix.
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
 *   "$key"  → secret VALUE. If `key` is in globalKeyNames, looks up unprefixed
 *             "{key}"; otherwise looks up "{projectKey}-{key}".
 *   "@key"  → secret KEY NAME. If `key` is in globalKeyNames, returns "{key}";
 *             otherwise returns "{projectKey}-{key}".
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
 * Interpolate config values. Secret-name resolution depends on whether the
 * referenced key is in `globalKeys` (unprefixed, account-level) or not
 * (project-scoped, prefixed with `{projectKey}-`).
 *
 *   "$key"  → resolvedSecrets[isGlobal ? "{key}" : "{projectKey}-{key}"]
 *   "@key"  → isGlobal ? "{key}" : "{projectKey}-{key}"
 *   other   → pass through unchanged
 */
function interpolateConfig(
	configObj: Record<string, any>,
	projectKey: string,
	resolvedSecrets: Record<string, string>,
	globalKeys: Set<string>
): Record<string, any> {
	const result: Record<string, any> = {};

	const nameFor = (shortKey: string) =>
		globalKeys.has(shortKey) ? shortKey : `${projectKey}-${shortKey}`;

	for (const [field, value] of Object.entries(configObj)) {
		if (typeof value === 'string') {
			if (value.startsWith('$')) {
				const shortKey = value.slice(1);
				result[field] = resolvedSecrets[nameFor(shortKey)] ?? '';
			} else if (value.startsWith('@')) {
				const shortKey = value.slice(1);
				result[field] = nameFor(shortKey);
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
		const {
			projectKey,
			secrets = {},
			globalSecrets = {},
			globalKeyNames = [],
			integrations = []
		} = body;

		if (!projectKey || typeof projectKey !== 'string') {
			return json({ success: false, error: 'projectKey is required' }, { status: 400 });
		}

		if (integrations.length === 0) {
			return json({ success: false, error: 'No integrations provided' }, { status: 400 });
		}

		const steps: string[] = [];
		const createdIntegrations: string[] = [];

		// ── Store all secrets first ─────────────────────────────────────
		// Resolved map contains BOTH project-prefixed and unprefixed global
		// entries — keyed by the name `interpolateConfig` will look up.
		const resolvedSecrets: Record<string, string> = {};

		// Project-scoped secrets: stored as "{projectKey}-{key}"
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

		// Global secrets: stored unprefixed (shared across projects).
		// Only entries the user actually provided/overrode arrive here — reuse
		// cases are handled by `globalKeyNames` below.
		for (const [key, value] of Object.entries(globalSecrets)) {
			if (typeof value !== 'string' || !value.trim()) continue;

			resolvedSecrets[key] = value;

			try {
				await storeSecret(key, value, `global ${key}`);
				steps.push(`Stored global secret "${key}"`);
			} catch (err: any) {
				steps.push(`Warning: failed to store global "${key}" — ${err?.message || 'unknown error'}`);
			}
		}

		// Build the set of global key names for interpolation. Includes reuse
		// cases (where no value was sent) so `$key`/`@key` skip the prefix.
		const globalKeys = new Set<string>(
			Array.isArray(globalKeyNames)
				? globalKeyNames.filter((k: unknown): k is string => typeof k === 'string')
				: []
		);
		for (const k of Object.keys(globalSecrets)) globalKeys.add(k);

		// ── Process each integration ────────────────────────────────────
		const integrationsConfig = readIntegrations();

		for (const integ of integrations) {
			const { id, type, label, pollInterval, taskDefaults, config: integConfig = {}, automation } = integ;

			if (!id || !type) continue;

			const sourceId = `${projectKey}-${id}`;

			// Interpolate adapter-specific config
			const interpolated = interpolateConfig(integConfig, projectKey, resolvedSecrets, globalKeys);

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
