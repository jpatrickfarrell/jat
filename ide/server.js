/**
 * JAT IDE Production Server
 *
 * Wraps the SvelteKit adapter-node handler with WebSocket support.
 * In dev mode, WebSocket is attached via Vite plugin. In production,
 * this script creates the HTTP server, attaches the SvelteKit handler,
 * and initializes WebSocket + file watchers.
 *
 * Usage: PORT=3333 node server.js
 */

import http from 'node:http';
import process from 'node:process';
import { handler } from './build/handler.js';

// WebSocket modules — imported from source tree since Vite doesn't bundle them
import { initializeWebSocket, shutdown as shutdownWS } from './src/lib/server/websocket/connectionPool.js';
import { startWatchers, stopWatchers } from './src/lib/server/websocket/watchers.js';

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3000';

// Create HTTP server with SvelteKit handler
const server = http.createServer(handler);

// Attach WebSocket server (handles /ws upgrade requests)
initializeWebSocket(server);

// Start listening
server.listen({ host, port: parseInt(port) }, () => {
	console.log(`Listening on http://${host}:${port}`);

	// Start file watchers after server is ready
	startWatchers();
});

// Graceful shutdown
let isShuttingDown = false;

async function gracefulShutdown(signal) {
	if (isShuttingDown) return;
	isShuttingDown = true;

	console.log(`[Server] ${signal} received, shutting down...`);

	stopWatchers();
	await shutdownWS();

	server.close(() => {
		console.log('[Server] HTTP server closed');
		process.exit(0);
	});

	// Force exit after 10 seconds
	setTimeout(() => {
		console.warn('[Server] Forced exit after timeout');
		process.exit(1);
	}, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
