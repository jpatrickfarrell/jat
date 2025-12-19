<script lang="ts">
	/**
	 * DefaultsEditor Component
	 *
	 * Form for editing JAT global defaults from ~/.config/jat/projects.json
	 * Settings here affect agent spawning, model selection, and timing.
	 */

	import { onMount } from 'svelte';

	// Types
	interface JatDefaults {
		terminal: string;
		editor: string;
		tools_path: string;
		claude_flags: string;
		model: string;
		agent_stagger: number;
		claude_startup_timeout: number;
	}

	// State
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);
	let configPath = $state('');

	// Form values
	let terminal = $state('alacritty');
	let editor = $state('code');
	let toolsPath = $state('~/.local/bin');
	let claudeFlags = $state('--dangerously-skip-permissions');
	let model = $state('opus');
	let agentStagger = $state(15);
	let claudeStartupTimeout = $state(20);

	// Track if form has changes
	let originalValues = $state<JatDefaults | null>(null);
	let hasChanges = $derived(
		originalValues !== null && (
			terminal !== originalValues.terminal ||
			editor !== originalValues.editor ||
			toolsPath !== originalValues.tools_path ||
			claudeFlags !== originalValues.claude_flags ||
			model !== originalValues.model ||
			agentStagger !== originalValues.agent_stagger ||
			claudeStartupTimeout !== originalValues.claude_startup_timeout
		)
	);

	// Load defaults on mount
	onMount(() => {
		loadDefaults();
	});

	async function loadDefaults() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/config/defaults');
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to load defaults');
			}

			const defaults = data.defaults;
			terminal = defaults.terminal || 'alacritty';
			editor = defaults.editor || 'code';
			toolsPath = defaults.tools_path || '~/.local/bin';
			claudeFlags = defaults.claude_flags || '--dangerously-skip-permissions';
			model = defaults.model || 'opus';
			agentStagger = defaults.agent_stagger || 15;
			claudeStartupTimeout = defaults.claude_startup_timeout || 20;
			configPath = data.configPath || '';

			// Store original values for change detection
			originalValues = { ...defaults };
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load defaults';
		} finally {
			loading = false;
		}
	}

	async function saveDefaults() {
		saving = true;
		error = null;
		success = null;

		try {
			const response = await fetch('/api/config/defaults', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					defaults: {
						terminal,
						editor,
						tools_path: toolsPath,
						claude_flags: claudeFlags,
						model,
						agent_stagger: agentStagger,
						claude_startup_timeout: claudeStartupTimeout
					}
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to save defaults');
			}

			// Update original values
			originalValues = {
				terminal,
				editor,
				tools_path: toolsPath,
				claude_flags: claudeFlags,
				model,
				agent_stagger: agentStagger,
				claude_startup_timeout: claudeStartupTimeout
			};

			success = 'Defaults saved successfully';
			setTimeout(() => { success = null; }, 3000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save defaults';
		} finally {
			saving = false;
		}
	}

	function resetToOriginal() {
		if (originalValues) {
			terminal = originalValues.terminal;
			editor = originalValues.editor;
			toolsPath = originalValues.tools_path;
			claudeFlags = originalValues.claude_flags;
			model = originalValues.model;
			agentStagger = originalValues.agent_stagger;
			claudeStartupTimeout = originalValues.claude_startup_timeout;
		}
	}
</script>

<div class="defaults-editor">
	<!-- Header -->
	<div class="editor-header">
		<div class="header-content">
			<h2 class="editor-title">Global Defaults</h2>
			<p class="editor-description">
				Configure global settings for agent spawning and system behavior.
				These values are stored in <code>{configPath || '~/.config/jat/projects.json'}</code>
			</p>
		</div>
	</div>

	{#if loading}
		<!-- Loading state -->
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading defaults...</p>
		</div>
	{:else if error && !originalValues}
		<!-- Error state (couldn't load) -->
		<div class="error-state">
			<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<path d="M12 8v4M12 16h.01"/>
			</svg>
			<p class="error-title">Failed to load defaults</p>
			<p class="error-message">{error}</p>
			<button class="retry-btn" onclick={loadDefaults}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
					<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
				</svg>
				Retry
			</button>
		</div>
	{:else}
		<!-- Form -->
		<form class="defaults-form" onsubmit={(e) => { e.preventDefault(); saveDefaults(); }}>
			<!-- Status messages -->
			{#if error}
				<div class="alert alert-error">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
						<circle cx="12" cy="12" r="10"/>
						<path d="M12 8v4M12 16h.01"/>
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			{#if success}
				<div class="alert alert-success">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<span>{success}</span>
				</div>
			{/if}

			<!-- Agent Spawning Section -->
			<div class="form-section">
				<h3 class="section-title">Agent Spawning</h3>

				<div class="form-group">
					<label class="form-label" for="model">
						Default Model
						<span class="label-hint">Claude model for new agents</span>
					</label>
					<select id="model" class="form-select" bind:value={model}>
						<option value="opus">Opus (Most capable)</option>
						<option value="sonnet">Sonnet (Balanced)</option>
						<option value="haiku">Haiku (Fastest)</option>
					</select>
				</div>

				<div class="form-group">
					<label class="form-label" for="claude-flags">
						Claude Flags
						<span class="label-hint">CLI flags passed to claude command</span>
					</label>
					<input
						type="text"
						id="claude-flags"
						class="form-input"
						bind:value={claudeFlags}
						placeholder="--dangerously-skip-permissions"
					/>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label class="form-label" for="agent-stagger">
							Agent Stagger
							<span class="label-hint">Seconds between batch spawns</span>
						</label>
						<div class="input-with-unit">
							<input
								type="number"
								id="agent-stagger"
								class="form-input"
								bind:value={agentStagger}
								min="1"
								max="300"
							/>
							<span class="input-unit">seconds</span>
						</div>
					</div>

					<div class="form-group">
						<label class="form-label" for="startup-timeout">
							Startup Timeout
							<span class="label-hint">Wait time for Claude TUI to start</span>
						</label>
						<div class="input-with-unit">
							<input
								type="number"
								id="startup-timeout"
								class="form-input"
								bind:value={claudeStartupTimeout}
								min="5"
								max="120"
							/>
							<span class="input-unit">seconds</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Tools Section -->
			<div class="form-section">
				<h3 class="section-title">Tools & Environment</h3>

				<div class="form-group">
					<label class="form-label" for="terminal">
						Terminal
						<span class="label-hint">Terminal emulator for new sessions</span>
					</label>
					<input
						type="text"
						id="terminal"
						class="form-input"
						bind:value={terminal}
						placeholder="alacritty"
					/>
				</div>

				<div class="form-group">
					<label class="form-label" for="editor">
						Editor
						<span class="label-hint">Code editor command</span>
					</label>
					<input
						type="text"
						id="editor"
						class="form-input"
						bind:value={editor}
						placeholder="code"
					/>
				</div>

				<div class="form-group">
					<label class="form-label" for="tools-path">
						Tools Path
						<span class="label-hint">Path to JAT tools directory</span>
					</label>
					<input
						type="text"
						id="tools-path"
						class="form-input"
						bind:value={toolsPath}
						placeholder="~/.local/bin"
					/>
				</div>
			</div>

			<!-- Actions -->
			<div class="form-actions">
				<button
					type="button"
					class="btn btn-secondary"
					onclick={resetToOriginal}
					disabled={!hasChanges || saving}
				>
					Reset
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={!hasChanges || saving}
				>
					{#if saving}
						<span class="btn-spinner"></span>
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.defaults-editor {
		max-width: 700px;
	}

	/* Header */
	.editor-header {
		margin-bottom: 1.5rem;
	}

	.editor-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		margin: 0 0 0.5rem 0;
		font-family: ui-monospace, monospace;
	}

	.editor-description {
		font-size: 0.85rem;
		color: oklch(0.60 0.02 250);
		margin: 0;
		line-height: 1.5;
	}

	.editor-description code {
		background: oklch(0.18 0.02 250);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.8rem;
		color: oklch(0.75 0.10 200);
	}

	/* Loading state */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		gap: 1rem;
		color: oklch(0.55 0.02 250);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid oklch(0.30 0.02 250);
		border-top-color: oklch(0.65 0.15 200);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Error state */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		gap: 0.5rem;
		color: oklch(0.55 0.02 250);
	}

	.error-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.60 0.15 25);
		margin-bottom: 0.5rem;
	}

	.error-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: oklch(0.70 0.12 25);
		margin: 0;
	}

	.error-message {
		font-size: 0.8rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
	}

	.retry-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		background: oklch(0.25 0.05 200);
		border: 1px solid oklch(0.35 0.08 200);
		border-radius: 6px;
		color: oklch(0.85 0.08 200);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.retry-btn:hover {
		background: oklch(0.30 0.08 200);
	}

	.btn-icon {
		width: 16px;
		height: 16px;
	}

	/* Form */
	.defaults-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Alert messages */
	.alert {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.85rem;
	}

	.alert-error {
		background: oklch(0.25 0.08 25);
		border: 1px solid oklch(0.40 0.12 25);
		color: oklch(0.85 0.10 25);
	}

	.alert-success {
		background: oklch(0.25 0.08 145);
		border: 1px solid oklch(0.40 0.12 145);
		color: oklch(0.85 0.10 145);
	}

	.alert-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	/* Form sections */
	.form-section {
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 10px;
		padding: 1.25rem;
	}

	.section-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: oklch(0.80 0.08 200);
		margin: 0 0 1rem 0;
		font-family: ui-monospace, monospace;
	}

	/* Form groups */
	.form-group {
		margin-bottom: 1rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 500px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}

	.form-label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: oklch(0.80 0.02 250);
		margin-bottom: 0.5rem;
	}

	.label-hint {
		font-size: 0.75rem;
		font-weight: 400;
		color: oklch(0.55 0.02 250);
	}

	.form-input,
	.form-select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		font-size: 0.875rem;
		font-family: ui-monospace, monospace;
		background: oklch(0.12 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 6px;
		color: oklch(0.90 0.02 250);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.form-input:focus,
	.form-select:focus {
		outline: none;
		border-color: oklch(0.55 0.15 200);
		box-shadow: 0 0 0 3px oklch(0.55 0.15 200 / 0.15);
	}

	.form-input::placeholder {
		color: oklch(0.45 0.02 250);
	}

	.form-select {
		cursor: pointer;
	}

	.input-with-unit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.input-with-unit .form-input {
		width: 100px;
	}

	.input-unit {
		font-size: 0.8rem;
		color: oklch(0.55 0.02 250);
	}

	/* Actions */
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding-top: 0.5rem;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		font-size: 0.85rem;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: ui-monospace, monospace;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: oklch(0.55 0.15 200);
		border: 1px solid oklch(0.60 0.18 200);
		color: oklch(0.98 0.02 200);
	}

	.btn-primary:hover:not(:disabled) {
		background: oklch(0.60 0.18 200);
	}

	.btn-secondary {
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.32 0.02 250);
		color: oklch(0.75 0.02 250);
	}

	.btn-secondary:hover:not(:disabled) {
		background: oklch(0.28 0.02 250);
		color: oklch(0.85 0.02 250);
	}

	.btn-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid oklch(0.98 0.02 200 / 0.3);
		border-top-color: oklch(0.98 0.02 200);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
</style>
