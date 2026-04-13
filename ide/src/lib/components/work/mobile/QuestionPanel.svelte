<script lang="ts">
	/**
	 * QuestionPanel — shared visual shell for mobile "needs input" surfaces.
	 *
	 * Renders the common chrome (badge + question text + optional dismiss) and
	 * delegates the interactive body to a snippet. Used by both the jat-signal
	 * custom question and the AskUserQuestion smart question so they stay
	 * visually indistinguishable.
	 *
	 * Uses the `needs-input` session-state token family so mobile and desktop
	 * share the same semantic palette.
	 */
	import type { Snippet } from 'svelte';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';
	import { mobileSurface } from '$lib/config/mobileSurface';

	const input = SESSION_STATE_VISUALS['needs-input'];

	let {
		question,
		badge = '?',
		onDismiss,
		children
	}: {
		question: string;
		badge?: string;
		onDismiss?: () => void;
		children: Snippet;
	} = $props();

	// Optical centering: prefer a plain glyph in a monospaced chip over emoji
	// so rendering is consistent across platforms (iOS/Android emoji fonts vary).

	// Portal-safe click: parent mounts inside MobileSessionDrawer's portal
	// where Svelte event delegation doesn't reach.
	function directClick(node: HTMLElement, handler: () => void) {
		node.addEventListener('click', handler);
		return { destroy() { node.removeEventListener('click', handler); } };
	}
</script>

<div
	class="flex-shrink-0 p-2 border-t border-base-300 overflow-y-auto"
	style="background: {input.bgTint}; max-height: 50vh; padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px)); overscroll-behavior: contain;"
>
	<div class="flex items-start justify-between gap-2 mb-2">
		<div class="flex items-center gap-2 min-w-0 flex-1">
			<span
				class="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
				style="background: {input.bgColor}; color: {input.textColor};"
			>{badge}</span>
			<span class="text-xs font-semibold leading-snug" style="color: {input.textColor};">
				{question}
			</span>
		</div>
		{#if onDismiss}
			<button
				class="flex-shrink-0 flex items-center justify-center rounded-full opacity-60 active:opacity-100"
				style="color: {mobileSurface.textMuted}; width: 2.75rem; height: 2.75rem;"
				use:directClick={onDismiss}
				aria-label="Dismiss question"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	{@render children()}
</div>
