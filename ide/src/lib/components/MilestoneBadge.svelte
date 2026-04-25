<script lang="ts">
	/**
	 * MilestoneBadge — purple M{n} chip rendered alongside the priority badge
	 * in any task status row. Auto-loads milestone data per project, so the
	 * caller only passes a taskId.
	 *
	 * Used by TaskIdBadge (status-icon row), TasksOpen (open-task meta row),
	 * and MobileTaskBody (TasksActive + MobileSessionDrawer header). Single
	 * source of truth for color, sizing variants, and "paid/closed = faded"
	 * styling — keep visual changes here.
	 */
	import { ensureProjectLoaded, getTaskMilestone } from '$lib/stores/milestones.svelte';

	let {
		taskId,
		variant = 'inline',
		separator = false,
	}: {
		taskId: string;
		/**
		 * 'inline'  — sized for meta rows (P{n} priority pill style)
		 * 'compact' — sized for the dense TaskIdBadge agentPill icon row
		 */
		variant?: 'inline' | 'compact';
		/**
		 * If true and a milestone is present, render a leading "·" separator
		 * sized to match the surrounding meta row. Lets callers avoid empty
		 * separators when no milestone exists.
		 */
		separator?: boolean;
	} = $props();

	const projectPrefix = $derived(taskId.split('-')[0] || taskId);
	$effect(() => { void ensureProjectLoaded(projectPrefix); });
	const milestone = $derived(getTaskMilestone(taskId));
	const done = $derived(
		milestone?.status === 'paid' || milestone?.status === 'closed',
	);
</script>

{#if milestone}
	{#if separator}<span class="milestone-separator">·</span>{/if}
	<span
		class="milestone-badge milestone-{variant}"
		class:milestone-done={done}
		title="Milestone: {milestone.name}{milestone.status ? ` (${milestone.status})` : ''}"
		aria-label="Milestone {milestone.name}"
	>M{milestone.sortOrder}</span>
{/if}

<style>
	.milestone-badge {
		color: oklch(0.92 0.10 310);
		background: oklch(0.65 0.18 310 / 0.20);
		border: 1px solid oklch(0.65 0.18 310 / 0.45);
		font-weight: 700;
		border-radius: 0.25rem;
		white-space: nowrap;
		display: inline-block;
		line-height: 1.25;
		letter-spacing: 0.02em;
	}
	.milestone-inline {
		font-size: 0.6875rem;
		padding: 0.0625rem 0.375rem;
	}
	.milestone-compact {
		font-size: 0.5625rem;
		padding: 0 0.25rem;
		font-weight: 600;
	}
	.milestone-done {
		opacity: 0.55;
	}
	.milestone-separator {
		color: oklch(0.35 0.01 250);
		font-size: 0.625rem;
	}
</style>
