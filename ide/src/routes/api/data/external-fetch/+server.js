/**
 * External Data Source Fetch API
 * POST /api/data/external-fetch
 *
 * Actions:
 *   fetch       — Fetch rows + infer schema from external source
 *   list-tables — List tables in a Coda doc or Airtable base
 *   check-auth  — Check if API key is configured for a source
 *
 * Sources: coda, gsheet, notion, airtable, csv-url
 */
import { json } from '@sveltejs/kit';
import { getCustomApiKey, getApiKeyWithFallback } from '$lib/utils/credentials.js';
import { parseDelimited } from '$lib/server/tsvParser.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { source, action = 'fetch' } = body;

		if (!source) {
			return json({ error: 'Missing required field: source' }, { status: 400 });
		}

		// ── check-auth: Return whether API key is configured ──
		if (action === 'check-auth') {
			return json({ hasKey: !!getKeyForSource(source) });
		}

		// ── list-tables ──
		if (action === 'list-tables') {
			if (source === 'coda') return await listCodaTables(body);
			if (source === 'airtable') return await listAirtableTables(body);
			return json({ error: `list-tables not supported for ${source}` }, { status: 400 });
		}

		// ── fetch ──
		if (source === 'coda') return await fetchCoda(body);
		if (source === 'gsheet') return await fetchGoogleSheet(body);
		if (source === 'notion') return await fetchNotion(body);
		if (source === 'airtable') return await fetchAirtable(body);
		if (source === 'csv-url') return await fetchCsvUrl(body);

		return json({ error: `Unknown source: ${source}` }, { status: 400 });
	} catch (e) {
		console.error('[external-fetch] Error:', e);
		return json({ error: e?.message || 'Internal server error' }, { status: 500 });
	}
}

// ─── Credential resolution ──────────────────────────────────────────

function getKeyForSource(source) {
	switch (source) {
		case 'coda':
			return getCustomApiKey('coda-api-key') || process.env.CODA_API_KEY;
		case 'gsheet':
			return getApiKeyWithFallback('google', 'GEMINI_API_KEY') || process.env.GOOGLE_API_KEY;
		case 'notion':
			return getCustomApiKey('notion') || process.env.NOTION_API_KEY;
		case 'airtable':
			return getCustomApiKey('airtable') || process.env.AIRTABLE_API_KEY;
		case 'csv-url':
			return '__no_key_needed__';
		default:
			return undefined;
	}
}

function requireKey(source) {
	const key = getKeyForSource(source);
	if (!key) throw new Error(`API key not configured for ${source}. Add it in Settings → API Keys.`);
	return key;
}

// ─── Column name sanitization (matches coda-import bash tool) ──────

function sanitizeColumnName(name) {
	return name
		.toLowerCase()
		.replace(/[^a-zA-Z0-9_]/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '');
}

// ─── Type inference from values ────────────────────────────────────

function inferColumnType(values) {
	const samples = values.filter(v => v != null && v !== '').slice(0, 50);
	if (samples.length === 0) return 'TEXT';

	let ints = 0, reals = 0;
	for (const v of samples) {
		if (typeof v === 'boolean') return 'INTEGER';
		if (typeof v === 'number') {
			Number.isInteger(v) ? ints++ : reals++;
		} else {
			const s = String(v).trim();
			if (s !== '' && !isNaN(Number(s))) {
				s.includes('.') ? reals++ : ints++;
			}
		}
	}

	const threshold = samples.length * 0.8;
	if (reals >= 1 && (ints + reals) >= threshold) return 'REAL';
	if (ints >= threshold) return 'INTEGER';
	return 'TEXT';
}

// ─── Paginated fetch helper ────────────────────────────────────────

async function fetchAllPages(url, headers, getItems, getNextUrl) {
	const allItems = [];
	let currentUrl = url;
	let pages = 0;
	const maxPages = 100;

	while (currentUrl && pages < maxPages) {
		const res = await fetch(currentUrl, { headers });
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`API error (${res.status}): ${text.slice(0, 200)}`);
		}
		const data = await res.json();
		const items = getItems(data);
		allItems.push(...items);
		currentUrl = getNextUrl(data);
		pages++;
	}

	return allItems;
}

// ─── Coda ──────────────────────────────────────────────────────────

/**
 * Resolve a Coda doc ID from user input (URL, URL slug, or raw API ID).
 *
 * Coda URL formats:
 *   https://coda.io/d/DocName_dXXXXX                    (doc root)
 *   https://coda.io/d/DocName_dXXXXX/PageName_sYYYYY    (specific page)
 * The `_dXXXXX` part is a URL slug — `d` is a type prefix, actual API ID is `XXXXX`.
 *
 * Uses URL regex extraction first (fast), then falls back to resolveBrowserLink API.
 */
async function resolveCodaDocId(rawInput, apiKey) {
	if (!rawInput) return null;

	// Full URL — try regex extraction first (no API call needed)
	if (rawInput.includes('coda.io')) {
		// Match _d{docId} in the URL path: /d/Name_d{docId} or /d/Name_d{docId}/...
		const slugMatch = rawInput.match(/coda\.io\/d\/[^/]*_d([A-Za-z0-9_-]+)/);
		if (slugMatch) {
			// Validate extracted ID against the API
			try {
				const res = await fetch(`https://coda.io/apis/v1/docs/${slugMatch[1]}`, {
					headers: { Authorization: `Bearer ${apiKey}` }
				});
				if (res.ok) return slugMatch[1];
			} catch { /* fall through to resolveBrowserLink */ }
		}
	}

	// Full URL — use resolveBrowserLink as fallback
	if (rawInput.includes('coda.io')) {
		try {
			const res = await fetch(
				`https://coda.io/apis/v1/resolveBrowserLink?url=${encodeURIComponent(rawInput)}`,
				{ headers: { Authorization: `Bearer ${apiKey}` } }
			);
			if (res.ok) {
				const data = await res.json();
				// resolveBrowserLink may return a doc or a page resource.
				// For pages, the doc ID is embedded in the href: /docs/{docId}/pages/...
				if (data.resource?.type === 'doc' && data.resource?.id) {
					return data.resource.id;
				}
				if (data.resource?.href) {
					const docMatch = data.resource.href.match(/\/docs\/([^/]+)/);
					if (docMatch) return docMatch[1];
				}
				if (data.resource?.id) return data.resource.id;
			}
		} catch { /* fall through */ }
	}

	// Try as a raw API ID first (e.g., wZitc5jGgO)
	try {
		const res = await fetch(`https://coda.io/apis/v1/docs/${rawInput}`, {
			headers: { Authorization: `Bearer ${apiKey}` }
		});
		if (res.ok) return rawInput;
	} catch { /* fall through */ }

	// Might be a URL slug with `d` prefix (e.g., dHcmBh6Lxhn from URL _dHcmBh6Lxhn)
	// Try resolving via resolveBrowserLink with a constructed URL
	try {
		const syntheticUrl = `https://coda.io/d/_${rawInput}`;
		const res = await fetch(
			`https://coda.io/apis/v1/resolveBrowserLink?url=${encodeURIComponent(syntheticUrl)}`,
			{ headers: { Authorization: `Bearer ${apiKey}` } }
		);
		if (res.ok) {
			const data = await res.json();
			if (data.resource?.id) return data.resource.id;
		}
	} catch { /* fall through */ }

	// Last resort: return as-is (will fail with a clear API error)
	return rawInput;
}

function parseCodaInput(body) {
	let { docId, tableId } = body;

	// Extract table ID from URL if present
	if (docId && docId.includes('coda.io') && !tableId) {
		const tblMatch = docId.match(/[?&]table=([\w-]+)/) || docId.match(/\/table\/([\w-]+)/);
		if (tblMatch) tableId = tblMatch[1];
	}

	return { docId, tableId };
}

async function listCodaTables(body) {
	const key = requireKey('coda');
	const { docId: rawDocId } = parseCodaInput(body);
	if (!rawDocId) return json({ error: 'Missing docId' }, { status: 400 });

	const docId = await resolveCodaDocId(rawDocId, key);

	const tables = await fetchAllPages(
		`https://coda.io/apis/v1/docs/${docId}/tables?limit=100`,
		{ Authorization: `Bearer ${key}` },
		data => data.items || [],
		data => data.nextPageLink || null
	);

	return json({
		tables: tables.map(t => ({
			id: t.id,
			name: t.name,
			rowCount: t.rowCount ?? null
		}))
	});
}

async function fetchCoda(body) {
	const key = requireKey('coda');
	const { docId: rawDocId, tableId } = parseCodaInput(body);
	if (!rawDocId || !tableId) {
		return json({ error: 'Missing docId or tableId' }, { status: 400 });
	}

	const docId = await resolveCodaDocId(rawDocId, key);

	const allRows = await fetchAllPages(
		`https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/rows?useColumnNames=true&valueFormat=simple&limit=500`,
		{ Authorization: `Bearer ${key}` },
		data => data.items || [],
		data => data.nextPageLink || null
	);

	if (allRows.length === 0) {
		return json({ rows: [], columns: [], metadata: { sourceName: 'Coda', rowCount: 0, suggestedTableName: '' } });
	}

	// Sanitize and build rows
	const { rows, columns } = processRows(allRows.map(r => r.values || {}));

	// Get suggested table name from the Coda table metadata
	let suggestedTableName = '';
	try {
		const metaRes = await fetch(`https://coda.io/apis/v1/docs/${docId}/tables/${tableId}`, {
			headers: { Authorization: `Bearer ${key}` }
		});
		if (metaRes.ok) {
			const meta = await metaRes.json();
			suggestedTableName = sanitizeColumnName(meta.name || '');
		}
	} catch { /* ignore */ }

	return json({
		rows,
		columns,
		metadata: { sourceName: 'Coda', rowCount: rows.length, suggestedTableName }
	});
}

// ─── Google Sheets ────────────────────────────────────────────────

function parseGsheetInput(body) {
	let { url, range } = body;
	let spreadsheetId = url || '';

	// Parse Google Sheets URL
	const match = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
	if (match) spreadsheetId = match[1];

	// Extract gid for sheet selection
	let gid = null;
	const gidMatch = (url || '').match(/[#?&]gid=(\d+)/);
	if (gidMatch) gid = gidMatch[1];

	return { spreadsheetId, range: range || 'Sheet1', gid };
}

async function fetchGoogleSheet(body) {
	const { spreadsheetId, range, gid } = parseGsheetInput(body);
	if (!spreadsheetId) {
		return json({ error: 'Missing Google Sheets URL or spreadsheet ID' }, { status: 400 });
	}

	const apiKey = getKeyForSource('gsheet');

	// Try Sheets API v4 first (requires API key)
	if (apiKey && apiKey !== '__no_key_needed__') {
		try {
			const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
			const res = await fetch(sheetsUrl);
			if (res.ok) {
				const data = await res.json();
				const values = data.values || [];
				if (values.length < 2) {
					return json({ rows: [], columns: [], metadata: { sourceName: 'Google Sheets', rowCount: 0, suggestedTableName: '' } });
				}

				const rawHeaders = values[0];
				const sanitizedHeaders = rawHeaders.map(h => sanitizeColumnName(String(h)));
				const dataRows = values.slice(1).map(row => {
					const obj = {};
					sanitizedHeaders.forEach((h, i) => {
						if (h) obj[h] = row[i] ?? '';
					});
					return obj;
				});

				const { rows, columns } = processRows(dataRows);

				return json({
					rows,
					columns,
					metadata: { sourceName: 'Google Sheets', rowCount: rows.length, suggestedTableName: `sheet_${spreadsheetId.slice(0, 8)}` }
				});
			}
		} catch { /* Fall through to CSV export */ }
	}

	// Fallback: public CSV export (works for public sheets, no API key needed)
	try {
		let csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
		if (gid) csvUrl += `&gid=${gid}`;

		const res = await fetch(csvUrl, { redirect: 'follow' });
		if (!res.ok) {
			throw new Error(`Could not access sheet. Make sure it's public or provide a Google API key.`);
		}

		const csvText = await res.text();
		const parsed = parseDelimited(csvText, { format: 'csv' });

		if (parsed.rows.length === 0) {
			return json({ rows: [], columns: [], metadata: { sourceName: 'Google Sheets', rowCount: 0, suggestedTableName: '' } });
		}

		const { rows, columns } = processRows(parsed.rows);

		return json({
			rows,
			columns,
			metadata: { sourceName: 'Google Sheets', rowCount: rows.length, suggestedTableName: `sheet_${spreadsheetId.slice(0, 8)}` }
		});
	} catch (e) {
		return json({ error: e.message || 'Failed to fetch Google Sheet' }, { status: 400 });
	}
}

// ─── Notion ───────────────────────────────────────────────────────

function parseNotionInput(body) {
	let { databaseId } = body;
	if (!databaseId) return { databaseId: '' };

	// Parse Notion URL - extract 32-char hex database ID
	const urlMatch = databaseId.match(/([a-f0-9]{32})/i);
	if (urlMatch) databaseId = urlMatch[1];

	// Format with hyphens for API (8-4-4-4-12)
	if (databaseId.length === 32 && !databaseId.includes('-')) {
		databaseId = `${databaseId.slice(0, 8)}-${databaseId.slice(8, 12)}-${databaseId.slice(12, 16)}-${databaseId.slice(16, 20)}-${databaseId.slice(20)}`;
	}

	return { databaseId };
}

function extractNotionValue(property) {
	if (!property) return '';
	const { type } = property;
	switch (type) {
		case 'title':
			return (property.title || []).map(t => t.plain_text).join('');
		case 'rich_text':
			return (property.rich_text || []).map(t => t.plain_text).join('');
		case 'number':
			return property.number;
		case 'select':
			return property.select?.name || '';
		case 'multi_select':
			return (property.multi_select || []).map(s => s.name).join(', ');
		case 'date':
			return property.date?.start || '';
		case 'checkbox':
			return property.checkbox ? 1 : 0;
		case 'url':
			return property.url || '';
		case 'email':
			return property.email || '';
		case 'phone_number':
			return property.phone_number || '';
		case 'status':
			return property.status?.name || '';
		case 'formula':
			return property.formula?.string || property.formula?.number || '';
		case 'rollup':
			return property.rollup?.number || (property.rollup?.array || []).map(i => i?.title?.[0]?.plain_text || i?.number || '').join(', ') || '';
		case 'people':
			return (property.people || []).map(p => p.name || p.id).join(', ');
		case 'created_time':
			return property.created_time || '';
		case 'last_edited_time':
			return property.last_edited_time || '';
		default:
			return '';
	}
}

async function fetchNotion(body) {
	const key = requireKey('notion');
	const { databaseId } = parseNotionInput(body);
	if (!databaseId) {
		return json({ error: 'Missing Notion database ID or URL' }, { status: 400 });
	}

	const headers = {
		Authorization: `Bearer ${key}`,
		'Notion-Version': '2022-06-28',
		'Content-Type': 'application/json'
	};

	// Paginated query
	const allResults = [];
	let hasMore = true;
	let startCursor = undefined;

	while (hasMore) {
		const queryBody = { page_size: 100 };
		if (startCursor) queryBody.start_cursor = startCursor;

		const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
			method: 'POST',
			headers,
			body: JSON.stringify(queryBody)
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Notion API error (${res.status}): ${text.slice(0, 200)}`);
		}

		const data = await res.json();
		allResults.push(...(data.results || []));
		hasMore = data.has_more;
		startCursor = data.next_cursor;
	}

	if (allResults.length === 0) {
		return json({ rows: [], columns: [], metadata: { sourceName: 'Notion', rowCount: 0, suggestedTableName: '' } });
	}

	// Collect property names and extract values
	const propNames = new Set();
	for (const page of allResults) {
		for (const key of Object.keys(page.properties || {})) {
			propNames.add(key);
		}
	}

	const rawRows = allResults.map(page => {
		const obj = {};
		for (const propName of propNames) {
			obj[propName] = extractNotionValue(page.properties?.[propName]);
		}
		return obj;
	});

	const { rows, columns } = processRows(rawRows);

	// Try to get database title
	let suggestedTableName = '';
	try {
		const dbRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, { headers });
		if (dbRes.ok) {
			const dbData = await dbRes.json();
			const title = dbData.title?.[0]?.plain_text || '';
			suggestedTableName = sanitizeColumnName(title);
		}
	} catch { /* ignore */ }

	return json({
		rows,
		columns,
		metadata: { sourceName: 'Notion', rowCount: rows.length, suggestedTableName }
	});
}

// ─── Airtable ─────────────────────────────────────────────────────

function parseAirtableInput(body) {
	let { baseId, tableId } = body;

	// Parse Airtable URL: https://airtable.com/appXXX/tblXXX/...
	if (baseId && baseId.includes('airtable.com')) {
		const appMatch = baseId.match(/(app[a-zA-Z0-9]+)/);
		if (appMatch) {
			const tblMatch = baseId.match(/(tbl[a-zA-Z0-9]+)/);
			if (tblMatch && !tableId) tableId = tblMatch[1];
			baseId = appMatch[1];
		}
	}

	return { baseId, tableId };
}

async function listAirtableTables(body) {
	const key = requireKey('airtable');
	const { baseId } = parseAirtableInput(body);
	if (!baseId) return json({ error: 'Missing baseId' }, { status: 400 });

	const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
		headers: { Authorization: `Bearer ${key}` }
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Airtable API error (${res.status}): ${text.slice(0, 200)}`);
	}

	const data = await res.json();

	return json({
		tables: (data.tables || []).map(t => ({
			id: t.id,
			name: t.name
		}))
	});
}

async function fetchAirtable(body) {
	const key = requireKey('airtable');
	const { baseId, tableId } = parseAirtableInput(body);
	if (!baseId || !tableId) {
		return json({ error: 'Missing baseId or tableId' }, { status: 400 });
	}

	// Paginated fetch
	const allRecords = [];
	let offset = undefined;

	while (true) {
		let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
		if (offset) url += `?offset=${offset}`;

		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${key}` }
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Airtable API error (${res.status}): ${text.slice(0, 200)}`);
		}

		const data = await res.json();
		allRecords.push(...(data.records || []));
		offset = data.offset;
		if (!offset) break;
	}

	if (allRecords.length === 0) {
		return json({ rows: [], columns: [], metadata: { sourceName: 'Airtable', rowCount: 0, suggestedTableName: '' } });
	}

	const rawRows = allRecords.map(r => r.fields || {});
	const { rows, columns } = processRows(rawRows);

	// Suggested table name from table ID
	const suggestedTableName = sanitizeColumnName(tableId);

	return json({
		rows,
		columns,
		metadata: { sourceName: 'Airtable', rowCount: rows.length, suggestedTableName }
	});
}

// ─── CSV URL ──────────────────────────────────────────────────────

async function fetchCsvUrl(body) {
	const { url } = body;
	if (!url) {
		return json({ error: 'Missing URL' }, { status: 400 });
	}

	const res = await fetch(url, { redirect: 'follow' });
	if (!res.ok) {
		throw new Error(`Failed to fetch URL (${res.status}): ${url}`);
	}

	const text = await res.text();
	if (!text.trim()) {
		return json({ rows: [], columns: [], metadata: { sourceName: 'CSV URL', rowCount: 0, suggestedTableName: '' } });
	}

	const parsed = parseDelimited(text);

	if (parsed.rows.length === 0) {
		return json({ rows: [], columns: [], metadata: { sourceName: 'CSV URL', rowCount: 0, suggestedTableName: '' } });
	}

	const { rows, columns } = processRows(parsed.rows);

	// Suggest table name from URL filename
	let suggestedTableName = '';
	try {
		const pathname = new URL(url).pathname;
		const filename = pathname.split('/').pop()?.replace(/\.(csv|tsv|txt)$/i, '') || '';
		suggestedTableName = sanitizeColumnName(filename);
	} catch { /* ignore */ }

	return json({
		rows,
		columns,
		metadata: { sourceName: 'CSV URL', rowCount: rows.length, suggestedTableName }
	});
}

// ─── Shared row processing ────────────────────────────────────────

function processRows(rawRows) {
	// Collect all keys, sanitize names
	const keySet = new Map(); // originalName → sanitizedName
	for (const row of rawRows) {
		for (const key of Object.keys(row)) {
			if (!keySet.has(key)) {
				keySet.set(key, sanitizeColumnName(key));
			}
		}
	}

	// Build sanitized rows
	const rows = rawRows.map(raw => {
		const obj = {};
		for (const [origKey, sanKey] of keySet) {
			let val = raw[origKey];
			// Convert arrays to comma-separated strings
			if (Array.isArray(val)) val = val.join(', ');
			// Convert objects to JSON strings
			else if (val !== null && typeof val === 'object') val = JSON.stringify(val);
			// Convert booleans to integers
			else if (typeof val === 'boolean') val = val ? 1 : 0;
			obj[sanKey] = val ?? '';
		}
		return obj;
	});

	// Infer column types
	const columns = [...keySet.entries()].map(([origName, sanName]) => ({
		name: sanName,
		originalName: origName,
		type: inferColumnType(rows.map(r => r[sanName]))
	}));

	return { rows, columns };
}
