/**
 * Voice Subsystem Config API
 * GET /api/config/voice - Read ~/.config/jat/voice.json (writes enabled=false defaults if missing)
 * PUT /api/config/voice - Write the full voice.json payload atomically (validates schema, rejects unknown keys)
 *
 * See: ide/docs/prd-voice-subsystem.md §5.0, §7.2, §7.5.1
 */

import { json } from '@sveltejs/kit';
import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { randomBytes } from 'crypto';
import { singleFlight, apiCache } from '$lib/server/cache.js';

const CONFIG_PATH = join(homedir(), '.config', 'jat', 'voice.json');

const VOICE_DEFAULTS = Object.freeze({
	enabled: false,
	activeStt: 'voxtype',
	activeLlm: 'ollama',
	activeTts: null,
	privacy: {
		offDeviceAudio: false,
		offDeviceText: false,
		offDeviceSpeech: false
	},
	hotkey: 'Ctrl+Space',
	inputDeviceId: 'default',
	providerOverrides: {
		ollama: { model: 'gemma3:4b', timeoutMs: 5000 },
		openai: { model: 'gpt-4o-mini' }
	}
});

const ALLOWED_TOP_LEVEL_KEYS = new Set(Object.keys(VOICE_DEFAULTS));
const ALLOWED_PRIVACY_KEYS = new Set(Object.keys(VOICE_DEFAULTS.privacy));

function cloneDefaults() {
	return JSON.parse(JSON.stringify(VOICE_DEFAULTS));
}

async function ensureConfigDir() {
	const dir = dirname(CONFIG_PATH);
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true });
	}
}

/**
 * Atomic write: write to temp file in the same directory, then rename.
 */
async function writeConfigAtomic(config) {
	await ensureConfigDir();
	const tempPath = `${CONFIG_PATH}.${randomBytes(8).toString('hex')}.tmp`;
	await writeFile(tempPath, JSON.stringify(config, null, 2), 'utf-8');
	await rename(tempPath, CONFIG_PATH);
}

/**
 * On first GET, if voice.json doesn't exist, write the enabled=false defaults
 * and return them (per §7.5.1).
 */
async function readOrInitConfig() {
	if (!existsSync(CONFIG_PATH)) {
		const defaults = cloneDefaults();
		await writeConfigAtomic(defaults);
		return defaults;
	}
	const content = await readFile(CONFIG_PATH, 'utf-8');
	return JSON.parse(content);
}

/**
 * Validate the incoming voice.json payload.
 * Returns null when valid, or a string error message when invalid.
 */
function validateVoiceConfig(payload) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		return 'payload must be an object';
	}

	for (const key of Object.keys(payload)) {
		if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
			return `unknown top-level key: ${key}`;
		}
	}

	if ('enabled' in payload && typeof payload.enabled !== 'boolean') {
		return 'enabled must be a boolean';
	}

	for (const field of ['activeStt', 'activeLlm', 'activeTts']) {
		if (field in payload && payload[field] !== null && typeof payload[field] !== 'string') {
			return `${field} must be a string or null`;
		}
	}

	if ('hotkey' in payload && typeof payload.hotkey !== 'string') {
		return 'hotkey must be a string';
	}

	if ('inputDeviceId' in payload && typeof payload.inputDeviceId !== 'string') {
		return 'inputDeviceId must be a string';
	}

	if ('privacy' in payload) {
		const p = payload.privacy;
		if (!p || typeof p !== 'object' || Array.isArray(p)) {
			return 'privacy must be an object';
		}
		for (const key of Object.keys(p)) {
			if (!ALLOWED_PRIVACY_KEYS.has(key)) {
				return `unknown privacy key: ${key}`;
			}
			if (typeof p[key] !== 'boolean') {
				return `privacy.${key} must be a boolean`;
			}
		}
	}

	if ('providerOverrides' in payload) {
		const po = payload.providerOverrides;
		if (!po || typeof po !== 'object' || Array.isArray(po)) {
			return 'providerOverrides must be an object';
		}
		for (const [providerId, override] of Object.entries(po)) {
			if (!override || typeof override !== 'object' || Array.isArray(override)) {
				return `providerOverrides.${providerId} must be an object`;
			}
		}
	}

	return null;
}

/**
 * GET /api/config/voice
 * Returns the current voice config. On first run, writes enabled=false defaults
 * and returns them.
 */
/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const config = await singleFlight('config-voice', async () => {
			return readOrInitConfig();
		}, 30000);

		return json({
			success: true,
			config,
			configPath: CONFIG_PATH
		});
	} catch (error) {
		console.error('[config/voice] GET error:', error);
		return json({
			error: 'Failed to read voice config',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}

/**
 * PUT /api/config/voice
 * Replaces the voice config with the provided payload. Validates schema and
 * rejects unknown top-level keys. Writes atomically (temp file + rename).
 */
/** @type {import('./$types').RequestHandler} */
export async function PUT({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({
			error: 'Invalid request',
			message: 'Request body must be valid JSON'
		}, { status: 400 });
	}

	const validationError = validateVoiceConfig(body);
	if (validationError) {
		return json({
			error: 'Invalid voice config',
			message: validationError
		}, { status: 400 });
	}

	try {
		await writeConfigAtomic(body);
		apiCache.delete('config-voice');

		return json({
			success: true,
			config: body,
			message: 'Voice config updated successfully'
		});
	} catch (error) {
		console.error('[config/voice] PUT error:', error);
		return json({
			error: 'Failed to write voice config',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
