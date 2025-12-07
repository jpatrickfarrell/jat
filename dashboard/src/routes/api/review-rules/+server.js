/**
 * Review Rules API Route
 * GET - Load current review rules from .beads/review-rules.json
 * PUT - Update review rules
 * POST /reset - Reset to default rules
 */
import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const execAsync = promisify(exec);

// Find .beads directory by walking up from cwd
function findBeadsDir() {
	let dir = process.cwd();
	while (dir !== '/') {
		const beadsPath = resolve(dir, '.beads');
		if (existsSync(beadsPath)) {
			return beadsPath;
		}
		dir = resolve(dir, '..');
	}
	return null;
}

// Default rules configuration
const DEFAULT_RULES = {
	version: 1,
	defaultAction: 'review',
	priorityThreshold: 3,
	rules: [
		{ type: 'bug', maxAutoPriority: 3, note: 'P0-P3 bugs auto-proceed, P4 requires review' },
		{ type: 'feature', maxAutoPriority: 3, note: 'P0-P3 features auto-proceed' },
		{ type: 'task', maxAutoPriority: 3 },
		{ type: 'chore', maxAutoPriority: 4, note: 'All chores auto-proceed' },
		{ type: 'epic', maxAutoPriority: -1, note: 'Epics always require review' }
	],
	overrides: []
};

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const beadsDir = findBeadsDir();
		if (!beadsDir) {
			return json({ error: true, message: 'No .beads directory found' }, { status: 404 });
		}

		const rulesPath = resolve(beadsDir, 'review-rules.json');

		if (!existsSync(rulesPath)) {
			// Return defaults if file doesn't exist
			return json(DEFAULT_RULES);
		}

		const content = readFileSync(rulesPath, 'utf-8');
		const rules = JSON.parse(content);

		return json(rules);
	} catch (err) {
		console.error('Error loading review rules:', err);
		const message = err instanceof Error ? err.message : 'Failed to load review rules';
		return json(
			{ error: true, message },
			{ status: 500 }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request }) {
	try {
		const beadsDir = findBeadsDir();
		if (!beadsDir) {
			return json({ error: true, message: 'No .beads directory found' }, { status: 404 });
		}

		const rulesPath = resolve(beadsDir, 'review-rules.json');
		const updates = await request.json();

		// Load existing rules or use defaults
		let rules = DEFAULT_RULES;
		if (existsSync(rulesPath)) {
			const content = readFileSync(rulesPath, 'utf-8');
			rules = JSON.parse(content);
		}

		// Apply updates
		if (updates.rules && Array.isArray(updates.rules)) {
			// Update individual rules by type
			for (const update of updates.rules) {
				const existingIndex = rules.rules.findIndex(r => r.type === update.type);
				if (existingIndex >= 0) {
					rules.rules[existingIndex] = {
						...rules.rules[existingIndex],
						...update
					};
				} else {
					rules.rules.push(update);
				}
			}
		}

		if (updates.defaultAction !== undefined) {
			rules.defaultAction = updates.defaultAction;
		}

		if (updates.priorityThreshold !== undefined) {
			rules.priorityThreshold = updates.priorityThreshold;
		}

		// Write updated rules
		writeFileSync(rulesPath, JSON.stringify(rules, null, 2) + '\n');

		// Sync to bd config
		try {
			await execAsync('bd-review-rules-loader --sync-to-config');
		} catch (syncErr) {
			const syncMessage = syncErr instanceof Error ? syncErr.message : 'Unknown sync error';
			console.warn('Failed to sync to bd config:', syncMessage);
		}

		return json({ success: true, rules });
	} catch (err) {
		console.error('Error updating review rules:', err);
		const message = err instanceof Error ? err.message : 'Failed to update review rules';
		return json(
			{ error: true, message },
			{ status: 500 }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();

		// Handle reset action
		if (body.action === 'reset') {
			const beadsDir = findBeadsDir();
			if (!beadsDir) {
				return json({ error: true, message: 'No .beads directory found' }, { status: 404 });
			}

			const rulesPath = resolve(beadsDir, 'review-rules.json');
			writeFileSync(rulesPath, JSON.stringify(DEFAULT_RULES, null, 2) + '\n');

			// Sync to bd config
			try {
				await execAsync('bd-review-rules-loader --sync-to-config');
			} catch (syncErr) {
				const syncMessage = syncErr instanceof Error ? syncErr.message : 'Unknown sync error';
				console.warn('Failed to sync to bd config:', syncMessage);
			}

			return json({ success: true, rules: DEFAULT_RULES, message: 'Rules reset to defaults' });
		}

		return json({ error: true, message: 'Unknown action' }, { status: 400 });
	} catch (err) {
		console.error('Error in review rules POST:', err);
		const message = err instanceof Error ? err.message : 'Failed to process request';
		return json(
			{ error: true, message },
			{ status: 500 }
		);
	}
}
