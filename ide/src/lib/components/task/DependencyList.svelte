<script lang="ts">
	export interface DependencyItem {
		id: string;
		title?: string;
		status?: string;
		priority?: number;
	}

	const STATUS_COLORS: Record<string, string> = {
		open: 'badge-info',
		in_progress: 'badge-warning',
		closed: 'badge-success',
		blocked: 'badge-error'
	};

	const PRIORITY_COLORS: Record<number, string> = {
		0: 'badge-error',
		1: 'badge-warning',
		2: 'badge-info',
		3: 'badge-ghost',
		4: 'badge-ghost'
	};

	let {
		items,
		onRemove,
		emptyText = 'No dependencies'
	}: {
		items: DependencyItem[];
		onRemove?: (id: string) => void;
		emptyText?: string;
	} = $props();

	function statusClass(status: string | undefined): string {
		return STATUS_COLORS[status ?? ''] ?? 'badge-ghost';
	}

	function priorityClass(priority: number | undefined): string {
		return PRIORITY_COLORS[priority ?? -1] ?? 'badge-ghost';
	}
</script>

{#if items.length > 0}
	<div class="flex flex-col gap-1.5">
		{#each items as item}
			<div class="flex items-center gap-2 px-2.5 py-1.5 bg-base-200 rounded-md border border-base-300 group">
				{#if item.status !== undefined}
					<span class="badge badge-sm {statusClass(item.status)} flex-shrink-0">{item.status}</span>
				{/if}
				{#if item.priority !== undefined}
					<span class="badge badge-sm {priorityClass(item.priority)} flex-shrink-0">P{item.priority}</span>
				{/if}
				<span class="font-mono text-xs text-info flex-shrink-0">{item.id}</span>
				{#if item.title}
					<span class="text-xs text-base-content/70 truncate flex-1">{item.title}</span>
				{/if}
				{#if onRemove}
					<button
						class="btn btn-xs btn-ghost btn-circle opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error/10 ml-auto flex-shrink-0"
						onclick={() => onRemove!(item.id)}
						title="Remove"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
					</button>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-sm text-base-content/50 italic">{emptyText}</p>
{/if}
