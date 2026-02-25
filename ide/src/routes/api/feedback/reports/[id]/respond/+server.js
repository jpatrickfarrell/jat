/**
 * Feedback Report Respond API
 *
 * PATCH /api/feedback/reports/[id]/respond
 * Accept or reject a completed feedback report.
 *
 * Body: { response: 'accepted' | 'rejected', reason?: string }
 */
import { json } from '@sveltejs/kit';
import { closeTask, updateTask, getTaskById } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../../../api/agents/+server.js';
import { appendThreadEntry, generateEntryId } from '$lib/server/feedbackThreads.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { homedir } from 'os';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const { id } = params;
		const body = await request.json();
		const { response, reason, screenshots, elements } = body;

		if (!response || !['accepted', 'rejected'].includes(response)) {
			return json(
				{ ok: false, error: 'Response must be "accepted" or "rejected"' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		if (response === 'rejected' && (!reason || reason.trim().length < 10)) {
			return json(
				{ ok: false, error: 'Rejection reason must be at least 10 characters' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		const projectPath = process.cwd().replace(/\/ide$/, '');

		// Get current task
		const task = getTaskById(id);
		if (!task) {
			return json(
				{ ok: false, error: 'Report not found' },
				{ status: 404, headers: CORS_HEADERS }
			);
		}

		// Save rejection screenshots if provided
		/** @type {{ path: string; uploadedAt: string; id: string }[]} */
		const savedScreenshots = [];
		if (response === 'rejected' && screenshots && Array.isArray(screenshots) && screenshots.length > 0) {
			const imagesDir = join(homedir(), '.local', 'share', 'jat', 'task-images');
			if (!existsSync(imagesDir)) {
				mkdirSync(imagesDir, { recursive: true });
			}

			const timestamp = Date.now();
			for (let i = 0; i < screenshots.length; i++) {
				try {
					const dataUrl = screenshots[i];
					if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) continue;

					const [header, base64] = dataUrl.split(',');
					if (!base64) continue;

					const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
					const ext = mime === 'image/png' ? 'png' : 'jpg';
					const rand = Math.random().toString(36).substring(2, 8);
					const filename = `upload-reject-${timestamp}-${rand}.${ext}`;
					const filepath = join(imagesDir, filename);

					writeFileSync(filepath, Buffer.from(base64, 'base64'));
					savedScreenshots.push({
						path: filepath,
						uploadedAt: new Date().toISOString(),
						id: `reject-${timestamp}-${i}`,
					});
				} catch (err) {
					console.warn(`[feedback-respond] Screenshot save failed (${i}):`, err.message);
				}
			}

			// Register in task-images.json
			if (savedScreenshots.length > 0) {
				try {
					const imageStorePath = join(projectPath, '.jat', 'task-images.json');
					let taskImages = {};
					if (existsSync(imageStorePath)) {
						taskImages = JSON.parse(readFileSync(imageStorePath, 'utf-8'));
					}
					const existing = taskImages[id] || [];
					taskImages[id] = [...existing, ...savedScreenshots];
					const storeDir = dirname(imageStorePath);
					if (!existsSync(storeDir)) {
						mkdirSync(storeDir, { recursive: true });
					}
					writeFileSync(imageStorePath, JSON.stringify(taskImages, null, 2), 'utf-8');
				} catch (err) {
					console.warn('[feedback-respond] Failed to register screenshots:', err.message);
				}
			}
		}

		if (response === 'accepted') {
			// Close the task as accepted
			closeTask(id, 'Accepted by requester', projectPath);
		} else {
			// Rejected - reopen the task for another work cycle
			const notes = task.notes
				? `${task.notes}\n\nRejected: ${reason}`
				: `Rejected: ${reason}`;
			updateTask(id, { status: 'open', notes, projectPath });
		}

		// Append thread entry
		try {
			/** @type {{ tagName: string; className: string; id: string; selector: string; textContent: string }[]} */
			const threadElements = (elements || []).slice(0, 10).map((el) => ({
				tagName: el.tagName || 'element',
				className: el.className || '',
				id: el.id || '',
				selector: el.selector || '',
				textContent: (el.textContent || '').substring(0, 100),
			}));

			const threadScreenshots = savedScreenshots.map((s) => ({
				path: s.path,
				uploadedAt: s.uploadedAt,
				id: s.id,
			}));

			appendThreadEntry(id, {
				id: generateEntryId(),
				from: 'user',
				type: response === 'accepted' ? 'acceptance' : 'rejection',
				message: response === 'accepted' ? 'Accepted' : reason,
				screenshots: threadScreenshots.length > 0 ? threadScreenshots : undefined,
				elements: threadElements.length > 0 ? threadElements : undefined,
				at: new Date().toISOString(),
			});
		} catch (err) {
			console.warn('[feedback-respond] Failed to append thread entry:', err.message);
		}

		// Invalidate caches
		invalidateCache.tasks();
		_resetTaskCache();

		return json({ ok: true }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback-respond] Error:', err);
		return json(
			{ ok: false, error: err.message || 'Failed to respond' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
