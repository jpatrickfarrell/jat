<script lang="ts">
	import { openTaskDetailDrawer } from "$lib/stores/drawerStore";

	let {
		epicId,
		title = "Untitled Epic",
		progress = { closed: 0, total: 0 },
		countLabel = "",
		agents = [] as Array<{ name: string }>,
		AgentBadge = null as any,
	}: {
		epicId: string;
		title?: string;
		progress?: { closed: number; total: number };
		countLabel?: string;
		agents?: Array<{ name: string }>;
		AgentBadge?: any;
	} = $props();
</script>

<span class="epic-id">
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<span
		class="epic-id-link"
		onclick={(e) => { e.stopPropagation(); openTaskDetailDrawer(epicId); }}
		title={epicId}
	>{epicId}</span>
</span>
<span class="epic-dot">·</span>
<span class="epic-title epic-title-clickable"
	role="button"
	tabindex="-1"
	onclick={(e) => { e.stopPropagation(); openTaskDetailDrawer(epicId); }}
	onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openTaskDetailDrawer(epicId); } }}
	title="Click to edit epic"
>{title}</span>

{#if agents.length > 0 && AgentBadge}
	<div class="epic-agents">
		{#each agents as agent}
			<AgentBadge
				name={agent.name}
				size={18}
				variant="avatar"
				isWorking={true}
			/>
		{/each}
	</div>
{/if}

{#if progress.total > 0}
	<div class="epic-progress" title="{progress.closed}/{progress.total} complete">
		<div class="epic-progress-bar">
			<div class="epic-progress-fill" style="width: {(progress.closed / progress.total) * 100}%"></div>
		</div>
		<span class="epic-progress-text">{progress.closed}/{progress.total}</span>
	</div>
{/if}

{#if countLabel}
	<span class="epic-count">{countLabel}</span>
{/if}

<style>
	.epic-id {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
		color: oklch(0.6 0.18 300);
	}

	.epic-id-link {
		cursor: pointer;
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		transition: background-color 0.15s;
	}

	.epic-id-link:hover {
		background: oklch(0.6 0.18 300 / 0.15);
	}

	.epic-dot {
		color: oklch(0.45 0.02 250);
		font-size: 0.75rem;
		flex-shrink: 0;
	}

	.epic-title {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.75 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.epic-title-clickable {
		cursor: pointer;
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		transition: background-color 0.15s, color 0.15s;
	}

	.epic-title-clickable:hover {
		background: oklch(0.85 0.02 250 / 0.12);
		color: oklch(0.92 0.04 250);
	}

	.epic-agents {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.epic-progress {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	.epic-progress-bar {
		width: 3rem;
		height: 0.3125rem;
		border-radius: 9999px;
		background: oklch(0.25 0.02 250);
		overflow: hidden;
	}

	.epic-progress-fill {
		height: 100%;
		border-radius: 9999px;
		background: oklch(0.65 0.18 145);
		transition: width 0.3s ease;
	}

	.epic-progress-text {
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.6 0.02 250);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.epic-count {
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(0.55 0.02 250);
		white-space: nowrap;
		flex-shrink: 0;
	}
</style>
