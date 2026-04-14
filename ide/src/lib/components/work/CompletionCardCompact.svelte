<script lang="ts">
	/**
	 * CompletionCardCompact
	 *
	 * Compact inline completion card for TasksActive rows.
	 * Shows the most recent `complete` event only.
	 *
	 * Default (always visible):  task title badge + CHANGES MADE bullets
	 * Hover (expanded):          + SUGGESTED FOLLOW-UP, CROSS-AGENT INTEL, FILES MODIFIED
	 */

	interface CompletionEvent {
		type: string;
		state?: string;
		task_id?: string;
		data?: any;
	}

	let {
		events = [] as CompletionEvent[],
	}: {
		events: CompletionEvent[];
	} = $props();

	// Pick most recent `complete` event only
	const event = $derived(events.find(e => e.type === 'complete') ?? null);
	const bundle = $derived(event?.data ?? null);

	const summary = $derived.by<string[]>(() => {
		if (!bundle?.summary) return [];
		if (Array.isArray(bundle.summary)) return bundle.summary as string[];
		if (typeof bundle.summary === 'string') return [bundle.summary];
		return [];
	});

	const filesModified = $derived.by<any[]>(() => {
		if (!bundle?.filesModified) return [];
		return Array.isArray(bundle.filesModified) ? bundle.filesModified : [];
	});

	const suggestedTasks = $derived.by<any[]>(() => {
		if (!bundle?.suggestedTasks) return [];
		return Array.isArray(bundle.suggestedTasks) ? bundle.suggestedTasks : [];
	});

	const crossAgentIntel = $derived(() => bundle?.crossAgentIntel ?? null);

	const hasExpandContent = $derived(
		suggestedTasks.length > 0 ||
		filesModified.length > 0 ||
		!!crossAgentIntel()
	);

	let hovered = $state(false);
</script>

{#if bundle}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ccc-root"
		onmouseenter={() => hovered = true}
		onmouseleave={() => hovered = false}
	>
		<!-- Always visible: header badge + CHANGES MADE -->
		<div class="ccc-header">
			<span class="ccc-badge">✓ COMPLETED</span>
			{#if bundle.taskTitle || bundle.taskId}
				<span class="ccc-task-title">{bundle.taskTitle || bundle.taskId}</span>
			{/if}
		</div>

		{#if summary.length > 0}
			<ul class="ccc-summary">
				{#each summary as item}
					<li class="ccc-summary-item">
						<span class="ccc-bullet">•</span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Expandable section — slides in on hover -->
		{#if hasExpandContent}
			<div class="ccc-expand-wrapper" class:ccc-expanded={hovered}>
				<div class="ccc-expand-inner">
					<!-- Suggested follow-up -->
					{#if suggestedTasks.length > 0}
						<div class="ccc-section">
							<div class="ccc-section-label ccc-section-label-info">📋 SUGGESTED FOLLOW-UP ({suggestedTasks.length})</div>
							<div class="ccc-tasks">
								{#each suggestedTasks.slice(0, 5) as task}
									<div class="ccc-task-chip">
										{#if task.priority != null}
											<span class="ccc-task-p">P{task.priority}</span>
										{/if}
										<span class="ccc-task-title-text">{task.title}</span>
									</div>
								{/each}
								{#if suggestedTasks.length > 5}
									<span class="ccc-more">+{suggestedTasks.length - 5} more</span>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Files modified -->
					{#if filesModified.length > 0}
						<div class="ccc-section">
							<div class="ccc-section-label">FILES MODIFIED ({filesModified.length})</div>
							<div class="ccc-files">
								{#each filesModified.slice(0, 6) as f}
									<span class="ccc-file">{typeof f === 'string' ? f.split('/').pop() : (f.path ?? '').split('/').pop()}</span>
								{/each}
								{#if filesModified.length > 6}
									<span class="ccc-more">+{filesModified.length - 6}</span>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Cross-agent intel -->
					{#if crossAgentIntel()}
						{@const intel = crossAgentIntel()}
						<div class="ccc-section">
							<div class="ccc-section-label">🔗 CROSS-AGENT INTEL</div>
							{#if intel.patterns?.length > 0}
								<ul class="ccc-intel">
									{#each intel.patterns.slice(0, 3) as p}
										<li>• {p}</li>
									{/each}
								</ul>
							{/if}
							{#if intel.gotchas?.length > 0}
								<ul class="ccc-intel ccc-intel-warn">
									{#each intel.gotchas.slice(0, 2) as g}
										<li>⚠️ {g}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.ccc-root {
		padding: 0.35rem 0;
	}

	.ccc-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.3rem;
	}

	.ccc-badge {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: oklch(0.75 0.18 145);
		background: oklch(0.55 0.18 145 / 0.15);
		border: 1px solid oklch(0.55 0.18 145 / 0.3);
		border-radius: 3px;
		padding: 0.1rem 0.35rem;
		flex-shrink: 0;
	}

	.ccc-task-title {
		font-size: 0.7rem;
		color: oklch(0.65 0.04 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.ccc-summary {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.ccc-summary-item {
		display: flex;
		gap: 0.35rem;
		font-size: 0.7rem;
		line-height: 1.4;
		color: oklch(0.72 0.03 250);
	}

	.ccc-bullet {
		color: oklch(0.65 0.18 145);
		flex-shrink: 0;
		margin-top: 0.05rem;
	}

	/* Expand wrapper — grid trick for smooth height animation */
	.ccc-expand-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 200ms ease-out;
		overflow: hidden;
	}

	@media (hover: hover) and (min-width: 640px) {
		.ccc-expanded {
			grid-template-rows: 1fr;
		}
	}

	.ccc-expand-inner {
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0.4rem;
	}

	.ccc-section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.ccc-section-label {
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.04 250);
	}

	.ccc-section-label-info {
		color: oklch(0.65 0.12 220);
	}

	.ccc-tasks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.ccc-task-chip {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.15rem 0.4rem;
		background: oklch(0.60 0.12 220 / 0.12);
		border: 1px solid oklch(0.60 0.12 220 / 0.25);
		border-radius: 3px;
		font-size: 0.6rem;
		max-width: 200px;
	}

	.ccc-task-p {
		color: oklch(0.65 0.12 220);
		font-weight: 600;
		flex-shrink: 0;
	}

	.ccc-task-title-text {
		color: oklch(0.72 0.04 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ccc-files {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
	}

	.ccc-file {
		font-family: ui-monospace, 'Cascadia Code', monospace;
		font-size: 0.6rem;
		padding: 0.1rem 0.3rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 3px;
		color: oklch(0.62 0.04 250);
	}

	.ccc-more {
		font-size: 0.6rem;
		color: oklch(0.50 0.03 250);
		align-self: center;
	}

	.ccc-intel {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.65rem;
		color: oklch(0.65 0.04 250);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.ccc-intel-warn {
		color: oklch(0.72 0.12 85);
	}
</style>
