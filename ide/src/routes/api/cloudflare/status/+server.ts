/**
 * GET /api/cloudflare/status
 *
 * Returns Cloudflare Pages configuration for a project.
 * Looks up integrations.json for cloudflare-pages entries matching the project.
 *
 * Query parameters:
 * - project: Project name (required)
 *
 * Response:
 * - hasCloudflare: Whether a cloudflare-pages integration exists for this project
 * - accountId: Cloudflare account ID
 * - pagesProject: Cloudflare Pages project name
 * - hasToken: Whether an API token is available
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getApiKeyWithFallback, getCustomApiKey } from '$lib/utils/credentials';

interface CloudflareIntegration {
	id: string;
	type: string;
	enabled: boolean;
	project: string;
	accountId: string;
	pagesProject: string;
	secretName: string;
	fetchLogs?: boolean;
}

/**
 * Find cloudflare-pages integration for a project from integrations.json
 */
function findCloudflareIntegration(projectName: string): CloudflareIntegration | null {
	const configPath = join(process.env.HOME || '~', '.config', 'jat', 'integrations.json');

	if (!existsSync(configPath)) {
		return null;
	}

	try {
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		const sources = config.sources || [];

		// Find cloudflare-pages integration for this project
		// Note: enabled flag controls the ingest daemon, not /source page visibility
		const match = sources.find(
			(s: CloudflareIntegration) =>
				s.type === 'cloudflare-pages' &&
				s.project === projectName
		);

		return match || null;
	} catch {
		return null;
	}
}

/**
 * Resolve API token from credentials store
 * Tries: secretName from integration > cloudflare built-in > env var
 */
function resolveToken(secretName?: string): string | null {
	// 1. Try the specific secret name from the integration config
	if (secretName) {
		const custom = getCustomApiKey(secretName);
		if (custom) return custom;
	}

	// 2. Try the built-in cloudflare provider key
	const builtIn = getApiKeyWithFallback('cloudflare', 'CLOUDFLARE_API_TOKEN');
	if (builtIn) return builtIn;

	// 3. Direct env var
	return process.env.CLOUDFLARE_API_TOKEN || null;
}

export const GET: RequestHandler = async ({ url }) => {
	const projectName = url.searchParams.get('project');

	if (!projectName) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	const integration = findCloudflareIntegration(projectName);

	if (!integration) {
		return json({
			hasCloudflare: false,
			hint: 'No Cloudflare Pages integration configured for this project. Add one in Settings → Integrations.'
		});
	}

	const token = resolveToken(integration.secretName);

	return json({
		hasCloudflare: true,
		accountId: integration.accountId,
		pagesProject: integration.pagesProject,
		hasToken: !!token,
		integrationId: integration.id,
		fetchLogs: integration.fetchLogs ?? false,
		hint: token ? undefined : 'Cloudflare API token not found. Configure it in Settings → API Keys.'
	});
};
