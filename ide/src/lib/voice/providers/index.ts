// Provider catalog. Concrete provider modules register themselves here as
// downstream tasks (jat-68j78.4 voxtype, .5 ollama, .14 openai, etc.) land.
// The store reads these arrays at init and merges them with the
// /api/voice/providers probe response to populate the runtime registries.
//
// IMPORTANT: Cloud provider modules (openai.ts, elevenlabs.ts, anthropic.ts)
// are server-only (they import fs via credentials.ts). Do NOT import them here.
// Instead use lightweight API proxy objects that delegate to the server routes.
// The actual credential reads and audit logging happen server-side.
//
// Spec: ide/docs/prd-voice-subsystem.md §5.1, §5.2, §7.4

import type { TranscribeProvider, IntentProvider, SpeakProvider } from '../types';
import ollamaProvider from './ollama';

// Client-safe proxy: forwards transcription to /api/voice/transcribe?providerId=voxtype.
// voxtype.ts is server-only (imports fs + shells out to ffmpeg).
const voxtypeProxy: TranscribeProvider = {
	id: 'voxtype',
	name: 'Voxtype (local)',
	isLocal: true,
	capabilities: { diarize: false, maxDurationSec: 600 },
	async isAvailable() { return { ok: true }; },
	async transcribe(audio, opts) {
		const form = new FormData();
		form.append('audio', audio, 'audio.webm');
		form.append('providerId', 'voxtype');
		if (opts?.language) form.append('language', opts.language);
		if (opts?.diarize) form.append('diarize', String(opts.diarize));
		if (opts?.prompt) form.append('prompt', opts.prompt);
		const res = await fetch('/api/voice/transcribe', { method: 'POST', body: form });
		if (!res.ok) {
			const d = await res.json().catch(() => ({})) as { error?: string };
			throw new Error(`voxtype transcription failed: ${d.error ?? res.status}`);
		}
		return res.json();
	}
};

// Client-safe proxy: forwards transcription to /api/voice/transcribe?providerId=openai.
// Credentials and audit logging are handled server-side in openai.ts.
const openaiSttProxy: TranscribeProvider = {
	id: 'openai',
	name: 'OpenAI Whisper (cloud)',
	isLocal: false,
	capabilities: { diarize: false, maxDurationSec: 600 },
	async isAvailable() { return { ok: true }; },
	async transcribe(audio, opts) {
		const form = new FormData();
		form.append('audio', audio, 'audio.webm');
		form.append('providerId', 'openai');
		if (opts?.language) form.append('language', opts.language);
		if (opts?.diarize) form.append('diarize', String(opts.diarize));
		if (opts?.prompt) form.append('prompt', opts.prompt);
		const res = await fetch('/api/voice/transcribe', { method: 'POST', body: form });
		if (!res.ok) {
			const d = await res.json().catch(() => ({})) as { error?: string };
			throw new Error(`openai transcription failed: ${d.error ?? res.status}`);
		}
		return res.json();
	}
};

// Client-safe proxy: forwards transcription to /api/voice/transcribe?providerId=elevenlabs.
const elevenlabsProxy: TranscribeProvider = {
	id: 'elevenlabs',
	name: 'ElevenLabs Scribe',
	isLocal: false,
	capabilities: { diarize: true, maxDurationSec: 4 * 60 * 60 },
	async isAvailable() { return { ok: true }; },
	async transcribe(audio, opts) {
		const form = new FormData();
		form.append('audio', audio, 'audio.webm');
		form.append('providerId', 'elevenlabs');
		if (opts?.language) form.append('language', opts.language);
		if (opts?.diarize) form.append('diarize', String(opts.diarize));
		if (opts?.prompt) form.append('prompt', opts.prompt);
		const res = await fetch('/api/voice/transcribe', { method: 'POST', body: form });
		if (!res.ok) {
			const d = await res.json().catch(() => ({})) as { error?: string };
			throw new Error(`elevenlabs transcription failed: ${d.error ?? res.status}`);
		}
		return res.json();
	}
};

// Client-safe proxy: forwards intent classification to /api/voice/intent.
const openaiIntentProxy: IntentProvider = {
	id: 'openai',
	name: 'OpenAI GPT (cloud)',
	isLocal: false,
	async isAvailable() { return { ok: true }; },
	async classify(input) {
		const res = await fetch('/api/voice/intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...input, providerId: 'openai' })
		});
		if (!res.ok) {
			const d = await res.json().catch(() => ({})) as { error?: string };
			throw new Error(`openai classify failed: ${d.error ?? res.status}`);
		}
		return res.json();
	},
	async dispatch(transcript, tools, systemPrompt, model) {
		// Dispatch is routed through the /api/voice/dispatch server endpoint which
		// calls the real openai.ts provider with full credentials. This proxy only
		// exists on the client side and should not be called directly — the
		// voiceCapture store calls /api/voice/dispatch via llmDispatch() instead.
		// Stub throws to make misuse obvious.
		void transcript; void tools; void systemPrompt; void model;
		throw new Error('openaiIntentProxy.dispatch: use /api/voice/dispatch directly');
	}
};

export const sttProviderCatalog: TranscribeProvider[] = [
	voxtypeProxy,
	openaiSttProxy,
	elevenlabsProxy
];
export const llmProviderCatalog: IntentProvider[] = [ollamaProvider, openaiIntentProxy];
export const speakProviderCatalog: SpeakProvider[] = [];
