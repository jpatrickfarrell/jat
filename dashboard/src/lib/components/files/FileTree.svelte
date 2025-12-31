<script lang="ts">
	/**
	 * FileTree - Container component for displaying project directory structure
	 *
	 * Features:
	 * - Lazy loading: Only fetch folder contents when expanded
	 * - Search/filter input at top
	 * - Highlight currently open file
	 * - Caches loaded folder contents
	 */

	import { onMount } from 'svelte';
	import FileTreeNode from './FileTreeNode.svelte';

	interface DirectoryEntry {
		name: string;
		type: 'file' | 'folder';
		size: number;
		modified: string;
		path: string;
	}

	interface Props {
		project: string;
		selectedPath?: string | null;
		onFileSelect: (path: string) => void;
	}

	let { project, selectedPath = null, onFileSelect }: Props = $props();

	// State
	let rootEntries = $state<DirectoryEntry[]>([]);
	let expandedFolders = $state<Set<string>>(new Set());
	let loadedFolders = $state<Map<string, DirectoryEntry[]>>(new Map());
	let loadingFolders = $state<Set<string>>(new Set());
	let filterTerm = $state('');
	let isLoadingRoot = $state(true);
	let rootError = $state<string | null>(null);

	// Filtered root entries
	const filteredRootEntries = $derived(() => {
		if (!filterTerm) return rootEntries;
		const lowerFilter = filterTerm.toLowerCase();
		return rootEntries.filter(entry => {
			if (entry.name.toLowerCase().includes(lowerFilter)) return true;
			// Include folders that might contain matches
			if (entry.type === 'folder') return true;
			return false;
		});
	});

	// Fetch directory contents
	async function fetchDirectory(path: string = ''): Promise<DirectoryEntry[]> {
		const params = new URLSearchParams({
			project,
			path,
			showHidden: 'false'
		});

		const response = await fetch(`/api/files?${params}`);
		
		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || `Failed to load directory: ${response.status}`);
		}

		const data = await response.json();
		return data.entries || [];
	}

	// Load root directory
	async function loadRoot() {
		isLoadingRoot = true;
		rootError = null;
		
		try {
			rootEntries = await fetchDirectory('');
		} catch (err) {
			rootError = err instanceof Error ? err.message : 'Failed to load directory';
			console.error('[FileTree] Failed to load root:', err);
		} finally {
			isLoadingRoot = false;
		}
	}

	// Toggle folder expansion
	async function handleToggleFolder(path: string) {
		const newExpanded = new Set(expandedFolders);
		
		if (newExpanded.has(path)) {
			// Collapse
			newExpanded.delete(path);
			expandedFolders = newExpanded;
		} else {
			// Expand - load contents if not cached
			newExpanded.add(path);
			expandedFolders = newExpanded;

			if (!loadedFolders.has(path)) {
				// Add to loading state
				const newLoading = new Set(loadingFolders);
				newLoading.add(path);
				loadingFolders = newLoading;

				try {
					const entries = await fetchDirectory(path);
					const newLoaded = new Map(loadedFolders);
					newLoaded.set(path, entries);
					loadedFolders = newLoaded;
				} catch (err) {
					console.error(`[FileTree] Failed to load folder ${path}:`, err);
					// Remove from expanded on error
					const revertExpanded = new Set(expandedFolders);
					revertExpanded.delete(path);
					expandedFolders = revertExpanded;
				} finally {
					const removeLoading = new Set(loadingFolders);
					removeLoading.delete(path);
					loadingFolders = removeLoading;
				}
			}
		}
	}

	// Handle file selection
	function handleFileSelect(path: string) {
		onFileSelect(path);
	}

	// Clear filter
	function clearFilter() {
		filterTerm = '';
	}

	// Reload tree when project changes
	$effect(() => {
		if (project) {
			// Reset state
			expandedFolders = new Set();
			loadedFolders = new Map();
			loadingFolders = new Set();
			filterTerm = '';
			loadRoot();
		}
	});

	onMount(() => {
		if (project) {
			loadRoot();
		}
	});
</script>

<div class="file-tree">
	<!-- Search/Filter Input -->
	<div class="filter-container">
		<div class="filter-input-wrapper">
			<svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8" />
				<path d="M21 21l-4.35-4.35" />
			</svg>
			<input
				type="text"
				class="filter-input"
				placeholder="Filter files..."
				bind:value={filterTerm}
			/>
			{#if filterTerm}
				<button class="clear-filter" onclick={clearFilter} title="Clear filter">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Tree Content -->
	<div class="tree-content">
		{#if isLoadingRoot}
			<div class="tree-loading">
				<span class="loading-spinner"></span>
				<span class="loading-text">Loading...</span>
			</div>
		{:else if rootError}
			<div class="tree-error">
				<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 8v4M12 16h.01" />
				</svg>
				<span class="error-text">{rootError}</span>
				<button class="retry-button" onclick={loadRoot}>
					Retry
				</button>
			</div>
		{:else if rootEntries.length === 0}
			<div class="tree-empty">
				<span class="empty-text">No files found</span>
			</div>
		{:else}
			<div class="tree-nodes">
				{#each filteredRootEntries() as entry (entry.path)}
					<FileTreeNode
						{entry}
						{project}
						{selectedPath}
						{expandedFolders}
						{loadedFolders}
						{loadingFolders}
						depth={0}
						{onFileSelect}
						onToggleFolder={handleToggleFolder}
						{filterTerm}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.file-tree {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	/* Filter Input */
	.filter-container {
		padding: 0.5rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
	}

	.filter-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.375rem;
		padding: 0.375rem 0.5rem;
		transition: border-color 0.15s ease;
	}

	.filter-input-wrapper:focus-within {
		border-color: oklch(0.65 0.12 220);
	}

	.filter-icon {
		width: 14px;
		height: 14px;
		color: oklch(0.50 0.02 250);
		flex-shrink: 0;
	}

	.filter-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.8125rem;
		color: oklch(0.80 0.02 250);
	}

	.filter-input::placeholder {
		color: oklch(0.45 0.02 250);
	}

	.clear-filter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 0.15s ease;
	}

	.clear-filter:hover {
		opacity: 1;
	}

	.clear-filter svg {
		width: 12px;
		height: 12px;
		color: oklch(0.60 0.02 250);
	}

	/* Tree Content */
	.tree-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0.25rem;
	}

	.tree-nodes {
		padding-bottom: 0.5rem;
	}

	/* Loading State */
	.tree-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		gap: 0.75rem;
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid oklch(0.30 0.02 250);
		border-top-color: oklch(0.65 0.12 220);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
	}

	/* Error State */
	.tree-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		gap: 0.5rem;
		text-align: center;
	}

	.error-icon {
		width: 24px;
		height: 24px;
		color: oklch(0.60 0.12 30);
	}

	.error-text {
		font-size: 0.75rem;
		color: oklch(0.55 0.08 30);
		max-width: 200px;
	}

	.retry-button {
		margin-top: 0.5rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(0.80 0.02 250);
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.retry-button:hover {
		background: oklch(0.25 0.02 250);
		border-color: oklch(0.35 0.02 250);
	}

	/* Empty State */
	.tree-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.empty-text {
		font-size: 0.75rem;
		color: oklch(0.45 0.02 250);
	}
</style>
