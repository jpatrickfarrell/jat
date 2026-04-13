<script lang="ts">
	/**
	 * CompletedSignalDrawer
	 *
	 * Right-side drawer that shows the EventStack completion card for a history task.
	 * Replaces TaskDetailDrawer for completed tasks that have signal data.
	 *
	 * Shows: CHANGES MADE / SUGGESTED FOLLOW-UP / CROSS-AGENT INTEL / AI INSIGHTS
	 * all rendered by EventStack in inline mode.
	 */

	import { onDestroy } from 'svelte';
	import EventStack from '$lib/components/work/EventStack.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import { type CompletedTask, PRIORITY_COLORS, getTaskDuration, formatDuration } from '$lib/utils/completedTaskHelpers';
	import { getIssueTypeVisual } from '$lib/config/statusColors';

	let {
		task = $bindable<CompletedTask | null>(null),
		isOpen = $bindable(false),
		onCreateTasks,
	}: {
		task?: CompletedTask | null;
		isOpen?: boolean;
		onCreateTasks?: (tasks: any[]) => Promise<{ success: any[]; failed: any[] }>;
	} = $props();

	// Timeline events fetched for the task's session
	interface TimelineEvent {
		type: string;
		session_id: string;
		tmux_session: string;
		timestamp: string;
		state?: string;
		task_id?: string;
		data?: any;
		git_sha?: string;
	}

	type LoadState = 'idle' | 'loading' | 'loaded' | 'empty' | 'error';

	let events = $state<TimelineEvent[]>([]);
	let loadState = $state<LoadState>('idle');
	let lastFetchedTaskId = $state<string | null>(null);

	const typeVis = $derived(task ? getIssueTypeVisual(task.issue_type) : null);
	const pc = $derived(task ? (PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[3]) : null);
	const durationText = $derived(task ? formatDuration(getTaskDuration(task)) : '');

	// Fetch when drawer opens with a new task
	$effect(() => {
		if (isOpen && task && task.assignee && task.id !== lastFetchedTaskId) {
			fetchEvents(task);
		} else if (isOpen && task && !task.assignee) {
			loadState = 'empty';
		}
	});

	async function fetchEvents(t: CompletedTask) {
		if (!t.assignee) { loadState = 'empty'; return; }
		loadState = 'loading';
		lastFetchedTaskId = t.id;
		try {
			const res = await fetch(
				`/api/sessions/${encodeURIComponent(t.assignee)}/timeline?limit=50&type=complete,review&taskId=${encodeURIComponent(t.id)}`
			);
			if (!res.ok) { loadState = 'empty'; return; }
			const data = await res.json();
			const fetched: TimelineEvent[] = data.events || [];
			if (fetched.length === 0) {
				loadState = 'empty';
				events = [];
			} else {
				events = fetched;
				loadState = 'loaded';
			}
		} catch {
			loadState = 'error';
			events = [];
		}
	}

	function close() {
		isOpen = false;
	}

	// Reset when closed
	$effect(() => {
		if (!isOpen) {
			// Small delay before resetting so close animation plays
			setTimeout(() => {
				if (!isOpen) {
					events = [];
					loadState = 'idle';
					lastFetchedTaskId = null;
				}
			}, 300);
		}
	});
</script>

<!-- Drawer overlay -->
{#if isOpen}
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="signal-drawer-overlay"
	role="presentation"
	onclick={close}
	onkeydown={(e) => e.key === 'Escape' && close()}
></div>
{/if}

<!-- Drawer panel -->
<div class="signal-drawer" class:signal-drawer-open={isOpen}>
	<!-- Header -->
	<div class="signal-drawer-header">
		<div class="signal-drawer-agent">
			{#if task?.assignee}
				<AgentAvatar name={task.assignee} size={28} shape="rounded" />
				<span class="signal-drawer-agent-name">{task.assignee}</span>
			{:else}
				<span class="signal-drawer-agent-name text-base-content/40">No agent</span>
			{/if}
		</div>
		<div class="signal-drawer-meta">
			{#if task}
				<span class="signal-drawer-id">{task.id}</span>
				{#if pc}
					<span class="signal-drawer-priority" style="color: {pc.text}; background: {pc.bg};">
						{task.priority !== undefined && task.priority !== null ? `P${task.priority}` : '—'}
					</span>
				{/if}
				{#if durationText}
					<span class="signal-drawer-duration">{durationText}</span>
				{/if}
			{/if}
		</div>
		<button type="button" class="signal-drawer-close" onclick={close} aria-label="Close">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Title -->
	{#if task}
		<div class="signal-drawer-title">{task.title}</div>
	{/if}

	<!-- Body -->
	<div class="signal-drawer-body">
		{#if loadState === 'loading'}
			<div class="signal-drawer-loading">
				<div class="animate-spin-fast w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
				<span class="text-xs text-base-content/50">Loading completion data…</span>
			</div>
		{:else if loadState === 'loaded' && events.length > 0}
			<EventStack
				sessionName={task?.assignee ?? ''}
				initialEvents={events}
				layoutMode="inline"
				autoExpand={true}
				pollInterval={0}
				{onCreateTasks}
				class="signal-drawer-eventstack"
			/>
		{:else if loadState === 'empty'}
			<div class="signal-drawer-empty">
				<div class="signal-drawer-empty-icon">○</div>
				<p class="text-sm text-base-content/50">No completion signal found</p>
				<p class="text-xs text-base-content/30 mt-1">
					{#if task?.assignee}
						Agent {task.assignee} may not have emitted a review or complete signal.
					{:else}
						No agent was assigned to this task.
					{/if}
				</p>
			</div>
		{:else if loadState === 'error'}
			<div class="signal-drawer-empty">
				<p class="text-sm text-error/70">Failed to load completion data</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.signal-drawer-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.4);
		z-index: 49;
		animation: fade-in 0.15s ease-out;
	}

	.signal-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(520px, 100vw);
		background: oklch(0.16 0.01 250);
		border-left: 1px solid oklch(0.24 0.02 250);
		z-index: 50;
		display: flex;
		flex-direction: column;
		transform: translateX(100%);
		transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		box-shadow: -4px 0 24px oklch(0 0 0 / 0.3);
	}

	.signal-drawer-open {
		transform: translateX(0);
	}

	.signal-drawer-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
	}

	.signal-drawer-agent {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex: 1;
		min-width: 0;
	}

	.signal-drawer-agent-name {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.75 0.08 240);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.signal-drawer-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	.signal-drawer-id {
		font-size: 0.6875rem;
		font-family: monospace;
		color: oklch(0.55 0.05 250);
	}

	.signal-drawer-priority {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
	}

	.signal-drawer-duration {
		font-size: 0.6875rem;
		color: oklch(0.55 0.05 250);
	}

	.signal-drawer-close {
		flex-shrink: 0;
		padding: 0.25rem;
		border-radius: 4px;
		color: oklch(0.55 0.05 250);
		transition: color 0.1s, background 0.1s;
	}

	.signal-drawer-close:hover {
		color: oklch(0.75 0.05 250);
		background: oklch(0.22 0.02 250);
	}

	.signal-drawer-title {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(0.85 0.05 250);
		border-bottom: 1px solid oklch(0.20 0.02 250);
		line-height: 1.4;
		flex-shrink: 0;
	}

	.signal-drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: 0.75rem;
	}

	.signal-drawer-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		height: 160px;
	}

	.signal-drawer-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200px;
		text-align: center;
	}

	.signal-drawer-empty-icon {
		font-size: 2rem;
		color: oklch(0.35 0.02 250);
		margin-bottom: 0.75rem;
	}

	/* Make EventStack body feel native inside the drawer */
	:global(.signal-drawer-eventstack) {
		background: transparent !important;
	}
</style>
