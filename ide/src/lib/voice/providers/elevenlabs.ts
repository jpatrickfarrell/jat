// ElevenLabs Scribe TranscribeProvider — cloud STT via the ElevenLabs
// /v1/speech-to-text endpoint (model scribe_v1).
//
// Spec: ide/docs/prd-voice-subsystem.md §5.1, §5.4.1, §7.4. Task: jat-68j78.16.
//
// Server-only: imports getApiKeyWithFallback (which reads ~/.config/jat/credentials.json)
// and writes the cloud audit log via recordCloudCall(). Do not import from client code.
//
// Privacy gating (privacy.offDeviceAudio) is enforced at the
// /api/voice/transcribe route — see jat-68j78.18. The provider itself is
// privacy-blind: isAvailable() reflects only reachability of the ElevenLabs
// API, and audit log entries are written for every cloud call once the route
// permits one through.

import { getApiKeyWithFallback } from '$lib/utils/credentials';
import type { TranscribeProvider, TranscribeResult } from '../types';
import { recordCloudCall } from '../auditLog';

const API_URL = 'https://api.elevenlabs.io/v1/speech-to-text';
const PROBE_URL = 'https://api.elevenlabs.io/v1/user/subscription';
const MODEL_ID = 'scribe_v1';
const REQUEST_TIMEOUT_MS = 60_000;
const PROBE_TIMEOUT_MS = 1500;
const MAX_DURATION_SEC = 4 * 60 * 60;

// ISO-639-1 / BCP-47 codes for the 99 languages Scribe documents support for.
// Exposed via capabilities.supportedLanguages so the picker UI can render the
// list and a language hint passed to transcribe() can be validated upstream.
const SUPPORTED_LANGUAGES: string[] = [
	'af', 'am', 'ar', 'as', 'az', 'ba', 'be', 'bg', 'bn', 'bo',
	'br', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es',
	'et', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'gu', 'ha', 'haw',
	'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'is', 'it', 'ja',
	'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb', 'ln', 'lo',
	'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt',
	'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa', 'pl', 'ps', 'pt',
	'ro', 'ru', 'sa', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq',
	'sr', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl',
	'tr', 'tt', 'uk', 'ur', 'uz', 'vi', 'yi', 'yo', 'zh'
];

function getKey(): string | undefined {
	return getApiKeyWithFallback('elevenlabs', 'ELEVENLABS_API_KEY');
}

function fetchWithTimeout(url: string, timeoutMs: number, init?: RequestInit): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function isAbortError(err: unknown): boolean {
	if (!err) return false;
	if (err instanceof Error) {
		return err.name === 'AbortError' || /aborted|abort/i.test(err.message);
	}
	return false;
}

function classifyError(status: number | null, err: unknown): string {
	if (isAbortError(err)) return 'timeout';
	if (status === 401 || status === 403) return 'no_key';
	if (status !== null && status >= 400) return 'http';
	if (err instanceof TypeError) return 'network';
	return 'unknown';
}

interface ScribeWord {
	text?: string;
	start?: number;
	end?: number;
	type?: string;
	speaker_id?: string;
}

interface ScribeResponse {
	language_code?: string;
	language_probability?: number;
	text?: string;
	words?: ScribeWord[];
}

// Group word-level timestamps into utterance segments. Scribe's response is
// per-token; the TranscribeResult interface expects coarser segments. Break on
// (a) speaker change or (b) silence > 500ms between adjacent word tokens.
function buildSegments(words: ScribeWord[] | undefined): TranscribeResult['segments'] {
	if (!words || words.length === 0) return undefined;
	const segments: NonNullable<TranscribeResult['segments']> = [];
	let cur: { start: number; end: number; speaker?: string; tokens: string[] } | null = null;

	for (const w of words) {
		if (w.type && w.type !== 'word') continue;
		const text = w.text ?? '';
		if (!text || w.start === undefined || w.end === undefined) continue;
		const speaker = w.speaker_id;
		const speakerChanged = cur !== null && cur.speaker !== speaker;
		const longGap = cur !== null && w.start - cur.end > 0.5;
		if (cur && (speakerChanged || longGap)) {
			segments.push({
				start: cur.start,
				end: cur.end,
				...(cur.speaker ? { speaker: cur.speaker } : {}),
				text: cur.tokens.join(' ').trim()
			});
			cur = null;
		}
		if (!cur) {
			cur = { start: w.start, end: w.end, speaker, tokens: [text] };
		} else {
			cur.end = w.end;
			cur.tokens.push(text);
		}
	}
	if (cur) {
		segments.push({
			start: cur.start,
			end: cur.end,
			...(cur.speaker ? { speaker: cur.speaker } : {}),
			text: cur.tokens.join(' ').trim()
		});
	}
	return segments.length > 0 ? segments : undefined;
}

export const elevenlabsProvider: TranscribeProvider = {
	id: 'elevenlabs',
	name: 'ElevenLabs Scribe',
	isLocal: false,
	capabilities: {
		diarize: true,
		maxDurationSec: MAX_DURATION_SEC,
		supportedLanguages: SUPPORTED_LANGUAGES
	},

	async isAvailable() {
		const key = getKey();
		if (!key) {
			return {
				ok: false,
				reason:
					'ElevenLabs API key missing — set ELEVENLABS_API_KEY or add via /config → API Keys (provider: elevenlabs).'
			};
		}

		try {
			const res = await fetchWithTimeout(PROBE_URL, PROBE_TIMEOUT_MS, {
				headers: { 'xi-api-key': key }
			});
			if (res.ok) return { ok: true };
			if (res.status === 401 || res.status === 403) {
				return {
					ok: false,
					reason: `ElevenLabs API key rejected (HTTP ${res.status}) — verify the key in /config → API Keys.`
				};
			}
			return {
				ok: false,
				reason: `ElevenLabs probe returned HTTP ${res.status} — service may be degraded.`
			};
		} catch (err) {
			if (isAbortError(err)) {
				return {
					ok: false,
					reason: `ElevenLabs probe timed out after ${PROBE_TIMEOUT_MS}ms — check network connectivity.`
				};
			}
			const msg = err instanceof Error ? err.message : String(err);
			return { ok: false, reason: `ElevenLabs not reachable (${msg}).` };
		}
	},

	async transcribe(audio: Blob, opts): Promise<TranscribeResult> {
		const start = Date.now();
		const buffer = Buffer.from(await audio.arrayBuffer());
		if (buffer.length === 0) {
			throw new Error('Empty audio blob');
		}

		const key = getKey();
		if (!key) {
			await recordCloudCall({
				startedAt: start,
				endedAt: Date.now(),
				provider: 'elevenlabs',
				op: 'transcribe',
				bytes: buffer.length,
				model: MODEL_ID,
				ok: false,
				errorClass: 'no_key'
			});
			throw new Error(
				'ElevenLabs API key missing — set ELEVENLABS_API_KEY or configure via /config → API Keys.'
			);
		}

		const filename =
			audio.type && audio.type.includes('webm')
				? 'audio.webm'
				: audio.type && audio.type.includes('wav')
					? 'audio.wav'
					: audio.type && audio.type.includes('mp4')
						? 'audio.mp4'
						: 'audio.bin';
		const fileBlob = new Blob([buffer], { type: audio.type || 'application/octet-stream' });

		const form = new FormData();
		form.append('file', fileBlob, filename);
		form.append('model_id', MODEL_ID);
		if (opts?.language) form.append('language_code', opts.language);
		if (opts?.diarize) form.append('diarize', 'true');
		if (opts?.prompt) form.append('biased_keywords', opts.prompt);

		let res: Response;
		try {
			res = await fetchWithTimeout(API_URL, REQUEST_TIMEOUT_MS, {
				method: 'POST',
				headers: { 'xi-api-key': key },
				body: form
			});
		} catch (err) {
			const errorClass = classifyError(null, err);
			await recordCloudCall({
				startedAt: start,
				endedAt: Date.now(),
				provider: 'elevenlabs',
				op: 'transcribe',
				bytes: buffer.length,
				model: MODEL_ID,
				ok: false,
				errorClass
			});
			if (isAbortError(err)) {
				throw new Error(`ElevenLabs request timed out after ${REQUEST_TIMEOUT_MS}ms`);
			}
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`ElevenLabs request failed: ${msg}`);
		}

		if (!res.ok) {
			const detail = (await res.text().catch(() => '')).slice(0, 300);
			await recordCloudCall({
				startedAt: start,
				endedAt: Date.now(),
				provider: 'elevenlabs',
				op: 'transcribe',
				bytes: buffer.length,
				model: MODEL_ID,
				ok: false,
				errorClass: classifyError(res.status, null)
			});
			throw new Error(`ElevenLabs HTTP ${res.status}: ${detail}`);
		}

		let body: ScribeResponse;
		try {
			body = (await res.json()) as ScribeResponse;
		} catch (err) {
			await recordCloudCall({
				startedAt: start,
				endedAt: Date.now(),
				provider: 'elevenlabs',
				op: 'transcribe',
				bytes: buffer.length,
				model: MODEL_ID,
				ok: false,
				errorClass: 'schema'
			});
			const msg = err instanceof Error ? err.message : String(err);
			throw new Error(`ElevenLabs response was not JSON: ${msg}`);
		}

		const endedAt = Date.now();
		const providerLatencyMs = endedAt - start;
		const segments = buildSegments(body.words);
		const lastEnd = segments?.[segments.length - 1]?.end ?? 0;
		const durationMs = Math.max(0, Math.round(lastEnd * 1000));

		await recordCloudCall({
			startedAt: start,
			endedAt,
			provider: 'elevenlabs',
			op: 'transcribe',
			bytes: buffer.length,
			model: MODEL_ID,
			ok: true
		});

		return {
			transcript: (body.text ?? '').trim(),
			durationMs,
			...(body.language_code ? { language: body.language_code } : {}),
			...(segments ? { segments } : {}),
			providerLatencyMs
		};
	}
};

export default elevenlabsProvider;
