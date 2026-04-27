// Voxtype TranscribeProvider — wraps the ffmpeg + voxtype shell-out pipeline
// used by /api/voice/capture. Server-only: do not import from client code.
// The /api/voice/transcribe and /api/voice/providers endpoints consume this
// module directly. Spec: ide/docs/prd-voice-subsystem.md §5.1, §7.4

import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { promisify } from 'util';
import type { TranscribeProvider, TranscribeResult } from '../types';

const execAsync = promisify(exec);
const TEMP_DIR = '/tmp/jat-voice-capture';

mkdirSync(TEMP_DIR, { recursive: true });

// voxtype emits log lines on stdout alongside the transcript. Same patterns
// observed in /api/voice/capture: "Loading audio file: ...", "Audio format: ...",
// "Processing N samples...", ANSI-colored INFO lines. The transcript is the
// surviving content after log-pattern stripping.
function extractTranscript(stdout: string): string {
	const clean = stdout.replace(/\x1b\[[0-9;]*m/g, '');
	const lines = clean.split('\n').filter((line) => {
		const t = line.trim();
		if (!t) return false;
		if (/^Loading /i.test(t)) return false;
		if (/^Audio format/i.test(t)) return false;
		if (/^Processing \d/i.test(t)) return false;
		if (/\bINFO\b/.test(t)) return false;
		return true;
	});
	return lines.join(' ').trim();
}

export const voxtypeProvider: TranscribeProvider = {
	id: 'voxtype',
	name: 'Voxtype (local)',
	isLocal: true,
	capabilities: {
		diarize: false,
		maxDurationSec: 60
	},

	async isAvailable() {
		try {
			await execAsync('command -v voxtype', { timeout: 5_000 });
			return { ok: true };
		} catch {
			return { ok: false, reason: 'voxtype binary not found on PATH' };
		}
	},

	async transcribe(audio: Blob): Promise<TranscribeResult> {
		const start = Date.now();
		const buffer = Buffer.from(await audio.arrayBuffer());
		if (buffer.length === 0) {
			throw new Error('Empty audio blob');
		}

		const id = randomBytes(6).toString('hex');
		const rawPath = join(TEMP_DIR, `${id}.webm`);
		const wavPath = join(TEMP_DIR, `${id}.wav`);

		try {
			writeFileSync(rawPath, buffer);

			try {
				await execAsync(
					`ffmpeg -i "${rawPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`,
					{ timeout: 30_000 }
				);
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : String(e);
				throw new Error(`ffmpeg failed: ${msg}`);
			} finally {
				try { unlinkSync(rawPath); } catch {}
			}

			// 16kHz mono 16-bit PCM = 32 bytes/ms; the standard WAV header is 44 bytes.
			let durationMs = 0;
			try {
				const stats = statSync(wavPath);
				durationMs = Math.max(0, Math.round((stats.size - 44) / 32));
			} catch {}

			let transcript: string;
			try {
				const { stdout } = await execAsync(
					`voxtype transcribe "${wavPath}" 2>/dev/null`,
					{ timeout: 60_000, maxBuffer: 10 * 1024 * 1024 }
				);
				transcript = extractTranscript(stdout);
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : String(e);
				throw new Error(`voxtype transcription failed: ${msg}`);
			} finally {
				try { unlinkSync(wavPath); } catch {}
			}

			return {
				transcript,
				durationMs,
				providerLatencyMs: Date.now() - start
			};
		} catch (e) {
			try { unlinkSync(rawPath); } catch {}
			try { unlinkSync(wavPath); } catch {}
			throw e;
		}
	}
};

// Server-side transcription from an existing WAV file path. Used by the
// voice-inbox pipeline (voice-core.js) where audio is already converted to WAV
// on disk. This is the file-path variant of voxtypeProvider.transcribe() which
// takes a Blob from browser recordings. Returns the plain transcript string.
export async function transcribeWavFile(
	wavPath: string,
	opts?: { timeout?: number; maxBuffer?: number }
): Promise<string> {
	const timeout = opts?.timeout ?? 3_600_000;
	const maxBuffer = opts?.maxBuffer ?? 10 * 1024 * 1024;

	const { stdout } = await execAsync(
		`voxtype transcribe "${wavPath}" 2>/dev/null`,
		{ timeout, maxBuffer }
	);

	const text = extractTranscript(stdout);
	if (!text) {
		throw new Error('voxtype transcription produced no output');
	}
	return text;
}
