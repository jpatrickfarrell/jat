// Voice subsystem reactive store.
// Spec: ide/docs/prd-voice-subsystem.md §5.5
//
// Disabled-state invariant (§7.5): when enabled === false, init() is a cheap
// no-op. No probes, no listeners, no dynamic imports, no API key reads.

import type {
	TranscribeProvider,
	TranscribeResult,
	IntentProvider,
	IntentResult,
	SpeakProvider
} from './types';
import {
	sttProviderCatalog,
	llmProviderCatalog,
	speakProviderCatalog
} from './providers';

export type VoiceStatus = 'offline' | 'initializing' | 'ready' | 'degraded';

interface VoiceConfig {
	enabled: boolean;
	activeStt: string;
	activeLlm: string;
	activeTts: string | null;
	privacy: {
		offDeviceAudio: boolean;
		offDeviceText: boolean;
		offDeviceSpeech: boolean;
	};
	hotkey: string;
	inputDeviceId: string;
	providerOverrides: Record<string, Record<string, unknown>>;
}

interface ProviderProbeMeta {
	id: string;
	name: string;
	isLocal: boolean;
	available: boolean;
	reason?: string;
	capabilities?: TranscribeProvider['capabilities'];
}

interface ProvidersProbeResponse {
	stt: ProviderProbeMeta[];
	llm: ProviderProbeMeta[];
	speak: ProviderProbeMeta[];
}

const DEFAULT_CONFIG: VoiceConfig = Object.freeze({
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
}) as VoiceConfig;

// Must exceed the server's slowest provider probe (ElevenLabs = 1500ms) plus HTTP round-trip.
const PROBE_TIMEOUT_MS = 5000;

function cloneConfig(c: VoiceConfig): VoiceConfig {
	return JSON.parse(JSON.stringify(c));
}

async function fetchWithTimeout(url: string, timeoutMs: number, init?: RequestInit) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

class VoiceSubsystem {
	enabled = $state<boolean>(false);
	sttProviders = $state<TranscribeProvider[]>([]);
	llmProviders = $state<IntentProvider[]>([]);
	speakProviders = $state<SpeakProvider[]>([]);

	activeSttId = $state<string>(DEFAULT_CONFIG.activeStt);
	activeLlmId = $state<string>(DEFAULT_CONFIG.activeLlm);
	activeSpeakId = $state<string | null>(DEFAULT_CONFIG.activeTts);

	status = $state<VoiceStatus>('offline');

	#config: VoiceConfig = $state(cloneConfig(DEFAULT_CONFIG));
	#initPromise: Promise<void> | null = null;

	capabilities = $derived.by(() => {
		const stt = this.sttProviders.length > 0;
		const llm = this.llmProviders.length > 0;
		const diarize = this.sttProviders.some((p) => p.capabilities?.diarize === true);
		const speak = this.speakProviders.length > 0;
		const offDeviceAudio = this.#config.privacy.offDeviceAudio;
		const offDeviceText = this.#config.privacy.offDeviceText;
		const offDeviceSpeech = this.#config.privacy.offDeviceSpeech;
		return { stt, llm, diarize, speak, offDeviceAudio, offDeviceText, offDeviceSpeech };
	});

	getConfig(): VoiceConfig {
		return cloneConfig(this.#config);
	}

	async init(): Promise<void> {
		if (this.#initPromise) return this.#initPromise;
		this.#initPromise = this.#initInternal();
		await this.#initPromise;
	}

	async #initInternal(): Promise<void> {
		const config = await this.#readConfig();
		this.#applyConfig(config);

		// Cheap no-op path. §7.5 invariant: zero side effects when disabled.
		if (!config.enabled) {
			this.status = 'offline';
			this.sttProviders = [];
			this.llmProviders = [];
			this.speakProviders = [];
			return;
		}

		// Hold enabled=false while probing so voice UI doesn't appear until
		// providers are populated. Without this, the lazy-load in +layout.svelte
		// fires immediately and the user can attempt capture before sttProviders
		// is non-empty, producing a confusing "status=offline" error.
		this.enabled = false;
		this.status = 'initializing';
		await this.#probeAndPopulate();
		this.enabled = config.enabled;
	}

	async #readConfig(): Promise<VoiceConfig> {
		try {
			const res = await fetch('/api/config/voice');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (data?.config && typeof data.config === 'object') {
				return { ...DEFAULT_CONFIG, ...data.config };
			}
			return cloneConfig(DEFAULT_CONFIG);
		} catch {
			return cloneConfig(DEFAULT_CONFIG);
		}
	}

	#applyConfig(config: VoiceConfig): void {
		this.#config = config;
		this.enabled = config.enabled;
		this.activeSttId = config.activeStt;
		this.activeLlmId = config.activeLlm;
		this.activeSpeakId = config.activeTts;
	}

	async #probeAndPopulate(): Promise<void> {
		let probe: ProvidersProbeResponse | null = null;
		try {
			const res = await fetchWithTimeout('/api/voice/providers', PROBE_TIMEOUT_MS);
			if (res.ok) {
				probe = (await res.json()) as ProvidersProbeResponse;
			}
		} catch {
			// AbortError or network failure → degraded with empty registries.
		}

		const sttAvailable = new Set((probe?.stt ?? []).filter((p) => p.available).map((p) => p.id));
		const llmAvailable = new Set((probe?.llm ?? []).filter((p) => p.available).map((p) => p.id));
		const speakAvailable = new Set(
			(probe?.speak ?? []).filter((p) => p.available).map((p) => p.id)
		);

		this.sttProviders = sttProviderCatalog.filter((p) => sttAvailable.has(p.id));
		this.llmProviders = llmProviderCatalog.filter((p) => llmAvailable.has(p.id));
		this.speakProviders = speakProviderCatalog.filter((p) => speakAvailable.has(p.id));

		this.status = this.#deriveStatus(probe);
	}

	#deriveStatus(probe: ProvidersProbeResponse | null): VoiceStatus {
		if (this.sttProviders.length === 0 || this.llmProviders.length === 0) {
			return 'offline';
		}
		if (!probe) return 'degraded';
		// Only the ACTIVE providers determine health. Inactive providers that are
		// unavailable (no key, privacy gate, network) should not degrade the system.
		const activeSttOk = probe.stt.find((p) => p.id === this.activeSttId)?.available !== false;
		const activeLlmOk = probe.llm.find((p) => p.id === this.activeLlmId)?.available !== false;
		if (!activeSttOk || !activeLlmOk) return 'degraded';
		return 'ready';
	}

	async setEnabled(enabled: boolean): Promise<void> {
		const next: VoiceConfig = { ...cloneConfig(this.#config), enabled };
		await this.#persist(next);
		this.#applyConfig(next);

		if (!enabled) {
			this.status = 'offline';
			this.sttProviders = [];
			this.llmProviders = [];
			this.speakProviders = [];
			return;
		}

		// Re-init populates registries from probe. Reset memoized init so a
		// caller toggling enable→disable→enable retriggers the full setup path.
		this.#initPromise = null;
		this.status = 'initializing';
		await this.#probeAndPopulate();
	}

	async setActiveStt(id: string): Promise<void> {
		const next: VoiceConfig = { ...cloneConfig(this.#config), activeStt: id };
		await this.#persist(next);
		this.#applyConfig(next);
	}

	async setActiveLlm(id: string): Promise<void> {
		const next: VoiceConfig = { ...cloneConfig(this.#config), activeLlm: id };
		await this.#persist(next);
		this.#applyConfig(next);
	}

	async setActiveSpeak(id: string | null): Promise<void> {
		const next: VoiceConfig = { ...cloneConfig(this.#config), activeTts: id };
		await this.#persist(next);
		this.#applyConfig(next);
	}

	async setPrivacy(partial: Partial<VoiceConfig['privacy']>): Promise<void> {
		const next: VoiceConfig = cloneConfig(this.#config);
		next.privacy = { ...next.privacy, ...partial };
		await this.#persist(next);
		this.#applyConfig(next);
	}

	async setHotkey(hotkey: string): Promise<void> {
		const next: VoiceConfig = { ...cloneConfig(this.#config), hotkey };
		await this.#persist(next);
		this.#applyConfig(next);
	}

	async setInputDevice(deviceId: string): Promise<void> {
		const next: VoiceConfig = { ...cloneConfig(this.#config), inputDeviceId: deviceId };
		await this.#persist(next);
		this.#applyConfig(next);
	}

	async setProviderOverride(
		providerId: string,
		override: Record<string, unknown>
	): Promise<void> {
		const next: VoiceConfig = cloneConfig(this.#config);
		next.providerOverrides = {
			...next.providerOverrides,
			[providerId]: { ...(next.providerOverrides[providerId] ?? {}), ...override }
		};
		await this.#persist(next);
		this.#applyConfig(next);
	}

	// Re-runs the provider probe without touching enabled/disabled state. Used
	// by /config/voice's "Recheck" button and by enable-state recovery flows.
	async reprobe(): Promise<void> {
		if (!this.enabled) return;
		this.status = 'initializing';
		await this.#probeAndPopulate();
	}

	async #persist(config: VoiceConfig): Promise<void> {
		const res = await fetch('/api/config/voice', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(config)
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => '');
			throw new Error(`Failed to persist voice config: HTTP ${res.status} ${detail}`);
		}
	}

	async transcribe(
		audio: Blob,
		opts?: Parameters<TranscribeProvider['transcribe']>[1]
	): Promise<TranscribeResult> {
		const provider = this.sttProviders.find((p) => p.id === this.activeSttId);
		if (!provider) {
			throw new Error(
				`No STT provider available for id="${this.activeSttId}" (status=${this.status})`
			);
		}
		return provider.transcribe(audio, opts);
	}

	async classify<T>(
		input: Parameters<IntentProvider['classify']>[0]
	): Promise<IntentResult<T>> {
		const provider = this.llmProviders.find((p) => p.id === this.activeLlmId);
		if (!provider) {
			throw new Error(
				`No intent provider available for id="${this.activeLlmId}" (status=${this.status})`
			);
		}
		// Inject providerOverrides.{id}.model from voice.json so the provider
		// doesn't carry its own default. Caller-supplied input.model wins.
		const override = this.#config.providerOverrides[provider.id] as
			| { model?: string }
			| undefined;
		return provider.classify<T>({
			...input,
			model: input.model ?? override?.model
		});
	}

	async speak(
		text: string,
		opts?: Parameters<SpeakProvider['speak']>[1]
	): Promise<Blob> {
		if (this.activeSpeakId === null) {
			throw new Error('No TTS provider selected (activeSpeakId is null)');
		}
		const provider = this.speakProviders.find((p) => p.id === this.activeSpeakId);
		if (!provider) {
			throw new Error(
				`No TTS provider available for id="${this.activeSpeakId}" (status=${this.status})`
			);
		}
		return provider.speak(text, opts);
	}

	async testStt(): Promise<TranscribeResult> {
		return this.transcribe(buildSilentWav());
	}

	async testLlm(): Promise<IntentResult> {
		return this.classify({
			system: 'Reply with the JSON object {"ok": true} and nothing else.',
			transcript: 'voice subsystem self-test',
			context: '',
			schema: {
				type: 'object',
				properties: { ok: { type: 'boolean' } },
				required: ['ok']
			}
		});
	}
}

// Minimal silent 100ms 16kHz mono WAV used for canned testStt round-trips.
function buildSilentWav(): Blob {
	const sampleRate = 16000;
	const numSamples = Math.floor(sampleRate * 0.1);
	const dataSize = numSamples * 2;
	const buffer = new ArrayBuffer(44 + dataSize);
	const view = new DataView(buffer);

	const writeStr = (offset: number, s: string) => {
		for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
	};

	writeStr(0, 'RIFF');
	view.setUint32(4, 36 + dataSize, true);
	writeStr(8, 'WAVE');
	writeStr(12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeStr(36, 'data');
	view.setUint32(40, dataSize, true);

	return new Blob([buffer], { type: 'audio/wav' });
}

export const voice = new VoiceSubsystem();
