/**
 * Voice Providers Probe API — capability probe endpoint.
 *
 * GET /api/voice/providers
 * Response: { stt[], llm[], speak[] } — each entry { id, name, isLocal, available, reason?, capabilities? }.
 *
 * Used by /setup wizard and /config/voice to render provider pickers and by
 * voiceSubsystem.svelte.ts → #probeAndPopulate() to derive runtime registries.
 *
 * Spec: ide/docs/prd-voice-subsystem.md §7.2, §7.4. Task: jat-68j78.8.
 */
import { json } from '@sveltejs/kit';
import type { TranscribeProvider, IntentProvider, SpeakProvider } from '$lib/voice/types';
import { voxtypeProvider } from '$lib/voice/providers/voxtype';
import { elevenlabsProvider } from '$lib/voice/providers/elevenlabs';
import ollamaProvider from '$lib/voice/providers/ollama';
import { openaiSttProvider, openaiIntentProvider } from '$lib/voice/providers/openai';

const PROBE_TIMEOUT_MS = 2000;
const CACHE_TTL_MS = 5000;

interface ProbeMeta {
	id: string;
	name: string;
	isLocal: boolean;
	available: boolean;
	reason?: string;
	capabilities?: TranscribeProvider['capabilities'];
}

interface ProbeResponse {
	stt: ProbeMeta[];
	llm: ProbeMeta[];
	speak: ProbeMeta[];
}

const STT_PROVIDERS: TranscribeProvider[] = [voxtypeProvider, openaiSttProvider, elevenlabsProvider];
const LLM_PROVIDERS: IntentProvider[] = [ollamaProvider, openaiIntentProvider];
const SPEAK_PROVIDERS: SpeakProvider[] = [];

let cached: { value: ProbeResponse; expires: number } | null = null;

// Race a probe against a 2s timeout so one hung provider can't block the
// caller. Resolves to { ok: false, reason } on timeout — same shape as a
// well-behaved isAvailable() rejection, so callers don't need to special-case it.
async function probeWithTimeout(
	probe: () => Promise<{ ok: boolean; reason?: string }>,
	timeoutMs: number
): Promise<{ ok: boolean; reason?: string }> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<{ ok: boolean; reason?: string }>((resolve) => {
		timer = setTimeout(
			() => resolve({ ok: false, reason: `probe timed out after ${timeoutMs}ms` }),
			timeoutMs
		);
	});

	try {
		return await Promise.race([
			probe().catch((e) => ({
				ok: false,
				reason: e instanceof Error ? e.message : String(e)
			})),
			timeout
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

async function probeStt(p: TranscribeProvider): Promise<ProbeMeta> {
	const result = await probeWithTimeout(() => p.isAvailable(), PROBE_TIMEOUT_MS);
	return {
		id: p.id,
		name: p.name,
		isLocal: p.isLocal,
		available: result.ok,
		...(result.reason ? { reason: result.reason } : {}),
		capabilities: p.capabilities
	};
}

async function probeLlm(p: IntentProvider): Promise<ProbeMeta> {
	const result = await probeWithTimeout(() => p.isAvailable(), PROBE_TIMEOUT_MS);
	return {
		id: p.id,
		name: p.name,
		isLocal: p.isLocal,
		available: result.ok,
		...(result.reason ? { reason: result.reason } : {})
	};
}

async function probeSpeak(p: SpeakProvider): Promise<ProbeMeta> {
	const result = await probeWithTimeout(() => p.isAvailable(), PROBE_TIMEOUT_MS);
	return {
		id: p.id,
		name: p.name,
		isLocal: p.isLocal,
		available: result.ok,
		...(result.reason ? { reason: result.reason } : {})
	};
}

async function buildProbeResponse(): Promise<ProbeResponse> {
	const [stt, llm, speak] = await Promise.all([
		Promise.all(STT_PROVIDERS.map(probeStt)),
		Promise.all(LLM_PROVIDERS.map(probeLlm)),
		Promise.all(SPEAK_PROVIDERS.map(probeSpeak))
	]);
	return { stt, llm, speak };
}

export async function GET() {
	const now = Date.now();
	if (cached && cached.expires > now) {
		return json(cached.value);
	}

	const value = await buildProbeResponse();
	cached = { value, expires: now + CACHE_TTL_MS };
	return json(value);
}
