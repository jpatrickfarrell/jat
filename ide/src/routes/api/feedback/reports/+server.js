/**
 * Feedback Reports List API
 *
 * GET /api/feedback/reports - List all feedback widget reports
 *
 * Returns reports with enriched data: page_url (parsed from task description),
 * screenshot_urls (from task-images.json), status, dev_notes, etc.
 *
 * CORS enabled for cross-origin widget usage.
 */
import { json } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import Database from 'better-sqlite3';
import { getTaskById } from '$lib/server/jat-tasks.js';
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

/**
 * Parse page_url from task description.
 * Feedback report descriptions contain: **Page:** https://...
 * @param {string} description
 * @returns {string | null}
 */
function parsePageUrl(description) {
	if (!description) return null;
	const match = description.match(/\*\*Page:\*\*\s*(https?:\/\/\S+)/);
	return match ? match[1] : null;
}

/**
 * Map JAT task status to feedback report status.
 * @param {string} taskStatus - JAT task status (open, in_progress, blocked, closed)
 * @param {string | null} closeReason - Close reason text
 * @returns {string}
 */
function mapTaskStatusToReportStatus(taskStatus, closeReason) {
	switch (taskStatus) {
		case 'open':
			return 'submitted';
		case 'in_progress':
			return 'in_progress';
		case 'blocked':
			return 'in_progress';
		case 'closed': {
			// Check close_reason for accept/reject/wontfix
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

/**
 * Get screenshot URLs for a task from task-images.json.
 * Returns array of API URLs that serve the images.
 * @param {string} taskId
 * @returns {string[]}
 */
function getScreenshotUrls(taskId) {
	const projectPath = process.cwd().replace(/\/ide$/, '');
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
		const ingestDbPath = join(homedir(), '.local', 'share', 'jat', 'ingest.db');
		if (!existsSync(ingestDbPath)) {
			return json({ reports: [] }, { headers: CORS_HEADERS });
		}

		const db = new Database(ingestDbPath, { readonly: true });

		// Get all feedback widget items
		const rows = db.prepare(
			`SELECT source_id, item_id, task_id, title, ingested_at,
			        origin_sender_id, origin_metadata
			 FROM ingested_items
			 WHERE origin_adapter_type = 'feedback'
			 ORDER BY ingested_at DESC
			 LIMIT 100`
		).all();
		db.close();

		/** @type {import('./types').ReportSummary[]} */
		const reports = [];

		for (const row of rows) {
			if (!row.task_id) continue;

			// Fetch task details from JAT Tasks DB
			let task;
			try {
				task = getTaskById(row.task_id);
			} catch {
				continue; // Task may have been deleted
			}
			if (!task) continue;

			// Strip [Feedback] prefix from title
			const title = (task.title || row.title || '')
				.replace(/^\[Feedback\]\s*/, '');

			// Parse page_url from description
			const pageUrl = parsePageUrl(task.description);

			// Get screenshot URLs
			const screenshotUrls = getScreenshotUrls(row.task_id);

			// Extract user description (first paragraph before **Page:** metadata)
			let description = task.description || '';
			const metaStart = description.indexOf('\n\n**Page:**');
			if (metaStart > 0) {
				description = description.substring(0, metaStart).trim();
			}

			// Check for dev_notes in task notes field
			const devNotes = task.notes || null;

			// Load thread data (sidecar JSON)
			let thread = null;
			let revisionCount = 0;
			try {
				const rawThread = getThread(row.task_id);
				if (rawThread && rawThread.length > 0) {
					// Map screenshot paths to serving URLs
					thread = rawThread.map((entry) => {
						if (entry.screenshots && entry.screenshots.length > 0) {
							return {
								...entry,
								screenshots: entry.screenshots.map((s) => ({
									...s,
									url: s.path ? `/api/work/image/${basename(s.path)}` : undefined,
								})),
							};
						}
						return entry;
					});
					revisionCount = rawThread.filter((e) => e.type === 'rejection').length;
				}
			} catch {
				// Thread loading failure is non-fatal
			}

			reports.push({
				id: row.task_id,
				title,
				description,
				type: task.issue_type || 'bug',
				priority: task.priority != null ? String(task.priority) : '2',
				status: mapTaskStatusToReportStatus(task.status, task.close_reason),
				dev_notes: devNotes,
				revision_count: revisionCount,
				responded_at: task.status === 'closed' ? (task.updated_at || null) : null,
				page_url: pageUrl,
				screenshot_urls: screenshotUrls,
				thread,
				created_at: task.created_at || row.ingested_at
			});
		}

		return json({ reports }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback-reports] Error:', err);
		return json(
			{ reports: [], error: err.message || 'Failed to fetch reports' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
