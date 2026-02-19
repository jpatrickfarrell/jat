<script lang="ts">
	/**
	 * SwarmSettingsEditor Component
	 *
	 * Consolidates all agent autopilot settings:
	 * - Autonomous Mode (skip_permissions)
	 * - Auto-pause idle sessions
	 * - Session cleanup (auto-kill completed sessions)
	 * - Review rules (via embedded ReviewRulesEditor) - shown when session cleanup enabled
	 * - Spawn settings (model, max sessions, agent count, stagger)
	 *
	 * All settings auto-save on change (no manual Save button).
	 * Settings are persisted to ~/.config/jat/projects.json under defaults.
	 */

	import { onMount } from 'svelte';
	import { JAT_DEFAULTS } from '$lib/config/constants';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';
	import { setMaxSessions, type MaxSessions } from '$lib/stores/preferences.svelte';
	import { updateAutoKillConfig } from '$lib/stores/autoKillConfig';
	import { autoPauseConfig } from '$lib/stores/autoPauseConfig';
	import ReviewRulesEditor from '$lib/components/ReviewRulesEditor.svelte';

	/** Coerce a number to the nearest valid MaxSessions value */
	function toMaxSessions(n: number): MaxSessions {
		const valid: MaxSessions[] = [4, 6, 8, 10, 12, 16, 20];
		let best: MaxSessions = 12;
		let bestDiff = Infinity;
		for (const v of valid) {
			const diff = Math.abs(n - v);
			if (diff < bestDiff) {
				bestDiff = diff;
				best = v;
			}
		}
		return best;
	}

	// State
	let loading = $state(true);
	let saving = $state(false);

	// Form state - spawn settings
	let model = $state(JAT_DEFAULTS.model);
	let maxSessions = $state(JAT_DEFAULTS.max_sessions);
	let defaultAgentCount = $state(JAT_DEFAULTS.default_agent_count);
	let agentStagger = $state(JAT_DEFAULTS.agent_stagger);
	let claudeStartupTimeout = $state(JAT_DEFAULTS.claude_startup_timeout);

	// Form state - auto-pause settings
	let autoPauseEnabled = $state(JAT_DEFAULTS.auto_pause_enabled as boolean);
	let autoPauseIdleTimeout = $state(JAT_DEFAULTS.auto_pause_idle_timeout as number);

	// Form state - auto-kill settings
	let autoKillEnabled = $state(false);
	let autoKillDelay = $state(60);
	let autoKillP0 = $state(false);
	let autoKillP1 = $state(false);
	let autoKillP2 = $state(false);
	let autoKillP3 = $state(true);
	let autoKillP4 = $state(true);

	// Form state - autonomous mode
	let skipPermissions = $state(false);

	// Model options
	const modelOptions = [
		{ value: 'opus', label: 'Claude Opus', description: 'Most capable, higher cost' },
		{ value: 'sonnet', label: 'Claude Sonnet', description: 'Balanced performance' },
		{ value: 'haiku', label: 'Claude Haiku', description: 'Fast and efficient' }
	];

	// Validation
	const VALIDATION_RULES = {
		autoKillDelay: { min: 5, max: 300 }
	};

	let autoKillDelayError = $derived.by(() => {
		if (!autoKillEnabled) return null;
		if (autoKillDelay < VALIDATION_RULES.autoKillDelay.min) {
			return `Minimum is ${VALIDATION_RULES.autoKillDelay.min} seconds`;
		}
		if (autoKillDelay > VALIDATION_RULES.autoKillDelay.max) {
			return `Maximum is ${VALIDATION_RULES.autoKillDelay.max} seconds`;
		}
		return null;
	});

	let hasValidationErrors = $derived(autoKillDelayError !== null);

	// Debounce timer for auto-save on number inputs
	let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Load current settings
	async function loadDefaults() {
		loading = true;
		try {
			const response = await fetch('/api/config/defaults');
			if (!response.ok) throw new Error('Failed to load settings');

			const data = await response.json();
			const defaults = data.defaults || {};

			// Update form state
			model = defaults.model ?? JAT_DEFAULTS.model;
			maxSessions = defaults.max_sessions ?? JAT_DEFAULTS.max_sessions;
			defaultAgentCount = defaults.default_agent_count ?? JAT_DEFAULTS.default_agent_count;
			agentStagger = defaults.agent_stagger ?? JAT_DEFAULTS.agent_stagger;
			claudeStartupTimeout = defaults.claude_startup_timeout ?? JAT_DEFAULTS.claude_startup_timeout;
			autoPauseEnabled = defaults.auto_pause_enabled ?? (JAT_DEFAULTS.auto_pause_enabled as boolean);
			autoPauseIdleTimeout = defaults.auto_pause_idle_timeout ?? (JAT_DEFAULTS.auto_pause_idle_timeout as number);
			autoKillEnabled = defaults.auto_kill_enabled ?? false;
			autoKillDelay = defaults.auto_kill_delay ?? 60;
			autoKillP0 = defaults.auto_kill_p0 ?? false;
			autoKillP1 = defaults.auto_kill_p1 ?? false;
			autoKillP2 = defaults.auto_kill_p2 ?? false;
			autoKillP3 = defaults.auto_kill_p3 ?? true;
			autoKillP4 = defaults.auto_kill_p4 ?? true;
			skipPermissions = defaults.skip_permissions ?? false;

			// Sync max_sessions to client-side preferences store (localStorage)
			setMaxSessions(toMaxSessions(maxSessions));
		} catch (error) {
			console.error('[SwarmSettings] Load error:', error);
			errorToast('Failed to load settings', error instanceof Error ? error.message : 'Unknown error');
		} finally {
			loading = false;
		}
	}

	// Auto-save all settings
	async function autoSave() {
		if (hasValidationErrors || loading) return;
		saving = true;
		try {
			const response = await fetch('/api/config/defaults', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					defaults: {
						model,
						max_sessions: maxSessions,
						default_agent_count: defaultAgentCount,
						agent_stagger: agentStagger,
						claude_startup_timeout: claudeStartupTimeout,
						auto_pause_enabled: autoPauseEnabled,
						auto_pause_idle_timeout: autoPauseIdleTimeout,
						auto_kill_enabled: autoKillEnabled,
						auto_kill_delay: autoKillDelay,
						auto_kill_p0: autoKillP0,
						auto_kill_p1: autoKillP1,
						auto_kill_p2: autoKillP2,
						auto_kill_p3: autoKillP3,
						auto_kill_p4: autoKillP4,
						skip_permissions: skipPermissions
					}
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to save');
			}

			// Sync max_sessions to client-side preferences store (localStorage)
			setMaxSessions(toMaxSessions(maxSessions));

			// Update runtime auto-kill config store
			updateAutoKillConfig({
				enabled: autoKillEnabled,
				defaultDelaySeconds: autoKillDelay,
				priorityEnabled: {
					0: autoKillP0,
					1: autoKillP1,
					2: autoKillP2,
					3: autoKillP3,
					4: autoKillP4
				}
			});

			// Update runtime auto-pause config store
			autoPauseConfig.set({
				enabled: autoPauseEnabled,
				idleTimeoutSeconds: autoPauseIdleTimeout
			});
		} catch (error) {
			console.error('[SwarmSettings] Save error:', error);
			errorToast('Failed to save settings', error instanceof Error ? error.message : 'Unknown error');
		} finally {
			saving = false;
		}
	}

	// Debounced auto-save for number inputs
	function scheduleAutoSave() {
		if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
		saveDebounceTimer = setTimeout(autoSave, 600);
	}

	// Autonomous mode toggle with special toast
	async function handleSkipPermissionsToggle(event: Event) {
		const checkbox = event.target as HTMLInputElement;
		skipPermissions = checkbox.checked;

		try {
			await autoSave();
			successToast(
				skipPermissions
					? 'Autonomous mode enabled'
					: 'Autonomous mode disabled',
				skipPermissions
					? 'Agents will run without permission prompts.'
					: ''
			);
		} catch (err) {
			// Revert the toggle on error
			skipPermissions = !skipPermissions;
		}
	}

	// Reset spawn settings to factory defaults and auto-save
	function resetSpawnToFactory() {
		model = JAT_DEFAULTS.model;
		maxSessions = JAT_DEFAULTS.max_sessions;
		defaultAgentCount = JAT_DEFAULTS.default_agent_count;
		agentStagger = JAT_DEFAULTS.agent_stagger;
		claudeStartupTimeout = JAT_DEFAULTS.claude_startup_timeout;
		autoSave();
	}

	// Reset auto-pause to factory defaults and auto-save
	function resetAutoPauseToFactory() {
		autoPauseEnabled = JAT_DEFAULTS.auto_pause_enabled as boolean;
		autoPauseIdleTimeout = JAT_DEFAULTS.auto_pause_idle_timeout as number;
		autoSave();
	}

	// Reset auto-kill to factory defaults and auto-save
	function resetAutoKillToFactory() {
		autoKillEnabled = JAT_DEFAULTS.auto_kill_enabled as boolean;
		autoKillDelay = JAT_DEFAULTS.auto_kill_delay as number;
		autoKillP0 = JAT_DEFAULTS.auto_kill_p0 as boolean;
		autoKillP1 = JAT_DEFAULTS.auto_kill_p1 as boolean;
		autoKillP2 = JAT_DEFAULTS.auto_kill_p2 as boolean;
		autoKillP3 = JAT_DEFAULTS.auto_kill_p3 as boolean;
		autoKillP4 = JAT_DEFAULTS.auto_kill_p4 as boolean;
		autoSave();
	}

	onMount(() => {
		loadDefaults();
	});
</script>

<div class="swarm-settings">
	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<!-- Header -->
		<div class="settings-header">
			<div>
				<h2 class="text-lg font-semibold" style="color: oklch(0.90 0.02 250);">Autopilot Settings</h2>
				<p class="text-sm mt-1" style="color: oklch(0.55 0.02 250);">
					Configure agent spawning, session lifecycle, and orchestration behavior
				</p>
			</div>
			{#if saving}
				<span class="saving-indicator">Saving...</span>
			{/if}
		</div>

		<!-- Autonomous Mode Section -->
		<div class="settings-section autonomous-section">
			<div class="section-header">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4" style="color: oklch(0.70 0.15 45);">
					<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
				</svg>
				<span>Autonomous Mode</span>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						class="toggle toggle-warning"
						checked={skipPermissions}
						onchange={handleSkipPermissionsToggle}
						disabled={saving}
					/>
					<span class="label-text font-semibold" style="color: oklch(0.75 0.02 250);">
						Enable autonomous mode
					</span>
				</label>
				<label class="label">
					<span class="label-text-alt" style="color: oklch(0.50 0.02 250);">
						Pass --dangerously-skip-permissions to Claude and --full-auto to Codex.
					</span>
				</label>
			</div>

			{#if skipPermissions}
				<div class="enabled-notice">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-shrink-0" style="color: oklch(0.70 0.15 145);">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<span>Autonomous mode is <strong>enabled</strong>. Agents will run without permission prompts.</span>
				</div>
			{/if}
		</div>

		<!-- Auto-Pause Section -->
		<div class="settings-section">
			<div class="section-header-with-actions">
				<div class="section-header">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
					</svg>
					<span>Auto-Pause Idle Sessions</span>
				</div>
				<button
					class="btn btn-ghost btn-sm btn-square"
					onclick={resetAutoPauseToFactory}
					disabled={saving}
					title="Reset to defaults"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
				</button>
			</div>

			<p class="text-sm mb-4" style="color: oklch(0.55 0.02 250);">
				Automatically pause sessions that have been idle or completed for too long.
				Paused sessions free up tmux slots and reduce polling overhead.
			</p>

			<div class="toggle-with-input">
				<label class="label cursor-pointer justify-start gap-3 flex-1">
					<input
						type="checkbox"
						class="toggle toggle-primary"
						bind:checked={autoPauseEnabled}
						onchange={() => autoSave()}
					/>
					<div>
						<span class="label-text font-semibold" style="color: oklch(0.75 0.02 250);">
							Enable auto-pause
						</span>
						<div class="text-xs mt-0.5" style="color: oklch(0.50 0.02 250);">
							Pause idle/completed sessions after timeout
						</div>
					</div>
				</label>
				{#if autoPauseEnabled}
					<div class="inline-number-field">
						<span class="text-xs" style="color: oklch(0.55 0.02 250);">Timeout</span>
						<input
							type="number"
							class="input input-bordered input-sm"
							bind:value={autoPauseIdleTimeout}
							oninput={scheduleAutoSave}
							min="60"
							max="3600"
							style="width: 80px;"
						/>
						<span class="text-xs" style="color: oklch(0.45 0.02 250);">sec</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Session Cleanup (Auto-Kill) Section -->
		<div class="settings-section">
			<div class="section-header-with-actions">
				<div class="section-header">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
					</svg>
					<span>Session Cleanup</span>
				</div>
				<button
					class="btn btn-ghost btn-sm btn-square"
					onclick={resetAutoKillToFactory}
					disabled={saving}
					title="Reset to defaults"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
				</button>
			</div>

			<p class="text-sm mb-4" style="color: oklch(0.55 0.02 250);">
				Automatically close tmux sessions after tasks complete.
				When enabled, review rules below control which tasks auto-proceed vs require human review.
			</p>

			<div class="toggle-with-input">
				<label class="label cursor-pointer justify-start gap-3 flex-1">
					<input
						type="checkbox"
						class="toggle toggle-primary"
						bind:checked={autoKillEnabled}
						onchange={() => autoSave()}
					/>
					<div>
						<span class="label-text font-semibold" style="color: oklch(0.75 0.02 250);">
							Auto-cleanup completed sessions
						</span>
						<div class="text-xs mt-0.5" style="color: oklch(0.50 0.02 250);">
							Kill tmux sessions after completion delay
						</div>
					</div>
				</label>
				{#if autoKillEnabled}
					<div class="inline-number-field">
						<span class="text-xs" style="color: oklch(0.55 0.02 250);">Delay</span>
						<input
							type="number"
							class="input input-bordered input-sm"
							class:input-error={autoKillDelayError}
							bind:value={autoKillDelay}
							oninput={scheduleAutoSave}
							min={VALIDATION_RULES.autoKillDelay.min}
							max={VALIDATION_RULES.autoKillDelay.max}
							style="width: 80px;"
						/>
						<span class="text-xs" style="color: oklch(0.45 0.02 250);">sec</span>
					</div>
				{/if}
			</div>
			{#if autoKillDelayError}
				<div class="text-xs mt-1" style="color: oklch(0.70 0.15 25);">{autoKillDelayError}</div>
			{/if}

			{#if autoKillEnabled}
				<!-- Per-Priority Toggles -->
				<div class="mt-4">
					<label class="label">
						<span class="label-text font-semibold">Priorities to Auto-Cleanup</span>
					</label>
					<div class="priority-toggles">
						<label class="priority-toggle" for="swarm-auto-kill-p0">
							<input
								type="checkbox"
								id="swarm-auto-kill-p0"
								class="checkbox checkbox-xs checkbox-error"
								bind:checked={autoKillP0}
								onchange={() => autoSave()}
							/>
							<span class="priority-badge priority-p0">P0</span>
							<span class="priority-label">Critical</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p1">
							<input
								type="checkbox"
								id="swarm-auto-kill-p1"
								class="checkbox checkbox-xs checkbox-warning"
								bind:checked={autoKillP1}
								onchange={() => autoSave()}
							/>
							<span class="priority-badge priority-p1">P1</span>
							<span class="priority-label">High</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p2">
							<input
								type="checkbox"
								id="swarm-auto-kill-p2"
								class="checkbox checkbox-xs checkbox-info"
								bind:checked={autoKillP2}
								onchange={() => autoSave()}
							/>
							<span class="priority-badge priority-p2">P2</span>
							<span class="priority-label">Medium</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p3">
							<input
								type="checkbox"
								id="swarm-auto-kill-p3"
								class="checkbox checkbox-xs"
								bind:checked={autoKillP3}
								onchange={() => autoSave()}
							/>
							<span class="priority-badge priority-p3">P3</span>
							<span class="priority-label">Low</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p4">
							<input
								type="checkbox"
								id="swarm-auto-kill-p4"
								class="checkbox checkbox-xs"
								bind:checked={autoKillP4}
								onchange={() => autoSave()}
							/>
							<span class="priority-badge priority-p4">P4</span>
							<span class="priority-label">Lowest</span>
						</label>
					</div>
					<p class="text-xs mt-2" style="color: oklch(0.50 0.02 250);">
						Unchecked priorities will keep their sessions open after completion.
					</p>
				</div>
			{/if}
		</div>

		<!-- Review Rules Section (only shown when session cleanup is enabled) -->
		{#if autoKillEnabled}
			<div class="settings-section">
				<div class="section-header">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<span>Review Rules</span>
				</div>
				<p class="text-sm mb-4" style="color: oklch(0.55 0.02 250);">
					When an agent finishes and emits a <code style="background: oklch(0.25 0.02 250); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: ui-monospace, monospace; font-size: 0.8rem; color: oklch(0.80 0.10 200);">review</code> signal, these rules decide what happens next.
					Tasks marked <strong style="color: oklch(0.75 0.02 250);">auto</strong> will auto-trigger completion. Tasks marked <strong style="color: oklch(0.75 0.02 250);">review</strong> require you to approve before completing.
				</p>
				<ReviewRulesEditor />
			</div>
		{/if}

		<!-- Spawn Settings Section (moved to bottom) -->
		<div class="settings-section">
			<div class="section-header-with-actions">
				<div class="section-header">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
						/>
					</svg>
					<span>Spawn Configuration</span>
				</div>
				<button
					class="btn btn-ghost btn-sm btn-square"
					onclick={resetSpawnToFactory}
					disabled={saving}
					title="Reset to defaults"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
				</button>
			</div>

			<div class="settings-grid">
				<!-- Model Selection -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Default Model</span>
					</label>
					<select class="select select-bordered" bind:value={model} onchange={() => autoSave()}>
						{#each modelOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					<label class="label">
						<span class="label-text-alt" style="color: oklch(0.50 0.02 250);">
							{modelOptions.find((o) => o.value === model)?.description}
						</span>
					</label>
				</div>

				<!-- Max Sessions -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Max Concurrent Sessions</span>
					</label>
					<input
						type="number"
						class="input input-bordered"
						bind:value={maxSessions}
						oninput={scheduleAutoSave}
						min="1"
						max="20"
					/>
					<label class="label">
						<span class="label-text-alt" style="color: oklch(0.50 0.02 250);">
							Maximum tmux sessions allowed (1-20)
						</span>
					</label>
				</div>

				<!-- Default Agent Count -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Default Agent Count</span>
					</label>
					<input
						type="number"
						class="input input-bordered"
						bind:value={defaultAgentCount}
						oninput={scheduleAutoSave}
						min="1"
						max={maxSessions}
					/>
					<label class="label">
						<span class="label-text-alt" style="color: oklch(0.50 0.02 250);">
							Default number of agents to spawn in swarm
						</span>
					</label>
				</div>

				<!-- Agent Stagger -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Spawn Stagger (seconds)</span>
					</label>
					<input
						type="number"
						class="input input-bordered"
						bind:value={agentStagger}
						oninput={scheduleAutoSave}
						min="1"
						max="120"
					/>
					<label class="label">
						<span class="label-text-alt" style="color: oklch(0.50 0.02 250);">
							Delay between spawning each agent (1-120s)
						</span>
					</label>
				</div>

				<!-- Claude Startup Timeout -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Claude Startup Timeout (seconds)</span>
					</label>
					<input
						type="number"
						class="input input-bordered"
						bind:value={claudeStartupTimeout}
						oninput={scheduleAutoSave}
						min="5"
						max="120"
					/>
					<label class="label">
						<span class="label-text-alt" style="color: oklch(0.50 0.02 250);">
							How long to wait for Claude Code TUI to start
						</span>
					</label>
				</div>
			</div>
		</div>

	{/if}
</div>

<style>
	.swarm-settings {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.settings-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.settings-section {
		padding: 1rem;
		border-radius: 0.5rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
	}

	.section-header-with-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: oklch(0.80 0.08 200);
		font-family: ui-monospace, monospace;
	}

	.section-header-with-actions + .settings-grid {
		margin-top: 0;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.form-control {
		display: flex;
		flex-direction: column;
	}

	.label {
		padding: 0.25rem 0;
	}

	.label-text {
		color: oklch(0.75 0.02 250);
	}

	.label-text-alt {
		font-size: 0.75rem;
	}

	.select,
	.input {
		background: oklch(0.20 0.01 250);
		border-color: oklch(0.30 0.02 250);
		color: oklch(0.90 0.02 250);
	}

	.select:focus,
	.input:focus {
		border-color: oklch(0.50 0.15 200);
		outline: none;
	}

	/* Autonomous Mode Section */
	.autonomous-section {
		border-color: oklch(0.35 0.12 45);
		background: oklch(0.16 0.03 45 / 0.3);
	}

	.saving-indicator {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		font-size: 0.7rem;
		font-weight: 400;
		color: oklch(0.85 0.15 200);
		background: oklch(0.30 0.08 200 / 0.5);
		border-radius: 0.25rem;
		animation: pulse 1s ease-in-out infinite;
	}

	.enabled-notice {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.75rem;
		padding: 0.625rem 0.875rem;
		background: oklch(0.25 0.08 145 / 0.3);
		border: 1px solid oklch(0.40 0.12 145 / 0.5);
		border-radius: 0.5rem;
		font-size: 0.8rem;
		color: oklch(0.80 0.10 145);
	}

	/* Priority toggles */
	.priority-toggles {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	@media (min-width: 400px) {
		.priority-toggles {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	.priority-toggle {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.625rem;
		background: oklch(0.14 0.02 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.priority-toggle:hover {
		background: oklch(0.18 0.02 250);
		border-color: oklch(0.30 0.02 250);
	}

	.priority-toggle:has(input:checked) {
		border-color: oklch(0.40 0.08 200);
		background: oklch(0.16 0.03 200);
	}

	.priority-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
	}

	.priority-p0 {
		background: oklch(0.40 0.15 25);
		color: oklch(0.95 0.05 25);
	}

	.priority-p1 {
		background: oklch(0.45 0.15 65);
		color: oklch(0.95 0.05 65);
	}

	.priority-p2 {
		background: oklch(0.40 0.12 230);
		color: oklch(0.95 0.05 230);
	}

	.priority-p3 {
		background: oklch(0.35 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.priority-p4 {
		background: oklch(0.30 0.02 250);
		color: oklch(0.70 0.02 250);
	}

	.priority-label {
		font-size: 0.75rem;
		color: oklch(0.65 0.02 250);
	}

	/* Toggle row with inline number input on the right */
	.toggle-with-input {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.inline-number-field {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	/* Validation error */
	.input-error {
		border-color: oklch(0.55 0.18 25) !important;
	}
</style>
