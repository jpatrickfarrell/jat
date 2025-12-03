<script lang="ts">
	/**
	 * TaskHistoryDrawer Component
	 *
	 * A sleek drawer showing task completion history with:
	 * - Streak calendar visualization (GitHub-style)
	 * - Daily breakdown with agent attribution
	 * - Clickable tasks for details
	 * - Streak statistics and milestones
	 */

	import { fly, fade } from 'svelte/transition';
	import StreakCalendar from './StreakCalendar.svelte';
	import AnimatedDigits from './AnimatedDigits.svelte';

	interface CompletedTask {
		id: string;
		title: string;
		assignee?: string;
		updated_at: string;
		closed_at?: string;
		priority?: number;
		issue_type?: string;
		project?: string;
	}

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
		onTaskClick?: (taskId: string) => void;
	}

	let {
		isOpen = $bindable(false),
		onClose = () => {},
		onTaskClick = () => {}
	}: Props = $props();

	// State
	let tasks = $state<CompletedTask[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// Fetch completed tasks when drawer opens
	$effect(() => {
		if (isOpen) {
			fetchTasks();
		}
	});

	async function fetchTasks() {
		loading = true;
		error = null;
		try {
			const response = await fetch('/api/tasks?status=closed');
			if (!response.ok) throw new Error('Failed to fetch tasks');
			const data = await response.json();
			tasks = data.tasks || [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	// Calculate statistics
	const stats = $derived.by(() => {
		if (tasks.length === 0) return {
			totalCompleted: 0,
			todayCount: 0,
			streak: 0,
			bestStreak: 0,
			avgPerDay: 0,
			topAgent: null
		};

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Group by date
		const tasksByDate = new Map<string, CompletedTask[]>();
		const agentCounts = new Map<string, number>();

		for (const task of tasks) {
			const dateStr = task.closed_at
				? new Date(task.closed_at).toISOString().split('T')[0]
				: new Date(task.updated_at).toISOString().split('T')[0];

			if (!tasksByDate.has(dateStr)) {
				tasksByDate.set(dateStr, []);
			}
			tasksByDate.get(dateStr)!.push(task);

			// Count by agent
			if (task.assignee) {
				agentCounts.set(task.assignee, (agentCounts.get(task.assignee) || 0) + 1);
			}
		}

		// Today's count
		const todayStr = today.toISOString().split('T')[0];
		const todayCount = tasksByDate.get(todayStr)?.length || 0;

		// Calculate current streak
		let streak = 0;
		const checkDate = new Date(today);

		for (let i = 0; i < 365; i++) {
			const dateStr = checkDate.toISOString().split('T')[0];
			if (tasksByDate.has(dateStr)) {
				streak++;
			} else if (i > 0) {
				break;
			}
			checkDate.setDate(checkDate.getDate() - 1);
		}

		// Calculate best streak
		const sortedDates = Array.from(tasksByDate.keys()).sort();
		let bestStreak = 0;
		let currentStreak = 0;
		let prevDate: Date | null = null;

		for (const dateStr of sortedDates) {
			const date = new Date(dateStr);
			if (prevDate) {
				const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
				if (diff === 1) {
					currentStreak++;
				} else {
					currentStreak = 1;
				}
			} else {
				currentStreak = 1;
			}
			bestStreak = Math.max(bestStreak, currentStreak);
			prevDate = date;
		}

		// Average per day (last 30 days)
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		let last30Count = 0;
		for (const [dateStr, dateTasks] of tasksByDate) {
			if (new Date(dateStr) >= thirtyDaysAgo) {
				last30Count += dateTasks.length;
			}
		}
		const avgPerDay = last30Count / 30;

		// Top agent
		let topAgent: { name: string; count: number } | null = null;
		for (const [name, count] of agentCounts) {
			if (!topAgent || count > topAgent.count) {
				topAgent = { name, count };
			}
		}

		return {
			totalCompleted: tasks.length,
			todayCount,
			streak,
			bestStreak,
			avgPerDay,
			topAgent
		};
	});

	// Group tasks by day for the list view
	interface DayGroup {
		date: string;
		displayDate: string;
		tasks: CompletedTask[];
		agents: Map<string, number>;
	}

	const tasksByDay = $derived.by(() => {
		const groups = new Map<string, DayGroup>();

		for (const task of tasks) {
			const dateStr = task.closed_at
				? new Date(task.closed_at).toISOString().split('T')[0]
				: new Date(task.updated_at).toISOString().split('T')[0];

			if (!groups.has(dateStr)) {
				const date = new Date(dateStr);
				groups.set(dateStr, {
					date: dateStr,
					displayDate: formatDisplayDate(date),
					tasks: [],
					agents: new Map()
				});
			}

			const group = groups.get(dateStr)!;
			group.tasks.push(task);
			if (task.assignee) {
				group.agents.set(task.assignee, (group.agents.get(task.assignee) || 0) + 1);
			}
		}

		// Sort by date descending
		return Array.from(groups.values())
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, 30); // Show last 30 days with activity
	});

	function formatDisplayDate(date: Date): string {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const dateOnly = new Date(date);
		dateOnly.setHours(0, 0, 0, 0);

		if (dateOnly.getTime() === today.getTime()) return 'Today';
		if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';

		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	// Priority colors
	function getPriorityColor(priority: number | undefined): string {
		switch (priority) {
			case 0: return 'oklch(0.70 0.18 25)'; // P0 - Red
			case 1: return 'oklch(0.75 0.15 55)'; // P1 - Orange
			case 2: return 'oklch(0.75 0.12 85)'; // P2 - Yellow
			default: return 'oklch(0.55 0.02 250)'; // P3+ - Gray
		}
	}

	function handleClose() {
		isOpen = false;
		onClose();
	}

	function handleOverlayClick() {
		handleClose();
	}

	function handleTaskClick(taskId: string) {
		onTaskClick(taskId);
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Overlay -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="drawer-overlay"
		onclick={handleOverlayClick}
		transition:fade={{ duration: 200 }}
	></div>

	<!-- Drawer -->
	<div
		class="history-drawer"
		transition:fly={{ x: 400, duration: 300, opacity: 1 }}
		role="dialog"
		aria-modal="true"
		aria-label="Task History"
	>
		<!-- Header -->
		<header class="drawer-header">
			<div class="header-content">
				<div class="header-icon">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
						<path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
					</svg>
				</div>
				<div>
					<h2 class="header-title">Task History</h2>
					<p class="header-subtitle">{stats.totalCompleted} tasks completed</p>
				</div>
			</div>
			<button
				class="close-btn"
				onclick={handleClose}
				aria-label="Close"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</header>

		<!-- Content -->
		<div class="drawer-content">
			{#if loading}
				<div class="loading-state">
					<span class="loading loading-spinner loading-lg"></span>
					<p>Loading history...</p>
				</div>
			{:else if error}
				<div class="error-state">
					<p>{error}</p>
					<button class="retry-btn" onclick={fetchTasks}>Retry</button>
				</div>
			{:else}
				<!-- Stats Row -->
				<div class="stats-row">
					<div class="stat-card streak-card">
						<div class="stat-icon">
							<span class="streak-fire">🔥</span>
						</div>
						<div class="stat-content">
							<span class="stat-value">
								<AnimatedDigits value={stats.streak.toString()} />
							</span>
							<span class="stat-label">day streak</span>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-content">
							<span class="stat-value today-value">
								<AnimatedDigits value={stats.todayCount.toString()} />
							</span>
							<span class="stat-label">today</span>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-content">
							<span class="stat-value">
								<AnimatedDigits value={stats.bestStreak.toString()} />
							</span>
							<span class="stat-label">best streak</span>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-content">
							<span class="stat-value">
								{stats.avgPerDay.toFixed(1)}
							</span>
							<span class="stat-label">avg/day</span>
						</div>
					</div>
				</div>

				<!-- Calendar Section -->
				<section class="calendar-section">
					<h3 class="section-title">Activity</h3>
					<div class="calendar-container">
						<StreakCalendar {tasks} weeks={12} />
					</div>
				</section>

				<!-- Top Contributor -->
				{#if stats.topAgent}
					<div class="top-agent">
						<span class="top-agent-label">Top contributor:</span>
						<span class="top-agent-name">{stats.topAgent.name}</span>
						<span class="top-agent-count">({stats.topAgent.count} tasks)</span>
					</div>
				{/if}

				<!-- Daily Breakdown -->
				<section class="daily-section">
					<h3 class="section-title">Recent Activity</h3>
					<div class="day-list">
						{#each tasksByDay as day}
							<div class="day-group">
								<div class="day-header">
									<span class="day-date">{day.displayDate}</span>
									<span class="day-count">{day.tasks.length} task{day.tasks.length !== 1 ? 's' : ''}</span>
									{#if day.agents.size > 0}
										<div class="day-agents">
											{#each Array.from(day.agents.entries()).slice(0, 3) as [agent, count]}
												<span class="agent-chip" title="{agent}: {count} tasks">
													{agent.slice(0, 2)}
												</span>
											{/each}
											{#if day.agents.size > 3}
												<span class="agent-chip more">+{day.agents.size - 3}</span>
											{/if}
										</div>
									{/if}
								</div>
								<div class="day-tasks">
									{#each day.tasks as task}
										<button
											class="task-item"
											onclick={() => handleTaskClick(task.id)}
										>
											<span
												class="task-priority"
												style="background: {getPriorityColor(task.priority)}"
											></span>
											<div class="task-info">
												<span class="task-title">{task.title}</span>
												<span class="task-meta">
													<span class="task-id">{task.id}</span>
													{#if task.assignee}
														<span class="task-agent">by {task.assignee}</span>
													{/if}
													<span class="task-time">
														{formatTime(task.closed_at || task.updated_at)}
													</span>
												</span>
											</div>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="task-arrow">
												<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
											</svg>
										</button>
									{/each}
								</div>
							</div>
						{/each}

						{#if tasksByDay.length === 0}
							<div class="empty-state">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p>No completed tasks yet</p>
								<p class="empty-hint">Tasks will appear here when marked complete</p>
							</div>
						{/if}
					</div>
				</section>
			{/if}
		</div>
	</div>
{/if}

<style>
	.drawer-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.6);
		backdrop-filter: blur(2px);
		z-index: 998;
	}

	.history-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		max-width: 480px;
		background: oklch(0.16 0.02 250);
		border-left: 1px solid oklch(0.30 0.02 250);
		z-index: 999;
		display: flex;
		flex-direction: column;
		box-shadow: -8px 0 32px oklch(0 0 0 / 0.4);
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid oklch(0.28 0.02 250);
		background: oklch(0.14 0.02 250);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.header-icon {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: linear-gradient(135deg, oklch(0.70 0.15 85), oklch(0.60 0.18 55));
		display: flex;
		align-items: center;
		justify-content: center;
		color: oklch(0.15 0.02 85);
	}

	.header-title {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		font-family: ui-monospace, monospace;
		letter-spacing: -0.01em;
		margin: 0;
	}

	.header-subtitle {
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: transparent;
		border: 1px solid oklch(0.30 0.02 250);
		color: oklch(0.60 0.02 250);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.close-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
		border-color: oklch(0.40 0.02 250);
	}

	.drawer-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* Stats Row */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	.stat-card {
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 8px;
		padding: 0.75rem 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.streak-card {
		background: linear-gradient(135deg, oklch(0.25 0.08 35), oklch(0.22 0.05 45));
		border-color: oklch(0.40 0.10 35);
	}

	.stat-icon {
		font-size: 1.25rem;
	}

	.streak-fire {
		filter: drop-shadow(0 0 4px oklch(0.70 0.20 35 / 0.6));
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: oklch(0.90 0.02 250);
		font-family: ui-monospace, monospace;
		line-height: 1;
	}

	.today-value {
		color: oklch(0.80 0.15 85);
	}

	.stat-label {
		font-size: 0.65rem;
		color: oklch(0.50 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}

	/* Calendar Section */
	.calendar-section {
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 10px;
		padding: 1rem;
	}

	.section-title {
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0 0 0.75rem 0;
	}

	.calendar-container {
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}

	/* Top Agent */
	.top-agent {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.20 0.04 145 / 0.3);
		border: 1px solid oklch(0.40 0.08 145 / 0.4);
		border-radius: 6px;
		font-size: 0.75rem;
	}

	.top-agent-label {
		color: oklch(0.55 0.02 250);
	}

	.top-agent-name {
		color: oklch(0.75 0.12 145);
		font-weight: 600;
		font-family: ui-monospace, monospace;
	}

	.top-agent-count {
		color: oklch(0.50 0.02 250);
	}

	/* Daily Section */
	.daily-section {
		flex: 1;
	}

	.day-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.day-group {
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 8px;
		overflow: hidden;
	}

	.day-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		background: oklch(0.15 0.02 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.day-date {
		font-size: 0.8rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		font-family: ui-monospace, monospace;
	}

	.day-count {
		font-size: 0.7rem;
		color: oklch(0.55 0.02 250);
		padding: 0.125rem 0.5rem;
		background: oklch(0.25 0.02 250);
		border-radius: 10px;
	}

	.day-agents {
		display: flex;
		gap: 0.25rem;
		margin-left: auto;
	}

	.agent-chip {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background: oklch(0.30 0.08 200);
		color: oklch(0.80 0.10 200);
		font-size: 0.6rem;
		font-weight: 600;
		font-family: ui-monospace, monospace;
		display: flex;
		align-items: center;
		justify-content: center;
		text-transform: uppercase;
	}

	.agent-chip.more {
		background: oklch(0.25 0.02 250);
		color: oklch(0.60 0.02 250);
		width: auto;
		padding: 0 0.375rem;
		font-size: 0.55rem;
	}

	.day-tasks {
		display: flex;
		flex-direction: column;
	}

	.task-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.15s ease;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.task-item:last-child {
		border-bottom: none;
	}

	.task-item:hover {
		background: oklch(0.22 0.02 250);
	}

	.task-priority {
		width: 3px;
		height: 24px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.task-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.task-title {
		font-size: 0.8rem;
		color: oklch(0.85 0.02 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.task-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.65rem;
		color: oklch(0.50 0.02 250);
	}

	.task-id {
		font-family: ui-monospace, monospace;
		color: oklch(0.55 0.10 200);
	}

	.task-agent {
		color: oklch(0.55 0.08 145);
	}

	.task-time {
		margin-left: auto;
	}

	.task-arrow {
		width: 14px;
		height: 14px;
		color: oklch(0.40 0.02 250);
		flex-shrink: 0;
		transition: color 0.15s ease, transform 0.15s ease;
	}

	.task-item:hover .task-arrow {
		color: oklch(0.60 0.02 250);
		transform: translateX(2px);
	}

	/* Loading & Error States */
	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		color: oklch(0.55 0.02 250);
		text-align: center;
		gap: 0.75rem;
	}

	.retry-btn {
		padding: 0.5rem 1rem;
		background: oklch(0.30 0.02 250);
		border: 1px solid oklch(0.40 0.02 250);
		border-radius: 6px;
		color: oklch(0.85 0.02 250);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.15s ease;
	}

	.retry-btn:hover {
		background: oklch(0.35 0.02 250);
	}

	.empty-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.40 0.02 250);
	}

	.empty-hint {
		font-size: 0.75rem;
		color: oklch(0.45 0.02 250);
	}
</style>
