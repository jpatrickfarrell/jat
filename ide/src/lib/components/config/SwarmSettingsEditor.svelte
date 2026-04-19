<script lang="ts">
	import { onMount } from 'svelte';
	import { JAT_DEFAULTS } from '$lib/config/constants';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';
	import { setMaxSessions, type MaxSessions } from '$lib/stores/preferences.svelte';
	import { updateAutoKillConfig } from '$lib/stores/autoKillConfig';
	import { autoPauseConfig } from '$lib/stores/autoPauseConfig';
	import ReviewRulesEditor from '$lib/components/ReviewRulesEditor.svelte';

	function toMaxSessions(n: number): MaxSessions {
		const valid: MaxSessions[] = [4, 6, 8, 10, 12, 16, 20];
		let best: MaxSessions = 12;
		let bestDiff = Infinity;
		for (const v of valid) {
			const diff = Math.abs(n - v);
			if (diff < bestDiff) { bestDiff = diff; best = v; }
		}
		return best;
	}

	let loading = $state(true);
	let saving = $state(false);

	// Spawn settings
	let maxSessions = $state(JAT_DEFAULTS.max_sessions);
	let defaultAgentCount = $state(JAT_DEFAULTS.default_agent_count);
	let agentStagger = $state(JAT_DEFAULTS.agent_stagger);
	let claudeStartupTimeout = $state(JAT_DEFAULTS.claude_startup_timeout);

	// Auto-pause
	let autoPauseEnabled = $state(JAT_DEFAULTS.auto_pause_enabled as boolean);
	let autoPauseIdleTimeout = $state(JAT_DEFAULTS.auto_pause_idle_timeout as number);

	// Auto-kill
	let autoKillEnabled = $state(false);
	let autoKillDelay = $state(60);
	let autoKillP0 = $state(false);
	let autoKillP1 = $state(false);
	let autoKillP2 = $state(false);
	let autoKillP3 = $state(true);
	let autoKillP4 = $state(true);

	// Autonomous mode — two-step confirmation
	let skipPermissions = $state(false);
	let awaitingAutoModeConfirm = $state(false);

	// VPS overflow
	let maxLocalAgents = $state(JAT_DEFAULTS.max_local_agents);
	let vpsHost = $state(JAT_DEFAULTS.vps_host as string);
	let vpsUser = $state(JAT_DEFAULTS.vps_user as string);
	let vpsMaxAgents = $state(JAT_DEFAULTS.vps_max_agents);
	let vpsProjectPath = $state(JAT_DEFAULTS.vps_project_path as string);
	let vpsTesting = $state(false);
	let vpsTestResult = $state<{ ok: boolean; latencyMs?: number; error?: string } | null>(null);
	let vpsExpanded = $state(false);

	const VALIDATION_RULES = { autoKillDelay: { min: 5, max: 300 } };

	let autoKillDelayError = $derived.by(() => {
		if (!autoKillEnabled) return null;
		if (autoKillDelay < VALIDATION_RULES.autoKillDelay.min)
			return `Min ${VALIDATION_RULES.autoKillDelay.min}s`;
		if (autoKillDelay > VALIDATION_RULES.autoKillDelay.max)
			return `Max ${VALIDATION_RULES.autoKillDelay.max}s`;
		return null;
	});

	let hasValidationErrors = $derived(autoKillDelayError !== null);
	let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	async function loadDefaults() {
		loading = true;
		try {
			const response = await fetch('/api/config/defaults');
			if (!response.ok) throw new Error('Failed to load settings');
			const data = await response.json();
			const d = data.defaults || {};

			maxSessions = d.max_sessions ?? JAT_DEFAULTS.max_sessions;
			defaultAgentCount = d.default_agent_count ?? JAT_DEFAULTS.default_agent_count;
			agentStagger = d.agent_stagger ?? JAT_DEFAULTS.agent_stagger;
			claudeStartupTimeout = d.claude_startup_timeout ?? JAT_DEFAULTS.claude_startup_timeout;
			autoPauseEnabled = d.auto_pause_enabled ?? (JAT_DEFAULTS.auto_pause_enabled as boolean);
			autoPauseIdleTimeout = d.auto_pause_idle_timeout ?? (JAT_DEFAULTS.auto_pause_idle_timeout as number);
			autoKillEnabled = d.auto_kill_enabled ?? false;
			autoKillDelay = d.auto_kill_delay ?? 60;
			autoKillP0 = d.auto_kill_p0 ?? false;
			autoKillP1 = d.auto_kill_p1 ?? false;
			autoKillP2 = d.auto_kill_p2 ?? false;
			autoKillP3 = d.auto_kill_p3 ?? true;
			autoKillP4 = d.auto_kill_p4 ?? true;
			skipPermissions = d.skip_permissions ?? false;
			maxLocalAgents = d.max_local_agents ?? JAT_DEFAULTS.max_local_agents;
			vpsHost = d.vps_host ?? (JAT_DEFAULTS.vps_host as string);
			vpsUser = d.vps_user ?? (JAT_DEFAULTS.vps_user as string);
			vpsMaxAgents = d.vps_max_agents ?? JAT_DEFAULTS.vps_max_agents;
			vpsProjectPath = d.vps_project_path ?? (JAT_DEFAULTS.vps_project_path as string);

			setMaxSessions(toMaxSessions(maxSessions));
		} catch (error) {
			console.error('[SwarmSettings] Load error:', error);
			errorToast('Failed to load settings', error instanceof Error ? error.message : 'Unknown error');
		} finally {
			loading = false;
		}
	}

	async function autoSave() {
		if (hasValidationErrors || loading) return;
		saving = true;
		try {
			const response = await fetch('/api/config/defaults', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					defaults: {
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
						skip_permissions: skipPermissions,
						max_local_agents: maxLocalAgents,
						vps_host: vpsHost,
						vps_user: vpsUser,
						vps_max_agents: vpsMaxAgents,
						vps_project_path: vpsProjectPath
					}
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to save');
			}

			setMaxSessions(toMaxSessions(maxSessions));
			updateAutoKillConfig({
				enabled: autoKillEnabled,
				defaultDelaySeconds: autoKillDelay,
				priorityEnabled: { 0: autoKillP0, 1: autoKillP1, 2: autoKillP2, 3: autoKillP3, 4: autoKillP4 }
			});
			autoPauseConfig.set({ enabled: autoPauseEnabled, idleTimeoutSeconds: autoPauseIdleTimeout });
		} catch (error) {
			console.error('[SwarmSettings] Save error:', error);
			errorToast('Failed to save settings', error instanceof Error ? error.message : 'Unknown error');
		} finally {
			saving = false;
		}
	}

	function scheduleAutoSave() {
		if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
		saveDebounceTimer = setTimeout(autoSave, 600);
	}

	async function handleSkipPermissionsToggle(event: Event) {
		const checkbox = event.target as HTMLInputElement;
		if (checkbox.checked && !skipPermissions) {
			// Enable path: require explicit confirmation before saving
			awaitingAutoModeConfirm = true;
		} else if (!checkbox.checked && skipPermissions) {
			// Disable path: no confirmation needed
			skipPermissions = false;
			try {
				await autoSave();
				successToast('Autonomous mode disabled', '');
			} catch {
				skipPermissions = true;
			}
		}
	}

	async function confirmAutoMode() {
		awaitingAutoModeConfirm = false;
		skipPermissions = true;
		try {
			await autoSave();
			successToast('Autonomous mode enabled', 'Agents will run without permission prompts.');
		} catch {
			skipPermissions = false;
		}
	}

	function cancelAutoModeConfirm() {
		awaitingAutoModeConfirm = false;
	}

	function resetSpawnToFactory() {
		maxSessions = JAT_DEFAULTS.max_sessions;
		defaultAgentCount = JAT_DEFAULTS.default_agent_count;
		agentStagger = JAT_DEFAULTS.agent_stagger;
		claudeStartupTimeout = JAT_DEFAULTS.claude_startup_timeout;
		autoSave();
	}

	function resetAutoPauseToFactory() {
		autoPauseEnabled = JAT_DEFAULTS.auto_pause_enabled as boolean;
		autoPauseIdleTimeout = JAT_DEFAULTS.auto_pause_idle_timeout as number;
		autoSave();
	}

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

	async function testVpsConnection() {
		vpsTesting = true;
		vpsTestResult = null;
		try {
			const response = await fetch('/api/config/vps', { method: 'POST' });
			vpsTestResult = await response.json();
		} catch (error) {
			vpsTestResult = { ok: false, error: error instanceof Error ? error.message : 'Connection failed' };
		} finally {
			vpsTesting = false;
		}
	}

	onMount(() => { loadDefaults(); });
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
				<h2 class="text-lg font-semibold tc-primary">Autopilot Settings</h2>
				<p class="text-sm mt-1 tc-muted">Configure agent spawning, session lifecycle, and orchestration behavior</p>
			</div>
			{#if saving}
				<span class="saving-indicator animate-pulse-subtle">Saving…</span>
			{/if}
		</div>

		<!-- Global autonomous mode indicator — always visible when active -->
		{#if skipPermissions}
			<div class="global-auto-banner">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 flex-shrink-0">
					<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
				</svg>
				<span>Autonomous mode active — <code class="icode">--dangerously-skip-permissions</code> passed to every agent</span>
			</div>
		{/if}

		<!-- Spawn Configuration — primary section -->
		<div class="settings-section section-primary">
			<div class="section-header-with-actions">
				<div class="section-header section-header-spawn">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
					</svg>
					<span>Spawn Configuration</span>
				</div>
				<button class="btn btn-ghost btn-sm gap-1" onclick={resetSpawnToFactory} disabled={saving}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
					Reset
				</button>
			</div>
			<div class="spawn-grid">
				<div class="compact-field">
					<span class="compact-label">Max Sessions</span>
					<input type="number" class="input input-bordered input-sm" bind:value={maxSessions} oninput={scheduleAutoSave} min="1" max="20" />
					<span class="compact-hint">concurrent</span>
				</div>
				<div class="compact-field">
					<span class="compact-label">Default Agents</span>
					<input type="number" class="input input-bordered input-sm" bind:value={defaultAgentCount} oninput={scheduleAutoSave} min="1" max={maxSessions} />
					<span class="compact-hint">per swarm</span>
				</div>
				<div class="compact-field">
					<span class="compact-label">Stagger</span>
					<input type="number" class="input input-bordered input-sm" bind:value={agentStagger} oninput={scheduleAutoSave} min="1" max="120" />
					<span class="compact-hint">sec between</span>
				</div>
				<div class="compact-field">
					<span class="compact-label">Startup Timeout</span>
					<input type="number" class="input input-bordered input-sm" bind:value={claudeStartupTimeout} oninput={scheduleAutoSave} min="5" max="120" />
					<span class="compact-hint">sec to wait</span>
				</div>
			</div>
		</div>

		<!-- Autonomous Mode -->
		<div class="settings-section autonomous-section">
			<div class="section-header section-header-warning">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
					<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
				</svg>
				<span>Autonomous Mode</span>
			</div>

			<div class="form-control mt-3">
				<label class="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						class="toggle toggle-warning"
						checked={skipPermissions}
						onchange={handleSkipPermissionsToggle}
						disabled={saving || awaitingAutoModeConfirm}
					/>
					<span class="label-text font-semibold tc-secondary">Enable autonomous mode</span>
				</label>
				<p class="text-xs ml-1 tc-hint">
					Pass <code class="icode">--dangerously-skip-permissions</code> to Claude and <code class="icode">--full-auto</code> to Codex.
				</p>
			</div>

			{#if awaitingAutoModeConfirm}
				<div class="confirm-panel">
					<p class="text-sm tc-muted">
						This enables <code class="icode">--dangerously-skip-permissions</code> on all future sessions.
						Agents will execute tool calls without pausing for approval.
					</p>
					<div class="confirm-actions">
						<button class="btn btn-sm btn-ghost" onclick={cancelAutoModeConfirm}>Cancel</button>
						<button class="btn btn-sm btn-warning" onclick={confirmAutoMode}>Enable autonomous mode</button>
					</div>
				</div>
			{:else if skipPermissions}
				<div class="enabled-notice">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-shrink-0">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<span>Active — agents run without permission prompts.</span>
				</div>
			{/if}
		</div>

		<!-- Auto-Pause -->
		<div class="settings-section">
			<div class="section-header-with-actions">
				<div class="section-header section-header-secondary">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
					</svg>
					<span>Auto-Pause Idle Sessions</span>
				</div>
				<button class="btn btn-ghost btn-sm gap-1" onclick={resetAutoPauseToFactory} disabled={saving}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
					Reset
				</button>
			</div>
			<p class="text-sm mb-4 tc-muted">
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
						<span class="label-text font-semibold tc-secondary">Enable auto-pause</span>
						<div class="text-xs mt-0.5 tc-hint">Pause idle/completed sessions after timeout</div>
					</div>
				</label>
				{#if autoPauseEnabled}
					<div class="inline-number-field">
						<span class="text-xs tc-muted">Timeout</span>
						<input
							type="number"
							class="input input-bordered input-sm"
							bind:value={autoPauseIdleTimeout}
							oninput={scheduleAutoSave}
							min="60"
							max="3600"
							style="width: 80px;"
						/>
						<span class="text-xs tc-faint">sec</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Session Cleanup -->
		<div class="settings-section">
			<div class="section-header-with-actions">
				<div class="section-header section-header-error">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
					</svg>
					<span>Session Cleanup</span>
				</div>
				<button class="btn btn-ghost btn-sm gap-1" onclick={resetAutoKillToFactory} disabled={saving}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
					Reset
				</button>
			</div>
			<p class="text-sm mb-4 tc-muted">
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
						<span class="label-text font-semibold tc-secondary">Auto-cleanup completed sessions</span>
						<div class="text-xs mt-0.5 tc-hint">Kill tmux sessions after completion delay</div>
					</div>
				</label>
				{#if autoKillEnabled}
					<div class="kill-delay-wrap">
						<div class="inline-number-field">
							<span class="text-xs tc-muted">Delay</span>
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
							<span class="text-xs tc-faint">sec</span>
						</div>
						{#if autoKillDelayError}
							<p class="field-error">{autoKillDelayError}</p>
						{/if}
					</div>
				{/if}
			</div>

			{#if autoKillEnabled}
				<div class="mt-4">
					<div class="label">
						<span class="label-text font-semibold">Priorities to Auto-Cleanup</span>
					</div>
					<div class="priority-toggles">
						<label class="priority-toggle" for="swarm-auto-kill-p0">
							<input type="checkbox" id="swarm-auto-kill-p0" class="checkbox checkbox-xs checkbox-error" bind:checked={autoKillP0} onchange={() => autoSave()} />
							<span class="priority-badge priority-p0">P0</span>
							<span class="priority-label">Critical</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p1">
							<input type="checkbox" id="swarm-auto-kill-p1" class="checkbox checkbox-xs checkbox-warning" bind:checked={autoKillP1} onchange={() => autoSave()} />
							<span class="priority-badge priority-p1">P1</span>
							<span class="priority-label">High</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p2">
							<input type="checkbox" id="swarm-auto-kill-p2" class="checkbox checkbox-xs checkbox-info" bind:checked={autoKillP2} onchange={() => autoSave()} />
							<span class="priority-badge priority-p2">P2</span>
							<span class="priority-label">Medium</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p3">
							<input type="checkbox" id="swarm-auto-kill-p3" class="checkbox checkbox-xs" bind:checked={autoKillP3} onchange={() => autoSave()} />
							<span class="priority-badge priority-p3">P3</span>
							<span class="priority-label">Low</span>
						</label>
						<label class="priority-toggle" for="swarm-auto-kill-p4">
							<input type="checkbox" id="swarm-auto-kill-p4" class="checkbox checkbox-xs" bind:checked={autoKillP4} onchange={() => autoSave()} />
							<span class="priority-badge priority-p4">P4</span>
							<span class="priority-label">Lowest</span>
						</label>
					</div>
					<p class="text-xs mt-2 tc-hint">Unchecked priorities keep their sessions open after completion.</p>
				</div>
			{/if}
		</div>

		<!-- Review Rules — conditional on cleanup being enabled -->
		{#if autoKillEnabled}
			<div class="settings-section">
				<div class="section-header section-header-info">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span>Review Rules</span>
				</div>
				<p class="text-sm mb-4 tc-muted">
					When an agent finishes and emits a <code class="icode">review</code> signal, these rules decide what happens next.
					Tasks marked <strong class="tc-secondary">auto</strong> trigger completion automatically.
					Tasks marked <strong class="tc-secondary">review</strong> require your approval.
				</p>
				<ReviewRulesEditor />
			</div>
		{/if}

		<!-- VPS Overflow — collapsed accordion -->
		<div class="settings-section section-vps">
			<button class="accordion-toggle" onclick={() => { vpsExpanded = !vpsExpanded; }} aria-expanded={vpsExpanded}>
				<div class="section-header section-header-muted">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
					</svg>
					<span>VPS Overflow</span>
					<span class="advanced-badge">Advanced</span>
				</div>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="accordion-chevron w-4 h-4" class:rotated={vpsExpanded}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
				</svg>
			</button>

			<div class="accordion-body" class:expanded={vpsExpanded}>
				<div class="accordion-inner">
					<p class="text-xs tc-hint mt-3 mb-3">
						When local agent slots are full, new agents automatically spawn on the VPS via SSH.
					</p>

					<!-- Test connection button + result inline -->
					{#if vpsHost && vpsUser}
						<div class="vps-test-row">
							<button class="btn btn-ghost btn-sm" onclick={testVpsConnection} disabled={vpsTesting}>
								{#if vpsTesting}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									Test Connection
								{/if}
							</button>
							{#if vpsTestResult}
								<div class="vps-test-result" class:result-ok={vpsTestResult.ok} class:result-err={!vpsTestResult.ok}>
									{#if vpsTestResult.ok}
										Connected ({vpsTestResult.latencyMs}ms)
									{:else}
										Failed: {vpsTestResult.error}
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					<div class="settings-grid mt-3">
						<div class="form-control">
							<div class="label"><span class="label-text font-semibold">Max Local Agents</span></div>
							<input type="number" class="input input-bordered" bind:value={maxLocalAgents} oninput={scheduleAutoSave} min="0" max="20" />
							<div class="label"><span class="label-text-alt tc-hint">0 = auto-detect from CPU/RAM</span></div>
						</div>
						<div class="form-control">
							<div class="label"><span class="label-text font-semibold">VPS Host</span></div>
							<input type="text" class="input input-bordered" bind:value={vpsHost} oninput={scheduleAutoSave} placeholder="100.93.152.114" />
							<div class="label"><span class="label-text-alt tc-hint">Tailscale IP or hostname</span></div>
						</div>
						<div class="form-control">
							<div class="label"><span class="label-text font-semibold">VPS User</span></div>
							<input type="text" class="input input-bordered" bind:value={vpsUser} oninput={scheduleAutoSave} placeholder="jw" />
							<div class="label"><span class="label-text-alt tc-hint">SSH user (requires key auth)</span></div>
						</div>
						<div class="form-control">
							<div class="label"><span class="label-text font-semibold">VPS Max Agents</span></div>
							<input type="number" class="input input-bordered" bind:value={vpsMaxAgents} oninput={scheduleAutoSave} min="1" max="20" />
							<div class="label"><span class="label-text-alt tc-hint">Max concurrent agents on VPS</span></div>
						</div>
						<div class="form-control">
							<div class="label"><span class="label-text font-semibold">VPS Project Path</span></div>
							<input type="text" class="input input-bordered" bind:value={vpsProjectPath} oninput={scheduleAutoSave} placeholder="~/code" />
							<div class="label"><span class="label-text-alt tc-hint">Base path where repos are cloned on VPS</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>

	{/if}
</div>

<style>
	/* ── Color tokens ──────────────────────────────────────────── */
	.swarm-settings {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		--tc-primary:   oklch(0.90 0.02 250);
		--tc-secondary: oklch(0.75 0.02 250);
		--tc-muted:     oklch(0.55 0.02 250);
		--tc-hint:      oklch(0.50 0.02 250);
		--tc-faint:     oklch(0.45 0.02 250);
	}

	.tc-primary   { color: var(--tc-primary); }
	.tc-secondary { color: var(--tc-secondary); }
	.tc-muted     { color: var(--tc-muted); }
	.tc-hint      { color: var(--tc-hint); }
	.tc-faint     { color: var(--tc-faint); }

	/* ── Layout ────────────────────────────────────────────────── */
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

	/* Primary section — slightly elevated to signal importance */
	.section-primary {
		border-color: oklch(0.30 0.05 200);
		background: oklch(0.165 0.015 220);
	}

	/* VPS section — visually receded */
	.section-vps {
		opacity: 0.80;
		transition: opacity 0.15s;
	}
	.section-vps:hover,
	.section-vps:focus-within {
		opacity: 1;
	}

	.section-header-with-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.form-control { display: flex; flex-direction: column; }
	.label        { padding: 0.25rem 0; }

	.label-text     { color: var(--tc-secondary); }
	.label-text-alt { font-size: 0.75rem; }

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

	/* ── Section headers ───────────────────────────────────────── */
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--tc-secondary);
	}

	.section-header-spawn     { color: oklch(0.70 0.12 200); }
	.section-header-warning   { color: oklch(0.70 0.15 45);  }
	.section-header-secondary { color: oklch(0.65 0.05 250); }
	.section-header-error     { color: oklch(0.68 0.15 25);  }
	.section-header-info      { color: oklch(0.70 0.12 200); }
	.section-header-muted     { color: oklch(0.55 0.02 250); }

	/* ── Spawn compact fields ──────────────────────────────────── */
	.spawn-grid   { display: flex; flex-direction: column; gap: 0.625rem; }

	.compact-field {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.compact-label {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--tc-secondary);
		min-width: 9rem;
	}
	.compact-hint {
		font-size: 0.75rem;
		color: var(--tc-hint);
		white-space: nowrap;
	}

	/* ── Autonomous mode ───────────────────────────────────────── */
	.autonomous-section {
		border-color: oklch(0.35 0.12 45);
		background: oklch(0.16 0.03 45 / 0.3);
	}

	.global-auto-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: oklch(0.25 0.08 45 / 0.4);
		border: 1px solid oklch(0.50 0.15 45 / 0.5);
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: oklch(0.75 0.15 45);
	}

	.confirm-panel {
		margin-top: 0.875rem;
		padding: 0.875rem;
		background: oklch(0.20 0.04 45 / 0.35);
		border: 1px solid oklch(0.45 0.15 45 / 0.6);
		border-radius: 0.375rem;
	}
	.confirm-panel p { line-height: 1.5; margin-bottom: 0.75rem; }
	.confirm-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
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

	/* ── Saving indicator ──────────────────────────────────────── */
	.saving-indicator {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		font-size: 0.7rem;
		font-weight: 400;
		color: oklch(0.85 0.15 200);
		background: oklch(0.30 0.08 200 / 0.5);
		border-radius: 0.25rem;
	}

	/* ── Inline code ───────────────────────────────────────────── */
	.icode {
		background: oklch(0.25 0.02 250);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: ui-monospace, monospace;
		font-size: 0.8em;
		color: oklch(0.80 0.10 200);
	}

	/* ── Priority toggles ──────────────────────────────────────── */
	.priority-toggles {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	@media (max-width: 400px) {
		.priority-toggles { grid-template-columns: repeat(2, 1fr); }
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
	.priority-p0 { background: oklch(0.40 0.15 25);  color: oklch(0.95 0.05 25);  }
	.priority-p1 { background: oklch(0.45 0.15 65);  color: oklch(0.95 0.05 65);  }
	.priority-p2 { background: oklch(0.40 0.12 230); color: oklch(0.95 0.05 230); }
	.priority-p3 { background: oklch(0.35 0.02 250); color: oklch(0.80 0.02 250); }
	.priority-p4 { background: oklch(0.30 0.02 250); color: oklch(0.70 0.02 250); }

	.priority-label { font-size: 0.75rem; color: var(--tc-muted); }

	/* ── Toggle + inline input rows ───────────────────────────── */
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

	/* Kill-delay stacks error below input, right-aligned */
	.kill-delay-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
		flex-shrink: 0;
	}
	.field-error {
		font-size: 0.7rem;
		color: oklch(0.70 0.15 25);
	}

	.input-error { border-color: oklch(0.55 0.18 25) !important; }

	/* ── Advanced badge ────────────────────────────────────────── */
	.advanced-badge {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
		background: oklch(0.25 0.02 250);
		color: oklch(0.55 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
	}

	/* ── VPS accordion ─────────────────────────────────────────── */
	.accordion-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
	}
	.accordion-chevron {
		color: var(--tc-hint);
		transition: transform 0.2s ease;
	}
	.accordion-chevron.rotated { transform: rotate(180deg); }

	.accordion-body {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.2s ease-out;
	}
	.accordion-body.expanded { grid-template-rows: 1fr; }

	.accordion-inner {
		overflow: hidden;
		min-height: 0;
	}

	/* VPS test connection row */
	.vps-test-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.vps-test-result {
		font-size: 0.8125rem;
		padding: 0.2rem 0.6rem;
		border-radius: 0.25rem;
	}
	.result-ok {
		background: oklch(0.55 0.18 145 / 0.15);
		border: 1px solid oklch(0.55 0.18 145 / 0.3);
		color: oklch(0.75 0.15 145);
	}
	.result-err {
		background: oklch(0.55 0.18 25 / 0.15);
		border: 1px solid oklch(0.55 0.18 25 / 0.3);
		color: oklch(0.75 0.15 25);
	}
</style>
