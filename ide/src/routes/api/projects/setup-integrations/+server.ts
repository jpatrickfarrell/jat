/**
 * JST Project Integrations Setup API
 *
 * POST /api/projects/setup-integrations
 *
 * Stores credentials and creates ingest integration sources for a JST-based
 * project. Idempotent — safe to call multiple times; existing sources are
 * updated in-place.
 *
 * Body:
 *   {
 *     projectKey: string,            // e.g. "flush"
 *     supabase?: {
 *       url: string,                 // https://xxx.supabase.co
 *       serviceKey: string           // service role JWT
 *     },
 *     cloudflare?: {
 *       accountId: string,           // CF account ID
 *       apiToken: string,            // CF API token (Pages:Read)
 *       pagesProject: string         // CF Pages project slug
 *     }
 *   }
 *
 * Response:
 *   { success: true, steps: string[], integrations: string[] }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const CONFIG_DIR = join(homedir(), '.config', 'jat');
const INTEGRATIONS_PATH = join(CONFIG_DIR, 'integrations.json');
const LEGACY_PATH = join(CONFIG_DIR, 'feeds.json');

// ── Config helpers ──────────────────────────────────────────────────────────

function readIntegrations(): { version: number; sources: any[] } {
	if (existsSync(INTEGRATIONS_PATH)) {
		try {
			return JSON.parse(readFileSync(INTEGRATIONS_PATH, 'utf-8'));
		} catch {
			return { version: 1, sources: [] };
		}
	}
	if (existsSync(LEGACY_PATH)) {
		copyFileSync(LEGACY_PATH, INTEGRATIONS_PATH);
		return readIntegrations();
	}
	return { version: 1, sources: [] };
}

function writeIntegrations(config: { version: number; sources: any[] }): void {
	mkdirSync(CONFIG_DIR, { recursive: true });
	writeFileSync(INTEGRATIONS_PATH, JSON.stringify(config, null, 2) + '\n', { mode: 0o644 });
}

/**
 * Upsert a source: replaces existing entry with same id, or appends new one.
 */
function upsertSource(config: { version: number; sources: any[] }, source: any): boolean {
	const idx = config.sources.findIndex((s) => s.id === source.id);
	if (idx >= 0) {
		config.sources[idx] = source;
		return false; // updated
	}
	config.sources.push(source);
	return true; // created
}

/**
 * Store a secret via jat-secret CLI.
 */
async function storeSecret(name: string, value: string, desc?: string): Promise<void> {
	const cmd = desc
		? `jat-secret --set ${JSON.stringify(name)} ${JSON.stringify(value)} --desc ${JSON.stringify(desc)}`
		: `jat-secret --set ${JSON.stringify(name)} ${JSON.stringify(value)}`;
	await execAsync(cmd, { timeout: 10_000 });
}

// ── Request handler ─────────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { projectKey, supabase, cloudflare } = body;

		if (!projectKey || typeof projectKey !== 'string') {
			return json({ success: false, error: 'projectKey is required' }, { status: 400 });
		}

		const steps: string[] = [];
		const integrations: string[] = [];
		const config = readIntegrations();

		// ── Supabase feedback integration ──────────────────────────────────
		if (supabase?.url && supabase?.serviceKey) {
			const secretName = `${projectKey}-supabase-service-role-key`;

			// Store service role key secret
			try {
				await storeSecret(secretName, supabase.serviceKey, `${projectKey} Supabase service role key`);
				steps.push(`Stored Supabase service role key as "${secretName}"`);
			} catch (err: any) {
				steps.push(`Warning: failed to store Supabase secret — ${err?.message || 'unknown error'}`);
			}

			// Also store the URL as a project secret so agents can use it
			const urlSecretName = `${projectKey}-supabase-url`;
			try {
				await storeSecret(urlSecretName, supabase.url, `${projectKey} Supabase project URL`);
				steps.push(`Stored Supabase URL as "${urlSecretName}"`);
			} catch {
				// Non-fatal — URL is also stored directly in the integration config
			}

			// Build feedback integration source
			const sourceId = `${projectKey}-feedback`;
			const source = {
				id: sourceId,
				type: 'supabase',
				enabled: true,
				project: projectKey,
				pollInterval: 120,
				taskDefaults: {
					type: 'bug',
					priority: 2,
					labels: ['widget', 'feedback']
				},
				projectUrl: supabase.url,
				secretName,
				table: 'feedback_reports',
				statusColumn: 'status',
				statusNew: 'submitted',
				taskIdColumn: 'jat_task_id',
				titleColumn: 'title',
				descriptionTemplate:
					'**Reporter:** {reporter_name} ({reporter_email})\n**Page:** {page_url}\n\n{description}',
				authorColumn: 'reporter_email',
				timestampColumn: 'created_at',
				attachmentColumn: 'screenshot_paths',
				storageBucket: 'feedback-screenshots',
				automation: {
					action: 'delay',
					command: '/jat:start',
					delay: 5,
					delayUnit: 'minutes'
				}
			};

			const created = upsertSource(config, source);
			integrations.push(sourceId);
			steps.push(
				created
					? `Created Supabase feedback integration "${sourceId}"`
					: `Updated Supabase feedback integration "${sourceId}"`
			);
		}

		// ── Cloudflare Pages deployment monitoring integration ─────────────
		if (cloudflare?.accountId && cloudflare?.apiToken && cloudflare?.pagesProject) {
			const secretName = `${projectKey}-cloudflare-pages-token`;

			// Store API token secret
			try {
				await storeSecret(
					secretName,
					cloudflare.apiToken,
					`${projectKey} Cloudflare Pages API token`
				);
				steps.push(`Stored Cloudflare API token as "${secretName}"`);
			} catch (err: any) {
				steps.push(
					`Warning: failed to store Cloudflare secret — ${err?.message || 'unknown error'}`
				);
			}

			// Build deployment monitoring source
			const sourceId = `${projectKey}-deployments`;
			const source = {
				id: sourceId,
				type: 'cloudflare-pages',
				enabled: true,
				project: projectKey,
				pollInterval: 60,
				taskDefaults: {
					type: 'task',
					priority: 2,
					labels: ['from-cloudflare-pages']
				},
				accountId: cloudflare.accountId,
				pagesProject: cloudflare.pagesProject,
				secretName,
				fetchLogs: true,
				filter: [{ field: 'status', operator: 'equals', value: 'failure' }],
				automation: {
					action: 'delay',
					command: '/jat:start',
					delay: 2,
					delayUnit: 'minutes'
				}
			};

			const created = upsertSource(config, source);
			integrations.push(sourceId);
			steps.push(
				created
					? `Created Cloudflare Pages monitoring integration "${sourceId}"`
					: `Updated Cloudflare Pages monitoring integration "${sourceId}"`
			);
		}

		if (steps.length === 0) {
			return json(
				{
					success: false,
					error: 'No integration credentials provided. Provide supabase or cloudflare config.'
				},
				{ status: 400 }
			);
		}

		// Persist updated integrations config
		writeIntegrations(config);

		return json({ success: true, steps, integrations });
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to set up integrations'
			},
			{ status: 500 }
		);
	}
};
