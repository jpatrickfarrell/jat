/**
 * Voice Capture API — synchronous push-to-talk transcription.
 *
 * POST /api/voice/capture
 * Body: raw audio bytes (WebM/OGG from MediaRecorder)
 *
 * Converts to 16kHz mono WAV via ffmpeg, runs voxtype, returns transcript.
 */
import { json } from '@sveltejs/kit';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const TEMP_DIR = '/tmp/jat-voice-capture';

mkdirSync(TEMP_DIR, { recursive: true });

// voxtype outputs log lines to stdout alongside the transcript.
// Log patterns observed: "Loading audio file: ...", "Audio format: ...",
// "Processing N samples...", ANSI-colored INFO lines.
// The transcript appears after an empty line as the last content.
function extractTranscript(stdout: string): string {
	// Strip ANSI escape codes
	const clean = stdout.replace(/\x1b\[[0-9;]*m/g, '');
	// Filter out known log line patterns
	const lines = clean.split('\n').filter(line => {
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

export async function POST({ request }: { request: Request }) {
	const buffer = Buffer.from(await request.arrayBuffer());
	if (buffer.length === 0) {
		return json({ error: 'Empty audio' }, { status: 400 });
	}

	const id = randomBytes(6).toString('hex');
	const rawPath = join(TEMP_DIR, `${id}.webm`);
	const wavPath = join(TEMP_DIR, `${id}.wav`);

	try {
		writeFileSync(rawPath, buffer);

		try {
			await execAsync(`ffmpeg -i "${rawPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
				timeout: 30_000
			});
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			return json({ error: `ffmpeg failed: ${msg}` }, { status: 500 });
		} finally {
			try { unlinkSync(rawPath); } catch {}
		}

		let transcript: string;
		try {
			const { stdout } = await execAsync(`voxtype transcribe "${wavPath}" 2>/dev/null`, {
				timeout: 60_000,
				maxBuffer: 10 * 1024 * 1024
			});
			transcript = extractTranscript(stdout);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			return json({ error: `transcription failed: ${msg}` }, { status: 500 });
		} finally {
			try { unlinkSync(wavPath); } catch {}
		}

		return json({ transcript });
	} catch (e: unknown) {
		try { unlinkSync(rawPath); } catch {}
		try { unlinkSync(wavPath); } catch {}
		const msg = e instanceof Error ? e.message : String(e);
		return json({ error: msg }, { status: 500 });
	}
}
