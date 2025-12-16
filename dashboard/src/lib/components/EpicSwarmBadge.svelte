<script lang="ts">
	/**
	 * EpicSwarmBadge Component
	 *
	 * Displays active epic swarm status in the topbar with hover dropdown.
	 * Shows progress, task breakdown by status, agent assignments, and controls.
	 *
	 * Features:
	 * - Progress indicator (3/10 tasks)
	 * - Hover dropdown with task list grouped by status
	 * - Spawn more agents button
	 * - Pause/resume controls
	 * - Shows next tasks in queue
	 */

	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import {
		epicQueueState,
		getReadyTasks,
		getInProgressTasks,
		getBlockedTasks,
		canSpawnMore,
		spawnNextAgent,
		stopEpic,
		refreshEpicState,
		initializeFromPersisted,
		hasPersistedEpic,
		type EpicChild,
		type SpawnResult
	} from '$lib/stores/epicQueueStore.svelte';
	import { SPAWN_STAGGER_MS } from '$lib/config/spawnConfig';

	// Auto-refresh interval (10 seconds)
	const REFRESH_INTERVAL = 10000;

	// Dropdown state
	let showDropdown = $state(false);
	let isRefreshing = $state(false);

	// Track initialization state
	let isInitializing = $state(false);

	// Initialize and restore persisted epic (async, runs separately)
	async function initializeEpic() {
		// If not already active, check for persisted epic and restore
		if (!epicQueueState.isActive && hasPersistedEpic()) {
			console.log('[EpicSwarmBadge] Restoring persisted epic...');
			isInitializing = true;
			try {
				await initializeFromPersisted();
			} finally {
				isInitializing = false;
			}
		}

		// Initial refresh
		if (epicQueueState.isActive) {
			refreshEpicState();
		}
	}

	// Auto-refresh when component mounts and epic is active
	onMount(() => {
		// Debug log
		console.log('[EpicSwarmBadge] Mount - isActive:', epicQueueState.isActive, 'epicId:', epicQueueState.epicId);

		// Initialize async (don't await to avoid cleanup function issue)
		initializeEpic();

		// Set up interval
		const interval = setInterval(() => {
			if (epicQueueState.isActive && !isRefreshing) {
				refreshEpicState();
			}
		}, REFRESH_INTERVAL);

		return () => clearInterval(interval);
	});

	// Manual refresh handler
	async function handleRefresh() {
		if (isRefreshing) return;
		isRefreshing = true;
		await refreshEpicState();
		isRefreshing = false;
	}
	let dropdownTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSpawningMore = $state(false);
	let spawnMessage = $state<string | null>(null);

	// Derived state from epic queue
	const isActive = $derived(epicQueueState.isActive);
	const epicId = $derived(epicQueueState.epicId);

	// Debug: log when state changes
	$effect(() => {
		console.log('[EpicSwarmBadge] State changed - isActive:', isActive, 'epicId:', epicId);
	});
	const epicTitle = $derived(epicQueueState.epicTitle);
	const children = $derived(epicQueueState.children);
	const progress = $derived(epicQueueState.progress);
	const settings = $derived(epicQueueState.settings);
	const runningAgents = $derived(epicQueueState.runningAgents);
	const isSpawning = $derived(epicQueueState.isSpawning);

	// Group children by status
	const completedTasks = $derived(children.filter((c) => c.status === 'completed'));
	const inProgressTasks = $derived(children.filter((c) => c.status === 'in_progress'));
	const readyTasks = $derived(children.filter((c) => c.status === 'ready'));
	const blockedTasks = $derived(children.filter((c) => c.status === 'blocked'));

	// Use inProgressTasks.length as the true count of working agents
	// (runningAgents only tracks agents spawned through this store)
	const activeAgentCount = $derived(inProgressTasks.length);

	// Calculate how many more agents we can spawn
	const availableSlots = $derived(
		settings.mode === 'sequential'
			? (activeAgentCount === 0 ? 1 : 0)
			: Math.max(0, settings.maxConcurrent - activeAgentCount)
	);
	const canSpawn = $derived(availableSlots > 0 && readyTasks.length > 0);
	const spawnableCount = $derived(Math.min(availableSlots, readyTasks.length));

	// Dropdown handlers
	function handleMouseEnter() {
		if (dropdownTimeout) clearTimeout(dropdownTimeout);
		showDropdown = true;
	}

	function handleMouseLeave() {
		dropdownTimeout = setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	// Spawn more agents up to maxConcurrent
	async function handleSpawnMore() {
		if (!canSpawn || isSpawningMore) return;

		isSpawningMore = true;
		spawnMessage = null;

		const results: SpawnResult[] = [];
		const toSpawn = spawnableCount;

		try {
			for (let i = 0; i < toSpawn; i++) {
				const result = await spawnNextAgent();
				if (result) {
					results.push(result);
					if (!result.success) break;
				} else {
					break; // No more tasks or at capacity
				}

				// Stagger spawns
				if (i < toSpawn - 1) {
					await new Promise((r) => setTimeout(r, SPAWN_STAGGER_MS));
				}
			}

			const successCount = results.filter((r) => r.success).length;
			if (successCount > 0) {
				spawnMessage = `Spawned ${successCount} agent${successCount > 1 ? 's' : ''}`;
			} else if (results.length > 0) {
				spawnMessage = results[0].error || 'Failed to spawn';
			}
		} catch (err) {
			spawnMessage = err instanceof Error ? err.message : 'Spawn failed';
		} finally {
			isSpawningMore = false;
			// Clear message after 3s
			setTimeout(() => {
				spawnMessage = null;
			}, 3000);
		}
	}

	// Stop the epic swarm
	function handleStop() {
		if (confirm('Stop the epic swarm? Running agents will continue but no new agents will spawn.')) {
			stopEpic();
			showDropdown = false;
		}
	}

	// Format time since epic started
	function formatDuration(start: Date | null): string {
		if (!start) return '';
		const diffMs = Date.now() - start.getTime();
		const mins = Math.floor(diffMs / 60000);
		if (mins < 60) return `${mins}m`;
		const hours = Math.floor(mins / 60);
		return `${hours}h ${mins % 60}m`;
	}

	// Get status icon
	function getStatusIcon(status: EpicChild['status']): string {
		switch (status) {
			case 'completed':
				return '✅';
			case 'in_progress':
				return '⚡';
			case 'ready':
				return '⏳';
			case 'blocked':
				return '🔒';
			default:
				return '○';
		}
	}

	// Get status color
	function getStatusColor(status: EpicChild['status']): string {
		switch (status) {
			case 'completed':
				return 'oklch(0.75 0.18 145)';
			case 'in_progress':
				return 'oklch(0.80 0.18 85)';
			case 'ready':
				return 'oklch(0.70 0.12 200)';
			case 'blocked':
				return 'oklch(0.55 0.08 250)';
			default:
				return 'oklch(0.50 0.02 250)';
		}
	}
</script>

{#if isInitializing}
	<!-- Loading indicator while restoring persisted epic -->
	<div class="flex items-center gap-2 px-2 py-1">
		<span class="loading loading-spinner loading-xs text-primary"></span>
		<span class="text-xs text-base-content/60">Restoring epic...</span>
	</div>
{:else if isActive && epicId}
	<!-- Epic Swarm Badge -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative flex items-center"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<button
			type="button"
			class="epic-badge"
			class:spawning={isSpawning || isSpawningMore}
		>
			<!-- Mountain icon -->
			<span class="text-sm">🏔️</span>

			<!-- Epic ID (truncated) -->
			<span class="font-mono text-xs font-medium truncate max-w-[80px]">
				{epicId}
			</span>

			<!-- Progress -->
			<span
				class="progress-pill"
				style="background: oklch(0.25 0.08 145); color: oklch(0.85 0.15 145);"
			>
				{progress.completed}/{progress.total}
			</span>

			<!-- Dropdown arrow -->
			<svg
				class="w-3 h-3 transition-transform"
				class:rotate-180={showDropdown}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
			</svg>
		</button>

		<!-- Dropdown Panel -->
		{#if showDropdown}
			<div
				class="dropdown-panel"
				transition:fly={{ y: -8, duration: 150 }}
			>
				<!-- Header -->
				<div class="panel-header">
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-semibold" style="color: oklch(0.85 0.15 270);">
							🏔️ {epicTitle || epicId}
						</span>
						<span class="text-[10px] font-mono" style="color: oklch(0.55 0.05 250);">
							{epicId} • {formatDuration(epicQueueState.startedAt)}
						</span>
					</div>
					<div class="flex items-center gap-2">
						<!-- Agent count -->
						<span
							class="text-[10px] px-1.5 py-0.5 rounded font-mono"
							style="background: oklch(0.25 0.08 85); color: oklch(0.80 0.15 85);"
						>
							{activeAgentCount}/{settings.maxConcurrent} agents
						</span>
					</div>
				</div>

				<!-- Progress bar -->
				<div class="px-3 py-2" style="background: oklch(0.14 0.02 250);">
					<div class="flex items-center justify-between mb-1">
						<span class="text-[10px]" style="color: oklch(0.60 0.02 250);">Progress</span>
						<span class="text-[10px] font-mono" style="color: oklch(0.70 0.10 145);">
							{Math.round((progress.completed / progress.total) * 100)}%
						</span>
					</div>
					<div
						class="h-1.5 rounded-full overflow-hidden"
						style="background: oklch(0.25 0.02 250);"
					>
						<div
							class="h-full rounded-full transition-all duration-500"
							style="
								width: {(progress.completed / progress.total) * 100}%;
								background: linear-gradient(90deg, oklch(0.60 0.18 145), oklch(0.70 0.18 145));
							"
						></div>
					</div>
					<!-- Status summary -->
					<div class="flex items-center gap-3 mt-2 text-[10px]">
						<span style="color: oklch(0.75 0.18 145);">✅ {completedTasks.length}</span>
						<span style="color: oklch(0.80 0.18 85);">⚡ {inProgressTasks.length}</span>
						<span style="color: oklch(0.70 0.12 200);">⏳ {readyTasks.length}</span>
						<span style="color: oklch(0.55 0.08 250);">🔒 {blockedTasks.length}</span>
					</div>
				</div>

				<!-- Task list -->
				<div class="max-h-[300px] overflow-y-auto">
					{#each children as task (task.id)}
						<div
							class="task-row"
							style="border-left: 2px solid {getStatusColor(task.status)};"
						>
							<div class="flex items-center gap-2 flex-1 min-w-0">
								<span class="text-sm flex-shrink-0">{getStatusIcon(task.status)}</span>
								<div class="flex-1 min-w-0">
									<div class="text-[11px] font-mono truncate" style="color: oklch(0.80 0.02 250);">
										{task.id}
									</div>
									<div class="text-[10px] truncate" style="color: oklch(0.55 0.02 250);">
										{task.title}
									</div>
								</div>
							</div>
							{#if task.assignee}
								<span
									class="text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
									style="background: oklch(0.25 0.08 85); color: oklch(0.75 0.12 85);"
								>
									{task.assignee}
								</span>
							{:else if task.status === 'ready'}
								<span
									class="text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
									style="background: oklch(0.22 0.05 200); color: oklch(0.65 0.10 200);"
								>
									queued
								</span>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Controls footer -->
				<div class="panel-footer">
					{#if spawnMessage}
						<div
							class="text-[10px] text-center py-1 mb-2"
							style="color: {spawnMessage.includes('Failed') ? 'oklch(0.70 0.18 25)' : 'oklch(0.75 0.15 145)'};"
						>
							{spawnMessage}
						</div>
					{/if}

					<div class="flex items-center gap-2">
						<!-- Spawn more button -->
						<button
							type="button"
							class="control-btn spawn-btn"
							onclick={handleSpawnMore}
							disabled={!canSpawn || isSpawningMore}
						>
							{#if isSpawningMore}
								<span class="loading loading-spinner loading-xs"></span>
							{:else}
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
							{/if}
							<span>
								{#if canSpawn}
									Spawn {spawnableCount} more
								{:else if readyTasks.length === 0}
									No ready tasks
								{:else}
									At capacity
								{/if}
							</span>
						</button>

						<!-- Refresh button -->
						<button
							type="button"
							class="control-btn refresh-btn"
							onclick={handleRefresh}
							disabled={isRefreshing}
							title="Refresh status from database"
						>
							{#if isRefreshing}
								<span class="loading loading-spinner loading-xs"></span>
							{:else}
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
								</svg>
							{/if}
						</button>

						<!-- Stop button -->
						<button
							type="button"
							class="control-btn stop-btn"
							onclick={handleStop}
						>
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
							</svg>
							<span>Stop</span>
						</button>
					</div>

					<!-- Next up preview -->
					{#if readyTasks.length > 0 && availableSlots > 0}
						<div class="mt-2 pt-2" style="border-top: 1px solid oklch(0.25 0.02 250);">
							<span class="text-[9px]" style="color: oklch(0.50 0.02 250);">
								Next up: {readyTasks.slice(0, 3).map((t) => t.id).join(', ')}
								{#if readyTasks.length > 3}
									<span style="color: oklch(0.45 0.02 250);">+{readyTasks.length - 3} more</span>
								{/if}
							</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.epic-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem 0.25rem 0.375rem;
		border-radius: 0.375rem;
		background: oklch(0.20 0.04 270);
		border: 1px solid oklch(0.40 0.10 270);
		color: oklch(0.85 0.12 270);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.epic-badge:hover {
		background: oklch(0.25 0.06 270);
		border-color: oklch(0.50 0.12 270);
	}

	.epic-badge.spawning {
		animation: pulse-glow 1.5s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 0 0 oklch(0.60 0.15 270 / 0);
		}
		50% {
			box-shadow: 0 0 12px 2px oklch(0.60 0.15 270 / 0.4);
		}
	}

	.progress-pill {
		font-size: 0.625rem;
		font-family: ui-monospace, monospace;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		font-weight: 600;
	}

	.dropdown-panel {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.375rem;
		z-index: 50;
		min-width: 320px;
		max-width: 400px;
		border-radius: 0.5rem;
		box-shadow: 0 10px 40px oklch(0 0 0 / 0.5);
		overflow: hidden;
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.30 0.03 270);
	}

	.panel-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 0.75rem;
		background: oklch(0.18 0.03 270);
		border-bottom: 1px solid oklch(0.28 0.03 270);
	}

	.task-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border-bottom: 1px solid oklch(0.22 0.01 250);
		transition: background 0.1s ease;
	}

	.task-row:hover {
		background: oklch(0.20 0.02 250);
	}

	.task-row:last-child {
		border-bottom: none;
	}

	.panel-footer {
		padding: 0.75rem;
		background: oklch(0.14 0.02 250);
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.6875rem;
		font-weight: 500;
		font-family: ui-monospace, monospace;
		cursor: pointer;
		transition: all 0.15s ease;
		border: 1px solid transparent;
	}

	.spawn-btn {
		flex: 1;
		justify-content: center;
		background: oklch(0.30 0.10 145);
		color: oklch(0.90 0.12 145);
		border-color: oklch(0.40 0.12 145);
	}

	.spawn-btn:hover:not(:disabled) {
		background: oklch(0.35 0.12 145);
	}

	.spawn-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.refresh-btn {
		background: oklch(0.22 0.05 200);
		color: oklch(0.75 0.10 200);
		border-color: oklch(0.32 0.08 200);
		padding: 0.375rem;
	}

	.refresh-btn:hover:not(:disabled) {
		background: oklch(0.28 0.08 200);
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.stop-btn {
		background: oklch(0.25 0.08 25);
		color: oklch(0.80 0.12 25);
		border-color: oklch(0.35 0.10 25);
	}

	.stop-btn:hover {
		background: oklch(0.30 0.10 25);
	}
</style>
