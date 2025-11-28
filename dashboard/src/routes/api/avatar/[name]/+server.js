/**
 * Avatar API Endpoint
 *
 * GET /api/avatar/[name] → Serve SVG avatar for agent
 *
 * Returns:
 * - 200: SVG content with proper Content-Type and caching
 * - 404: Avatar not found
 */

import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const AVATARS_DIR = '/home/jw/code/jat/avatars';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const { name } = params;

	// Sanitize name to prevent path traversal
	if (!name || name.includes('/') || name.includes('..') || name.includes('\\')) {
		throw error(400, 'Invalid avatar name');
	}

	const avatarPath = `${AVATARS_DIR}/${name}.svg`;

	// Check if avatar exists
	if (!existsSync(avatarPath)) {
		throw error(404, 'Avatar not found');
	}

	try {
		const svgContent = await readFile(avatarPath, 'utf-8');

		return new Response(svgContent, {
			status: 200,
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (err) {
		console.error(`Error reading avatar ${name}:`, err);
		throw error(500, 'Failed to read avatar');
	}
}
