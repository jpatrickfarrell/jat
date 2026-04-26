/**
 * Voice Intent API — provider-routed LLM classification.
 *
 * POST /api/voice/intent
 * Body: application/json { system?, transcript, context?, schema, providerId?, model? }
 *
 * Phase 1: only ollama is wired (jat-68j78.5). Unknown providerId → 400.
 * Cloud audit logging lands once openai/anthropic providers ship (jat-68j78.14, .15);
 * ollama is local so the audit line is N/A here.
 *
 * Response is the provider's IntentResult<T> (see voice/types.ts) with the
 * documented schemaValid contract: parse/schema failure → 200 with
 * `schemaValid: false` and `raw` populated; provider timeout → 504 with a
 * structured error; other transport failures → 500.
 *
 * Spec: ide/docs/prd-voice-subsystem.md §5.1, §7.2 (POST /api/voice/intent).
 */
import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { IntentProvider } from '$lib/voice/types';
import ollamaProvider from '$lib/voice/providers/ollama';

const PROVIDERS: Record<string, IntentProvider> = {
	ollama: ollamaProvider
};

const VOICE_CONFIG_PATH = join(homedir(), '.config', 'jat', 'voice.json');

const DEFAULT_SYSTEM =
	'Reply with a single JSON object that conforms to the provided schema and nothing else.';

// Read providerOverrides[id].model from voice.json so server-side callers (and
// any future ingest paths that hit this route directly) get the same model
// the browser store would inject. Returns undefined when the file is missing
// or malformed — caller decides whether that's a 400.
async function readConfiguredModel(providerId: string): Promise<string | undefined> {
	if (!existsSync(VOICE_CONFIG_PATH)) return undefined;
	try {
		const content = await readFile(VOICE_CONFIG_PATH, 'utf-8');
		const cfg = JSON.parse(content) as {
			providerOverrides?: Record<string, { model?: unknown } | undefined>;
		};
		const override = cfg.providerOverrides?.[providerId];
		if (override && typeof override.model === 'string' && override.model.length > 0) {
			return override.model;
		}
	} catch {
		// fall through
	}
	return undefined;
}

function isTimeoutError(err: unknown): boolean {
	if (!err) return false;
	const msg = err instanceof Error ? err.message : String(err);
	return /timed out|abort/i.test(msg);
}

export async function POST({ request }: { request: Request }) {
	let body: unknown;
	try {
		body = await request.json();
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return json({ error: `invalid JSON body: ${msg}` }, { status: 400 });
	}

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return json({ error: 'body must be a JSON object' }, { status: 400 });
	}

	const b = body as {
		system?: unknown;
		transcript?: unknown;
		context?: unknown;
		schema?: unknown;
		providerId?: unknown;
		model?: unknown;
	};

	if (typeof b.transcript !== 'string' || b.transcript.length === 0) {
		return json({ error: 'transcript is required (non-empty string)' }, { status: 400 });
	}
	if (!b.schema || typeof b.schema !== 'object' || Array.isArray(b.schema)) {
		return json({ error: 'schema is required (JSON Schema object)' }, { status: 400 });
	}

	const providerId =
		typeof b.providerId === 'string' && b.providerId.length > 0 ? b.providerId : 'ollama';
	const provider = PROVIDERS[providerId];
	if (!provider) {
		return json({ error: `unknown providerId: ${providerId}` }, { status: 400 });
	}

	const system = typeof b.system === 'string' && b.system.length > 0 ? b.system : DEFAULT_SYSTEM;
	const context = typeof b.context === 'string' ? b.context : '';
	const explicitModel = typeof b.model === 'string' && b.model.length > 0 ? b.model : undefined;
	const model = explicitModel ?? (await readConfiguredModel(providerId));

	if (!model) {
		return json(
			{
				error: `model required: pass "model" in the request body or set providerOverrides.${providerId}.model in ~/.config/jat/voice.json`
			},
			{ status: 400 }
		);
	}

	try {
		const result = await provider.classify({
			system,
			transcript: b.transcript,
			context,
			schema: b.schema as object,
			model
		});
		return json(result);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		if (isTimeoutError(e)) {
			return json(
				{ error: 'provider_timeout', providerId, detail: msg },
				{ status: 504 }
			);
		}
		return json(
			{ error: 'classification_failed', providerId, detail: msg },
			{ status: 500 }
		);
	}
}
