<script lang="ts">
	/**
	 * CSS Scale Minimap - Sublime Text style
	 *
	 * Uses a fixed scale factor so text remains readable regardless of content length.
	 * When content exceeds the minimap height, only a portion is shown at a time,
	 * scrolling in sync with the terminal. The viewport indicator shows which part
	 * of the document is currently visible in the terminal.
	 */
	import { ansiToHtml } from '$lib/utils/ansiToHtml';

	let {
		output = '',
		height = 200,
		scale: _scale,
		terminalWidth = 800,
		onPositionClick = (percent: number) => {}
	}: {
		output: string;
		height?: number;
		/** Optional fixed scale factor (overrides default 0.12) */
		scale?: number;
		terminalWidth?: number;
		onPositionClick?: (percent: number) => void;
	} = $props();

	const FIXED_SCALE = 0.12;

	let minimapContainer: HTMLDivElement;
	let measureContainer: HTMLDivElement;

	// Terminal scroll state (set externally via setViewportPosition)
	let scrollPercent = $state(0);   // 0-100: how far the terminal has scrolled
	let visiblePercent = $state(20); // 0-100: what % of total content the terminal shows
	let isDragging = $state(false);

	const htmlContent = $derived(ansiToHtml(output));

	let naturalHeight = $state(0);

	const computedScale = $derived(_scale != null ? _scale : FIXED_SCALE);

	// Total height of content after scaling
	const scaledHeight = $derived(naturalHeight * computedScale);

	// Whether the scaled content overflows the minimap container
	const overflows = $derived(scaledHeight > height);

	// Content scroll offset (px). Maps terminal scroll (0-100%) to minimap content offset.
	const contentOffset = $derived.by(() => {
		if (!overflows) return 0;
		const maxOffset = scaledHeight - height;
		return (scrollPercent / 100) * maxOffset;
	});

	// Viewport indicator position relative to the scaled content (not the container)
	// This gives us the position in "content space" which we then adjust for the scroll offset
	const viewportInContentY = $derived.by(() => {
		if (scaledHeight <= 0) return 0;
		// The viewport starts at scrollPercent% through the content, adjusted for its own size
		const maxScrollable = scaledHeight - (visiblePercent / 100) * scaledHeight;
		return (scrollPercent / 100) * maxScrollable;
	});

	// Viewport position in container space (subtract the content scroll offset)
	const viewportY = $derived(viewportInContentY - contentOffset);

	// Viewport indicator height in pixels
	const viewportH = $derived.by(() => {
		const h = (visiblePercent / 100) * scaledHeight;
		return Math.max(10, Math.min(height, h));
	});

	$effect(() => {
		if (measureContainer && output) {
			naturalHeight = measureContainer.scrollHeight;
		}
	});

	function clickToPercent(clientY: number): number {
		if (!minimapContainer) return 0;
		const rect = minimapContainer.getBoundingClientRect();
		const clickY = clientY - rect.top;

		if (overflows) {
			// The click position in the container maps to a position in content space
			const contentY = clickY + contentOffset;
			// Convert content position to a document percentage
			return Math.max(0, Math.min(100, (contentY / scaledHeight) * 100));
		} else {
			return Math.max(0, Math.min(100, (clickY / height) * 100));
		}
	}

	function handleMinimapClick(e: MouseEvent) {
		e.preventDefault();
		onPositionClick(clickToPercent(e.clientY));
	}

	function handleDragStart(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;
		handleDrag(e);
	}

	function handleDrag(e: MouseEvent) {
		if (!isDragging) return;
		onPositionClick(clickToPercent(e.clientY));
	}

	function handleDragEnd() {
		isDragging = false;
	}

	export function setViewportPosition(newScrollPercent: number, newVisiblePercent: number) {
		scrollPercent = newScrollPercent;
		visiblePercent = newVisiblePercent;
	}
</script>

<svelte:window onmousemove={handleDrag} onmouseup={handleDragEnd} />

<div class="minimap-css-scale" style="height: {height}px;">
	<!-- Hidden measure container -->
	<div class="measure-container" bind:this={measureContainer} style="width: {terminalWidth}px;">
		<pre class="terminal-output">{@html htmlContent}</pre>
	</div>

	<div
		class="minimap-container"
		bind:this={minimapContainer}
		onclick={handleMinimapClick}
		role="slider"
		tabindex="0"
		aria-label="Minimap navigation"
		aria-valuenow={scrollPercent}
	>
		<!-- Scaled content, translated to show current portion -->
		<div
			class="minimap-content"
			style="
				transform: scale({computedScale}) translateY({-contentOffset / computedScale}px);
				transform-origin: top left;
				width: {computedScale > 0 ? 100 / computedScale : 1000}%;
			"
		>
			<pre class="terminal-output">{@html htmlContent}</pre>
		</div>

		<!-- Viewport indicator -->
		<div
			class="viewport-indicator"
			style="top: {viewportY}px; height: {viewportH}px;"
			onmousedown={handleDragStart}
			role="button"
			tabindex="0"
			aria-label="Drag to scroll"
		></div>
	</div>
</div>

<style>
	.minimap-css-scale {
		display: flex;
		flex-direction: column;
		background: oklch(0.12 0.01 250);
		overflow: hidden;
		height: 100%;
		position: relative;
	}

	.measure-container {
		position: absolute;
		visibility: hidden;
		pointer-events: none;
	}

	.minimap-container {
		position: relative;
		flex: 1;
		overflow: hidden;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}

	.minimap-content {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.terminal-output {
		margin: 0;
		padding: 0.25rem;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 12px;
		line-height: 1.4;
		white-space: pre;
		color: oklch(0.85 0.02 250);
	}

	.viewport-indicator {
		position: absolute;
		left: 0;
		right: 0;
		background: oklch(0.60 0.15 220 / 0.3);
		border: 1px solid oklch(0.70 0.18 220 / 0.6);
		border-radius: 2px;
		cursor: grab;
		min-height: 10px;
		transition: background 0.15s ease;
	}

	.viewport-indicator:hover {
		background: oklch(0.65 0.18 220 / 0.4);
	}

	.viewport-indicator:active {
		cursor: grabbing;
		background: oklch(0.70 0.20 220 / 0.5);
	}
</style>
