<!--
  ReferencePicker.svelte — Fuzzy picker for files, knowledge bases, and slash commands.

  Designed for use inside BottomSheet (or any container). Keyboard navigation
  mirrors the SessionCard @-autocomplete (ArrowUp/Down, Tab/Enter to select, Esc to cancel).

  Usage:
    <ReferencePicker
      project="jat"
      types={['files', 'bases', 'commands']}
      onselect={(item) => console.log(item)}
      oncancel={() => sheetOpen = false}
    />

  onselect receives:
    { type: 'file',    value: '/path/to/file', label: 'file.ts',       meta: 'src/lib' }
    { type: 'base',    value: 'base-id',       label: 'Base Name',     meta: 'manual' }
    { type: 'command', value: '/jat:start',    label: '/jat:start',    meta: 'jat' }
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';

	// ─── Types ──────────────────────────────────────────────────────────────────

	interface ReferenceItem {
		type: 'file' | 'base' | 'command';
		value: string;    // what gets inserted / returned
		label: string;    // primary display string
		meta: string;     // secondary display string (folder, base type, namespace)
	}

	// ─── Props ──────────────────────────────────────────────────────────────────

	let {
		project = '',
		types = ['files', 'bases', 'commands'] as Array<'files' | 'bases' | 'commands'>,
		initialFilter = '',
		onselect = (_item: ReferenceItem) => {},
		oncancel = () => {}
	}: {
		project?: string;
		types?: Array<'files' | 'bases' | 'commands'>;
		initialFilter?: string;
		onselect?: (item: ReferenceItem) => void;
		oncancel?: () => void;
	} = $props();

	// ─── State ──────────────────────────────────────────────────────────────────

	let filterText = $state(initialFilter);
	let filterInput: HTMLInputElement | undefined = $state();

	// All loaded items (fetched once on mount)
	let allItems = $state<ReferenceItem[]>([]);
	let loading = $state(true);
	let fetchError = $state('');

	// Keyboard nav
	let activeIndex = $state(0);

	// ─── Derived: filtered list ──────────────────────────────────────────────────

	const filteredItems = $derived.by(() => {
		const q = filterText.trim().toLowerCase();
		if (!q) return allItems;
		return allItems.filter(item =>
			item.label.toLowerCase().includes(q) ||
			item.meta.toLowerCase().includes(q) ||
			item.value.toLowerCase().includes(q)
		);
	});

	// Reset active index when filter changes
	$effect(() => {
		filterText; // track
		activeIndex = 0;
	});

	// ─── Data fetching ──────────────────────────────────────────────────────────

	async function fetchAll() {
		loading = true;
		fetchError = '';
		const items: ReferenceItem[] = [];

		const fetches: Promise<void>[] = [];

		if (types.includes('files') && project) {
			fetches.push(
				fetch(`/api/files/search?project=${encodeURIComponent(project)}&query=&limit=200`)
					.then(r => r.json())
					.then(data => {
						for (const f of (data.files || [])) {
							items.push({ type: 'file', value: f.path, label: f.name, meta: f.folder || '' });
						}
					})
					.catch(() => {})
			);
		}

		if (types.includes('bases') && project) {
			fetches.push(
				fetch(`/api/bases?project=${encodeURIComponent(project)}`)
					.then(r => r.json())
					.then(data => {
						for (const b of (data.bases || [])) {
							items.push({ type: 'base', value: b.id, label: b.name || b.id, meta: b.base_type || b.type || 'manual' });
						}
					})
					.catch(() => {})
			);
		}

		if (types.includes('commands')) {
			fetches.push(
				fetch(`/api/commands${project ? `?project=${encodeURIComponent(project)}` : ''}`)
					.then(r => r.json())
					.then(data => {
						for (const c of (data.commands || [])) {
							items.push({ type: 'command', value: c.invocation, label: c.invocation, meta: c.namespace || '' });
						}
					})
					.catch(() => {})
			);
		}

		await Promise.all(fetches);

		// Order: files first, then bases, then commands
		allItems = [
			...items.filter(i => i.type === 'file'),
			...items.filter(i => i.type === 'base'),
			...items.filter(i => i.type === 'command')
		];
		loading = false;
	}

	onMount(async () => {
		await fetchAll();
		await tick();
		filterInput?.focus();
	});

	// ─── Keyboard navigation (ported from SessionCard:4432-4455) ────────────────

	function handleKeydown(e: KeyboardEvent) {
		const count = filteredItems.length;
		if (count === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % count;
			scrollActiveIntoView();
			return;
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + count) % count;
			scrollActiveIntoView();
			return;
		}
		if (e.key === 'Tab' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey)) {
			e.preventDefault();
			selectItem(filteredItems[activeIndex]);
			return;
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			oncancel();
		}
	}

	function selectItem(item: ReferenceItem) {
		if (!item) return;
		onselect(item);
	}

	// ─── Scroll active item into view ────────────────────────────────────────────

	let listEl: HTMLElement | undefined = $state();

	function scrollActiveIntoView() {
		if (!listEl) return;
		const active = listEl.querySelector<HTMLElement>('[data-active="true"]');
		active?.scrollIntoView({ block: 'nearest' });
	}

	// ─── Section grouping helpers ────────────────────────────────────────────────

	const typeLabels: Record<string, string> = { file: 'Files', base: 'Knowledge Bases', command: 'Commands' };
	const typeIcon: Record<string, string> = {
		file: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
		base: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
		command: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z'
	};

	// Sections in filtered list (global index preserved for keyboard nav across sections)
	const sections = $derived.by(() => {
		const result: Array<{ type: string; items: Array<{ item: ReferenceItem; globalIndex: number }> }> = [];
		for (const type of ['file', 'base', 'command']) {
			const typeItems = filteredItems
				.map((item, i) => ({ item, globalIndex: i }))
				.filter(({ item }) => item.type === type);
			if (typeItems.length > 0) {
				result.push({ type, items: typeItems });
			}
		}
		return result;
	});
</script>

<div class="flex flex-col" style="min-height: 0;">
	<!-- Filter input -->
	<div class="px-3 pt-2 pb-2 border-b border-base-200">
		<div class="relative">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
				stroke="currentColor" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
			</svg>
			<input
				bind:this={filterInput}
				bind:value={filterText}
				type="text"
				placeholder="Filter files, bases, commands…"
				class="input input-sm w-full pl-8 font-mono text-sm"
				style="background: oklch(0.18 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.01 250);"
				onkeydown={handleKeydown}
			/>
		</div>
		{#if !loading && filteredItems.length > 0}
			<p class="text-xs mt-1" style="color: oklch(0.40 0.01 250);">
				{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} —
				<kbd style="background: oklch(0.25 0.02 250); padding: 1px 4px; border-radius: 2px; font-size: 10px;">↑↓</kbd> navigate
				<kbd style="background: oklch(0.25 0.02 250); padding: 1px 4px; border-radius: 2px; font-size: 10px;">Tab</kbd> or
				<kbd style="background: oklch(0.25 0.02 250); padding: 1px 4px; border-radius: 2px; font-size: 10px;">Enter</kbd> select
			</p>
		{/if}
	</div>

	<!-- Results list -->
	<div bind:this={listEl} class="flex-1 overflow-y-auto" style="min-height: 0; max-height: 55dvh;">
		{#if loading}
			<div class="flex items-center justify-center py-8 gap-2" style="color: oklch(0.50 0.01 250);">
				<svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span class="text-sm">Loading…</span>
			</div>
		{:else if fetchError}
			<div class="px-4 py-6 text-center text-sm" style="color: oklch(0.60 0.15 25);">
				{fetchError}
			</div>
		{:else if filteredItems.length === 0}
			<div class="px-4 py-6 text-center text-sm" style="color: oklch(0.45 0.01 250);">
				{filterText ? 'No matches' : 'Nothing to show'}
			</div>
		{:else}
			{#each sections as section}
				<!-- Section header -->
				<div class="sticky top-0 flex items-center gap-1.5 px-3 py-1"
					style="background: oklch(0.16 0.01 250); z-index: 1;">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
						stroke="currentColor" class="w-3 h-3 shrink-0" style="color: oklch(0.50 0.08 200);">
						<path stroke-linecap="round" stroke-linejoin="round" d={typeIcon[section.type]} />
					</svg>
					<span class="text-xs font-medium uppercase tracking-wide" style="color: oklch(0.45 0.01 250);">
						{typeLabels[section.type]} ({section.items.length})
					</span>
				</div>

				<!-- Items -->
				{#each section.items as { item, globalIndex }}
					{@const isActive = globalIndex === activeIndex}
					<button
						class="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors text-sm"
						style="background: {isActive ? 'oklch(0.25 0.04 200 / 0.3)' : 'transparent'}; color: oklch(0.85 0.01 250);"
						data-active={isActive}
						onmouseenter={() => { activeIndex = globalIndex; }}
						onclick={() => selectItem(item)}
					>
						<!-- Icon by type -->
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
							stroke="currentColor" class="w-3.5 h-3.5 shrink-0" style="color: oklch(0.55 0.08 200);">
							<path stroke-linecap="round" stroke-linejoin="round" d={typeIcon[item.type]} />
						</svg>

						<div class="flex-1 min-w-0">
							<div class="truncate font-mono">{item.label}</div>
							{#if item.meta}
								<div class="truncate text-xs" style="color: oklch(0.45 0.01 250);">{item.meta}</div>
							{/if}
						</div>
					</button>
				{/each}
			{/each}
		{/if}
	</div>
</div>
