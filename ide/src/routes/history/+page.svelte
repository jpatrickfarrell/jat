<script lang="ts">
	/**
	 * Task History Page
	 *
	 * Completed task log with swarm metrics, activity calendar,
	 * per-agent attribution, and signal-data expansion.
	 */

	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import StreakCalendar from "$lib/components/StreakCalendar.svelte";
	import AnimatedDigits from "$lib/components/AnimatedDigits.svelte";
	import TaskDetailDrawer from "$lib/components/TaskDetailDrawer.svelte";
	import CompletedSignalDrawer from "$lib/components/history/CompletedSignalDrawer.svelte";
	import { HistorySkeleton } from "$lib/components/skeleton";
	import { initProjectColors, fetchAndGetProjectColors, getProjectColor } from "$lib/utils/projectColors";
	import { openTaskDrawer } from "$lib/stores/drawerStore";
	import SearchDropdown from "$lib/components/SearchDropdown.svelte";
	import type { SearchDropdownGroup } from "$lib/components/SearchDropdown.svelte";
	import CompletedDayGroup from "$lib/components/history/CompletedDayGroup.svelte";
	import { reveal } from "$lib/actions/reveal";
	import {
		type CompletedTask,
		toLocalDateStr,
		parseLocalDate,
		groupTasksByDay,
	} from "$lib/utils/completedTaskHelpers";

	interface Project {
		name: string;
		activeColor?: string;
	}

	// State
	let tasks = $state<CompletedTask[]>([]);
	let projects = $state<Project[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Project colors for dropdown
	let projectColors = $state<Record<string, string>>({});

	// Filters
	let searchQuery = $state("");
	let selectedProject = $state("");
	let searchInputEl = $state<HTMLInputElement | null>(null);

	// Project dropdown groups (All Projects + each project)
	const projectGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: [
			{ value: '', label: 'All Projects' },
			...projects.map(p => ({ value: p.name, label: p.name }))
		]
	}]);

	function getProjectColorFn(project: string): string | undefined {
		if (!project) return undefined;
		return projectColors[project.toLowerCase()] || getProjectColor(project + '-x');
	}

	// Task detail drawer (fallback for tasks without signal data)
	let selectedTaskId = $state<string | null>(null);
	let drawerOpen = $state(false);

	// Signal drawer (primary: shows EventStack completion card)
	let signalDrawerTask = $state<CompletedTask | null>(null);
	let signalDrawerOpen = $state(false);

	// Memory
	let memoryMap = $state<Map<string, string>>(new Map());
	let memoryViewerOpen = $state(false);
	let memoryContent = $state("");
	let memoryTitle = $state("");

	// Fetch data on mount
	onMount(async () => {
		// Read URL param once — $effect would re-fire on every $page re-emission
		// and reset the user's dropdown selection back to the URL value
		const projectParam = $page.url.searchParams.get("project");
		if (projectParam) selectedProject = projectParam;

		initProjectColors();
		fetchProjects();
		fetchTasks(selectedProject);
		fetchMemory();
		projectColors = await fetchAndGetProjectColors();

		function handleSlashKey(e: KeyboardEvent) {
			if (e.key !== '/') return;
			const tag = (e.target as HTMLElement).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
			e.preventDefault();
			searchInputEl?.focus();
		}
		window.addEventListener('keydown', handleSlashKey);
		return () => window.removeEventListener('keydown', handleSlashKey);
	});

	async function fetchProjects() {
		try {
			// Include stats=true to get projects sorted by last activity (most recent first)
			const response = await fetch("/api/projects?visible=true&stats=true");
			if (!response.ok) throw new Error("Failed to fetch projects");
			const data = await response.json();
			projects = data.projects || [];
		} catch (e) {
			console.error("Failed to fetch projects:", e);
		}
	}

	async function fetchTasks(project: string = '') {
		// Only show skeleton on initial load (when tasks is empty).
		// Project switches update silently so the page doesn't flash.
		if (tasks.length === 0) loading = true;
		error = null;
		try {
			const params = new URLSearchParams({ status: 'closed' });
			if (project) params.set('project', project);
			const response = await fetch(`/api/tasks?${params}`);
			if (!response.ok) throw new Error("Failed to fetch tasks");
			const data = await response.json();
			tasks = data.tasks || [];
		} catch (e) {
			error = e instanceof Error ? e.message : "Unknown error";
		} finally {
			loading = false;
		}
	}

	async function fetchMemory() {
		try {
			const response = await fetch("/api/projects?visible=true");
			if (!response.ok) return;
			const data = await response.json();
			const projectNames: string[] = (data.projects || []).map((p: Project) => p.name);

			const map = new Map<string, string>();
			await Promise.all(
				projectNames.map(async (name) => {
					try {
						const res = await fetch(`/api/memory?action=browse&project=${encodeURIComponent(name)}`);
						if (!res.ok) return;
						const memData = await res.json();
						for (const file of memData.files || []) {
							if (file.task) {
								map.set(file.task, file.filename);
							}
						}
					} catch {}
				})
			);
			memoryMap = map;
		} catch (e) {
			console.error("Failed to fetch memory:", e);
		}
	}

	async function handleMemoryClick(event: MouseEvent, filename: string, task: CompletedTask) {
		event.stopPropagation();
		const project = task.project || task.id.split("-")[0];
		try {
			const res = await fetch(`/api/memory?action=file&project=${encodeURIComponent(project)}&filename=${encodeURIComponent(filename)}`);
			if (!res.ok) return;
			const data = await res.json();
			memoryTitle = filename.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
			memoryContent = data.content || "";
			memoryViewerOpen = true;
		} catch (e) {
			console.error("Failed to fetch memory file:", e);
		}
	}

	// Filtered tasks — project filtering is server-side (fetchTasks re-fetches on project change)
	// Client-side only handles search query
	const filteredTasks = $derived.by(() => {
		if (!searchQuery.trim()) return tasks;
		const query = searchQuery.toLowerCase();
		return tasks.filter((task) => {
			const matchesTitle = task.title.toLowerCase().includes(query);
			// Exact ID match — avoid "jat-abc" matching "jat-abc.1"
			const matchesId = task.id.toLowerCase() === query;
			return matchesTitle || matchesId;
		});
	});

	// Calculate statistics
	const stats = $derived.by(() => {
		if (filteredTasks.length === 0)
			return {
				totalCompleted: 0,
				todayCount: 0,
				thisWeekCount: 0,
				topAgent: null as { name: string; count: number } | null,
				topProject: null as { name: string; count: number } | null,
				avgPerDay: 0,
			};

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

		const weekAgo = new Date(today);
		weekAgo.setDate(weekAgo.getDate() - 7);

		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		let todayCount = 0;
		let thisWeekCount = 0;
		let last30Count = 0;

		const agentCounts = new Map<string, number>();
		const projectCounts = new Map<string, number>();

		for (const task of filteredTasks) {
			const dateStr = toLocalDateStr(task.closed_at || task.updated_at);
			if (!dateStr) continue;
			const date = parseLocalDate(dateStr);

			if (dateStr === todayStr) todayCount++;
			if (date >= weekAgo) thisWeekCount++;
			if (date >= thirtyDaysAgo) last30Count++;

			if (task.assignee) {
				agentCounts.set(task.assignee, (agentCounts.get(task.assignee) || 0) + 1);
			}
			const project = task.project || task.id.split('-')[0];
			if (project) {
				projectCounts.set(project, (projectCounts.get(project) || 0) + 1);
			}
		}

		const topAgentEntry = [...agentCounts.entries()].sort((a, b) => b[1] - a[1])[0];
		const topProjectEntry = [...projectCounts.entries()].sort((a, b) => b[1] - a[1])[0];

		return {
			totalCompleted: filteredTasks.length,
			todayCount,
			thisWeekCount,
			topAgent: topAgentEntry ? { name: topAgentEntry[0], count: topAgentEntry[1] } : null,
			topProject: topProjectEntry ? { name: topProjectEntry[0], count: topProjectEntry[1] } : null,
			avgPerDay: last30Count / 30,
		};
	});

	// Group tasks by day for the list view
	const tasksByDay = $derived(groupTasksByDay(filteredTasks));

	function handleTaskClick(taskId: string) {
		const task = tasks.find((t) => t.id === taskId);
		if (task?.assignee) {
			// Has an agent — show EventStack completion card
			signalDrawerTask = task;
			signalDrawerOpen = true;
		} else {
			// No agent (manual task, imported, etc.) — fall back to task detail
			selectedTaskId = taskId;
			drawerOpen = true;
		}
	}

	async function handleSignalDrawerCreateTasks(suggestedTasks: any[]) {
		const results: { success: { title: string; taskId?: string }[]; failed: { title: string; error: string }[] } = { success: [], failed: [] };
		for (const t of suggestedTasks) {
			if (!t.selected) continue;
			try {
				const project = t.edits?.project || t.project || (signalDrawerTask?.project ?? signalDrawerTask?.id.split('-')[0] ?? '');
				const body = {
					title: t.edits?.title || t.title,
					description: t.edits?.description || t.description || '',
					issue_type: t.edits?.type || t.type || 'task',
					priority: t.edits?.priority ?? t.priority ?? 2,
					project,
					labels: t.edits?.labels ? t.edits.labels.split(',').map((l: string) => l.trim()).filter(Boolean) : (t.labels || []),
				};
				const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
				if (res.ok) {
					const data = await res.json();
					results.success.push({ title: body.title, taskId: data.task?.id });
				} else {
					results.failed.push({ title: body.title, error: 'API error' });
				}
			} catch (e: any) {
				results.failed.push({ title: t.title, error: e.message || 'Unknown error' });
			}
		}
		return results;
	}

	// Track which tasks are resuming
	let resumingTasks = $state<Set<string>>(new Set());
	let resumeError = $state<string | null>(null);

	async function handleResumeSession(event: MouseEvent, task: CompletedTask) {
		event.stopPropagation(); // Don't open drawer when clicking resume

		if (!task.assignee) return;

		resumingTasks.add(task.id);
		resumingTasks = new Set(resumingTasks);

		try {
			const response = await fetch(`/api/sessions/${task.assignee}/resume`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				resumeError = data.message || "Failed to resume session";
				setTimeout(() => { resumeError = null; }, 5000);
			}
		} catch (error) {
			console.error("Error resuming session:", error);
		} finally {
			resumingTasks.delete(task.id);
			resumingTasks = new Set(resumingTasks);
		}
	}

	async function handleReopenTask(event: MouseEvent, task: CompletedTask) {
		event.stopPropagation();
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "open" }),
			});
			if (response.ok) {
				// Remove from local tasks list and re-derive
				tasks = tasks.filter((t) => t.id !== task.id);
			}
		} catch (error) {
			console.error("Error reopening task:", error);
		}
	}

	function handleDuplicateTask(event: MouseEvent, task: CompletedTask) {
		event.stopPropagation();
		const project = task.project || task.id.split("-")[0];
		openTaskDrawer(project, task.title, "task", task.issue_type);
	}
</script>

<svelte:head>
	<title>Task History | JAT IDE</title>
	<meta name="description" content="View completed task history with streak calendar and productivity metrics." />
	<meta property="og:title" content="Task History | JAT IDE" />
	<meta property="og:description" content="View completed task history with streak calendar and productivity metrics." />
	<meta property="og:image" content="/favicons/history.svg" />
	<link rel="icon" href="/favicons/history.svg" />
</svelte:head>

<div class="history-page min-h-screen bg-base-200">
	<!-- Main Content -->
	<div class="p-6">
		{#if loading}
			<HistorySkeleton dayGroups={5} tasksPerGroup={4} />
		{:else if error}
			<div
				class="error-state flex flex-col items-center justify-center py-20 gap-3"
			>
				<p class="text-error">{error}</p>
				<button class="btn btn-sm btn-outline" onclick={() => fetchTasks(selectedProject)}
					>Retry</button
				>
			</div>
		{:else}
			<!-- Header + Calendar: side-by-side on wide screens -->
			<div class="header-calendar-row mb-4">
			<!-- Left: title/instruments/filters column -->
			<div class="header-left">
			<!-- Page Header: Title + Instrument Strip -->
			<div class="page-header">
				<h1 class="page-title tracking-in-expand">Task History</h1>
				<div class="instrument-strip">
					<div class="instr-reading" use:reveal={{ animation: 'scale-in-center' }}>
						<span class="instr-value"><AnimatedDigits value={stats.totalCompleted.toString()} /></span>
						<span class="instr-label">total</span>
					</div>
					<div class="instr-divider"></div>
					<div class="instr-reading" use:reveal={{ animation: 'scale-in-center', delay: 0.05 }}>
						<span class="instr-value" class:instr-today={stats.todayCount > 0} class:instr-today-zero={stats.todayCount === 0}><AnimatedDigits value={stats.todayCount.toString()} /></span>
						<span class="instr-label">today</span>
					</div>
					<div class="instr-divider"></div>
					<div class="instr-reading" use:reveal={{ animation: 'scale-in-center', delay: 0.1 }}>
						<span class="instr-value">{stats.thisWeekCount}</span>
						<span class="instr-label">this week</span>
					</div>
					{#if stats.topAgent}
					<div class="instr-divider"></div>
					<div class="instr-reading" use:reveal={{ animation: 'scale-in-center', delay: 0.15 }}>
						<span class="instr-value instr-agent">{stats.topAgent.name}</span>
						<span class="instr-label">top agent · {stats.topAgent.count}×</span>
					</div>
					{/if}
					{#if stats.topProject && !selectedProject}
					<div class="instr-divider"></div>
					<div class="instr-reading" use:reveal={{ animation: 'scale-in-center', delay: 0.2 }}>
						<span class="instr-value instr-project">{stats.topProject.name}</span>
						<span class="instr-label">top project · {stats.topProject.count}×</span>
					</div>
					{/if}
					<div class="instr-divider"></div>
					<div class="instr-reading" use:reveal={{ animation: 'scale-in-center', delay: 0.25 }}>
						<span class="instr-value">{isNaN(stats.avgPerDay) ? '—' : stats.avgPerDay.toFixed(1)}</span>
						<span class="instr-label">avg/day (30d)</span>
					</div>
				</div>
			</div>

			<!-- Filters: immediately below instruments so stats ↔ controls are coupled -->
			<div class="filters-bar">
				<input
					type="text"
					placeholder="Search tasks..."
					class="industrial-input w-48"
					bind:value={searchQuery}
					bind:this={searchInputEl}
				/>
				<div style="min-width: 140px;">
					<SearchDropdown
						value={selectedProject}
						groups={projectGroups}
						placeholder="All Projects"
						colorFn={getProjectColorFn}
						variant="chip"
						onChange={(v) => { selectedProject = v; fetchTasks(v); }}
					/>
				</div>
				{#if searchQuery || selectedProject}
					<button
						type="button"
						class="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content"
						onclick={() => {
							searchQuery = "";
							selectedProject = "";
							fetchTasks("");
						}}
					>
						Clear filters
					</button>
				{/if}
			</div>
			</div><!-- end header-left -->

			<!-- Activity Calendar -->
			<div class="calendar-row" use:reveal>
				<StreakCalendar tasks={filteredTasks} weeks={16} />
			</div>
			</div><!-- end header-calendar-row -->

			<!-- Daily Breakdown -->
			<section class="daily-section">
				{#if resumeError}
				<div class="resume-error-toast">
					<span>{resumeError}</span>
					<button type="button" class="resume-error-close" onclick={() => resumeError = null}>×</button>
				</div>
				{/if}

				<div class="day-list">
					{#each tasksByDay as day, i (day.date)}
						<div use:reveal={{ animation: 'fade-in', delay: i * 0.08 }}>
						<CompletedDayGroup
							{day}
							onTaskClick={handleTaskClick}
							onResumeSession={handleResumeSession}
							onMemoryClick={handleMemoryClick}
							onReopenTask={handleReopenTask}
							onDuplicateTask={handleDuplicateTask}
							{resumingTasks}
							{memoryMap}
						/>
						</div>
					{/each}

					{#if tasksByDay.length === 0}
						{#if searchQuery || selectedProject}
							<div class="empty-state empty-state-filtered">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
									<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
								</svg>
								<p class="empty-filtered-msg">
									{#if searchQuery && selectedProject}
										No results for "<span class="empty-term">{searchQuery}</span>" in <span class="empty-term">{selectedProject}</span>
									{:else if searchQuery}
										No results for "<span class="empty-term">{searchQuery}</span>"
									{:else}
										No completed tasks in <span class="empty-term">{selectedProject}</span>
									{/if}
									<button type="button" class="empty-clear-btn" onclick={() => { searchQuery = ""; selectedProject = ""; fetchTasks(""); }}>Clear</button>
								</p>
							</div>
						{:else}
							<div class="empty-state">
								<p class="empty-hint">Tasks will appear here when marked complete</p>
							</div>
						{/if}
					{/if}
				</div>
			</section>
		{/if}
	</div>
</div>

<!-- Signal Drawer (primary: shows EventStack completion card) -->
<CompletedSignalDrawer
	bind:task={signalDrawerTask}
	bind:isOpen={signalDrawerOpen}
	onCreateTasks={handleSignalDrawerCreateTasks}
/>

<!-- Task Detail Drawer (fallback for tasks without an agent) -->
<TaskDetailDrawer bind:taskId={selectedTaskId} bind:isOpen={drawerOpen} />

<!-- Memory Viewer Drawer -->
{#if memoryViewerOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="memory-overlay" role="presentation" onclick={() => (memoryViewerOpen = false)} onkeydown={(e) => e.key === "Escape" && (memoryViewerOpen = false)}></div>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="memory-drawer" role="dialog" aria-label="Memory viewer" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === "Escape" && (memoryViewerOpen = false)}>
		<div class="memory-header">
			<h3 class="memory-header-title">{memoryTitle}</h3>
			<button type="button" class="memory-close" aria-label="Close memory viewer" onclick={() => (memoryViewerOpen = false)}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		<pre class="memory-body">{memoryContent}</pre>
	</div>
{/if}

<style>
	/* Header + calendar wrapper */
	.header-calendar-row {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Left column: title + instruments + filters stacked */
	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	@media (min-width: 1280px) {
		.header-calendar-row {
			flex-direction: row;
			align-items: flex-start;
			gap: 1.5rem;
		}

		.header-left {
			flex: 1;
			min-width: 0;
		}

		.header-calendar-row .calendar-row {
			flex-shrink: 0;
		}
	}

	/* Page header: title + instrument strip */
	.page-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.page-header {
			flex-direction: row;
			align-items: center;
			gap: 1.5rem;
		}
	}

	.page-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: oklch(from var(--color-base-content) l c h / 60%);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		white-space: nowrap;
		font-family: system-ui, -apple-system, sans-serif;
	}

	@media (min-width: 640px) {
		.page-title {
			padding-right: 1.5rem;
			border-right: 1px solid var(--color-base-300);
		}
	}

	/* Instrument strip: borderless horizontal readout row, compresses before wrapping */
	.instrument-strip {
		display: flex;
		align-items: stretch;
		flex-wrap: nowrap;
		overflow-x: auto;
		gap: 0;
		scrollbar-width: none;
	}

	.instrument-strip::-webkit-scrollbar {
		display: none;
	}

	.instr-reading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0;
		gap: 0.1rem;
		flex-shrink: 0;
	}

	.instr-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-base-content);
		font-family: ui-monospace, monospace;
		line-height: 1;
	}

	.instr-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: oklch(from var(--color-base-content) l c h / 40%);
		font-family: system-ui, -apple-system, sans-serif;
		white-space: nowrap;
	}

	.instr-divider {
		width: 1px;
		height: 2rem;
		background: var(--color-base-300);
		flex-shrink: 0;
		margin: 0 1rem;
	}

	.instr-today   { color: oklch(0.78 0.16 85); }
	.instr-today-zero { color: oklch(from var(--color-base-content) l c h / 35%); }
	.instr-agent   { color: oklch(0.62 0.16 145); font-size: 0.9rem; }
	.instr-project { color: oklch(0.65 0.14 200); font-size: 0.9rem; }

	/* Activity calendar row */
	.calendar-row {
		background: var(--color-base-100);
		border: 1px solid var(--color-base-300);
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow-x: auto;
	}

	/* Daily Section */
	.daily-section {
		flex: 1;
		border-top: 1px solid var(--color-base-300);
		padding-top: 1rem;
		margin-top: 0.25rem;
	}

	/* Filters Bar — lives inside header-left, directly below instruments */
	.filters-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.375rem 0 0;
	}

	/* Resume error toast — fixed bottom-center pill */
	.resume-error-toast {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.875rem 0.5rem 1rem;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.55 0.20 25 / 0.55);
		border-radius: 999px;
		font-size: 0.8rem;
		color: oklch(0.78 0.16 25);
		font-family: system-ui, -apple-system, sans-serif;
		box-shadow: 0 4px 20px oklch(0 0 0 / 35%);
		white-space: nowrap;
		animation: toast-enter 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	@keyframes toast-enter {
		from { opacity: 0; transform: translateX(-50%) translateY(6px); }
		to   { opacity: 1; transform: translateX(-50%) translateY(0); }
	}

	.resume-error-close {
		background: none;
		border: none;
		color: oklch(0.55 0.12 25);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		padding: 0 0.125rem;
		flex-shrink: 0;
	}

	.resume-error-close:hover {
		color: oklch(0.80 0.18 25);
	}

	@media (prefers-reduced-motion: reduce) {
		.resume-error-toast { animation: none; }
	}

	.day-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Error & Empty States */
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
		color: oklch(from var(--color-base-content) l c h / 60%);
		text-align: center;
		gap: 0.75rem;
	}

	.empty-icon {
		width: 32px;
		height: 32px;
		color: oklch(from var(--color-base-content) l c h / 35%);
	}

	.empty-hint {
		font-size: 0.8rem;
		color: oklch(from var(--color-base-content) l c h / 40%);
	}

	/* Filtered empty state: icon + inline message + clear link */
	.empty-state-filtered {
		flex-direction: row;
		padding: 1.5rem 1rem;
		gap: 0.625rem;
		justify-content: flex-start;
		align-items: center;
	}

	.empty-filtered-msg {
		font-size: 0.8rem;
		color: oklch(from var(--color-base-content) l c h / 55%);
		font-family: system-ui, -apple-system, sans-serif;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.empty-term {
		color: oklch(from var(--color-base-content) l c h / 80%);
		font-weight: 600;
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
	}

	.empty-clear-btn {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.62 0.14 240);
		background: none;
		border: none;
		padding: 0 0.25rem;
		cursor: pointer;
		font-family: system-ui, -apple-system, sans-serif;
		margin-left: 0.125rem;
	}

	.empty-clear-btn:hover {
		color: oklch(0.75 0.16 240);
	}

	/* Memory Viewer Drawer */
	.memory-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 40%);
		z-index: 49;
	}

	.memory-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(520px, 92vw);
		background: var(--color-base-100);
		border-left: 1px solid var(--color-base-300);
		display: flex;
		flex-direction: column;
		box-shadow: -6px 0 32px oklch(0 0 0 / 25%);
		z-index: 50;
		animation: memory-drawer-enter 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	@keyframes memory-drawer-enter {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.memory-drawer { animation: none; }
	}

	.memory-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-base-300);
	}

	.memory-header-title {
		font-size: 0.85rem;
		font-weight: 600;
		font-family: ui-monospace, monospace;
		color: var(--color-base-content);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.memory-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: oklch(from var(--color-base-content) l c h / 50%);
		cursor: pointer;
		flex-shrink: 0;
	}

	.memory-close:hover {
		background: var(--color-base-200);
		color: var(--color-base-content);
	}

	.memory-body {
		padding: 1rem;
		overflow-y: auto;
		font-size: 0.8rem;
		line-height: 1.6;
		color: oklch(from var(--color-base-content) l c h / 80%);
		font-family: ui-monospace, monospace;
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}
</style>
