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

	let {
		onLaunch = (_agentId: string) => {},
		onSettings = () => {}
	}: {
		onLaunch?: (agentId: string) => void;
		onSettings?: () => void;
	} = $props();

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
		<!-- Human: marks as human task, no launch -->
		<button
			class="harness-tray-btn harness-tray-btn-human"
			title="Mark as human task"
			onclick={(e) => {
				e.stopPropagation();
				onLaunch('human');
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="18" height="18">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
			</svg>
		</button>
		<!-- Settings: model picker -->
		<button
			class="harness-tray-btn harness-tray-btn-settings"
			title="Model options"
			onclick={(e) => {
				e.stopPropagation();
				onSettings();
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="16" height="16">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
			</svg>
		</button>
	</div>
{/if}

<style>
	/*
	 * Container — absolutely positioned, overlays the card body.
	 * Starts at left: 52px (right edge of avatar column) and slides rightward.
	 * Triggered ONLY when the adjacent .mobile-task-avatar is hovered,
	 * or when the tray itself is hovered (to keep it open after sliding out).
	 */
	.harness-tray {
		position: absolute;
		left: 52px; /* flush against avatar right edge */
		top: 0;
		bottom: 0;
		z-index: 5;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		max-width: 0;
		overflow: hidden;
		transition: max-width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	/*
	 * Sibling selector: .mobile-task-avatar and .harness-tray are direct children
	 * of .mobile-task-inner, so ~ works across the component boundary.
	 * Only expands on avatar hover — not the whole card.
	 */
	:global(.mobile-task-avatar:hover) ~ .harness-tray,
	.harness-tray:hover {
		max-width: 400px; /* 6+ buttons × 44px each */
	}

	/* Individual harness button — solid bg to overlay card body */
	.harness-tray-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		min-width: 44px;
		height: 100%;
		padding: 0;
		border: none;
		border-right: 1px solid oklch(0.30 0.03 250 / 0.5);
		background: oklch(0.18 0.02 250);
		cursor: pointer;
		transition:
			background 0.15s ease,
			transform 0.1s ease;
	}

	.harness-tray-btn:first-child {
		border-left: 1px solid oklch(0.30 0.03 250 / 0.5);
	}

	.harness-tray-btn:hover {
		background: oklch(0.28 0.06 220 / 0.9);
	}

	.harness-tray-btn:active {
		background: oklch(0.34 0.10 220);
		transform: scale(0.95);
	}

	/* Human option — warm amber tint */
	.harness-tray-btn-human {
		color: oklch(0.70 0.12 45);
	}
	.harness-tray-btn-human:hover {
		background: oklch(0.70 0.12 45 / 0.15);
	}

	/* Settings gear — muted, clearly secondary */
	.harness-tray-btn-settings {
		color: oklch(0.48 0.02 250);
		border-left: 1px solid oklch(0.30 0.03 250 / 0.3);
	}
	.harness-tray-btn-settings:hover {
		background: oklch(0.24 0.02 250);
		color: oklch(0.65 0.04 250);
	}
</style>
