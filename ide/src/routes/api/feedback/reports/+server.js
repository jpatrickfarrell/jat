/**
 * Feedback Reports List API
 *
 * GET /api/feedback/reports - List all feedback widget + voice reports
 *
 * Queries tasks.db directly (no ingest.db join). Returns reports with enriched
 * data: page_url (parsed from task description), screenshot_urls (from
 * task-images.json), console_logs/network_requests (from metadata JSON), etc.
 *
 * CORS enabled for cross-origin widget usage.
 */
import { json } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import Database from 'better-sqlite3';
import { getThread } from '$lib/server/feedbackThreads.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function parsePageUrl(description) {
	if (!description) return null;
	const match = description.match(/\*\*Page:\*\*\s*(https?:\/\/\S+)/);
	return match ? match[1] : null;
}

function parseRecordingUrl(description) {
	if (!description) return null;
	const match = description.match(/\*\*Session Recording:\*\*\s*(\S+)/);
	if (!match) return null;
	const raw = match[1];
	if (raw.startsWith('/api/')) return raw;
	const filename = raw.split('/').pop();
	return filename ? `/api/feedback/recordings?file=${filename}` : null;
}

function mapTaskStatusToReportStatus(taskStatus, closeReason) {
	switch (taskStatus) {
		case 'open':
			return 'submitted';
		case 'in_progress':
		case 'blocked':
			return 'in_progress';
		case 'closed': {
			const reason = (closeReason || '').toLowerCase();
			if (reason.includes('accepted')) return 'accepted';
			if (reason.includes('rejected')) return 'rejected';
			if (reason.includes('wontfix') || reason.includes("won't fix")) return 'wontfix';
			return 'completed';
		}
		default:
			return 'submitted';
	}
}

function getScreenshotUrls(projectPath, taskId) {
	const imageStorePath = join(projectPath, '.jat', 'task-images.json');
	if (!existsSync(imageStorePath)) return [];
	try {
		const data = JSON.parse(readFileSync(imageStorePath, 'utf-8'));
		const taskImages = data[taskId];
		if (!taskImages) return [];
		const images = Array.isArray(taskImages) ? taskImages : [taskImages];
		return images
			.filter((img) => img && img.path)
			.map((img) => `/api/work/image/${basename(img.path)}`);
	} catch {
		return [];
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const projectPath = process.cwd().replace(/\/ide$/, '');
		const tasksDbPath = join(projectPath, '.jat', 'tasks.db');

		if (!existsSync(tasksDbPath)) {
			return json({ reports: [] }, { headers: CORS_HEADERS });
		}

		const db = new Database(tasksDbPath, { readonly: true });
		const rows = db.prepare(
			`SELECT id, title, description, status, priority, issue_type,
			        close_reason, notes, created_at, updated_at, source, metadata,
			        labels_text
			 FROM tasks
			 WHERE source IN ('feedback-widget', 'voice')
			    OR labels_text LIKE '%widget%'
			    OR labels_text LIKE '%voice%'
			 ORDER BY created_at DESC
			 LIMIT 100`
		).all();
		db.close();

		const reports = rows.map((task) => {
			let metadata = null;
			if (task.metadata) {
				try {
					metadata = JSON.parse(task.metadata);
				} catch {
					metadata = null;
				}
			}

			const title = (task.title || '').replace(/^\[Feedback\]\s*/, '');
			const pageUrl = parsePageUrl(task.description);
			const screenshotUrls = getScreenshotUrls(projectPath, task.id);

			// User description (before **Page:** metadata)
			let description = task.description || '';
			const metaStart = description.indexOf('\n\n**Page:**');
			if (metaStart > 0) {
				description = description.substring(0, metaStart).trim();
			}

			// Thread (sidecar JSON) — feedback-widget tasks only
			let thread = null;
			let revisionCount = 0;
			try {
				const rawThread = getThread(task.id);
				if (rawThread && rawThread.length > 0) {
					thread = rawThread.map((entry) => {
						if (entry.screenshots && entry.screenshots.length > 0) {
							return {
								...entry,
								screenshots: entry.screenshots.map((s) => ({
									...s,
									url: s.path ? `/api/work/image/${basename(s.path)}` : undefined
								}))
							};
						}
						return entry;
					});
					revisionCount = rawThread.filter((e) => e.type === 'rejection').length;
				}
			} catch {
				// non-fatal
			}

			return {
				id: task.id,
				title,
				description,
				type: task.issue_type || 'bug',
				priority: task.priority != null ? String(task.priority) : '2',
				status: mapTaskStatusToReportStatus(task.status, task.close_reason),
				dev_notes: task.notes || null,
				revision_count: revisionCount,
				responded_at: task.status === 'closed' ? (task.updated_at || null) : null,
				page_url: pageUrl,
				screenshot_urls: screenshotUrls,
				thread,
				recording_url: parseRecordingUrl(task.description),
				console_logs: metadata?.console_logs ?? null,
				network_requests: metadata?.network_requests ?? null,
				created_at: task.created_at
			};
		});

		return json({ reports }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback/reports] Error:', err);
		return json(
			{ reports: [], error: err.message || 'Failed to fetch reports' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
