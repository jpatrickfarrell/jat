<script lang="ts">
	/**
	 * FileTreeNode - Recursive component for folder/file nodes
	 *
	 * Features:
	 * - Click folder → toggle expand/collapse
	 * - Click file → emit onFileSelect(path)
	 * - Loading spinner while fetching folder contents
	 * - File type icons based on extension
	 * - Performance: "Show more" for large directories (100+ items)
	 */

	import { slide } from 'svelte/transition';
	import { GIT_STATUS_VISUALS, getFileIconDef, type GitFileStatus } from './types';
	import FileTreeNode from './FileTreeNode.svelte';

	interface DirectoryEntry {
		name: string;
		type: 'file' | 'folder';
		size: number;
		modified: string;
		path: string;
	}

	interface Props {
		entry: DirectoryEntry;
		project: string;
		selectedPath: string | null;
		expandedFolders: Set<string>;
		loadedFolders: Map<string, DirectoryEntry[]>;
		loadingFolders: Set<string>;
		gitStatusMap?: Map<string, GitFileStatus>;
		depth?: number;
		onFileSelect: (path: string) => void;
		onToggleFolder: (path: string) => void;
		onContextMenu?: (entry: DirectoryEntry, event: MouseEvent) => void;
		filterTerm?: string;
		onFolderHover?: (path: string) => void;
		onFolderHoverEnd?: () => void;
		onFileMove?: (sourcePath: string, destinationFolder: string) => void;
		draggedPath?: string | null;
		onDragStart?: (path: string) => void;
		onDragEnd?: () => void;
	}

	// Performance: Limit initial children shown for large folders
	const INITIAL_VISIBLE_LIMIT = 100;
	const LOAD_MORE_INCREMENT = 100;

	let {
		entry,
		project,
		selectedPath,
		expandedFolders,
		loadedFolders,
		loadingFolders,
		gitStatusMap = new Map(),
		depth = 0,
		onFileSelect,
		onToggleFolder,
		onContextMenu,
		filterTerm = '',
		onFolderHover,
		onFolderHoverEnd,
		onFileMove,
		draggedPath = null,
		onDragStart,
		onDragEnd
	}: Props = $props();

	// Get git status for this entry
	const gitStatus = $derived(gitStatusMap.get(entry.path));
	const gitVisuals = $derived(gitStatus ? GIT_STATUS_VISUALS[gitStatus] : null);

	// Track how many children to show (for large folders)
	let visibleChildCount = $state(INITIAL_VISIBLE_LIMIT);

	// Computed states
	const isFolder = $derived(entry.type === 'folder');
	const isExpanded = $derived(expandedFolders.has(entry.path));
	const isLoading = $derived(loadingFolders.has(entry.path));
	const isSelected = $derived(selectedPath === entry.path);
	const isActiveFolder = $derived(isFolder && selectedPath !== null && selectedPath.startsWith(entry.path + '/') && !selectedPath.slice(entry.path.length + 1).includes('/'));
	const children = $derived(loadedFolders.get(entry.path) || []);

	// Filter children based on filter term
	const filteredChildren = $derived(() => {
		let result = children;

		// Apply filter if present
		if (filterTerm) {
			const lowerFilter = filterTerm.toLowerCase();
			result = result.filter(child => {
				// Include if name matches
				if (child.name.toLowerCase().includes(lowerFilter)) return true;
				// Include folders that might have matching children (we check at render time)
				if (child.type === 'folder') return true;
				return false;
			});
		}

		return result;
	});

	// Visible children (with limit applied for performance)
	const visibleChildren = $derived(() => {
		const all = filteredChildren();
		return all.slice(0, visibleChildCount);
	});

	// Check if there are more children to show
	const hasMoreChildren = $derived(() => {
		return filteredChildren().length > visibleChildCount;
	});

	// Remaining count
	const remainingCount = $derived(() => {
		return filteredChildren().length - visibleChildCount;
	});

	// Reset visible count when folder changes or filter changes
	$effect(() => {
		// When entry path or filter changes, reset to initial limit
		const _ = entry.path;
		const __ = filterTerm;
		visibleChildCount = INITIAL_VISIBLE_LIMIT;
	});

	// Show more children
	function showMoreChildren() {
		visibleChildCount += LOAD_MORE_INCREMENT;
	}

	// SVG path constants (Heroicons outline, 24px viewBox)
	const PATH_CODE     = 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5';
	const PATH_DOC      = 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z';
	const PATH_CONFIG   = 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75';
	const PATH_IMAGE    = 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z';
	const PATH_TERMINAL = 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z';
	const PATH_LOCK     = 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z';
	const PATH_KEY      = 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z';
	const PATH_DB       = 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125';
	const PATH_PACKAGE  = 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9';

	interface IconDef { d: string; color: string }

	function getFileIconDef(filename: string): IconDef {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		const name = filename.toLowerCase();

		// Special files
		if (name === 'package.json' || name === 'package-lock.json')
			return { d: PATH_PACKAGE,  color: 'oklch(0.68 0.14 85)' };
		if (name === 'tsconfig.json' || name === '.eslintrc' || name === '.eslintrc.json' || name === '.prettierrc' || name === 'vite.config.ts' || name === 'vite.config.js')
			return { d: PATH_CONFIG,   color: 'oklch(0.60 0.08 250)' };
		if (name === '.gitignore' || name === '.gitattributes')
			return { d: PATH_DOC,      color: 'oklch(0.55 0.06 30)' };
		if (name === 'readme.md' || name === 'claude.md' || name === 'agents.md')
			return { d: PATH_DOC,      color: 'oklch(0.65 0.10 200)' };
		if (name === 'dockerfile' || name.startsWith('dockerfile.'))
			return { d: PATH_TERMINAL, color: 'oklch(0.60 0.12 220)' };
		if (name === 'license' || name === 'license.md' || name === 'license.txt')
			return { d: PATH_DOC,      color: 'oklch(0.55 0.05 250)' };
		if (name.startsWith('.env'))
			return { d: PATH_KEY,      color: 'oklch(0.65 0.15 25)' };

		// By extension
		const map: Record<string, IconDef> = {
			// TypeScript
			ts:   { d: PATH_CODE,     color: 'oklch(0.65 0.16 240)' },
			tsx:  { d: PATH_CODE,     color: 'oklch(0.65 0.16 200)' },
			mts:  { d: PATH_CODE,     color: 'oklch(0.65 0.16 240)' },
			cts:  { d: PATH_CODE,     color: 'oklch(0.65 0.16 240)' },
			// JavaScript
			js:   { d: PATH_CODE,     color: 'oklch(0.72 0.15 85)' },
			jsx:  { d: PATH_CODE,     color: 'oklch(0.72 0.15 200)' },
			mjs:  { d: PATH_CODE,     color: 'oklch(0.72 0.15 85)' },
			cjs:  { d: PATH_CODE,     color: 'oklch(0.72 0.15 85)' },
			// Web frameworks
			svelte: { d: PATH_CODE,   color: 'oklch(0.65 0.15 45)' },
			vue:    { d: PATH_CODE,   color: 'oklch(0.65 0.15 145)' },
			html:   { d: PATH_CODE,   color: 'oklch(0.65 0.12 30)' },
			htm:    { d: PATH_CODE,   color: 'oklch(0.65 0.12 30)' },
			// Styles
			css:  { d: PATH_CODE,     color: 'oklch(0.65 0.14 290)' },
			scss: { d: PATH_CODE,     color: 'oklch(0.65 0.14 310)' },
			less: { d: PATH_CODE,     color: 'oklch(0.65 0.14 270)' },
			// Data / config
			json: { d: PATH_CONFIG,   color: 'oklch(0.68 0.10 200)' },
			yaml: { d: PATH_CONFIG,   color: 'oklch(0.65 0.10 145)' },
			yml:  { d: PATH_CONFIG,   color: 'oklch(0.65 0.10 145)' },
			toml: { d: PATH_CONFIG,   color: 'oklch(0.65 0.10 30)' },
			xml:  { d: PATH_CONFIG,   color: 'oklch(0.60 0.08 250)' },
			// Docs
			md:   { d: PATH_DOC,      color: 'oklch(0.65 0.08 200)' },
			mdx:  { d: PATH_DOC,      color: 'oklch(0.65 0.08 200)' },
			txt:  { d: PATH_DOC,      color: 'oklch(0.55 0.03 250)' },
			// Shell
			sh:   { d: PATH_TERMINAL, color: 'oklch(0.65 0.14 145)' },
			bash: { d: PATH_TERMINAL, color: 'oklch(0.65 0.14 145)' },
			zsh:  { d: PATH_TERMINAL, color: 'oklch(0.65 0.14 145)' },
			fish: { d: PATH_TERMINAL, color: 'oklch(0.65 0.14 145)' },
			// Languages
			py:   { d: PATH_CODE,     color: 'oklch(0.65 0.14 220)' },
			go:   { d: PATH_CODE,     color: 'oklch(0.65 0.14 200)' },
			rs:   { d: PATH_CODE,     color: 'oklch(0.65 0.12 30)' },
			rb:   { d: PATH_CODE,     color: 'oklch(0.65 0.15 10)' },
			php:  { d: PATH_CODE,     color: 'oklch(0.60 0.10 280)' },
			java: { d: PATH_CODE,     color: 'oklch(0.65 0.12 30)' },
			kt:   { d: PATH_CODE,     color: 'oklch(0.65 0.14 280)' },
			swift:{ d: PATH_CODE,     color: 'oklch(0.68 0.14 25)' },
			c:    { d: PATH_CODE,     color: 'oklch(0.60 0.10 240)' },
			cpp:  { d: PATH_CODE,     color: 'oklch(0.60 0.10 240)' },
			h:    { d: PATH_CODE,     color: 'oklch(0.60 0.08 240)' },
			cs:   { d: PATH_CODE,     color: 'oklch(0.60 0.12 280)' },
			// Config/lock
			lock: { d: PATH_LOCK,     color: 'oklch(0.62 0.10 85)' },
			// Images
			png:  { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			jpg:  { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			jpeg: { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			gif:  { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			svg:  { d: PATH_IMAGE,    color: 'oklch(0.65 0.12 45)' },
			ico:  { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			webp: { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			avif: { d: PATH_IMAGE,    color: 'oklch(0.65 0.10 280)' },
			// Data
			sql:  { d: PATH_DB,       color: 'oklch(0.62 0.10 200)' },
			db:   { d: PATH_DB,       color: 'oklch(0.62 0.10 200)' },
			// Misc
			log:  { d: PATH_DOC,      color: 'oklch(0.50 0.04 250)' },
			pdf:  { d: PATH_DOC,      color: 'oklch(0.65 0.15 25)' },
			env:  { d: PATH_KEY,      color: 'oklch(0.65 0.15 25)' },
		};

		return map[ext] ?? { d: PATH_DOC, color: 'oklch(0.50 0.03 250)' };
	}

	function handleClick() {
		if (isFolder) {
			onToggleFolder(entry.path);
		} else {
			onFileSelect(entry.path);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (onContextMenu) {
			onContextMenu(entry, e);
		}
	}

	// Handle folder hover for preloading
	function handleMouseEnter() {
		if (isFolder && !isExpanded && onFolderHover) {
			onFolderHover(entry.path);
		}
	}

	function handleMouseLeave() {
		if (isFolder && onFolderHoverEnd) {
			onFolderHoverEnd();
		}
	}

	// Drag-and-drop state
	let isDragOver = $state(false);

	// Is this node the one being dragged?
	const isBeingDragged = $derived(draggedPath === entry.path);

	// Can this folder accept a drop? (is a folder, not the source or its parent)
	function canAcceptDrop(sourcePath: string): boolean {
		if (!isFolder) return false;
		// Can't drop onto itself
		if (entry.path === sourcePath) return false;
		// Can't drop into its own parent (same location = no-op)
		const sourceParent = sourcePath.includes('/') ? sourcePath.substring(0, sourcePath.lastIndexOf('/')) : '';
		if (entry.path === sourceParent) return false;
		// Can't drop a folder into itself or a subfolder of itself
		if (entry.path.startsWith(sourcePath + '/')) return false;
		return true;
	}

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', entry.path);
		e.dataTransfer.setData('application/x-filetree-path', entry.path);
		if (onDragStart) onDragStart(entry.path);
	}

	function handleDragEnd() {
		isDragOver = false;
		if (onDragEnd) onDragEnd();
	}

	function handleDragOver(e: DragEvent) {
		if (!e.dataTransfer) return;
		const sourcePath = draggedPath;
		if (!sourcePath || !canAcceptDrop(sourcePath)) return;
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'move';
		isDragOver = true;
	}

	function handleDragEnter(e: DragEvent) {
		if (!e.dataTransfer) return;
		const sourcePath = draggedPath;
		if (!sourcePath || !canAcceptDrop(sourcePath)) return;
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(e: DragEvent) {
		// Only clear if leaving the node itself, not entering a child
		const relatedTarget = e.relatedTarget as HTMLElement | null;
		const currentTarget = e.currentTarget as HTMLElement;
		if (relatedTarget && currentTarget.contains(relatedTarget)) return;
		isDragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = false;
		if (!e.dataTransfer) return;
		const sourcePath = e.dataTransfer.getData('application/x-filetree-path') || e.dataTransfer.getData('text/plain');
		if (!sourcePath || !canAcceptDrop(sourcePath)) return;
		if (onFileMove) onFileMove(sourcePath, entry.path);
	}
</script>

<div class="tree-node" style="--depth: {depth};">
	<!-- Node row -->
	<button
		class="node-row"
		class:folder={isFolder}
		class:file={!isFolder}
		class:expanded={isExpanded}
		class:selected={isSelected}
		class:active-folder={isActiveFolder}
		class:loading={isLoading}
		class:drag-over={isDragOver}
		class:being-dragged={isBeingDragged}
		draggable="true"
		onclick={handleClick}
		onkeydown={handleKeyDown}
		oncontextmenu={handleContextMenu}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		ondragstart={handleDragStart}
		ondragend={handleDragEnd}
		ondragover={handleDragOver}
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		title={entry.path}
		aria-expanded={isFolder ? isExpanded : undefined}
		data-path={entry.path}
		data-nav-id={entry.path}
		data-type={entry.type}
	>
		<!-- Indentation -->
		<span class="indent" style="width: {depth * 16}px"></span>

		<!-- Expand arrow for folders -->
		{#if isFolder}
			<span class="arrow" class:expanded={isExpanded}>
				{#if isLoading}
					<span class="loading-spinner"></span>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 18l6-6-6-6" />
					</svg>
				{/if}
			</span>
		{:else}
			<span class="arrow-placeholder"></span>
		{/if}

		<!-- Icon -->
		<span class="icon">
			{#if isFolder}
				<svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
					stroke={isExpanded ? 'oklch(0.72 0.12 85)' : 'oklch(0.62 0.10 85)'}>
					{#if isExpanded}
						<path d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"/>
					{:else}
						<path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
					{/if}
				</svg>
			{:else}
				{@const iconDef = getFileIconDef(entry.name)}
				<svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke={iconDef.color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d={iconDef.d}/>
				</svg>
			{/if}
		</span>

		<!-- Name -->
		<span class="name" class:highlighted={filterTerm && entry.name.toLowerCase().includes(filterTerm.toLowerCase())}>
			{entry.name}
		</span>

		<!-- Git status indicator -->
		{#if gitVisuals}
			<span
				class="git-status-badge"
				style="color: {gitVisuals.color}; border-color: {gitVisuals.color};"
				title="{gitVisuals.label}: {entry.name}"
			>
				{gitVisuals.letter}
			</span>
		{/if}
	</button>

	<!-- Children (if folder is expanded) -->
	{#if isFolder && isExpanded && children.length > 0}
		<div class="children" transition:slide={{ duration: 150 }}>
			{#each visibleChildren() as child (child.path)}
				<FileTreeNode
					entry={child}
					{project}
					{selectedPath}
					{expandedFolders}
					{loadedFolders}
					{loadingFolders}
					{gitStatusMap}
					depth={depth + 1}
					{onFileSelect}
					{onToggleFolder}
					{onContextMenu}
					{filterTerm}
					{onFolderHover}
					{onFolderHoverEnd}
					{onFileMove}
					{draggedPath}
					{onDragStart}
					{onDragEnd}
				/>
			{/each}
			{#if hasMoreChildren()}
				<button class="show-more-btn" onclick={showMoreChildren}>
					<span class="show-more-icon">···</span>
					<span class="show-more-text">Show {Math.min(remainingCount(), LOAD_MORE_INCREMENT)} more ({remainingCount()} remaining)</span>
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.tree-node {
		user-select: none;
	}

	.node-row {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.25rem 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.8125rem;
		color: oklch(0.75 0.02 250);
		text-align: left;
		border-radius: 0.25rem;
		transition: background 0.1s ease;
		gap: 0.25rem;
	}

	.node-row:hover {
		background: oklch(0.22 0.02 250);
	}

	.node-row.selected {
		background: oklch(0.65 0.12 220 / 0.2);
		color: oklch(0.85 0.08 220);
	}

	.node-row.selected:hover {
		background: oklch(0.65 0.12 220 / 0.25);
	}

	.node-row.active-folder {
		background: oklch(0.55 0.06 250 / 0.15);
	}

	.node-row.active-folder:hover {
		background: oklch(0.55 0.06 250 / 0.22);
	}

	.node-row.folder {
		font-weight: 500;
	}

	.indent {
		flex-shrink: 0;
	}

	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.arrow svg {
		width: 12px;
		height: 12px;
		color: oklch(0.55 0.02 250);
	}

	.arrow.expanded {
		transform: rotate(90deg);
	}

	.arrow-placeholder {
		width: 16px;
		flex-shrink: 0;
	}

	.loading-spinner {
		width: 12px;
		height: 12px;
		border: 2px solid oklch(0.35 0.02 250);
		border-top-color: oklch(0.65 0.12 220);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.icon {
		flex-shrink: 0;
		width: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.file-icon {
		width: 14px;
		height: 14px;
	}

	.name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name.highlighted {
		background: oklch(0.65 0.15 85 / 0.3);
		border-radius: 2px;
		padding: 0 2px;
		margin: 0 -2px;
	}

	/* Git status badge */
	.git-status-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
		font-weight: 700;
		font-family: ui-monospace, 'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace;
		min-width: 14px;
		height: 14px;
		padding: 0 2px;
		border-radius: 3px;
		border: 1px solid;
		background: transparent;
		margin-left: auto;
		flex-shrink: 0;
		opacity: 0.9;
		transition: opacity 0.1s ease;
	}

	.node-row:hover .git-status-badge {
		opacity: 1;
	}

	/* Drag-and-drop styles */
	.node-row.drag-over {
		background: oklch(0.55 0.15 220 / 0.25);
		outline: 2px dashed oklch(0.65 0.15 220);
		outline-offset: -2px;
		border-radius: 0.25rem;
	}

	.node-row.being-dragged {
		opacity: 0.4;
	}

	.children {
		/* Subtle left border to show hierarchy */
		margin-left: 0.5rem;
		border-left: 1px solid oklch(0.25 0.02 250);
		padding-left: 0.25rem;
	}

	/* Show more button for large directories */
	.show-more-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.75rem;
		color: oklch(0.55 0.12 220);
		text-align: left;
		border-radius: 0.25rem;
		transition: all 0.15s ease;
		margin-top: 0.125rem;
	}

	.show-more-btn:hover {
		background: oklch(0.55 0.12 220 / 0.1);
		color: oklch(0.65 0.15 220);
	}

	.show-more-icon {
		font-size: 1rem;
		letter-spacing: 0.1em;
		color: oklch(0.50 0.08 220);
	}

	.show-more-text {
		font-weight: 500;
	}
</style>
