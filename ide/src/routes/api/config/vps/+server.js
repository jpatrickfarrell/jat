/**
 * VPS Configuration API
 * GET /api/config/vps - Get VPS status and connection info
 * POST /api/config/vps/test - Test VPS SSH connectivity
 */

import { json } from '@sveltejs/kit';
import { getJatDefaults } from '$lib/server/projectPaths.js';
import {
	testVpsConnection,
	countLocalAgents,
	countRemoteAgents,
	detectMaxLocalAgents
} from '$lib/server/agentRouter.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const defaults = await getJatDefaults();
		const localCount = countLocalAgents();
		const maxLocal = defaults.max_local_agents > 0
			? defaults.max_local_agents
			: detectMaxLocalAgents();

		const vpsConfigured = !!(defaults.vps_host && defaults.vps_user);

		const result = {
			success: true,
			local: {
				count: localCount,
				max: maxLocal,
				autoDetected: defaults.max_local_agents === 0
			},
			vps: {
				configured: vpsConfigured,
				host: defaults.vps_host || null,
				user: defaults.vps_user || null,
				maxAgents: defaults.vps_max_agents || 8,
				projectPath: defaults.vps_project_path || '~/code',
				count: null
			}
		};

		// If VPS is configured, also count remote agents
		if (vpsConfigured) {
			try {
				result.vps.count = await countRemoteAgents({
					host: defaults.vps_host,
					user: defaults.vps_user
				});
			} catch {
				result.vps.count = null;
			}
		}

		return json(result);
	} catch (error) {
		console.error('[config/vps] GET error:', error);
		return json({
			error: 'Failed to get VPS config',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	try {
		const defaults = await getJatDefaults();

		if (!defaults.vps_host || !defaults.vps_user) {
			return json({
				success: false,
				error: 'VPS not configured',
				message: 'Set vps_host and vps_user in Settings > Autopilot first'
			}, { status: 400 });
		}

		const result = await testVpsConnection({
			host: defaults.vps_host,
			user: defaults.vps_user
		});

		return json({
			success: result.ok,
			host: defaults.vps_host,
			user: defaults.vps_user,
			latencyMs: result.latencyMs || null,
			error: result.error || null
		});
	} catch (error) {
		console.error('[config/vps] POST test error:', error);
		return json({
			error: 'Test failed',
			message: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
