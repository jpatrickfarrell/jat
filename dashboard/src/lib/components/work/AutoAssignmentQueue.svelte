<script lang="ts">
	/**
	 * AutoAssignmentQueue Component
	 * Collapsible panel showing the 'next up' queue with configurable auto-assignment rules.
	 * Shows which tasks will be picked when agents become idle.
	 *
	 * Features:
	 * - Collapsible panel (remembers state in localStorage)
	 * - Shows top N ready tasks from bd ready
	 * - Displays priority, task ID, title
	 * - Shows "Next up" indicator for first task
	 * - Configurable sort policy (hybrid, priority, oldest)
	 * - Click task to open detail drawer
	 * - Spawn button to start work immediately
	 */

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getPriorityBadge } from '$lib/utils/badgeHelpers';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import AnimatedDigits from '$lib/components/AnimatedDigits.svelte';

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string;
	}

	interface QueueStats {
		total: number;
		by_priority: {
			p0: number;
			p1: number;
			p2: number;
			p3: number;
		};
	}

	interface Props {
		/** Selected project filter */
		selectedProject?: string;
		/** Maximum tasks to show */
		limit?: number;
		/** Callback when task is clicked */
		onTaskClick?: (taskId: string) => void;
		/** Callback to spawn agent for task */
		onSpawnForTask?: (taskId: string) => Promise<void>;
		/** Custom CSS class */
		class?: string;
	}

	let {
		selectedProject = 'All Projects',
		limit = 5,
		onTaskClick,
		onSpawnForTask,
		class: className = ''
	}: Props = $props();

	// State
	let queue = $state<Task[]>([]);
	let stats = $state<QueueStats>({ total: 0, by_priority: { p0: 0, p1: 0, p2: 0, p3: 0 } });
	let isCollapsed = $state(false);
	let sortPolicy = $state<'hybrid' | 'priority' | 'oldest'>('hybrid');
	let isLoading = $state(true);
	let spawningTaskId = $state<string | null>(null);

	// LocalStorage keys
	const COLLAPSED_KEY = 'auto-assignment-queue-collapsed';
	const SORT_KEY = 'auto-assignment-queue-sort';

	// Load preferences on mount
	onMount(() => {
		if (browser) {
			const savedCollapsed = localStorage.getItem(COLLAPSED_KEY);
			if (savedCollapsed !== null) {
				isCollapsed = savedCollapsed === 'true';
			}
			const savedSort = localStorage.getItem(SORT_KEY);
			if (savedSort && ['hybrid', 'priority', 'oldest'].includes(savedSort)) {
				sortPolicy = savedSort as 'hybrid' | 'priority' | 'oldest';
			}
		}
		fetchQueue();
	});

	// Refetch when project or sort changes
	$effect(() => {
		selectedProject;
		sortPolicy;
		fetchQueue();
	});

	// Save preferences
	function saveCollapsed() {
		if (browser) {
			localStorage.setItem(COLLAPSED_KEY, String(isCollapsed));
		}
	}

	function saveSortPolicy() {
		if (browser) {
			localStorage.setItem(SORT_KEY, sortPolicy);
		}
	}

	// Fetch queue data
	async function fetchQueue() {
		try {
			isLoading = true;
			let url = `/api/tasks/queue?limit=${limit}&sort=${sortPolicy}`;
			if (selectedProject && selectedProject !== 'All Projects') {
				url += `&project=${encodeURIComponent(selectedProject)}`;
			}

			const response = await fetch(url);
			const data = await response.json();

			if (data.error) {
				console.error('Queue API error:', data.error);
				return;
			}

			queue = data.queue || [];
			stats = data.stats || { total: 0, by_priority: { p0: 0, p1: 0, p2: 0, p3: 0 } };
		} catch (error) {
			console.error('Failed to fetch queue:', error);
		} finally {
			isLoading = false;
		}
	}

	// Handle task click
	function handleTaskClick(taskId: string) {
		if (onTaskClick) {
			onTaskClick(taskId);
		}
	}

	// Handle spawn
	async function handleSpawn(taskId: string, event: MouseEvent) {
		event.stopPropagation();
		if (!onSpawnForTask || spawningTaskId) return;

		spawningTaskId = taskId;
		try {
			await onSpawnForTask(taskId);
			// Refetch queue after spawn
			await fetchQueue();
		} catch (error) {
			console.error('Failed to spawn for task:', error);
		} finally {
			spawningTaskId = null;
		}
	}

	// Toggle collapse
	function toggleCollapse() {
		isCollapsed = !isCollapsed;
		saveCollapsed();
	}

	// Change sort policy
	function setSortPolicy(policy: 'hybrid' | 'priority' | 'oldest') {
		sortPolicy = policy;
		saveSortPolicy();
	}

	// Get sort policy label
	const sortLabels: Record<string, string> = {
		hybrid: 'Smart',
		priority: 'Priority',
		oldest: 'Oldest'
	};
</script>

<div class="bg-base-200/50 border border-base-300 rounded-lg {className}">
	<!-- Header (always visible) -->
	<div class="flex items-center justify-between px-3 py-2 rounded-t-lg">
		<!-- Toggle button (left side) -->
		<button
			class="flex items-center gap-2 hover:bg-base-200/80 transition-colors rounded px-1 -ml-1"
			onclick={toggleCollapse}
		>
			<!-- Chevron icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-4 h-4 transition-transform {isCollapsed ? '' : 'rotate-90'}"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
			</svg>

			<span class="text-sm font-medium">Next Up</span>

			<!-- Queue count badge -->
			<span class="badge badge-sm badge-ghost">
				<AnimatedDigits value={stats.total.toString()} />
			</span>

			<!-- Priority breakdown (when collapsed) -->
			{#if isCollapsed && stats.total > 0}
				<div class="flex gap-1 ml-1">
					{#if stats.by_priority.p0 > 0}
						<span class="badge badge-xs badge-error">{stats.by_priority.p0} P0</span>
					{/if}
					{#if stats.by_priority.p1 > 0}
						<span class="badge badge-xs badge-warning">{stats.by_priority.p1} P1</span>
					{/if}
				</div>
			{/if}
		</button>

		<!-- Sort dropdown (right side, only when expanded) -->
		{#if !isCollapsed}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-xs btn-ghost gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
					</svg>
					{sortLabels[sortPolicy]}
				</div>
				<ul class="dropdown-content z-10 menu p-1 shadow bg-base-100 rounded-box w-32">
					<li>
						<button
							class="text-xs {sortPolicy === 'hybrid' ? 'active' : ''}"
							onclick={() => setSortPolicy('hybrid')}
						>
							Smart
						</button>
					</li>
					<li>
						<button
							class="text-xs {sortPolicy === 'priority' ? 'active' : ''}"
							onclick={() => setSortPolicy('priority')}
						>
							Priority
						</button>
					</li>
					<li>
						<button
							class="text-xs {sortPolicy === 'oldest' ? 'active' : ''}"
							onclick={() => setSortPolicy('oldest')}
						>
							Oldest
						</button>
					</li>
				</ul>
			</div>
		{/if}
	</div>

	<!-- Collapsible content -->
	{#if !isCollapsed}
		<div class="px-3 pb-3">
			{#if isLoading}
				<!-- Loading skeleton -->
				<div class="space-y-2">
					{#each Array(3) as _, i}
						<div class="skeleton h-10 w-full rounded"></div>
					{/each}
				</div>
			{:else if queue.length === 0}
				<!-- Empty state -->
				<div class="text-center py-4 text-base-content/50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-8 h-8 mx-auto mb-2 opacity-40"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
					</svg>
					<p class="text-xs">No tasks ready</p>
				</div>
			{:else}
				<!-- Queue list -->
				<div class="space-y-1.5">
					{#each queue as task, index (task.id)}
						{@const isFirst = index === 0}
						<div class="flex items-center gap-2 bg-base-100 rounded-lg border border-base-300 hover:border-primary transition-all group {isFirst ? 'ring-1 ring-primary/30' : ''}">
							<!-- Task button (main clickable area) -->
							<button
								class="flex-1 flex items-center gap-2 px-2 py-1.5 text-left min-w-0"
								onclick={() => handleTaskClick(task.id)}
							>
								<!-- Position indicator -->
								<div class="flex-shrink-0 w-5 text-center">
									{#if isFirst}
										<span class="text-xs font-bold text-primary">1st</span>
									{:else}
										<span class="text-xs text-base-content/40">{index + 1}</span>
									{/if}
								</div>

								<!-- Priority badge -->
								<span class="badge badge-xs {getPriorityBadge(task.priority)} flex-shrink-0">
									P{task.priority}
								</span>

								<!-- Task ID -->
								<span class="text-xs font-mono text-base-content/60 flex-shrink-0">
									{task.id}
								</span>

								<!-- Title (truncated) -->
								<span class="text-sm truncate flex-1" title={task.title}>
									{task.title}
								</span>
							</button>

							<!-- Spawn button (on hover) -->
							{#if onSpawnForTask}
								<button
									class="btn btn-xs btn-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mr-2"
									onclick={(e) => handleSpawn(task.id, e)}
									disabled={spawningTaskId === task.id}
									title="Start work on this task"
								>
									{#if spawningTaskId === task.id}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
										</svg>
									{/if}
								</button>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Footer hint -->
				{#if stats.total > limit}
					<div class="text-xs text-center text-base-content/40 mt-2">
						Showing {limit} of {stats.total} ready tasks
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
