<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAndGetProjectColors, getProjectColor } from '$lib/utils/projectColors';
	import { openProjectDrawer } from '$lib/stores/drawerStore';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';

	interface Props {
		projects: string[];
		selected: string;
		onSelect: (project: string) => void;
	}

	let { projects = [], selected = '', onSelect }: Props = $props();

	let projectColors = $state<Record<string, string>>({});
	let dropdownOpen = $state(false);

	// Swipe state
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let swipeDelta = $state(0); // current drag offset (px)
	let isSwiping = $state(false);
	let swipeCommitted = $state(false);

	// Peek label while swiping
	const SWIPE_THRESHOLD = 40; // px horizontal travel to commit
	const DIR_RATIO = 2; // deltaX must be > DIR_RATIO * deltaY

	onMount(async () => {
		projectColors = await fetchAndGetProjectColors();
	});

	function getColor(project: string): string {
		return projectColors[project?.toLowerCase()] || getProjectColor(project + '-x');
	}

	const currentIndex = $derived(projects.indexOf(selected));
	const prevProject = $derived(
		projects.length > 1 ? projects[(currentIndex - 1 + projects.length) % projects.length] : null
	);
	const nextProject = $derived(
		projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null
	);

	// Peek label: while swiping show adjacent project name
	const peekLabel = $derived.by(() => {
		if (!isSwiping || Math.abs(swipeDelta) < 8) return null;
		return swipeDelta > 0 ? prevProject : nextProject;
	});

	const groups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: projects.map(p => ({ value: p, label: p }))
	}]);

	function go(direction: 1 | -1) {
		if (projects.length < 2) return;
		const next = projects[(currentIndex + direction + projects.length) % projects.length];
		onSelect(next);
	}

	// Touch handlers
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		swipeDelta = 0;
		isSwiping = false;
		swipeCommitted = false;
	}

	function handleTouchMove(e: TouchEvent) {
		const dx = e.touches[0].clientX - touchStartX;
		const dy = e.touches[0].clientY - touchStartY;
		if (!isSwiping && Math.abs(dx) < 8) return;

		// Only commit as horizontal swipe if deltaX > DIR_RATIO * deltaY
		if (!isSwiping) {
			if (Math.abs(dx) > DIR_RATIO * Math.abs(dy)) {
				isSwiping = true;
			} else {
				return; // vertical scroll takes priority
			}
		}

		e.preventDefault();
		swipeDelta = dx;
	}

	function handleTouchEnd() {
		if (isSwiping && !swipeCommitted && Math.abs(swipeDelta) >= SWIPE_THRESHOLD) {
			swipeCommitted = true;
			go(swipeDelta > 0 ? -1 : 1);
		}
		// Reset
		swipeDelta = 0;
		isSwiping = false;
		swipeCommitted = false;
	}

	// Clamp peek translate so it doesn't go too far (max 30% of bar width)
	const peekTranslate = $derived(
		isSwiping ? Math.max(-60, Math.min(60, swipeDelta * 0.35)) : 0
	);

	const selectedColor = $derived(selected ? getColor(selected) : 'oklch(0.70 0.15 200)');
</script>

<!-- aria-live region announces project changes to screen readers -->
<div class="mps-live" aria-live="polite" aria-atomic="true">
	{selected || ''}
</div>

<div
	class="mps-bar"
	style="--mps-color: {selectedColor}"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onkeydown={(e) => {
		if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
		if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
	}}
	role="navigation"
	aria-label="Project navigation"
>
	<!-- Prev chevron -->
	<button
		type="button"
		class="mps-chevron"
		aria-label="Previous project"
		disabled={projects.length < 2}
		onclick={() => go(-1)}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M15 18l-6-6 6-6" />
		</svg>
	</button>

	<!-- Center: project name + dropdown trigger -->
	<div class="mps-center">
		<div
			class="mps-label-wrap"
			style="transform: translateX({peekTranslate}px)"
		>
			<!-- Peek label (fades in during swipe) -->
			{#if peekLabel}
				<span
					class="mps-peek"
					class:mps-peek-left={swipeDelta < 0}
					class:mps-peek-right={swipeDelta > 0}
					style="--peek-color: {getColor(peekLabel)}"
					aria-hidden="true"
				>
					{peekLabel}
				</span>
			{/if}

			<!-- SearchDropdown for fuzzy project search -->
			<SearchDropdown
				value={selected}
				{groups}
				placeholder="Search projects…"
				colorFn={getColor}
				variant="chip"
				size="sm"
				onChange={(p) => onSelect(p)}
			>
				{#snippet footer()}
					<button
						type="button"
						class="mps-add-project"
						onclick={(e) => { e.stopPropagation(); openProjectDrawer(); }}
					>
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
						<span>Add Project</span>
					</button>
				{/snippet}
			</SearchDropdown>
		</div>
	</div>

	<!-- Next chevron -->
	<button
		type="button"
		class="mps-chevron"
		aria-label="Next project"
		disabled={projects.length < 2}
		onclick={() => go(1)}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M9 18l6-6-6-6" />
		</svg>
	</button>
</div>

<style>
	.mps-live {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	.mps-bar {
		display: flex;
		align-items: center;
		height: 44px;
		padding: 0 0.25rem;
		background: oklch(0.14 0.01 250);
		border-bottom: 1px solid color-mix(in oklch, var(--mps-color) 25%, oklch(0.22 0.02 250));
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		position: relative;
		overflow: hidden;
	}

	/* Color accent at bottom */
	.mps-bar::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--mps-color);
		opacity: 0.6;
		pointer-events: none;
	}

	.mps-chevron {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		height: 44px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: oklch(0.55 0.04 250);
		transition: color 0.15s, background 0.15s;
		border-radius: 0.5rem;
		flex-shrink: 0;
	}
	.mps-chevron:hover:not(:disabled) {
		color: var(--mps-color);
		background: color-mix(in oklch, var(--mps-color) 10%, transparent);
	}
	.mps-chevron:active:not(:disabled) {
		background: color-mix(in oklch, var(--mps-color) 18%, transparent);
	}
	.mps-chevron:disabled {
		opacity: 0.25;
		cursor: not-allowed;
	}
	.mps-chevron svg {
		width: 18px;
		height: 18px;
	}

	.mps-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		overflow: hidden;
		position: relative;
	}

	.mps-label-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: transform 0.05s linear;
		will-change: transform;
	}

	/* Peek label — shows adjacent project name during swipe */
	.mps-peek {
		position: absolute;
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--peek-color, oklch(0.65 0.10 250));
		opacity: 0.7;
		white-space: nowrap;
		pointer-events: none;
		transition: opacity 0.1s;
	}
	.mps-peek-right {
		right: calc(100% + 0.75rem);
	}
	.mps-peek-left {
		left: calc(100% + 0.75rem);
	}

	.mps-add-project {
		width: 100%;
		padding: 0.375rem 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.65 0.12 145);
		transition: background 0.1s, color 0.1s;
	}
	.mps-add-project:hover {
		background: oklch(0.24 0.06 145 / 0.3);
		color: oklch(0.80 0.15 145);
	}

	@media (prefers-reduced-motion: reduce) {
		.mps-label-wrap {
			transition: none;
		}
	}
</style>
