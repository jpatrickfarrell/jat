/**
 * Hooks API
 *
 * GET  /api/hooks - Read hooks configuration from .claude/settings.json
 * PUT  /api/hooks - Update hooks configuration in .claude/settings.json
 *
 * @see dashboard/src/lib/types/config.ts for type definitions
 */

import { json } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';
import type { ClaudeSettingsFile, HooksConfig } from '$lib/types/config';

// Get the project root directory (parent of dashboard)
function getProjectRoot(): string {
	return process.cwd().replace('/dashboard', '');
}

// Get path to .claude/settings.json
function getSettingsPath(): string {
	return path.join(getProjectRoot(), '.claude', 'settings.json');
}

/**
 * GET /api/hooks
 *
 * Returns the hooks configuration from .claude/settings.json
 */
export const GET: RequestHandler = async () => {
	try {
		const settingsPath = getSettingsPath();

		if (!existsSync(settingsPath)) {
			// Return empty hooks if settings file doesn't exist
			return json({
				hooks: {},
				statusLine: null,
				exists: false
			});
		}

		const content = await readFile(settingsPath, 'utf-8');
		const settings: ClaudeSettingsFile = JSON.parse(content);

		return json({
			hooks: settings.hooks || {},
			statusLine: settings.statusLine || null,
			exists: true
		});
	} catch (error) {
		console.error('[hooks API] Error reading settings:', error);
		return json(
			{
				error: 'Failed to read hooks configuration',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * PUT /api/hooks
 *
 * Updates the hooks configuration in .claude/settings.json
 * Preserves other settings like statusLine
 */
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { hooks } = body as { hooks: HooksConfig };

		if (hooks === undefined) {
			return json({ error: 'Missing hooks in request body' }, { status: 400 });
		}

		const settingsPath = getSettingsPath();
		let settings: ClaudeSettingsFile = {};

		// Read existing settings if file exists
		if (existsSync(settingsPath)) {
			try {
				const content = await readFile(settingsPath, 'utf-8');
				settings = JSON.parse(content);
			} catch (parseError) {
				console.warn('[hooks API] Error parsing existing settings, starting fresh');
			}
		}

		// Update hooks while preserving other settings
		settings.hooks = hooks;

		// Clean up empty hook arrays
		if (settings.hooks) {
			for (const eventType of Object.keys(settings.hooks) as (keyof HooksConfig)[]) {
				if (!settings.hooks[eventType]?.length) {
					delete settings.hooks[eventType];
				}
			}
			// Remove hooks object entirely if empty
			if (Object.keys(settings.hooks).length === 0) {
				delete settings.hooks;
			}
		}

		// Write back to file with pretty formatting
		await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');

		return json({
			success: true,
			hooks: settings.hooks || {}
		});
	} catch (error) {
		console.error('[hooks API] Error saving settings:', error);
		return json(
			{
				error: 'Failed to save hooks configuration',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
