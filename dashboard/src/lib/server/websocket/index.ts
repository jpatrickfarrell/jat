/**
 * WebSocket Module - Public API
 *
 * Re-exports all public functions from the WebSocket connection pool.
 * Use this for server-side code that needs to broadcast events.
 *
 * @example
 * import { broadcast, broadcastTaskChange } from '$lib/server/websocket';
 *
 * // In an API endpoint after updating a task:
 * broadcastTaskChange(['new-task-id'], []);
 */

export {
	// Core functions
	initializeWebSocket,
	broadcast,
	shutdown,
	isInitialized,
	getStats,
	getChannelSubscriberCount,

	// Convenience broadcast functions
	broadcastAgentState,
	broadcastAgentUsage,
	broadcastTaskChange,
	broadcastTaskUpdate,
	broadcastOutput,
	broadcastNewMessage,

	// Types
	type Channel,
	type ChannelMessages
} from './connectionPool.js';

export { webSocketPlugin } from './vitePlugin.js';

export {
	startWatchers,
	stopWatchers,
	isWatchersRunning
} from './watchers.js';
