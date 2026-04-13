<script lang="ts">
	/**
	 * MobileTaskBody — shared title + metadata row for mobile session surfaces.
	 *
	 * Used by TasksActive swipe cards AND MobileSessionDrawer so they render the
	 * task title, elapsed time, agent name, copyable task ID, type icon, priority,
	 * and state label identically. Extra surface-specific metadata (harness,
	 * browser port, destruct countdown) can be injected via the `extra` snippet
	 * so each surface retains its unique affordances without fork-drift.
	 */
	import type { Snippet } from 'svelte';
	import type { FormattedElapsed } from '$lib/utils/elapsedTime';

	interface TaskShape {
		id: string;
		title?: string;
		description?: string;
		issue_type?: string;
		priority?: number | null;
	}
	interface StateVisual {
		accent: string;
		shortLabel: string;
	}
	interface TypeVisual {
		icon: string;
		label: string;
	}

	let {
		task,
		agentName,
		stateVisual,
		typeVisual,
		elapsed,
		copiedTaskId,
		onCopyTaskId,
		showDescription = true,
		titleSnippet,
		extra
	}: {
		task: TaskShape;
		agentName?: string;
		stateVisual: StateVisual;
		typeVisual?: TypeVisual;
		elapsed: FormattedElapsed | null;
		copiedTaskId?: string | null;
		onCopyTaskId?: (e: MouseEvent, id: string) => void;
		showDescription?: boolean;
		titleSnippet?: Snippet;
		extra?: Snippet;
	} = $props();

	const priorityClass = $derived(
		task.priority === 0 ? 'mobile-priority-0'
		: task.priority === 1 ? 'mobile-priority-1'
		: 'mobile-priority-2'
	);
</script>

<div class="mobile-card-body">
	<div class="mobile-title-row">
		<span class="mobile-title" title={task.title}>
			{#if titleSnippet}{@render titleSnippet()}{:else}{task.title || task.id}{/if}
		</span>
		{#if elapsed}
			<span class="mobile-title-elapsed">{#if elapsed.showHours}{elapsed.hours}:{/if}{elapsed.minutes}:{elapsed.seconds}</span>
		{/if}
	</div>
	{#if showDescription && task.description}
		<span class="mobile-description" title={task.description}>{task.description}</span>
	{/if}
	<div class="mobile-card-row2">
		{#if agentName}
			<span class="mobile-agent-name" style="color: {stateVisual.accent};" title={agentName}>{agentName}</span>
			<span class="mobile-separator">·</span>
		{/if}
		<button
			class="mobile-task-id"
			class:mobile-task-id-copied={copiedTaskId === task.id}
			style="color: {stateVisual.accent};"
			onclick={(e) => onCopyTaskId?.(e, task.id)}
			title="Click to copy task ID"
			aria-label={copiedTaskId === task.id ? `Copied ${task.id}` : `Copy ${task.id}`}
		>
			<span class="mobile-task-id-text">{task.id}</span>
			{#if copiedTaskId === task.id}<span class="mobile-task-id-badge" aria-hidden="true">✓</span>{/if}
		</button>
		{#if typeVisual && task.issue_type}
			<span class="mobile-separator">·</span>
			<span class="mobile-type-icon" title={typeVisual.label}>{typeVisual.icon}</span>
		{/if}
		{#if task.priority != null && task.priority <= 2}
			<span class="mobile-separator">·</span>
			<span class="mobile-priority {priorityClass}" title={`P${task.priority}`}>P{task.priority}</span>
		{/if}
		{#if extra}{@render extra()}{/if}
		<span class="mobile-state-badge" style="color: {stateVisual.accent};">{stateVisual.shortLabel}</span>
	</div>
</div>

<style>
	.mobile-card-body {
		flex: 1;
		min-width: 0;
		padding: 0.75rem 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.mobile-title-row {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		min-width: 0;
	}
	.mobile-title {
		flex: 1;
		min-width: 0;
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.88 0.02 250);
		font-family: system-ui, -apple-system, sans-serif;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.mobile-title-elapsed {
		flex-shrink: 0;
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.55 0.02 250);
		font-variant-numeric: tabular-nums;
		font-family: ui-monospace, monospace;
		align-self: flex-start;
		padding-top: 0.2em;
		margin-left: auto;
	}
	.mobile-description {
		min-width: 0;
		font-size: 0.75rem;
		color: oklch(0.72 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.45;
	}
	.mobile-card-row2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.125rem;
		font-size: 0.75rem;
		font-family: system-ui, -apple-system, sans-serif;
		color: oklch(0.70 0.02 250);
		overflow: hidden;
		flex-wrap: nowrap;
	}
	.mobile-agent-name {
		font-weight: 600;
		letter-spacing: 0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 9rem;
	}
	.mobile-separator {
		color: oklch(0.35 0.01 250);
		font-size: 0.625rem;
	}
	.mobile-task-id {
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: ui-monospace, monospace;
		font-size: 0.6875rem;
		text-decoration: underline;
		text-decoration-color: oklch(0.40 0.01 250 / 0.4);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.15s;
	}
	.mobile-task-id-copied {
		text-decoration-color: oklch(0.70 0.18 145 / 0.6);
	}
	.mobile-task-id-badge {
		margin-left: 0.25rem;
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 0.625rem;
		font-weight: 700;
		color: oklch(0.82 0.18 145);
	}
	.mobile-type-icon {
		font-size: 0.625rem;
		line-height: 1;
	}
	.mobile-priority {
		font-weight: 700;
		font-size: 0.6875rem;
		padding: 0.0625rem 0.375rem;
		border-radius: 3px;
		letter-spacing: 0.02em;
		line-height: 1.25;
	}
	.mobile-priority-0 {
		color: oklch(0.88 0.18 25);
		background: oklch(0.55 0.20 25 / 0.22);
		border: 1px solid oklch(0.70 0.20 25 / 0.35);
	}
	.mobile-priority-1 {
		color: oklch(0.88 0.15 85);
		background: oklch(0.55 0.18 85 / 0.20);
		border: 1px solid oklch(0.70 0.18 85 / 0.32);
	}
	.mobile-priority-2 {
		color: oklch(0.82 0.12 200);
		background: oklch(0.55 0.14 200 / 0.18);
		border: 1px solid oklch(0.70 0.14 200 / 0.30);
	}
	.mobile-state-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.5625rem;
		font-weight: 600;
		line-height: 1;
		margin-left: auto;
		flex-shrink: 0;
		white-space: nowrap;
	}
</style>
