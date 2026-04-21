<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { SubflowConfig } from '$lib/types/workflow';

	let {
		config = { subflowId: '' },
		onUpdate = () => {}
	}: {
		config: SubflowConfig;
		onUpdate?: (config: SubflowConfig) => void;
	} = $props();

	interface SubflowOption {
		id: string;
		name: string;
		nodeCount: number;
	}

	let subflows = $state<SubflowOption[]>([]);
	let loading = $state(true);
	let selectedName = $derived(subflows.find((s) => s.id === config.subflowId)?.name ?? '');

	function update(patch: Partial<SubflowConfig>) {
		config = { ...config, ...patch };
		onUpdate(config);
	}

	function openSubflow() {
		if (config.subflowId) {
			goto(`/workflows?open=${encodeURIComponent(config.subflowId)}`);
		}
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/workflows');
			const data = await res.json();
			subflows = (data.workflows || [])
				.filter((w: { is_subflow?: boolean }) => w.is_subflow)
				.map((w: SubflowOption) => ({ id: w.id, name: w.name, nodeCount: w.nodeCount }));
		} catch { /* ignore */ }
		loading = false;
	});
</script>

<div class="flex flex-col gap-4">
	<!-- Subflow selector -->
	<div class="form-control gap-1.5">
		<label class="text-xs font-semibold" style="color: oklch(0.75 0.02 250)">
			Subflow
		</label>
		{#if loading}
			<div class="skeleton h-8 rounded" style="background: oklch(0.22 0.02 250)"></div>
		{:else if subflows.length === 0}
			<p class="text-xs" style="color: oklch(0.45 0.02 250)">
				No subflows found. Right-click selected nodes on the canvas and choose "Extract to Subflow" to create one.
			</p>
		{:else}
			<select
				class="select select-sm w-full"
				style="background: oklch(0.18 0.01 250); color: oklch(0.80 0.02 250); border-color: oklch(0.25 0.02 250); font-size: 0.75rem"
				value={config.subflowId}
				onchange={(e) => update({ subflowId: (e.currentTarget as HTMLSelectElement).value })}
			>
				<option value="">— Select a subflow —</option>
				{#each subflows as sf}
					<option value={sf.id}>{sf.name} ({sf.nodeCount} node{sf.nodeCount === 1 ? '' : 's'})</option>
				{/each}
			</select>
		{/if}
		{#if config.subflowId}
			<p class="text-[10px] font-mono" style="color: oklch(0.40 0.02 250)">{config.subflowId}</p>
		{/if}
	</div>

	<!-- Open subflow link -->
	{#if config.subflowId && selectedName}
		<div class="flex items-center gap-2">
			<button
				class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors"
				style="background: oklch(0.72 0.17 220 / 0.12); color: oklch(0.72 0.17 220); border: 1px solid oklch(0.72 0.17 220 / 0.3)"
				onclick={openSubflow}
			>
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
				</svg>
				Open "{selectedName}"
			</button>
		</div>
	{/if}

	<!-- Help text -->
	<p class="text-[10px] leading-relaxed" style="color: oklch(0.45 0.02 250)">
		The subflow runs inline when this node executes. Its input receives the data from the previous node, and its output is passed to the next node.
	</p>
</div>
