<script lang="ts">
	import {
		getTaskDuration,
		formatDuration,
		getTimelinePos,
		formatTime,
		type CompletedTask,
	} from "$lib/utils/completedTaskHelpers";

	let {
		createdAt,
		endedAt,
		width = "150px",
	}: {
		createdAt: string;
		endedAt: string;
		width?: string;
	} = $props();

	const taskLike = $derived(
		({
			id: "",
			title: "",
			created_at: createdAt,
			updated_at: endedAt,
			closed_at: endedAt,
		}) as CompletedTask,
	);
	const duration = $derived(getTaskDuration(taskLike));
	const pos = $derived(getTimelinePos(taskLike));
</script>

<div
	class="duration-col"
	style="width: {width}"
	title="Duration: {formatDuration(duration)}\nStarted: {new Date(createdAt).toLocaleString()}\nEnded: {new Date(endedAt).toLocaleString()}"
>
	<span class="duration-times">
		<span class="duration-start">{formatTime(createdAt)}</span>
		<span class="duration-sep">-</span>
		<span class="duration-end">{formatTime(endedAt)}</span>
		<span class="duration-len">{formatDuration(duration)}</span>
	</span>
	<div class="duration-track">
		<div class="duration-noon"></div>
		{#if pos.crossDay}
			<div class="duration-overflow-cap"></div>
		{/if}
		<div
			class="duration-fill"
			class:duration-overflow={pos.crossDay}
			style="left: {pos.left}%; width: {pos.width}%"
		></div>
	</div>
</div>

<style>
	.duration-col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 3px;
		flex-shrink: 0;
	}

	.duration-times {
		font-size: 0.7rem;
		color: oklch(from var(--color-base-content) l c h / 55%);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}

	.duration-start {
		color: oklch(from var(--color-base-content) l c h / 40%);
	}

	.duration-sep {
		color: oklch(from var(--color-base-content) l c h / 30%);
	}

	.duration-end {
		color: oklch(from var(--color-base-content) l c h / 60%);
	}

	.duration-len {
		color: oklch(from var(--color-base-content) l c h / 40%);
		font-family: ui-monospace, monospace;
		font-size: 0.6rem;
	}

	.duration-track {
		position: relative;
		width: 100%;
		height: 3px;
		background: oklch(from var(--color-base-content) l c h / 6%);
		border-radius: 1.5px;
	}

	.duration-noon {
		position: absolute;
		left: 50%;
		top: 0;
		width: 1px;
		height: 100%;
		background: oklch(from var(--color-base-content) l c h / 10%);
	}

	.duration-fill {
		position: absolute;
		top: 0;
		height: 100%;
		border-radius: 1.5px;
		background: linear-gradient(
			90deg,
			oklch(from var(--color-info) l c h / 50%),
			oklch(from var(--color-info) l c h / 75%)
		);
	}

	.duration-fill.duration-overflow {
		background: linear-gradient(
			90deg,
			oklch(from var(--color-warning) l c h / 70%),
			oklch(from var(--color-info) l c h / 55%)
		);
	}

	.duration-overflow-cap {
		position: absolute;
		left: 0;
		top: -1px;
		width: 2px;
		height: calc(100% + 2px);
		background: oklch(from var(--color-warning) l c h / 85%);
		border-radius: 1px;
	}
</style>
