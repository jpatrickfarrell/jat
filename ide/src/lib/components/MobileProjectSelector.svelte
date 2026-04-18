<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAndGetProjectColors, getProjectColor } from '$lib/utils/projectColors';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';

	interface Props {
		projects: string[];
		selected: string;
		onSelect: (project: string) => void;
		colorFn?: (project: string) => string;
		onOpenSearch?: () => void;
		sessionStates?: string[];
	}

	let { projects = [], selected = '', onSelect, colorFn, onOpenSearch, sessionStates = [] }: Props = $props();

	let projectColors = $state<Record<string, string>>({});

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
		if (!colorFn) {
			projectColors = await fetchAndGetProjectColors();
		}
	});

	function getColor(project: string): string {
		if (colorFn) return colorFn(project);
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

			<!-- Project name button — tapping opens UnifiedSearch (Ctrl+K) -->
			<button
				type="button"
				class="mps-name-btn"
				style="--mps-color: {selectedColor}"
				onclick={() => onOpenSearch?.()}
				aria-label="Search projects and commands"
			>
				{#if sessionStates.length > 0}
					<span class="mps-dots">
						{#each sessionStates as state}
							{@const visual = SESSION_STATE_VISUALS[state]}
							{@const color = visual?.accent || selectedColor}
							{@const isNI = state === 'needs-input'}
							{@const isRev = state === 'ready-for-review'}
							{#if isNI || isRev}
								<span class="mps-dot-animated">
									<span class="mps-dot-ping" class:animate-ping={isNI} class:animate-pulse={isRev} style="background: {color};"></span>
									<span class="mps-dot-core" style="background: {color};"></span>
								</span>
							{:else}
								<span class="mps-dot" style="background: {color};"></span>
							{/if}
						{/each}
					</span>
				{:else}
					<span class="mps-dot" style="background: {selectedColor};"></span>
				{/if}
				<span class="mps-name-text truncate">{selected || 'Select project'}</span>
				<svg class="mps-name-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
				</svg>
			</button>
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
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		position: relative;
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
		overflow: visible;
		position: relative;
	}

	/* Project name button — matches desktop chip-group language */
	.mps-name-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3rem 0.625rem;
		border-radius: 0.375rem;
		border: 1px solid color-mix(in oklch, var(--mps-color) 62%, transparent);
		background: color-mix(in oklch, var(--mps-color) 30%, transparent);
		box-shadow: 0 0 14px color-mix(in oklch, var(--mps-color) 28%, transparent), 0 0 4px color-mix(in oklch, var(--mps-color) 12%, transparent);
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--mps-color);
		max-width: 16rem;
		transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
		-webkit-tap-highlight-color: transparent;
		/* Ensure touch target is at least 44px tall via line-height */
		min-height: 2rem;
	}
	.mps-name-btn:hover, .mps-name-btn:focus-visible {
		background: color-mix(in oklch, var(--mps-color) 38%, transparent);
		border-color: color-mix(in oklch, var(--mps-color) 75%, transparent);
		box-shadow: 0 0 18px color-mix(in oklch, var(--mps-color) 38%, transparent), 0 0 6px color-mix(in oklch, var(--mps-color) 18%, transparent);
		outline: none;
	}
	.mps-name-btn:active {
		background: color-mix(in oklch, var(--mps-color) 42%, transparent);
	}
	/* Session state dots — mirrors ProjectSelector chip-dot pattern */
	.mps-dots {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		flex-shrink: 0;
	}

	.mps-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.mps-dot-animated {
		position: relative;
		display: inline-flex;
		width: 0.5rem;
		height: 0.5rem;
		flex-shrink: 0;
		overflow: hidden;
	}

	.mps-dot-ping {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		opacity: 0.75;
	}

	.mps-dot-core {
		position: relative;
		display: inline-flex;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
	.mps-name-text {
		flex: 1;
		min-width: 0;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	.mps-name-chevron {
		width: 11px;
		height: 11px;
		flex-shrink: 0;
		opacity: 0.5;
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

@media (prefers-reduced-motion: reduce) {
		.mps-label-wrap {
			transition: none;
		}
	}
</style>
