<script lang="ts">
	import type { TriggerEventConfig } from '$lib/types/workflow';
	import { EVENT_TYPES } from '$lib/config/workflowNodes';
	import { getIntegrationIcon } from '$lib/config/integrationIcons';
	import type { IntegrationSource } from '$lib/types/integration';

	let {
		config = { eventType: 'task_created' as const },
		onUpdate = () => {}
	}: {
		config: TriggerEventConfig;
		onUpdate?: (config: TriggerEventConfig) => void;
	} = $props();

	let showHelp = $state(false);

	// Integration sources (fetched when ingest_item is selected)
	let integrationSources = $state<IntegrationSource[]>([]);
	let integrationLoading = $state(false);
	let integrationError = $state<string | null>(null);
	let integrationFetched = $state(false);

	const EVENT_DATA_FIELDS: Record<string, { fields: { name: string; type: string; desc: string }[]; examples: { label: string; expr: string }[] }> = {
		task_created: {
			fields: [
				{ name: 'data.taskId', type: 'string', desc: 'Task ID' },
				{ name: 'data.title', type: 'string', desc: 'Task title' },
				{ name: 'data.type', type: 'string', desc: 'bug, feature, task, chore, epic' },
				{ name: 'data.priority', type: 'number', desc: 'Priority (0-4)' },
				{ name: 'data.labels', type: 'string', desc: 'Comma-separated labels' },
				{ name: 'data.project', type: 'string', desc: 'Project name' }
			],
			examples: [
				{ label: 'High-priority bugs', expr: 'data.type === "bug" && data.priority <= 1' },
				{ label: 'OR', expr: 'data.type === "bug" || data.type === "feature"' },
				{ label: 'NOT', expr: 'data.type !== "chore"' },
				{ label: 'By label', expr: 'data.labels.includes("urgent")' }
			]
		},
		task_closed: {
			fields: [
				{ name: 'data.taskId', type: 'string', desc: 'Task ID' },
				{ name: 'data.title', type: 'string', desc: 'Task title' },
				{ name: 'data.type', type: 'string', desc: 'bug, feature, task, chore, epic' },
				{ name: 'data.priority', type: 'number', desc: 'Priority (0-4)' },
				{ name: 'data.reason', type: 'string', desc: 'Close reason' },
				{ name: 'data.project', type: 'string', desc: 'Project name' },
				{ name: 'data.assignee', type: 'string', desc: 'Agent name' },
				{ name: 'data.labels', type: 'string', desc: 'Comma-separated labels' }
			],
			examples: [
				{ label: 'Only bugs', expr: 'data.type === "bug"' },
				{ label: 'AND', expr: 'data.type === "bug" && data.priority <= 1' },
				{ label: 'OR', expr: 'data.type === "bug" || data.type === "chore"' },
				{ label: 'NOT', expr: 'data.type !== "epic" && data.project !== "demo"' }
			]
		},
		task_status_changed: {
			fields: [
				{ name: 'data.taskId', type: 'string', desc: 'Task ID' },
				{ name: 'data.title', type: 'string', desc: 'Task title' },
				{ name: 'data.oldStatus', type: 'string', desc: 'Previous status (open, in_progress, blocked, closed)' },
				{ name: 'data.newStatus', type: 'string', desc: 'New status' },
				{ name: 'data.type', type: 'string', desc: 'bug, feature, task, chore, epic' },
				{ name: 'data.priority', type: 'number', desc: 'Priority (0-4)' },
				{ name: 'data.project', type: 'string', desc: 'Project name' },
				{ name: 'data.assignee', type: 'string', desc: 'Agent name' }
			],
			examples: [
				{ label: 'Started work', expr: 'data.newStatus === "in_progress"' },
				{ label: 'Got blocked', expr: 'data.newStatus === "blocked"' },
				{ label: 'Reopened', expr: 'data.oldStatus === "closed" && data.newStatus === "open"' },
				{ label: 'Any close', expr: 'data.newStatus === "closed"' }
			]
		},
		signal_received: {
			fields: [
				{ name: 'data.type', type: 'string', desc: 'Signal type: starting, working, needs_input, review, complete' },
				{ name: 'data.taskId', type: 'string', desc: 'Task ID' },
				{ name: 'data.taskTitle', type: 'string', desc: 'Task title' },
				{ name: 'data.taskType', type: 'string', desc: 'bug, feature, task, chore, epic' },
				{ name: 'data.priority', type: 'number', desc: 'Priority (0-4)' },
				{ name: 'data.labels', type: 'string', desc: 'Comma-separated labels' },
				{ name: 'data.agentName', type: 'string', desc: 'Agent name' },
				{ name: 'data.project', type: 'string', desc: 'Project name' }
			],
			examples: [
				{ label: 'On complete', expr: 'data.type === "complete"' },
				{ label: 'Bugs only', expr: 'data.type === "complete" && data.taskType === "bug"' },
				{ label: 'Multiple signals', expr: 'data.type === "review" || data.type === "complete"' }
			]
		},
		file_changed: {
			fields: [
				{ name: 'data.path', type: 'string', desc: 'Relative file path' },
				{ name: 'data.project', type: 'string', desc: 'Project name' },
				{ name: 'data.changeType', type: 'string', desc: 'Type of change: create, modify, delete' }
			],
			examples: [
				{ label: 'Config files', expr: 'data.path.endsWith(".json") || data.path.endsWith(".yaml")' },
				{ label: 'Source code', expr: 'data.path.startsWith("src/")' },
				{ label: 'Specific file', expr: 'data.path === "package.json"' },
				{ label: 'Deletions', expr: 'data.changeType === "delete"' }
			]
		},
		ingest_item: {
			fields: [
				{ name: 'data.sourceId', type: 'string', desc: 'Integration source ID (e.g., "slack-main")' },
				{ name: 'data.sourceType', type: 'string', desc: 'Integration type (slack, gmail, rss, telegram, etc.)' },
				{ name: 'data.title', type: 'string', desc: 'Item title' },
				{ name: 'data.description', type: 'string', desc: 'Item body/description' },
				{ name: 'data.author', type: 'string', desc: 'Author name' },
				{ name: 'data.timestamp', type: 'string', desc: 'ISO timestamp of the item' },
				{ name: 'data.project', type: 'string', desc: 'Target project' },
				{ name: 'data.fields.*', type: 'varies', desc: 'Plugin-specific fields (e.g., data.fields.channel, data.fields.priority)' }
			],
			examples: [
				{ label: 'From Slack', expr: 'data.sourceType === "slack"' },
				{ label: 'Specific source', expr: 'data.sourceId === "slack-main"' },
				{ label: 'By author', expr: 'data.author === "alice"' },
				{ label: 'Title match', expr: 'data.title.includes("urgent")' }
			]
		}
	};

	const currentFields = $derived(EVENT_DATA_FIELDS[config.eventType]);
	const currentPlaceholder = $derived(currentFields?.examples?.[0] ? `e.g., ${currentFields.examples[0].expr}` : '');

	function handleEventTypeChange(value: string) {
		config = { ...config, eventType: value as TriggerEventConfig['eventType'] };
		onUpdate(config);
	}

	function handleFilterChange(value: string) {
		config = { ...config, filter: value || undefined };
		onUpdate(config);
	}

	function handleSourceClick(sourceId: string) {
		const expr = `data.sourceId === "${sourceId}"`;
		config = { ...config, filter: expr };
		onUpdate(config);
	}

	async function fetchIntegrationSources() {
		if (integrationFetched) return;
		integrationLoading = true;
		integrationError = null;
		try {
			const res = await fetch('/api/integrations');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			integrationSources = data.config?.sources ?? [];
			integrationFetched = true;
		} catch (err) {
			integrationError = err instanceof Error ? err.message : 'Failed to load integrations';
		} finally {
			integrationLoading = false;
		}
	}

	// Fetch integration sources when ingest_item is selected
	$effect(() => {
		if (config.eventType === 'ingest_item') {
			fetchIntegrationSources();
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="form-control">
		<label class="label w-full pb-1">
			<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Event Type</span>
		</label>
		<div class="flex flex-col gap-2">
			{#each EVENT_TYPES as event}
				<label
					class="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
					style="background: {config.eventType === event.value ? 'oklch(0.72 0.17 145 / 0.12)' : 'oklch(0.16 0.01 250)'}; border: 1px solid {config.eventType === event.value ? 'oklch(0.72 0.17 145 / 0.4)' : 'oklch(0.25 0.02 250)'}"
				>
					<input
						type="radio"
						class="radio radio-sm radio-success mt-0.5"
						name="event-type"
						value={event.value}
						checked={config.eventType === event.value}
						onchange={() => handleEventTypeChange(event.value)}
					/>
					<div>
						<div class="text-sm font-medium" style="color: oklch(0.90 0.02 250)">{event.label}</div>
						<div class="text-xs mt-0.5" style="color: oklch(0.55 0.02 250)">{event.description}</div>
					</div>
				</label>
			{/each}
		</div>
	</div>

	<!-- Integration source picker (only for ingest_item) -->
	{#if config.eventType === 'ingest_item'}
		<div class="form-control">
			<label class="label w-full pb-1">
				<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Filter by Source</span>
				<span class="label-text-alt" style="color: oklch(0.55 0.02 250)">Optional</span>
			</label>
			<div class="rounded-lg p-3" style="background: oklch(0.14 0.01 250); border: 1px solid oklch(0.22 0.02 250)">
				{#if integrationLoading}
					<div class="flex items-center gap-2 text-xs" style="color: oklch(0.55 0.02 250)">
						<span class="loading loading-spinner loading-xs"></span>
						Loading integrations...
					</div>
				{:else if integrationError}
					<div class="text-xs" style="color: oklch(0.70 0.15 25)">
						Failed to load integrations: {integrationError}
					</div>
				{:else if integrationSources.length === 0}
					<div class="text-xs" style="color: oklch(0.55 0.02 250)">
						No integrations configured.
						<a href="/integrations" class="underline" style="color: oklch(0.70 0.15 240)">Set up integrations</a>
						to filter by source.
					</div>
				{:else}
					<div class="text-xs mb-2" style="color: oklch(0.55 0.02 250)">Click to filter by a specific integration</div>
					<div class="flex flex-wrap gap-2">
						{#each integrationSources as source}
							{@const icon = getIntegrationIcon(source.type)}
							{@const isSelected = config.filter === `data.sourceId === "${source.id}"`}
							<button
								type="button"
								class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer"
								style="
									background: {isSelected ? 'oklch(0.72 0.17 145 / 0.15)' : 'oklch(0.18 0.01 250)'};
									border: 1px solid {isSelected ? 'oklch(0.72 0.17 145 / 0.5)' : 'oklch(0.28 0.02 250)'};
									color: oklch(0.85 0.02 250);
									opacity: {source.enabled ? '1' : '0.5'};
								"
								onclick={() => handleSourceClick(source.id)}
								title="{source.type} — {source.id}{source.enabled ? '' : ' (disabled)'}"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox={icon.viewBox}
									class="w-3.5 h-3.5 shrink-0"
									style="color: {icon.color}"
									fill={icon.fill ? 'currentColor' : 'none'}
									stroke={icon.fill ? 'none' : 'currentColor'}
									stroke-width={icon.fill ? undefined : '1.5'}
								>
									<path d={icon.svg} />
								</svg>
								<span class="font-medium">{source.id}</span>
								{#if !source.enabled}
									<span class="text-[0.625rem] px-1 rounded" style="background: oklch(0.30 0.02 250); color: oklch(0.55 0.02 250)">off</span>
								{/if}
							</button>
						{/each}
					</div>
					<div class="text-xs mt-2" style="color: oklch(0.45 0.02 250)">Or write a custom filter expression below</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="form-control">
		<label class="label w-full pb-1">
			<span class="label-text font-semibold text-sm" style="color: oklch(0.85 0.02 250)">Filter Expression</span>
			<span class="label-text-alt" style="color: oklch(0.55 0.02 250)">Optional</span>
		</label>
		<input
			type="text"
			class="input input-sm input-bordered w-full"
			style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.02 250); color: oklch(0.90 0.02 250)"
			value={config.filter || ''}
			oninput={(e) => handleFilterChange(e.currentTarget.value)}
			placeholder={currentPlaceholder}
		/>
		<div class="mt-1.5 flex items-center gap-1">
			<button
				type="button"
				class="text-xs px-0 bg-transparent border-none cursor-pointer flex items-center gap-1"
				style="color: oklch(0.60 0.10 250)"
				onclick={() => showHelp = !showHelp}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
					<path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clip-rule="evenodd" />
				</svg>
				{showHelp ? 'Hide' : 'Available fields'}
			</button>
		</div>

		{#if showHelp && currentFields}
			<div class="mt-1.5 rounded-lg p-2.5 text-xs" style="background: oklch(0.14 0.01 250); border: 1px solid oklch(0.22 0.02 250)">
				<div class="mb-1.5" style="color: oklch(0.55 0.02 250)">JavaScript expression. Available fields:</div>
				<div class="flex flex-col gap-1">
					{#each currentFields.fields as field}
						<div class="flex items-baseline gap-2">
							<code class="font-mono px-1 rounded" style="background: oklch(0.18 0.02 250); color: oklch(0.80 0.12 200); font-size: 0.6875rem">{field.name}</code>
							<span style="color: oklch(0.50 0.02 250)">{field.desc}</span>
						</div>
					{/each}
				</div>
				<div class="mt-2 pt-1.5 flex flex-col gap-1" style="border-top: 1px solid oklch(0.22 0.02 250)">
					<div style="color: oklch(0.55 0.02 250)">Examples:</div>
					{#each currentFields.examples as ex}
						<div class="flex items-baseline gap-2">
							<span class="shrink-0 w-[70px] text-right" style="color: oklch(0.50 0.02 250)">{ex.label}</span>
							<code class="font-mono px-1 rounded" style="background: oklch(0.18 0.02 250); color: oklch(0.75 0.15 145); font-size: 0.6875rem">{ex.expr}</code>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
