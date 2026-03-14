<script lang="ts">
	/**
	 * BasesList - Left panel showing bases grouped by source_type.
	 * Includes search, create button, enable/disable toggles.
	 */
	import type { KnowledgeBase, SourceType } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO } from '$lib/types/knowledgeBase';
	import { getBases, searchBases } from '$lib/stores/bases.svelte';
	import BaseCard from './BaseCard.svelte';

	interface Props {
		selectedBase?: KnowledgeBase | null;
		onSelect?: (base: KnowledgeBase) => void;
		onEdit?: (base: KnowledgeBase) => void;
		onAdd?: () => void;
		class?: string;
	}

	let { selectedBase = null, onSelect, onEdit, onAdd, class: className = '' }: Props = $props();

	let searchQuery = $state('');
	let searchResults = $state<KnowledgeBase[] | null>(null);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;
	let filterType = $state<SourceType | 'all'>('all');

	// Get bases from store (reactive)
	const allBases = $derived(getBases());

	// Apply local filter and search
	const displayBases = $derived.by(() => {
		const list = searchResults ?? allBases;
		if (filterType === 'all') return list;
		return list.filter(b => b.source_type === filterType);
	});

	// Separate system bases from regular bases
	const systemBases = $derived(displayBases.filter(b => b._system));
	const regularBases = $derived(displayBases.filter(b => !b._system));

	// Group regular bases by source_type
	const grouped = $derived.by(() => {
		const groups = new Map<string, KnowledgeBase[]>();
		for (const base of regularBases) {
			const key = base.source_type;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(base);
		}
		return groups;
	});

	// Debounced search
	function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchQuery = value;

		clearTimeout(searchTimeout);
		if (!value.trim()) {
			searchResults = null;
			return;
		}

		searchTimeout = setTimeout(async () => {
			searchResults = await searchBases(value);
		}, 300);
	}

	function getSourceIcon(type: string): string {
		return SOURCE_TYPE_INFO.find(s => s.type === type)?.icon || '📄';
	}

	function getSourceLabel(type: string): string {
		return SOURCE_TYPE_INFO.find(s => s.type === type)?.label || type;
	}
</script>

<div
	class="flex flex-col border rounded-xl overflow-hidden {className}"
	style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.01 250);"
>
	<!-- Header -->
	<div
		class="px-3 py-2.5 flex items-center gap-2 border-b"
		style="background: oklch(0.19 0.01 250); border-color: oklch(0.25 0.01 250);"
	>
		<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="color: oklch(0.65 0.12 240);">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
		</svg>
		<span class="font-semibold text-sm flex-1" style="color: oklch(0.85 0.01 250);">Knowledge Bases</span>
		<span class="text-xs px-1.5 py-0.5 rounded" style="background: oklch(0.25 0.02 250); color: oklch(0.65 0.01 250);">
			{allBases.length}
		</span>
		<button
			class="btn btn-ghost btn-xs"
			style="color: oklch(0.75 0.15 145);"
			onclick={() => onAdd?.()}
			title="Create new base"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
		</button>
	</div>

	<!-- Search + filter -->
	<div class="px-3 py-2 flex items-center gap-2 border-b" style="border-color: oklch(0.22 0.01 250);">
		<input
			type="text"
			placeholder="Search bases..."
			value={searchQuery}
			oninput={handleSearch}
			class="input input-xs flex-1 border-0 text-sm"
			style="background: oklch(0.20 0.01 250); color: oklch(0.85 0.01 250);"
		/>
		<select
			bind:value={filterType}
			class="select select-xs border-0 text-xs"
			style="background: oklch(0.20 0.01 250); color: oklch(0.70 0.01 250);"
		>
			<option value="all">All</option>
			{#each SOURCE_TYPE_INFO as info}
				<option value={info.type}>{info.icon} {info.label}</option>
			{/each}
		</select>
	</div>

	<!-- Scrollable list -->
	<div class="flex-1 overflow-auto p-2 space-y-1">
		{#if displayBases.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center py-8 px-4 text-center">
				<svg class="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
				<p class="text-sm mb-2" style="color: oklch(0.55 0.01 250);">
					{searchQuery ? 'No matching bases' : 'No knowledge bases yet'}
				</p>
				{#if !searchQuery}
					<button
						class="btn btn-sm"
						style="background: oklch(0.30 0.05 240); color: oklch(0.80 0.12 240); border: 1px solid oklch(0.40 0.10 240 / 0.3);"
						onclick={() => onAdd?.()}
					>
						Create First Base
					</button>
				{/if}
			</div>
		{:else if filterType === 'all' && !searchQuery}
			<!-- System bases group (always first) -->
			{#if systemBases.length > 0}
				<div class="mb-2">
					<div class="flex items-center gap-1.5 px-1 py-1">
						<span class="text-sm">🔒</span>
						<span class="text-xs font-medium uppercase tracking-wider" style="color: oklch(0.60 0.08 270);">
							System
						</span>
						<span class="text-xs" style="color: oklch(0.45 0.01 250);">({systemBases.length})</span>
					</div>
					{#each systemBases as base (base.id)}
						<BaseCard
							{base}
							selected={selectedBase?.id === base.id}
							{onSelect}
						/>
					{/each}
				</div>
			{/if}

			<!-- Grouped view (regular bases) -->
			{#each [...grouped.entries()] as [type, bases]}
				<div class="mb-2">
					<div class="flex items-center gap-1.5 px-1 py-1">
						<span class="text-sm">{getSourceIcon(type)}</span>
						<span class="text-xs font-medium uppercase tracking-wider" style="color: oklch(0.55 0.01 250);">
							{getSourceLabel(type)}
						</span>
						<span class="text-xs" style="color: oklch(0.45 0.01 250);">({bases.length})</span>
					</div>
					{#each bases as base (base.id)}
						<BaseCard
							{base}
							selected={selectedBase?.id === base.id}
							{onSelect}
							{onEdit}
						/>
					{/each}
				</div>
			{/each}
		{:else}
			<!-- Flat list (filtered or searching) -->
			{#each displayBases as base (base.id)}
				<BaseCard
					{base}
					selected={selectedBase?.id === base.id}
					{onSelect}
					{onEdit}
				/>
			{/each}
		{/if}
	</div>
</div>
