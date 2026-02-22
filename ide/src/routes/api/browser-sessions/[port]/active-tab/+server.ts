/**
 * GET /api/browser-sessions/[port]/active-tab
 * Fetches the active Chrome tab via CDP JSON API (avoids CORS).
 * Returns the URL and title of the most recently active tab.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface CdpTab {
	id: string;
	title: string;
	url: string;
	type: string;
	webSocketDebuggerUrl?: string;
}

export const GET: RequestHandler = async ({ params }) => {
	const port = parseInt(params.port, 10);

	if (isNaN(port) || port < 1 || port > 65535) {
		return json({ error: 'Invalid port number' }, { status: 400 });
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(`http://localhost:${port}/json`, {
			signal: controller.signal
		});
		clearTimeout(timeout);

		if (!response.ok) {
			return json(
				{ error: `CDP returned status ${response.status}` },
				{ status: 502 }
			);
		}

		const tabs: CdpTab[] = await response.json();

		// Filter to only page-type tabs (not devtools, extensions, etc.)
		const pages = tabs.filter(t => t.type === 'page');

		if (pages.length === 0) {
			return json({ error: 'No open tabs found', fallbackUrl: `http://localhost:${port}/json` }, { status: 404 });
		}

		// CDP /json returns tabs in order of most-recently-active first
		const activeTab = pages[0];

		return json({
			url: activeTab.url,
			title: activeTab.title,
			tabCount: pages.length
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';

		if (message.includes('abort') || message.includes('ABORT')) {
			return json(
				{ error: `Browser on port ${port} is not responding (timeout)` },
				{ status: 504 }
			);
		}

		return json(
			{ error: `Browser on port ${port} is not responding` },
			{ status: 502 }
		);
	}
};
