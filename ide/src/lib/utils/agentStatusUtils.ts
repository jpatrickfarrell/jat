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
	/** Session creation timestamp (ms since epoch) for "connecting" state detection */
	session_created_ts?: number | null;
}

/**
 * Compute agent status based on session and activity.
 *
 * Priority order:
 * 0a. DISCONNECTED - No session but recent activity <15min (unexpected termination)
 * 0b. OFFLINE - No session and no recent activity (expected state)
 * 1. WORKING - Has active task (takes priority - agent is engaged)
 * 1.5 CONNECTING - Session exists but very new (<10min) with no activity yet
 * 2. LIVE - Very recent activity (< 1 minute) without active work
 * 3. ACTIVE - Recent activity (< 10 minutes)
 * 4. IDLE - Within 1 hour but no activity indicators
 * 5. OFFLINE - Over 1 hour or never active
 *
 * @param agent - Agent data with status indicators
 * @returns Agent status string
 *
 * @example
 * const status = computeAgentStatus({
 *   last_active_ts: new Date().toISOString(),
 *   in_progress_tasks: 1
 * });
 * // → 'working' (has in-progress task)
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
 * Check if an agent is actively working (live or working status).
 * Useful for determining if agent can take new tasks.
 *
 * @param agent - Agent data with status indicators
 * @returns true if agent is live or working
 *
 * @example
 * // In TaskTable to show agent availability:
 * const working = isAgentWorking(agent);
 * // → true if agent is currently engaged
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
