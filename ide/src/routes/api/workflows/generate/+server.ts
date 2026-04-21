/**
 * Workflow AI Generation API
 *
 * POST /api/workflows/generate
 * Body: { prompt: string, existingNodes?: WorkflowNode[] }
 *
 * Returns: { name, description, nodes: [{id, type, label, config}], edges: [...] }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { buildWorkflowSystemPrompt, VALID_NODE_TYPES } from '$lib/utils/workflowPrompt';
import type { WorkflowNode, NodeType } from '$lib/types/workflow';
import { getDefaultPorts } from '$lib/types/workflow';
import { getNodeMeta } from '$lib/config/workflowNodes';

interface GeneratedNode {
	id: string;
	type: NodeType;
	label: string;
	config: Record<string, unknown>;
}

interface GeneratedEdge {
	sourceNodeId: string;
	sourcePort: string;
	targetNodeId: string;
	targetPort: string;
}

interface GeneratedWorkflow {
	name: string;
	description: string;
	nodes: GeneratedNode[];
	edges: GeneratedEdge[];
}

export const POST: RequestHandler = async ({ request }) => {
	let body: { prompt?: string; existingNodes?: WorkflowNode[] };
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const { prompt, existingNodes = [] } = body;

	if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
		throw error(400, 'Request body must contain a non-empty "prompt" field');
	}

	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw error(503, 'ANTHROPIC_API_KEY not configured');
	}

	const systemPrompt = buildWorkflowSystemPrompt();

	let userMessage = prompt.trim();
	if (existingNodes.length > 0) {
		userMessage += `\n\nThe canvas already has ${existingNodes.length} node(s). Generate ONLY new nodes/edges to append — use fresh IDs that don't conflict with existing ones.`;
	}

	const client = new Anthropic({ apiKey });

	let responseText: string;
	try {
		const response = await client.messages.create({
			model: 'claude-sonnet-4-6',
			max_tokens: 2048,
			system: [
				{
					type: 'text',
					text: systemPrompt,
					cache_control: { type: 'ephemeral' }
				}
			],
			messages: [{ role: 'user', content: userMessage }]
		});

		const content = response.content[0];
		if (content.type !== 'text') {
			throw error(500, 'Unexpected response type from Claude');
		}
		responseText = content.text;
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) throw err;
		console.error('[workflows/generate] Claude API error:', err);
		throw error(502, 'Claude API call failed');
	}

	// Parse the JSON response
	let generated: GeneratedWorkflow;
	try {
		let jsonText = responseText.trim();
		// Strip markdown code fences if present
		if (jsonText.startsWith('```')) {
			jsonText = jsonText.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
		}
		generated = JSON.parse(jsonText);
	} catch {
		console.error('[workflows/generate] Failed to parse response:', responseText.slice(0, 500));
		throw error(500, 'Could not generate workflow, try rephrasing');
	}

	if (!generated.nodes || generated.nodes.length === 0) {
		throw error(500, 'Could not generate workflow, try rephrasing');
	}

	// Validate and strip invalid node types
	const validNodes = generated.nodes.filter((n) => {
		if (!VALID_NODE_TYPES.has(n.type)) {
			console.warn(`[workflows/generate] Stripping unknown node type: ${n.type}`);
			return false;
		}
		return true;
	});

	if (validNodes.length === 0) {
		throw error(500, 'Could not generate workflow, try rephrasing');
	}

	const validNodeIds = new Set(validNodes.map((n) => n.id));

	// Strip edges referencing removed nodes
	const validEdges = (generated.edges || []).filter(
		(e) => validNodeIds.has(e.sourceNodeId) && validNodeIds.has(e.targetNodeId)
	);

	// Hydrate nodes with ports from schema
	const hydratedNodes: WorkflowNode[] = validNodes.map((n) => {
		const meta = getNodeMeta(n.type as NodeType);
		const ports = getDefaultPorts(n.type as NodeType);
		return {
			id: n.id,
			type: n.type as NodeType,
			label: n.label || meta.label,
			position: { x: 0, y: 0 }, // frontend will auto-arrange
			config: { ...meta.defaultConfig, ...(n.config || {}) } as WorkflowNode['config'],
			inputs: ports.inputs,
			outputs: ports.outputs
		};
	});

	return json({
		name: generated.name || 'Generated Workflow',
		description: generated.description || '',
		nodes: hydratedNodes,
		edges: validEdges
	});
};
