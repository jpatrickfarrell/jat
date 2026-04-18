<script lang="ts">
	import { onMount } from "svelte";
	import {
		getPriorityBadge,
		getTaskStatusBadge,
		getTypeBadge,
	} from "$lib/utils/badgeHelpers";
	import { formatRelativeTime } from "$lib/utils/dateFormatters";

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string | null;
		requester?: string | null;
		labels?: string[];
		project?: string;
		created_at?: string;
		updated_at?: string;
	}

	type FocusZone = "list" | "detail" | "compose";

	let tasks = $state<Task[]>([]);
	let selectedIdx = $state(0);
	let panelOpen = $state(false);
	let focusZone = $state<FocusZone>("list");

	let loading = $state(true);
	let error = $state<string | null>(null);

	const selectedTask = $derived<Task | null>(tasks[selectedIdx] ?? null);

	async function fetchTasks() {
		loading = true;
		error = null;
		try {
			// API accepts a single status per request — fetch both in parallel.
			const [submittedRes, openRes] = await Promise.all([
				fetch("/api/tasks?status=submitted"),
				fetch("/api/tasks?status=open"),
			]);
			if (!submittedRes.ok || !openRes.ok) {
				throw new Error(
					`Fetch failed (${submittedRes.status}/${openRes.status})`,
				);
			}
			const submittedJson = await submittedRes.json();
			const openJson = await openRes.json();
			const combined: Task[] = [
				...(submittedJson.tasks ?? []),
				...(openJson.tasks ?? []),
			];

			// Sort: priority asc (0 = highest), then created_at asc (oldest first).
			combined.sort((a, b) => {
				const pa = a.priority ?? 99;
				const pb = b.priority ?? 99;
				if (pa !== pb) return pa - pb;
				const ca = a.created_at ?? "";
				const cb = b.created_at ?? "";
				return ca.localeCompare(cb);
			});

			tasks = combined;
			selectedIdx = Math.min(selectedIdx, Math.max(0, tasks.length - 1));
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	}

	function selectTask(idx: number) {
		if (idx < 0 || idx >= tasks.length) return;
		selectedIdx = idx;
		panelOpen = true;
		focusZone = "detail";
	}

	onMount(() => {
		fetchTasks();
	});
</script>

<svelte:head>
	<title>Tasks Fast · Inbox</title>
</svelte:head>

<div
	class="tasks-fast-layout"
	class:split={panelOpen}
	class:list-only={!panelOpen}
>
	<!-- LEFT: TASK LIST -->
	<section class="list-panel" aria-label="Task list">
		<header class="panel-header">
			<h1 class="panel-title">Inbox</h1>
			<span class="panel-count">
				{tasks.length}
				{tasks.length === 1 ? "task" : "tasks"}
			</span>
		</header>

		{#if loading}
			<div class="state-message">Loading tasks…</div>
		{:else if error}
			<div class="state-message state-error">
				<p>Failed to load tasks: {error}</p>
				<button class="btn btn-sm btn-primary" onclick={fetchTasks}>
					Retry
				</button>
			</div>
		{:else if tasks.length === 0}
			<div class="state-message">No submitted or open tasks.</div>
		{:else}
			<ul class="task-list" role="listbox" aria-label="Tasks">
				{#each tasks as task, idx (task.id)}
					{@const isSelected = idx === selectedIdx}
					<li>
						<button
							type="button"
							class="task-row"
							class:selected={isSelected}
							role="option"
							aria-selected={isSelected}
							onclick={() => selectTask(idx)}
						>
							<span
								class="status-dot badge badge-xs {getTaskStatusBadge(task.status)}"
								aria-hidden="true"
							></span>
							<span class="task-id">{task.id}</span>
							<span
								class="priority-badge badge badge-sm {getPriorityBadge(task.priority)}"
							>
								P{task.priority ?? "?"}
							</span>
							<span
								class="type-badge badge badge-sm {getTypeBadge(task.issue_type)}"
							>
								{task.issue_type ?? "task"}
							</span>
							<span class="task-title">{task.title}</span>
							{#if task.created_at}
								<span class="task-age"
									>{formatRelativeTime(task.created_at)}</span
								>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- RIGHT: DETAIL PANEL -->
	<section class="detail-panel" aria-label="Task detail">
		{#if !panelOpen || !selectedTask}
			<div class="state-message state-muted">
				Select a task to view details.
			</div>
		{:else}
			{@const t = selectedTask}
			<header class="detail-header">
				<div class="detail-title-row">
					<h2 class="detail-title">{t.title}</h2>
				</div>
				<div class="detail-badges">
					<span class="badge badge-sm badge-outline">{t.id}</span>
					<span class="badge badge-sm {getTypeBadge(t.issue_type)}">
						{t.issue_type ?? "task"}
					</span>
					<span class="badge badge-sm {getPriorityBadge(t.priority)}">
						P{t.priority ?? "?"}
					</span>
					<span class="badge badge-sm {getTaskStatusBadge(t.status)}">
						{t.status}
					</span>
					{#if t.project}
						<span class="badge badge-sm badge-ghost">{t.project}</span>
					{/if}
				</div>
			</header>

			<div class="detail-meta">
				{#if t.assignee}
					<span><strong>Assignee:</strong> {t.assignee}</span>
				{/if}
				{#if t.requester}
					<span><strong>Requester:</strong> {t.requester}</span>
				{/if}
				{#if t.created_at}
					<span
						><strong>Created:</strong> {formatRelativeTime(t.created_at)}</span
					>
				{/if}
			</div>

			{#if t.description}
				<div class="detail-description">{t.description}</div>
			{:else}
				<div class="state-message state-muted">No description.</div>
			{/if}

			<footer class="detail-footer">
				<span class="detail-footer-note">
					Detail panel scaffold. Comments + compose: jat-nm0nq.3.
				</span>
			</footer>
		{/if}
	</section>
</div>

<style>
	.tasks-fast-layout {
		display: grid;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		/* Enter/exit transition covers task jat-nm0nq.7 polish — defined here so
		   later animation work can just tune easing/duration. */
		transition: grid-template-columns 200ms
			cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.tasks-fast-layout.list-only {
		grid-template-columns: 1fr 0px;
	}

	.tasks-fast-layout.split {
		grid-template-columns: 38fr 62fr;
	}

	/* Below 1280px: list takes full width, detail panel is hidden.
	   (Overlay drawer fallback for small screens lands in a later task.) */
	@media (max-width: 1279px) {
		.tasks-fast-layout,
		.tasks-fast-layout.split,
		.tasks-fast-layout.list-only {
			grid-template-columns: 1fr;
		}
		.detail-panel {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tasks-fast-layout {
			transition: none;
		}
	}

	.list-panel,
	.detail-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}

	.list-panel {
		border-right: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.detail-panel {
		background: oklch(var(--b1, 0.14 0.01 250));
	}

	.panel-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.panel-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	.panel-count {
		font-size: 0.75rem;
		opacity: 0.65;
	}

	.task-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1 1 auto;
	}

	.task-row {
		display: grid;
		grid-template-columns: auto auto auto auto 1fr auto;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 1rem;
		background: transparent;
		border: 0;
		border-left: 3px solid transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.8125rem;
		color: inherit;
		transition: background-color 0.1s ease;
	}

	.task-row:hover {
		background: oklch(0.22 0.02 250 / 0.5);
	}

	.task-row.selected {
		background: oklch(0.70 0.18 240 / 0.12);
		border-left-color: oklch(0.70 0.18 240);
	}

	.task-row:focus-visible {
		outline: 2px solid oklch(0.70 0.18 240);
		outline-offset: -2px;
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		padding: 0;
		border-radius: 999px;
	}

	.task-id {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.75rem;
		opacity: 0.7;
		white-space: nowrap;
	}

	.priority-badge,
	.type-badge {
		white-space: nowrap;
	}

	.task-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-age {
		font-size: 0.7rem;
		opacity: 0.55;
		white-space: nowrap;
	}

	.detail-header {
		padding: 1rem 1.25rem 0.75rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.detail-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
	}

	.detail-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.detail-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
		font-size: 0.8125rem;
		opacity: 0.85;
	}

	.detail-description {
		padding: 1rem 1.25rem;
		font-size: 0.875rem;
		line-height: 1.5;
		white-space: pre-wrap;
		overflow-y: auto;
		flex: 1 1 auto;
	}

	.detail-footer {
		padding: 0.5rem 1.25rem;
		border-top: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.detail-footer-note {
		font-size: 0.75rem;
		opacity: 0.55;
	}

	.state-message {
		padding: 2rem;
		text-align: center;
		font-size: 0.875rem;
		opacity: 0.75;
	}

	.state-message.state-muted {
		opacity: 0.5;
	}

	.state-error {
		color: oklch(0.70 0.18 25);
	}

	.state-error .btn {
		margin-top: 0.75rem;
	}
</style>
