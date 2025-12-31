<script lang="ts">
	/**
	 * VirtualFileList - Windowed rendering for large directory contents
	 *
	 * Only renders items visible in the viewport plus a buffer,
	 * dramatically improving performance for directories with thousands of files.
	 *
	 * Features:
	 * - Virtual scrolling with fixed item height (28px)
	 * - Overscan buffer for smooth scrolling
	 * - Maintains scroll position on updates
	 * - Falls back to regular rendering for small lists
	 */

	import { onMount, tick } from 'svelte';
	import FileTreeNode from './FileTreeNode.svelte';

	interface DirectoryEntry {
		name: string;
		type: 'file' | 'folder';
		size: number;
		modified: string;
		path: string;
	}

	interface Props {
		entries: DirectoryEntry[];
		project: string;
		selectedPath: string | null;
		expandedFolders: Set<string>;
		loadedFolders: Map<string, DirectoryEntry[]>;
		loadingFolders: Set<string>;
		depth: number;
		onFileSelect: (path: string) => void;
		onToggleFolder: (path: string) => void;
		onContextMenu?: (entry: DirectoryEntry, event: MouseEvent) => void;
		filterTerm?: string;
		maxHeight?: number; // Max height before virtualizing
	}

	let {
		entries,
		project,
		selectedPath,
		expandedFolders,
		loadedFolders,
		loadingFolders,
		depth,
		onFileSelect,
		onToggleFolder,
		onContextMenu,
		filterTerm = '',
		maxHeight = 600
	}: Props = $props();

	// Virtual scrolling config
	const ITEM_HEIGHT = 28; // Height of each row in pixels
	const OVERSCAN = 5; // Extra items to render above/below viewport
	const VIRTUALIZATION_THRESHOLD = 100; // Only virtualize if more than this many items

	// State
	let containerRef: HTMLDivElement | null = $state(null);
	let scrollTop = $state(0);
	let containerHeight = $state(0);

	// Determine if we should virtualize
	const shouldVirtualize = $derived(entries.length > VIRTUALIZATION_THRESHOLD);

	// Calculate visible range
	const visibleRange = $derived(() => {
		if (!shouldVirtualize) {
			return { start: 0, end: entries.length };
		}

		const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
		const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT) + OVERSCAN * 2;
		const endIndex = Math.min(entries.length, startIndex + visibleCount);

		return { start: startIndex, end: endIndex };
	});

	// Get visible entries
	const visibleEntries = $derived(() => {
		const range = visibleRange();
		return entries.slice(range.start, range.end).map((entry, i) => ({
			entry,
			index: range.start + i
		}));
	});

	// Total height for virtual scroll
	const totalHeight = $derived(shouldVirtualize ? entries.length * ITEM_HEIGHT : 'auto');

	// Handle scroll
	function handleScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		scrollTop = target.scrollTop;
	}

	// Update container height on mount and resize
	onMount(() => {
		if (containerRef) {
			containerHeight = containerRef.clientHeight;

			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					containerHeight = entry.contentRect.height;
				}
			});

			resizeObserver.observe(containerRef);

			return () => resizeObserver.disconnect();
		}
	});
</script>

{#if shouldVirtualize}
	<!-- Virtualized rendering for large lists -->
	<div
		bind:this={containerRef}
		class="virtual-list-container"
		style="max-height: {maxHeight}px;"
		onscroll={handleScroll}
	>
		<div class="virtual-list-spacer" style="height: {totalHeight}px;">
			{#each visibleEntries() as { entry, index } (entry.path)}
				<div
					class="virtual-list-item"
					style="transform: translateY({index * ITEM_HEIGHT}px);"
				>
					<FileTreeNode
						{entry}
						{project}
						{selectedPath}
						{expandedFolders}
						{loadedFolders}
						{loadingFolders}
						{depth}
						{onFileSelect}
						{onToggleFolder}
						{onContextMenu}
						{filterTerm}
					/>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<!-- Regular rendering for small lists -->
	<div class="regular-list">
		{#each entries as entry (entry.path)}
			<FileTreeNode
				{entry}
				{project}
				{selectedPath}
				{expandedFolders}
				{loadedFolders}
				{loadingFolders}
				{depth}
				{onFileSelect}
				{onToggleFolder}
				{onContextMenu}
				{filterTerm}
			/>
		{/each}
	</div>
{/if}

<style>
	.virtual-list-container {
		overflow-y: auto;
		position: relative;
	}

	.virtual-list-spacer {
		position: relative;
		width: 100%;
	}

	.virtual-list-item {
		position: absolute;
		left: 0;
		right: 0;
		height: 28px;
	}

	.regular-list {
		/* Regular list doesn't need special styling */
	}
</style>
