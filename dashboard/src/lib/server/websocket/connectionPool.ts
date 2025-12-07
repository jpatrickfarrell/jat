/**
 * WebSocket Connection Pool Manager
 *
 * Manages persistent WebSocket connections to dashboard clients.
 * Supports channel-based message routing for agents, tasks, and output updates.
 *
 * Architecture:
 * - Single WebSocket server instance shared across the app
 * - Clients subscribe to channels (agents, tasks, output, messages)
 * - File watchers and API endpoints broadcast to relevant channels
 * - Connection pool tracks all active clients with metadata
 *
 * Usage:
 *   import { broadcast, subscribe, getStats } from '$lib/server/websocket/connectionPool';
 *
 *   // Server-side: Broadcast an event
 *   broadcast('tasks', { type: 'task-updated', task: {...} });
 *
 *   // Client metadata is tracked per connection
 *   getStats(); // Returns { totalClients, channelSubscribers, uptime }
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server as HttpServer } from 'http';

// ============================================================================
// Types
// ============================================================================

/** Supported broadcast channels */
export type Channel = 'agents' | 'tasks' | 'output' | 'messages' | 'system';

/** Message types for each channel */
export interface ChannelMessages {
	agents: {
		type: 'agent-state-change' | 'agent-usage-update' | 'agent-activity';
		agentName: string;
		data: unknown;
	};
	tasks: {
		type: 'task-change' | 'task-updated' | 'task-created' | 'task-deleted';
		taskId?: string;
		newTasks?: string[];
		removedTasks?: string[];
		data?: unknown;
	};
	output: {
		type: 'output-update';
		sessionName: string;
		output: string;
		lineCount: number;
	};
	messages: {
		type: 'new-message' | 'message-ack';
		agentName: string;
		data: unknown;
	};
	system: {
		type: 'connected' | 'heartbeat' | 'error' | 'subscribed' | 'unsubscribed';
		message?: string;
		channels?: Channel[];
	};
}

/** Client subscription request */
interface SubscribeMessage {
	action: 'subscribe' | 'unsubscribe';
	channels: Channel[];
}

/** Client metadata stored per connection */
interface ClientMetadata {
	id: string;
	connectedAt: Date;
	subscribedChannels: Set<Channel>;
	lastHeartbeat: Date;
	userAgent?: string;
	remoteAddress?: string;
}

// ============================================================================
// Connection Pool State
// ============================================================================

/** WebSocket server instance (singleton) */
let wss: WebSocketServer | null = null;

/** Map of WebSocket connections to their metadata */
const clients = new Map<WebSocket, ClientMetadata>();

/** Channel subscription map for efficient broadcasting */
const channelSubscribers = new Map<Channel, Set<WebSocket>>();

/** Server start time for uptime tracking */
let serverStartTime: Date | null = null;

/** Heartbeat interval handle */
let heartbeatInterval: NodeJS.Timeout | null = null;

/** Unique client ID counter */
let clientIdCounter = 0;

// Initialize channel subscriber sets
const allChannels: Channel[] = ['agents', 'tasks', 'output', 'messages', 'system'];
allChannels.forEach(channel => {
	channelSubscribers.set(channel, new Set());
});

// ============================================================================
// WebSocket Server Setup
// ============================================================================

/**
 * Initialize the WebSocket server on an HTTP server
 * Called by Vite plugin (dev) or custom server (prod)
 */
export function initializeWebSocket(httpServer: HttpServer): WebSocketServer {
	if (wss) {
		console.log('[WS] WebSocket server already initialized');
		return wss;
	}

	console.log('[WS] Initializing WebSocket server...');

	// Create WebSocket server without attaching to httpServer directly
	// This avoids conflicts with SvelteKit's request handling
	wss = new WebSocketServer({ noServer: true });

	serverStartTime = new Date();

	wss.on('connection', handleConnection);
	wss.on('error', (error) => {
		console.error('[WS] Server error:', error);
	});

	// Handle upgrade requests manually before SvelteKit can intercept them
	httpServer.on('upgrade', (request, socket, head) => {
		const url = request.url || '';

		// Only handle /ws path for our WebSocket server
		if (url === '/ws' || url.startsWith('/ws?')) {
			wss!.handleUpgrade(request, socket, head, (ws) => {
				wss!.emit('connection', ws, request);
			});
		}
		// Let other upgrade requests (like Vite HMR) pass through
	});

	// Start heartbeat interval (every 30 seconds)
	heartbeatInterval = setInterval(sendHeartbeats, 30000);

	console.log('[WS] WebSocket server ready on /ws');
	return wss;
}

/**
 * Handle new WebSocket connection
 */
function handleConnection(ws: WebSocket, request: IncomingMessage): void {
	const clientId = `client-${++clientIdCounter}`;

	const metadata: ClientMetadata = {
		id: clientId,
		connectedAt: new Date(),
		subscribedChannels: new Set(),
		lastHeartbeat: new Date(),
		userAgent: request.headers['user-agent'],
		remoteAddress: request.socket.remoteAddress
	};

	clients.set(ws, metadata);
	console.log(`[WS] Client connected: ${clientId} (total: ${clients.size})`);

	// Send welcome message
	sendToClient(ws, 'system', {
		type: 'connected',
		message: `Connected as ${clientId}`,
		channels: []
	});

	// Handle incoming messages
	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString());
			handleClientMessage(ws, message);
		} catch (error) {
			console.error(`[WS] Failed to parse message from ${clientId}:`, error);
			sendToClient(ws, 'system', {
				type: 'error',
				message: 'Invalid JSON message'
			});
		}
	});

	// Handle pong (heartbeat response)
	ws.on('pong', () => {
		const meta = clients.get(ws);
		if (meta) {
			meta.lastHeartbeat = new Date();
		}
	});

	// Handle disconnection
	ws.on('close', () => {
		handleDisconnection(ws);
	});

	ws.on('error', (error) => {
		console.error(`[WS] Client ${clientId} error:`, error);
	});
}

/**
 * Handle client disconnection - cleanup subscriptions
 */
function handleDisconnection(ws: WebSocket): void {
	const meta = clients.get(ws);
	if (meta) {
		console.log(`[WS] Client disconnected: ${meta.id}`);

		// Remove from all channel subscriptions
		meta.subscribedChannels.forEach(channel => {
			const subscribers = channelSubscribers.get(channel);
			subscribers?.delete(ws);
		});
	}

	clients.delete(ws);
	console.log(`[WS] Total clients: ${clients.size}`);
}

/**
 * Handle messages from client
 */
function handleClientMessage(ws: WebSocket, message: unknown): void {
	const meta = clients.get(ws);
	if (!meta) return;

	// Type guard for subscribe/unsubscribe messages
	if (isSubscribeMessage(message)) {
		if (message.action === 'subscribe') {
			subscribeClient(ws, message.channels);
		} else if (message.action === 'unsubscribe') {
			unsubscribeClient(ws, message.channels);
		}
	}
}

function isSubscribeMessage(msg: unknown): msg is SubscribeMessage {
	return (
		typeof msg === 'object' &&
		msg !== null &&
		'action' in msg &&
		(msg.action === 'subscribe' || msg.action === 'unsubscribe') &&
		'channels' in msg &&
		Array.isArray((msg as SubscribeMessage).channels)
	);
}

/**
 * Subscribe a client to channels
 */
function subscribeClient(ws: WebSocket, channels: Channel[]): void {
	const meta = clients.get(ws);
	if (!meta) return;

	const subscribedChannels: Channel[] = [];

	channels.forEach(channel => {
		if (allChannels.includes(channel)) {
			meta.subscribedChannels.add(channel);
			channelSubscribers.get(channel)?.add(ws);
			subscribedChannels.push(channel);
		}
	});

	console.log(`[WS] Client ${meta.id} subscribed to: ${subscribedChannels.join(', ')}`);

	sendToClient(ws, 'system', {
		type: 'subscribed',
		message: `Subscribed to ${subscribedChannels.length} channels`,
		channels: subscribedChannels
	});
}

/**
 * Unsubscribe a client from channels
 */
function unsubscribeClient(ws: WebSocket, channels: Channel[]): void {
	const meta = clients.get(ws);
	if (!meta) return;

	const unsubscribedChannels: Channel[] = [];

	channels.forEach(channel => {
		if (meta.subscribedChannels.has(channel)) {
			meta.subscribedChannels.delete(channel);
			channelSubscribers.get(channel)?.delete(ws);
			unsubscribedChannels.push(channel);
		}
	});

	console.log(`[WS] Client ${meta.id} unsubscribed from: ${unsubscribedChannels.join(', ')}`);

	sendToClient(ws, 'system', {
		type: 'unsubscribed',
		message: `Unsubscribed from ${unsubscribedChannels.length} channels`,
		channels: unsubscribedChannels
	});
}

// ============================================================================
// Broadcasting
// ============================================================================

/**
 * Broadcast a message to all subscribers of a channel
 *
 * @param channel - The channel to broadcast to
 * @param message - The message payload (will be JSON stringified)
 * @returns Number of clients the message was sent to
 *
 * @example
 * broadcast('tasks', { type: 'task-updated', taskId: 'jat-abc', data: {...} });
 */
export function broadcast<C extends Channel>(
	channel: C,
	message: ChannelMessages[C]
): number {
	const subscribers = channelSubscribers.get(channel);
	if (!subscribers || subscribers.size === 0) {
		return 0;
	}

	const payload = JSON.stringify({
		channel,
		timestamp: Date.now(),
		...message
	});

	let sentCount = 0;
	subscribers.forEach(ws => {
		if (ws.readyState === WebSocket.OPEN) {
			try {
				ws.send(payload);
				sentCount++;
			} catch (error) {
				console.error(`[WS] Failed to send to client:`, error);
			}
		}
	});

	return sentCount;
}

/**
 * Send a message to a specific client
 */
function sendToClient<C extends Channel>(
	ws: WebSocket,
	channel: C,
	message: ChannelMessages[C]
): boolean {
	if (ws.readyState !== WebSocket.OPEN) {
		return false;
	}

	try {
		const payload = JSON.stringify({
			channel,
			timestamp: Date.now(),
			...message
		});
		ws.send(payload);
		return true;
	} catch (error) {
		console.error('[WS] Failed to send to client:', error);
		return false;
	}
}

/**
 * Send heartbeat pings to all clients
 * Clients that don't respond are considered dead
 */
function sendHeartbeats(): void {
	const now = new Date();
	const staleThreshold = 60000; // 60 seconds

	clients.forEach((meta, ws) => {
		// Check if client is stale (no pong in 60 seconds)
		if (now.getTime() - meta.lastHeartbeat.getTime() > staleThreshold) {
			console.log(`[WS] Terminating stale client: ${meta.id}`);
			ws.terminate();
			return;
		}

		// Send ping
		if (ws.readyState === WebSocket.OPEN) {
			ws.ping();
		}
	});

	// Also broadcast heartbeat to all system channel subscribers
	broadcast('system', { type: 'heartbeat' });
}

// ============================================================================
// Stats & Utilities
// ============================================================================

/**
 * Get connection pool statistics
 */
export function getStats(): {
	totalClients: number;
	channelStats: Record<Channel, number>;
	uptimeSeconds: number;
	clientDetails: Array<{
		id: string;
		connectedAt: string;
		channels: Channel[];
		lastHeartbeat: string;
	}>;
} {
	const channelStats: Record<Channel, number> = {} as Record<Channel, number>;
	allChannels.forEach(channel => {
		channelStats[channel] = channelSubscribers.get(channel)?.size || 0;
	});

	const clientDetails = Array.from(clients.entries()).map(([, meta]) => ({
		id: meta.id,
		connectedAt: meta.connectedAt.toISOString(),
		channels: Array.from(meta.subscribedChannels) as Channel[],
		lastHeartbeat: meta.lastHeartbeat.toISOString()
	}));

	return {
		totalClients: clients.size,
		channelStats,
		uptimeSeconds: serverStartTime
			? Math.floor((Date.now() - serverStartTime.getTime()) / 1000)
			: 0,
		clientDetails
	};
}

/**
 * Check if WebSocket server is initialized
 */
export function isInitialized(): boolean {
	return wss !== null;
}

/**
 * Get subscriber count for a specific channel
 */
export function getChannelSubscriberCount(channel: Channel): number {
	return channelSubscribers.get(channel)?.size || 0;
}

/**
 * Shutdown WebSocket server gracefully
 */
export function shutdown(): Promise<void> {
	return new Promise((resolve) => {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
			heartbeatInterval = null;
		}

		if (!wss) {
			resolve();
			return;
		}

		// Notify all clients of shutdown
		broadcast('system', { type: 'error', message: 'Server shutting down' });

		// Close all connections
		clients.forEach((meta, ws) => {
			ws.close(1001, 'Server shutdown');
		});
		clients.clear();

		// Reset channel subscribers
		allChannels.forEach(channel => {
			channelSubscribers.get(channel)?.clear();
		});

		wss.close(() => {
			console.log('[WS] WebSocket server closed');
			wss = null;
			serverStartTime = null;
			resolve();
		});
	});
}

// ============================================================================
// Convenience Functions for Specific Channels
// ============================================================================

/**
 * Broadcast agent state change
 */
export function broadcastAgentState(
	agentName: string,
	state: string,
	data?: unknown
): number {
	return broadcast('agents', {
		type: 'agent-state-change',
		agentName,
		data: { state, ...((data as object) || {}) }
	});
}

/**
 * Broadcast agent usage update
 */
export function broadcastAgentUsage(
	agentName: string,
	usage: { tokens: number; cost: number }
): number {
	return broadcast('agents', {
		type: 'agent-usage-update',
		agentName,
		data: usage
	});
}

/**
 * Broadcast task change event
 */
export function broadcastTaskChange(
	newTasks: string[] = [],
	removedTasks: string[] = []
): number {
	return broadcast('tasks', {
		type: 'task-change',
		newTasks,
		removedTasks
	});
}

/**
 * Broadcast task update
 */
export function broadcastTaskUpdate(taskId: string, data: unknown): number {
	return broadcast('tasks', {
		type: 'task-updated',
		taskId,
		data
	});
}

/**
 * Broadcast output update for a session
 */
export function broadcastOutput(
	sessionName: string,
	output: string,
	lineCount: number
): number {
	return broadcast('output', {
		type: 'output-update',
		sessionName,
		output,
		lineCount
	});
}

/**
 * Broadcast new agent mail message
 */
export function broadcastNewMessage(agentName: string, messageData: unknown): number {
	return broadcast('messages', {
		type: 'new-message',
		agentName,
		data: messageData
	});
}
