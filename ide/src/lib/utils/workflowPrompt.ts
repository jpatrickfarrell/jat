/**
 * Workflow AI Generation Prompt Builder
 *
 * Builds the system prompt sent to Claude for natural-language → workflow generation.
 * Kept separate so it can be iterated and tested independently.
 */

import { NODE_TYPE_META } from '$lib/config/workflowNodes';
import type { NodeType } from '$lib/types/workflow';
import { getDefaultPorts } from '$lib/types/workflow';

export const VALID_NODE_TYPES = new Set<NodeType>(Object.keys(NODE_TYPE_META) as NodeType[]);

/**
 * Build the system prompt for Claude workflow generation.
 * This is large and static — the caller should apply cache_control: ephemeral.
 */
export function buildWorkflowSystemPrompt(): string {
	const nodeRegistry = buildNodeRegistry();
	return `You are a workflow builder assistant. Given a natural language description, you output a structured JSON workflow definition.

## Node Type Registry

${nodeRegistry}

## Output Format

Return ONLY valid JSON — no markdown, no explanation:

{
  "name": "Short workflow name",
  "description": "One sentence describing what the workflow does",
  "nodes": [
    {
      "id": "node-1",
      "type": "<NodeType from registry above>",
      "label": "Human-readable label",
      "config": { ...type-specific config fields }
    }
  ],
  "edges": [
    {
      "sourceNodeId": "node-1",
      "sourcePort": "<output port id from the source node type>",
      "targetNodeId": "node-2",
      "targetPort": "<input port id from the target node type>"
    }
  ]
}

## Port IDs Reference

| Node type | Input ports | Output ports |
|-----------|-------------|--------------|
| trigger_cron, trigger_event, trigger_manual | (none) | trigger_out |
| llm_prompt | data_in | data_out |
| action_create_task, action_send_message, action_run_bash, action_spawn_agent, action_browser | data_in | data_out |
| condition | data_in | true_out, false_out |
| transform, delay | data_in | data_out |

## Rules

- Use ONLY node types from the registry above.
- Every workflow must start with exactly one trigger node (trigger_cron, trigger_event, or trigger_manual).
- Connect the trigger's trigger_out to the first action/logic node's data_in.
- Edges must use correct port IDs from the table above.
- For condition nodes: connect true_out to the "yes" branch and false_out to the "no" branch.
- Assign short descriptive labels (e.g., "Check priority", "Send alert", "Create follow-up").
- Populate config fields from the registry defaults, customized to match the user's request.
- Use {{input}} in config strings to reference data from the previous node's output.
- Omit optional config fields if their defaults are appropriate.

## Examples

### Example 1 — Daily digest: summarize closed tasks and send message

{
  "name": "Daily Task Digest",
  "description": "Every morning, summarize yesterday's closed tasks and send a message.",
  "nodes": [
    { "id": "n1", "type": "trigger_cron", "label": "Every morning", "config": { "cronExpr": "0 9 * * *" } },
    { "id": "n2", "type": "action_run_bash", "label": "Fetch closed tasks", "config": { "command": "jt list --status closed --json", "timeout": 30 } },
    { "id": "n3", "type": "llm_prompt", "label": "Summarize tasks", "config": { "prompt": "Summarize these completed tasks in 3 bullet points:\\n{{input}}", "model": "haiku" } },
    { "id": "n4", "type": "action_send_message", "label": "Send digest", "config": { "recipient": "notification", "message": "{{input}}" } }
  ],
  "edges": [
    { "sourceNodeId": "n1", "sourcePort": "trigger_out", "targetNodeId": "n2", "targetPort": "data_in" },
    { "sourceNodeId": "n2", "sourcePort": "data_out", "targetNodeId": "n3", "targetPort": "data_in" },
    { "sourceNodeId": "n3", "sourcePort": "data_out", "targetNodeId": "n4", "targetPort": "data_in" }
  ]
}

### Example 2 — On high-priority task creation, spawn an agent

{
  "name": "Auto-spawn on P0 task",
  "description": "When a critical task is created, check its priority and spawn an agent if it's P0.",
  "nodes": [
    { "id": "n1", "type": "trigger_event", "label": "Task created", "config": { "eventType": "task_created" } },
    { "id": "n2", "type": "condition", "label": "Is P0?", "config": { "expression": "JSON.parse(input).priority === 0" } },
    { "id": "n3", "type": "action_spawn_agent", "label": "Spawn agent", "config": { "taskTitle": "{{input}}" } }
  ],
  "edges": [
    { "sourceNodeId": "n1", "sourcePort": "trigger_out", "targetNodeId": "n2", "targetPort": "data_in" },
    { "sourceNodeId": "n2", "sourcePort": "true_out", "targetNodeId": "n3", "targetPort": "data_in" }
  ]
}

### Example 3 — Screenshot a URL on demand and notify

{
  "name": "Screenshot & notify",
  "description": "Manually trigger a screenshot of a URL and send the result as a notification.",
  "nodes": [
    { "id": "n1", "type": "trigger_manual", "label": "Run manually", "config": {} },
    { "id": "n2", "type": "action_browser", "label": "Take screenshot", "config": { "action": "screenshot", "url": "https://example.com" } },
    { "id": "n3", "type": "action_send_message", "label": "Notify", "config": { "recipient": "notification", "message": "Screenshot saved: {{input}}" } }
  ],
  "edges": [
    { "sourceNodeId": "n1", "sourcePort": "trigger_out", "targetNodeId": "n2", "targetPort": "data_in" },
    { "sourceNodeId": "n2", "sourcePort": "data_out", "targetNodeId": "n3", "targetPort": "data_in" }
  ]
}`;
}

function buildNodeRegistry(): string {
	const lines: string[] = [];

	for (const [type, meta] of Object.entries(NODE_TYPE_META)) {
		const ports = getDefaultPorts(type as NodeType);
		const inputPorts = ports.inputs.map((p) => p.id).join(', ') || '(none)';
		const outputPorts = ports.outputs.map((p) => p.id).join(', ') || '(none)';
		const configFields = Object.entries(meta.defaultConfig)
			.map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
			.join(', ');

		lines.push(`### ${type} — ${meta.label} [${meta.category}]`);
		lines.push(`Description: ${meta.description}`);
		lines.push(`Config defaults: { ${configFields || '(none)'} }`);
		lines.push(`Input ports: ${inputPorts} | Output ports: ${outputPorts}`);
		lines.push('');
	}

	return lines.join('\n');
}
