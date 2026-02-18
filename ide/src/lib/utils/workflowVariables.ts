/**
 * Workflow Template Variables
 *
 * Defines output schemas per node type and resolves upstream variables
 * for a given node in the workflow graph. Used by config panels to show
 * clickable variable chips (e.g., {{input.timestamp}}).
 *
 * @see ide/src/lib/types/workflow.ts for type definitions
 * @see ide/src/lib/utils/workflowEngine.ts for runtime variable substitution
 */

import type { WorkflowNode, WorkflowEdge, NodeType } from '$lib/types/workflow';
import { getNodeMeta } from '$lib/config/workflowNodes';

// =============================================================================
// TYPES
// =============================================================================

/** A single output field that can be referenced as a template variable */
export interface OutputField {
	/** Short display name (e.g., "timestamp") */
	name: string;
	/** Dot-path from input root (e.g., "input.timestamp") */
	path: string;
	/** Human-readable description */
	description: string;
	/** Text to insert into template (e.g., "{{input.timestamp}}") */
	insertText: string;
}

/** Upstream variables grouped by source node */
export interface UpstreamVariableGroup {
	/** The source node */
	sourceNode: WorkflowNode;
	/** Display label for the source (node label or type) */
	sourceLabel: string;
	/** Category color from the node type meta */
	color: string;
	/** Available output fields from this source */
	variables: OutputField[];
}

// =============================================================================
// OUTPUT SCHEMAS PER NODE TYPE
// =============================================================================

/**
 * Maps each node type to the output fields it produces.
 * These match the actual runtime output shapes in workflowEngine.ts.
 */
const NODE_OUTPUT_SCHEMAS: Record<NodeType, OutputField[]> = {
	// ── Triggers ──────────────────────────────────────────────────────
	// executeTrigger() returns { triggered: true, timestamp: '...' }
	trigger_cron: [
		{ name: 'Full output', path: 'input', description: 'Complete trigger data', insertText: '{{input}}' },
		{ name: 'timestamp', path: 'input.timestamp', description: 'ISO timestamp when trigger fired', insertText: '{{input.timestamp}}' },
		{ name: 'triggered', path: 'input.triggered', description: 'Always true', insertText: '{{input.triggered}}' }
	],
	trigger_event: [
		{ name: 'Full output', path: 'input', description: 'Complete event data', insertText: '{{input}}' },
		{ name: 'timestamp', path: 'input.timestamp', description: 'When event occurred', insertText: '{{input.timestamp}}' }
	],
	trigger_manual: [
		{ name: 'Full output', path: 'input', description: 'Complete trigger data', insertText: '{{input}}' },
		{ name: 'timestamp', path: 'input.timestamp', description: 'ISO timestamp', insertText: '{{input.timestamp}}' }
	],

	// ── LLM ──────────────────────────────────────────────────────────
	// executeLlmPrompt() returns the LLM response text (string)
	llm_prompt: [
		{ name: 'Full output', path: 'input', description: 'LLM response text', insertText: '{{input}}' }
	],

	// ── Actions ──────────────────────────────────────────────────────
	// executeCreateTask() returns { taskId, title, project }
	action_create_task: [
		{ name: 'Full output', path: 'input', description: 'Task creation result (JSON)', insertText: '{{input}}' },
		{ name: 'taskId', path: 'input.taskId', description: 'Created task ID', insertText: '{{input.taskId}}' },
		{ name: 'title', path: 'input.title', description: 'Task title', insertText: '{{input.title}}' }
	],
	action_send_message: [
		{ name: 'Full output', path: 'input', description: 'Send result', insertText: '{{input}}' }
	],
	// executeRunBash() returns stdout string
	action_run_bash: [
		{ name: 'Full output', path: 'input', description: 'Command stdout', insertText: '{{input}}' }
	],
	// executeSpawnAgent() returns { sessionName, agentName, taskId }
	action_spawn_agent: [
		{ name: 'Full output', path: 'input', description: 'Spawn result (JSON)', insertText: '{{input}}' },
		{ name: 'sessionName', path: 'input.sessionName', description: 'Tmux session name', insertText: '{{input.sessionName}}' },
		{ name: 'agentName', path: 'input.agentName', description: 'Agent name', insertText: '{{input.agentName}}' }
	],
	action_browser: [
		{ name: 'Full output', path: 'input', description: 'Browser action result', insertText: '{{input}}' }
	],

	// ── Logic ────────────────────────────────────────────────────────
	// Condition passes input through to the matched branch
	condition: [
		{ name: 'Full output', path: 'input', description: 'Passed-through input data', insertText: '{{input}}' }
	],
	// Transform returns whatever the function body returns
	transform: [
		{ name: 'Full output', path: 'input', description: 'Transformed data', insertText: '{{input}}' }
	]
};

// =============================================================================
// RESOLVER
// =============================================================================

/**
 * Resolve all upstream template variables available to a given node.
 *
 * Walks incoming edges to find direct parent nodes, looks up their
 * output schemas, and returns grouped variables ready for display.
 *
 * @param nodeId - The node whose upstream variables to resolve
 * @param nodes - All nodes in the workflow
 * @param edges - All edges in the workflow
 * @returns Array of variable groups, one per upstream source node
 */
export function getUpstreamVariables(
	nodeId: string,
	nodes: WorkflowNode[],
	edges: WorkflowEdge[]
): UpstreamVariableGroup[] {
	// Find all edges targeting this node
	const incomingEdges = edges.filter((e) => e.targetNodeId === nodeId);
	if (incomingEdges.length === 0) return [];

	const nodeMap = new Map(nodes.map((n) => [n.id, n]));
	const groups: UpstreamVariableGroup[] = [];

	for (const edge of incomingEdges) {
		const sourceNode = nodeMap.get(edge.sourceNodeId);
		if (!sourceNode) continue;

		const meta = getNodeMeta(sourceNode.type);
		const schema = NODE_OUTPUT_SCHEMAS[sourceNode.type] || [];

		groups.push({
			sourceNode,
			sourceLabel: sourceNode.label || meta.label,
			color: meta.color,
			variables: schema
		});
	}

	return groups;
}
