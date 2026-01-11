/**
 * Vite Plugin for WebSocket Server Integration
 *
 * This plugin hooks into Vite's dev server to attach our WebSocket server.
 * It enables real-time communication during development without needing
 * a separate server process.
 *
 * Usage in vite.config.ts:
 *   import { webSocketPlugin } from './src/lib/server/websocket/vitePlugin';
 *
 *   export default defineConfig({
 *     plugins: [sveltekit(), webSocketPlugin()]
 *   });
 */

import type { Plugin, ViteDevServer } from 'vite';
import { initializeWebSocket, shutdown, getStats } from './connectionPool.js';
import { startWatchers, stopWatchers } from './watchers.js';

/**
 * Create a Vite plugin that attaches WebSocket server to the dev server
 */
export function webSocketPlugin(): Plugin {
	return {
		name: 'websocket-server',

		configureServer(server: ViteDevServer) {
			if (!server.httpServer) {
				console.warn('[WS Plugin] No HTTP server available - WebSocket disabled');
				return;
			}

			// Initialize WebSocket server on the Vite HTTP server
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			initializeWebSocket(server.httpServer as any);

			// Log stats on server ready and start file watchers
			server.httpServer.on('listening', () => {
				console.log('[WS Plugin] WebSocket server attached to Vite dev server');
				startWatchers();
			});

			// Handle graceful shutdown
			const handleShutdown = async () => {
				console.log('[WS Plugin] Shutting down WebSocket server...');
				stopWatchers();
				await shutdown();
			};

			process.on('SIGTERM', handleShutdown);
			process.on('SIGINT', handleShutdown);

			// Add middleware for WebSocket stats endpoint (dev only)
			server.middlewares.use('/api/ws/stats', (req, res) => {
				if (req.method === 'GET') {
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(getStats(), null, 2));
				} else {
					res.statusCode = 405;
					res.end('Method not allowed');
				}
			});
		}
	};
}

export default webSocketPlugin;
