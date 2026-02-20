<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { ActionSpawnAgentConfig } from '$lib/types/workflow';
	import type { UpstreamVariableGroup } from '$lib/utils/workflowVariables';
	import { loadCommands, getCommands } from '$lib/stores/configStore.svelte';
	import AgentSelector from '$lib/components/agents/AgentSelector.svelte';
	import TemplateVariables from './TemplateVariables.svelte';

	let {
		config = { taskTitle: '', model: 'sonnet' },
		onUpdate = () => {},
		upstreamVariables = []
	}: {
		config: ActionSpawnAgentConfig;
		onUpdate?: (config: ActionSpawnAgentConfig) => void;
		upstreamVariables?: UpstreamVariableGroup[];
	} = $props();

	function update(patch: Partial<ActionSpawnAgentConfig>) {
		config = { ...config, ...patch };
		onUpdate(config);
	}

	let mode = $state<'new' | 'existing'>(config.taskId ? 'existing' : 'new');
	let projects = $state<string[]>([]);

	// Command dropdown state
	let cmdDropdownOpen = $state(false);
	let cmdSearchQuery = $state('');
	let cmdSearchInput: HTMLInputElement | undefined;
	let cmdDropdownRef: HTMLDivElement | undefined;

	onMount(async () => {
		try {
			const res = await fetch('/api/projects?visible=true');
			const data = await res.json();
			projects = (data.projects || []).map((p: { name: string }) => p.name);
		} catch { /* ignore */ }

		// Load commands for the dropdown
		await loadCommands();
	});

	// Close dropdown on outside click
	function handleWindowClick(e: MouseEvent) {
		if (cmdDropdownRef && !cmdDropdownRef.contains(e.target as Node)) {
			cmdDropdownOpen = false;
			cmdSearchQuery = '';
		}
	}

	// Group commands by namespace
	const commandsByNamespace = $derived.by(() => {
		const cmds = getCommands();
		const groups = new Map<string, Array<{ invocation: string; name: string }>>();
		for (const cmd of cmds) {
			const ns = cmd.namespace || 'local';
			if (!groups.has(ns)) groups.set(ns, []);
			groups.get(ns)!.push({ invocation: cmd.invocation, name: cmd.name });
		}
		// Sort: jat first, then local, then alphabetically
		const sorted = Array.from(groups.entries()).sort(([a], [b]) => {
			if (a === 'jat') return -1;
			if (b === 'jat') return 1;
			if (a === 'local') return -1;
			if (b === 'local') return 1;
			return a.localeCompare(b);
		});
		return sorted;
	});

	// Filter commands by search query
	const filteredCommandsByNamespace = $derived.by(() => {
		if (!cmdSearchQuery.trim()) return commandsByNamespace;
		const q = cmdSearchQuery.toLowerCase();
		const result: Array<[string, Array<{ invocation: string; name: string }>]> = [];
		for (const [ns, cmds] of commandsByNamespace) {
			const filtered = cmds.filter(c =>
				c.invocation.toLowerCase().includes(q) ||
				c.name.toLowerCase().includes(q)
			);
			if (filtered.length > 0) result.push([ns, filtered]);
		}
		return result;
	});

	function selectCommand(invocation: string) {
		cmdDropdownOpen = false;
		cmdSearchQuery = '';
		update({ command: invocation });
	}

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

<svelte:window onclick={handleWindowClick} />

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
				placeholder={upstreamVariables.length > 0 ? 'Task title — click a variable below to insert' : `Use {{input}} for data from previous node`}
			/>
			{#if upstreamVariables.length > 0}
				<TemplateVariables
					groups={upstreamVariables}
					onInsert={(text) => update({ taskTitle: (config.taskTitle || '') + text })}
				/>
			{/if}
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
				placeholder={upstreamVariables.length > 0 ? 'Task description — click a variable below to insert' : `Detailed task description. Use {{input}} for upstream data.`}
			></textarea>
			{#if upstreamVariables.length > 0}
				<TemplateVariables
					groups={upstreamVariables}
					onInsert={(text) => update({ taskDescription: (config.taskDescription || '') + text })}
				/>
			{/if}
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

	<!-- Command / Project — 2-col grid -->
	<div class="grid grid-cols-2 gap-3">
		<!-- Command (searchable dropdown) -->
		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Command</span>
			</label>
			<div class="relative" bind:this={cmdDropdownRef}>
				<button
					type="button"
					class="w-full px-2.5 py-1 rounded-lg font-mono text-sm text-left flex items-center justify-between transition-colors min-h-8"
					style="background: oklch(0.16 0.01 250); border: 1px solid oklch(0.25 0.02 250); color: oklch(0.85 0.02 250)"
					onclick={() => { cmdDropdownOpen = !cmdDropdownOpen; }}
				>
					<span class="truncate">{config.command || '/jat:start'}</span>
					<svg class="w-3 h-3 flex-shrink-0 transition-transform {cmdDropdownOpen ? 'rotate-180' : ''}" style="color: oklch(0.50 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if cmdDropdownOpen}
					<div
						class="absolute z-50 mt-1 w-full rounded-lg overflow-hidden shadow-xl"
						style="background: oklch(0.16 0.01 250); border: 1px solid oklch(0.25 0.02 250);"
						transition:slide={{ duration: 120 }}
					>
						<!-- Search -->
						<div class="px-2.5 py-1.5" style="border-bottom: 1px solid oklch(0.22 0.02 250);">
							<div class="relative flex items-center gap-1.5">
								<svg class="w-3 h-3 flex-shrink-0" style="color: oklch(0.45 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
								</svg>
								<input
									bind:this={cmdSearchInput}
									bind:value={cmdSearchQuery}
									onkeydown={(e) => {
										if (e.key === 'Escape') { e.stopPropagation(); cmdDropdownOpen = false; cmdSearchQuery = ''; }
									}}
									type="text"
									placeholder="Filter commands..."
									class="w-full bg-transparent text-[10px] font-mono focus:outline-none"
									style="color: oklch(0.75 0.02 250);"
									autocomplete="off"
								/>
								{#if cmdSearchQuery}
									<button type="button" onclick={() => { cmdSearchQuery = ''; cmdSearchInput?.focus(); }} style="color: oklch(0.40 0.02 250);" class="hover:opacity-80 transition-opacity">
										<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
								{/if}
							</div>
						</div>

						<!-- Command list -->
						<ul class="py-0.5 max-h-[280px] overflow-y-auto">
							{#if filteredCommandsByNamespace.length > 0}
								{#each filteredCommandsByNamespace as [namespace, cmds]}
									<li class="px-3 pt-1.5 pb-0.5">
										<span class="text-[9px] font-mono font-semibold uppercase tracking-wider" style="color: oklch(0.50 0.10 250);">/{namespace}</span>
									</li>
									{#each cmds as cmd}
										<li>
											<button
												type="button"
												onclick={() => selectCommand(cmd.invocation)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-left text-[11px] font-mono transition-colors hover:bg-base-300/30"
												style={config.command === cmd.invocation ? 'background: oklch(0.22 0.02 250);' : ''}
											>
												<span class="truncate" style="color: oklch(0.80 0.02 250);">{cmd.invocation}</span>
												{#if config.command === cmd.invocation}
													<svg class="w-3 h-3 flex-shrink-0 ml-auto" style="color: oklch(0.70 0.15 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
												{/if}
											</button>
										</li>
									{/each}
								{/each}
							{:else}
								<li class="px-3 py-3 text-center text-[10px] font-mono" style="color: oklch(0.45 0.02 250);">No commands match "{cmdSearchQuery}"</li>
							{/if}
						</ul>
					</div>
				{/if}
			</div>
		</div>

		<!-- Project -->
		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Project</span>
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
</div>
