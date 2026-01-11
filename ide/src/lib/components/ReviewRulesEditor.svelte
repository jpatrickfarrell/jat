<script lang="ts">
	import { onMount } from 'svelte';

	// Task types (rows)
	const TASK_TYPES = ['bug', 'feature', 'task', 'chore', 'epic'] as const;
	type TaskType = typeof TASK_TYPES[number];

	// Priority columns (P0-P4)
	const PRIORITIES = [0, 1, 2, 3, 4] as const;
	type Priority = typeof PRIORITIES[number];

	// Rule structure from review-rules.json
	interface Rule {
		type: TaskType;
		maxAutoPriority: number; // -1 to 4
		note?: string;
	}

	interface ReviewRules {
		version: number;
		defaultAction: 'review' | 'auto';
		priorityThreshold: number;
		rules: Rule[];
		overrides: Array<{ taskId: string; action: string; reason?: string }>;
	}

	// Component state
	let rules = $state<ReviewRules | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let hasChanges = $state(false);

	// Track note editing
	let editingNote = $state<TaskType | null>(null);
	let noteInput = $state('');

	// Load rules on mount
	onMount(async () => {
		await loadRules();
	});

	async function loadRules() {
		loading = true;
		error = null;
		try {
			const response = await fetch('/api/review-rules');
			if (!response.ok) {
				throw new Error(`Failed to load rules: ${response.statusText}`);
			}
			rules = await response.json();
			hasChanges = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load rules';
		} finally {
			loading = false;
		}
	}

	async function saveRules() {
		if (!rules) return;
		saving = true;
		error = null;
		try {
			const response = await fetch('/api/review-rules', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(rules)
			});
			if (!response.ok) {
				throw new Error(`Failed to save rules: ${response.statusText}`);
			}
			const result = await response.json();
			rules = result.rules;
			hasChanges = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save rules';
		} finally {
			saving = false;
		}
	}

	async function resetToDefaults() {
		saving = true;
		error = null;
		try {
			const response = await fetch('/api/review-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'reset' })
			});
			if (!response.ok) {
				throw new Error(`Failed to reset rules: ${response.statusText}`);
			}
			const result = await response.json();
			rules = result.rules;
			hasChanges = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to reset rules';
		} finally {
			saving = false;
		}
	}

	// Get maxAutoPriority for a task type
	function getMaxAuto(type: TaskType): number {
		if (!rules) return 3;
		const rule = rules.rules.find(r => r.type === type);
		return rule?.maxAutoPriority ?? rules.priorityThreshold;
	}

	// Get note for a task type
	function getNote(type: TaskType): string {
		if (!rules) return '';
		const rule = rules.rules.find(r => r.type === type);
		return rule?.note ?? '';
	}

	// Check if a cell is "auto" (priority >= minAutoPriority)
	// Higher priority NUMBER = lower importance, so P3/P4 should auto-proceed, P0/P1 should require review
	function isAuto(type: TaskType, priority: Priority): boolean {
		const minAuto = getMaxAuto(type); // Note: field is named maxAutoPriority but semantically it's the minimum priority that auto-proceeds
		return priority >= minAuto;
	}

	// Toggle a cell by adjusting maxAutoPriority (which is actually minAutoPriority semantically)
	function toggleCell(type: TaskType, priority: Priority) {
		if (!rules) return;

		const currentlyAuto = isAuto(type, priority);
		const ruleIndex = rules.rules.findIndex(r => r.type === type);

		if (ruleIndex >= 0) {
			// If currently auto, set threshold to priority + 1 (so this priority now requires review)
			// If currently review, set threshold to priority (so this priority now auto-proceeds)
			const newThreshold = currentlyAuto ? priority + 1 : priority;
			rules.rules[ruleIndex] = {
				...rules.rules[ruleIndex],
				maxAutoPriority: newThreshold
			};
		} else {
			// Create new rule
			const newThreshold = currentlyAuto ? priority + 1 : priority;
			rules.rules.push({
				type,
				maxAutoPriority: newThreshold
			});
		}

		// Trigger reactivity
		rules = { ...rules };
		hasChanges = true;
	}

	// Update note for a type
	function updateNote(type: TaskType, note: string) {
		if (!rules) return;

		const ruleIndex = rules.rules.findIndex(r => r.type === type);
		if (ruleIndex >= 0) {
			rules.rules[ruleIndex] = {
				...rules.rules[ruleIndex],
				note: note.trim() || undefined
			};
		} else if (note.trim()) {
			rules.rules.push({
				type,
				maxAutoPriority: rules.priorityThreshold,
				note: note.trim()
			});
		}

		rules = { ...rules };
		hasChanges = true;
		editingNote = null;
	}

	// Start editing a note
	function startEditNote(type: TaskType) {
		editingNote = type;
		noteInput = getNote(type);
	}

	// Cancel note editing
	function cancelEditNote() {
		editingNote = null;
		noteInput = '';
	}

	// Type labels with icons
	const TYPE_INFO: Record<TaskType, { label: string; icon: string; color: string }> = {
		bug: { label: 'Bug', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', color: 'text-error' },
		feature: { label: 'Feature', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z', color: 'text-success' },
		task: { label: 'Task', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-info' },
		chore: { label: 'Chore', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z', color: 'text-warning' },
		epic: { label: 'Epic', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', color: 'text-secondary' }
	};

	// Priority labels
	const PRIORITY_LABELS: Record<Priority, { label: string; sublabel: string }> = {
		0: { label: 'P0', sublabel: 'Critical' },
		1: { label: 'P1', sublabel: 'High' },
		2: { label: 'P2', sublabel: 'Medium' },
		3: { label: 'P3', sublabel: 'Low' },
		4: { label: 'P4', sublabel: 'Lowest' }
	};
</script>

<div class="card bg-base-200 shadow-sm">
	<div class="card-body p-4">
		<div class="flex items-center justify-between mb-4">
			<h3 class="card-title text-base">Review Rules</h3>
			<div class="flex items-center gap-2">
				{#if hasChanges}
					<span class="badge badge-warning badge-sm">Unsaved changes</span>
				{/if}
				<button
					class="btn btn-ghost btn-sm"
					onclick={resetToDefaults}
					disabled={loading || saving}
					title="Reset to defaults"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
				</button>
				{#if hasChanges}
					<button
						class="btn btn-primary btn-sm"
						onclick={saveRules}
						disabled={loading || saving}
					>
						{#if saving}
							<span class="loading loading-spinner loading-xs"></span>
						{:else}
							Save
						{/if}
					</button>
				{/if}
			</div>
		</div>

		{#if error}
			<div class="alert alert-error mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span class="text-sm">{error}</span>
			</div>
		{/if}

		{#if loading}
			<div class="flex justify-center py-8">
				<span class="loading loading-spinner loading-md"></span>
			</div>
		{:else if rules}
			<!-- Legend -->
			<div class="flex items-center gap-4 mb-3 text-xs">
				<div class="flex items-center gap-1.5">
					<div class="w-4 h-4 rounded bg-success/20 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 text-success">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
						</svg>
					</div>
					<span class="opacity-70">Auto-proceed</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="w-4 h-4 rounded bg-base-300 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 opacity-50">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<span class="opacity-70">Requires review</span>
				</div>
			</div>

			<!-- Matrix Table -->
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th class="w-28">Type</th>
							{#each PRIORITIES as priority}
								<th class="text-center w-16">
									<div class="flex flex-col items-center">
										<span class="font-semibold">{PRIORITY_LABELS[priority].label}</span>
										<span class="text-[10px] opacity-50 font-normal">{PRIORITY_LABELS[priority].sublabel}</span>
									</div>
								</th>
							{/each}
							<th class="w-48">Note</th>
						</tr>
					</thead>
					<tbody>
						{#each TASK_TYPES as type}
							{@const typeInfo = TYPE_INFO[type]}
							<tr class="hover">
								<td>
									<div class="flex items-center gap-2">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 {typeInfo.color}">
											<path stroke-linecap="round" stroke-linejoin="round" d={typeInfo.icon} />
										</svg>
										<span class="font-medium">{typeInfo.label}</span>
									</div>
								</td>
								{#each PRIORITIES as priority}
									{@const auto = isAuto(type, priority)}
									<td class="text-center">
										<button
											class="btn btn-sm btn-square transition-all duration-150 {auto ? 'bg-success/20 hover:bg-success/30 border-success/30' : 'bg-base-300 hover:bg-base-content/10 border-base-content/10'}"
											onclick={() => toggleCell(type, priority)}
											title={auto ? 'Click to require review' : 'Click to auto-proceed'}
										>
											{#if auto}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-success">
													<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
												</svg>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 opacity-40">
													<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
													<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											{/if}
										</button>
									</td>
								{/each}
								<td>
									{#if editingNote === type}
										<div class="flex items-center gap-1">
											<input
												type="text"
												class="input input-xs input-bordered flex-1"
												bind:value={noteInput}
												placeholder="Add note..."
												onkeydown={(e) => {
													if (e.key === 'Enter') updateNote(type, noteInput);
													if (e.key === 'Escape') cancelEditNote();
												}}
											/>
											<button
												class="btn btn-xs btn-ghost text-success"
												onclick={() => updateNote(type, noteInput)}
												title="Save"
											>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
													<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
												</svg>
											</button>
											<button
												class="btn btn-xs btn-ghost text-error"
												onclick={cancelEditNote}
												title="Cancel"
											>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
													<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									{:else}
										{@const note = getNote(type)}
										<button
											class="text-left text-xs opacity-60 hover:opacity-100 transition-opacity w-full truncate"
											onclick={() => startEditNote(type)}
											title={note || 'Click to add note'}
										>
											{note || '—'}
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Help text -->
			<div class="mt-4 text-xs opacity-60">
				<p>Lower-priority tasks (P3, P4) auto-proceed. Higher-priority tasks (P0, P1) require human review.</p>
			</div>
		{/if}
	</div>
</div>
