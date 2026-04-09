/**
 * Recording Summary API
 *
 * Reads a gzipped rrweb recording file and parses it into a structured
 * text summary suitable for LLM context injection. Combines rrweb event
 * analysis with console logs and network request data.
 *
 * POST /api/feedback/recordings/summary
 * Body: { recording_url: string, console_logs?: [], network_requests?: [] }
 * Returns: { ok: true, summary: string }
 */
import { json } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'fs';
import { gunzipSync } from 'zlib';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

// rrweb event types
const EventType = { FullSnapshot: 2, IncrementalSnapshot: 3, Meta: 4 };
const IncrementalSource = { MouseInteraction: 2, Input: 5 };
const MouseInteractions = { Click: 2, DblClick: 4 };

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Build a node ID → description map from an rrweb full snapshot.
 * Extracts tag name, id, class, and truncated text content.
 */
function buildNodeMap(node, map = new Map()) {
	if (!node) return map;

	if (node.type === 2 && node.tagName) {
		// Element node
		const attrs = node.attributes || {};
		const parts = [node.tagName.toLowerCase()];
		if (attrs.id) parts[0] += `#${attrs.id}`;
		if (attrs.class) {
			const classes = String(attrs.class).trim().split(/\s+/).slice(0, 3).join('.');
			if (classes) parts[0] += `.${classes}`;
		}

		// Get text content from first text child
		let text = '';
		if (node.childNodes) {
			for (const child of node.childNodes) {
				if (child.type === 3 && child.textContent) {
					text = child.textContent.trim().slice(0, 40);
					break;
				}
			}
		}

		map.set(node.id, { selector: parts[0], text });
	}

	if (node.childNodes) {
		for (const child of node.childNodes) {
			buildNodeMap(child, map);
		}
	}

	return map;
}

/**
 * Parse rrweb events into structured interaction data.
 */
function parseEvents(events) {
	if (!Array.isArray(events) || events.length === 0) {
		return { duration: 0, interactions: [] };
	}

	// Build node map from first full snapshot
	let nodeMap = new Map();
	for (const evt of events) {
		if (evt.type === EventType.FullSnapshot && evt.data?.node) {
			nodeMap = buildNodeMap(evt.data.node);
			break;
		}
	}

	const firstTs = events[0].timestamp;
	const lastTs = events[events.length - 1].timestamp;
	const duration = (lastTs - firstTs) / 1000;

	const interactions = [];

	for (const evt of events) {
		if (evt.type !== EventType.IncrementalSnapshot || !evt.data) continue;

		const relativeMs = evt.timestamp - firstTs;
		const relativeSec = (relativeMs / 1000).toFixed(1);

		if (evt.data.source === IncrementalSource.MouseInteraction) {
			const mouseType = evt.data.type;
			if (mouseType === MouseInteractions.Click || mouseType === MouseInteractions.DblClick) {
				const nodeId = evt.data.id;
				const nodeInfo = nodeMap.get(nodeId);
				const action = mouseType === MouseInteractions.DblClick ? 'DBLCLICK' : 'CLICK';
				interactions.push({
					time: relativeSec,
					action,
					selector: nodeInfo?.selector || `[node-${nodeId}]`,
					text: nodeInfo?.text || '',
				});
			}
		} else if (evt.data.source === IncrementalSource.Input) {
			const nodeId = evt.data.id;
			const nodeInfo = nodeMap.get(nodeId);
			const text = evt.data.text || '';
			interactions.push({
				time: relativeSec,
				action: 'INPUT',
				selector: nodeInfo?.selector || `[node-${nodeId}]`,
				text: text.length > 60 ? text.slice(0, 57) + '...' : text,
			});
		}
	}

	return { duration, interactions, startTimestamp: firstTs };
}

/**
 * Format the summary as a compact text block for LLM context.
 */
function formatSummary(parsed, consoleLogs, networkRequests) {
	const lines = [];
	lines.push(`[Session Recording Summary]`);
	lines.push(`Duration: ${parsed.duration.toFixed(1)}s`);
	lines.push('');

	// User interactions
	if (parsed.interactions.length > 0) {
		lines.push(`User Interactions (${parsed.interactions.length}):`);
		for (const i of parsed.interactions) {
			const textPart = i.text ? ` "${i.text}"` : '';
			lines.push(`  T+${i.time}s  ${i.action.padEnd(8)} ${i.selector}${textPart}`);
		}
		lines.push('');
	}

	// Console errors (filter to errors/warnings only)
	if (consoleLogs && consoleLogs.length > 0) {
		const errors = consoleLogs.filter(
			(l) => l.type === 'error' || l.type === 'warn'
		);
		if (errors.length > 0) {
			lines.push(`Console Errors (${errors.length}):`);
			for (const log of errors) {
				const relSec = parsed.startTimestamp
					? ((log.timestampMs - parsed.startTimestamp) / 1000).toFixed(1)
					: '?';
				const msg = log.message.length > 120
					? log.message.slice(0, 117) + '...'
					: log.message;
				lines.push(`  T+${relSec}s  ${log.type.toUpperCase()}  ${msg}`);
			}
			lines.push('');
		}
	}

	// Failed network requests (status >= 400 or error)
	if (networkRequests && networkRequests.length > 0) {
		const failed = networkRequests.filter(
			(r) => (r.status !== null && r.status >= 400) || r.error
		);
		if (failed.length > 0) {
			lines.push(`Failed Network Requests (${failed.length}):`);
			for (const req of failed) {
				const relSec = parsed.startTimestamp
					? ((req.timestampMs - parsed.startTimestamp) / 1000).toFixed(1)
					: '?';
				const status = req.error ? `ERROR: ${req.error}` : `${req.status}`;
				const duration = req.duration ? ` (${req.duration}ms)` : '';
				const url = req.url.length > 80 ? req.url.slice(0, 77) + '...' : req.url;
				lines.push(`  T+${relSec}s  ${req.method} ${url} -> ${status}${duration}`);
			}
			lines.push('');
		}
	}

	return lines.join('\n').trim();
}

export async function POST({ request }) {
	try {
		const body = await request.json();

		if (!body.recording_url || typeof body.recording_url !== 'string') {
			return json(
				{ ok: false, error: 'recording_url is required' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		const filepath = body.recording_url;

		if (!existsSync(filepath)) {
			return json(
				{ ok: false, error: 'Recording file not found' },
				{ status: 404, headers: CORS_HEADERS }
			);
		}

		// Read and decompress
		const compressed = readFileSync(filepath);
		const eventsJson = gunzipSync(compressed).toString('utf-8');
		const events = JSON.parse(eventsJson);

		// Parse rrweb events
		const parsed = parseEvents(events);

		// Build summary text
		const summary = formatSummary(
			parsed,
			body.console_logs || null,
			body.network_requests || null
		);

		return json(
			{ ok: true, summary, duration: parsed.duration, interactionCount: parsed.interactions.length },
			{ headers: CORS_HEADERS }
		);
	} catch (err) {
		console.error('[recording-summary] Error:', err);
		return json(
			{ ok: false, error: err.message || 'Failed to generate summary' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
