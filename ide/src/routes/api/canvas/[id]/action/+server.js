import { json } from '@sveltejs/kit';

/**
 * Canvas action executor endpoint.
 * Dispatches action requests to the appropriate executor based on actionType.
 *
 * POST /api/canvas/:pageId/action
 * Body: { actionType: string, actionConfig: Record<string, unknown>, project?: string }
 * Returns: { success: boolean, message?: string, data?: unknown }
 *
 * Action executors will be registered here as they are implemented:
 * - Data actions (jat-i1r8u): AddRow, ModifyRows, DeleteRows, RunFormula
 * - JAT actions (jat-qk1n6): SpawnAgent, CreateTask, UpdateTask, RunCommand
 */

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const { actionType, actionConfig, project } = await request.json();
		const pageId = params.id;

		if (!actionType) {
			return json({ success: false, error: 'Missing actionType' }, { status: 400 });
		}

		// Dispatch to executor based on actionType
		const executor = ACTION_EXECUTORS[actionType];
		if (!executor) {
			return json(
				{ success: false, error: `Unknown action type: ${actionType}. Available: ${Object.keys(ACTION_EXECUTORS).join(', ') || 'none (executors not yet registered)'}` },
				{ status: 400 }
			);
		}

		const result = await executor({ actionConfig, project, pageId });
		return json(result);
	} catch (err) {
		return json(
			{ success: false, error: err instanceof Error ? err.message : 'Action execution failed' },
			{ status: 500 }
		);
	}
}

/**
 * Action executor registry.
 * Each key is an actionType string, value is an async function that executes the action.
 *
 * To register a new executor:
 *   ACTION_EXECUTORS['MyAction'] = async ({ actionConfig, project, pageId }) => {
 *     // ... execute action ...
 *     return { success: true, message: 'Done', data: { ... } };
 *   };
 */
const ACTION_EXECUTORS = {};
