/**
 * Agent Orchestration Store
 *
 * Reactive Svelte 5 store that polls the /api/orchestration endpoint
 * for real-time agent coordination data.
 *
 * Usage:
 * ```svelte
 * <script lang="ts">
 *   import { orchestration } from '$lib/stores/orchestration.svelte';
 *
 *   // Access reactive state
 *   const agents = $derived(orchestration.agents);
 *   const tasks = $derived(orchestration.tasks);
 * </script>
 * ```
 */

export interface Agent {
	id: number;
	name: string;
	program: string;
	model: string;
	task_description: string;
	last_active_ts: string;
	reservation_count: number;
	task_count: number;
	open_tasks: number;
	in_progress_tasks: number;
	active: boolean;
}

export interface Reservation {
	id: number;
	path_pattern: string;
	exclusive: number;
	reason: string;
	created_ts: string;
	expires_ts: string;
	released_ts: string | null;
	agent_name: string;
	project_path: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	status: string;
	priority: number;
	issue_type: string;
	project: string;
	assignee?: string;
	labels: string[];
	depends_on?: Array<{ id: string; title: string; status: string }>;
	blocked_by?: Array<{ id: string; title: string; status: string }>;
}

export interface OrchestrationData {
	agents: Agent[];
	reservations: Reservation[];
	reservations_by_agent: Record<string, Reservation[]>;
	tasks: Task[];
	unassigned_tasks: Task[];
	task_stats: {
		total: number;
		open: number;
		in_progress: number;
		blocked: number;
		closed: number;
		by_priority: {
			p0: number;
			p1: number;
			p2: number;
			p3: number;
			p4: number;
		};
	};
	tasks_with_deps_count: number;
	tasks_with_deps: Task[];
	timestamp: string;
	meta: {
		poll_interval_ms: number;
		data_sources: string[];
		cache_ttl_ms: number;
	};
}

class OrchestrationStore {
	data = $state<OrchestrationData>({
		agents: [],
		reservations: [],
		reservations_by_agent: {},
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

	get reservations() {
		return this.data.reservations;
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

	get activeAgents() {
		return this.data.agents.filter(a => a.active);
	}

	get idleAgents() {
		return this.data.agents.filter(a => !a.active);
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

			const url = `/api/orchestration${params.toString() ? `?${params}` : ''}`;
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
			console.error('Failed to fetch orchestration data:', err);
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
			this.fetch(options);
		}, pollInterval);

		console.log(`Started polling orchestration data every ${pollInterval}ms`);
	}

	/**
	 * Stop polling
	 */
	stopPolling() {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
			console.log('Stopped polling orchestration data');
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
export const orchestration = new OrchestrationStore();
