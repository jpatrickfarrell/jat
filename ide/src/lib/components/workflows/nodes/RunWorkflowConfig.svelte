<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActionRunWorkflowConfig } from '$lib/types/workflow';

	let {
		config = { workflowId: '', passInput: false },
		onUpdate = () => {}
	}: {
		config: ActionRunWorkflowConfig;
		onUpdate?: (config: ActionRunWorkflowConfig) => void;
	} = $props();

	interface WorkflowOption {
		id: string;
		name: string;
		enabled: boolean;
	}

	let workflows = $state<WorkflowOption[]>([]);
	let loading = $state(true);

	function update(patch: Partial<ActionRunWorkflowConfig>) {
		config = { ...config, ...patch };
		onUpdate(config);
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/workflows');
			const data = await res.json();
			workflows = (data.workflows || []).map((w: WorkflowOption) => ({
				id: w.id,
				name: w.name,
				enabled: w.enabled
			}));
		} catch { /* ignore */ }
		loading = false;
	});
</script>

<div class="flex flex-col gap-4">
	<!-- Target workflow selector -->
	<div class="form-control gap-1.5">
		<label class="text-xs font-semibold" style="color: oklch(0.75 0.02 250)">
			Target Workflow
		</label>
		{#if loading}
			<div class="skeleton h-8 rounded" style="background: oklch(0.22 0.02 250)"></div>
		{:else if workflows.length === 0}
			<p class="text-xs" style="color: oklch(0.45 0.02 250)">No other workflows found.</p>
		{:else}
			<select
				class="select select-sm w-full"
				style="background: oklch(0.18 0.01 250); color: oklch(0.80 0.02 250); border-color: oklch(0.25 0.02 250); font-size: 0.75rem"
				value={config.workflowId}
				onchange={(e) => update({ workflowId: (e.currentTarget as HTMLSelectElement).value })}
			>
				<option value="">— Select a workflow —</option>
				{#each workflows as wf}
					<option value={wf.id}>{wf.name}{wf.enabled ? '' : ' (disabled)'}</option>
				{/each}
			</select>
		{/if}
		{#if config.workflowId}
			<p class="text-[10px] font-mono" style="color: oklch(0.40 0.02 250)">{config.workflowId}</p>
		{/if}
	</div>

	<!-- Pass input toggle -->
	<div class="flex items-center gap-2">
		<input
			type="checkbox"
			id="pass-input"
			class="checkbox checkbox-xs"
			checked={config.passInput ?? false}
			onchange={(e) => update({ passInput: (e.currentTarget as HTMLInputElement).checked })}
		/>
		<label for="pass-input" class="text-xs cursor-pointer" style="color: oklch(0.65 0.02 250)">
			Pass current output as input to target workflow
		</label>
	</div>
</div>
