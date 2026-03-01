/**
 * Local Voice Transcription API
 *
 * Detects and uses the best available local transcription engine:
 *   1. voxtype  - Linux (Arch AUR: voxtype-bin)
 *   2. whisper-cli (whisper.cpp) - Cross-platform (brew install whisper-cpp, or build from source)
 *
 * No data leaves the machine - 100% private.
 *
 * POST /api/transcribe
 * Body: FormData with 'audio' file (WAV, WebM, MP3, etc.)
 * Returns: { text: "transcribed text", duration_ms: 1234, engine: "voxtype"|"whisper-cli" }
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

// Temp directory for audio files
const TEMP_DIR = join(tmpdir(), 'jat-transcribe');

// Transcription engine detection (cached after first check)
/** @type {{ engine: string; command: (wavPath: string) => string; version: string } | null} */
let detectedEngine = null;
let engineChecked = false;

/**
 * Detect which transcription engine is available on this system.
 * Checks once, caches the result.
 */
async function detectEngine() {
	if (engineChecked) return detectedEngine;
	engineChecked = true;

	// 1. Try voxtype (Linux)
	try {
		const { stdout } = await execAsync('voxtype --version 2>&1');
		detectedEngine = {
			engine: 'voxtype',
			command: (wavPath) => `voxtype --quiet transcribe "${wavPath}"`,
			version: stdout.trim()
		};
		return detectedEngine;
	} catch { /* not installed */ }

	// 2. Try whisper-cli (whisper.cpp) — check multiple locations
	const whisperPaths = [
		'whisper-cli',  // on PATH (e.g. Homebrew: brew install whisper-cpp)
		`${process.env.HOME}/.local/share/jat/whisper/build/bin/whisper-cli`,
		`${process.env.HOME}/.local/share/chezwizper/whisper/build/bin/whisper-cli`,
	];

	for (const cli of whisperPaths) {
		try {
			await execAsync(`"${cli}" --help 2>&1 | head -1`);
			// Find a model file nearby or in standard locations
			const model = findWhisperModel(cli);
			if (model) {
				detectedEngine = {
					engine: 'whisper-cli',
					command: (wavPath) => `"${cli}" -m "${model}" -f "${wavPath}" -nt -np --no-prints -l en 2>/dev/null`,
					version: cli
				};
				return detectedEngine;
			}
		} catch { /* not at this path */ }
	}

	return null;
}

/**
 * Find a whisper model file for a given whisper-cli path
 * @param {string} cliPath
 * @returns {string|null}
 */
function findWhisperModel(cliPath) {
	// Check common model locations
	const modelPaths = [
		// Same directory structure as the CLI
		cliPath.replace(/\/build\/bin\/whisper-cli$/, '/models/ggml-large-v3-turbo-q5_1.bin'),
		cliPath.replace(/\/build\/bin\/whisper-cli$/, '/models/ggml-large-v3-turbo.bin'),
		cliPath.replace(/\/build\/bin\/whisper-cli$/, '/models/ggml-base.en.bin'),
		// Homebrew location
		'/usr/local/share/whisper-cpp/models/ggml-base.en.bin',
		'/opt/homebrew/share/whisper-cpp/models/ggml-base.en.bin',
	];

	for (const modelPath of modelPaths) {
		if (existsSync(modelPath)) return modelPath;
	}
	return null;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const startTime = Date.now();

	const engine = await detectEngine();
	if (!engine) {
		return json({
			error: 'No transcription engine found. Install voxtype (Linux) or whisper.cpp (cross-platform).',
			details: 'Supported engines: voxtype (yay -S voxtype-bin), whisper-cli (brew install whisper-cpp)'
		}, { status: 500 });
	}

	try {
		// Ensure temp directory exists
		if (!existsSync(TEMP_DIR)) {
			await mkdir(TEMP_DIR, { recursive: true });
		}

		// Parse form data
		const formData = await request.formData();
		const audioFile = formData.get('audio');

		if (!audioFile || !(audioFile instanceof File)) {
			return json({ error: 'No audio file provided' }, { status: 400 });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const inputPath = join(TEMP_DIR, `input-${timestamp}.webm`);
		const wavPath = join(TEMP_DIR, `input-${timestamp}.wav`);

		// Write uploaded audio to temp file
		const arrayBuffer = await audioFile.arrayBuffer();
		await writeFile(inputPath, Buffer.from(arrayBuffer));

		try {
			// Convert to WAV (16kHz mono) — required by all engines
			await execAsync(`ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}" 2>/dev/null`);

			// Run detected transcription engine
			const { stdout } = await execAsync(
				engine.command(wavPath),
				{ timeout: 120000 }
			);

			const text = stdout.trim();
			const duration = Date.now() - startTime;

			return json({
				text,
				duration_ms: duration,
				engine: engine.engine
			});

		} finally {
			// Cleanup temp files
			try {
				await unlink(inputPath);
				await unlink(wavPath);
			} catch {
				// Ignore cleanup errors
			}
		}

	} catch (error) {
		console.error('Transcription error:', error);
		const err = error instanceof Error ? error : new Error(String(error));
		const execErr = /** @type {{ killed?: boolean }} */ (error);

		if (execErr.killed || err.message?.includes('timeout')) {
			return json({
				error: 'Transcription timed out',
				details: 'Audio may be too long or system is busy'
			}, { status: 504 });
		}

		return json({
			error: 'Transcription failed',
			details: err.message
		}, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	// Health check — detect available engine
	const engine = await detectEngine();

	if (engine) {
		return json({
			status: 'ok',
			engine: engine.engine,
			version: engine.version,
			message: `${engine.engine} is ready`
		});
	}

	return json({
		status: 'error',
		engine: null,
		error: 'No transcription engine found. Install voxtype or whisper-cli.'
	}, { status: 500 });
}
