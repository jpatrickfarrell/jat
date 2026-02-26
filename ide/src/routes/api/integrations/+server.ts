/**
 * Integrations API Endpoint
 *
 * Manages ingest source configuration in ~/.config/jat/integrations.json
 * (auto-migrates from feeds.json if needed)
 *
 * Endpoints:
 * - GET: Returns all configured sources
 * - POST: Add a new source
 * - PUT: Update an existing source
 * - DELETE: Remove a source by id
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { IntegrationSource, IntegrationsConfig } from '$lib/types/integration';

const CONFIG_DIR = join(homedir(), '.config/jat');
const INTEGRATIONS_PATH = join(CONFIG_DIR, 'integrations.json');
const LEGACY_PATH = join(CONFIG_DIR, 'feeds.json');

/**
 * Resolve config path, auto-migrating feeds.json → integrations.json if needed.
 */
function resolveConfigPath(): string {
	if (existsSync(INTEGRATIONS_PATH)) return INTEGRATIONS_PATH;
	if (existsSync(LEGACY_PATH)) {
		copyFileSync(LEGACY_PATH, INTEGRATIONS_PATH);
		return INTEGRATIONS_PATH;
	}
	return INTEGRATIONS_PATH;
}

function readConfig(): IntegrationsConfig {
	try {
		const path = resolveConfigPath();
		const raw = readFileSync(path, 'utf-8');
		return JSON.parse(raw);
	} catch {
		return { version: 1, sources: [] };
	}
}

function writeConfig(config: IntegrationsConfig): void {
	mkdirSync(dirname(INTEGRATIONS_PATH), { recursive: true });
	writeFileSync(INTEGRATIONS_PATH, JSON.stringify(config, null, 2) + '\n', { mode: 0o644 });
}

/**
 * GET /api/integrations
 * Returns all configured sources
 */
export const GET: RequestHandler = async () => {
	try {
		const config = readConfig();
		return json({ success: true, config });
	} catch (error) {
		return json(
			{ success: false, error: 'Failed to read integrations config' },
			{ status: 500 }
		);
	}
};

/**
 * POST /api/integrations
 * Add a new source
 * Body: IntegrationSource object
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const source: IntegrationSource = await request.json();

		if (!source.id || !source.type || !source.project) {
			return json(
				{ success: false, error: 'id, type, and project are required' },
				{ status: 400 }
			);
		}

		const config = readConfig();

		// Check for duplicate id
		if (config.sources.some((s) => s.id === source.id)) {
			return json(
				{ success: false, error: `Source with id "${source.id}" already exists` },
				{ status: 409 }
			);
		}

		config.sources.push(source);
		writeConfig(config);

		return json({ success: true, source });
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to add source'
			},
			{ status: 500 }
		);
	}
};

/**
 * PUT /api/integrations
 * Update an existing source
 * Body: IntegrationSource object (must include id)
 */
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { _originalId, ...source } = body as IntegrationSource & { _originalId?: string };

		if (!source.id) {
			return json({ success: false, error: 'id is required' }, { status: 400 });
		}

		const config = readConfig();
		// Use _originalId for lookup when the source has been renamed
		const lookupId = _originalId || source.id;
		const index = config.sources.findIndex((s) => s.id === lookupId);

		if (index === -1) {
			return json(
				{ success: false, error: `Source "${lookupId}" not found` },
				{ status: 404 }
			);
		}

		// Check for id collision when renaming (new id already taken by another source)
		if (_originalId && source.id !== _originalId) {
			const collision = config.sources.some((s, i) => i !== index && s.id === source.id);
			if (collision) {
				return json(
					{ success: false, error: `Source with id "${source.id}" already exists` },
					{ status: 409 }
				);
			}
		}

		config.sources[index] = source;
		writeConfig(config);

		return json({ success: true, source });
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update source'
			},
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/integrations
 * Remove a source by id
 * Query: ?id=source-id
 */
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');

		if (!id) {
			return json({ success: false, error: 'id query parameter is required' }, { status: 400 });
		}

		const config = readConfig();
		const index = config.sources.findIndex((s) => s.id === id);

		if (index === -1) {
			return json({ success: false, error: `Source "${id}" not found` }, { status: 404 });
		}

		config.sources.splice(index, 1);
		writeConfig(config);

		return json({ success: true });
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete source'
			},
			{ status: 500 }
		);
	}
};
