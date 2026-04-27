// OpenAI provider module: cloud STT (whisper-1) + LLM (gpt-4o-mini).
// Spec: ide/docs/prd-voice-subsystem.md §5.1, §5.2, §5.4.1, §7.4.
// Task: jat-68j78.14.
//
// Server-only: imports getApiKeyWithFallback (which reads ~/.config/jat/credentials.json)
// and writes the cloud audit log via recordCloudCall(). Do not import from
// client code.
//
// Privacy gating (privacy.offDeviceAudio for STT, privacy.offDeviceText for LLM)
// is enforced at the /api/voice/transcribe and /api/voice/intent routes — see
// jat-68j78.18. Providers themselves are privacy-blind: isAvailable() reflects
// only the technical reachability of the OpenAI API, and audit log entries are
// written for every cloud call once the route permits one through.

import { getApiKeyWithFallback } from '$lib/utils/credentials';
import type {
	TranscribeProvider,
	TranscribeResult,
	IntentProvider,
	IntentResult
} from '../types';
import { validate } from '../schemaValidator';
import { recordCloudCall } from '../auditLog';

const OPENAI_BASE = 'https://api.openai.com';
const STT_TIMEOUT_MS = 30_000;
const LLM_TIMEOUT_MS = 30_000;
const WHISPER_MODEL = 'whisper-1';
const DEFAULT_LLM_MODEL = 'gpt-4o-mini';
const MAX_RAW_BYTES = 4096;

function getKey(): string | undefined {
	return getApiKeyWithFallback('openai', 'OPENAI_API_KEY');
}

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

function classifyError(err: unknown): 'timeout' | 'network' | 'http' | 'unknown' {
	if (isAbortError(err)) return 'timeout';
	if (err instanceof TypeError) return 'network';
	if (err instanceof Error && /HTTP \d/.test(err.message)) return 'http';
	return 'unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// STT — whisper-1
// ─────────────────────────────────────────────────────────────────────────────

interface WhisperVerboseResponse {
	text?: string;
	language?: string;
	duration?: number;
	segments?: Array<{
		start: number;
		end: number;
		text: string;
	}>;
}

export const openaiSttProvider: TranscribeProvider = {
	id: 'openai',
	name: 'OpenAI Whisper (cloud)',
	isLocal: false,
	capabilities: {
		// whisper-1 has a 25 MB upload cap which bounds duration by bitrate.
		// 60 s of 16 kHz mono PCM is well within bounds; staying conservative
		// here matches the local voxtype provider's capability surface.
		diarize: false,
		maxDurationSec: 600
	},

	async isAvailable() {
		if (!getKey()) {
			return { ok: false, reason: 'Add OpenAI key' };
		}
		return { ok: true };
	},

	async transcribe(audio: Blob, opts): Promise<TranscribeResult> {
		const apiKey = getKey();
		if (!apiKey) {
			throw new Error('OpenAI API key not configured (Add OpenAI key)');
		}

		const start = Date.now();
		const bytes = audio.size;

		const form = new FormData();
		// File name has to carry an extension whisper-1 recognizes; the wav blob
		// from the capture pipeline is upstream-converted, so .wav is correct.
		// For raw browser webm/ogg uploads, OpenAI infers from the multipart
		// blob's content-type but a hint extension keeps things deterministic.
		const filename = audio.type.includes('wav')
			? 'audio.wav'
			: audio.type.includes('webm')
				? 'audio.webm'
				: audio.type.includes('mp3') || audio.type.includes('mpeg')
					? 'audio.mp3'
					: 'audio.wav';
		form.append('file', audio, filename);
		form.append('model', WHISPER_MODEL);
		form.append('response_format', 'verbose_json');
		if (opts?.language) form.append('language', opts.language);
		if (opts?.prompt) form.append('prompt', opts.prompt);

		let res: Response;
		try {
			res = await fetchWithTimeout(`${OPENAI_BASE}/v1/audio/transcriptions`, STT_TIMEOUT_MS, {
				method: 'POST',
				headers: { Authorization: `Bearer ${apiKey}` },
				body: form
			});
		} catch (err) {
			void recordCloudCall({
				provider: 'openai',
				op: 'transcribe',
				bytes,
				model: WHISPER_MODEL,
				ok: false,
				errorClass: classifyError(err),
				startedAt: start
			});
			if (isAbortError(err)) {
				throw new Error(`openai whisper request timed out after ${STT_TIMEOUT_MS}ms`);
			}
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`openai whisper request failed: ${msg}`);
		}

		const providerLatencyMs = Date.now() - start;

		if (!res.ok) {
			const detail = (await res.text().catch(() => '')).slice(0, 200);
			void recordCloudCall({
				provider: 'openai',
				op: 'transcribe',
				bytes,
				model: WHISPER_MODEL,
				ok: false,
				errorClass: 'http',
				startedAt: start,
				endedAt: start + providerLatencyMs
			});
			throw new Error(`openai whisper HTTP ${res.status}: ${detail}`);
		}

		let body: WhisperVerboseResponse;
		try {
			body = (await res.json()) as WhisperVerboseResponse;
		} catch (err) {
			void recordCloudCall({
				provider: 'openai',
				op: 'transcribe',
				bytes,
				model: WHISPER_MODEL,
				ok: false,
				errorClass: 'http',
				startedAt: start,
				endedAt: start + providerLatencyMs
			});
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`openai whisper response parse failed: ${msg}`);
		}

		void recordCloudCall({
			provider: 'openai',
			op: 'transcribe',
			bytes,
			model: WHISPER_MODEL,
			ok: true,
			startedAt: start,
			endedAt: start + providerLatencyMs
		});

		const transcript = (body.text ?? '').trim();
		const durationMs =
			typeof body.duration === 'number' ? Math.round(body.duration * 1000) : 0;

		return {
			transcript,
			durationMs,
			language: body.language,
			segments: Array.isArray(body.segments)
				? body.segments.map((s) => ({
						start: s.start,
						end: s.end,
						text: s.text
					}))
				: undefined,
			providerLatencyMs
		};
	}
};

// ─────────────────────────────────────────────────────────────────────────────
// LLM — gpt-4o-mini IntentProvider
// ─────────────────────────────────────────────────────────────────────────────

interface ChatCompletionResponse {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
}

export const openaiIntentProvider: IntentProvider = {
	id: 'openai',
	name: 'OpenAI GPT (cloud)',
	isLocal: false,

	async isAvailable() {
		if (!getKey()) {
			return { ok: false, reason: 'Add OpenAI key' };
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
		const apiKey = getKey();
		if (!apiKey) {
			throw new Error('OpenAI API key not configured (Add OpenAI key)');
		}

		const model = input.model || DEFAULT_LLM_MODEL;
		const userContent = input.context
			? `${input.context}\n\nUtterance: ${input.transcript}`
			: input.transcript;

		// strict:false keeps the json_schema mode permissive — we accept arbitrary
		// caller schemas (no rewriting them to OpenAI's strict subset, which
		// requires every property be required and additionalProperties:false).
		// We still validate the parsed payload locally via schemaValidator so the
		// schemaValid contract in IntentResult is honored regardless of which
		// mode the API enforced.
		const requestBody = {
			model,
			messages: [
				{ role: 'system', content: input.system },
				{ role: 'user', content: userContent }
			],
			response_format: {
				type: 'json_schema',
				json_schema: {
					name: 'intent',
					schema: input.schema,
					strict: false
				}
			}
		};
		const bodyText = JSON.stringify(requestBody);
		const bytes = Buffer.byteLength(bodyText, 'utf-8');

		const start = Date.now();
		let res: Response;
		try {
			res = await fetchWithTimeout(`${OPENAI_BASE}/v1/chat/completions`, LLM_TIMEOUT_MS, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: bodyText
			});
		} catch (err) {
			void recordCloudCall({
				provider: 'openai',
				op: 'classify',
				bytes,
				model,
				ok: false,
				errorClass: classifyError(err),
				startedAt: start
			});
			if (isAbortError(err)) {
				throw new Error(`openai chat request timed out after ${LLM_TIMEOUT_MS}ms`);
			}
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`openai chat request failed: ${msg}`);
		}

		const providerLatencyMs = Date.now() - start;

		if (!res.ok) {
			const detail = (await res.text().catch(() => '')).slice(0, 200);
			void recordCloudCall({
				provider: 'openai',
				op: 'classify',
				bytes,
				model,
				ok: false,
				errorClass: 'http',
				startedAt: start,
				endedAt: start + providerLatencyMs
			});
			throw new Error(`openai chat HTTP ${res.status}: ${detail}`);
		}

		let body: ChatCompletionResponse;
		try {
			body = (await res.json()) as ChatCompletionResponse;
		} catch (err) {
			void recordCloudCall({
				provider: 'openai',
				op: 'classify',
				bytes,
				model,
				ok: false,
				errorClass: 'http',
				startedAt: start,
				endedAt: start + providerLatencyMs
			});
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`openai chat response parse failed: ${msg}`);
		}

		const raw = (body.choices?.[0]?.message?.content ?? '').slice(0, MAX_RAW_BYTES);

		// Per the IntentResult contract (jat-68j78.7 lessons): schema/parse
		// failures are *successful* responses with schemaValid=false — they do
		// not throw. Only timeouts and transport failures throw.
		let parsed: T | null = null;
		let schemaValid = false;
		try {
			parsed = JSON.parse(raw) as T;
			schemaValid = validate(parsed, input.schema);
		} catch {
			parsed = null;
			schemaValid = false;
		}

		void recordCloudCall({
			provider: 'openai',
			op: 'classify',
			bytes,
			model,
			ok: true,
			errorClass: schemaValid ? undefined : 'schema',
			startedAt: start,
			endedAt: start + providerLatencyMs
		});

		return {
			parsed: schemaValid ? parsed : null,
			confidence: schemaValid ? 0.9 : 0,
			raw,
			providerLatencyMs,
			schemaValid
		};
	}
};
