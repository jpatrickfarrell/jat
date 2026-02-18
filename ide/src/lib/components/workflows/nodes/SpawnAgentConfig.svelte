<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActionSpawnAgentConfig } from '$lib/types/workflow';
	import AgentSelector from '$lib/components/agents/AgentSelector.svelte';

	let {
		config = { taskTitle: '', model: 'sonnet' },
		onUpdate = () => {}
	}: {
		config: ActionSpawnAgentConfig;
		onUpdate?: (config: ActionSpawnAgentConfig) => void;
	} = $props();

	function update(patch: Partial<ActionSpawnAgentConfig>) {
		config = { ...config, ...patch };
		onUpdate(config);
	}

	let mode = $state<'new' | 'existing'>(config.taskId ? 'existing' : 'new');
	let projects = $state<string[]>([]);

	onMount(async () => {
		try {
			const res = await fetch('/api/projects?visible=true');
			const data = await res.json();
			projects = (data.projects || []).map((p: { name: string }) => p.name);
		} catch { /* ignore */ }
	});

	// Synthetic task for AgentSelector — uses current config's agentId/model
	const selectorTask = $derived({
		id: 'workflow-config',
		agent_program: config.agentId ?? null,
		model: config.model ?? null
	});

	function handleAgentChange(selection: { agentId: string | null; model: string | null }) {
		update({
			agentId: selection.agentId ?? undefined,
			model: selection.model ?? undefined
		});
	}
</script>

<div class="flex flex-col gap-4">
	<div class="form-control">
		<label class="label w-full pb-1">
			<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Task Source</span>
		</label>
		<div class="flex gap-2">
			<button
				class="btn btn-sm flex-1"
				class:btn-primary={mode === 'new'}
				class:btn-ghost={mode !== 'new'}
				style={mode !== 'new' ? 'background: oklch(0.20 0.01 250); color: oklch(0.75 0.02 250); border-color: oklch(0.28 0.02 250)' : ''}
				onclick={() => { mode = 'new'; update({ taskId: undefined, taskTitle: config.taskTitle || '' }); }}
			>
				Create New Task
			</button>
			<button
				class="btn btn-sm flex-1"
				class:btn-primary={mode === 'existing'}
				class:btn-ghost={mode !== 'existing'}
				style={mode !== 'existing' ? 'background: oklch(0.20 0.01 250); color: oklch(0.75 0.02 250); border-color: oklch(0.28 0.02 250)' : ''}
				onclick={() => { mode = 'existing'; update({ taskTitle: undefined, taskDescription: undefined, taskId: config.taskId || '' }); }}
			>
				Existing Task
			</button>
		</div>
	</div>

	{#if mode === 'new'}
		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Task Title</span>
			</label>
			<input
				type="text"
				class="input input-sm input-bordered w-full"
				style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250)"
				value={config.taskTitle || ''}
				oninput={(e) => update({ taskTitle: e.currentTarget.value })}
				placeholder="Title for the new task"
			/>
		</div>

		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Task Description</span>
				<span class="label-text-alt" style="color: oklch(0.55 0.02 250)">Optional</span>
			</label>
			<textarea
				class="textarea textarea-bordered text-sm w-full"
				style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250); min-height: 80px"
				value={config.taskDescription || ''}
				oninput={(e) => update({ taskDescription: e.currentTarget.value || undefined })}
				placeholder="Detailed task description"
			></textarea>
		</div>
	{:else}
		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Task ID</span>
			</label>
			<input
				type="text"
				class="input input-sm input-bordered font-mono w-full"
				style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250)"
				value={config.taskId || ''}
				oninput={(e) => update({ taskId: e.currentTarget.value })}
				placeholder="jat-abc"
			/>
		</div>
	{/if}

	<div class="form-control">
		<label class="label w-full pb-1">
			<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Agent & Model</span>
		</label>
		<AgentSelector
			task={selectorTask}
			compact={true}
			onchange={handleAgentChange}
		/>
	</div>

	<div class="form-control">
		<label class="label w-full pb-1">
			<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Project</span>
			<span class="label-text-alt" style="color: oklch(0.55 0.02 250)">Optional</span>
		</label>
		<select
			class="select select-sm select-bordered w-full"
			style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250)"
			value={config.project || ''}
			onchange={(e) => update({ project: e.currentTarget.value || undefined })}
		>
			<option value="">Select project</option>
			{#each projects as proj}
				<option value={proj}>{proj}</option>
			{/each}
		</select>
	</div>
</div>
