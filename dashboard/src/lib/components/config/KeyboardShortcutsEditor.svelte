<script lang="ts">
	/**
	 * KeyboardShortcutsEditor Component
	 *
	 * Displays and manages keyboard shortcuts for slash commands.
	 * Shows all commands with their assigned shortcuts, allows inline editing,
	 * and validates for conflicts.
	 *
	 * @see dashboard/src/lib/stores/keyboardShortcuts.svelte.ts for store API
	 * @see dashboard/src/lib/stores/configStore.svelte.ts for commands data
	 */

	import { onMount } from 'svelte';
	import {
		getAllShortcuts,
		getShortcut,
		setShortcut,
		validateShortcut,
		checkShortcutConflict,
		getDisplayShortcut,
		findCommandWithShortcut,
		initKeyboardShortcuts,
		clearAllShortcuts
	} from '$lib/stores/keyboardShortcuts.svelte';
	import {
		loadCommands,
		getCommands,
		isCommandsLoading
	} from '$lib/stores/configStore.svelte';
	import type { SlashCommand } from '$lib/types/config';

	// Global app shortcuts (hardcoded in +layout.svelte)
	interface GlobalShortcut {
		key: string;
		description: string;
		context?: string;
	}

	const globalShortcuts: GlobalShortcut[] = [
		{ key: 'Cmd+K', description: 'Open Command Palette', context: 'Global' },
		{ key: 'Alt+N', description: 'Create New Task', context: 'Global' },
		{ key: 'Alt+E', description: 'Open Epic Swarm Modal', context: 'Global' },
		{ key: 'Alt+S', description: 'Open Start Next Dropdown', context: 'Global' },
		{ key: 'Alt+Shift+P', description: 'Add New Project', context: 'Global' },
		{ key: 'Alt+A', description: 'Attach Terminal to Session', context: 'Hovered session' },
		{ key: 'Alt+K', description: 'Kill Session', context: 'Hovered session' },
		{ key: 'Alt+I', description: 'Interrupt Session (Ctrl+C)', context: 'Hovered session' },
		{ key: 'Alt+P', description: 'Pause Session', context: 'Hovered session' },
		{ key: 'Alt+1-9', description: 'Jump to Session by Position', context: 'Work page' },
		{ key: 'Escape', description: 'Close Modals/Drawers', context: 'Global' },
	];

	// State
	let loading = $state(true);
	let editingCommand = $state<string | null>(null);
	let editValue = $state('');
	let error = $state<string | null>(null);
	let warning = $state<string | null>(null);
	let success = $state<string | null>(null);
	let showClearConfirm = $state(false);
	let filterText = $state('');
	let showGlobalShortcuts = $state(true);

	// Reactive data
	let commands = $derived(getCommands());
	let shortcuts = $derived(getAllShortcuts());

	// Filter commands based on search
	let filteredCommands = $derived.by(() => {
		if (!filterText.trim()) return commands;
		const search = filterText.toLowerCase();
		return commands.filter(cmd =>
			cmd.name.toLowerCase().includes(search) ||
			cmd.invocation.toLowerCase().includes(search) ||
			cmd.namespace.toLowerCase().includes(search) ||
			(getShortcut(cmd.invocation) || '').toLowerCase().includes(search)
		);
	});

	// Group commands by namespace
	let groupedCommands = $derived.by(() => {
		const groups = new Map<string, SlashCommand[]>();

		for (const cmd of filteredCommands) {
			const existing = groups.get(cmd.namespace) || [];
			groups.set(cmd.namespace, [...existing, cmd]);
		}

		// Sort namespaces: jat first, then local, then alphabetically
		const sortedEntries = Array.from(groups.entries()).sort(([a], [b]) => {
			if (a === 'jat') return -1;
			if (b === 'jat') return 1;
			if (a === 'local') return -1;
			if (b === 'local') return 1;
			return a.localeCompare(b);
		});

		return sortedEntries;
	});

	// Count of assigned shortcuts
	let assignedCount = $derived(Object.keys(shortcuts).length);
	let totalCommands = $derived(commands.length);

	onMount(async () => {
		initKeyboardShortcuts();
		await loadCommands();
		loading = false;
	});

	function startEditing(invocation: string) {
		editingCommand = invocation;
		editValue = getShortcut(invocation) || '';
		error = null;
		warning = null;
	}

	function cancelEditing() {
		editingCommand = null;
		editValue = '';
		error = null;
		warning = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		// Capture keyboard shortcut
		if (editingCommand && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Tab') {
			event.preventDefault();

			const parts: string[] = [];
			if (event.ctrlKey) parts.push('Ctrl');
			if (event.altKey) parts.push('Alt');
			if (event.shiftKey) parts.push('Shift');
			if (event.metaKey) parts.push('Meta');

			// Add the key if it's not a modifier
			const key = event.key;
			if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
				parts.push(key.length === 1 ? key.toUpperCase() : key);
			}

			if (parts.length > 0) {
				editValue = parts.join('+');
				validateCurrentShortcut();
			}
		}

		// Handle escape to cancel
		if (event.key === 'Escape') {
			cancelEditing();
		}

		// Handle enter to save
		if (event.key === 'Enter' && editingCommand) {
			saveShortcut();
		}
	}

	function validateCurrentShortcut() {
		error = null;
		warning = null;

		if (!editValue.trim()) return;

		// Validate format
		const validationError = validateShortcut(editValue);
		if (validationError) {
			error = validationError;
			return;
		}

		// Check for conflicts with other commands
		const conflictingCommand = findCommandWithShortcut(editValue);
		if (conflictingCommand && conflictingCommand !== editingCommand) {
			error = `Already assigned to ${conflictingCommand}`;
			return;
		}

		// Check for browser conflicts
		const conflictWarning = checkShortcutConflict(editValue);
		if (conflictWarning) {
			warning = conflictWarning;
		}
	}

	function saveShortcut() {
		if (!editingCommand) return;

		// Validate before saving
		if (editValue.trim()) {
			const validationError = validateShortcut(editValue);
			if (validationError) {
				error = validationError;
				return;
			}

			const conflictingCommand = findCommandWithShortcut(editValue);
			if (conflictingCommand && conflictingCommand !== editingCommand) {
				error = `Already assigned to ${conflictingCommand}`;
				return;
			}
		}

		// Save (empty string removes the shortcut)
		setShortcut(editingCommand, editValue.trim() || undefined);

		success = editValue.trim()
			? `Shortcut saved: ${getDisplayShortcut(editValue)}`
			: 'Shortcut removed';

		cancelEditing();

		// Clear success after 2s
		setTimeout(() => {
			success = null;
		}, 2000);
	}

	function removeShortcut(invocation: string) {
		setShortcut(invocation, undefined);
		success = 'Shortcut removed';
		setTimeout(() => {
			success = null;
		}, 2000);
	}

	function handleClearAll() {
		clearAllShortcuts();
		showClearConfirm = false;
		success = 'All shortcuts cleared';
		setTimeout(() => {
			success = null;
		}, 2000);
	}
</script>

<div class="shortcuts-editor">
	<!-- Header -->
	<div class="mb-4">
		<h2 class="text-lg font-semibold text-base-content">Keyboard Shortcuts</h2>
		<p class="text-sm text-base-content/60 mt-1">
			View global shortcuts and assign custom shortcuts to slash commands.
		</p>
	</div>

	<!-- Status messages -->
	{#if success}
		<div class="alert alert-success mb-4 py-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
			</svg>
			<span>{success}</span>
		</div>
	{/if}

	<!-- Global App Shortcuts Section -->
	<div class="collapse collapse-arrow bg-base-200/50 rounded-lg mb-6">
		<input type="checkbox" checked={showGlobalShortcuts} onchange={(e) => showGlobalShortcuts = e.currentTarget.checked} />
		<div class="collapse-title font-medium flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
			</svg>
			Global App Shortcuts
			<span class="badge badge-sm badge-ghost">{globalShortcuts.length}</span>
		</div>
		<div class="collapse-content">
			<p class="text-xs text-base-content/60 mb-3">
				These shortcuts are built into the app and work from anywhere (unless you're typing in an input field).
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{#each globalShortcuts as shortcut}
					<div class="flex items-center justify-between px-3 py-2 rounded-lg bg-base-100/50">
						<div class="flex-1">
							<span class="text-sm">{shortcut.description}</span>
							{#if shortcut.context && shortcut.context !== 'Global'}
								<span class="text-xs text-base-content/40 ml-2">({shortcut.context})</span>
							{/if}
						</div>
						<kbd class="kbd kbd-sm font-mono">{shortcut.key}</kbd>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Command Shortcuts Section Header -->
	<div class="flex items-center gap-2 mb-4">
		<h3 class="text-base font-semibold text-base-content">Command Shortcuts</h3>
		<span class="text-sm text-base-content/50">({assignedCount} / {totalCommands} assigned)</span>
	</div>

	<!-- Search and actions -->
	<div class="flex items-center gap-3 mb-4">
		<div class="flex-1">
			<input
				type="text"
				placeholder="Filter commands..."
				class="input input-bordered input-sm w-full max-w-xs"
				bind:value={filterText}
			/>
		</div>
		<div class="flex gap-2">
			{#if showClearConfirm}
				<span class="text-sm text-warning mr-2">Clear all shortcuts?</span>
				<button class="btn btn-error btn-sm" onclick={handleClearAll}>Yes, Clear</button>
				<button class="btn btn-ghost btn-sm" onclick={() => showClearConfirm = false}>Cancel</button>
			{:else if assignedCount > 0}
				<button
					class="btn btn-ghost btn-sm text-error"
					onclick={() => showClearConfirm = true}
				>
					Clear All
				</button>
			{/if}
		</div>
	</div>

	<!-- Loading state -->
	{#if loading || isCommandsLoading()}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if commands.length === 0}
		<div class="text-center py-12 text-base-content/60">
			<p>No commands found.</p>
			<p class="text-sm mt-1">Commands are loaded from your project's commands directory.</p>
		</div>
	{:else if filteredCommands.length === 0}
		<div class="text-center py-8 text-base-content/60">
			<p>No commands match "{filterText}"</p>
			<button class="btn btn-ghost btn-sm mt-2" onclick={() => filterText = ''}>
				Clear filter
			</button>
		</div>
	{:else}
		<!-- Commands list grouped by namespace -->
		<div class="space-y-6">
			{#each groupedCommands as [namespace, cmds]}
				<div class="shortcuts-group">
					<h3 class="text-sm font-semibold text-base-content/70 mb-2 flex items-center gap-2">
						<span class="badge badge-sm badge-outline">{namespace}</span>
						<span class="text-base-content/40">{cmds.length} command{cmds.length !== 1 ? 's' : ''}</span>
					</h3>

					<div class="space-y-1">
						{#each cmds as cmd}
							{@const currentShortcut = getShortcut(cmd.invocation)}
							{@const isEditing = editingCommand === cmd.invocation}

							<div
								class="shortcut-row flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200/50 transition-colors"
								class:bg-base-200={isEditing}
							>
								<!-- Command info -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<code class="text-sm font-mono text-primary">{cmd.invocation}</code>
									</div>
									{#if cmd.description}
										<p class="text-xs text-base-content/50 truncate mt-0.5">{cmd.description}</p>
									{/if}
								</div>

								<!-- Shortcut display/edit -->
								<div class="flex items-center gap-2 shrink-0">
									{#if isEditing}
										<div class="flex flex-col items-end gap-1">
											<div class="flex items-center gap-2">
												<input
													type="text"
													class="input input-bordered input-sm w-40 font-mono text-center"
													class:input-error={error}
													class:input-warning={warning && !error}
													placeholder="Press keys..."
													bind:value={editValue}
													onkeydown={handleKeydown}
													autofocus
												/>
												<button
													class="btn btn-success btn-sm btn-square"
													onclick={saveShortcut}
													disabled={!!error}
													title="Save (Enter)"
												>
													<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
													</svg>
												</button>
												<button
													class="btn btn-ghost btn-sm btn-square"
													onclick={cancelEditing}
													title="Cancel (Esc)"
												>
													<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
													</svg>
												</button>
											</div>
											{#if error}
												<span class="text-xs text-error">{error}</span>
											{:else if warning}
												<span class="text-xs text-warning">{warning}</span>
											{/if}
										</div>
									{:else}
										{#if currentShortcut}
											<kbd class="kbd kbd-sm font-mono">{getDisplayShortcut(currentShortcut)}</kbd>
											<button
												class="btn btn-ghost btn-sm btn-square opacity-50 hover:opacity-100"
												onclick={() => startEditing(cmd.invocation)}
												title="Edit shortcut"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
													<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
												</svg>
											</button>
											<button
												class="btn btn-ghost btn-sm btn-square opacity-50 hover:opacity-100 text-error"
												onclick={() => removeShortcut(cmd.invocation)}
												title="Remove shortcut"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
												</svg>
											</button>
										{:else}
											<button
												class="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content"
												onclick={() => startEditing(cmd.invocation)}
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
												</svg>
												Add shortcut
											</button>
										{/if}
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Help text -->
	<div class="mt-6 pt-4 border-t border-base-300">
		<h4 class="text-sm font-semibold text-base-content/70 mb-2">Tips</h4>
		<ul class="text-xs text-base-content/50 space-y-1">
			<li>• Click "Add shortcut" and press your desired key combination</li>
			<li>• Shortcuts must include Alt, Ctrl, or Meta/Cmd modifier</li>
			<li>• Avoid common browser shortcuts like Ctrl+C, Ctrl+V</li>
			<li>• Alt+key combinations are generally safe to use</li>
			<li>• Shortcuts are saved in your browser's localStorage</li>
		</ul>
	</div>
</div>

<style>
	.shortcuts-editor {
		max-width: 800px;
	}

	.shortcut-row:hover .btn-ghost {
		opacity: 0.7;
	}
</style>
