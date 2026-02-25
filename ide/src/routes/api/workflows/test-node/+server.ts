/**
 * Workflow Test Node API
 * POST /api/workflows/test-node
 *
 * Tests a single workflow node. Dry-run by default.
 * Set dryRun=false to execute the node for real (e.g., actually spawn an agent).
 *
 * Request body:
 *   { node: WorkflowNode, project?: string, dryRun?: boolean, sampleInput?: unknown }
 *
 * Response:
 *   200: { output?: unknown, error?: string }
 *   400: Missing node data
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { testNode } from '$lib/utils/workflowEngine';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { node, project, dryRun = true, sampleInput } = body;

	if (!node) {
		throw error(400, 'Node data is required');
	}

	const result = await testNode(node, { project, dryRun, sampleInput });
	return json(result);
};
