<script lang="ts">
	/**
	 * CanvasTextInputControl - Free-form text entry for canvas controls
	 *
	 * Renders as: [control name] [text input field]
	 * Settings popover: name, placeholder
	 */
	import type { ControlBlock, TextInputControlConfig } from '$lib/types/canvas';

	let {
		block,
		existingNames = [],
		onBlockUpdate,
		onControlChange,
	}: {
		block: ControlBlock;
		existingNames?: string[];
		onBlockUpdate: (updated: ControlBlock) => void;
		onControlChange: (controlName: string, value: unknown) => void;
	} = $props();

	const config = $derived((block.config || {}) as TextInputControlConfig);
	const currentValue = $derived(block.value != null ? String(block.value) : '');

	// Debounce timer for typing
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Settings popover state
	let settingsOpen = $state(false);
	let settingsRef = $state<HTMLDivElement | null>(null);
	let settingsName = $state('');
	let settingsPlaceholder = $state('');
	let settingsError = $state('');

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		// Debounce to avoid flooding updates while typing
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			saveValue(val || null);
		}, 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			// Immediately save on Enter
			if (debounceTimer) clearTimeout(debounceTimer);
			const val = (e.target as HTMLInputElement).value;
			saveValue(val || null);
		}
	}

	function saveValue(val: unknown) {
		const updated = { ...block, value: val };
		onBlockUpdate(updated as ControlBlock);
		if (block.name) {
			onControlChange(block.name, val);
		}
	}

	// Settings
	function openSettings() {
		settingsName = block.name || '';
		settingsPlaceholder = config.placeholder || '';
		settingsError = '';
		settingsOpen = true;
	}

	function closeSettings() {
		settingsOpen = false;
	}

	function saveSettings() {
		const trimmedName = settingsName.trim();
		if (trimmedName && trimmedName !== block.name) {
			const otherNames = existingNames.filter(n => n !== block.name);
			if (otherNames.includes(trimmedName)) {
				settingsError = `Name "${trimmedName}" is already used by another control`;
				return;
			}
		}
		settingsError = '';
		const updatedConfig: TextInputControlConfig = {
			placeholder: settingsPlaceholder || undefined,
		};
		const updated: ControlBlock = {
			...block,
			name: trimmedName || block.name,
			config: updatedConfig,
		};
		onBlockUpdate(updated);
		settingsOpen = false;
	}

	// Close settings on outside click
	$effect(() => {
		if (!settingsOpen) return;
		function handleOutsideClick(e: MouseEvent) {
			if (settingsRef && !settingsRef.contains(e.target as Node)) {
				closeSettings();
			}
		}
		const timer = setTimeout(() => {
			document.addEventListener('mousedown', handleOutsideClick, true);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('mousedown', handleOutsideClick, true);
		};
	});
</script>

<div class="canvas-text-input-control">
	<div class="control-row">
		<span class="control-label">{block.name || 'unnamed'}</span>

		<input
			type="text"
			class="text-input"
			value={currentValue}
			placeholder={config.placeholder || 'Type...'}
			oninput={handleInput}
			onkeydown={handleKeydown}
		/>

		<!-- Settings gear icon -->
		<button
			class="settings-btn"
			onclick={(e) => { e.stopPropagation(); openSettings(); }}
			title="Configure control"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		</button>
	</div>

	<!-- Settings Popover -->
	{#if settingsOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="settings-popover"
			bind:this={settingsRef}
			onclick={(e) => e.stopPropagation()}
			onmousedown={(e) => e.stopPropagation()}
		>
			<div class="settings-header">
				<span class="settings-title">Text Input Settings</span>
				<button class="settings-close" onclick={closeSettings}>×</button>
			</div>

			<div class="settings-body">
				<label class="settings-field">
					<span class="field-label">Name</span>
					<input type="text" class="field-input" placeholder="Control name (used in formulas)" bind:value={settingsName} />
				</label>
				<label class="settings-field">
					<span class="field-label">Placeholder</span>
					<input type="text" class="field-input" placeholder="Placeholder text..." bind:value={settingsPlaceholder} />
				</label>
			</div>

			{#if settingsError}
				<div class="settings-error">{settingsError}</div>
			{/if}

			<div class="settings-footer">
				<button class="settings-cancel" onclick={closeSettings}>Cancel</button>
				<button class="settings-save" onclick={saveSettings}>Save</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.canvas-text-input-control {
		position: relative;
	}

	.control-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-label {
		font-size: 0.75rem;
		font-weight: 600;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		color: oklch(0.65 0.10 300);
		flex-shrink: 0;
	}

	.text-input {
		flex: 1;
		max-width: 250px;
		padding: 0.1875rem 0.5rem;
		font-size: 0.8125rem;
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.35 0.06 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.02 250);
		outline: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.text-input:hover {
		border-color: oklch(0.50 0.10 250);
		background: oklch(0.24 0.02 250);
	}

	.text-input:focus {
		border-color: oklch(0.55 0.12 200);
		background: oklch(0.22 0.02 250);
	}

	.text-input::placeholder {
		color: oklch(0.45 0.02 250);
		font-style: italic;
	}

	.settings-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		color: oklch(0.45 0.02 250);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s, color 0.15s, background 0.15s;
	}

	.canvas-text-input-control:hover .settings-btn {
		opacity: 1;
	}

	.settings-btn:hover {
		color: oklch(0.75 0.12 300);
		background: oklch(0.55 0.12 300 / 0.12);
	}

	/* Settings Popover */
	.settings-popover {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		z-index: 50;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		min-width: 240px;
		animation: settings-scale-in 0.12s ease-out;
	}

	@keyframes settings-scale-in {
		from { opacity: 0; transform: translateY(-4px) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.settings-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.settings-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.80 0.02 250);
	}

	.settings-close {
		background: none;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		font-size: 1rem;
		padding: 0;
		line-height: 1;
	}

	.settings-close:hover {
		color: oklch(0.80 0.02 250);
	}

	.settings-body {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.settings-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-label {
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.60 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.field-input {
		padding: 0.3125rem 0.5rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}

	.field-input:focus {
		border-color: oklch(0.55 0.12 300 / 0.5);
	}

	.settings-error {
		margin: 0 0.75rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.75 0.15 25);
		background: oklch(0.50 0.12 25 / 0.12);
		border: 1px solid oklch(0.55 0.15 25 / 0.25);
		border-radius: 0.25rem;
	}

	.settings-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.625rem 0.75rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.settings-cancel {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		background: transparent;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
	}

	.settings-cancel:hover {
		background: oklch(0.22 0.02 250);
	}

	.settings-save {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		background: oklch(0.55 0.12 300 / 0.2);
		border: 1px solid oklch(0.55 0.12 300 / 0.4);
		border-radius: 0.25rem;
		color: oklch(0.80 0.10 300);
		cursor: pointer;
	}

	.settings-save:hover {
		background: oklch(0.55 0.12 300 / 0.3);
	}
</style>
