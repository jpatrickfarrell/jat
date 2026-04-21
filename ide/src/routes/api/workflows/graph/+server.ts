/**
 * Cross-Workflow Dependency Graph API
 * GET /api/workflows/graph
 *
 * Returns all workflows as graph nodes with directed edges where one workflow
 * triggers another via action_run_workflow nodes.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllWorkflows, getRuns } from '$lib/utils/workflows.server';

export interface GraphNode {
	id: string;
	name: string;
	description?: string;
	enabled: boolean;
	healthStatus?: 'healthy' | 'degraded' | 'critical';
	lastRunStatus?: string;
	lastRunAt?: string;
	runCount: number;
}

export interface GraphEdge {
	source: string;
	target: string;
}

export interface WorkflowGraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
}

export const GET: RequestHandler = async () => {
	try {
		const workflows = await getAllWorkflows();

		const nodes: GraphNode[] = [];
		const edges: GraphEdge[] = [];
		const edgeSet = new Set<string>();

		for (const wf of workflows) {
			// Get run history for health + count
			const recentRuns = await getRuns(wf.id, 20);
			const lastRun = recentRuns[0] || null;

			let runCount = recentRuns.length;

			// Health from consecutive failures
			let healthStatus: 'healthy' | 'degraded' | 'critical' | undefined;
			if (recentRuns.length > 0) {
				let consecutiveFailures = 0;
				for (const run of recentRuns) {
					if (run.status === 'success') break;
					consecutiveFailures++;
				}
				if (consecutiveFailures === 0) healthStatus = 'healthy';
				else if (consecutiveFailures >= 3) healthStatus = 'critical';
				else healthStatus = 'degraded';
			}

			nodes.push({
				id: wf.id,
				name: wf.name,
				description: wf.description,
				enabled: wf.enabled,
				healthStatus,
				lastRunStatus: lastRun?.status,
				lastRunAt: lastRun?.startedAt,
				runCount
			});

			// Find action_run_workflow nodes and extract edges
			for (const node of wf.nodes) {
				if (node.type === 'action_run_workflow') {
					const cfg = node.config as { workflowId?: string };
					if (cfg.workflowId && cfg.workflowId !== wf.id) {
						const edgeKey = `${wf.id}→${cfg.workflowId}`;
						if (!edgeSet.has(edgeKey)) {
							edgeSet.add(edgeKey);
							edges.push({ source: wf.id, target: cfg.workflowId });
						}
					}
				}
			}
		}

		// Filter edges to only reference existing workflow IDs
		const nodeIds = new Set(nodes.map((n) => n.id));
		const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

		return json({ nodes, edges: validEdges });
	} catch (err) {
		console.error('[workflows/graph] GET error:', err);
		throw error(500, `Failed to build workflow graph: ${(err as Error).message}`);
	}
};
