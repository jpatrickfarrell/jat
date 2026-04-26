/**
 * Task Image API Route
 * Stores and retrieves image attachments for tasks
 * Supports MULTIPLE images per task
 * Images are stored per-task and persist across browser sessions
 *
 * GET /api/tasks/[id]/image - Get all images for a task
 * PUT /api/tasks/[id]/image - Add an image to a task
 * DELETE /api/tasks/[id]/image - Remove a specific image from a task
 */
import { json } from '@sveltejs/kit';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { getProjectSupabaseConfig } from '../../../../../../../lib/projects-config.js';

const execAsync = promisify(exec);

/**
 * Extract project name from a task ID
 * @param {string} taskId - Task ID like "steelbridge-xx5" or "jat-abc"
 * @returns {string|null} Project name like "steelbridge" or null if invalid
 */
function getProjectFromTaskId(taskId) {
	if (!taskId || typeof taskId !== 'string') return null;
	const dashIndex = taskId.indexOf('-');
	if (dashIndex === -1 || dashIndex === 0) return null;
	return taskId.substring(0, dashIndex);
}

// Path to store task image mappings
const getImageStorePath = () => {
	const projectPath = process.cwd().replace('/ide', '');
	return join(projectPath, '.jat', 'task-images.json');
};

/**
 * @typedef {{ path: string; uploadedAt: string; id: string }} ImageData
 */

/**
 * Load task images from storage
 * @returns {Promise<Record<string, ImageData[]>>}
 */
async function loadTaskImages() {
	const storePath = getImageStorePath();
	try {
		if (!existsSync(storePath)) {
			return {};
		}
		const content = await readFile(storePath, 'utf-8');
		const data = JSON.parse(content);

		// Migrate old format (single object) to new format (array)
		/** @type {Record<string, ImageData[]>} */
		const migrated = {};
		for (const [taskId, value] of Object.entries(data)) {
			if (Array.isArray(value)) {
				migrated[taskId] = value;
			} else if (value && typeof value === 'object' && /** @type {{ path?: string }} */ (value).path) {
				// Old format: single object
				const oldValue = /** @type {{ path: string; uploadedAt?: string; id?: string }} */ (value);
				migrated[taskId] = [{
					path: oldValue.path,
					uploadedAt: oldValue.uploadedAt || new Date().toISOString(),
					id: oldValue.id || `img-migrated-${Date.now()}`
				}];
			}
		}
		return migrated;
	} catch (err) {
		console.error('Failed to load task images:', err);
		return {};
	}
}

/**
 * Save task images to storage
 * @param {Record<string, ImageData[]>} images
 */
async function saveTaskImages(images) {
	const storePath = getImageStorePath();
	try {
		// Ensure directory exists
		const storeDir = dirname(storePath);
		if (!existsSync(storeDir)) {
			await mkdir(storeDir, { recursive: true });
		}
		await writeFile(storePath, JSON.stringify(images, null, 2), 'utf-8');
	} catch (err) {
		console.error('Failed to save task images:', err);
		throw err;
	}
}

/**
 * Sync image paths to task's notes field so agents can see them via `jt show`
 * @param {string} taskId
 * @param {ImageData[]} taskImages
 */
async function syncNotesToTask(taskId, taskImages) {
	try {
		// Extract project from task ID and resolve correct project path
		const projectName = getProjectFromTaskId(taskId);
		if (!projectName) {
			console.warn(`[image-sync] Cannot determine project from task ID: ${taskId}`);
			return;
		}

		const projectInfo = await getProjectPath(projectName);
		if (!projectInfo.exists) {
			console.warn(`[image-sync] Project path does not exist for ${projectName}: ${projectInfo.path}`);
			return;
		}

		const projectPath = projectInfo.path;

		if (!taskImages || taskImages.length === 0) {
			// Clear notes if no images
			const command = `cd "${projectPath}" && jt update ${taskId} --notes ""`;
			await execAsync(command);
			return;
		}

		// Build notes string with image paths
		const imageList = taskImages
			.map((img, i) => `  ${i + 1}. ${img.path}`)
			.join('\n');

		const notes = `📷 Attached screenshots:\n${imageList}\n(Use Read tool to view these images)`;

		// Escape for shell
		const escapedNotes = notes.replace(/"/g, '\\"');
		const command = `cd "${projectPath}" && jt update ${taskId} --notes "${escapedNotes}"`;

		await execAsync(command);
		console.log(`[image-sync] Synced ${taskImages.length} image(s) to task ${taskId} notes (project: ${projectName})`);
	} catch (err) {
		console.error('[image-sync] Failed to sync notes to task:', err);
		// Don't throw - image storage succeeded, notes sync is secondary
	}
}

/**
 * GET - Get all images for a task
 */
/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const taskId = params.id;

	try {
		const images = await loadTaskImages();
		const localImages = images[taskId] || [];

		// For postgres-backed projects, also pull screenshot_paths from Supabase.
		// These are storage paths (e.g. "tasks/uuid/file.png" or "reports/ts-hash.jpg")
		// served from the public "screenshots" bucket.
		const remoteImages = await fetchSupabaseAttachments(taskId);

		// Deduplicate: don't show a remote image that was already synced locally.
		// Local entries store the storagePath in their id (see syncAttachmentToSupabase).
		// Simple dedup: if a local image's path contains the storage path, skip the remote.
		const localPaths = new Set(localImages.map(/** @param {{ path: string }} img */ img => img.path));
		const deduped = remoteImages.filter(
			/** @param {{ path: string }} img */ img => !localPaths.has(img.path)
		);

		return json({
			taskId,
			images: [...localImages, ...deduped]
		});
	} catch (err) {
		console.error('Error getting task images:', err);
		return json({ error: 'Failed to get task images' }, { status: 500 });
	}
}

/**
 * Fetch screenshot_paths from Supabase for postgres-backed projects and
 * convert each storage path to a public URL so the client can display it.
 *
 * @param {string} taskId
 * @returns {Promise<Array<{id: string, path: string, uploadedAt: string}>>}
 */
async function fetchSupabaseAttachments(taskId) {
	const projectName = getProjectFromTaskId(taskId);
	if (!projectName) return [];

	const supabase = getProjectSupabaseConfig(projectName);
	if (!supabase) return [];

	try {
		const res = await fetch(
			`${supabase.supabaseUrl}/rest/v1/project_tasks?select=screenshot_paths,updated_at&jat_id=eq.${encodeURIComponent(taskId)}&limit=1`,
			{
				headers: {
					Authorization: `Bearer ${supabase.serviceRoleKey}`,
					apikey: supabase.serviceRoleKey
				}
			}
		);
		if (!res.ok) return [];

		const rows = await res.json();
		if (!rows?.length || !Array.isArray(rows[0]?.screenshot_paths)) return [];

		const { screenshot_paths, updated_at } = rows[0];
		const uploadedAt = updated_at ? new Date(updated_at).toISOString() : new Date().toISOString();

		return screenshot_paths.map((/** @type {string} */ storagePath, /** @type {number} */ i) => ({
			id: `remote-${taskId}-${i}-${storagePath.replace(/[^a-z0-9]/gi, '_')}`,
			// Full public URL — TaskDetailDrawer renders paths starting with 'http' directly.
			path: `${supabase.supabaseUrl}/storage/v1/object/public/screenshots/${storagePath}`,
			uploadedAt
		}));
	} catch {
		return [];
	}
}

/**
 * PUT - Add an image to a task
 * Body: { path: string, id: string, action?: 'add' | 'replace' }
 * action='add' (default): Appends to existing images
 * action='replace': Replaces all images with this one
 */
/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	const taskId = params.id;

	try {
		const body = await request.json();
		const { path, id, action = 'add' } = body;

		if (!path || typeof path !== 'string') {
			return json({ error: 'Image path is required' }, { status: 400 });
		}

		const imageId = id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
		const newImage = {
			path,
			uploadedAt: new Date().toISOString(),
			id: imageId
		};

		const images = await loadTaskImages();

		if (action === 'replace') {
			// Replace all images with this one
			images[taskId] = [newImage];
		} else {
			// Append to existing images
			const existingImages = images[taskId] || [];
			images[taskId] = [...existingImages, newImage];
		}

		await saveTaskImages(images);

		// Sync image paths to task notes so agents see them via `jt show`
		await syncNotesToTask(taskId, images[taskId]);

		// For postgres-backed projects: also upload to Supabase Storage and
		// update project_tasks.screenshot_paths so the app sees the attachment.
		// Best-effort — local save already succeeded so don't fail the request.
		const projectName = getProjectFromTaskId(taskId);
		if (projectName) {
			syncAttachmentToSupabase(projectName, taskId, path).catch((err) => {
				console.error('[supabase-sync] Failed to sync attachment:', err.message);
			});
		}

		return json({
			success: true,
			taskId,
			image: newImage,
			totalImages: images[taskId].length
		});
	} catch (err) {
		console.error('Error adding task image:', err);
		return json({ error: 'Failed to add task image' }, { status: 500 });
	}
}

/**
 * Upload a local attachment to Supabase Storage and append the path to
 * project_tasks.screenshot_paths for the matching Meadow task.
 *
 * @param {string} projectName  - e.g. "meadow"
 * @param {string} taskId       - e.g. "meadow-okzpt"
 * @param {string} localPath    - absolute path to the local file
 */
async function syncAttachmentToSupabase(projectName, taskId, localPath) {
	const supabase = getProjectSupabaseConfig(projectName);
	if (!supabase) return; // No Supabase config for this project

	if (!existsSync(localPath)) {
		console.warn(`[supabase-sync] Local file not found: ${localPath}`);
		return;
	}

	const buffer = await readFile(localPath);
	const ext = extname(localPath).slice(1) || 'png';
	const storagePath = `tasks/${taskId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
	const mimeType = getMimeType(ext);

	// Upload to Supabase Storage (screenshots bucket)
	const uploadRes = await fetch(
		`${supabase.supabaseUrl}/storage/v1/object/screenshots/${storagePath}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${supabase.serviceRoleKey}`,
				apikey: supabase.serviceRoleKey,
				'Content-Type': mimeType,
				'x-upsert': 'true'
			},
			body: buffer
		}
	);

	if (!uploadRes.ok) {
		const body = await uploadRes.text();
		throw new Error(`Storage upload failed (${uploadRes.status}): ${body}`);
	}

	// Append storagePath to project_tasks.screenshot_paths WHERE jat_id = taskId
	const patchRes = await fetch(
		`${supabase.supabaseUrl}/rest/v1/rpc/append_task_screenshot`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${supabase.serviceRoleKey}`,
				apikey: supabase.serviceRoleKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ p_jat_id: taskId, p_path: storagePath })
		}
	);

	if (!patchRes.ok) {
		// Fallback: direct array append via REST PATCH
		// First read current paths, then write merged array
		const readRes = await fetch(
			`${supabase.supabaseUrl}/rest/v1/project_tasks?jat_id=eq.${encodeURIComponent(taskId)}&select=id,screenshot_paths`,
			{
				headers: {
					Authorization: `Bearer ${supabase.serviceRoleKey}`,
					apikey: supabase.serviceRoleKey
				}
			}
		);
		if (!readRes.ok) throw new Error(`Failed to read project_tasks: ${readRes.status}`);
		const [row] = await readRes.json();
		if (!row) {
			console.warn(`[supabase-sync] No project_tasks row for jat_id=${taskId}`);
			return;
		}
		const merged = [...(row.screenshot_paths ?? []), storagePath];
		const writeRes = await fetch(
			`${supabase.supabaseUrl}/rest/v1/project_tasks?id=eq.${row.id}`,
			{
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${supabase.serviceRoleKey}`,
					apikey: supabase.serviceRoleKey,
					'Content-Type': 'application/json',
					Prefer: 'return=minimal'
				},
				body: JSON.stringify({ screenshot_paths: merged })
			}
		);
		if (!writeRes.ok) throw new Error(`Failed to patch screenshot_paths: ${writeRes.status}`);
	}

	console.log(`[supabase-sync] Synced ${localPath} → screenshots/${storagePath} for ${taskId}`);
}

/**
 * @param {string} ext
 * @returns {string}
 */
function getMimeType(ext) {
	const map = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', txt: 'text/plain' };
	return map[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * DELETE - Remove a specific image from a task
 * Body: { id: string } - ID of the image to remove
 * If no body/id provided, removes ALL images for the task
 */
/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, request }) {
	const taskId = params.id;

	try {
		let imageId = null;
		try {
			const body = await request.json();
			imageId = body.id;
		} catch {
			// No body - will remove all images
		}

		const images = await loadTaskImages();
		const taskImages = images[taskId] || [];

		if (taskImages.length === 0) {
			return json({ success: true, message: 'No images to remove' });
		}

		if (imageId) {
			// Remove specific image by ID
			const filteredImages = taskImages.filter(img => img.id !== imageId);
			if (filteredImages.length === taskImages.length) {
				return json({ success: true, message: 'Image not found' });
			}

			if (filteredImages.length > 0) {
				images[taskId] = filteredImages;
			} else {
				delete images[taskId];
			}

			await saveTaskImages(images);

			// Sync notes to reflect remaining images
			await syncNotesToTask(taskId, filteredImages);

			return json({
				success: true,
				message: `Image ${imageId} removed from task ${taskId}`,
				remainingImages: filteredImages.length
			});
		} else {
			// Remove all images for this task
			delete images[taskId];
			await saveTaskImages(images);

			// Clear notes since no images remain
			await syncNotesToTask(taskId, []);

			return json({
				success: true,
				message: `All images removed from task ${taskId}`
			});
		}
	} catch (err) {
		console.error('Error removing task image:', err);
		return json({ error: 'Failed to remove task image' }, { status: 500 });
	}
}
