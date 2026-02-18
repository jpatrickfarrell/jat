/**
 * Feedback Widget Report API
 *
 * Receives bug reports from the <jat-feedback> widget and creates tasks.
 * Screenshots are saved as proper task attachments via the task-images system.
 * Includes CORS headers for cross-origin widget usage.
 *
 * POST - Submit a bug report (creates a task)
 * GET  - Health check (widget uses this to test connection)
 * OPTIONS - CORS preflight
 */
import { json } from '@sveltejs/kit';
import { createTask } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../api/agents/+server.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/** Map widget priority strings to JAT numeric priorities */
const PRIORITY_MAP = {
	critical: 0,
	high: 1,
	medium: 2,
	low: 3
};

/** Map widget type strings to JAT task types */
const TYPE_MAP = {
	bug: 'bug',
	enhancement: 'feature',
	other: 'task'
};

/**
 * OPTIONS /api/feedback/report - CORS preflight
 */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/feedback/report - Health check
 */
export async function GET() {
	return json(
		{
			status: 'ok',
			service: 'jat-feedback-report',
			timestamp: new Date().toISOString()
		},
		{ headers: CORS_HEADERS }
	);
}

/**
 * POST /api/feedback/report - Submit a bug report
 */
export async function POST({ request }) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
			return json({ ok: false, error: 'Title is required' }, { status: 400, headers: CORS_HEADERS });
		}

		const title = body.title.trim();
		const description = body.description ? body.description.trim() : '';
		const type = TYPE_MAP[body.type] || 'bug';
		const priority = PRIORITY_MAP[body.priority] ?? 2;

		// Build rich description with metadata
		const descParts = [];

		if (description) {
			descParts.push(description);
		}

		// Add page URL
		if (body.page_url) {
			descParts.push(`**Page:** ${body.page_url}`);
		}

		// Add user agent
		if (body.user_agent) {
			descParts.push(`**Browser:** ${body.user_agent}`);
		}

		// Resolve project path from body.project or fallback to JAT
		let projectPath = process.cwd().replace(/\/ide$/, '');
		if (body.project && typeof body.project === 'string' && body.project.trim()) {
			const resolved = await getProjectPath(body.project.trim());
			if (resolved.exists) {
				projectPath = resolved.path;
			} else {
				console.warn(`[feedback-report] Project "${body.project}" not found, falling back to default`);
			}
		}

		// Save screenshots to standard task-images location
		/** @type {{ path: string; uploadedAt: string; id: string }[]} */
		const savedAttachments = [];
		if (body.screenshots && Array.isArray(body.screenshots) && body.screenshots.length > 0) {
			const imagesDir = join(homedir(), '.local', 'share', 'jat', 'task-images');
			if (!existsSync(imagesDir)) {
				mkdirSync(imagesDir, { recursive: true });
			}

			const timestamp = Date.now();
			for (let i = 0; i < body.screenshots.length; i++) {
				try {
					const dataUrl = body.screenshots[i];
					if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) continue;

					const [header, base64] = dataUrl.split(',');
					if (!base64) continue;

					const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
					const ext = mime === 'image/png' ? 'png' : 'jpg';
					const rand = Math.random().toString(36).substring(2, 8);
					const filename = `upload-feedback-${timestamp}-${rand}.${ext}`;
					const filepath = join(imagesDir, filename);

					writeFileSync(filepath, Buffer.from(base64, 'base64'));
					savedAttachments.push({
						path: filepath,
						uploadedAt: new Date().toISOString(),
						id: `feedback-${timestamp}-${i}`
					});
				} catch (err) {
					console.warn(`[feedback-report] Screenshot save failed (${i}):`, err.message);
				}
			}

			if (savedAttachments.length > 0) {
				descParts.push(`**Screenshots:** ${savedAttachments.length} attached`);
			}
		}

		// Add console logs summary — prioritize errors/warns, then most recent
		if (body.console_logs && Array.isArray(body.console_logs) && body.console_logs.length > 0) {
			const allLogs = body.console_logs;
			const errors = allLogs.filter((l) => l.type === 'error' || l.type === 'warn');
			const recent = allLogs.slice(-10);
			// Dedupe by timestamp+message, errors first then recent context
			const seen = new Set();
			const prioritized = [];
			for (const log of [...errors, ...recent]) {
				const key = `${log.timestamp || ''}|${log.message || ''}`;
				if (!seen.has(key)) {
					seen.add(key);
					prioritized.push(log);
				}
			}
			const selected = prioritized.slice(-20);
			const logSummary = selected
				.map((log) => {
					const level = log.type || log.level || 'log';
					const msg =
						typeof log.message === 'string' ? log.message : JSON.stringify(log.message);
					return `- [${level}] ${msg.substring(0, 500)}`;
				})
				.join('\n');
			descParts.push(`**Console Logs** (${allLogs.length} total, ${selected.length} shown):\n${logSummary}`);
		}

		// Add selected elements summary
		if (
			body.selected_elements &&
			Array.isArray(body.selected_elements) &&
			body.selected_elements.length > 0
		) {
			const elemSummary = body.selected_elements
				.slice(0, 5)
				.map((el) => {
					const tag = el.tagName || el.tag || 'element';
					const id = el.id ? `#${el.id}` : '';
					const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
					return `- \`${tag}${id}${classes}\``;
				})
				.join('\n');
			descParts.push(
				`**Selected Elements** (${body.selected_elements.length}):\n${elemSummary}`
			);
		}

		const fullDescription = descParts.join('\n\n');

		// Create the task
		const createdTask = createTask({
			projectPath,
			title: `[Feedback] ${title}`,
			description: fullDescription,
			type,
			priority,
			labels: ['widget', 'bug-report'],
			deps: [],
			assignee: null,
			notes: ''
		});

		// Register screenshots as proper task attachments
		if (savedAttachments.length > 0) {
			try {
				const imageStorePath = join(process.cwd().replace(/\/ide$/, ''), '.jat', 'task-images.json');
				let taskImages = {};
				if (existsSync(imageStorePath)) {
					taskImages = JSON.parse(readFileSync(imageStorePath, 'utf-8'));
				}
				taskImages[createdTask.id] = savedAttachments;
				const storeDir = dirname(imageStorePath);
				if (!existsSync(storeDir)) {
					mkdirSync(storeDir, { recursive: true });
				}
				writeFileSync(imageStorePath, JSON.stringify(taskImages, null, 2), 'utf-8');

				// Sync image paths to task notes so agents see them via `jt show`
				const imageList = savedAttachments.map((img, i) => `  ${i + 1}. ${img.path}`).join('\n');
				const notes = `📷 Attached screenshots:\n${imageList}\n(Use Read tool to view these images)`;
				const escapedNotes = notes.replace(/"/g, '\\"');
				await execAsync(`cd "${projectPath}" && jt update ${createdTask.id} --notes "${escapedNotes}"`);
			} catch (err) {
				console.warn('[feedback-report] Failed to register attachments:', err.message);
			}
		}

		// Invalidate caches
		invalidateCache.tasks();
		invalidateCache.agents();
		_resetTaskCache();

		// Emit event
		try {
			emitEvent({
				type: 'task_created',
				source: 'widget',
				data: {
					taskId: createdTask.id,
					title: createdTask.title,
					type,
					priority,
					labels: ['widget', 'bug-report']
				}
			});
		} catch (e) {
			console.error('[feedback-report] Failed to emit event:', e);
		}

		return json(
			{
				ok: true,
				id: createdTask.id,
				message: `Report submitted as task ${createdTask.id}`
			},
			{ status: 201, headers: CORS_HEADERS }
		);
	} catch (err) {
		console.error('[feedback-report] Error:', err);
		return json(
			{
				ok: false,
				error: err.message || 'Failed to submit report'
			},
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
