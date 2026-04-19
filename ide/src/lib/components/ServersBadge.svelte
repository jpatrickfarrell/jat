<script lang="ts">
	/**
	 * ServersBadge Component
	 * Displays dev server status + WebSocket connection status in TopBar
	 *
	 * Features:
	 * - Shows running/total server count (e.g., "2/5")
	 * - WebSocket connection status dot (green/blue/orange/red)
	 * - Hover dropdown lists all configured projects with ports
	 * - Inline actions: start, stop, restart, open browser
	 * - Status indicators: running (green), starting (blue), stopped (gray)
	 */

	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import {
		fetch as fetchServers,
		start as startServer,
		stop as stopServer,
		restart as restartServer,
		getSessions,
		serverSessionsState,
	} from "$lib/stores/serverSessions.svelte";
	import { addSession } from "$lib/stores/workSessions.svelte";
	import {
		websocketState,
		type ConnectionState,
	} from "$lib/stores/websocket.svelte";
	import {
		playServerStartSound,
		playServerStopSound,
	} from "$lib/utils/soundEffects";

	// WebSocket visual configuration for each state
	const wsStateConfig: Record<
		ConnectionState,
		{ color: string; label: string; pulse: boolean }
	> = {
		connected: {
			color: "oklch(0.72 0.19 145)", // Green
			label: "Connected",
			pulse: false,
		},
		connecting: {
			color: "oklch(0.70 0.18 240)", // Blue
			label: "Connecting...",
			pulse: true,
		},
		reconnecting: {
			color: "oklch(0.75 0.18 60)", // Orange
			label: "Reconnecting...",
			pulse: true,
		},
		disconnected: {
			color: "oklch(0.65 0.22 25)", // Red
			label: "Disconnected",
			pulse: false,
		},
	};

	// Get current WebSocket config
	const wsConfig = $derived(wsStateConfig[websocketState.connectionState]);

	interface ProjectWithPort {
		key: string;
		displayName: string;
		port: number;
		path: string;
		serverPath: string | null;
	}

	// State
	let projectsWithPorts = $state<ProjectWithPort[]>([]);
	let showDropdown = $state(false);
	let dropdownTimeout: ReturnType<typeof setTimeout> | null = null;
	let loadingAction = $state<string | null>(null); // projectKey being actioned
	let error = $state<string | null>(null);
	let spawningSession = $state(false); // Track spawn loading state
	let pendingStopProject = $state<string | null>(null);
	let pendingStopTimer: ReturnType<typeof setTimeout> | null = null;
	let lastFailedAction = $state<{ type: 'start' | 'stop' | 'restart'; projectKey: string } | null>(null);
	let badgeRef = $state<HTMLElement | null>(null);
	let dropdownRef = $state<HTMLElement | null>(null);
	let openedViaKeyboard = $state(false);

	// WebSocket reconnection flash — dot pulses when connection re-establishes
	let wsJustConnected = $state(false);
	let _prevConnectionState = ''; // plain JS, not reactive
	let _wsConnectedTimeout: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const current = websocketState.connectionState;
		if (_prevConnectionState !== '' && current === 'connected' && _prevConnectionState !== 'connected') {
			wsJustConnected = true;
			if (_wsConnectedTimeout) clearTimeout(_wsConnectedTimeout);
			_wsConnectedTimeout = setTimeout(() => { wsJustConnected = false; }, 900);
		}
		_prevConnectionState = current;
	});

	// Move focus into dropdown when opened via keyboard
	$effect(() => {
		if (showDropdown && openedViaKeyboard && dropdownRef) {
			const firstBtn = dropdownRef.querySelector<HTMLElement>('button:not([disabled])');
			if (firstBtn) setTimeout(() => firstBtn.focus(), 0);
		}
		if (!showDropdown) openedViaKeyboard = false;
	});

	function handleDropdownKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			showDropdown = false;
			badgeRef?.focus();
		} else if (e.key === 'Tab') {
			showDropdown = false;
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const buttons = Array.from(
				dropdownRef?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? []
			);
			if (!buttons.length) return;
			const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
			const nextIndex = e.key === 'ArrowDown'
				? (currentIndex + 1) % buttons.length
				: currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
			buttons[nextIndex].focus();
		}
	}

	// Get sessions reactively
	const sessions = $derived(serverSessionsState.sessions);

	// Running count
	const runningCount = $derived(
		sessions.filter((s) => s.status === "running" || s.status === "starting")
			.length,
	);

	// Map sessions by project name for quick lookup
	const sessionsByProject = $derived.by(() => {
		const map = new Map<string, (typeof sessions)[0]>();
		for (const session of sessions) {
			map.set(session.projectName, session);
		}
		return map;
	});

	// Merge running sessions that don't have a matching configured project
	// This ensures ALL running servers appear in the dropdown, even if their
	// project doesn't have a port/serverPath in projects.json
	const allProjects = $derived.by(() => {
		const configuredKeys = new Set(projectsWithPorts.map((p) => p.key));
		const extras: ProjectWithPort[] = [];
		for (const session of sessions) {
			if (!configuredKeys.has(session.projectName)) {
				extras.push({
					key: session.projectName,
					displayName:
						session.displayName ||
						session.projectName.charAt(0).toUpperCase() +
							session.projectName.slice(1),
					port: session.port ?? 0,
					path: session.projectPath || "",
					serverPath: null,
				});
			}
		}
		return [...projectsWithPorts, ...extras];
	});

	// Total projects (configured + any running servers without config)
	const totalProjects = $derived(allProjects.length);

	// Sorted projects: running/starting first, then stopped
	const sortedProjects = $derived.by(() => {
		return [...allProjects].sort((a, b) => {
			const aSession = sessionsByProject.get(a.key);
			const bSession = sessionsByProject.get(b.key);
			const aRunning =
				aSession?.status === "running" || aSession?.status === "starting";
			const bRunning =
				bSession?.status === "running" || bSession?.status === "starting";

			// Running servers first
			if (aRunning !== bRunning) return aRunning ? -1 : 1;

			// Then alphabetically by display name
			return a.displayName.localeCompare(b.displayName);
		});
	});

	// Fetch configured projects
	async function fetchProjects() {
		try {
			const response = await fetch("/api/projects");
			if (!response.ok) return;

			const data = await response.json();
			// Filter to projects that have a port OR serverPath configured
			// Note: API returns { name: "jat", displayName: "JAT", serverPath: "...", ... }
			// where 'name' is the project key used for matching with serverSessions
			projectsWithPorts = (data.projects || [])
				.filter((p: any) => p.port || p.serverPath)
				.map((p: any) => ({
					key: p.name, // 'name' is the actual key (e.g., "jat", "chimaro")
					displayName: p.displayName || p.name.toUpperCase(),
					port: p.port || 5173, // Default to Vite's default port
					path: p.path,
					serverPath: p.serverPath || null,
				}));
		} catch (e) {
			console.error("Failed to fetch projects:", e);
		}
	}

	onMount(() => {
		fetchProjects();
		fetchServers();

		// Poll servers every 15 seconds (server status rarely changes)
		const interval = setInterval(() => fetchServers(), 15000);
		return () => clearInterval(interval);
	});

	// Dropdown handlers
	function handleMouseEnter() {
		if (dropdownTimeout) clearTimeout(dropdownTimeout);
		showDropdown = true;
	}

	function handleMouseLeave() {
		if (pendingStopProject !== null) {
			pendingStopProject = null;
			if (pendingStopTimer) {
				clearTimeout(pendingStopTimer);
				pendingStopTimer = null;
			}
		}
		dropdownTimeout = setTimeout(() => {
			showDropdown = false;
		}, 150);
	}

	// Get session for a project
	function getSessionForProject(projectKey: string) {
		return sessionsByProject.get(projectKey);
	}

	// Actions
	async function handleStart(projectKey: string) {
		loadingAction = projectKey;
		error = null;
		lastFailedAction = null;
		try {
			await startServer(projectKey);
			playServerStartSound();
		} catch (e) {
			error = `Failed to start ${projectKey}`;
			lastFailedAction = { type: 'start', projectKey };
		} finally {
			loadingAction = null;
		}
	}

	async function handleStop(projectKey: string) {
		// First click: require confirmation
		if (pendingStopProject !== projectKey) {
			pendingStopProject = projectKey;
			if (pendingStopTimer) clearTimeout(pendingStopTimer);
			pendingStopTimer = setTimeout(() => { pendingStopProject = null; }, 2000);
			return;
		}
		// Second click: confirmed
		if (pendingStopTimer) clearTimeout(pendingStopTimer);
		pendingStopProject = null;

		const session = getSessionForProject(projectKey);
		if (!session) return;

		loadingAction = projectKey;
		error = null;
		lastFailedAction = null;
		try {
			await stopServer(session.sessionName);
			playServerStopSound();
		} catch (e) {
			error = `Failed to stop ${projectKey}`;
			lastFailedAction = { type: 'stop', projectKey };
		} finally {
			loadingAction = null;
		}
	}

	async function handleRestart(projectKey: string) {
		const session = getSessionForProject(projectKey);
		if (!session) return;

		loadingAction = projectKey;
		error = null;
		lastFailedAction = null;
		try {
			await restartServer(session.sessionName);
			playServerStartSound();
		} catch (e) {
			error = `Failed to restart ${projectKey}`;
			lastFailedAction = { type: 'restart', projectKey };
		} finally {
			loadingAction = null;
		}
	}

	async function retryLastAction() {
		if (!lastFailedAction) return;
		const { type, projectKey } = lastFailedAction;
		error = null;
		lastFailedAction = null;
		if (type === 'start') await handleStart(projectKey);
		else if (type === 'stop') {
			// Bypass the confirmation guard for retry
			pendingStopProject = projectKey;
			await handleStop(projectKey);
		}
		else if (type === 'restart') await handleRestart(projectKey);
	}

	function handleOpenBrowser(port: number) {
		window.open(`http://localhost:${port}`, "_blank");
	}

	function goToServers() {
		showDropdown = false;
		goto("/servers");
	}

	// Spawn a new session for a project
	async function handleSpawnSession(projectKey: string) {
		spawningSession = true;
		error = null;
		try {
			const response = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					attach: true,
					project: projectKey,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to spawn session");
			}
			console.log("New session spawned for", projectKey, ":", data);
			// Add the session to workSessions store so it appears in project views
			if (data.session) {
				addSession(data.session);
			}
			showDropdown = false;
		} catch (e) {
			error = `Failed to spawn session: ${e instanceof Error ? e.message : String(e)}`;
			console.error("Spawn session failed:", e);
		} finally {
			spawningSession = false;
		}
	}

	// Status color
	function getStatusColor(status: string | undefined) {
		switch (status) {
			case "running":
				return "oklch(0.70 0.18 145)"; // green
			case "starting":
				return "oklch(0.70 0.15 200)"; // blue
			default:
				return "oklch(0.50 0.02 250)"; // gray
		}
	}

	// Status label
	function getStatusLabel(status: string | undefined) {
		switch (status) {
			case "running":
				return "Running";
			case "starting":
				return "Starting";
			default:
				return "Stopped";
		}
	}
</script>

<!-- Servers Badge with Dropdown -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex items-center"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<span
		bind:this={badgeRef}
		class="h-7 px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
		tabindex="0"
		role="button"
		aria-expanded={showDropdown}
		aria-haspopup="true"
		aria-controls="servers-dropdown"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (!showDropdown) {
					openedViaKeyboard = true;
					showDropdown = true;
				} else {
					showDropdown = false;
				}
			} else if (e.key === 'Escape' && showDropdown) {
				showDropdown = false;
			}
		}}
		style="
			background: oklch(0.18 0.01 250);
			border: 1px solid {runningCount > 0
			? 'oklch(0.50 0.15 145)'
			: 'oklch(0.35 0.02 250)'};
			color: {runningCount > 0 ? 'oklch(0.70 0.15 145)' : 'oklch(0.55 0.02 250)'};
		"
	>
		<!-- Server icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-3.5 h-3.5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
			/>
		</svg>

		<span class="font-medium pt-0.5">{runningCount}/{totalProjects}</span>

		<!-- WebSocket status dot -->
		<div
			class="w-1.5 h-1.5 rounded-full ml-0.5"
			class:animate-pulse={wsConfig.pulse}
			class:ws-reconnected={wsJustConnected}
			style="background: {wsConfig.color}; box-shadow: 0 0 4px {wsConfig.color};"
			title="WebSocket: {wsConfig.label}"
		></div>
	</span>

	<!-- Dropdown -->
	{#if showDropdown}
		<div
			bind:this={dropdownRef}
			class="dropdown-panel"
			id="servers-dropdown"
			role="region"
			aria-label="Dev servers"
			onkeydown={handleDropdownKeydown}
		>
			<!-- Error message -->
			{#if error}
				<div class="error-row">
					<span class="error-text">{error}</span>
					<div class="error-actions">
						{#if lastFailedAction}
							<button class="error-action-btn" onclick={retryLastAction} title="Retry">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
								</svg>
								Retry
							</button>
						{/if}
						<button class="error-action-btn error-action-dismiss" onclick={() => { error = null; lastFailedAction = null; }} title="Dismiss">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			{/if}

			<!-- Server list -->
			<div class="max-h-[300px] overflow-y-auto">
				{#if sortedProjects.length === 0}
					<div
						class="px-3 py-4 text-xs text-center"
						style="color: oklch(0.55 0.02 250);"
					>
						No projects with servers configured
					</div>
				{:else}
					{#each sortedProjects as project}
						{@const session = getSessionForProject(project.key)}
						{@const isRunning =
							session?.status === "running" || session?.status === "starting"}
						{@const isLoading = loadingAction === project.key}
						<div class="server-row" class:server-running={isRunning}>
							<!-- Project info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span
										class="text-xs font-semibold truncate"
										style="color: oklch(0.85 0.02 250);"
									>
										{project.displayName}
									</span>
									<span
										class="text-[10px] px-1.5 py-0.5 rounded font-mono"
										style="background: oklch(0.22 0.02 250); color: {getStatusColor(
											session?.status,
										)};"
									>
										{getStatusLabel(session?.status)}
									</span>
								</div>
								<div class="flex items-center gap-2 mt-0.5">
									<span
										class="text-[10px] font-mono"
										style="color: oklch(0.55 0.02 250);"
									>
										:{project.port}
									</span>
									{#if project.serverPath}
										<span
											class="text-[10px] font-mono"
											style="color: oklch(0.60 0.10 200);"
											title={project.serverPath}
										>
											{project.serverPath.split('/').pop()}
										</span>
									{/if}
								</div>
							</div>

							<!-- Actions -->
							<div class="flex items-center flex-shrink-0">
								<!-- New Session (conceptually separate from server lifecycle) -->
								<button
									class="action-btn action-btn-spawn"
									onclick={() => handleSpawnSession(project.key)}
									disabled={spawningSession}
									title="New session for {project.displayName}"
								>
									{#if spawningSession}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="w-3.5 h-3.5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 4.5v15m7.5-7.5h-15"
											/>
										</svg>
									{/if}
								</button>
								<div class="action-separator"></div>
								<!-- Server lifecycle controls — fixed 3-slot width for layout stability -->
								<div class="lifecycle-actions">
									{#if isLoading}
										<span class="loading loading-spinner loading-xs mx-auto"></span>
									{:else if isRunning}
										<!-- Open browser -->
										<button
											class="action-btn"
											onclick={() => handleOpenBrowser(project.port)}
											title="Open in browser"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-3.5 h-3.5"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
												/>
											</svg>
										</button>
										<!-- Restart -->
										<button
											class="action-btn"
											onclick={() => handleRestart(project.key)}
											title="Restart server"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-3.5 h-3.5"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
												/>
											</svg>
										</button>
										<!-- Stop: icon swaps to checkmark on first click to signal waiting for confirm -->
										<button
											class="action-btn action-btn-danger"
											class:action-btn-pending={pendingStopProject === project.key}
											onclick={() => handleStop(project.key)}
											onmouseleave={() => { if (pendingStopProject === project.key) { pendingStopProject = null; } }}
											title={pendingStopProject === project.key ? 'Click again to confirm stop' : 'Stop server'}
										>
											{#if pendingStopProject === project.key}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
													<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
												</svg>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
													<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
												</svg>
											{/if}
										</button>
									{:else}
										<!-- Placeholders maintain column width for stopped servers -->
										<div class="action-placeholder"></div>
										<div class="action-placeholder"></div>
										<!-- Start -->
										<button
											class="action-btn action-btn-success"
											onclick={() => handleStart(project.key)}
											title="Start server"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-3.5 h-3.5"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
												/>
											</svg>
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			<button class="view-all-btn" onclick={goToServers}>
				<span>View All Servers</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-3 h-3"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8.25 4.5l7.5 7.5-7.5 7.5"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	/* Dropdown panel - anchored to right since badge is on right side of TopBar */
	.dropdown-panel {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		z-index: 50;
		min-width: 280px;
		max-width: 400px;
		border-radius: 0.5rem;
		box-shadow: 0 10px 40px oklch(0 0 0 / 0.4);
		overflow: hidden;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		animation: dropdown-slide 0.2s ease-out;
		transform-origin: top right;
	}

	/* Uses global @keyframes dropdown-slide from app.css */

	/* Server row */
	.server-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border-bottom: 1px solid oklch(0.25 0.01 250);
		transition: background 0.15s ease;
	}

	.server-row:last-of-type {
		border-bottom: none;
	}

	.server-row:hover {
		background: oklch(0.22 0.02 250);
	}

	.server-running {
		background: oklch(0.2 0.04 145 / 0.15);
	}

	.server-running:hover {
		background: oklch(0.22 0.05 145 / 0.2);
	}

	/* Action buttons */
	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.action-btn:hover {
		background: oklch(0.3 0.04 250);
		color: oklch(0.85 0.02 250);
	}

	.action-btn-success {
		border-color: oklch(0.45 0.12 145 / 0.5);
		color: oklch(0.65 0.12 145);
	}

	.action-btn-success:hover {
		background: oklch(0.3 0.1 145 / 0.3);
		color: oklch(0.85 0.15 145);
	}

	.action-btn-danger {
		border-color: oklch(0.45 0.12 30 / 0.5);
		color: oklch(0.65 0.12 30);
	}

	.action-btn-danger:hover {
		background: oklch(0.3 0.1 30 / 0.3);
		color: oklch(0.85 0.15 30);
	}

	.action-btn-spawn {
		border-color: oklch(0.45 0.12 270 / 0.5);
		color: oklch(0.65 0.12 270);
	}

	.action-btn-spawn:hover {
		background: oklch(0.3 0.1 270 / 0.3);
		color: oklch(0.85 0.15 270);
	}

	.action-btn-spawn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-btn-pending {
		background: oklch(0.28 0.10 30 / 0.4);
		border-color: oklch(0.65 0.22 25 / 0.9);
		color: oklch(0.90 0.18 30);
		animation: animate-pulse-subtle 0.7s ease-in-out infinite;
	}

	/* Error row */
	.error-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.22 0.10 30 / 0.4);
		border-bottom: 1px solid oklch(0.40 0.12 30 / 0.3);
	}

	.error-text {
		flex: 1;
		font-size: 0.6875rem;
		font-family: ui-monospace, monospace;
		color: oklch(0.85 0.15 30);
		min-width: 0;
	}

	.error-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.error-action-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.45 0.12 30 / 0.5);
		background: oklch(0.28 0.10 30 / 0.4);
		color: oklch(0.80 0.15 30);
		font-size: 0.625rem;
		font-family: ui-monospace, monospace;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.error-action-btn:hover {
		background: oklch(0.35 0.12 30 / 0.5);
		color: oklch(0.95 0.18 30);
	}

	.error-action-dismiss {
		border-color: oklch(0.35 0.02 250 / 0.5);
		background: transparent;
		color: oklch(0.55 0.02 250);
	}

	.error-action-dismiss:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.75 0.02 250);
	}

	/* View All Button */
	.view-all-btn {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.625rem 0.75rem;
		background: oklch(0.22 0.04 200 / 0.5);
		border: none;
		border-top: 1px solid oklch(0.3 0.02 250);
		color: oklch(0.7 0.1 200);
		font-size: 0.7rem;
		font-weight: 500;
		font-family: ui-monospace, monospace;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.view-all-btn:hover {
		background: oklch(0.28 0.06 200 / 0.6);
		color: oklch(0.85 0.12 200);
	}

	/* Action column layout stability */
	.action-separator {
		width: 1px;
		height: 12px;
		background: oklch(0.30 0.02 250);
		margin: 0 3px;
		flex-shrink: 0;
	}

	.lifecycle-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		width: 5rem;
		flex-shrink: 0;
	}

	.action-placeholder {
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
	}

	/* WS reconnection flash — dot scales up and glows on connection re-established */
	.ws-reconnected {
		animation: ws-reconnect 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes ws-reconnect {
		0%   { transform: scale(1); }
		40%  { transform: scale(3); box-shadow: 0 0 10px oklch(0.72 0.19 145 / 0.9); }
		70%  { transform: scale(1.5); }
		100% { transform: scale(1); }
	}
</style>
