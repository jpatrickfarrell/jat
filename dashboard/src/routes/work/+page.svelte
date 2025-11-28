<script lang="ts">
	/**
	 * Work Page
	 * Shows active Claude Code work sessions with TaskTable below.
	 *
	 * Layout: WorkPanel (horizontal scroll) + TaskTable below
	 * Similar to /dash layout pattern.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import TaskTable from '$lib/components/agents/TaskTable.svelte';
	import WorkPanel from '$lib/components/work/WorkPanel.svelte';
	import TaskDetailDrawer from '$lib/components/TaskDetailDrawer.svelte';
	import {
		workSessionsState,
		fetch as fetchSessions,
		spawn,
		kill,
		sendInput,
		interrupt,
		sendEnter,
		startPolling,
		stopPolling
	} from '$lib/stores/workSessions.svelte.js';

	// Task state
	let tasks = $state<any[]>([]);
	let allTasks = $state<any[]>([]);
	let agents = $state<any[]>([]);
	let reservations = $state<any[]>([]);
	let selectedProject = $state('All Projects');
	let isInitialLoad = $state(true);

	// Drawer state
	let drawerOpen = $state(false);
	let selectedTaskId = $state<string | null>(null);

	// Sync selectedProject from URL params
	$effect(() => {
		const projectParam = $page.url.searchParams.get('project');
		if (projectParam && projectParam !== 'All Projects') {
			selectedProject = projectParam;
		} else {
			selectedProject = 'All Projects';
		}
	});

	// Refetch data whenever selectedProject changes
	$effect(() => {
		selectedProject;
		fetchTaskData();
	});

	// Fetch task data
	async function fetchTaskData() {
		try {
			let url = '/api/agents?full=true';
			if (selectedProject && selectedProject !== 'All Projects') {
				url += `&project=${encodeURIComponent(selectedProject)}`;
			}

			const response = await fetch(url);
			const data = await response.json();

			if (data.error) {
				console.error('API error:', data.error);
				return;
			}

			agents = data.agents || [];
			reservations = data.reservations || [];
			tasks = data.tasks || [];

			if (selectedProject === 'All Projects') {
				allTasks = data.tasks || [];
			}
		} catch (error) {
			console.error('Failed to fetch task data:', error);
		} finally {
			isInitialLoad = false;
		}
	}

	// Event Handlers for WorkPanel

	async function handleSpawnForTask(taskId: string) {
		const session = await spawn(taskId);
		if (session) {
			await fetchTaskData();
		}
	}

	async function handleKillSession(sessionName: string) {
		const success = await kill(sessionName);
		if (success) {
			await fetchTaskData();
		}
	}

	async function handleInterrupt(sessionName: string) {
		await interrupt(sessionName);
	}

	async function handleContinue(sessionName: string) {
		await sendEnter(sessionName);
	}

	async function handleSendInput(sessionName: string, input: string, type: 'text' | 'key') {
		const inputType = type === 'key' ? 'raw' : 'text';
		await sendInput(sessionName, input, inputType);
	}

	// Handle task click
	function handleTaskClick(taskId: string) {
		selectedTaskId = taskId;
		drawerOpen = true;
	}

	// Refetch on drawer close
	let wasDrawerOpen = false;
	$effect(() => {
		if (wasDrawerOpen && !drawerOpen) {
			fetchTaskData();
			fetchSessions();
		}
		wasDrawerOpen = drawerOpen;
	});

	// Auto-refresh task data every 15 seconds
	$effect(() => {
		const interval = setInterval(fetchTaskData, 15000);
		return () => clearInterval(interval);
	});

	onMount(() => {
		fetchTaskData();
		startPolling(500);
	});

	onDestroy(() => {
		stopPolling();
	});
</script>

<div class="min-h-screen bg-base-200 flex flex-col">
	<!-- Work Sessions (horizontal scroll) -->
	<div class="border-b border-base-300 bg-base-100">
		{#if isInitialLoad}
			<div class="flex items-center justify-center h-48">
				<div class="text-center">
					<span class="loading loading-bars loading-lg mb-4"></span>
					<p class="text-sm text-base-content/60">Loading work sessions...</p>
				</div>
			</div>
		{:else}
			<WorkPanel
				workSessions={workSessionsState.sessions}
				onSpawnForTask={handleSpawnForTask}
				onKillSession={handleKillSession}
				onInterrupt={handleInterrupt}
				onContinue={handleContinue}
				onSendInput={handleSendInput}
				onTaskClick={handleTaskClick}
			/>
		{/if}
	</div>

	<!-- Task Table -->
	<div class="flex-1 overflow-auto bg-base-100">
		{#if isInitialLoad}
			<div class="flex items-center justify-center h-48">
				<div class="text-center">
					<span class="loading loading-bars loading-lg mb-4"></span>
					<p class="text-sm text-base-content/60">Loading tasks...</p>
				</div>
			</div>
		{:else}
			<TaskTable
				{tasks}
				{allTasks}
				{agents}
				{reservations}
				ontaskclick={handleTaskClick}
			/>
		{/if}
	</div>

	<!-- Task Detail Drawer -->
	<TaskDetailDrawer
		bind:taskId={selectedTaskId}
		bind:isOpen={drawerOpen}
	/>
</div>
