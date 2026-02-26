/**
 * GET /api/cloudflare/deployments
 *
 * Fetches deployment history from Cloudflare Pages API.
 *
 * Query parameters:
 * - project: JAT project name (required)
 * - page: Page number (default: 1)
 * - per_page: Results per page (default: 25)
 * - env: Filter by environment (production|preview) (optional)
 *
 * POST /api/cloudflare/deployments
 * - Retry a deployment
 * - Body: { project, deploymentId, action: "retry" }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getApiKeyWithFallback, getCustomApiKey } from '$lib/utils/credentials';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

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

function findCloudflareIntegration(projectName: string): CloudflareIntegration | null {
	const configPath = join(process.env.HOME || '~', '.config', 'jat', 'integrations.json');
	if (!existsSync(configPath)) return null;

	try {
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		const sources = config.sources || [];
		// Note: enabled flag controls the ingest daemon, not /source page visibility
		return sources.find(
			(s: CloudflareIntegration) =>
				s.type === 'cloudflare-pages' && s.project === projectName
		) || null;
	} catch {
		return null;
	}
}

function resolveToken(secretName?: string): string | null {
	if (secretName) {
		const custom = getCustomApiKey(secretName);
		if (custom) return custom;
	}
	const builtIn = getApiKeyWithFallback('cloudflare', 'CLOUDFLARE_API_TOKEN');
	if (builtIn) return builtIn;
	return process.env.CLOUDFLARE_API_TOKEN || null;
}

export interface DeploymentStage {
	name: string;
	status: 'idle' | 'active' | 'success' | 'failure' | 'canceled';
	started_on: string | null;
	ended_on: string | null;
}

export interface Deployment {
	id: string;
	short_id: string;
	project_name: string;
	environment: 'production' | 'preview';
	url: string;
	created_on: string;
	modified_on: string;
	latest_stage: DeploymentStage;
	stages: DeploymentStage[];
	deployment_trigger: {
		type: string;
		metadata: {
			branch: string;
			commit_hash: string;
			commit_message: string;
			commit_dirty: boolean;
		};
	};
	source: {
		type: string;
	};
	is_skipped: boolean;
	build_image_major_version: number;
}

export const GET: RequestHandler = async ({ url }) => {
	const projectName = url.searchParams.get('project');
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '25', 10), 50);
	const envFilter = url.searchParams.get('env');

	if (!projectName) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	const integration = findCloudflareIntegration(projectName);
	if (!integration) {
		return json({ error: 'No Cloudflare Pages integration for this project' }, { status: 404 });
	}

	const token = resolveToken(integration.secretName);
	if (!token) {
		return json({ error: 'Cloudflare API token not configured' }, { status: 401 });
	}

	try {
		const params = new URLSearchParams({
			page: page.toString(),
			per_page: perPage.toString(),
			sort_by: 'created_on',
			sort_order: 'desc'
		});
		if (envFilter) {
			params.set('env', envFilter);
		}

		const apiUrl = `${CF_API_BASE}/accounts/${integration.accountId}/pages/projects/${integration.pagesProject}/deployments?${params}`;

		const response = await fetch(apiUrl, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMsg = (errorData as { errors?: { message: string }[] }).errors?.[0]?.message || response.statusText;
			return json(
				{ error: `Cloudflare API error: ${errorMsg}` },
				{ status: response.status }
			);
		}

		const data = await response.json() as {
			result: Deployment[];
			result_info: { page: number; per_page: number; total_count: number; total_pages: number };
		};

		// Derive a simple status from each deployment
		const deployments = (data.result || []).map((d: Deployment) => ({
			id: d.id,
			shortId: d.short_id,
			projectName: d.project_name,
			environment: d.environment,
			url: d.url,
			createdOn: d.created_on,
			modifiedOn: d.modified_on,
			status: deriveStatus(d),
			branch: d.deployment_trigger?.metadata?.branch || 'unknown',
			commitHash: d.deployment_trigger?.metadata?.commit_hash || '',
			commitMessage: d.deployment_trigger?.metadata?.commit_message || '',
			trigger: d.deployment_trigger?.type || 'unknown',
			stages: d.stages,
			isSkipped: d.is_skipped
		}));

		return json({
			deployments,
			pagination: data.result_info,
			pagesProject: integration.pagesProject,
			accountId: integration.accountId
		});
	} catch (err) {
		return json(
			{ error: `Failed to fetch deployments: ${err instanceof Error ? err.message : 'Unknown error'}` },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { project, deploymentId, action } = body;

	if (!project || !deploymentId || action !== 'retry') {
		return json({ error: 'Invalid request' }, { status: 400 });
	}

	const integration = findCloudflareIntegration(project);
	if (!integration) {
		return json({ error: 'No Cloudflare Pages integration for this project' }, { status: 404 });
	}

	const token = resolveToken(integration.secretName);
	if (!token) {
		return json({ error: 'Cloudflare API token not configured' }, { status: 401 });
	}

	try {
		const apiUrl = `${CF_API_BASE}/accounts/${integration.accountId}/pages/projects/${integration.pagesProject}/deployments/${deploymentId}/retry`;

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMsg = (errorData as { errors?: { message: string }[] }).errors?.[0]?.message || response.statusText;
			return json({ error: `Retry failed: ${errorMsg}` }, { status: response.status });
		}

		const data = await response.json();
		return json({ success: true, deployment: data.result });
	} catch (err) {
		return json(
			{ error: `Retry failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
			{ status: 500 }
		);
	}
};

function deriveStatus(d: Deployment): 'success' | 'failure' | 'active' | 'canceled' | 'idle' {
	if (d.is_skipped) return 'canceled';
	const latest = d.latest_stage;
	if (!latest) return 'idle';
	if (latest.status === 'failure') return 'failure';
	if (latest.name === 'deploy' && latest.status === 'success') return 'success';
	if (latest.status === 'active') return 'active';
	return 'idle';
}
