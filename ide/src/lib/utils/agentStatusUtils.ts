/**
 * Agent status computation utilities.
 *
 * Consolidates duplicate agent status logic from:
 * - TaskTable.svelte: isAgentWorking() function (lines 14-31)
 * - AgentCard.svelte: agentStatus computed (lines 52-87)
 *
 * Uses thresholds from constants.ts for consistency.
 */

import { AGENT_STATUS_THRESHOLDS } from '$lib/config/constants';
import { getTimeSinceMs } from '$lib/utils/dateFormatters';

/**
 * Agent status type.
 * - working: has an in-progress task
 * - idle: has a session, no active task
 * - disconnected: no session but was recently active (unexpected termination)
 * - offline: no session and no recent activity
 */
export type AgentStatus = 'working' | 'idle' | 'disconnected' | 'offline';

/**
 * Minimal agent interface for status computation.
 * Matches the shape returned by /api/agents.
 */
export interface AgentStatusInput {
	last_active_ts?: string | null;
	in_progress_tasks?: number;
	hasSession?: boolean;
}

/**
 * Compute agent status based on session and activity.
 *
 * Priority order:
 * 1. DISCONNECTED - No session but recent activity <15min (unexpected termination)
 * 2. OFFLINE - No session and no recent activity (expected state)
 * 3. WORKING - Has active task
 * 4. IDLE - Session exists, no task, active within 1 hour
 * 5. OFFLINE - Session exists but no activity in over 1 hour
 *
 * @param agent - Agent data with status indicators
 * @returns Agent status string
 */
export function computeAgentStatus(agent: AgentStatusInput): AgentStatus {
	const timeSinceActive = getTimeSinceMs(agent.last_active_ts);

	// Priority 0: No tmux session - determine if disconnected or offline
	// hasSession is undefined for backwards compat; only treat explicit false
	// IMPORTANT: This takes priority over in_progress_tasks because if there's
	// no session, the agent can't be working even if a task is still in_progress.
	// An in_progress task with no session indicates an orphaned task (agent crashed).
	if (agent.hasSession === false) {
		// Disconnected: session gone but was active within 15 min (unexpected)
		if (timeSinceActive < AGENT_STATUS_THRESHOLDS.DISCONNECTED_MS) {
			return 'disconnected';
		}
		// Offline: no session and not recently active (expected)
		return 'offline';
	}

	const hasInProgressTask = (agent.in_progress_tasks || 0) > 0;

	// WORKING - Has active task
	if (hasInProgressTask) {
		return 'working';
	}

	// IDLE - Has session, no task (regardless of recent activity)
	if (timeSinceActive < AGENT_STATUS_THRESHOLDS.IDLE_MS) {
		return 'idle';
	}

	// OFFLINE - Session exists but agent hasn't been active in over an hour
	return 'offline';
}

/**
 * Check if an agent is actively working.
 * Useful for determining if agent is currently engaged on a task.
 */
export function isAgentWorking(agent: AgentStatusInput): boolean {
	return computeAgentStatus(agent) === 'working';
}

export function isAgentAvailable(agent: AgentStatusInput): boolean {
	const status = computeAgentStatus(agent);
	return status === 'working' || status === 'idle';
}

export function getAgentStatusDescription(status: AgentStatus): string {
	switch (status) {
		case 'working':
			return 'Agent is actively working on a task';
		case 'idle':
			return 'Agent session is active, no task assigned';
		case 'disconnected':
			return 'Agent session ended unexpectedly (was active within 15 minutes)';
		case 'offline':
			return 'Agent has not been active for over 1 hour';
		default:
			return 'Unknown status';
	}
}
