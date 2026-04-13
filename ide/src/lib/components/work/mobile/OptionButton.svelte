<script lang="ts">
	/**
	 * OptionButton — pill-style choice button used inside QuestionPanel.
	 *
	 * Variants:
	 *   - default:   unselected option chip (neutral surface)
	 *   - selected:  selected option chip (needs-input accent)
	 *   - ghost:     subtle outline (used for "Other", free-text suggestions)
	 *
	 * 44×44 minimum touch target per iOS/Android guidelines.
	 */
	import type { Snippet } from 'svelte';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';
	import { mobileSurface } from '$lib/config/mobileSurface';
	import Spinner from './Spinner.svelte';

	const input = SESSION_STATE_VISUALS['needs-input'];

	let {
		variant = 'default',
		title,
		disabled = false,
		busy = false,
		onClick,
		children
	}: {
		variant?: 'default' | 'selected' | 'ghost';
		title?: string;
		disabled?: boolean;
		busy?: boolean;
		onClick: () => void;
		children: Snippet;
	} = $props();

	function directClick(node: HTMLElement, handler: () => void) {
		const guarded = () => { if (!disabled) handler(); };
		node.addEventListener('click', guarded);
		return { destroy() { node.removeEventListener('click', guarded); } };
	}

	const styles = $derived(
		variant === 'selected'
			? `background: ${input.accent}; border-color: ${input.borderColor}; color: ${mobileSurface.textBright};`
			: variant === 'ghost'
			? `background: ${input.bgTint}; border-color: ${input.borderColor}; color: ${input.textColor};`
			: `background: ${mobileSurface.hoverBg}; border-color: ${mobileSurface.subtleBorder}; color: ${mobileSurface.textDim};`
	);
</script>

<button
	class="option-btn text-xs rounded-md border px-3 flex items-center gap-1.5 active:scale-95 transition-transform"
	class:option-btn-disabled={disabled}
	class:option-btn-busy={busy}
	style={styles}
	{title}
	{disabled}
	aria-busy={busy}
	use:directClick={onClick}
>
	{#if busy}
		<Spinner size={12} />
	{/if}
	{@render children()}
</button>

<style>
	.option-btn {
		min-height: 2.75rem; /* 44px — meets mobile touch-target minimum */
	}
	.option-btn-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.option-btn-disabled:active {
		transform: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.option-btn { transition: none; }
		.option-btn:active { transform: none; }
	}
</style>
