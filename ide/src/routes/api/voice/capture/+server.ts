/**
 * Voice Capture API — synchronous push-to-talk transcription.
 *
 * POST /api/voice/capture
 * Body: raw audio bytes (WebM/OGG from MediaRecorder)
 * Content-Type: audio/webm or audio/ogg
 *
 * Converts to 16kHz mono WAV via ffmpeg, runs voxtype, returns transcript.
 * Designed to complete in < 10s for short push-to-talk recordings.
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

		// Convert to 16kHz mono WAV
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

		// Transcribe via voxtype
		let transcript: string;
		try {
			const { stdout } = await execAsync(`voxtype transcribe "${wavPath}" 2>/dev/null`, {
				timeout: 60_000,
				maxBuffer: 10 * 1024 * 1024
			});
			transcript = stdout.trim();
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
