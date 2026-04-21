/**
 * Push-to-talk voice capture store.
 *
 * Usage:
 *   - Call startCapture() on keydown of the push-to-talk hotkey.
 *   - Call stopCapture() on keyup.
 *   - Call cancelCapture() to abort without transcribing.
 *   - Read voiceState, transcript, and micPermission reactively.
 *
 * When a transcript returns from /api/voice/capture, the matcher
 * (`ide/src/lib/voice/utteranceMatcher.ts`) runs against the current route's
 * vocabulary. If confidence ≥ 0.7 the matched shortcut is dispatched via the
 * voice action registry (same code path as a keystroke); otherwise the raw
 * transcript surfaces so the user can see why.
 */
import { browser } from '$app/environment';
import {
	matchUtterance,
	MATCH_CONFIDENCE_THRESHOLD,
	type MatchResult
} from '$lib/voice/utteranceMatcher';
import { dispatchMatch } from '$lib/voice/dispatchMatch';
import { recordMatch } from '$lib/voice/matchDebugBuffer';

export type VoiceState = 'idle' | 'listening' | 'transcribing' | 'matched' | 'no-match';
export type MicPermission = 'unknown' | 'granted' | 'denied';

// Reactive state
let voiceState = $state<VoiceState>('idle');
let transcript = $state('');
let micPermission = $state<MicPermission>('unknown');
let errorMessage = $state('');
let lastMatch = $state<MatchResult | null>(null);

// Internal recording state
let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let cancelled = false;
let stream: MediaStream | null = null;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

export function getVoiceState(): VoiceState { return voiceState; }
export function getTranscript(): string { return transcript; }
export function getMicPermission(): MicPermission { return micPermission; }
export function getErrorMessage(): string { return errorMessage; }
export function getLastMatch(): MatchResult | null { return lastMatch; }

export async function startCapture(): Promise<void> {
	if (!browser) return;
	if (voiceState === 'listening') return;

	cancelled = false;
	transcript = '';
	errorMessage = '';

	// Request mic access
	try {
		stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		micPermission = 'granted';
	} catch {
		micPermission = 'denied';
		errorMessage = 'Microphone access denied. Enable microphone permission to use push-to-talk.';
		return;
	}

	chunks = [];
	mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });

	mediaRecorder.ondataavailable = (e) => {
		if (e.data.size > 0) chunks.push(e.data);
	};

	mediaRecorder.onstop = async () => {
		stopStream();
		if (cancelled || chunks.length === 0) {
			voiceState = 'idle';
			return;
		}

		voiceState = 'transcribing';

		const mimeType = mediaRecorder?.mimeType || 'audio/webm';
		const blob = new Blob(chunks, { type: mimeType });
		chunks = [];

		try {
			const res = await fetch('/api/voice/capture', {
				method: 'POST',
				headers: { 'Content-Type': mimeType },
				body: blob
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				errorMessage = data.error || `Transcription failed (${res.status})`;
				voiceState = 'no-match';
				scheduleReset();
				return;
			}

			const data = await res.json();
			const text = (data.transcript ?? '').trim();

			if (!text) {
				lastMatch = null;
				voiceState = 'no-match';
				scheduleReset();
				return;
			}

			transcript = text;

			// Run the matcher against the current route's vocabulary.
			const route = typeof window !== 'undefined' ? window.location.pathname : '';
			const result = matchUtterance(text, route);
			lastMatch = result;

			if (result.entry && result.confidence >= MATCH_CONFIDENCE_THRESHOLD) {
				// Dispatch the matched shortcut. Preferred path is the registered
				// action handler (same code as a keystroke); fallback is a
				// KeyboardEvent for nav/route-scoped shortcuts.
				const dispatched = await dispatchMatch(result.entry);
				recordMatch(result, route, dispatched);
				voiceState = 'matched';
			} else {
				recordMatch(result, route, 'none');
				voiceState = 'no-match';
			}

			scheduleReset();
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Network error';
			voiceState = 'no-match';
			scheduleReset();
		}
	};

	mediaRecorder.start();
	voiceState = 'listening';

	// Fallback: auto-stop after 30s in case keyup never fires
	autoStopTimer = setTimeout(() => stopCapture(), 30_000);
}

export function stopCapture(): void {
	clearAutoStop();
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		mediaRecorder.stop();
	} else {
		stopStream();
		voiceState = 'idle';
	}
}

export function cancelCapture(): void {
	clearAutoStop();
	cancelled = true;
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		mediaRecorder.stop();
	} else {
		stopStream();
		voiceState = 'idle';
	}
}

export function resetVoiceState(): void {
	voiceState = 'idle';
	transcript = '';
	errorMessage = '';
	lastMatch = null;
}

function clearAutoStop(): void {
	if (autoStopTimer) {
		clearTimeout(autoStopTimer);
		autoStopTimer = null;
	}
}

function stopStream(): void {
	if (stream) {
		stream.getTracks().forEach(t => t.stop());
		stream = null;
	}
}

function scheduleReset(ms = 3000): void {
	setTimeout(() => {
		if (voiceState === 'matched' || voiceState === 'no-match') {
			voiceState = 'idle';
			transcript = '';
			errorMessage = '';
			lastMatch = null;
		}
	}, ms);
}

function getSupportedMimeType(): string {
	const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
	for (const type of candidates) {
		if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
			return type;
		}
	}
	return '';
}
