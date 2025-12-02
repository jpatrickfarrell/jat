<script lang="ts">
	/**
	 * Projects Settings Page
	 *
	 * Displays all configured projects with stats (similar to `jat list`)
	 * Allows users to hide/show projects from dashboard dropdowns
	 */

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Project {
		name: string;
		displayName: string;
		path: string;
		port: number | null;
		activeColor: string | null;
		description: string | null;
		hidden: boolean;
		source: 'jat-config' | 'filesystem';
		tasks?: { open: number; total: number };
		agents?: { active: number; total: number };
		status?: string | null;
		lastActivity?: string | null;
	}

	let projects = $state<Project[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let saving = $state<string | null>(null); // Project name being saved
	let editingDescription = $state<string | null>(null); // Project name being edited
	let descriptionDraft = $state<string>('');
	let editingPort = $state<string | null>(null); // Project name being edited (port)
	let portDraft = $state<string>('');
	let configPath = $state<string>('');
	let source = $state<string>('');

	async function fetchProjects() {
		loading = true;
		error = null;
		try {
			const response = await fetch('/api/projects?stats=true');
			if (!response.ok) {
				throw new Error('Failed to fetch projects');
			}
			const data = await response.json();
			projects = data.projects || [];
			configPath = data.configPath || '';
			source = data.source || 'unknown';
		} catch (err: any) {
			error = err.message || 'Failed to load projects';
		} finally {
			loading = false;
		}
	}

	async function toggleVisibility(project: Project) {
		saving = project.name;
		try {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: project.hidden ? 'show' : 'hide',
					project: project.name
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update project visibility');
			}

			// Update local state
			projects = projects.map(p =>
				p.name === project.name ? { ...p, hidden: !p.hidden } : p
			);
		} catch (err: any) {
			console.error('Failed to toggle visibility:', err);
			// Show error briefly
			error = err.message;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			saving = null;
		}
	}

	function handleNewSession(projectName: string) {
		// Navigate to work page and spawn session
		goto(`/work?spawn=${encodeURIComponent(projectName)}`);
	}

	function startEditingDescription(project: Project) {
		editingDescription = project.name;
		descriptionDraft = project.description || '';
	}

	function cancelEditingDescription() {
		editingDescription = null;
		descriptionDraft = '';
	}

	async function saveDescription(project: Project) {
		saving = project.name;
		try {
			const response = await fetch('/api/projects', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: project.name,
					description: descriptionDraft.trim() || null
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save description');
			}

			// Update local state
			projects = projects.map(p =>
				p.name === project.name ? { ...p, description: descriptionDraft.trim() || null } : p
			);
			editingDescription = null;
			descriptionDraft = '';
		} catch (err: any) {
			console.error('Failed to save description:', err);
			error = err.message;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			saving = null;
		}
	}

	function handleDescriptionKeydown(event: KeyboardEvent, project: Project) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			saveDescription(project);
		} else if (event.key === 'Escape') {
			cancelEditingDescription();
		}
	}

	// Port editing functions
	function startEditingPort(project: Project) {
		editingPort = project.name;
		portDraft = project.port?.toString() || '';
	}

	function cancelEditingPort() {
		editingPort = null;
		portDraft = '';
	}

	async function savePort(project: Project) {
		saving = project.name;
		try {
			const portValue = portDraft.trim() ? parseInt(portDraft.trim(), 10) : null;

			// Validate port number
			if (portValue !== null && (isNaN(portValue) || portValue < 1 || portValue > 65535)) {
				error = 'Port must be between 1 and 65535';
				setTimeout(() => { error = null; }, 3000);
				saving = null;
				return;
			}

			const response = await fetch('/api/projects', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: project.name,
					port: portValue
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save port');
			}

			// Update local state
			projects = projects.map(p =>
				p.name === project.name ? { ...p, port: portValue } : p
			);
			editingPort = null;
			portDraft = '';
		} catch (err: any) {
			console.error('Failed to save port:', err);
			error = err.message;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			saving = null;
		}
	}

	function handlePortKeydown(event: KeyboardEvent, project: Project) {
		if (event.key === 'Enter') {
			event.preventDefault();
			savePort(project);
		} else if (event.key === 'Escape') {
			cancelEditingPort();
		}
	}

	// Server control state
	let serverAction = $state<string | null>(null); // Project name being started/stopped

	async function startServer(project: Project) {
		serverAction = project.name;
		try {
			const response = await fetch(`/api/projects/${encodeURIComponent(project.name)}/server`, {
				method: 'POST'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to start server');
			}

			// Update local state to show starting/running
			projects = projects.map(p =>
				p.name === project.name ? { ...p, status: data.status } : p
			);

			// Poll for port to become active (only if port configured)
			if (project.port) {
				pollServerStatus(project.name, 10);
			}
		} catch (err: any) {
			console.error('Failed to start server:', err);
			error = err.message;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			serverAction = null;
		}
	}

	async function stopServer(project: Project) {
		serverAction = project.name;
		try {
			const response = await fetch(`/api/projects/${encodeURIComponent(project.name)}/server`, {
				method: 'DELETE'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to stop server');
			}

			// Update local state
			projects = projects.map(p =>
				p.name === project.name ? { ...p, status: null } : p
			);
		} catch (err: any) {
			console.error('Failed to stop server:', err);
			error = err.message;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			serverAction = null;
		}
	}

	// Poll server status until port is running or max attempts reached
	async function pollServerStatus(projectName: string, maxAttempts: number) {
		for (let i = 0; i < maxAttempts; i++) {
			await new Promise(resolve => setTimeout(resolve, 1000));

			try {
				const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/server`);
				const data = await response.json();

				projects = projects.map(p =>
					p.name === projectName ? { ...p, status: data.status } : p
				);

				if (data.status === 'running') {
					break;
				}
			} catch {
				// Ignore polling errors
			}
		}
	}

	onMount(() => {
		fetchProjects();
	});

	// Stats helpers
	function formatTasks(tasks?: { open: number; total: number }) {
		if (!tasks || tasks.total === 0) return '-';
		return `${tasks.open}/${tasks.total}`;
	}

	function formatAgents(agents?: { active: number; total: number }) {
		if (!agents || agents.total === 0) return '-';
		if (agents.active > 0) return `${agents.active}/${agents.total}`;
		return `${agents.total}`;
	}

	// Count visible/hidden
	const visibleCount = $derived(projects.filter(p => !p.hidden).length);
	const hiddenCount = $derived(projects.filter(p => p.hidden).length);
</script>

<svelte:head>
	<title>Projects | JAT Dashboard</title>
</svelte:head>

<!-- Industrial page wrapper -->
<div class="min-h-screen" style="background: oklch(0.14 0.01 250);">
	<!-- Header -->
	<div
		class="sticky top-0 z-10 px-6 py-4"
		style="
			background: linear-gradient(180deg, oklch(0.20 0.01 250) 0%, oklch(0.18 0.01 250) 100%);
			border-bottom: 1px solid oklch(0.30 0.02 250);
		"
	>
		<div class="flex items-center justify-between max-w-6xl mx-auto">
			<div>
				<h1 class="text-xl font-bold font-mono uppercase tracking-wider" style="color: oklch(0.85 0.02 250);">
					Project Settings
				</h1>
				<p class="text-sm mt-1" style="color: oklch(0.55 0.02 250);">
					Manage which projects appear in dashboard dropdowns
				</p>
			</div>

			<!-- Stats badges -->
			<div class="flex items-center gap-3">
				<div
					class="px-3 py-1.5 rounded font-mono text-xs"
					style="background: oklch(0.25 0.08 145 / 0.2); border: 1px solid oklch(0.50 0.15 145 / 0.4); color: oklch(0.75 0.15 145);"
				>
					{visibleCount} visible
				</div>
				{#if hiddenCount > 0}
					<div
						class="px-3 py-1.5 rounded font-mono text-xs"
						style="background: oklch(0.25 0.08 30 / 0.2); border: 1px solid oklch(0.50 0.15 30 / 0.4); color: oklch(0.70 0.15 30);"
					>
						{hiddenCount} hidden
					</div>
				{/if}
				<button
					class="btn btn-sm btn-ghost font-mono text-xs"
					onclick={fetchProjects}
					disabled={loading}
				>
					{#if loading}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						↻ Refresh
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="px-6 py-6 max-w-6xl mx-auto">
		<!-- Error message -->
		{#if error}
			<div
				class="mb-4 p-4 rounded-lg font-mono text-sm"
				style="background: oklch(0.25 0.10 25 / 0.3); border: 1px solid oklch(0.50 0.15 25 / 0.5); color: oklch(0.80 0.10 25);"
			>
				{error}
			</div>
		{/if}

		<!-- Loading state -->
		{#if loading && projects.length === 0}
			<div class="flex items-center justify-center py-12">
				<span class="loading loading-spinner loading-lg" style="color: oklch(0.70 0.18 240);"></span>
			</div>
		{:else if projects.length === 0}
			<div
				class="text-center py-12 rounded-lg"
				style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.30 0.02 250);"
			>
				<p class="font-mono text-sm" style="color: oklch(0.55 0.02 250);">
					No projects found
				</p>
				<p class="font-mono text-xs mt-2" style="color: oklch(0.45 0.02 250);">
					Run <code class="px-1.5 py-0.5 rounded" style="background: oklch(0.25 0.02 250);">jat init</code> to discover projects
				</p>
			</div>
		{:else}
			<!-- Projects table -->
			<div
				class="overflow-x-auto rounded-lg"
				style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.30 0.02 250);"
			>
				<table class="w-full">
					<thead>
						<tr style="background: oklch(0.22 0.01 250); border-bottom: 1px solid oklch(0.30 0.02 250);">
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Visible
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Project
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider min-w-[200px]" style="color: oklch(0.55 0.02 250);">
								Description
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Port
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Tasks
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Agents
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Status
							</th>
							<th class="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Last
							</th>
							<th class="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{#each projects as project (project.name)}
							<tr
								class="transition-colors"
								style="
									border-bottom: 1px solid oklch(0.25 0.01 250);
									opacity: {project.hidden ? '0.5' : '1'};
								"
								onmouseenter={(e) => e.currentTarget.style.background = 'oklch(0.22 0.02 250)'}
								onmouseleave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<!-- Visibility toggle -->
								<td class="px-4 py-3">
									<button
										class="relative w-10 h-5 rounded-full transition-all cursor-pointer"
										style="
											background: {project.hidden ? 'oklch(0.30 0.02 250)' : 'oklch(0.45 0.18 145)'};
											border: 1px solid {project.hidden ? 'oklch(0.40 0.02 250)' : 'oklch(0.55 0.20 145)'};
										"
										onclick={() => toggleVisibility(project)}
										disabled={saving === project.name}
										title={project.hidden ? 'Show in dropdowns' : 'Hide from dropdowns'}
									>
										{#if saving === project.name}
											<span class="absolute inset-0 flex items-center justify-center">
												<span class="loading loading-spinner loading-xs"></span>
											</span>
										{:else}
											<span
												class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
												style="
													background: oklch(0.90 0.02 250);
													left: {project.hidden ? '2px' : 'calc(100% - 18px)'};
													box-shadow: 0 1px 3px oklch(0 0 0 / 0.3);
												"
											></span>
										{/if}
									</button>
								</td>

								<!-- Project name with color indicator and path -->
								<td class="px-4 py-2">
									<div class="flex items-start gap-2">
										{#if project.activeColor}
											<span
												class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
												style="background: {project.activeColor};"
											></span>
										{/if}
										<div class="flex flex-col">
											<span class="font-mono text-sm font-medium" style="color: oklch(0.85 0.02 250);">
												{project.name}
											</span>
											<span
												class="font-mono text-[10px] truncate max-w-[160px]"
												style="color: oklch(0.45 0.02 250);"
												title={project.path}
											>
												{project.path.replace(/^\/home\/[^/]+/, '~')}
											</span>
										</div>
									</div>
								</td>

								<!-- Description (editable) -->
								<td class="px-4 py-3">
									{#if editingDescription === project.name}
										<div class="flex items-center gap-2">
											<input
												type="text"
												class="flex-1 px-2 py-1 rounded font-mono text-xs"
												style="
													background: oklch(0.25 0.01 250);
													border: 1px solid oklch(0.45 0.15 240);
													color: oklch(0.85 0.02 250);
													outline: none;
												"
												placeholder="Short description for AI context..."
												bind:value={descriptionDraft}
												onkeydown={(e) => handleDescriptionKeydown(e, project)}
												autofocus
											/>
											<button
												class="p-1 rounded hover:bg-base-300/20"
												style="color: oklch(0.60 0.15 145);"
												onclick={() => saveDescription(project)}
												disabled={saving === project.name}
												title="Save (Enter)"
											>
												{#if saving === project.name}
													<span class="loading loading-spinner loading-xs"></span>
												{:else}
													<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
														<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
													</svg>
												{/if}
											</button>
											<button
												class="p-1 rounded hover:bg-base-300/20"
												style="color: oklch(0.60 0.10 25);"
												onclick={cancelEditingDescription}
												title="Cancel (Esc)"
											>
												<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									{:else}
										<button
											class="group flex items-center gap-2 w-full text-left"
											onclick={() => startEditingDescription(project)}
											title="Click to edit description"
										>
											{#if project.description}
												<span class="font-mono text-xs truncate max-w-[180px]" style="color: oklch(0.70 0.02 250);">
													{project.description}
												</span>
											{:else}
												<span class="font-mono text-xs italic" style="color: oklch(0.45 0.02 250);">
													Add description...
												</span>
											{/if}
											<svg
												class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
												style="color: oklch(0.55 0.02 250);"
												fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
											>
												<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
											</svg>
										</button>
									{/if}
								</td>

								<!-- Port (editable) -->
								<td class="px-4 py-3">
									{#if editingPort === project.name}
										<div class="flex items-center gap-1">
											<input
												type="text"
												class="w-20 px-2 py-1 rounded font-mono text-xs"
												style="
													background: oklch(0.25 0.01 250);
													border: 1px solid oklch(0.45 0.15 240);
													color: oklch(0.85 0.02 250);
													outline: none;
												"
												placeholder="Port..."
												bind:value={portDraft}
												onkeydown={(e) => handlePortKeydown(e, project)}
												onblur={() => savePort(project)}
												autofocus
											/>
											{#if saving === project.name}
												<span class="loading loading-spinner loading-xs"></span>
											{/if}
										</div>
									{:else}
										<button
											class="group flex items-center gap-1 w-full text-left font-mono text-sm"
											onclick={() => startEditingPort(project)}
											title="Click to edit port"
										>
											{#if project.port}
												<span style="color: oklch(0.65 0.02 250);">{project.port}</span>
											{:else}
												<span class="italic" style="color: oklch(0.45 0.02 250);">-</span>
											{/if}
											<svg
												class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
												style="color: oklch(0.55 0.02 250);"
												fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
											>
												<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
											</svg>
										</button>
									{/if}
								</td>

								<!-- Tasks -->
								<td class="px-4 py-3 font-mono text-sm" style="color: oklch(0.65 0.02 250);">
									{formatTasks(project.tasks)}
								</td>

								<!-- Agents -->
								<td class="px-4 py-3 font-mono text-sm" style="color: oklch(0.65 0.02 250);">
									{formatAgents(project.agents)}
								</td>

								<!-- Status -->
								<td class="px-4 py-3">
									{#if project.status === 'running'}
										<span
											class="px-2 py-0.5 rounded font-mono text-xs"
											style="background: oklch(0.35 0.15 145 / 0.3); color: oklch(0.75 0.18 145);"
										>
											running
										</span>
									{:else if project.status === 'starting'}
										<span
											class="px-2 py-0.5 rounded font-mono text-xs animate-pulse"
											style="background: oklch(0.35 0.15 80 / 0.3); color: oklch(0.75 0.15 80);"
										>
											starting
										</span>
									{:else if project.status === 'stopping'}
										<span
											class="px-2 py-0.5 rounded font-mono text-xs animate-pulse"
											style="background: oklch(0.35 0.10 30 / 0.3); color: oklch(0.70 0.12 30);"
										>
											stopping
										</span>
									{:else}
										<span class="font-mono text-sm" style="color: oklch(0.50 0.02 250);">-</span>
									{/if}
								</td>

								<!-- Last activity -->
								<td class="px-4 py-3 font-mono text-sm" style="color: oklch(0.65 0.02 250);">
									{project.lastActivity || '-'}
								</td>

								<!-- Actions -->
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-1">
										<!-- Server start/stop button -->
										{#if project.status === 'running'}
											<button
												class="btn btn-xs font-mono"
												style="background: oklch(0.30 0.08 25 / 0.5); border: 1px solid oklch(0.45 0.12 25 / 0.5); color: oklch(0.75 0.12 25);"
												onclick={() => stopServer(project)}
												disabled={serverAction === project.name}
												title="Stop dev server"
											>
												{#if serverAction === project.name}
													<span class="loading loading-spinner loading-xs"></span>
												{:else}
													<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
														<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
													</svg>
												{/if}
											</button>
										{:else}
											<button
												class="btn btn-xs font-mono"
												style="background: oklch(0.30 0.10 145 / 0.4); border: 1px solid oklch(0.45 0.15 145 / 0.5); color: oklch(0.75 0.15 145);"
												onclick={() => startServer(project)}
												disabled={serverAction === project.name || project.status === 'starting'}
												title="Start dev server (tmux){project.port ? '' : ' - no port configured'}"
											>
												{#if serverAction === project.name || project.status === 'starting'}
													<span class="loading loading-spinner loading-xs"></span>
												{:else}
													<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
														<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
													</svg>
												{/if}
											</button>
										{/if}

										<!-- New session button -->
										<button
											class="btn btn-xs btn-ghost font-mono"
											style="color: oklch(0.70 0.15 240);"
											onclick={() => handleNewSession(project.name)}
											title="Start new Claude session"
										>
											<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Config info footer -->
			<div
				class="mt-4 p-4 rounded-lg flex items-start gap-3"
				style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.25 0.02 250);"
			>
				<svg class="w-4 h-4 flex-shrink-0 mt-0.5" style="color: oklch(0.55 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div>
					<p class="font-mono text-xs" style="color: oklch(0.60 0.02 250);">
						Config: <code class="px-1.5 py-0.5 rounded" style="background: oklch(0.25 0.02 250); color: oklch(0.75 0.02 250);">{configPath}</code>
					</p>
					<p class="font-mono text-xs mt-1" style="color: oklch(0.50 0.02 250);">
						{#if source === 'jat-config'}
							Descriptions are saved to the config file. Edit with <code class="px-1 py-0.5 rounded" style="background: oklch(0.25 0.02 250);">jat edit</code> or click to edit inline.
						{:else}
							Run <code class="px-1 py-0.5 rounded" style="background: oklch(0.25 0.02 250);">jat init</code> to configure projects
						{/if}
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
