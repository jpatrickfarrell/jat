<script lang="ts">
	/**
	 * TaskPeekContent — lightweight task preview rendered inside PeekDrawer.
	 *
	 * Intentionally thinner than TaskDetailDrawer: fetches the task, renders
	 * title / status / priority / description / labels / dependencies, and
	 * links to the full detail drawer. Not editable.
	 */

	import { openTaskDetailDrawer } from '$lib/stores/drawerStore';

	let { taskId }: { taskId: string } = $props();

	interface TaskPeek {
		id: string;
		title: string;
		description: string | null;
		status: string;
		priority: number | null;
		issue_type: string;
		assignee_name: string | null;
		labels: string[] | null;
		project: string | null;
		depends_on: Array<{ id: string; title: string; status: string }> | null;
		blocked_by: Array<{ id: string; title: string; status: string }> | null;
		updated_at: string | null;
	}

	let task = $state<TaskPeek | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		const id = taskId;
		if (!id) return;
		loadTask(id);
	});

	async function loadTask(id: string) {
		loading = true;
		error = null;
		task = null;
		try {
			const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`);
			if (!res.ok) {
				error = `Failed to load task (${res.status})`;
				return;
			}
			const data = await res.json();
			task = data?.task ?? data ?? null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function statusColor(s: string): string {
		switch (s) {
			case 'open':
				return 'oklch(0.70 0.18 240)';
			case 'in_progress':
				return 'oklch(0.75 0.15 85)';
			case 'waiting':
			case 'blocked':
				return 'oklch(0.70 0.20 25)';
			case 'submitted':
			case 'accepted':
				return 'oklch(0.70 0.15 200)';
			case 'closed':
			case 'deployed':
				return 'oklch(0.65 0.20 145)';
			default:
				return 'oklch(0.60 0.02 250)';
		}
	}

	function priorityLabel(p: number | null): string {
		if (p === null || p === undefined) return 'P?';
		return `P${p}`;
	}
</script>

<div class="task-peek">
	{#if loading}
		<div class="task-peek-loading flex items-center gap-2 p-6 text-sm opacity-70">
			<span class="loading loading-spinner loading-sm"></span>
			<span>Loading {taskId}…</span>
		</div>
	{:else if error}
		<div class="task-peek-error p-6 text-sm">
			<p class="font-medium">Couldn't load {taskId}</p>
			<p class="mt-1 opacity-70">{error}</p>
			<button class="btn btn-xs btn-ghost mt-3" onclick={() => loadTask(taskId)}>
				Retry
			</button>
		</div>
	{:else if task}
		<article class="flex flex-col gap-4 p-5">
			<header class="flex items-start gap-3">
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<span class="task-peek-id font-mono text-xs">{task.id}</span>
						<span
							class="task-peek-chip text-[11px] uppercase tracking-wide"
							style="background: {statusColor(task.status)}; color: oklch(0.12 0 0);"
						>
							{task.status.replace(/_/g, ' ')}
						</span>
						<span class="task-peek-chip text-[11px]">{priorityLabel(task.priority)}</span>
						<span class="task-peek-chip text-[11px] capitalize">{task.issue_type}</span>
					</div>
				</div>
			</header>

			<h1 class="task-peek-title text-lg font-semibold leading-snug">{task.title}</h1>

			{#if task.assignee_name}
				<div class="text-sm opacity-80">
					<span class="opacity-60">Assigned:</span>
					<span class="font-medium">{task.assignee_name}</span>
				</div>
			{/if}

			{#if task.labels && task.labels.length > 0}
				<div class="flex flex-wrap gap-1">
					{#each task.labels as label}
						<span class="task-peek-chip text-[11px]">{label}</span>
					{/each}
				</div>
			{/if}

			{#if task.description}
				<section class="flex flex-col gap-1">
					<h2 class="task-peek-section-title text-xs uppercase tracking-wide">Description</h2>
					<p class="task-peek-desc whitespace-pre-wrap text-sm leading-relaxed">
						{task.description}
					</p>
				</section>
			{/if}

			{#if task.depends_on && task.depends_on.length > 0}
				<section class="flex flex-col gap-1">
					<h2 class="task-peek-section-title text-xs uppercase tracking-wide">
						Depends on
					</h2>
					<ul class="flex flex-col gap-1">
						{#each task.depends_on as dep}
							<li class="task-peek-dep text-sm">
								<code class="font-mono text-xs opacity-70">{dep.id}</code>
								<span>{dep.title}</span>
								<span
									class="task-peek-chip text-[10px]"
									style="background: {statusColor(dep.status)}; color: oklch(0.12 0 0);"
								>
									{dep.status.replace(/_/g, ' ')}
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if task.blocked_by && task.blocked_by.length > 0}
				<section class="flex flex-col gap-1">
					<h2 class="task-peek-section-title text-xs uppercase tracking-wide">Blocks</h2>
					<ul class="flex flex-col gap-1">
						{#each task.blocked_by as dep}
							<li class="task-peek-dep text-sm">
								<code class="font-mono text-xs opacity-70">{dep.id}</code>
								<span>{dep.title}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<footer class="mt-2 flex items-center gap-2">
				<button
					type="button"
					class="btn btn-xs btn-primary"
					onclick={() => openTaskDetailDrawer(task!.id)}
				>
					Open full detail
				</button>
				<a
					href="/tasks?task={encodeURIComponent(task.id)}"
					class="btn btn-xs btn-ghost"
				>
					View in /tasks
				</a>
			</footer>
		</article>
	{/if}
</div>

<style>
	.task-peek-id {
		background: oklch(0.22 0.02 250);
		color: oklch(0.78 0.10 200);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.task-peek-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.4375rem;
		border-radius: 999px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.80 0.02 250);
		white-space: nowrap;
	}

	.task-peek-title {
		color: oklch(0.92 0.02 250);
	}

	.task-peek-section-title {
		color: oklch(0.60 0.02 250);
		font-weight: 600;
	}

	.task-peek-desc {
		color: oklch(0.78 0.02 250);
	}

	.task-peek-dep {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.24 0.02 250);
		border-radius: 0.375rem;
	}

	.task-peek-error {
		color: oklch(0.80 0.15 25);
	}
</style>
