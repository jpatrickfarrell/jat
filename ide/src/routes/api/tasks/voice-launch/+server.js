/**
 * Voice-to-Launch API Route
 *
 * Same pipeline as /api/tasks/voice (transcribe → organize → voice timeline),
 * but after tasks are added to the inbox this route ALSO immediately:
 *   1. Picks the highest-priority task (lowest priority number) from the batch
 *   2. Creates it in the project's JAT task database
 *   3. POSTs /api/work/spawn to launch an agent on it
 *
 * Use case: the user records one clear action item and wants an agent on it
 * immediately, without stopping to triage the voice inbox first.
 *
 * POST /api/tasks/voice-launch
 * OPTIONS /api/tasks/voice-launch - CORS preflight (for jat-feedback widget)
 *
 * Body: JSON { text, title?, priority? }  OR  audio file (multipart/raw)
 */
import { json } from '@sveltejs/kit';
import { createTask } from '$lib/server/jat-tasks.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { buildTaskIdentity } from '$lib/server/task-identity.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../agents/+server.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';
import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import {
	TEMP_DIR,
	vlog,
	loadProjects,
	transcribe,
	organizeTranscript,
	appendToVoiceTimeline
} from '$lib/server/voice-pipeline.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Select the most actionable task from an organized batch.
 * Priority scale: 0=critical ... 4=lowest. Lowest number wins.
 * Ties broken by original array order (ollama usually lists urgent first).
 * @param {Array<any>} tasks
 */
function pickLaunchTask(tasks) {
	let best = null;
	let bestPriority = Infinity;
	for (const t of tasks) {
		const p = typeof t?.priority === 'number' ? t.priority : 2;
		if (p < bestPriority) {
			best = t;
			bestPriority = p;
		}
	}
	return best;
}

/**
 * Resolve a project name (as returned by ollama) to an on-disk project path.
 * Falls back to the IDE's current working project.
 * @param {string|undefined} projectName
 */
async function resolveProjectPath(projectName) {
	if (projectName) {
		try {
			const info = await getProjectPath(projectName);
			if (info?.exists && info.path) return { path: info.path, name: projectName };
		} catch {}
	}
	const fallback = process.cwd().replace(/\/ide$/, '');
	const fallbackName = fallback.split('/').filter(Boolean).pop() || 'jat';
	return { path: fallback, name: fallbackName };
}

/**
 * Create the highest-priority task and spawn an agent on it.
 * Non-throwing: logs and returns on any failure so the voice inbox still
 * gets its entries even if launch fails.
 * @param {Array<any>} tasks
 * @param {string} origin - URL origin for the spawn API call
 */
async function launchTopTask(tasks, origin) {
	const pick = pickLaunchTask(tasks);
	if (!pick) {
		vlog('launch: no task to spawn');
		return null;
	}

	const { path: projectPath, name: projectName } = await resolveProjectPath(pick.project);

	const priority = typeof pick.priority === 'number'
		? Math.max(0, Math.min(4, pick.priority))
		: 2;

	const labels = Array.isArray(pick.labels)
		? pick.labels
		: typeof pick.labels === 'string'
			? pick.labels.split(',').map((l) => l.trim()).filter(Boolean)
			: [];
	if (!labels.includes('voice')) labels.push('voice');

	const identity = buildTaskIdentity({ source: 'voice' });
	const sqliteCreator = identity.creator.email || identity.creator.name || identity.creator.source;

	let created;
	try {
		created = await createTask({
			projectPath,
			title: pick.title || 'Voice launch task',
			description: pick.description || pick.context || '',
			type: pick.type || 'task',
			priority,
			labels,
			deps: [],
			assignee: null,
			notes: '',
			creator: sqliteCreator,
			approver: sqliteCreator
		});
	} catch (e) {
		vlog(`launch: createTask failed: ${e?.message || e}`);
		return null;
	}

	invalidateCache.tasks();
	invalidateCache.agents();
	_resetTaskCache();
	emitEvent({
		type: 'task_created',
		source: 'voice_launch_api',
		data: { taskId: created.id, title: created.title, type: created.issue_type, priority, labels }
	});

	vlog(`launch: created ${created.id} in ${projectName} — spawning agent`);

	try {
		const resp = await fetch(`${origin}/api/work/spawn`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				taskId: created.id,
				project: projectName,
				attach: false
			})
		});
		if (!resp.ok) {
			const body = await resp.text().catch(() => '');
			vlog(`launch: spawn returned ${resp.status}: ${body.slice(0, 200)}`);
			return { taskId: created.id, project: projectName, spawned: false };
		}
		const spawnResult = await resp.json().catch(() => ({}));
		vlog(`launch: spawned ${spawnResult?.session?.sessionName || 'agent'} for ${created.id}`);
		return {
			taskId: created.id,
			project: projectName,
			spawned: true,
			agentName: spawnResult?.session?.agentName,
			sessionName: spawnResult?.session?.sessionName
		};
	} catch (e) {
		vlog(`launch: spawn request failed: ${e?.message || e}`);
		return { taskId: created.id, project: projectName, spawned: false };
	}
}

/**
 * Full pipeline: organize transcript → append to voice timeline → launch top task.
 * @param {string} text
 * @param {string} origin
 */
async function organizeAndLaunch(text, origin) {
	const projects = loadProjects();
	const { tasks, summary, title, knowledgeBase } = await organizeTranscript(text, projects);
	appendToVoiceTimeline(tasks, text, summary, title, knowledgeBase);
	vlog(`organized ${tasks.length} task(s) into voice inbox — launching top task`);
	await launchTopTask(tasks, origin);
}

/**
 * Audio branch: convert → transcribe → organize → launch.
 * Mirrors transcribeAndOrganize() from /api/tasks/voice but calls
 * organizeAndLaunch() at the end.
 * @param {string} audioPath
 * @param {string} origin
 */
function transcribeAndLaunch(audioPath, origin) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `launch-${id}.wav`);

	vlog(`voice-launch: received audio ${audioPath}`);

	exec(
		`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`,
		{ timeout: 120_000 },
		async (convertErr) => {
			try { unlinkSync(audioPath); } catch {}

			if (convertErr) {
				vlog(`voice-launch: ffmpeg conversion failed: ${convertErr.message}`);
				try { unlinkSync(wavPath); } catch {}
				return;
			}

			vlog('voice-launch: transcribing with voxtype...');
			let text;
			try {
				text = await transcribe(wavPath);
			} catch (transcribeErr) {
				vlog(`voice-launch: transcription failed: ${transcribeErr.message}`);
				try { unlinkSync(wavPath); } catch {}
				return;
			}
			try { unlinkSync(wavPath); } catch {}

			vlog(`voice-launch: transcription complete (${text.length} chars)`);

			try {
				await organizeAndLaunch(text, origin);
			} catch (organizeErr) {
				vlog(`voice-launch: organize/launch failed: ${organizeErr.message}`);
			}
		}
	);
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url }) {
	const contentType = request.headers.get('content-type') || '';
	const origin = url.origin;

	try {
		if (contentType.includes('application/json')) {
			const body = await request.json();
			const text = body.text?.trim();

			if (!text) {
				return json(
					{ error: true, message: 'Missing "text" field' },
					{ status: 400, headers: CORS_HEADERS }
				);
			}

			// Fire-and-forget: caller gets 202 immediately, launch happens in background.
			organizeAndLaunch(text, origin).catch((err) => {
				vlog(`voice-launch: text pipeline failed: ${err?.message || err}`);
			});

			return json(
				{
					success: true,
					message: 'Voice note received — organizing and launching agent in background.'
				},
				{ status: 202, headers: CORS_HEADERS }
			);
		}

		// Audio file branch
		mkdirSync(TEMP_DIR, { recursive: true });
		let audioTempPath = '';

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') || formData.get('audio');

			if (!file || !(file instanceof File)) {
				return json(
					{ error: true, message: 'Missing audio file' },
					{ status: 400, headers: CORS_HEADERS }
				);
			}

			const ext = file.name?.split('.').pop() || 'm4a';
			audioTempPath = join(TEMP_DIR, `${randomBytes(8).toString('hex')}.${ext}`);
			writeFileSync(audioTempPath, Buffer.from(await file.arrayBuffer()));
		} else {
			const buffer = Buffer.from(await request.arrayBuffer());
			if (buffer.length === 0) {
				return json(
					{ error: true, message: 'Empty request body' },
					{ status: 400, headers: CORS_HEADERS }
				);
			}

			const ext = contentType.includes('m4a') ? 'm4a'
				: contentType.includes('mp4') ? 'mp4'
				: contentType.includes('mp3') || contentType.includes('mpeg') ? 'mp3'
				: contentType.includes('wav') ? 'wav'
				: contentType.includes('webm') ? 'webm'
				: 'm4a';

			audioTempPath = join(TEMP_DIR, `${randomBytes(8).toString('hex')}.${ext}`);
			writeFileSync(audioTempPath, buffer);
		}

		try {
			const sz = statSync(audioTempPath).size;
			vlog(`voice-launch: audio received (${(sz / 1024).toFixed(0)}KB) — queuing transcription`);
		} catch {
			vlog('voice-launch: audio received — queuing transcription');
		}

		transcribeAndLaunch(audioTempPath, origin);

		return json(
			{
				success: true,
				message: 'Recording received — transcribing and launching agent in background.'
			},
			{ status: 202, headers: CORS_HEADERS }
		);
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice-launch] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
