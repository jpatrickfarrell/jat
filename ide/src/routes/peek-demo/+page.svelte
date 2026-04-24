<script lang="ts">
	/**
	 * /peek-demo — showcase for the new `use:peek` action.
	 *
	 * Uses listNav for j/k + Enter, `use:peek` for Space-to-preview. The peek
	 * drawer resolves each task-ID via the PeekRegistry entry registered in
	 * +layout.svelte onMount → TaskPeekContent.
	 */

	import { onMount } from 'svelte';
	import { createListNav } from '$lib/actions/listNav';
	import { peek } from '$lib/actions/peek';
	import { openTaskDetailDrawer } from '$lib/stores/drawerStore';

	interface DemoTask {
		id: string;
		title: string;
		priority: number;
		status: string;
		issue_type: string;
	}

	let tasks = $state<DemoTask[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let listEl: HTMLDivElement | undefined = $state();

	const nav = createListNav({
		getItems: () =>
			listEl ? Array.from(listEl.querySelectorAll<HTMLElement>('[data-nav-id]')) : [],
		onSelect: (el) => {
			const id = el.dataset.navId;
			if (id) openTaskDetailDrawer(id);
		},
		wraparound: true,
	});

	function handleKeydown(e: KeyboardEvent) {
		nav.handleKeydown(e);
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/tasks?status=open&limit=25');
			if (!res.ok) throw new Error(`${res.status}`);
			const data = await res.json();
			tasks = (data.tasks || []).slice(0, 25);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	});

	function priorityLabel(p: number): string {
		return `P${p ?? '?'}`;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="peek-demo flex flex-col gap-4 p-6">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold">Peek Mode Demo</h1>
		<p class="text-sm opacity-70">
			<kbd class="kbd kbd-sm">j</kbd>/<kbd class="kbd kbd-sm">k</kbd> to navigate,
			<kbd class="kbd kbd-sm">Space</kbd> to peek (opens 40vw drawer),
			<kbd class="kbd kbd-sm">Enter</kbd> for full detail,
			<kbd class="kbd kbd-sm">Esc</kbd> to close peek. Second
			<kbd class="kbd kbd-sm">Space</kbd> closes.
		</p>
	</header>

	{#if loading}
		<div class="opacity-60">Loading tasks…</div>
	{:else if error}
		<div class="alert alert-error text-sm">Couldn't load tasks: {error}</div>
	{:else if tasks.length === 0}
		<div class="opacity-60">No open tasks to preview.</div>
	{:else}
		<div bind:this={listEl} use:peek class="flex flex-col gap-1" role="list">
			{#each tasks as task (task.id)}
				<button
					type="button"
					data-nav-id={task.id}
					class="peek-demo-row flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left"
					onclick={() => openTaskDetailDrawer(task.id)}
				>
					<code class="peek-demo-id font-mono text-xs">{task.id}</code>
					<span class="peek-demo-chip text-[10px] uppercase">
						{task.status.replace(/_/g, ' ')}
					</span>
					<span class="peek-demo-chip text-[10px]">{priorityLabel(task.priority)}</span>
					<span class="peek-demo-chip text-[10px] capitalize">{task.issue_type}</span>
					<span class="flex-1 truncate text-sm">{task.title}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.peek-demo-row {
		background: oklch(0.17 0.01 250);
		color: oklch(0.85 0.02 250);
		transition: background 120ms ease, border-color 120ms ease;
		cursor: pointer;
	}

	.peek-demo-row:hover {
		background: oklch(0.20 0.02 250);
		border-color: oklch(0.30 0.02 250);
	}

	.peek-demo-row:global(.jk-focused) {
		background: oklch(0.22 0.04 240);
		border-color: oklch(0.55 0.12 240);
		outline: 1px solid oklch(0.55 0.12 240 / 0.6);
	}

	.peek-demo-id {
		background: oklch(0.22 0.02 250);
		color: oklch(0.78 0.10 200);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.peek-demo-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.4375rem;
		border-radius: 999px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.80 0.02 250);
		white-space: nowrap;
	}
</style>
