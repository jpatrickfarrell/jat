<script lang="ts">
	/**
	 * ResizableDivider Component
	 * A draggable divider for resizing split panels.
	 *
	 * Features:
	 * - Horizontal drag handle with grippy visual
	 * - Mouse and touch support
	 * - Emits percentage changes via callback
	 * - Visual feedback on hover/drag
	 * - Snap-to-collapse support with click-to-restore
	 */

	interface Props {
		onResize: (deltaY: number) => void;
		class?: string;
		/** Whether a panel is currently collapsed */
		isCollapsed?: boolean;
		/** Which direction the panel collapsed ('top' = top panel hidden, 'bottom' = bottom panel hidden) */
		collapsedDirection?: 'top' | 'bottom' | null;
		/** Callback when clicking the divider while collapsed (to restore) */
		onCollapsedClick?: () => void;
	}

	let {
		onResize,
		class: className = '',
		isCollapsed = false,
		collapsedDirection = null,
		onCollapsedClick
	}: Props = $props();

	let isDragging = $state(false);
	let startY = $state(0);

	function handleMouseDown(e: MouseEvent) {
		// If collapsed and we have a restore handler, treat click as restore
		if (isCollapsed && onCollapsedClick) {
			onCollapsedClick();
			return;
		}

		e.preventDefault();
		isDragging = true;
		startY = e.clientY;

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const deltaY = e.clientY - startY;
		startY = e.clientY;
		onResize(deltaY);
	}

	function handleMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	function handleTouchStart(e: TouchEvent) {
		// If collapsed and we have a restore handler, treat tap as restore
		if (isCollapsed && onCollapsedClick) {
			onCollapsedClick();
			return;
		}

		if (e.touches.length !== 1) return;
		isDragging = true;
		startY = e.touches[0].clientY;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging || e.touches.length !== 1) return;
		const deltaY = e.touches[0].clientY - startY;
		startY = e.touches[0].clientY;
		onResize(deltaY);
	}

	function handleTouchEnd() {
		isDragging = false;
	}
</script>

<div
	class="flex items-center justify-center select-none transition-all duration-150 {className} {isDragging ? 'bg-primary/20' : ''} {isCollapsed ? 'cursor-pointer divider-collapsed' : 'cursor-row-resize'}"
	role="separator"
	aria-orientation="horizontal"
	aria-expanded={!isCollapsed}
	tabindex="0"
	onmousedown={handleMouseDown}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	{#if isCollapsed}
		<!-- Collapsed state: minimal industrial indicator -->
		<div class="collapsed-indicator">
			<div class="indicator-line"></div>
			<div class="indicator-dots">
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="indicator-line"></div>
		</div>
	{:else}
		<!-- Normal state: grippy handle -->
		<div
			class="flex flex-col gap-0.5 py-1 px-8 rounded transition-opacity"
			class:opacity-100={isDragging}
			class:opacity-50={!isDragging}
		>
			<div class="w-8 h-0.5 rounded-full bg-base-content/30"></div>
			<div class="w-8 h-0.5 rounded-full bg-base-content/30"></div>
		</div>
	{/if}
</div>

<style>
	div[role="separator"]:hover {
		background: oklch(0.5 0.1 250 / 0.1);
	}

	div[role="separator"]:not([aria-expanded="false"]):hover > div {
		opacity: 1;
	}

	/* Collapsed state styling */
	.divider-collapsed {
		height: 6px !important;
		min-height: 6px;
		background: oklch(0.25 0.02 250);
		border-color: oklch(0.30 0.03 250) !important;
	}

	.divider-collapsed:hover {
		background: oklch(0.30 0.05 250) !important;
	}

	.collapsed-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 0 16px;
	}

	.indicator-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			oklch(0.50 0.08 250 / 0.3) 20%,
			oklch(0.50 0.08 250 / 0.3) 80%,
			transparent 100%
		);
	}

	.indicator-dots {
		display: flex;
		gap: 3px;
		opacity: 0.5;
		transition: opacity 0.15s ease, transform 0.15s ease;
	}

	.indicator-dots span {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: oklch(0.60 0.12 250);
	}

	.divider-collapsed:hover .indicator-dots {
		opacity: 1;
		transform: scaleX(1.2);
	}

	.divider-collapsed:hover .indicator-dots span {
		background: oklch(0.70 0.15 250);
		box-shadow: 0 0 4px oklch(0.70 0.15 250 / 0.5);
	}

	.divider-collapsed:hover .indicator-line {
		background: linear-gradient(
			90deg,
			transparent 0%,
			oklch(0.60 0.12 250 / 0.5) 20%,
			oklch(0.60 0.12 250 / 0.5) 80%,
			transparent 100%
		);
	}
</style>
