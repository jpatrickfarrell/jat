// Local LLM IntentProvider wrapping ollama's /api/chat endpoint with format='json'.
// Spec: ide/docs/prd-voice-subsystem.md §5.2, §7.4. Task: jat-68j78.5.

import type { IntentProvider, IntentResult } from '../types';

// Model and request-timeout defaults live in
// voiceSubsystem.svelte.ts → DEFAULT_CONFIG.providerOverrides.ollama
// and are user-overridable via ~/.config/jat/voice.json. The store passes
// the resolved model through input.model on every classify() call.
const OLLAMA_URL = 'http://localhost:11434';
const REQUEST_TIMEOUT_MS = 5000;
const PROBE_TIMEOUT_MS = 500;
const MAX_RAW_BYTES = 4096;

async function fetchWithTimeout(
	url: string,
	timeoutMs: number,
	init?: RequestInit
): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

// Minimal JSON Schema validator. Handles type/properties/required/items/enum —
// sufficient for the constrained intent schemas the voice subsystem uses
// (object payloads with primitive fields, optional arrays). Promote to a shared
// util once openai/anthropic providers (jat-68j78.6, .9) need it too.
function validate(value: unknown, schema: unknown): boolean {
	if (!schema || typeof schema !== 'object') return true;
	const s = schema as Record<string, unknown>;

	if (Array.isArray(s.enum)) {
		if (!s.enum.includes(value as never)) return false;
	}

	const t = s.type as string | string[] | undefined;
	if (t) {
		const types = Array.isArray(t) ? t : [t];
		if (!types.some((tt) => matchesType(value, tt))) return false;
	}

	if (s.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
		const obj = value as Record<string, unknown>;
		const required = Array.isArray(s.required) ? (s.required as string[]) : [];
		for (const key of required) {
			if (!(key in obj)) return false;
		}
		const props = (s.properties || {}) as Record<string, unknown>;
		for (const [key, sub] of Object.entries(props)) {
			if (key in obj && !validate(obj[key], sub)) return false;
		}
	}

	if (s.type === 'array' && Array.isArray(value) && s.items) {
		for (const item of value) {
			if (!validate(item, s.items)) return false;
		}
	}

	return true;
}

function matchesType(value: unknown, t: string): boolean {
	switch (t) {
		case 'string':
			return typeof value === 'string';
		case 'number':
			return typeof value === 'number' && !Number.isNaN(value);
		case 'integer':
			return typeof value === 'number' && Number.isInteger(value);
		case 'boolean':
			return typeof value === 'boolean';
		case 'null':
			return value === null;
		case 'array':
			return Array.isArray(value);
		case 'object':
			return value !== null && typeof value === 'object' && !Array.isArray(value);
		default:
			return true;
	}
}

function isAbortError(err: unknown): boolean {
	if (!err) return false;
	if (err instanceof Error) {
		return err.name === 'AbortError' || /aborted|abort/i.test(err.message);
	}
	return false;
}

const ollamaProvider: IntentProvider = {
	id: 'ollama',
	name: 'Ollama (local)',
	isLocal: true,

	async isAvailable(): Promise<{ ok: boolean; reason?: string }> {
		try {
			const res = await fetchWithTimeout(`${OLLAMA_URL}/api/tags`, PROBE_TIMEOUT_MS);
			if (res.ok) {
				return { ok: true };
			}
			return {
				ok: false,
				reason: `ollama responded HTTP ${res.status} at ${OLLAMA_URL} — try restarting: \`ollama serve\``
			};
		} catch (err) {
			if (isAbortError(err)) {
				return {
					ok: false,
					reason: `ollama probe timed out after ${PROBE_TIMEOUT_MS}ms at ${OLLAMA_URL} — start with: \`ollama serve\``
				};
			}
			const msg = err instanceof Error ? err.message : String(err);
			return {
				ok: false,
				reason: `ollama not reachable at ${OLLAMA_URL} (${msg}) — start with: \`ollama serve\``
			};
		}
	},

	async classify<T>(input: {
		system: string;
		transcript: string;
		context: string;
		schema: object;
		model?: string;
	}): Promise<IntentResult<T>> {
		if (!input.model) {
			throw new Error(
				'ollama.classify: input.model is required. The voice store injects this from providerOverrides.ollama.model in ~/.config/jat/voice.json — call via voice.classify() rather than the provider directly.'
			);
		}
		const model = input.model;
		const userContent = input.context
			? `${input.context}\n\nUtterance: ${input.transcript}`
			: input.transcript;

		const start = Date.now();
		let res: Response;
		try {
			res = await fetchWithTimeout(`${OLLAMA_URL}/api/chat`, REQUEST_TIMEOUT_MS, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model,
					format: 'json',
					stream: false,
					messages: [
						{ role: 'system', content: input.system },
						{ role: 'user', content: userContent }
					]
				})
			});
		} catch (err) {
			if (isAbortError(err)) {
				throw new Error(`ollama request timed out after ${REQUEST_TIMEOUT_MS}ms`);
			}
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`ollama request failed: ${msg}`);
		}

		const providerLatencyMs = Date.now() - start;

		if (!res.ok) {
			const detail = (await res.text().catch(() => '')).slice(0, 200);
			throw new Error(`ollama HTTP ${res.status}: ${detail}`);
		}

		const body = (await res.json()) as { message?: { content?: string } };
		const raw = (body.message?.content ?? '').slice(0, MAX_RAW_BYTES);

		let parsed: T | null = null;
		let schemaValid = false;
		try {
			parsed = JSON.parse(raw) as T;
			schemaValid = validate(parsed, input.schema);
		} catch {
			parsed = null;
			schemaValid = false;
		}

		return {
			parsed: schemaValid ? parsed : null,
			confidence: schemaValid ? 0.9 : 0,
			raw,
			providerLatencyMs,
			schemaValid
		};
	}
};

export default ollamaProvider;
