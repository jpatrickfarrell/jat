// Cloud LLM IntentProvider wrapping Anthropic's Messages API with forced
// tool use for schema-conforming structured output.
// Server-only: do not import from client code (pulls in fs via auditLog +
// credentials). Wire into API routes (/api/voice/intent, /api/voice/providers)
// directly, not via the providers/index.ts catalog.
//
// Spec: ide/docs/prd-voice-subsystem.md §5.2, §5.3, §7.4. Task: jat-68j78.15.
//
// Privacy: this provider must only be invoked when voice.json's
// privacy.offDeviceText === true. Enforcement is the caller's responsibility
// (probe endpoint and route layer); the provider itself is unaware of the
// flag because IntentProvider has no privacy-config surface area.

import { getApiKeyWithFallback } from '$lib/utils/credentials';
import { recordCloudCall } from '../auditLog';
import { validate } from '../schemaValidator';
import type { IntentProvider, IntentResult } from '../types';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Default model is documented in PRD §5.2 as "claude-haiku-4-5". The dated
// alias is the actual API identifier; callers can override via
// providerOverrides.anthropic.model in voice.json (the store/route inject
// input.model from there, mirroring the ollama path).
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

// Cloud round-trip is meaningfully slower than ollama's local-host fetch,
// especially on first call after a cold network. PRD §7.4 calls for graceful
// fall-through on timeout, so this needs to be generous enough that a healthy
// p95 fits comfortably under it.
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RAW_BYTES = 4096;
const MAX_OUTPUT_TOKENS = 1024;

// Cooldown after Anthropic returns 429 (rate limit) or 529 (overloaded).
// During cooldown isAvailable() reports the provider as down so the picker
// surfaces a clear reason and any auto-fall-through logic skips us.
const RATE_LIMIT_COOLDOWN_MS = 60_000;

// Module-scoped degrade state. A successful call clears it; a 429/529 sets it.
// Single-process scope is fine — this is the API server, and the cooldown is
// advisory rather than a hard quota.
let lastRateLimitAt = 0;
let lastRateLimitStatus = 0;

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

function isAbortError(err: unknown): boolean {
	if (!err) return false;
	if (err instanceof Error) {
		return err.name === 'AbortError' || /aborted|abort/i.test(err.message);
	}
	return false;
}

function noteRateLimit(status: number): void {
	lastRateLimitAt = Date.now();
	lastRateLimitStatus = status;
}

function clearRateLimit(): void {
	lastRateLimitAt = 0;
	lastRateLimitStatus = 0;
}

interface AnthropicContentBlock {
	type: string;
	name?: string;
	input?: unknown;
	text?: string;
}

interface AnthropicMessagesResponse {
	content?: AnthropicContentBlock[];
	stop_reason?: string;
}

const anthropicProvider: IntentProvider = {
	id: 'anthropic',
	name: 'Anthropic (cloud)',
	isLocal: false,

	async isAvailable(): Promise<{ ok: boolean; reason?: string }> {
		const apiKey = getApiKeyWithFallback('anthropic', 'ANTHROPIC_API_KEY');
		if (!apiKey) {
			return {
				ok: false,
				reason:
					'no anthropic API key — add one in Settings → API Keys, run `jat-secret --set anthropic <key>`, or export ANTHROPIC_API_KEY'
			};
		}

		const since = Date.now() - lastRateLimitAt;
		if (lastRateLimitAt > 0 && since < RATE_LIMIT_COOLDOWN_MS) {
			const remaining = Math.ceil((RATE_LIMIT_COOLDOWN_MS - since) / 1000);
			const label = lastRateLimitStatus === 429 ? 'rate-limited' : 'overloaded';
			return {
				ok: false,
				reason: `Anthropic ${label} (HTTP ${lastRateLimitStatus}); cooling down ${remaining}s before retry`
			};
		}

		// Successful past cooldown — clear so future probes don't compute the
		// stale window over and over.
		if (lastRateLimitAt > 0 && since >= RATE_LIMIT_COOLDOWN_MS) {
			clearRateLimit();
		}

		return { ok: true };
	},

	async classify<T>(input: {
		system: string;
		transcript: string;
		context: string;
		schema: object;
		model?: string;
	}): Promise<IntentResult<T>> {
		const apiKey = getApiKeyWithFallback('anthropic', 'ANTHROPIC_API_KEY');
		if (!apiKey) {
			throw new Error(
				'anthropic.classify: no API key found. Add one in Settings → API Keys, run `jat-secret --set anthropic <key>`, or export ANTHROPIC_API_KEY before invoking voice.classify().'
			);
		}

		const model = input.model ?? DEFAULT_MODEL;
		const userContent = input.context
			? `${input.context}\n\nUtterance: ${input.transcript}`
			: input.transcript;

		// Forced tool use is the canonical way to get schema-conforming JSON
		// out of Claude (PRD §5.2 picks anthropic specifically for this). The
		// model fills `tool_use.input` against `input_schema` — Anthropic
		// validates conformance server-side, but we still re-validate locally
		// so the schemaValid flag is enforced consistently across providers.
		const requestBody = JSON.stringify({
			model,
			max_tokens: MAX_OUTPUT_TOKENS,
			system: input.system,
			messages: [{ role: 'user', content: userContent }],
			tools: [
				{
					name: 'classify_intent',
					description:
						'Return the structured classification result for the utterance. Use only the fields defined by input_schema.',
					input_schema: input.schema
				}
			],
			tool_choice: { type: 'tool', name: 'classify_intent' }
		});
		const bytes = Buffer.byteLength(requestBody, 'utf-8');

		const start = Date.now();
		let res: Response;
		try {
			res = await fetchWithTimeout(API_URL, REQUEST_TIMEOUT_MS, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': apiKey,
					'anthropic-version': ANTHROPIC_VERSION
				},
				body: requestBody
			});
		} catch (err) {
			const timedOut = isAbortError(err);
			void recordCloudCall({
				provider: 'anthropic',
				op: 'classify',
				bytes,
				model,
				ok: false,
				errorClass: timedOut ? 'timeout' : 'network',
				startedAt: start
			});
			if (timedOut) {
				throw new Error(`anthropic request timed out after ${REQUEST_TIMEOUT_MS}ms`);
			}
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`anthropic request failed: ${msg}`);
		}

		const providerLatencyMs = Date.now() - start;

		if (!res.ok) {
			if (res.status === 429 || res.status === 529) {
				noteRateLimit(res.status);
			}
			const detail = (await res.text().catch(() => '')).slice(0, 200);
			void recordCloudCall({
				provider: 'anthropic',
				op: 'classify',
				bytes,
				model,
				ok: false,
				errorClass: res.status === 401 || res.status === 403 ? 'no_key' : 'http',
				startedAt: start
			});
			throw new Error(`anthropic HTTP ${res.status}: ${detail}`);
		}

		// Successful response — clear any stale cooldown so the next isAvailable()
		// call reflects current health.
		clearRateLimit();

		const body = (await res.json()) as AnthropicMessagesResponse;
		const toolUse = body.content?.find(
			(c) => c.type === 'tool_use' && c.name === 'classify_intent'
		);

		let parsed: T | null = null;
		let schemaValid = false;
		let raw = '';
		let errorClass: string | undefined;

		if (toolUse && toolUse.input !== undefined && toolUse.input !== null) {
			try {
				raw = JSON.stringify(toolUse.input).slice(0, MAX_RAW_BYTES);
			} catch {
				raw = String(toolUse.input).slice(0, MAX_RAW_BYTES);
			}
			parsed = toolUse.input as T;
			schemaValid = validate(parsed, input.schema);
			if (!schemaValid) errorClass = 'schema';
		} else {
			// Forced tool_choice should make this branch unreachable, but if the
			// model's content slot somehow lacks the tool block (network mangling,
			// model version drift), surface raw text and report schemaValid=false
			// so the caller can decide.
			const textBlock = body.content?.find((c) => c.type === 'text');
			raw = (textBlock?.text ?? '').slice(0, MAX_RAW_BYTES);
			schemaValid = false;
			errorClass = 'schema';
		}

		void recordCloudCall({
			provider: 'anthropic',
			op: 'classify',
			bytes,
			model,
			ok: schemaValid,
			errorClass,
			startedAt: start
		});

		return {
			parsed: schemaValid ? parsed : null,
			confidence: schemaValid ? 0.95 : 0,
			raw,
			providerLatencyMs,
			schemaValid
		};
	}
};

export default anthropicProvider;
