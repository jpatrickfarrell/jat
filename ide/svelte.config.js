import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using adapter-node for server-side SQLite database queries
		adapter: adapter(),
		// Disable CSRF origin check: adapter-node defaults to https:// protocol when
		// determining url.origin, but the IDE is served over HTTP (Tailscale, localhost).
		// This causes multipart/form-data uploads (file attachments) to fail with 403
		// because the browser sends Origin: http://... but the server expects https://.
		// Safe to disable for a local dev tool behind Tailscale.
		csrf: { checkOrigin: false }
	},

	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'control-shift',
			showToggleButton: 'always',
			toggleButtonPos: 'bottom-left'
		}
	}
};

export default config;
