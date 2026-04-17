<script lang="ts">
	/**
	 * MobileFreeTextButton — explicit "write your own answer" affordance.
	 *
	 * Rendered below the answer chips in smart-question UI. Visually distinct
	 * from OptionButton chips (full-width rectangle, left-aligned label, pencil
	 * icon, arrow affordance) so users read it as "enter different mode" rather
	 * than "select a different answer".
	 *
	 * On tap, the host opens a BottomSheet containing a textarea + Send/Cancel,
	 * replacing the old isOtherMode inline-panel swap.
	 */
	import { mobileSurface } from '$lib/config/mobileSurface';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';

	const input = SESSION_STATE_VISUALS['needs-input'];

	let {
		label = 'Type a custom answer…',
		disabled = false,
		onClick
	}: {
		label?: string;
		disabled?: boolean;
		onClick: () => void;
	} = $props();

	// Portal-safe click binding: this component is mounted inside
	// MobileSessionDrawer's portal, so Svelte's event delegation doesn't reach
	// it. Matches the pattern used by OptionButton + MobileTerminal.
	function directClick(node: HTMLElement, handler: () => void) {
		const guarded = () => {
			if (!disabled) handler();
		};
		node.addEventListener('click', guarded);
		return { destroy() { node.removeEventListener('click', guarded); } };
	}
</script>

<button
	type="button"
	class="free-text-btn w-full flex items-center gap-2 px-3 rounded-md border text-xs text-left active:scale-[0.98] transition-transform"
	class:free-text-btn-disabled={disabled}
	style="background: {mobileSurface.hoverBg}; border-color: {input.borderColor}; color: {input.textColor};"
	{disabled}
	aria-label={label}
	use:directClick={onClick}
>
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		class="flex-shrink-0"
	>
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
	</svg>
	<span class="flex-1 truncate">{label}</span>
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		class="flex-shrink-0"
		style="color: {mobileSurface.textMuted};"
	>
		<path d="M5 12h14" />
		<path d="m13 5 7 7-7 7" />
	</svg>
</button>

<style>
	.free-text-btn {
		min-height: 2.75rem; /* 44px — mobile touch-target minimum */
	}
	.free-text-btn-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.free-text-btn-disabled:active {
		transform: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.free-text-btn { transition: none; }
		.free-text-btn:active { transform: none; }
	}
</style>
