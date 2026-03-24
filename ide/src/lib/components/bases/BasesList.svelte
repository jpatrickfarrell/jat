<script lang="ts">
	/**
	 * BasesList - Unified left panel for /bases route.
	 * Shows all bases (canvas pages) in a flat list with system bases separate.
	 * Includes search, templates, context menu (rename/delete), always_inject toggle.
	 * Supports drag-and-drop reordering via svelte-dnd-action.
	 * Each base can have an emoji icon for quick visual identification.
	 */
	import type { KnowledgeBase } from '$lib/types/knowledgeBase';
	import { dndzone, TRIGGERS, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import EmojiPicker from '$lib/components/ui/EmojiPicker.svelte';

	interface CanvasTemplate {
		id: string;
		name: string;
		description: string;
		category: string;
	}

	let {
		bases,
		selectedBaseId = null,
		onSelect,
		onAdd,
		onDelete,
		onRename,
		onCreateFromTemplate,
		onToggleAlwaysInject,
		onIconChange,
		onReorder,
	}: {
		bases: KnowledgeBase[];
		selectedBaseId: string | null;
		onSelect: (base: KnowledgeBase) => void;
		onAdd: () => void;
		onDelete: (base: KnowledgeBase) => void;
		onRename: (base: KnowledgeBase, newName: string) => void;
		onCreateFromTemplate: (templateId: string) => void;
		onToggleAlwaysInject: (base: KnowledgeBase) => void;
		onIconChange: (base: KnowledgeBase, icon: string | null) => void;
		onReorder: (orderedIds: string[]) => void;
	} = $props();

	// Search state
	let searchQuery = $state('');
	let searchResults = $state<KnowledgeBase[] | null>(null);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;

	// Template state
	let templates = $state<CanvasTemplate[]>([]);
	let showTemplates = $state(false);
	let templatesLoaded = $state(false);

	// Rename state
	let renamingId = $state<string | null>(null);
	let renameValue = $state('');
	let renameInputEl: HTMLInputElement | undefined = $state(undefined);

	// Context menu state
	let ctxBase = $state<KnowledgeBase | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);

	// Split system vs user bases
	const systemBases = $derived(bases.filter(b => b._system));
	const userBases = $derived(bases.filter(b => !b._system));

	// DnD items — mutable copy for svelte-dnd-action
	let dndItems = $state<KnowledgeBase[]>([]);
	const isSearching = $derived(!!searchQuery.trim());

	// Sync dndItems when userBases change (but not during drag)
	$effect(() => {
		if (!isSearching) {
			dndItems = [...userBases];
		}
	});

	// Apply search filter
	const displayBases = $derived.by(() => {
		if (isSearching) return searchResults ?? userBases;
		return dndItems;
	});

	// Debounced search
	async function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchQuery = value;

		clearTimeout(searchTimeout);
		if (!value.trim()) {
			searchResults = null;
			return;
		}

		searchTimeout = setTimeout(async () => {
			try {
				const res = await fetch(`/api/bases/search?q=${encodeURIComponent(value)}&limit=20`);
				if (res.ok) {
					const data = await res.json();
					searchResults = data.bases || [];
				}
			} catch {
				// Keep current results on error
			}
		}, 300);
	}

	// Templates
	async function loadTemplates() {
		if (templatesLoaded) return;
		try {
			const res = await fetch('/api/bases/templates');
			if (res.ok) {
				const data = await res.json();
				templates = data.templates || [];
			}
		} catch {
			// Templates are optional
		}
		templatesLoaded = true;
	}

	function toggleTemplates() {
		showTemplates = !showTemplates;
		if (showTemplates && !templatesLoaded) {
			loadTemplates();
		}
	}

	function handleTemplateClick(templateId: string) {
		onCreateFromTemplate(templateId);
		showTemplates = false;
	}

	const categoryIcons: Record<string, string> = {
		general: '📄',
		data: '📊',
		project: '📋',
		agent: '🤖',
	};

	// Context menu
	function handleContextMenu(e: MouseEvent, base: KnowledgeBase) {
		if (base._system) return;
		e.preventDefault();
		ctxBase = base;
		ctxX = e.clientX;
		ctxY = e.clientY;
		ctxVisible = true;
	}

	function closeContextMenu() {
		ctxVisible = false;
	}

	// Rename
	function startRename(base: KnowledgeBase) {
		renamingId = base.id;
		renameValue = base.name;
		closeContextMenu();
		requestAnimationFrame(() => {
			renameInputEl?.focus({ preventScroll: true });
		});
	}

	function commitRename(base: KnowledgeBase) {
		if (renameValue.trim() && renameValue !== base.name) {
			onRename(base, renameValue.trim());
		}
		renamingId = null;
	}

	function handleRenameKeydown(e: KeyboardEvent, base: KnowledgeBase) {
		if (e.key === 'Enter') commitRename(base);
		else if (e.key === 'Escape') renamingId = null;
	}

	function handleDeleteClick(base: KnowledgeBase) {
		closeContextMenu();
		onDelete(base);
	}

	function handleToggle(e: Event, base: KnowledgeBase) {
		e.stopPropagation();
		onToggleAlwaysInject(base);
	}

	function handleIconSelect(base: KnowledgeBase, icon: string | null) {
		onIconChange(base, icon);
	}

	// DnD handlers
	function handleDndConsider(e: CustomEvent<{ items: KnowledgeBase[] }>) {
		dndItems = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: KnowledgeBase[] }>) {
		dndItems = e.detail.items;
		// Emit reorder with new ID order
		const ids = dndItems.filter(item => !(item as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME]).map(item => item.id);
		onReorder(ids);
	}

	function formatTokens(n: number | null): string {
		if (n == null) return '';
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return String(n);
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d`;
		return d.toLocaleDateString();
	}
</script>

<svelte:window onclick={closeContextMenu} />

<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.16 0.01 250);">
	<!-- Header -->
	<div class="flex items-center justify-between px-4 py-3" style="border-bottom: 1px solid oklch(0.25 0.02 250);">
		<h2 class="font-mono text-xs tracking-wider uppercase flex items-center gap-2" style="color: oklch(0.65 0.02 250);">
			Knowledge Bases
			{#if bases.length > 0}
				<span class="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style="background: oklch(0.25 0.02 250); color: oklch(0.55 0.02 250);">
					{bases.length}
				</span>
			{/if}
		</h2>
		<div class="flex items-center gap-1">
			<!-- Template button -->
			<button
				onclick={toggleTemplates}
				class="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all duration-150 hover:scale-105 cursor-pointer"
				style="background: {showTemplates ? 'oklch(0.55 0.15 280 / 0.2)' : 'oklch(0.55 0.15 280 / 0.1)'}; color: oklch(0.70 0.12 280); border: 1px solid oklch(0.55 0.15 280 / 0.25);"
				title="Create from template"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
				</svg>
			</button>
			<!-- New blank page button -->
			<button
				onclick={onAdd}
				class="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all duration-150 hover:scale-105 cursor-pointer"
				style="background: oklch(0.70 0.18 240 / 0.15); color: oklch(0.75 0.15 240); border: 1px solid oklch(0.70 0.18 240 / 0.3);"
				title="Create new base"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
				New
			</button>
		</div>
	</div>

	<!-- Search -->
	<div class="px-3 py-2" style="border-bottom: 1px solid oklch(0.22 0.01 250);">
		<input
			type="text"
			placeholder="Search bases..."
			value={searchQuery}
			oninput={handleSearch}
			class="w-full px-2.5 py-1.5 rounded text-sm border-0 outline-none"
			style="background: oklch(0.20 0.01 250); color: oklch(0.85 0.01 250);"
		/>
	</div>

	<!-- Template Panel (collapsible) -->
	{#if showTemplates}
		<div class="px-2 py-2 space-y-1" style="border-bottom: 1px solid oklch(0.25 0.02 250); background: oklch(0.14 0.01 260);">
			<div class="text-[10px] font-mono uppercase tracking-wider px-2 pb-1" style="color: oklch(0.50 0.08 280);">
				Templates
			</div>
			{#if !templatesLoaded}
				<div class="flex items-center justify-center py-3">
					<div class="w-4 h-4 border-2 rounded-full animate-spin" style="border-color: oklch(0.55 0.15 280 / 0.3); border-top-color: oklch(0.65 0.15 280);"></div>
				</div>
			{:else if templates.length === 0}
				<p class="text-[11px] px-2 py-1" style="color: oklch(0.45 0.02 250);">No templates available.</p>
			{:else}
				{#each templates as tmpl}
					<button
						onclick={() => handleTemplateClick(tmpl.id)}
						class="w-full text-left px-2.5 py-2 rounded transition-all duration-100 cursor-pointer group"
						style="background: transparent; border: none;"
					>
						<div class="flex items-start gap-2">
							<span class="text-sm mt-0.5 shrink-0">{categoryIcons[tmpl.category] || '📄'}</span>
							<div class="min-w-0">
								<div class="text-xs font-medium group-hover:underline" style="color: oklch(0.78 0.10 280);">
									{tmpl.name}
								</div>
								<div class="text-[10px] mt-0.5 line-clamp-2" style="color: oklch(0.45 0.02 250);">
									{tmpl.description}
								</div>
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- Base List -->
	<div class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
		{#if displayBases.length === 0 && systemBases.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center h-full gap-3 px-4">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-10 h-10" style="color: oklch(0.35 0.02 250);">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
				<p class="text-xs text-center" style="color: oklch(0.45 0.02 250);">
					{searchQuery ? 'No matching bases' : 'No knowledge bases yet.'}
					{#if !searchQuery}
						<br />Click <strong>New</strong> or use a template.
					{/if}
				</p>
			</div>
		{:else}
			<!-- System bases section -->
			{#if systemBases.length > 0 && !searchQuery}
				<div class="mb-2">
					<div class="flex items-center gap-1.5 px-2 py-1">
						<span class="text-xs">🔒</span>
						<span class="text-[10px] font-mono uppercase tracking-wider" style="color: oklch(0.50 0.06 270);">
							System
						</span>
						<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">({systemBases.length})</span>
					</div>
					{#each systemBases as base (base.id)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all duration-150"
							style="
								background: {selectedBaseId === base.id ? 'oklch(0.70 0.18 240 / 0.12)' : 'transparent'};
								border-left: 2px solid {selectedBaseId === base.id ? 'oklch(0.70 0.18 240 / 0.6)' : 'transparent'};
							"
							onclick={() => onSelect(base)}
						>
							<span class="text-sm shrink-0">🔒</span>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium truncate" style="color: {selectedBaseId === base.id ? 'oklch(0.85 0.12 240)' : 'oklch(0.70 0.02 250)'};">
									{base.name}
								</div>
							</div>
							<span
								class="text-[9px] font-mono px-1 py-0.5 rounded shrink-0"
								style="background: oklch(0.40 0.10 270 / 0.2); color: oklch(0.65 0.08 270);"
							>SYSTEM</span>
						</div>
					{/each}
				</div>

				<!-- Divider between system and user bases -->
				{#if displayBases.length > 0}
					<div class="mx-2 mb-2" style="border-bottom: 1px solid oklch(0.22 0.02 250);"></div>
				{/if}
			{/if}

			<!-- User bases — DnD zone when not searching -->
			{#if isSearching}
				{#each displayBases as base (base.id)}
					{@render baseItem(base)}
				{/each}
			{:else}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					use:dndzone={{ items: dndItems, flipDurationMs: 200, dropTargetStyle: { outline: '1px solid oklch(0.55 0.15 240 / 0.4)', borderRadius: '0.375rem' } }}
					onconsider={handleDndConsider}
					onfinalize={handleDndFinalize}
					class="space-y-0.5"
				>
					{#each dndItems as base (base.id)}
						<div animate:flip={{ duration: 200, easing: cubicOut }}>
							{@render baseItem(base)}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

{#snippet baseItem(base: KnowledgeBase)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="group flex items-start gap-2 px-2 py-2 rounded cursor-pointer transition-all duration-150"
		style="
			background: {selectedBaseId === base.id ? 'oklch(0.70 0.18 240 / 0.12)' : 'transparent'};
			border-left: 2px solid {selectedBaseId === base.id ? 'oklch(0.70 0.18 240 / 0.6)' : 'transparent'};
		"
		onclick={() => onSelect(base)}
		oncontextmenu={(e) => handleContextMenu(e, base)}
	>
		<!-- Icon (emoji picker or default) -->
		<div class="shrink-0 mt-0.5" onclick={(e) => e.stopPropagation()}>
			<EmojiPicker
				selected={base.icon ?? null}
				onSelect={(icon) => handleIconSelect(base, icon)}
				size="sm"
			/>
		</div>

		<!-- Name + metadata -->
		<div class="flex-1 min-w-0">
			{#if renamingId === base.id}
				<input
					type="text"
					bind:this={renameInputEl}
					bind:value={renameValue}
					onblur={() => commitRename(base)}
					onkeydown={(e) => handleRenameKeydown(e, base)}
					class="w-full bg-transparent border-none outline-none text-sm font-medium px-0"
					style="color: oklch(0.85 0.02 250);"
				/>
			{:else}
				<div class="flex items-center gap-1.5">
					<div class="text-sm font-medium truncate" style="color: {selectedBaseId === base.id ? 'oklch(0.85 0.12 240)' : 'oklch(0.75 0.02 250)'};">
						{base.name}
					</div>
					{#if base.always_inject}
						<span class="shrink-0 text-[9px] font-mono px-1 py-0.5 rounded" style="background: oklch(0.55 0.15 145 / 0.15); color: oklch(0.70 0.15 145); border: 1px solid oklch(0.55 0.15 145 / 0.25);">AI</span>
					{/if}
				</div>
				<div class="flex items-center gap-1.5 mt-0.5">
					<span class="text-[10px]" style="color: oklch(0.45 0.02 250);">
						{(base.blocks?.length ?? 0)} block{(base.blocks?.length ?? 0) !== 1 ? 's' : ''}
					</span>
					{#if base.token_estimate}
						<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">·</span>
						<span class="text-[10px]" style="color: oklch(0.45 0.02 250);">
							~{formatTokens(base.token_estimate)} tok
						</span>
					{/if}
					<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">·</span>
					<span class="text-[10px]" style="color: oklch(0.45 0.02 250);">
						{formatDate(base.updated_at)}
					</span>
				</div>
			{/if}
		</div>

		<!-- Always-inject toggle (hover visible for non-injected) -->
		<button
			class="shrink-0 mt-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded transition-all duration-150 cursor-pointer {base.always_inject ? '' : 'opacity-0 group-hover:opacity-100'}"
			style="background: {base.always_inject ? 'oklch(0.45 0.15 145 / 0.3)' : 'oklch(0.30 0.01 250)'}; color: {base.always_inject ? 'oklch(0.75 0.15 145)' : 'oklch(0.55 0.01 250)'}; border: none;"
			onclick={(e) => handleToggle(e, base)}
			title={base.always_inject ? 'Always injected into agent prompts (click to disable)' : 'Click to always inject into agent prompts'}
		>
			{base.always_inject ? 'ON' : 'OFF'}
		</button>
	</div>
{/snippet}

<!-- Context Menu -->
{#if ctxBase}
	<div
		class="bases-context-menu"
		class:bases-context-menu-hidden={!ctxVisible}
		style="position: fixed; left: {ctxX}px; top: {ctxY}px; z-index: 50;"
	>
		<button onclick={() => { if (ctxBase) startRename(ctxBase); }}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
			</svg>
			Rename
		</button>
		<button onclick={() => { if (ctxBase) handleDeleteClick(ctxBase); }} style="color: oklch(0.70 0.15 30);">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
			</svg>
			Delete
		</button>
	</div>
{/if}

<style>
	.bases-context-menu {
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 0.25rem;
		min-width: 140px;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
	}

	.bases-context-menu-hidden {
		display: none;
	}

	.bases-context-menu button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: oklch(0.75 0.02 250);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.1s;
	}

	.bases-context-menu button:hover {
		background: oklch(0.28 0.02 250);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
