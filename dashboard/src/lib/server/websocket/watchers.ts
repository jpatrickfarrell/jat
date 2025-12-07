/**
 * File Watchers for WebSocket Event Broadcasting
 *
 * Watches key files and broadcasts changes to WebSocket subscribers.
 * This replaces/complements the existing SSE implementation for tasks.
 *
 * Watched files:
 * - .beads/issues.jsonl - Task changes (new, removed, updated)
 * - .claude/sessions/agent-*.txt - Agent state changes
 *
 * Usage:
 *   import { startWatchers, stopWatchers } from '$lib/server/websocket/watchers';
 *
 *   // Start watching (typically called after WebSocket server init)
 *   startWatchers();
 *
 *   // Stop watching (typically called on shutdown)
 *   stopWatchers();
 */

import { watch, type FSWatcher } from 'fs';
import { readFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { broadcastTaskChange, broadcastAgentState, isInitialized } from './connectionPool.js';

// ============================================================================
// Configuration
// ============================================================================

// Dashboard runs from /home/jw/code/jat/dashboard
// Beads file is at /home/jw/code/jat/.beads/issues.jsonl (parent directory)
const PROJECT_ROOT = join(process.cwd(), '..');
const BEADS_FILE = join(PROJECT_ROOT, '.beads', 'issues.jsonl');
const BEADS_DIR = dirname(BEADS_FILE);
const BEADS_FILENAME = basename(BEADS_FILE);

const SESSIONS_DIR = join(PROJECT_ROOT, '.claude', 'sessions');

// ============================================================================
// State
// ============================================================================

let beadsWatcher: FSWatcher | null = null;
let sessionsWatcher: FSWatcher | null = null;
let debounceTimers: Map<string, NodeJS.Timeout> = new Map();
let previousTaskIds = new Set<string>();
let isWatching = false;

// ============================================================================
// Task (Beads) Watcher
// ============================================================================

/**
 * Parse task IDs from the beads JSONL file
 */
async function getTaskIds(): Promise<Set<string>> {
	try {
		const content = await readFile(BEADS_FILE, 'utf-8');
		const ids = new Set<string>();
		for (const line of content.split('\n')) {
			if (!line.trim()) continue;
			try {
				const task = JSON.parse(line);
				if (task.id) ids.add(task.id);
			} catch {
				// Skip invalid lines
			}
		}
		return ids;
	} catch {
		return new Set();
	}
}

/**
 * Check for task changes and broadcast if any
 */
async function checkTaskChanges(): Promise<void> {
	if (!isInitialized()) return;

	const currentIds = await getTaskIds();

	// Find new tasks
	const newTasks: string[] = [];
	for (const id of currentIds) {
		if (!previousTaskIds.has(id)) {
			newTasks.push(id);
		}
	}

	// Find removed tasks
	const removedTasks: string[] = [];
	for (const id of previousTaskIds) {
		if (!currentIds.has(id)) {
			removedTasks.push(id);
		}
	}

	previousTaskIds = currentIds;

	// Broadcast changes
	if (newTasks.length > 0 || removedTasks.length > 0) {
		console.log(`[WS Watcher] Task changes: +${newTasks.length} -${removedTasks.length}`);
		broadcastTaskChange(newTasks, removedTasks);
	}
}

/**
 * Start watching the beads file
 */
function startBeadsWatcher(): void {
	if (beadsWatcher) {
		console.log('[WS Watcher] Beads watcher already running');
		return;
	}

	console.log(`[WS Watcher] Starting beads watcher: ${BEADS_DIR}`);

	// Initialize previous task IDs
	getTaskIds().then(ids => {
		previousTaskIds = ids;
		console.log(`[WS Watcher] Initialized with ${ids.size} existing tasks`);
	});

	try {
		// Watch the directory (more reliable than watching the file directly)
		beadsWatcher = watch(BEADS_DIR, { persistent: false }, (eventType, filename) => {
			if (filename === BEADS_FILENAME || filename === null) {
				// Debounce rapid changes
				const existingTimer = debounceTimers.get('beads');
				if (existingTimer) clearTimeout(existingTimer);

				debounceTimers.set('beads', setTimeout(() => {
					checkTaskChanges();
					debounceTimers.delete('beads');
				}, 100));
			}
		});

		beadsWatcher.on('error', (err) => {
			console.error('[WS Watcher] Beads watcher error:', err);
		});

		console.log('[WS Watcher] Beads watcher started');
	} catch (err) {
		console.error('[WS Watcher] Failed to start beads watcher:', err);
	}
}

// ============================================================================
// Agent Sessions Watcher
// ============================================================================

/**
 * Parse agent name from session file
 */
async function readAgentName(filepath: string): Promise<string | null> {
	try {
		const content = await readFile(filepath, 'utf-8');
		return content.trim() || null;
	} catch {
		return null;
	}
}

/**
 * Handle agent session file change
 */
async function handleSessionChange(filename: string): Promise<void> {
	if (!isInitialized()) return;

	// Extract session ID from filename (agent-{sessionId}.txt)
	const match = filename.match(/^agent-(.+)\.txt$/);
	if (!match) return;

	const sessionId = match[1];
	const filepath = join(SESSIONS_DIR, filename);
	const agentName = await readAgentName(filepath);

	if (agentName) {
		console.log(`[WS Watcher] Agent session change: ${agentName} (${sessionId})`);
		broadcastAgentState(agentName, 'active', { sessionId });
	}
}

/**
 * Start watching agent session files
 */
function startSessionsWatcher(): void {
	if (sessionsWatcher) {
		console.log('[WS Watcher] Sessions watcher already running');
		return;
	}

	console.log(`[WS Watcher] Starting sessions watcher: ${SESSIONS_DIR}`);

	try {
		sessionsWatcher = watch(SESSIONS_DIR, { persistent: false }, (eventType, filename) => {
			if (filename && filename.startsWith('agent-') && filename.endsWith('.txt')) {
				// Debounce per-file
				const key = `session-${filename}`;
				const existingTimer = debounceTimers.get(key);
				if (existingTimer) clearTimeout(existingTimer);

				debounceTimers.set(key, setTimeout(() => {
					handleSessionChange(filename);
					debounceTimers.delete(key);
				}, 100));
			}
		});

		sessionsWatcher.on('error', (err) => {
			// Sessions directory might not exist initially
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
				console.log('[WS Watcher] Sessions directory does not exist yet');
			} else {
				console.error('[WS Watcher] Sessions watcher error:', err);
			}
		});

		console.log('[WS Watcher] Sessions watcher started');
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			console.log('[WS Watcher] Sessions directory does not exist yet');
		} else {
			console.error('[WS Watcher] Failed to start sessions watcher:', err);
		}
	}
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Start all file watchers
 * Call this after WebSocket server is initialized
 */
export function startWatchers(): void {
	if (isWatching) {
		console.log('[WS Watcher] Watchers already running');
		return;
	}

	console.log('[WS Watcher] Starting all watchers...');
	startBeadsWatcher();
	startSessionsWatcher();
	isWatching = true;
}

/**
 * Stop all file watchers
 * Call this on server shutdown
 */
export function stopWatchers(): void {
	console.log('[WS Watcher] Stopping all watchers...');

	// Clear all debounce timers
	debounceTimers.forEach(timer => clearTimeout(timer));
	debounceTimers.clear();

	// Close watchers
	if (beadsWatcher) {
		beadsWatcher.close();
		beadsWatcher = null;
	}

	if (sessionsWatcher) {
		sessionsWatcher.close();
		sessionsWatcher = null;
	}

	isWatching = false;
	console.log('[WS Watcher] All watchers stopped');
}

/**
 * Check if watchers are running
 */
export function isWatchersRunning(): boolean {
	return isWatching;
}
