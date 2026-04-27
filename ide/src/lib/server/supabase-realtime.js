/**
 * Supabase Realtime sync service
 *
 * Replaces the 5-minute Supabase polling cycle with persistent Realtime
 * WebSocket connections — one per configured Supabase project URL.
 *
 * Responsibilities:
 * 1. GENERAL SYNC   — project_tasks INSERT (status=statusNew, not voice) → JAT SQLite
 * 2. VOICE HANDLER  — INSERT where source='voice', status='transcribing'
 *                     → download audio → transcribe → organizeTranscript()
 *                     → if tasks[]: INSERT N child rows + PATCH placeholder to status='voice_split'
 *                     → else: PATCH placeholder {title, description, status:'open'}
 * 3. UPDATE SYNC    — status changes → JAT task
 * 4. BOOT CATCH-UP  — on start: process missed records and stuck voice records (>30s)
 * 5. STALE CLEANUP  — voice records stuck >5min → PATCH status='failed'
 *
 * Started from ide/src/hooks.server.js on IDE boot.
 */
import WebSocket from 'ws';
import { readFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { exec, execFileSync } from 'child_process';
import { randomBytes } from 'crypto';
import {
	transcribe,
	organizeTranscript,
	vlog,
	loadProjects,
	TEMP_DIR
} from './voice-pipeline.js';

const CREDS_PATH = join(homedir(), '.config/jat/credentials.json');
const INTEGRATIONS_PATH = join(homedir(), '.config/jat/integrations.json');
const PROJECTS_PATH = join(homedir(), '.config/jat/projects.json');

/** @type {Map<string, {ws: WebSocket, close: () => void, connected: boolean}>} */
const connections = new Map();

/** Row IDs currently being voice-transcribed (prevents concurrent duplicate work) */
const processingVoice = new Set();

let staleCleanupInterval = null;
let isRunning = false;

// ─── Credential & config helpers ──────────────────────────────────────────────

function readProjectSecret(project, key) {
	try {
		const creds = JSON.parse(readFileSync(CREDS_PATH, 'utf-8'));
		return creds.projectSecrets?.[project]?.[key]?.value || null;
	} catch {
		return null;
	}
}

function resolveServiceKey(source) {
	if (source.project) {
		const key = readProjectSecret(source.project, 'supabase_service_role_key');
		if (key) return key;
	}
	if (source.secretName) {
		try {
			return execFileSync('jat-secret', [source.secretName], {
				encoding: 'utf-8',
				timeout: 5000
			}).trim();
		} catch {
			return null;
		}
	}
	return null;
}

function resolveProjectUrl(source) {
	if (source.projectUrl) return source.projectUrl;
	if (source.project) {
		const url = readProjectSecret(source.project, 'supabase_url');
		if (url) return url;
	}
	return null;
}

function getProjectPath(projectName) {
	try {
		const config = JSON.parse(readFileSync(PROJECTS_PATH, 'utf-8'));
		return config.projects?.[projectName]?.path || null;
	} catch {
		return null;
	}
}

function loadSupabaseSources() {
	try {
		if (!existsSync(INTEGRATIONS_PATH)) return [];
		const config = JSON.parse(readFileSync(INTEGRATIONS_PATH, 'utf-8'));
		return (config.sources || []).filter((s) => s.type === 'supabase' && s.enabled !== false);
	} catch (err) {
		console.error('[supabase-rt] Failed to load integrations.json:', err.message);
		return [];
	}
}

// ─── Supabase REST API ────────────────────────────────────────────────────────

async function supabaseRequest(projectUrl, serviceKey, path, options = {}) {
	const url = `${projectUrl}/rest/v1/${path}`;
	const res = await fetch(url, {
		method: options.method || 'GET',
		headers: {
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			'Content-Type': 'application/json',
			Prefer: options.prefer || 'return=representation',
			...options.headers
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
		signal: AbortSignal.timeout(30_000)
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Supabase REST error (${res.status}): ${text}`);
	}
	const ct = res.headers.get('content-type') || '';
	return ct.includes('application/json') ? res.json() : null;
}

async function getStorageSignedUrl(projectUrl, serviceKey, bucket, storagePath) {
	try {
		const res = await fetch(`${projectUrl}/storage/v1/object/sign/${bucket}/${storagePath}`, {
			method: 'POST',
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ expiresIn: 3600 }),
			signal: AbortSignal.timeout(10_000)
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data.signedURL ? `${projectUrl}/storage/v1${data.signedURL}` : null;
	} catch {
		return null;
	}
}

// ─── Task creation ────────────────────────────────────────────────────────────

function buildDescription(source, row) {
	if (source.descriptionTemplate) {
		// Pre-process virtual columns (mirrors supabase ingest adapter)
		const templateRow = { ...row };
		if (Array.isArray(row.selected_elements) && row.selected_elements.length > 0) {
			const lines = row.selected_elements.map(
				(el, i) =>
					`${i + 1}. \`${el.selector || el.tagName || 'element'}\`${el.textContent ? ` — "${el.textContent.slice(0, 80)}"` : ''}`
			);
			templateRow.selected_elements_formatted = '**Selected Elements:**\n' + lines.join('\n');
		} else {
			templateRow.selected_elements_formatted = '';
		}
		if (Array.isArray(row.console_logs) && row.console_logs.length > 0) {
			const errors = row.console_logs.filter((l) => l.type === 'error' || l.type === 'warn');
			const recent = row.console_logs.slice(-10);
			const seen = new Set();
			const combined = [];
			for (const log of [...errors, ...recent]) {
				const key = `${log.timestamp || ''}|${log.message || ''}`;
				if (!seen.has(key)) {
					seen.add(key);
					combined.push(log);
				}
			}
			const selected = combined.slice(-20);
			templateRow.console_logs_formatted = `**Console Logs** (${row.console_logs.length} total, ${selected.length} shown):\n${selected.map((l) => `- [${l.type || 'log'}] ${String(l.message || '').substring(0, 500)}`).join('\n')}`;
		} else {
			templateRow.console_logs_formatted = '';
		}
		return source.descriptionTemplate.replace(/\{(\w+)\}/g, (_, key) => {
			const val = templateRow[key];
			if (val === null || val === undefined) return '';
			if (typeof val === 'object') return JSON.stringify(val);
			return String(val);
		});
	}
	return row.description ? String(row.description) : '';
}

/**
 * Create a JAT task via jt CLI.
 * @returns {string|null} task ID or null on failure
 */
function createJatTask(source, row) {
	const projectPath = getProjectPath(source.project);
	if (!projectPath) {
		console.error(`[supabase-rt] No project path configured for "${source.project}"`);
		return null;
	}

	const defaults = source.taskDefaults || {};
	const titleCol = source.titleColumn || 'title';
	const title = (row[titleCol] || 'Untitled').substring(0, 200);
	const type = defaults.type || 'task';
	const priority = String(defaults.priority ?? 2);
	const labels = (defaults.labels || []).join(',');
	const description = buildDescription(source, row);

	const args = ['create', title, '--type', type, '--priority', priority, '--description', description];
	if (labels) args.push('--labels', labels);

	try {
		const output = execFileSync('jt', args, {
			encoding: 'utf-8',
			timeout: 15000,
			cwd: projectPath
		}).trim();
		const match = output.match(/^Created\s+(\S+):/);
		if (!match) {
			console.error(`[supabase-rt] Unexpected jt output: ${output}`);
			return null;
		}
		return match[1];
	} catch (err) {
		console.error(`[supabase-rt] jt create failed for "${title}":`, err.message);
		return null;
	}
}

async function markIngested(source, row, taskId, serviceKey) {
	const projectUrl = resolveProjectUrl(source);
	if (!projectUrl || !row.id) return;

	const statusCol = source.statusColumn || 'status';
	const statusDone = source.statusDone;
	const taskIdCol = source.taskIdColumn || 'jat_task_id';

	const body = {};
	if (statusDone) body[statusCol] = statusDone;
	if (taskIdCol) body[taskIdCol] = taskId;
	if (Object.keys(body).length === 0) return;

	try {
		await supabaseRequest(projectUrl, serviceKey, `${source.table}?id=eq.${encodeURIComponent(row.id)}`, {
			method: 'PATCH',
			body
		});
	} catch (err) {
		console.error(`[supabase-rt] Failed to mark row ${row.id} as ingested:`, err.message);
	}
}

// ─── Voice pipeline ───────────────────────────────────────────────────────────

async function handleVoiceRecord(source, row, serviceKey, projectUrl) {
	const rowId = row.id;
	if (processingVoice.has(rowId)) return;
	processingVoice.add(rowId);

	vlog(`[supabase-rt] Voice ${rowId}: starting transcription pipeline`);

	try {
		// 1. Get signed URL for the audio file in Supabase Storage
		const audioPath = row.audio_url;
		if (!audioPath) throw new Error('audio_url is null — cannot transcribe');

		// audio_url may be a full path like "voice-recordings/{project}/{uuid}.webm"
		// or just the filename. Strip bucket prefix if present.
		const storagePath = audioPath.replace(/^voice-recordings\//, '');
		const signedUrl = await getStorageSignedUrl(projectUrl, serviceKey, 'voice-recordings', storagePath);
		if (!signedUrl) throw new Error('Could not get signed URL for audio file');

		// 2. Download audio
		const ext = audioPath.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'webm';
		const tmpId = randomBytes(4).toString('hex');
		const rawPath = join(TEMP_DIR, `rt-voice-${tmpId}.${ext}`);
		const wavPath = join(TEMP_DIR, `rt-voice-${tmpId}.wav`);

		mkdirSync(TEMP_DIR, { recursive: true });

		const audioRes = await fetch(signedUrl, { signal: AbortSignal.timeout(60_000) });
		if (!audioRes.ok) throw new Error(`Audio download failed: ${audioRes.status}`);
		const buf = Buffer.from(await audioRes.arrayBuffer());
		writeFileSync(rawPath, buf);
		vlog(`[supabase-rt] Voice ${rowId}: ${buf.length} bytes downloaded`);

		// 3. Convert to 16kHz mono WAV (required by voxtype)
		await new Promise((resolve, reject) => {
			exec(
				`ffmpeg -i "${rawPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`,
				{ timeout: 120_000 },
				(err) => {
					try { unlinkSync(rawPath); } catch {}
					if (err) reject(new Error(`ffmpeg conversion failed: ${err.message}`));
					else resolve();
				}
			);
		});
		vlog(`[supabase-rt] Voice ${rowId}: converted to WAV`);

		// 4. Transcribe via voxtype
		const transcript = await transcribe(wavPath);
		try { unlinkSync(wavPath); } catch {}
		vlog(`[supabase-rt] Voice ${rowId}: transcribed (${transcript.length} chars)`);

		// 5. Organize with ollama → tasks[] or title + description
		let title = 'Voice note';
		let description = transcript;
		let organized = null;
		try {
			const projects = loadProjects();
			organized = await organizeTranscript(transcript, projects);
			if (organized.title) title = organized.title;
			if (organized.summary) description = organized.summary;
		} catch (organizeErr) {
			vlog(`[supabase-rt] Voice ${rowId}: organize failed (${organizeErr.message}), using raw transcript`);
		}

		// 6. Upsert back to Supabase — triggers jat-webhook to sync to JAT SQLite
		if (organized?.tasks && organized.tasks.length > 0) {
			// Multi-task flow: insert N child rows, mark placeholder as voice_split
			const childRows = organized.tasks.map((task) => ({
				source: 'voice',
				status: 'open',
				type: task.type || 'task',
				title: (task.title || 'Voice task').substring(0, 200),
				description: task.description || '',
				priority: task.priority ?? 2,
				...(task.project ? { project: task.project } : {}),
				...(task.labels ? { labels: task.labels } : {}),
				...(row.user_id ? { user_id: row.user_id } : {})
			}));

			const inserted = await supabaseRequest(projectUrl, serviceKey, 'project_tasks', {
				method: 'POST',
				body: childRows
			});

			const taskIds = (Array.isArray(inserted) ? inserted : []).map((r) => r.id).filter(Boolean);
			vlog(`[supabase-rt] Voice ${rowId}: created ${taskIds.length} child tasks`);

			await supabaseRequest(projectUrl, serviceKey, `project_tasks?id=eq.${encodeURIComponent(rowId)}`, {
				method: 'PATCH',
				body: { status: 'voice_split', description: JSON.stringify({ taskIds }) }
			});
			vlog(`[supabase-rt] Voice ${rowId}: updated as status=voice_split with ${taskIds.length} tasks`);
		} else {
			await supabaseRequest(projectUrl, serviceKey, `project_tasks?id=eq.${encodeURIComponent(rowId)}`, {
				method: 'PATCH',
				body: { title, description, status: 'open' }
			});
			vlog(`[supabase-rt] Voice ${rowId}: upserted as status=open`);
		}
	} catch (err) {
		vlog(`[supabase-rt] Voice ${rowId} ERROR: ${err.message}`);
		// Mark as failed so the widget can show an error state
		try {
			await supabaseRequest(projectUrl, serviceKey, `project_tasks?id=eq.${encodeURIComponent(rowId)}`, {
				method: 'PATCH',
				body: { status: 'failed' }
			});
		} catch {}
	} finally {
		processingVoice.delete(rowId);
	}
}

// ─── Realtime event handlers ──────────────────────────────────────────────────

async function handleInsert(source, row, serviceKey) {
	if (!row.id) return;

	// VOICE HANDLER: voice records needing transcription
	if (row.source === 'voice' && row.status === 'transcribing') {
		const projectUrl = resolveProjectUrl(source);
		if (projectUrl) {
			handleVoiceRecord(source, row, serviceKey, projectUrl).catch((err) => {
				console.error(`[supabase-rt] Voice error (${source.project}):`, err.message);
			});
		}
		return;
	}

	// GENERAL SYNC: rows matching the source's statusNew value
	const statusNew = source.statusNew || 'submitted';
	if (row.status !== statusNew) return;

	// Skip if already ingested (shouldn't happen on INSERT but be safe)
	const taskIdCol = source.taskIdColumn || 'jat_task_id';
	if (row[taskIdCol]) return;

	const taskId = createJatTask(source, row);
	if (taskId) {
		await markIngested(source, row, taskId, serviceKey);
		console.log(`[supabase-rt] Synced INSERT → ${taskId}: "${String(row[source.titleColumn || 'title'] || '').slice(0, 60)}"`);
	}
}

async function handleUpdate(source, row, oldRow, serviceKey) {
	const taskIdCol = source.taskIdColumn || 'jat_task_id';
	const taskId = row[taskIdCol];
	if (!taskId || taskId === 'pending') return;

	const projectPath = getProjectPath(source.project);
	if (!projectPath) return;

	const args = ['update', taskId];
	const changes = [];

	// Sync status changes (submitted/open → open, closed → closed, etc.)
	if (oldRow && row.status !== oldRow.status) {
		const statusMap = {
			open: 'open',
			submitted: 'open',
			new: 'open',
			in_progress: 'in_progress',
			ingested: 'open',
			closed: 'closed',
			rejected: 'open' // reopen
		};
		const jatStatus = statusMap[row.status];
		if (jatStatus) {
			args.push('--status', jatStatus);
			changes.push(`status=${jatStatus}`);
		}
	}

	if (changes.length === 0) return;

	try {
		execFileSync('jt', args, { encoding: 'utf-8', timeout: 10000, cwd: projectPath });
		console.log(`[supabase-rt] Updated ${taskId}: ${changes.join(', ')}`);
	} catch (err) {
		console.error(`[supabase-rt] Failed to update ${taskId}:`, err.message);
	}
}

// ─── Boot catch-up ────────────────────────────────────────────────────────────

async function bootCatchUp(source) {
	const serviceKey = resolveServiceKey(source);
	const projectUrl = resolveProjectUrl(source);
	if (!serviceKey || !projectUrl) return;

	const table = source.table || 'project_tasks';
	const statusCol = source.statusColumn || 'status';
	const statusNew = source.statusNew || 'submitted';
	const taskIdCol = source.taskIdColumn || 'jat_task_id';

	console.log(`[supabase-rt] Boot catch-up: ${source.project}...`);

	try {
		// (a) Missed records: status=statusNew AND jat_task_id IS NULL (not voice)
		const missed = await supabaseRequest(
			projectUrl,
			serviceKey,
			`${table}?${statusCol}=eq.${encodeURIComponent(statusNew)}&${taskIdCol}=is.null&order=created_at.asc&limit=50`
		) || [];

		let synced = 0;
		for (const row of missed) {
			if (row.source === 'voice') continue; // voice handled separately
			const taskId = createJatTask(source, row);
			if (taskId) {
				await markIngested(source, row, taskId, serviceKey);
				synced++;
			}
		}
		if (synced > 0) {
			console.log(`[supabase-rt] Boot: synced ${synced} missed record(s) for ${source.project}`);
		}

		// (b) Voice records stuck in 'transcribing' for more than 30 seconds
		const thirtySecsAgo = new Date(Date.now() - 30_000).toISOString();
		const stuckVoice = await supabaseRequest(
			projectUrl,
			serviceKey,
			`${table}?source=eq.voice&status=eq.transcribing&created_at=lt.${encodeURIComponent(thirtySecsAgo)}&limit=10`
		) || [];

		for (const row of stuckVoice) {
			console.log(`[supabase-rt] Boot: retrying stuck voice record ${row.id}`);
			handleVoiceRecord(source, row, serviceKey, projectUrl).catch((err) => {
				console.error(`[supabase-rt] Boot voice error ${row.id}:`, err.message);
			});
		}

		if (synced > 0 || stuckVoice.length > 0) {
			console.log(`[supabase-rt] Boot catch-up done: ${source.project} (${synced} tasks, ${stuckVoice.length} voice)`);
		}
	} catch (err) {
		console.error(`[supabase-rt] Boot catch-up failed for ${source.project}:`, err.message);
	}
}

// ─── Stale cleanup ────────────────────────────────────────────────────────────

async function runStaleCleanup() {
	const sources = loadSupabaseSources();
	for (const source of sources) {
		const serviceKey = resolveServiceKey(source);
		const projectUrl = resolveProjectUrl(source);
		if (!serviceKey || !projectUrl) continue;

		const table = source.table || 'project_tasks';
		const fiveMinsAgo = new Date(Date.now() - 5 * 60_000).toISOString();

		try {
			await supabaseRequest(
				projectUrl,
				serviceKey,
				`${table}?source=eq.voice&status=eq.transcribing&created_at=lt.${encodeURIComponent(fiveMinsAgo)}`,
				{ method: 'PATCH', body: { status: 'failed' } }
			);
		} catch (err) {
			console.error(`[supabase-rt] Stale cleanup error (${source.project}):`, err.message);
		}
	}
}

// ─── WebSocket connection ─────────────────────────────────────────────────────

function connectToProject(source, serviceKey, projectUrl) {
	const wsUrl =
		projectUrl.replace(/^https/, 'wss').replace(/^http/, 'ws') +
		`/realtime/v1/websocket?apikey=${serviceKey}&vsn=1.0.0`;

	let refCounter = 1;
	let heartbeatTimer = null;
	let reconnectTimer = null;
	let backoffMs = 2000;
	const table = source.table || 'project_tasks';

	function getRef() {
		return String(refCounter++);
	}

	function connect() {
		if (!isRunning) return;

		console.log(`[supabase-rt] Connecting: ${source.project} (${projectUrl})`);

		const ws = new WebSocket(wsUrl, { handshakeTimeout: 10000 });
		const state = { ws, connected: false, close: null };
		connections.set(projectUrl, state);

		ws.on('open', () => {
			console.log(`[supabase-rt] Connected: ${source.project}`);
			state.connected = true;
			backoffMs = 2000;

			// Heartbeat every 30s (Supabase drops connections without it)
			heartbeatTimer = setInterval(() => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: getRef() }));
				}
			}, 30_000);

			// Subscribe to INSERT and UPDATE on project_tasks
			const joinRef = getRef();
			ws.send(
				JSON.stringify({
					topic: 'realtime:*',
					event: 'phx_join',
					payload: {
						config: {
							broadcast: { self: false },
							presence: { key: '' },
							postgres_changes: [
								{ event: 'INSERT', schema: 'public', table },
								{ event: 'UPDATE', schema: 'public', table }
							]
						},
						access_token: serviceKey
					},
					ref: joinRef,
					join_ref: joinRef
				})
			);
		});

		ws.on('message', (data) => {
			let msg;
			try {
				msg = JSON.parse(data.toString());
			} catch {
				return;
			}

			const { event, payload } = msg;

			if (event === 'phx_reply') {
				if (payload?.status === 'ok') {
					console.log(`[supabase-rt] Subscribed to ${source.project}:${table} postgres_changes`);
				} else if (payload?.status === 'error') {
					console.error(`[supabase-rt] Subscribe failed (${source.project}):`, JSON.stringify(payload.response));
				}
				return;
			}

			if (event === 'postgres_changes' && payload?.data) {
				const { type, record, old_record } = payload.data;
				if (type === 'INSERT' && record) {
					handleInsert(source, record, serviceKey).catch((err) => {
						console.error(`[supabase-rt] INSERT handler error (${source.project}):`, err.message);
					});
				} else if (type === 'UPDATE' && record) {
					handleUpdate(source, record, old_record || null, serviceKey).catch((err) => {
						console.error(`[supabase-rt] UPDATE handler error (${source.project}):`, err.message);
					});
				}
			}
		});

		ws.on('close', (code, reason) => {
			console.log(
				`[supabase-rt] Disconnected: ${source.project} (${code}${reason ? ' ' + reason : ''})`
			);
			clearInterval(heartbeatTimer);
			state.connected = false;
			if (isRunning) {
				console.log(`[supabase-rt] Reconnecting ${source.project} in ${backoffMs / 1000}s...`);
				reconnectTimer = setTimeout(connect, backoffMs);
				backoffMs = Math.min(backoffMs * 2, 60_000);
			}
		});

		ws.on('error', (err) => {
			console.error(`[supabase-rt] WebSocket error (${source.project}):`, err.message);
			// close event will fire after error, triggering reconnect
		});

		state.close = () => {
			clearInterval(heartbeatTimer);
			clearTimeout(reconnectTimer);
			if (ws.readyState !== WebSocket.CLOSED) ws.terminate();
		};
	}

	connect();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function start() {
	if (isRunning) return;
	isRunning = true;

	const sources = loadSupabaseSources();
	if (sources.length === 0) {
		console.log('[supabase-rt] No enabled Supabase sources found, skipping');
		return;
	}

	// Deduplicate by project URL — one WebSocket per Supabase project
	const byUrl = new Map();
	for (const source of sources) {
		const url = resolveProjectUrl(source);
		if (!url) {
			console.warn(`[supabase-rt] Cannot resolve URL for source "${source.id}", skipping`);
			continue;
		}
		if (!byUrl.has(url)) byUrl.set(url, source);
	}

	if (byUrl.size === 0) {
		console.log('[supabase-rt] No Supabase URLs could be resolved, skipping');
		return;
	}

	console.log(`[supabase-rt] Starting ${byUrl.size} Realtime connection(s)...`);

	for (const [url, source] of byUrl) {
		const serviceKey = resolveServiceKey(source);
		if (!serviceKey) {
			console.warn(`[supabase-rt] No service role key for "${source.project}", skipping`);
			continue;
		}
		connectToProject(source, serviceKey, url);
		// Boot catch-up after 5s to let the WebSocket handshake complete first
		setTimeout(() => bootCatchUp(source), 5000);
	}

	// Stale cleanup every 2 minutes
	staleCleanupInterval = setInterval(
		() => runStaleCleanup().catch((err) => console.error('[supabase-rt] Stale cleanup:', err.message)),
		2 * 60_000
	);
}

export function stop() {
	if (!isRunning) return;
	isRunning = false;

	clearInterval(staleCleanupInterval);
	staleCleanupInterval = null;

	for (const [, state] of connections) {
		if (state.close) state.close();
	}
	connections.clear();

	console.log('[supabase-rt] Stopped all Realtime connections');
}
