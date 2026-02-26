<script lang="ts">
	/**
	 * Source Control Page - Git and Supabase Migrations
	 *
	 * Layout (emulates VSCode source control):
	 * - Header: Project selector + mode toggle (Git | Supabase)
	 * - Left panel: Git changes panel OR Supabase migrations panel
	 * - Right panel: Diff viewer OR Migration SQL viewer
	 *
	 * State:
	 * - selectedProject: synced with URL param ?project=<name>
	 * - activeMode: 'git' | 'supabase' - controls which panel to show
	 * - selectedFile: currently selected file for diff viewing (Git mode)
	 */

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import GitPanel from '$lib/components/files/GitPanel.svelte';
	import DiffViewer from '$lib/components/files/DiffViewer.svelte';
	import FileTabBar from '$lib/components/files/FileTabBar.svelte';
	import SupabasePanel from '$lib/components/files/SupabasePanel.svelte';
	import MigrationViewer from '$lib/components/files/MigrationViewer.svelte';
	import CloudflarePanel from '$lib/components/files/CloudflarePanel.svelte';
	import type { DeploymentItem } from '$lib/components/files/CloudflarePanel.svelte';
	import ResizableDivider from '$lib/components/ResizableDivider.svelte';
	import { FilesSkeleton } from '$lib/components/skeleton';
	import type { OpenFile } from '$lib/components/files/types';

	// Types
	interface Project {
		name: string;
		displayName: string;
		path: string;
		port: number | null;
		description: string | null;
		activeColor: string | null;
	}

	// State
	let projects = $state<Project[]>([]);
	let selectedProject = $state<string | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Mode toggle: 'git', 'supabase', or 'cloudflare'
	type SourceMode = 'git' | 'supabase' | 'cloudflare';
	let activeMode = $state<SourceMode>('git');

	// Git mode state: selected file for diff view
	let selectedFilePath = $state<string | null>(null);
	let selectedFileIsStaged = $state(false);

	// Commit view state: files from expanded commit shown as tabs in right panel
	interface FileChange {
		path: string;
		type: 'A' | 'M' | 'D' | 'R' | 'C' | 'U';
		additions: number;
		deletions: number;
		binary: boolean;
	}
	let commitViewHash = $state<string | null>(null);
	let commitOpenFiles = $state<OpenFile[]>([]);
	let activeCommitFilePath = $state<string | null>(null);

	// Supabase mode state: selected migration for viewing
	let selectedMigrationContent = $state<string>('');
	let selectedMigrationTitle = $state<string>('');
	let selectedMigrationFilename = $state<string>('');
	let isDiff = $state(false);

	// Supabase project detection
	let hasSupabase = $state(false);

	// Cloudflare project detection
	let hasCloudflare = $state(false);

	// Cloudflare mode state: selected deployment for detail view
	let selectedDeployment = $state<DeploymentItem | null>(null);

	// CloudflarePanel ref for parent controls
	let cfPanelRef: { getState: () => { totalCount: number; envFilter: string; isLoading: boolean }; setEnvFilter: (v: string) => void; refresh: () => void } | undefined = $state(undefined);
	let cfTotalCount = $state(0);
	let cfEnvFilter = $state('');
	let cfIsLoading = $state(false);

	// Layout state
	let leftPanelWidth = $state(520);
	const MIN_PANEL_WIDTH = 200;
	const MAX_PANEL_WIDTH_FALLBACK = 900;

	// Mobile layout state
	let isMobileLayout = $state(false);
	let topPanelHeight = $state(40);
	const MOBILE_BREAKPOINT = 768;
	const MIN_PANEL_HEIGHT_PERCENT = 15;
	const MAX_PANEL_HEIGHT_PERCENT = 70;

	// Divider drag state
	let isDragging = $state(false);
	let startX = $state(0);
	let startWidth = $state(0);

	// Container ref for mobile layout
	let containerRef: HTMLDivElement | null = $state(null);

	function handleDividerMouseDown(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;
		startX = e.clientX;
		startWidth = leftPanelWidth;

		document.addEventListener('mousemove', handleDividerMouseMove);
		document.addEventListener('mouseup', handleDividerMouseUp);
	}

	function handleDividerMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const deltaX = e.clientX - startX;
		let newWidth = startWidth + deltaX;
		const maxWidth = Math.max(MAX_PANEL_WIDTH_FALLBACK, window.innerWidth * 0.8);
		newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(maxWidth, newWidth));
		leftPanelWidth = newWidth;
	}

	function handleDividerMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleDividerMouseMove);
		document.removeEventListener('mouseup', handleDividerMouseUp);
	}

	function handleMobileResize(deltaY: number) {
		if (!containerRef) return;
		const containerHeight = containerRef.offsetHeight;
		const deltaPercent = (deltaY / containerHeight) * 100;
		let newHeight = topPanelHeight + deltaPercent;
		newHeight = Math.max(MIN_PANEL_HEIGHT_PERCENT, Math.min(MAX_PANEL_HEIGHT_PERCENT, newHeight));
		topPanelHeight = newHeight;
	}

	// Sync selectedProject from URL query parameter
	$effect(() => {
		const projectParam = $page.url.searchParams.get('project');
		if (projectParam && projects.length > 0) {
			const projectExists = projects.some(p => p.name === projectParam);
			if (projectExists && selectedProject !== projectParam) {
				selectedProject = projectParam;
				// Clear selected file when changing projects
				selectedFilePath = null;
			}
		}
	});

	// Fetch visible projects
	async function fetchProjects() {
		try {
			// Include stats=true to get projects sorted by last activity (most recent first)
			const response = await fetch('/api/projects?visible=true&stats=true');
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to load projects');
			}

			projects = data.projects || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load projects';
			console.error('[Git] Failed to fetch projects:', err);
		} finally {
			isLoading = false;
		}
	}

	// Handle file click from GitPanel (working tree file)
	function handleFileClick(filePath: string, isStaged: boolean) {
		selectedFilePath = filePath;
		selectedFileIsStaged = isStaged;
		// Clear commit view (mutually exclusive)
		commitViewHash = null;
		commitOpenFiles = [];
		activeCommitFilePath = null;
	}

	// Handle commit selection from GitPanel (inline expansion)
	function handleCommitSelect(commitHash: string, files: FileChange[], proj: string) {
		commitViewHash = commitHash;
		// Sort binary files to end so text diffs are shown first
		const sorted = [...files].sort((a, b) => (a.binary ? 1 : 0) - (b.binary ? 1 : 0));
		commitOpenFiles = sorted.map(f => ({
			path: f.path,
			content: '',
			originalContent: '',
			dirty: false
		}));
		// Select first non-binary file (or first file if all binary)
		const firstText = sorted.find(f => !f.binary);
		activeCommitFilePath = (firstText ?? sorted[0])?.path ?? null;
		// Clear working tree selection (mutually exclusive)
		selectedFilePath = null;
	}

	// Handle rebase completion from GitPanel (clear commit expansion state)
	function handleRebaseComplete() {
		commitViewHash = null;
		commitOpenFiles = [];
		activeCommitFilePath = null;
	}

	// Handle stage file
	async function handleStageFile(path: string) {
		if (!selectedProject) return;

		try {
			const response = await fetch('/api/files/git/stage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: selectedProject, paths: [path] })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to stage file');
			}

			// Update the staged state if this is the selected file
			if (selectedFilePath === path) {
				selectedFileIsStaged = true;
			}
		} catch (err) {
			console.error('[Git] Failed to stage file:', err);
		}
	}

	// Handle unstage file
	async function handleUnstageFile(path: string) {
		if (!selectedProject) return;

		try {
			const response = await fetch('/api/files/git/unstage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: selectedProject, paths: [path] })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to unstage file');
			}

			// Update the staged state if this is the selected file
			if (selectedFilePath === path) {
				selectedFileIsStaged = false;
			}
		} catch (err) {
			console.error('[Git] Failed to unstage file:', err);
		}
	}

	// Clear selected file
	function handleClearSelection() {
		selectedFilePath = null;
		commitViewHash = null;
		commitOpenFiles = [];
		activeCommitFilePath = null;
	}

	// Clear Supabase migration selection
	function handleClearMigration() {
		selectedMigrationContent = '';
		selectedMigrationTitle = '';
		selectedMigrationFilename = '';
		isDiff = false;
	}

	// Handle migration selection from SupabasePanel
	function handleMigrationSelect(content: string, title: string, filename: string, isSchDiff: boolean) {
		selectedMigrationContent = content;
		selectedMigrationTitle = title;
		selectedMigrationFilename = filename;
		isDiff = isSchDiff;
	}

	// Check if project has Supabase
	async function checkSupabase(projectName: string) {
		try {
			const response = await fetch(`/api/supabase/status?project=${encodeURIComponent(projectName)}`);
			if (response.ok) {
				const data = await response.json();
				hasSupabase = data.hasSupabase || false;
			} else {
				hasSupabase = false;
			}
		} catch {
			hasSupabase = false;
		}
	}

	// Check if project has Cloudflare Pages
	async function checkCloudflare(projectName: string) {
		try {
			const response = await fetch(`/api/cloudflare/status?project=${encodeURIComponent(projectName)}`);
			if (response.ok) {
				const data = await response.json();
				hasCloudflare = data.hasCloudflare || false;
			} else {
				hasCloudflare = false;
			}
		} catch {
			hasCloudflare = false;
		}
	}

	// Handle deployment selection from CloudflarePanel
	function handleDeploymentSelect(deployment: DeploymentItem) {
		selectedDeployment = deployment;
	}

	// Clear Cloudflare deployment selection
	function handleClearDeployment() {
		selectedDeployment = null;
	}

	// Switch mode
	function switchMode(mode: SourceMode) {
		activeMode = mode;
		// Clear selections when switching
		if (mode === 'git') {
			handleClearMigration();
			handleClearDeployment();
		} else if (mode === 'supabase') {
			handleClearSelection();
			handleClearDeployment();
		} else {
			handleClearSelection();
			handleClearMigration();
		}
	}

	// Effect: Check supabase and cloudflare when project changes
	$effect(() => {
		if (selectedProject) {
			checkSupabase(selectedProject);
			checkCloudflare(selectedProject);
			// Reset mode to git when project changes
			activeMode = 'git';
			handleClearSelection();
			handleClearMigration();
			handleClearDeployment();
		}
	});

	// Sync CF panel state to local vars for the header controls
	function syncCfState() {
		if (cfPanelRef) {
			const s = cfPanelRef.getState();
			cfTotalCount = s.totalCount;
			cfEnvFilter = s.envFilter;
			cfIsLoading = s.isLoading;
		}
	}

	onMount(() => {
		fetchProjects();

		// Poll CF state while in cloudflare mode (lightweight — just reads local vars)
		const cfInterval = setInterval(() => {
			if (activeMode === 'cloudflare') syncCfState();
		}, 500);


		function handleResize() {
			isMobileLayout = window.innerWidth < MOBILE_BREAKPOINT;
		}
		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			clearInterval(cfInterval);
		};
	});
</script>

<svelte:head>
	<title>Source Control | JAT IDE</title>
	<meta name="description" content="Git source control view with staged/unstaged changes and side-by-side diff viewer." />
	<meta property="og:title" content="Source Control | JAT IDE" />
	<meta property="og:description" content="Git source control view with staged/unstaged changes and side-by-side diff viewer." />
	<meta property="og:image" content="/favicons/source.svg" />
	<link rel="icon" href="/favicons/source.svg" />
</svelte:head>

<div class="git-page" style="background: oklch(0.14 0.01 250);">
	{#if isLoading}
		<FilesSkeleton treeItems={12} tabs={3} />
	{:else if error}
		<div class="git-content error-state" transition:fade={{ duration: 150 }}>
			<div class="error-icon">
				<svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>
			<h2 class="error-title">Failed to load projects</h2>
			<p class="error-message">{error}</p>
			<button class="btn btn-primary btn-sm mt-4" onclick={() => { error = null; isLoading = true; fetchProjects(); }}>
				Retry
			</button>
		</div>
	{:else if projects.length === 0}
		<div class="git-content empty-state" transition:fade={{ duration: 150 }}>
			<div class="empty-icon">
				<svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
				</svg>
			</div>
			<h2 class="empty-title">No Projects Available</h2>
			<p class="empty-hint">Add a project in the Config tab to get started</p>
		</div>
	{:else}
		<div class="git-content" transition:fade={{ duration: 150 }}>
			<div class="git-body" class:mobile-layout={isMobileLayout} bind:this={containerRef}>
				<!-- Left Panel: Git Changes -->
				<div
					class="git-panel-left"
					style="{isMobileLayout ? `height: ${topPanelHeight}%` : `width: ${leftPanelWidth}px`};"
				>
					<!-- Source Control Header -->
					<div class="panel-title-header">
						{#if hasSupabase || hasCloudflare}
							<!-- Multi-mode: tabs left, controls right -->
							<div class="mode-toggle">
								<button
									class="mode-btn"
									class:active={activeMode === 'git'}
									onclick={() => switchMode('git')}
									title="Git Source Control"
								>
									<svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<line x1="6" y1="3" x2="6" y2="15"></line>
										<circle cx="18" cy="6" r="3"></circle>
										<circle cx="6" cy="18" r="3"></circle>
										<path d="M18 9a9 9 0 0 1-9 9"></path>
									</svg>
									Git
								</button>
								{#if hasSupabase}
									<button
										class="mode-btn"
										class:active={activeMode === 'supabase'}
										onclick={() => switchMode('supabase')}
										title="Supabase Migrations"
									>
										<svg class="mode-icon" viewBox="0 0 24 24" fill="currentColor">
											<path d="M13.5 3L6 14h6l-1.5 7L18 10h-6l1.5-7z"/>
										</svg>
										Supabase
									</button>
								{/if}
								{#if hasCloudflare}
									<button
										class="mode-btn"
										class:active={activeMode === 'cloudflare'}
										onclick={() => switchMode('cloudflare')}
										title="Cloudflare Deployments"
									>
										<svg class="mode-icon" viewBox="0 0 24 24" fill="currentColor">
											<path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"/>
										</svg>
										Cloudflare
									</button>
								{/if}
							</div>
							<!-- Contextual controls for cloudflare mode -->
							{#if activeMode === 'cloudflare'}
								<div class="header-controls">
									{#if cfTotalCount > 0}
										<span class="cf-header-count">{cfTotalCount}</span>
									{/if}
									<select
										class="cf-header-filter"
										value={cfEnvFilter}
										onchange={(e) => { const v = (e.target as HTMLSelectElement).value; cfEnvFilter = v; cfPanelRef?.setEnvFilter(v); }}
										title="Filter by environment"
									>
										<option value="">All</option>
										<option value="production">Production</option>
										<option value="preview">Preview</option>
									</select>
									<button class="cf-header-refresh" onclick={() => cfPanelRef?.refresh()} title="Refresh">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" class:spinning={cfIsLoading}>
											<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
											<path d="M3 3v5h5"/>
											<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
											<path d="M21 21v-5h-5"/>
										</svg>
									</button>
								</div>
							{/if}
						{:else}
							<!-- Git-only: show project name + icon -->
							<div class="title-left">
								<svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="6" y1="3" x2="6" y2="15"></line>
									<circle cx="18" cy="6" r="3"></circle>
									<circle cx="6" cy="18" r="3"></circle>
									<path d="M18 9a9 9 0 0 1-9 9"></path>
								</svg>
								<span class="font-medium text-base-content/90">{selectedProject || 'No project selected'}</span>
							</div>
						{/if}
					</div>

					<div class="panel-content git-panel-content">
						{#if !selectedProject}
							<div class="panel-empty">
								<p>Select a project to view changes</p>
							</div>
						{:else if activeMode === 'git'}
							<GitPanel
								project={selectedProject}
								onFileClick={handleFileClick}
								onCommitSelect={handleCommitSelect}
								onCommitFileClick={(path) => { activeCommitFilePath = path; }}
								onRebaseComplete={handleRebaseComplete}
								{selectedFilePath}
							/>
						{:else if activeMode === 'supabase'}
							<SupabasePanel
								project={selectedProject}
								onMigrationSelect={handleMigrationSelect}
							/>
						{:else if activeMode === 'cloudflare'}
							<CloudflarePanel
								project={selectedProject}
								onDeploymentSelect={handleDeploymentSelect}
								hideHeader={true}
								bind:this={cfPanelRef}
							/>
						{/if}
					</div>
				</div>

				<!-- Resizable Divider -->
				{#if isMobileLayout}
					<ResizableDivider onResize={handleMobileResize} />
				{:else}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="vertical-divider"
						class:dragging={isDragging}
						onmousedown={handleDividerMouseDown}
						role="separator"
						aria-orientation="vertical"
					>
						<div class="divider-grip">
							<div class="grip-line"></div>
							<div class="grip-line"></div>
						</div>
					</div>
				{/if}

				<!-- Right Panel: Diff Viewer (Git) or Migration Viewer (Supabase) -->
				<div class="git-panel-right">
					{#if activeMode === 'git'}
						{#if selectedProject && selectedFilePath}
							<DiffViewer
								filePath={selectedFilePath}
								projectName={selectedProject}
								isStaged={selectedFileIsStaged}
								onStage={handleStageFile}
								onUnstage={handleUnstageFile}
								onClose={handleClearSelection}
							/>
						{:else if selectedProject && commitViewHash && activeCommitFilePath}
							<div class="commit-diff-container">
								<FileTabBar
									openFiles={commitOpenFiles}
									activeFilePath={activeCommitFilePath}
									onTabSelect={(path) => { activeCommitFilePath = path; }}
									onTabClose={(path) => {
										commitOpenFiles = commitOpenFiles.filter(f => f.path !== path);
										if (activeCommitFilePath === path) {
											activeCommitFilePath = commitOpenFiles[0]?.path ?? null;
										}
										if (commitOpenFiles.length === 0) {
											commitViewHash = null;
										}
									}}
								/>
								{#key activeCommitFilePath}
									<DiffViewer
										filePath={activeCommitFilePath}
										projectName={selectedProject}
										commitHash={commitViewHash}
									/>
								{/key}
							</div>
						{:else}
							<div class="diff-placeholder">
								<div class="diff-placeholder-content">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="diff-placeholder-icon">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
									</svg>
									<p class="diff-placeholder-text">
										{selectedProject ? 'Select a file or commit to view diff' : 'Select a project to start'}
									</p>
									<p class="diff-placeholder-hint">
										Click on a modified file or a commit in the timeline
									</p>
								</div>
							</div>
						{/if}
					{:else if activeMode === 'supabase'}
						{#if selectedMigrationFilename}
							<MigrationViewer
								content={selectedMigrationContent}
								title={selectedMigrationTitle}
								isDiff={isDiff}
								filename={selectedMigrationFilename}
								project={selectedProject ?? undefined}
								onClose={handleClearMigration}
								onSave={(newContent) => { selectedMigrationContent = newContent; }}
							/>
						{:else}
							<div class="diff-placeholder">
								<div class="diff-placeholder-content">
									<!-- Supabase logo (lightning bolt) -->
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="diff-placeholder-icon">
										<path d="M13.5 3L6 14h6l-1.5 7L18 10h-6l1.5-7z"/>
									</svg>
									<p class="diff-placeholder-text">
										{selectedProject ? 'Select a migration to view SQL' : 'Select a project to start'}
									</p>
									<p class="diff-placeholder-hint">
										Click on a migration or check schema diff in the left panel
									</p>
								</div>
							</div>
						{/if}
					{:else if activeMode === 'cloudflare'}
						{#if selectedDeployment}
							<div class="cf-detail-panel">
								<div class="cf-detail-header">
									<div class="cf-detail-title-row">
										<span class="cf-detail-env" class:production={selectedDeployment.environment === 'production'} class:preview={selectedDeployment.environment === 'preview'}>
											{selectedDeployment.environment}
										</span>
										<span class="cf-detail-id">#{selectedDeployment.shortId}</span>
										<button class="cf-detail-close" onclick={handleClearDeployment} title="Close">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
												<line x1="18" y1="6" x2="6" y2="18"></line>
												<line x1="6" y1="6" x2="18" y2="18"></line>
											</svg>
										</button>
									</div>
									{#if selectedDeployment.commitMessage}
										<p class="cf-detail-commit-msg">{selectedDeployment.commitMessage}</p>
									{/if}
								</div>

								<div class="cf-detail-body">
									<!-- Deployment Info -->
									<div class="cf-detail-section">
										<h4 class="cf-detail-section-title">Deployment Info</h4>
										<div class="cf-detail-grid">
											<div class="cf-detail-field">
												<span class="cf-detail-label">Status</span>
												<span class="cf-detail-value cf-status-{selectedDeployment.status}">{selectedDeployment.status}</span>
											</div>
											<div class="cf-detail-field">
												<span class="cf-detail-label">Branch</span>
												<span class="cf-detail-value">{selectedDeployment.branch}</span>
											</div>
											{#if selectedDeployment.commitHash}
												<div class="cf-detail-field">
													<span class="cf-detail-label">Commit</span>
													<span class="cf-detail-value mono">{selectedDeployment.commitHash.slice(0, 10)}</span>
												</div>
											{/if}
											<div class="cf-detail-field">
												<span class="cf-detail-label">Trigger</span>
												<span class="cf-detail-value">{selectedDeployment.trigger}</span>
											</div>
											<div class="cf-detail-field">
												<span class="cf-detail-label">Created</span>
												<span class="cf-detail-value">{new Date(selectedDeployment.createdOn).toLocaleString()}</span>
											</div>
										</div>
									</div>

									<!-- Build Stages -->
									{#if selectedDeployment.stages && selectedDeployment.stages.length > 0}
										<div class="cf-detail-section">
											<h4 class="cf-detail-section-title">Build Stages</h4>
											<div class="cf-stages-list">
												{#each selectedDeployment.stages as stage}
													<div class="cf-stage-row">
														<span class="cf-stage-icon cf-status-{stage.status}">
															{stage.status === 'success' ? '\u2713' : stage.status === 'failure' ? '\u2715' : stage.status === 'active' ? '\u25CF' : '\u25CB'}
														</span>
														<span class="cf-stage-name">{stage.name}</span>
														<span class="cf-stage-status">{stage.status}</span>
													</div>
												{/each}
											</div>
										</div>
									{/if}

									<!-- URL -->
									{#if selectedDeployment.url}
										<div class="cf-detail-section">
											<h4 class="cf-detail-section-title">Preview URL</h4>
											<a href={selectedDeployment.url} target="_blank" rel="noopener noreferrer" class="cf-detail-url">
												{selectedDeployment.url}
											</a>
										</div>
									{/if}
								</div>
							</div>
						{:else}
							<div class="diff-placeholder">
								<div class="diff-placeholder-content">
									<!-- Cloudflare cloud icon -->
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="diff-placeholder-icon">
										<path d="M2.25 15a4.5 4.5 0 0 1 0-9h.22A6.75 6.75 0 0 1 15.75 4.5 4.5 4.5 0 0 1 18 13.5h.75a3 3 0 1 1 0 6H2.25z"/>
									</svg>
									<p class="diff-placeholder-text">
										{selectedProject ? 'Select a deployment to view details' : 'Select a project to start'}
									</p>
									<p class="diff-placeholder-hint">
										Click on a deployment in the left panel to see build stages and details
									</p>
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.git-page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.git-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		max-width: 100%;
		width: 100%;
		min-height: 0;
	}

	/* Body: Side-by-side layout */
	.git-body {
		display: flex;
		flex: 1;
		gap: 0;
		min-height: 0;
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid oklch(0.22 0.02 250);
		background: oklch(0.16 0.01 250);
	}

	/* Git Panel (Left) */
	.git-panel-left {
		display: flex;
		flex-direction: column;
		min-width: 200px;
		max-width: 80vw;
		flex-shrink: 0;
		background: oklch(0.15 0.01 250);
		border-right: 1px solid oklch(0.22 0.02 250);
		container-type: inline-size;
		container-name: git-panel;
	}

	/* Diff Panel (Right) */
	.git-panel-right {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 300px;
		background: oklch(0.14 0.01 250);
	}

	/* Panel Title Header */
	.panel-title-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
	}

	.title-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		flex: 1;
	}

	.project-selector-wrapper {
		flex: 1;
		min-width: 0;
	}

.panel-title-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	@container git-panel (max-width: 220px) {
		.project-selector-wrapper {
			display: none;
		}
	}

	/* Mode Toggle */
	.mode-toggle {
		display: flex;
		gap: 0.125rem;
		background: oklch(0.13 0.01 250);
		border-radius: 0.375rem;
		padding: 0.125rem;
	}

	.mode-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: oklch(0.50 0.02 250);
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mode-btn:hover {
		color: oklch(0.70 0.02 250);
		background: oklch(0.18 0.01 250);
	}

	.mode-btn.active {
		color: oklch(0.90 0.02 250);
		background: oklch(0.22 0.02 250);
	}

	.mode-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	/* Header Controls (right side — CF count, filter, refresh) */
	.header-controls {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-left: auto;
	}

	.cf-header-count {
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
		background: oklch(0.20 0.01 250);
		padding: 0.0625rem 0.375rem;
		border-radius: 999px;
		font-variant-numeric: tabular-nums;
	}

	.cf-header-filter {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
	}

	.cf-header-refresh {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		transition: all 0.15s;
	}

	.cf-header-refresh:hover {
		background: oklch(0.20 0.01 250);
		color: oklch(0.70 0.02 250);
	}

	@keyframes cf-spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.spinning {
		animation: cf-spin 1s linear infinite;
	}

	/* Panel Content */
	.panel-content {
		flex: 1;
		overflow: auto;
		padding: 0.5rem;
	}

	.panel-content.git-panel-content {
		padding: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.panel-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: oklch(0.45 0.02 250);
		padding: 2rem;
	}

	/* Vertical Divider */
	.vertical-divider {
		width: 8px;
		min-width: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: col-resize;
		background: transparent;
		transition: background 0.15s ease;
		user-select: none;
	}

	.vertical-divider:hover {
		background: oklch(0.65 0.15 200 / 0.1);
	}

	.vertical-divider.dragging {
		background: oklch(0.65 0.15 200 / 0.2);
	}

	.divider-grip {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 4px 2px;
		opacity: 0.4;
		transition: opacity 0.15s ease;
	}

	.vertical-divider:hover .divider-grip,
	.vertical-divider.dragging .divider-grip {
		opacity: 1;
	}

	.grip-line {
		width: 2px;
		height: 24px;
		border-radius: 1px;
		background: oklch(0.60 0.02 250);
		transition: background 0.15s ease;
	}

	.vertical-divider:hover .grip-line {
		background: oklch(0.65 0.15 200);
	}

	.vertical-divider.dragging .grip-line {
		background: oklch(0.70 0.18 200);
	}

	/* Diff Placeholder */
	.diff-placeholder {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.14 0.01 250);
	}

	.diff-placeholder-content {
		text-align: center;
		padding: 2rem;
	}

	.diff-placeholder-icon {
		width: 4rem;
		height: 4rem;
		color: oklch(0.35 0.02 250);
		margin: 0 auto 1rem;
	}

	.diff-placeholder-text {
		font-size: 0.9375rem;
		color: oklch(0.55 0.02 250);
		margin-bottom: 0.5rem;
	}

	.diff-placeholder-hint {
		font-size: 0.8125rem;
		color: oklch(0.40 0.02 250);
	}

	/* Commit Diff Container (FileTabBar + DiffViewer) */
	.commit-diff-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	/* Error State */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.error-icon {
		color: oklch(0.60 0.15 25);
		margin-bottom: 1rem;
	}

	.error-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: oklch(0.70 0.12 25);
		margin: 0;
	}

	.error-message {
		font-size: 0.85rem;
		color: oklch(0.55 0.02 250);
		margin: 0.5rem 0 0;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-icon {
		color: oklch(0.35 0.02 250);
		margin-bottom: 1rem;
	}

	.empty-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		margin: 0;
	}

	.empty-hint {
		font-size: 0.85rem;
		color: oklch(0.45 0.02 250);
		margin: 0.5rem 0 0;
	}

	/* Mobile Layout */
	.git-body.mobile-layout {
		flex-direction: column;
	}

	.git-body.mobile-layout .git-panel-left {
		width: 100% !important;
		max-width: none;
		min-width: 0;
		min-height: 100px;
		border-right: none;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.git-body.mobile-layout .git-panel-right {
		min-width: 0;
		flex: 1;
		min-height: 0;
	}

	/* Cloudflare Detail Panel */
	.cf-detail-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.cf-detail-header {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		background: oklch(0.16 0.01 250);
	}

	.cf-detail-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cf-detail-env {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
	}

	.cf-detail-env.production {
		background: oklch(0.55 0.18 145 / 0.15);
		color: oklch(0.75 0.18 145);
	}

	.cf-detail-env.preview {
		background: oklch(0.55 0.15 250 / 0.15);
		color: oklch(0.75 0.15 250);
	}

	.cf-detail-id {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
		font-family: monospace;
	}

	.cf-detail-close {
		margin-left: auto;
		padding: 0.25rem;
		background: transparent;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		border-radius: 0.25rem;
		transition: all 0.15s ease;
	}

	.cf-detail-close:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.75 0.02 250);
	}

	.cf-detail-commit-msg {
		margin: 0.5rem 0 0;
		font-size: 0.8125rem;
		color: oklch(0.70 0.02 250);
		line-height: 1.4;
	}

	.cf-detail-body {
		flex: 1;
		overflow: auto;
		padding: 1rem;
	}

	.cf-detail-section {
		margin-bottom: 1.25rem;
	}

	.cf-detail-section-title {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.50 0.02 250);
		margin: 0 0 0.5rem;
	}

	.cf-detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.cf-detail-field {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.cf-detail-label {
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
	}

	.cf-detail-value {
		font-size: 0.8125rem;
		color: oklch(0.80 0.02 250);
	}

	.cf-detail-value.mono {
		font-family: monospace;
	}

	/* Cloudflare Status Colors */
	.cf-status-success {
		color: oklch(0.75 0.18 145);
	}

	.cf-status-failure {
		color: oklch(0.70 0.20 25);
	}

	.cf-status-active {
		color: oklch(0.75 0.15 85);
	}

	.cf-status-canceled,
	.cf-status-idle {
		color: oklch(0.50 0.02 250);
	}

	/* Build Stages */
	.cf-stages-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.cf-stage-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		background: oklch(0.18 0.01 250);
		border-radius: 0.375rem;
	}

	.cf-stage-icon {
		font-size: 0.75rem;
		width: 1rem;
		text-align: center;
		flex-shrink: 0;
	}

	.cf-stage-name {
		font-size: 0.8125rem;
		color: oklch(0.75 0.02 250);
		flex: 1;
		text-transform: capitalize;
	}

	.cf-stage-status {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: oklch(0.50 0.02 250);
	}

	/* Preview URL */
	.cf-detail-url {
		font-size: 0.8125rem;
		color: oklch(0.70 0.15 230);
		text-decoration: none;
		word-break: break-all;
		transition: color 0.15s ease;
	}

	.cf-detail-url:hover {
		color: oklch(0.80 0.18 230);
		text-decoration: underline;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.git-content {
			padding: 0.5rem;
		}

		.cf-detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
