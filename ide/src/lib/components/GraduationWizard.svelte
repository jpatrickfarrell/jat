<script lang="ts">
	/**
	 * GraduationWizard - 3-step modal that migrates a project's tasks from
	 * local SQLite to a shared Postgres backend.
	 *
	 * Step 1: Pick backend (Solo vs Team) + paste Postgres connection URL.
	 * Step 2: Test connection via action=preview dry-run; show counts.
	 * Step 3: Confirm by typing the project key; run action=graduate.
	 *
	 * On success, calls onGraduated() so the parent can refresh its data.
	 */

	import { successToast, errorToast } from '$lib/stores/toasts.svelte';

	interface Props {
		isOpen: boolean;
		projectKey: string | null;
		onClose: () => void;
		onGraduated?: (projectKey: string) => void;
	}

	let { isOpen, projectKey, onClose, onGraduated }: Props = $props();

	type WizardStep = 1 | 2 | 3;
	type Phase = 'idle' | 'testing' | 'running' | 'done' | 'error';

	interface Summary {
		project: string;
		projectPath: string;
		tasks: number;
		dependencies: number;
		labels: number;
		comments: number;
	}

	let step = $state<WizardStep>(1);
	let backendChoice = $state<'sqlite' | 'postgres'>('postgres');
	let connectionUrl = $state('');
	let previewSummary = $state<Summary | null>(null);
	let confirmText = $state('');
	let phase = $state<Phase>('idle');
	let errorMessage = $state<string | null>(null);
	let archivePath = $state<string | null>(null);

	// Reset state whenever the modal is opened for a new project
	$effect(() => {
		if (isOpen) {
			step = 1;
			backendChoice = 'postgres';
			connectionUrl = '';
			previewSummary = null;
			confirmText = '';
			phase = 'idle';
			errorMessage = null;
			archivePath = null;
		}
	});

	const isTeamBackend = $derived(backendChoice === 'postgres');
	const hasValidUrl = $derived(
		connectionUrl.trim().startsWith('postgres://') ||
			connectionUrl.trim().startsWith('postgresql://'),
	);
	const confirmMatches = $derived(
		projectKey !== null && confirmText.trim() === projectKey,
	);
	const canGoToStep2 = $derived(isTeamBackend && hasValidUrl);

	function maskUrl(url: string): string {
		if (!url) return '';
		try {
			const u = new URL(url);
			if (u.password) u.password = '***';
			return u.toString();
		} catch {
			return url.replace(/:\/\/([^:/@]+):([^@]+)@/, '://$1:***@');
		}
	}

	function handleClose() {
		if (phase === 'running') return;
		onClose();
	}

	async function runPreview() {
		if (!projectKey) return;
		phase = 'testing';
		errorMessage = null;
		previewSummary = null;
		try {
			const res = await fetch(
				`/api/projects/${encodeURIComponent(projectKey)}/graduate`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'preview', url: connectionUrl.trim() }),
				},
			);
			const data = await res.json();

			if (!res.ok || data?.status === 'error') {
				throw new Error(data?.error || `Request failed (${res.status})`);
			}
			if (data.status === 'already_graduated') {
				errorMessage =
					data.message ||
					'Project is already on Postgres. Nothing to migrate.';
				phase = 'error';
				return;
			}
			if (!data.summary) {
				throw new Error('Preview response missing summary');
			}

			previewSummary = data.summary;
			phase = 'idle';
			step = 2;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : String(err);
			phase = 'error';
		}
	}

	async function runGraduate() {
		if (!projectKey || !previewSummary) return;
		phase = 'running';
		errorMessage = null;
		try {
			const res = await fetch(
				`/api/projects/${encodeURIComponent(projectKey)}/graduate`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'graduate',
						url: connectionUrl.trim(),
					}),
				},
			);
			const data = await res.json();

			if (!res.ok || data?.status === 'error') {
				throw new Error(data?.error || `Migration failed (${res.status})`);
			}
			if (data.status === 'already_graduated') {
				errorMessage =
					data.message ||
					'Project was already on Postgres. Nothing to migrate.';
				phase = 'error';
				return;
			}

			archivePath = data.archivePath || null;
			phase = 'done';
			successToast(
				'Graduation complete',
				`${previewSummary.tasks} tasks now live on Postgres`,
			);
			onGraduated?.(projectKey);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			errorMessage = msg;
			phase = 'error';
			errorToast('Graduation failed', msg);
		}
	}

	function back() {
		if (phase === 'running') return;
		if (step === 2) step = 1;
		else if (step === 3) step = 2;
		phase = 'idle';
		errorMessage = null;
	}
</script>

{#if isOpen && projectKey}
	<div
		class="modal modal-open"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') handleClose();
		}}
	>
		<div class="modal-box max-w-xl">
			<!-- Header -->
			<div class="flex items-start justify-between mb-4">
				<div>
					<h3 class="text-lg font-bold">Graduate to Team backend</h3>
					<p class="text-sm text-base-content/60 mt-0.5">
						Project: <span class="font-mono">{projectKey}</span>
					</p>
				</div>
				<button
					class="btn btn-sm btn-circle btn-ghost"
					onclick={handleClose}
					disabled={phase === 'running'}
					aria-label="Close wizard"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Stepper -->
			<ul class="steps w-full mb-6">
				<li class="step" class:step-primary={step >= 1}>Backend</li>
				<li class="step" class:step-primary={step >= 2}>Preview</li>
				<li class="step" class:step-primary={step >= 3}>Confirm</li>
			</ul>

			<!-- Step 1: Pick backend -->
			{#if step === 1}
				<div class="space-y-4">
					<p class="text-sm text-base-content/70">
						Choose where this project's tasks should live. Graduating to Team
						is a one-way migration — the local SQLite database is archived
						after the move.
					</p>

					<div class="grid grid-cols-2 gap-3">
						<label
							class="rounded-lg border p-3 cursor-not-allowed opacity-60 border-base-300"
						>
							<input
								type="radio"
								class="radio radio-sm"
								value="sqlite"
								disabled
								checked={false}
							/>
							<div class="mt-1">
								<div class="font-semibold text-sm">Solo (SQLite)</div>
								<div class="text-xs text-base-content/60 mt-0.5">
									Current — already active
								</div>
							</div>
						</label>

						<label
							class="rounded-lg border p-3 cursor-pointer transition"
							class:border-primary={isTeamBackend}
							class:bg-primary={isTeamBackend}
							class:bg-opacity-5={isTeamBackend}
							class:border-base-300={!isTeamBackend}
						>
							<input
								type="radio"
								class="radio radio-sm radio-primary"
								value="postgres"
								bind:group={backendChoice}
							/>
							<div class="mt-1">
								<div class="font-semibold text-sm">Team (Postgres)</div>
								<div class="text-xs text-base-content/60 mt-0.5">
									Shared backend for teammates
								</div>
							</div>
						</label>
					</div>

					{#if isTeamBackend}
						<div class="form-control">
							<label class="label" for="graduation-url">
								<span class="label-text font-medium">
									Postgres connection URL
								</span>
							</label>
							<input
								id="graduation-url"
								type="text"
								class="input input-bordered input-sm font-mono text-xs"
								placeholder="postgres://user:password@host:5432/jat_prod"
								bind:value={connectionUrl}
								autocomplete="off"
								spellcheck="false"
							/>
							<div class="label">
								<span class="label-text-alt text-base-content/50">
									Must start with <code>postgres://</code> or
									<code>postgresql://</code>. Password is stored locally in
									<code>~/.config/jat/projects.json</code>.
								</span>
							</div>
						</div>
					{/if}

					{#if errorMessage}
						<div class="alert alert-error text-sm">
							<span>{errorMessage}</span>
						</div>
					{/if}
				</div>

				<div class="modal-action">
					<button
						class="btn btn-ghost btn-sm"
						onclick={handleClose}
						disabled={phase === 'testing'}
					>
						Cancel
					</button>
					<button
						class="btn btn-primary btn-sm"
						disabled={!canGoToStep2 || phase === 'testing'}
						onclick={runPreview}
					>
						{#if phase === 'testing'}
							<span class="loading loading-spinner loading-xs"></span>
							Testing connection…
						{:else}
							Test connection &amp; preview
						{/if}
					</button>
				</div>
			{/if}

			<!-- Step 2: Preview -->
			{#if step === 2 && previewSummary}
				<div class="space-y-4">
					<p class="text-sm text-base-content/70">
						Connection verified. The following rows will be copied into
						Postgres:
					</p>

					<div class="grid grid-cols-4 gap-3">
						<div
							class="rounded-lg border border-base-300 p-3 text-center"
						>
							<div class="text-2xl font-bold font-mono text-primary">
								{previewSummary.tasks}
							</div>
							<div class="text-xs text-base-content/60 uppercase tracking-wide">
								Tasks
							</div>
						</div>
						<div
							class="rounded-lg border border-base-300 p-3 text-center"
						>
							<div class="text-2xl font-bold font-mono text-primary">
								{previewSummary.dependencies}
							</div>
							<div class="text-xs text-base-content/60 uppercase tracking-wide">
								Deps
							</div>
						</div>
						<div
							class="rounded-lg border border-base-300 p-3 text-center"
						>
							<div class="text-2xl font-bold font-mono text-primary">
								{previewSummary.labels}
							</div>
							<div class="text-xs text-base-content/60 uppercase tracking-wide">
								Labels
							</div>
						</div>
						<div
							class="rounded-lg border border-base-300 p-3 text-center"
						>
							<div class="text-2xl font-bold font-mono text-primary">
								{previewSummary.comments}
							</div>
							<div class="text-xs text-base-content/60 uppercase tracking-wide">
								Comments
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-base-200 p-3 space-y-1 text-xs font-mono">
						<div>
							<span class="text-base-content/50">project:</span>
							{previewSummary.project}
						</div>
						<div>
							<span class="text-base-content/50">path:</span>
							{previewSummary.projectPath}
						</div>
						<div>
							<span class="text-base-content/50">postgres:</span>
							{maskUrl(connectionUrl)}
						</div>
					</div>

					<div class="alert alert-warning text-xs">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<span>
							This is a one-way migration. The local <code>.jat/tasks.db</code>
							will be archived after the move.
						</span>
					</div>
				</div>

				<div class="modal-action">
					<button class="btn btn-ghost btn-sm" onclick={back}>Back</button>
					<button class="btn btn-primary btn-sm" onclick={() => (step = 3)}>
						Continue
					</button>
				</div>
			{/if}

			<!-- Step 3: Confirm -->
			{#if step === 3 && previewSummary}
				{#if phase === 'done'}
					<div class="space-y-3">
						<div class="alert alert-success">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<div class="font-semibold">Graduation complete</div>
								<div class="text-xs opacity-80">
									{previewSummary.tasks} tasks moved to Postgres.
								</div>
							</div>
						</div>
						{#if archivePath}
							<div class="text-xs text-base-content/60">
								Local backup: <code class="font-mono">{archivePath}</code>
							</div>
						{/if}
						<p class="text-xs text-base-content/60">
							Reopen the IDE to reload agents and settings on the new
							backend.
						</p>
					</div>
					<div class="modal-action">
						<button class="btn btn-primary btn-sm" onclick={handleClose}>
							Done
						</button>
					</div>
				{:else}
					<div class="space-y-4">
						<p class="text-sm text-base-content/70">
							Type the project name
							<code class="font-mono bg-base-200 px-1.5 py-0.5 rounded">
								{projectKey}
							</code>
							below to confirm. This will run the migration for real.
						</p>

						<div class="form-control">
							<input
								type="text"
								class="input input-bordered input-sm font-mono"
								placeholder={projectKey ?? ''}
								bind:value={confirmText}
								autocomplete="off"
								spellcheck="false"
								disabled={phase === 'running'}
							/>
						</div>

						{#if errorMessage}
							<div class="alert alert-error text-xs">
								<span>{errorMessage}</span>
							</div>
						{/if}

						{#if phase === 'running'}
							<div
								class="rounded-lg bg-base-200 p-3 flex items-center gap-3 text-sm"
							>
								<span class="loading loading-spinner loading-sm text-primary"
								></span>
								<span>
									Running migration — exporting, importing, and archiving.
								</span>
							</div>
						{/if}
					</div>

					<div class="modal-action">
						<button
							class="btn btn-ghost btn-sm"
							onclick={back}
							disabled={phase === 'running'}
						>
							Back
						</button>
						<button
							class="btn btn-error btn-sm"
							disabled={!confirmMatches || phase === 'running'}
							onclick={runGraduate}
						>
							{#if phase === 'running'}
								Graduating…
							{:else}
								Graduate now
							{/if}
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}
