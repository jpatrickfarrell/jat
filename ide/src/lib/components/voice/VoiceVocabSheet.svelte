<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { page } from '$app/stores';
	import { voiceVocabSheet } from '$lib/stores/voiceVocabSheet.svelte';
	import { getVocabularyForRoute } from '$lib/stores/voiceVocabulary.svelte';
	import { PARAMETERIZED_VERBS } from '$lib/voice/parameterizedVerbs';

	const pathname = $derived($page.url.pathname);

	const allEntries = $derived(getVocabularyForRoute(pathname));
	const routeEntries = $derived(allEntries.filter(e => e.category === 'route'));
	const navEntries = $derived(allEntries.filter(e => e.category === 'navigation'));
	const globalEntries = $derived(allEntries.filter(e => e.category === 'global'));
	const sessionEntries = $derived(allEntries.filter(e => e.category === 'session'));

	const ROUTE_LABELS: Record<string, string> = {
		'/triage': 'Triage',
		'/kanban': 'Kanban',
		'/tasks': 'Tasks',
		'/files': 'Files',
		'/source': 'Source',
		'/data': 'Data',
		'/workflows': 'Workflows',
		'/automation': 'Automation',
		'/servers': 'Servers',
		'/memory': 'Memory',
		'/chores': 'Chores',
		'/integrations': 'Integrations',
	};
	const routeLabel = $derived(ROUTE_LABELS[pathname] || '');
</script>

{#if voiceVocabSheet.open}
	<!-- Transparent backdrop to dismiss on outside click -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[9997]"
		onclick={() => voiceVocabSheet.hide()}
	></div>

	<div
		class="vvs-panel fixed right-4 z-[9998]"
		role="dialog"
		aria-label="Voice commands"
		aria-modal="true"
		style="bottom: calc(1rem + 2.75rem + 0.5rem);"
		transition:fly={{ y: 24, duration: 220, easing: cubicOut }}
	>
		<!-- Header -->
		<div class="vvs-header">
			<span class="vvs-icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="9" y="2" width="6" height="12" rx="3" />
					<path d="M5 10v2a7 7 0 0 0 14 0v-2" />
					<line x1="12" y1="19" x2="12" y2="22" />
				</svg>
			</span>
			<span class="vvs-title">Voice Commands</span>
			{#if routeLabel}
				<span class="vvs-route-badge">{routeLabel}</span>
			{/if}
			<button class="vvs-close" onclick={() => voiceVocabSheet.hide()} aria-label="Close">✕</button>
		</div>

		<div class="vvs-body">
			<!-- Natural-language verbs (LLM-dispatched, parameterized) -->
			<div class="vvs-section">
				<div class="vvs-section-label">
					<span>Natural language</span>
					<span class="vvs-section-hint">spoken — parameters extracted</span>
				</div>
				{#each PARAMETERIZED_VERBS as verb}
					<div class="vvs-nl-row">
						<div class="vvs-nl-head">
							<span class="vvs-nl-label">{verb.label}</span>
							{#if verb.destructive}
								<span class="vvs-nl-badge vvs-nl-badge-danger" title="Confirms before running">destructive</span>
							{/if}
						</div>
						<div class="vvs-nl-desc">{verb.description}</div>
						<div class="vvs-nl-examples">
							{#each verb.examples as ex}
								<span class="vvs-nl-example">"{ex}"</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<div class="vvs-divider"></div>

			<!-- Route-specific section -->
			{#if routeEntries.length > 0}
				<div class="vvs-section">
					<div class="vvs-section-label">This page</div>
					{#each routeEntries as entry}
						<div class="vvs-row">
							<span class="vvs-phrase">"{entry.phrase}"</span>
							<kbd class="vvs-kbd">{entry.shortcut}</kbd>
						</div>
					{/each}
				</div>
				<div class="vvs-divider"></div>
			{/if}

			<!-- Navigation section -->
			<div class="vvs-section">
				<div class="vvs-section-label">Navigation</div>
				{#each navEntries as entry}
					<div class="vvs-row">
						<span class="vvs-phrase">"{entry.phrase}"</span>
						<kbd class="vvs-kbd">{entry.shortcut}</kbd>
					</div>
				{/each}
			</div>

			<!-- Global section -->
			{#if globalEntries.length > 0}
				<div class="vvs-divider"></div>
				<div class="vvs-section">
					<div class="vvs-section-label">Global</div>
					{#each globalEntries as entry}
						<div class="vvs-row">
							<span class="vvs-phrase">"{entry.phrase}"</span>
							<kbd class="vvs-kbd">{entry.shortcut}</kbd>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Session section -->
			{#if sessionEntries.length > 0}
				<div class="vvs-divider"></div>
				<div class="vvs-section">
					<div class="vvs-section-label">Session</div>
					{#each sessionEntries as entry}
						<div class="vvs-row">
							<span class="vvs-phrase">"{entry.phrase}"</span>
							<kbd class="vvs-kbd">{entry.shortcut}</kbd>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.vvs-panel {
		width: min(420px, calc(100vw - 2rem));
		max-height: min(70vh, 560px);
		display: flex;
		flex-direction: column;
		background: oklch(0.16 0.025 250 / 0.98);
		border: 1px solid oklch(0.35 0.05 250 / 0.6);
		border-radius: 1rem;
		box-shadow:
			0 12px 40px oklch(0 0 0 / 0.5),
			0 0 0 1px oklch(0.4 0.1 240 / 0.15);
		backdrop-filter: blur(16px);
		overflow: hidden;
	}

	.vvs-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border-bottom: 1px solid oklch(0.28 0.04 250 / 0.5);
		flex-shrink: 0;
	}

	.vvs-icon {
		display: inline-flex;
		color: oklch(0.78 0.12 200);
		flex-shrink: 0;
	}

	.vvs-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.88 0.04 250);
		flex-shrink: 0;
	}

	.vvs-route-badge {
		font-size: 0.6875rem;
		color: oklch(0.72 0.1 200);
		background: oklch(0.25 0.05 200 / 0.4);
		border: 1px solid oklch(0.35 0.08 200 / 0.4);
		border-radius: 9999px;
		padding: 0.05rem 0.45rem;
		flex-shrink: 0;
	}

	.vvs-close {
		margin-left: auto;
		background: none;
		border: none;
		cursor: pointer;
		color: oklch(0.52 0.04 250);
		font-size: 0.75rem;
		line-height: 1;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: color 0.15s;
		flex-shrink: 0;
	}

	.vvs-close:hover {
		color: oklch(0.78 0.04 250);
	}

	.vvs-body {
		overflow-y: auto;
		flex: 1;
		padding: 0.375rem 0;
		-webkit-overflow-scrolling: touch;
	}

	.vvs-section {
		padding: 0.125rem 0;
	}

	.vvs-section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.50 0.06 250);
		text-transform: uppercase;
		letter-spacing: 0.07em;
		padding: 0.25rem 0.875rem 0.125rem;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.vvs-section-hint {
		font-size: 0.625rem;
		font-weight: 400;
		color: oklch(0.45 0.04 250);
		text-transform: none;
		letter-spacing: 0;
	}

	.vvs-nl-row {
		padding: 0.4rem 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.vvs-nl-row:hover {
		background: oklch(0.24 0.03 250 / 0.5);
	}

	.vvs-nl-head {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.vvs-nl-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.86 0.05 250);
	}

	.vvs-nl-badge {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.05rem 0.4rem;
		border-radius: 9999px;
		border: 1px solid;
		font-weight: 600;
	}

	.vvs-nl-badge-danger {
		color: oklch(0.78 0.15 25);
		background: oklch(0.30 0.10 25 / 0.35);
		border-color: oklch(0.45 0.12 25 / 0.5);
	}

	.vvs-nl-desc {
		font-size: 0.75rem;
		color: oklch(0.65 0.04 250);
		line-height: 1.35;
	}

	.vvs-nl-examples {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: 0.05rem;
	}

	.vvs-nl-example {
		font-size: 0.7rem;
		color: oklch(0.78 0.08 200);
		background: oklch(0.22 0.04 230 / 0.5);
		border: 1px solid oklch(0.32 0.06 230 / 0.4);
		border-radius: 0.3rem;
		padding: 0.075rem 0.4rem;
		font-family: ui-monospace, monospace;
	}

	.vvs-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.275rem 0.875rem;
		transition: background 0.1s;
	}

	.vvs-row:hover {
		background: oklch(0.24 0.03 250 / 0.5);
	}

	.vvs-phrase {
		flex: 1;
		font-size: 0.8125rem;
		color: oklch(0.80 0.04 250);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.vvs-kbd {
		font-size: 0.6875rem;
		font-family: ui-monospace, monospace;
		background: oklch(0.24 0.04 250);
		border: 1px solid oklch(0.38 0.06 250);
		border-bottom-width: 2px;
		color: oklch(0.75 0.1 200);
		border-radius: 0.25rem;
		padding: 0.075rem 0.35rem;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.vvs-divider {
		height: 1px;
		background: oklch(0.26 0.03 250 / 0.5);
		margin: 0.3rem 0.875rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.vvs-panel {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
