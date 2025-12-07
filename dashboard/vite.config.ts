import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketPlugin } from './src/lib/server/websocket/vitePlugin';

export default defineConfig({
	plugins: [sveltekit(), webSocketPlugin()]
});
