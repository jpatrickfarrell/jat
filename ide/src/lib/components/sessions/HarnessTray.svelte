<script lang="ts">
	/**
	 * HarnessTray — hover slide-out harness picker for open task mobile cards.
	 *
	 * Renders a row of ProviderLogo circles (one per available agent program).
	 * Hidden by default (max-width: 0). Slides out when the parent
	 * .mobile-task-card is hovered — the CSS rule is defined below using
	 * :global(.mobile-task-card:hover) so no prop/event wiring is needed.
	 *
	 * Usage:
	 *   <HarnessTray onLaunch={(agentId) => spawnTask(task, { agentId, model: null })} />
	 */

	import { onMount } from 'svelte';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';

	let { onLaunch = (_agentId: string) => {} }: { onLaunch?: (agentId: string) => void } = $props();

	interface AgentProgram {
		id: string;
		name: string;
	}

	// Module-level cache — only one fetch across all card instances
	let _cached: AgentProgram[] | null = null;
	let _fetching: Promise<void> | null = null;

	let programs = $state<AgentProgram[]>([]);

	onMount(() => {
		if (_cached) {
			programs = _cached;
			return;
		}
		if (!_fetching) {
			_fetching = fetch('/api/config/agents?status=true')
				.then((r) => r.json())
				.then((d) => {
					_cached = d.programs ?? [];
					programs = _cached!;
				})
				.catch(() => {
					// Silently fail — tray stays empty
				});
		} else {
			_fetching.then(() => {
				programs = _cached ?? [];
			});
		}
	});
</script>

{#if programs.length > 0}
	<div class="harness-tray" role="group" aria-label="Choose harness">
		{#each programs as program (program.id)}
			<button
				class="harness-tray-btn"
				title="Launch with {program.name}"
				onclick={(e) => {
					e.stopPropagation();
					onLaunch(program.id);
				}}
			>
				<ProviderLogo agentId={program.id} size={22} />
			</button>
		{/each}
	</div>
{/if}

<style>
	/* Container — hidden by default, slides out on parent card hover */
	.harness-tray {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		max-width: 0;
		overflow: hidden;
		transition: max-width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		height: 100%;
	}

	/* Expand when the parent task card is hovered, or when the tray itself is hovered */
	:global(.mobile-task-card:hover) .harness-tray,
	.harness-tray:hover {
		max-width: 220px;
	}

	/* Individual harness button */
	.harness-tray-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		min-width: 44px;
		height: 100%;
		min-height: 52px;
		padding: 0;
		border: none;
		border-left: 1px solid oklch(0.28 0.02 250 / 0.6);
		background: oklch(0.20 0.02 250 / 0.85);
		cursor: pointer;
		transition:
			background 0.15s ease,
			transform 0.1s ease;
	}

	.harness-tray-btn:hover {
		background: oklch(0.28 0.06 220 / 0.9);
	}

	.harness-tray-btn:active {
		background: oklch(0.34 0.10 220);
		transform: scale(0.95);
	}
</style>
