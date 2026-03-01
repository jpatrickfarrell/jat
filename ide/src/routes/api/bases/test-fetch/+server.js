/**
 * POST /api/bases/test-fetch
 *
 * Test-fetch a URL and return the extracted content.
 * Used by BaseEditor's "Test" button to preview external source content.
 */
import { json } from '@sveltejs/kit';

/**
 * Basic HTML to markdown conversion.
 * Strips scripts/styles, converts headings, paragraphs, lists, links, code.
 */
function htmlToMarkdown(html) {
	let md = html;
	// Remove script and style blocks
	md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
	md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
	// Convert headings
	md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
	md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
	md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
	md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
	// Convert paragraphs
	md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
	// Convert list items
	md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
	// Convert bold/italic
	md = md.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
	md = md.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
	// Convert links
	md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
	// Convert code blocks
	md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n');
	md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
	// Strip remaining tags
	md = md.replace(/<[^>]+>/g, '');
	// Decode HTML entities
	md = md.replace(/&amp;/g, '&');
	md = md.replace(/&lt;/g, '<');
	md = md.replace(/&gt;/g, '>');
	md = md.replace(/&quot;/g, '"');
	md = md.replace(/&#39;/g, "'");
	md = md.replace(/&nbsp;/g, ' ');
	// Collapse whitespace
	md = md.replace(/\n{3,}/g, '\n\n');
	return md.trim();
}

export async function POST({ request }) {
	try {
		const { url } = await request.json();
		if (!url) {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		// Validate URL
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			return json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 });
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30000);

		try {
			const res = await fetch(url, {
				signal: controller.signal,
				headers: {
					'User-Agent': 'JAT-Scheduler/1.0 (Knowledge Base Fetch)',
					'Accept': 'text/html, application/json, text/plain, */*',
				},
			});

			clearTimeout(timeout);

			if (!res.ok) {
				return json({ error: `HTTP ${res.status} ${res.statusText}` }, { status: 200 });
			}

			const contentType = res.headers.get('content-type') || '';
			const body = await res.text();

			let content;
			if (contentType.includes('application/json')) {
				try {
					content = JSON.stringify(JSON.parse(body), null, 2);
				} catch {
					content = body;
				}
			} else if (contentType.includes('text/html')) {
				content = htmlToMarkdown(body);
			} else {
				content = body;
			}

			const tokenEstimate = Math.ceil(content.length / 4);

			return json({
				content,
				contentType,
				tokenEstimate,
				contentLength: content.length,
			});
		} catch (err) {
			clearTimeout(timeout);
			if (err.name === 'AbortError') {
				return json({ error: 'Request timed out after 30 seconds' }, { status: 200 });
			}
			return json({ error: err.message || 'Fetch failed' }, { status: 200 });
		}
	} catch (err) {
		return json({ error: err.message || 'Server error' }, { status: 500 });
	}
}
