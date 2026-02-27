<script lang="ts">
	import type { OrphanProcess } from '$lib/stores/serverSessions.svelte.js';

	let {
		orphans = [],
		onKillOrphan,
		onKillAll
	}: {
		orphans: OrphanProcess[];
		onKillOrphan: (pid: number) => void;
		onKillAll: () => void;
	} = $props();

	let expanded = $state(false);
	let killingPids = $state(new Set<number>());
	let killingAll = $state(false);

	// Split into tracked (known project) and untracked groups
	const trackedOrphans = $derived(orphans.filter(o => o.tracked));
	const untrackedOrphans = $derived(orphans.filter(o => !o.tracked));

	// Group tracked orphans by project
	const trackedGrouped = $derived(() => {
		const map = new Map<string, OrphanProcess[]>();
		for (const orphan of trackedOrphans) {
			const list = map.get(orphan.projectName) || [];
			list.push(orphan);
			map.set(orphan.projectName, list);
		}
		return map;
	});

	// Group untracked orphans by derived path
	const untrackedGrouped = $derived(() => {
		const map = new Map<string, OrphanProcess[]>();
		for (const orphan of untrackedOrphans) {
			const list = map.get(orphan.projectName) || [];
			list.push(orphan);
			map.set(orphan.projectName, list);
		}
		return map;
	});

	const trackedProjectCount = $derived(trackedGrouped().size);
	const untrackedProjectCount = $derived(untrackedGrouped().size);

	// Total memory across all orphans
	const totalMemoryMb = $derived(
		orphans.reduce((sum, o) => sum + (o.rssKb || 0), 0) / 1024
	);

	function formatMemory(kb: number | undefined): string {
		if (!kb) return '—';
		if (kb < 1024) return `${kb} KB`;
		const mb = kb / 1024;
		if (mb < 1024) return `${mb.toFixed(0)} MB`;
		return `${(mb / 1024).toFixed(1)} GB`;
	}

	function formatUptime(seconds: number | undefined): string {
		if (!seconds || seconds < 0) return '—';
		if (seconds < 60) return `${Math.floor(seconds)}s`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		if (hours < 24) return `${hours}h ${mins}m`;
		const days = Math.floor(hours / 24);
		const remHours = hours % 24;
		return `${days}d ${remHours}h`;
	}

	async function handleKillOne(pid: number) {
		killingPids.add(pid);
		killingPids = new Set(killingPids);
		onKillOrphan(pid);
		setTimeout(() => {
			killingPids.delete(pid);
			killingPids = new Set(killingPids);
		}, 2000);
	}

	async function handleKillAll() {
		killingAll = true;
		onKillAll();
		setTimeout(() => { killingAll = false; }, 3000);
	}
</script>

{#snippet orphanTable(groupedMap: Map<string, OrphanProcess[]>, sectionLabel: string, isUntracked: boolean)}
	{#if groupedMap.size > 0}
		<!-- Section label -->
		<div class="flex items-center gap-2 mb-2 mt-1">
			<span class="text-[10px] font-mono uppercase tracking-wider {isUntracked ? 'text-base-content/30' : 'text-base-content/40'}">
				{sectionLabel}
			</span>
			<div class="flex-1 border-t {isUntracked ? 'border-base-content/10' : 'border-base-content/10'}"></div>
		</div>

		{#each [...groupedMap] as [projectName, projectOrphans]}
			<div class="mb-3 last:mb-0">
				<!-- Project header -->
				<div class="text-xs font-mono mb-1.5 flex items-center gap-1.5 {isUntracked ? 'text-base-content/30' : 'text-base-content/50'}">
					{#if isUntracked}
						<!-- Question mark icon for untracked -->
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18.75h.008v.008H12v-.008z" />
						</svg>
					{:else}
						<!-- Folder icon for tracked -->
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
						</svg>
					{/if}
					{projectName}
					<span class="text-base-content/20">({projectOrphans.length})</span>
				</div>

				<!-- Column headers -->
				<div class="ml-4 flex items-center gap-3 text-[10px] font-mono text-base-content/30 uppercase tracking-wider px-2 mb-0.5">
					<span class="w-[4.5rem]">PID</span>
					<span class="w-14">Port</span>
					<span class="w-20">Type</span>
					<span class="w-16 text-right">Memory</span>
					<span class="w-16 text-right">Uptime</span>
					<span class="flex-1">Address</span>
					<span class="w-12"></span>
				</div>

				<!-- Orphan rows -->
				<div class="ml-4 space-y-0">
					{#each projectOrphans as orphan}
						<div class="flex items-center gap-3 text-xs font-mono py-1 px-2 rounded hover:bg-base-content/5 group">
							<!-- PID -->
							<span class="text-base-content/40 w-[4.5rem] tabular-nums">{orphan.pid}</span>

							<!-- Port -->
							<span class="text-info/80 w-14 tabular-nums">:{orphan.port}</span>

							<!-- Process name -->
							<span class="text-base-content/60 w-20 truncate">{orphan.processName}</span>

							<!-- Memory -->
							<span class="text-warning/70 w-16 tabular-nums text-right">{formatMemory(orphan.rssKb)}</span>

							<!-- Uptime -->
							<span class="text-base-content/50 w-16 tabular-nums text-right">{formatUptime(orphan.uptimeSecs)}</span>

							<!-- Listen address -->
							<span class="text-base-content/30 flex-1 truncate">{orphan.listenAddress}</span>

							<!-- Kill button -->
							<button
								class="btn btn-xs btn-ghost text-error/60 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity h-5 min-h-0 px-1.5 w-12"
								onclick={() => handleKillOne(orphan.pid)}
								disabled={killingPids.has(orphan.pid)}
							>
								{#if killingPids.has(orphan.pid)}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
									Kill
								{/if}
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
{/snippet}

{#if orphans.length > 0}
<div class="animate-slide-down border-b border-warning/20 bg-warning/5">
	<!-- Collapsed header bar -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="w-full flex items-center gap-2 px-4 py-2 text-sm font-mono cursor-pointer hover:bg-warning/10 transition-colors select-none"
		onclick={() => expanded = !expanded}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expanded = !expanded; } }}
		role="button"
		tabindex="0"
	>
		<!-- Warning icon -->
		<svg class="w-4 h-4 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
		</svg>

		<span class="text-warning/90">
			<span class="font-semibold">{orphans.length}</span> orphaned process{orphans.length !== 1 ? 'es' : ''}
			{#if trackedProjectCount > 0}
				across <span class="font-semibold">{trackedProjectCount}</span> project{trackedProjectCount !== 1 ? 's' : ''}
			{/if}
			{#if untrackedOrphans.length > 0}
				<span class="text-base-content/40">+ {untrackedOrphans.length} untracked</span>
			{/if}
		</span>

		{#if totalMemoryMb > 0}
			<span class="text-base-content/40 text-xs">({totalMemoryMb.toFixed(0)} MB)</span>
		{/if}

		<!-- Expand/collapse chevron -->
		<svg
			class="w-4 h-4 text-base-content/40 transition-transform duration-200 ml-1"
			class:rotate-180={expanded}
			fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
		</svg>

		<span class="flex-1"></span>

		<!-- Kill All button -->
		<button
			class="btn btn-xs border border-error/30 bg-error/10 text-error hover:bg-error/20 gap-1"
			onclick={(e) => { e.stopPropagation(); handleKillAll(); }}
			disabled={killingAll}
		>
			{#if killingAll}
				<span class="loading loading-spinner loading-xs"></span>
			{:else}
				<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			{/if}
			Kill All
		</button>
	</div>

	<!-- Expanded details -->
	{#if expanded}
		<div class="px-4 pb-3 animate-slide-down">
			<!-- Tracked projects first -->
			{@render orphanTable(trackedGrouped(), 'Known Projects', false)}

			<!-- Untracked processes second -->
			{@render orphanTable(untrackedGrouped(), 'Untracked', true)}
		</div>
	{/if}
</div>
{/if}
