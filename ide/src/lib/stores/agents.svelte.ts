/**
 * Agents Store
 *
 * Reactive Svelte 5 store that polls the /api/agents endpoint
 * for real-time agent coordination data.
 *
 * Usage:
 * ```svelte
 * <script lang="ts">
 *   import { agents } from '$lib/stores/agents.svelte';
 *
 *   // Access reactive state
 *   const agentList = $derived(agents.agents);
 *   const tasks = $derived(agents.tasks);
 * </script>
 * ```
 */

import type {
	Agent,
	AgentActivity,
	Task,
	TaskStats,
	ApiMeta
} from '$lib/types/api.types';

// Re-export types for backward compatibility
export type { Agent, AgentActivity, Task };

export interface AgentsData {
	agents: Agent[];
	tasks: Task[];
	unassigned_tasks: Task[];
	task_stats: TaskStats;
	tasks_with_deps_count: number;
	tasks_with_deps: Task[];
	timestamp: string;
	meta: ApiMeta;
}

class AgentsStore {
	data = $state<AgentsData>({
		agents: [],
		tasks: [],
		unassigned_tasks: [],
		task_stats: {
			total: 0,
			open: 0,
			in_progress: 0,
			blocked: 0,
			closed: 0,
			by_priority: { p0: 0, p1: 0, p2: 0, p3: 0, p4: 0 }
		},
		tasks_with_deps_count: 0,
		tasks_with_deps: [],
		timestamp: new Date().toISOString(),
		meta: {
			poll_interval_ms: 3000,
			data_sources: [],
			cache_ttl_ms: 2000
		}
	});

	loading = $state(false);
	error = $state<string | null>(null);
	private pollInterval: ReturnType<typeof setInterval> | null = null;

	// Derived state for convenient access
	get agents() {
		return this.data.agents;
	}

	get tasks() {
		return this.data.tasks;
	}

	get unassignedTasks() {
		return this.data.unassigned_tasks;
	}

	get taskStats() {
		return this.data.task_stats;
	}

	private getAgentStatus(agent: Agent): 'working' | 'idle' | 'offline' {
		if (agent.in_progress_tasks > 0) return 'working';

		let timeSinceActive = Infinity;
		if (agent.last_active_ts) {
			const isoTimestamp = agent.last_active_ts.includes('T')
				? agent.last_active_ts
				: agent.last_active_ts.replace(' ', 'T') + 'Z';
			timeSinceActive = Date.now() - new Date(isoTimestamp).getTime();
		}

		if (timeSinceActive < 3_600_000) return 'idle';
		return 'offline';
	}

	get workingAgents() {
		return this.data.agents.filter(a => this.getAgentStatus(a) === 'working');
	}

	/** Agents with active sessions but no task — available for assignment */
	get activeAgents() {
		return this.data.agents.filter(a => this.getAgentStatus(a) === 'idle');
	}

	get idleAgents() {
		return this.data.agents.filter(a => this.getAgentStatus(a) === 'idle');
	}

	get offlineAgents() {
		return this.data.agents.filter(a => this.getAgentStatus(a) === 'offline');
	}

	get availableAgents() {
		return this.data.agents.filter(a => this.getAgentStatus(a) !== 'offline');
	}

	/**
	 * Fetch fresh data from the API
	 */
	async fetch(options?: { project?: string; agent?: string }) {
		try {
			this.loading = true;
			this.error = null;

			const params = new URLSearchParams();
			if (options?.project) params.set('project', options.project);
			if (options?.agent) params.set('agent', options.agent);

			const url = `/api/agents?full=true${params.toString() ? `&${params}` : ''}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const newData = await response.json();

			// Only update if we received valid data
			if (newData.agents || newData.tasks) {
				this.data = newData;
				this.error = null;
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Failed to fetch agent data:', err);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Start polling the API at the recommended interval
	 */
	startPolling(options?: { project?: string; agent?: string }) {
		// Initial fetch
		this.fetch(options);

		// Set up polling interval using the API's recommended interval
		const pollInterval = this.data.meta.poll_interval_ms || 3000;

		this.pollInterval = setInterval(() => {
			// Skip fetch when page is hidden to avoid Content-Length mismatch errors
			if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
				return;
			}
			this.fetch(options);
		}, pollInterval);

		console.log(`Started polling agent data every ${pollInterval}ms`);
	}

	/**
	 * Stop polling
	 */
	stopPolling() {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
			console.log('Stopped polling agent data');
		}
	}

	/**
	 * Cleanup method for component unmount
	 */
	destroy() {
		this.stopPolling();
	}
}

// Export singleton instance
export const agents = new AgentsStore();
