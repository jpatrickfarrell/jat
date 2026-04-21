/**
 * Workflow Run Stream API
 * POST /api/workflows/{id}/run-stream
 *
 * Executes a workflow and streams node-level execution events via SSE.
 * Events: node-start, node-complete, run-complete, error
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWorkflow, validateWorkflow } from '$lib/utils/workflows.server';
import { executeWorkflow } from '$lib/utils/workflowEngine';
import type { NodeExecutionResult } from '$lib/types/workflow';

export const POST: RequestHandler = async ({ params, request, url }) => {
	const workflowId = params.id;

	const workflow = await getWorkflow(workflowId);
	if (!workflow) {
		throw error(404, `Workflow '${workflowId}' not found`);
	}

	const validation = validateWorkflow(workflow);
	if (!validation.valid) {
		throw error(400, `Workflow has validation errors: ${validation.errors.join(', ')}`);
	}

	let body: {
		dryRun?: boolean;
		project?: string;
		trigger?: string;
		eventData?: Record<string, unknown>;
		testInput?: Record<string, unknown>;
	} = {};
	try {
		const text = await request.text();
		if (text) body = JSON.parse(text);
	} catch {
		// empty body is fine
	}

	const dryRun = body.dryRun === true;
	const trigger = (body.trigger as 'manual' | 'cron' | 'event') || 'manual';
	const project = body.project;
	const eventData = body.testInput ?? body.eventData;
	const ideBaseUrl = `${url.protocol}//${url.host}`;

	const encoder = new TextEncoder();

	function sseEvent(data: object): Uint8Array {
		return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
	}

	const stream = new ReadableStream({
		async start(controller) {
			try {
				// Emit pending state for all nodes upfront
				for (const node of workflow.nodes) {
					controller.enqueue(
						sseEvent({ type: 'node-pending', nodeId: node.id, nodeLabel: node.label })
					);
				}

				const run = await executeWorkflow(workflow, {
					trigger,
					dryRun,
					ideBaseUrl,
					project,
					eventData,
					onNodeStart(nodeId: string, nodeLabel: string) {
						controller.enqueue(sseEvent({ type: 'node-start', nodeId, nodeLabel }));
					},
					onNodeComplete(nodeId: string, result: NodeExecutionResult) {
						controller.enqueue(
							sseEvent({
								type: 'node-complete',
								nodeId,
								status: result.status,
								durationMs: result.durationMs,
								error: result.error
							})
						);
					}
				});

				controller.enqueue(sseEvent({ type: 'run-complete', run }));
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				controller.enqueue(sseEvent({ type: 'error', message }));
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
