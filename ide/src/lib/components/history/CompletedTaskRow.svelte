<script lang="ts">
	import AgentAvatar from "$lib/components/AgentAvatar.svelte";
	import { getProjectColor } from "$lib/utils/projectColors";
	import { getIssueTypeVisual } from "$lib/config/statusColors";
	import { getIntegrationIcon } from "$lib/config/integrationIcons";
	import {
		type CompletedTask,
		PRIORITY_COLORS,
	} from "$lib/utils/completedTaskHelpers";
	import DurationTrack from "./DurationTrack.svelte";

	let {
		task,
		onTaskClick,
		onResumeSession,
		onMemoryClick,
		onReopenTask,
		onDuplicateTask,
		resuming = false,
		memoryFilename,
		integration = null,
	}: {
		task: CompletedTask;
		onTaskClick: (id: string) => void;
		onResumeSession?: (event: MouseEvent, task: CompletedTask) => void;
		onMemoryClick?: (event: MouseEvent, filename: string, task: CompletedTask) => void;
		onReopenTask?: (event: MouseEvent, task: CompletedTask) => void;
		onDuplicateTask?: (event: MouseEvent, task: CompletedTask) => void;
		resuming?: boolean;
		memoryFilename?: string;
		integration?: { sourceId: string; sourceType: string; sourceName: string } | null;
	} = $props();

	const color = $derived(getProjectColor(task.project || task.id.split('-')[0]));
	const typeVis = $derived(getIssueTypeVisual(task.issue_type));
	const pc = $derived(PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[3]);
	const resolvedIntegration = $derived(integration ?? task.integration ?? null);
	const integrationIcon = $derived(resolvedIntegration ? getIntegrationIcon(resolvedIntegration.sourceType) : null);
</script>

<button
	class="task-item group"
	onclick={() => onTaskClick(task.id)}
>
	<DurationTrack
		createdAt={task.created_at}
		endedAt={task.closed_at || task.updated_at}
	/>
	<div class="task-badge" style="--pc: {color}">
		<span class="task-badge-avatar" title={task.assignee || 'Unassigned'}>
			{#if task.assignee}
				<AgentAvatar name={task.assignee} size={28} />
			{:else}
				<span class="task-badge-initials">??</span>
			{/if}
		</span>
		<div class="task-badge-info">
			<span class="task-badge-id">{task.id}</span>
			<span class="task-badge-tags mt-0.5">
				{#if task.issue_type}
					<span class="task-badge-type">{typeVis.icon}</span>
				{/if}
				{#if task.priority != null}
					<span class="task-badge-priority ml-0.5" style="background: {pc.bg}; color: {pc.text}; border: 1px solid {pc.border};">P{task.priority}</span>
				{/if}
				{#if integrationIcon && resolvedIntegration}
					<span class="task-badge-integration" title="{resolvedIntegration.sourceName} ({resolvedIntegration.sourceType})">
						<svg class="w-3.5 h-3.5" viewBox={integrationIcon.viewBox} fill={integrationIcon.fill ? 'currentColor' : 'none'} stroke={integrationIcon.fill ? 'none' : 'currentColor'} stroke-width="1.5" style="color: {integrationIcon.color};">
							<path d={integrationIcon.svg} />
						</svg>
					</span>
				{/if}
			</span>
		</div>
	</div>
	<div class="task-info">
		<span class="task-title">{task.title}</span>
		{#if task.assignee}
			<span class="task-meta">
				<span class="task-agent">by {task.assignee}</span>
			</span>
		{/if}
	</div>
	<div class="task-actions">
		{#if memoryFilename && onMemoryClick}
			<button
				type="button"
				class="memory-btn"
				onclick={(e) => onMemoryClick!(e, memoryFilename!, task)}
				title="View session memory"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-3.5 h-3.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
					/>
				</svg>
			</button>
		{/if}
		{#if onReopenTask}
			<button
				type="button"
				class="reopen-btn"
				onclick={(e) => onReopenTask!(e, task)}
				title="Reopen task"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-3.5 h-3.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
					/>
				</svg>
			</button>
		{/if}
		{#if onDuplicateTask}
			<button
				type="button"
				class="duplicate-btn"
				onclick={(e) => onDuplicateTask!(e, task)}
				title="Duplicate task"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-3.5 h-3.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
					/>
				</svg>
			</button>
		{/if}
		{#if task.assignee && onResumeSession}
			<button
				type="button"
				class="resume-btn"
				onclick={(e) => onResumeSession!(e, task)}
				title="Resume session with {task.assignee}"
				disabled={resuming}
			>
				{#if resuming}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-4 h-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
						/>
					</svg>
				{/if}
			</button>
		{/if}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="task-arrow"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.25 4.5l7.5 7.5-7.5 7.5"
			/>
		</svg>
	</div>
</button>

<style>
	.task-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		background: transparent;
		border: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.15s ease;
		border-bottom: 1px solid oklch(from var(--color-base-300) l c h / 60%);
	}

	.task-item:last-child {
		border-bottom: none;
	}

	.task-item:hover {
		background: var(--color-base-200);
	}

	.task-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 170px;
		flex-shrink: 0;
		overflow: hidden;
	}

	.task-badge-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: color-mix(in oklch, var(--pc) 15%, var(--color-base-200));
		border: 1.5px solid color-mix(in oklch, var(--pc) 35%, transparent);
		flex-shrink: 0;
	}

	.task-badge-initials {
		font-size: 0.55rem;
		font-weight: 700;
		font-family: ui-monospace, monospace;
		text-transform: uppercase;
		color: var(--pc);
	}

	.task-badge-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.task-badge-id {
		font-size: 0.75rem;
		font-family: ui-monospace, monospace;
		font-weight: 600;
		line-height: 1;
		color: var(--pc);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.task-badge-tags {
		display: flex;
		align-items: center;
		gap: 3px;
	}

	.task-badge-type {
		font-size: 0.75rem;
		line-height: 1;
	}

	.task-badge-priority {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 0 4px;
		border-radius: 3px;
		line-height: 1.5;
	}

	.task-badge-integration {
		display: flex;
		align-items: center;
		margin-left: 2px;
		opacity: 0.85;
	}

	.task-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.task-title {
		font-size: 0.85rem;
		color: var(--color-base-content);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.task-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.7rem;
		color: oklch(from var(--color-base-content) l c h / 55%);
	}

	.task-agent {
		color: var(--color-success);
	}

	.task-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.task-arrow {
		width: 16px;
		height: 16px;
		color: oklch(from var(--color-base-content) l c h / 45%);
		flex-shrink: 0;
		transition:
			color 0.15s ease,
			transform 0.15s ease;
	}

	.task-item:hover .task-arrow {
		color: oklch(from var(--color-base-content) l c h / 65%);
		transform: translateX(2px);
	}

	.resume-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: oklch(from var(--color-success) l c h / 15%);
		border: 1px solid oklch(from var(--color-success) l c h / 30%);
		color: var(--color-success);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
		flex-shrink: 0;
	}

	.task-item:hover .resume-btn {
		opacity: 1;
	}

	.resume-btn:hover:not(:disabled) {
		background: oklch(from var(--color-success) l c h / 25%);
		border-color: oklch(from var(--color-success) l c h / 50%);
		transform: scale(1.05);
	}

	.resume-btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.task-item:hover .resume-btn:disabled {
		opacity: 0.6;
	}

	.memory-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: oklch(from var(--color-info) l c h / 12%);
		border: 1px solid oklch(from var(--color-info) l c h / 25%);
		color: oklch(from var(--color-info) l c h / 70%);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
		flex-shrink: 0;
	}

	.task-item:hover .memory-btn {
		opacity: 1;
	}

	.memory-btn:hover {
		background: oklch(from var(--color-info) l c h / 22%);
		border-color: oklch(from var(--color-info) l c h / 45%);
		color: oklch(from var(--color-info) l c h / 90%);
		transform: scale(1.05);
	}

	.reopen-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: oklch(from var(--color-warning) l c h / 12%);
		border: 1px solid oklch(from var(--color-warning) l c h / 25%);
		color: oklch(from var(--color-warning) l c h / 70%);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
		flex-shrink: 0;
	}

	.task-item:hover .reopen-btn {
		opacity: 1;
	}

	.reopen-btn:hover {
		background: oklch(from var(--color-warning) l c h / 22%);
		border-color: oklch(from var(--color-warning) l c h / 45%);
		color: oklch(from var(--color-warning) l c h / 90%);
		transform: scale(1.05);
	}

	.duplicate-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: oklch(from var(--color-secondary) l c h / 12%);
		border: 1px solid oklch(from var(--color-secondary) l c h / 25%);
		color: oklch(from var(--color-secondary) l c h / 70%);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
		flex-shrink: 0;
	}

	.task-item:hover .duplicate-btn {
		opacity: 1;
	}

	.duplicate-btn:hover {
		background: oklch(from var(--color-secondary) l c h / 22%);
		border-color: oklch(from var(--color-secondary) l c h / 45%);
		color: oklch(from var(--color-secondary) l c h / 90%);
		transform: scale(1.05);
	}
</style>
