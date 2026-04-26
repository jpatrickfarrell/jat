// Browser-side debug ring buffer for the Voice Subsystem.
// Spec: ide/docs/prd-voice-subsystem.md §8.1
//
// Fixed-size ring (N=100), populated by the voice store on every call —
// local AND cloud, including probe and test round-trips — so a developer
// inspecting `window.__jatVoiceSubsystem` from DevTools can see the
// recent history across provider switches. Only populated when
// `voice.enabled === true`; the gate lives at call sites.
//
// Complementary to:
//   - window.__jatVoiceDebug          (jat-107ll matcher, fast-match only)
//   - window.__jatVoiceInterpretDebug (Siri interpret path)
//
// The on-disk audit log (~/.config/jat/voice-audit.jsonl) is the persistent
// user-facing record; this buffer is dev-facing and ephemeral (cleared on
// page reload).

export type VoiceDebugOp = 'transcribe' | 'classify' | 'speak' | 'probe' | 'test';

export interface VoiceDebugEntry {
	/** Unix epoch ms. */
	ts: number;
	/** ISO-8601 string, derived from `ts`. */
	iso: string;
	op: VoiceDebugOp;
	providerId: string;
	latencyMs: number;
	ok: boolean;
	errorClass?: string;
	/** Request payload size in bytes (audio bytes for transcribe, prompt chars for classify, …). */
	bytesIn?: number;
	/** Response payload size in bytes (transcript chars, raw LLM response, audio bytes for speak). */
	bytesOut?: number;
}

const BUFFER_SIZE = 100;

const buffer: VoiceDebugEntry[] = [];
let writeIndex = 0;

/**
 * Append an entry to the ring. `ts`/`iso` are auto-filled when omitted.
 */
export function recordCall(
	entry: Omit<VoiceDebugEntry, 'ts' | 'iso'> & Partial<Pick<VoiceDebugEntry, 'ts' | 'iso'>>
): void {
	const ts = entry.ts ?? Date.now();
	const iso = entry.iso ?? new Date(ts).toISOString();
	const full: VoiceDebugEntry = { ...entry, ts, iso } as VoiceDebugEntry;

	if (buffer.length < BUFFER_SIZE) {
		buffer.push(full);
	} else {
		buffer[writeIndex] = full;
		writeIndex = (writeIndex + 1) % BUFFER_SIZE;
	}

	exposeOnWindow();
}

/** Snapshot in chronological (oldest → newest) order. */
export function getDebugLog(): VoiceDebugEntry[] {
	if (buffer.length < BUFFER_SIZE) return [...buffer];
	return [...buffer.slice(writeIndex), ...buffer.slice(0, writeIndex)];
}

/** Most recent N entries (newest → oldest). */
export function getRecent(n: number = 10): VoiceDebugEntry[] {
	const log = getDebugLog();
	return log.slice(-Math.max(0, n)).reverse();
}

export function clearDebugLog(): void {
	buffer.length = 0;
	writeIndex = 0;
	exposeOnWindow();
}

function exposeOnWindow(): void {
	if (typeof window === 'undefined') return;
	(window as unknown as { __jatVoiceSubsystem?: VoiceDebugEntry[] }).__jatVoiceSubsystem =
		getDebugLog();
}

// First-load assignment so DevTools always has the property to inspect, even
// before any calls have been made.
if (typeof window !== 'undefined') {
	exposeOnWindow();
}
