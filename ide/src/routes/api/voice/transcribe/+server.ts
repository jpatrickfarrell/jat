/**
 * Voice Transcribe API — provider-routed STT.
 *
 * POST /api/voice/transcribe
 * Body: multipart/form-data { audio: Blob, providerId?: string, language?, diarize?, prompt? }
 *
 * Wires voxtype (local, jat-68j78.4), openai whisper-1 (cloud, jat-68j78.14),
 * and elevenlabs scribe_v1 (cloud, jat-68j78.16). Cloud providers self-record
 * an audit line via recordCloudCall() per call; voxtype is local so no audit
 * entry is written. Unknown providerId → 400.
 *
 * Spec: ide/docs/prd-voice-subsystem.md §5.1, §7.4 (POST /api/voice/transcribe).
 */
import { json } from '@sveltejs/kit';
import type { TranscribeProvider } from '$lib/voice/types';
import { voxtypeProvider } from '$lib/voice/providers/voxtype';
import { openaiSttProvider } from '$lib/voice/providers/openai';
import { elevenlabsProvider } from '$lib/voice/providers/elevenlabs';

const PROVIDERS: Record<string, TranscribeProvider> = {
	voxtype: voxtypeProvider,
	openai: openaiSttProvider,
	elevenlabs: elevenlabsProvider
};

export async function POST({ request }: { request: Request }) {
	const contentType = request.headers.get('content-type') ?? '';

	let audio: Blob | null = null;
	let providerId = 'voxtype';
	let language: string | undefined;
	let diarize: boolean | undefined;
	let prompt: string | undefined;

	if (contentType.includes('multipart/form-data')) {
		let form: FormData;
		try {
			form = await request.formData();
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			return json({ error: `invalid multipart body: ${msg}` }, { status: 400 });
		}

		const audioField = form.get('audio');
		if (audioField instanceof Blob) {
			audio = audioField;
		}

		const pid = form.get('providerId');
		if (typeof pid === 'string' && pid.length > 0) providerId = pid;

		const lang = form.get('language');
		if (typeof lang === 'string' && lang.length > 0) language = lang;

		const diar = form.get('diarize');
		if (typeof diar === 'string') diarize = diar === 'true' || diar === '1';

		const pr = form.get('prompt');
		if (typeof pr === 'string' && pr.length > 0) prompt = pr;
	} else {
		// Raw audio body. providerId via query string (defaults to voxtype).
		const url = new URL(request.url);
		const pid = url.searchParams.get('providerId');
		if (pid && pid.length > 0) providerId = pid;
		const lang = url.searchParams.get('language');
		if (lang) language = lang;
		const diar = url.searchParams.get('diarize');
		if (diar !== null) diarize = diar === 'true' || diar === '1';
		const pr = url.searchParams.get('prompt');
		if (pr) prompt = pr;

		const buf = await request.arrayBuffer();
		if (buf.byteLength > 0) {
			audio = new Blob([buf]);
		}
	}

	if (!audio || audio.size === 0) {
		return json({ error: 'missing audio' }, { status: 400 });
	}

	const provider = PROVIDERS[providerId];
	if (!provider) {
		return json(
			{ error: `unknown providerId: ${providerId}` },
			{ status: 400 }
		);
	}

	try {
		const result = await provider.transcribe(audio, { language, diarize, prompt });
		return json(result);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return json({ error: `transcription failed: ${msg}` }, { status: 500 });
	}
}
