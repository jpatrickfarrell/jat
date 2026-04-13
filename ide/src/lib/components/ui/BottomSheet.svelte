<!--
  BottomSheet.svelte — Reusable mobile bottom sheet primitive.

  Usage:
    <BottomSheet bind:open title="Pick something" onclose={handleClose}>
      Content here
    </BottomSheet>

  Props:
    open      {boolean} — bindable, controls visibility
    title     {string}  — optional header title
    zIndex    {number}  — z-index override (default 70)
    onclose   {() => void} — called when sheet is dismissed

  Drag-to-dismiss:
    Pointer drag downward > 80px dismisses the sheet.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		open = $bindable(false),
		title = '',
		zIndex = 70,
		onclose = () => {},
		children
	}: {
		open?: boolean;
		title?: string;
		zIndex?: number;
		onclose?: () => void;
		children?: Snippet;
	} = $props();

	// Drag-to-dismiss state
	let dragStartY = 0;
	let dragCurrentY = $state(0);
	let isDragging = $state(false);

	const DISMISS_THRESHOLD = 80;

	function dismiss() {
		open = false;
		onclose();
	}

	function onPointerDown(e: PointerEvent) {
		dragStartY = e.clientY;
		dragCurrentY = 0;
		isDragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const delta = e.clientY - dragStartY;
		dragCurrentY = Math.max(0, delta); // only allow downward drag
	}

	function onPointerUp(_e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		if (dragCurrentY >= DISMISS_THRESHOLD) {
			dismiss();
		}
		dragCurrentY = 0;
	}

	// Subtle resistance feedback during drag
	const dragOpacity = $derived(isDragging ? Math.max(0.4, 1 - dragCurrentY / 300) : 1);
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/50"
		style="z-index: {zIndex}"
		role="button"
		tabindex="-1"
		aria-label="Close"
		transition:fade={{ duration: 150 }}
		onclick={dismiss}
		onkeydown={(e) => { if (e.key === 'Escape') dismiss(); }}
	></div>

	<!-- Sheet Panel -->
	<div
		class="fixed bottom-0 inset-x-0 flex flex-col bg-base-100 rounded-t-2xl border-t border-base-300 shadow-2xl"
		style="z-index: {zIndex + 1}; transform: translateY({dragCurrentY}px); opacity: {dragOpacity}; transition: {isDragging ? 'none' : 'transform 0.15s ease, opacity 0.15s ease'}; max-height: 80dvh;"
		role="dialog"
		aria-modal="true"
		aria-label={title || 'Bottom sheet'}
		transition:fly={{ y: 300, duration: 200, easing: cubicOut }}
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => { if (e.key === 'Escape') dismiss(); }}
	>
		<!-- Drag handle (pointer capture target) -->
		<div
			class="flex-shrink-0 flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
			role="button"
			tabindex="-1"
			aria-label="Drag to dismiss"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
		>
			<div class="w-10 h-1.5 bg-base-300 rounded-full"></div>
		</div>

		<!-- Optional header -->
		{#if title}
			<div class="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-base-200">
				<span class="text-sm font-semibold">{title}</span>
				<button
					type="button"
					class="btn btn-sm btn-ghost btn-circle"
					aria-label="Close"
					onclick={dismiss}
				>✕</button>
			</div>
		{/if}

		<!-- Scrollable content -->
		<div
			class="flex-1 overflow-y-auto overscroll-contain"
			style="padding-bottom: max(1rem, env(safe-area-inset-bottom));"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
