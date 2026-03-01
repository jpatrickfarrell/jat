<script lang="ts">
	/**
	 * BaseCard - Individual knowledge base card in the list.
	 * Shows name, source icon, scope badge, token estimate, enabled toggle.
	 */
	import type { KnowledgeBase } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO } from '$lib/types/knowledgeBase';
	import { toggleAlwaysInject } from '$lib/stores/bases.svelte';

	interface Props {
		base: KnowledgeBase;
		selected?: boolean;
		onSelect?: (base: KnowledgeBase) => void;
		onEdit?: (base: KnowledgeBase) => void;
		class?: string;
	}

	let { base, selected = false, onSelect, onEdit, class: className = '' }: Props = $props();

	const sourceInfo = $derived(SOURCE_TYPE_INFO.find(s => s.type === base.source_type));

	function formatTokens(n: number | null): string {
		if (n == null) return '—';
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return String(n);
	}

	function handleToggle(e: Event) {
		e.stopPropagation();
		toggleAlwaysInject(base.id);
	}

	function handleClick() {
		onSelect?.(base);
	}

	function handleEdit(e: Event) {
		e.stopPropagation();
		onEdit?.(base);
	}
</script>

<button
	type="button"
	class="w-full text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer group {className}"
	class:border-info={selected}
	class:bg-base-100={!selected}
	class:bg-info={false}
	style="
		background: {selected ? 'oklch(0.22 0.03 240 / 0.3)' : 'oklch(0.18 0.015 250)'};
		border-color: {selected ? 'oklch(0.60 0.15 240 / 0.5)' : 'oklch(0.25 0.01 250)'};
	"
	onclick={handleClick}
>
	<!-- Top row: icon + name + toggle -->
	<div class="flex items-center gap-2">
		<!-- Source type icon -->
		<span class="text-base flex-shrink-0" title={sourceInfo?.label}>{sourceInfo?.icon || '📄'}</span>

		<!-- Name -->
		<span class="font-medium text-sm truncate flex-1" style="color: oklch(0.90 0.01 250);">
			{base.name}
		</span>

		<!-- Always-inject toggle -->
		<label class="swap swap-rotate flex-shrink-0" onclick={handleToggle}>
			<input type="checkbox" checked={base.always_inject} />
			<span
				class="text-xs px-1.5 py-0.5 rounded-full font-medium"
				style="background: {base.always_inject ? 'oklch(0.45 0.15 145 / 0.3)' : 'oklch(0.30 0.01 250)'}; color: {base.always_inject ? 'oklch(0.80 0.15 145)' : 'oklch(0.55 0.01 250)'};"
			>
				{base.always_inject ? 'ON' : 'OFF'}
			</span>
		</label>
	</div>

	<!-- Description -->
	{#if base.description}
		<p class="text-xs mt-1 truncate" style="color: oklch(0.60 0.01 250);">{base.description}</p>
	{/if}

	<!-- Bottom row: type badge + token estimate + edit button -->
	<div class="flex items-center gap-2 mt-2">
		<!-- Source type badge -->
		<span
			class="text-xs px-1.5 py-0.5 rounded"
			style="background: oklch(0.25 0.02 250); color: oklch(0.70 0.01 250);"
		>
			{sourceInfo?.label || base.source_type}
		</span>

		<!-- Token estimate -->
		{#if base.token_estimate != null}
			<span class="text-xs" style="color: oklch(0.55 0.01 250);">
				~{formatTokens(base.token_estimate)} tokens
			</span>
		{/if}

		<div class="flex-1"></div>

		<!-- Edit button (hover visible) -->
		<button
			type="button"
			class="text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
			style="background: oklch(0.25 0.02 250); color: oklch(0.70 0.12 240);"
			onclick={handleEdit}
		>
			Edit
		</button>
	</div>
</button>
