<script lang="ts">
	/**
	 * GraduationWizard - 3-step modal that migrates a project's tasks from
	 * local SQLite to a shared Postgres backend.
	 *
	 * Step 1: Paste Postgres connection URL.
	 * Step 2: Preview migration counts + configure import status.
	 * Step 3: Confirm by typing the project key; run migration.
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

	interface Breakdown {
		byStatus: Record<string, number>;
		byType: Record<string, number>;
	}

	interface Summary {
		project: string;
		projectPath: string;
		tasks: number;
		dependencies: number;
		labels: number;
		comments: number;
		breakdown?: Breakdown;
	}

	interface ProgressState {
		phase: string;
		message: string;
		percent: number;
	}

	let step = $state<WizardStep>(1);
	let connectionUrl = $state('');
	let previewSummary = $state<Summary | null>(null);
	let confirmText = $state('');
	let phase = $state<Phase>('idle');
	let errorMessage = $state<string | null>(null);
	let archivePath = $state<string | null>(null);
	let progress = $state<ProgressState>({
		phase: 'idle',
		message: '',
		percent: 0,
	});
	let abortController: AbortController | null = null;
	let copied = $state(false);
	let graduatedTaskCount = $state(0);
	let graduatedInserted = $state(0);
	let graduatedSkipped = $state(0);
	let importStatus = $state<string>('dev');

	// Reset state whenever the modal is opened for a new project
	$effect(() => {
		if (isOpen && projectKey) {
			step = 1;
			connectionUrl = '';
			previewSummary = null;
			confirmText = '';
			phase = 'idle';
			errorMessage = null;
			archivePath = null;
			copied = false;
			graduatedTaskCount = 0;
			graduatedInserted = 0;
			graduatedSkipped = 0;
			importStatus = 'dev';
			progress = { phase: 'idle', message: '', percent: 0 };

			// Try to auto-fill the Postgres URL from stored credentials
			fetch(`/api/projects/${encodeURIComponent(projectKey)}/graduate`)
				.then((r) => r.json())
				.then((data) => {
					if (data.suggestedUrl && !connectionUrl) {
						connectionUrl = data.suggestedUrl;
					}
				})
				.catch(() => {});
		}
	});

	const hasValidUrl = $derived(
		connectionUrl.trim().startsWith('postgres://') ||
			connectionUrl.trim().startsWith('postgresql://'),
	);
	const confirmMatches = $derived(
		projectKey !== null && confirmText.trim() === projectKey,
	);
	const canGoToStep2 = $derived(hasValidUrl);

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
		progress = { phase: 'starting', message: 'Starting graduation…', percent: 0 };

		abortController = new AbortController();
		try {
			const res = await fetch(
				`/api/projects/${encodeURIComponent(projectKey)}/graduate/stream`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ url: connectionUrl.trim(), importStatus: importStatus || null, targetTable: 'project_tasks' }),
					signal: abortController.signal,
				},
			);

			if (!res.ok || !res.body) {
				const text = await res.text().catch(() => '');
				throw new Error(text || `Migration failed (${res.status})`);
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let finalEvent: { type: string; [k: string]: any } | null = null;

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				// NDJSON: one complete JSON object per line
				let newlineIdx = buffer.indexOf('\n');
				while (newlineIdx !== -1) {
					const line = buffer.slice(0, newlineIdx).trim();
					buffer = buffer.slice(newlineIdx + 1);
					if (line) {
						try {
							const event = JSON.parse(line);
							if (event.type === 'progress') {
								progress = {
									phase: event.phase || '',
									message: event.message || '',
									percent: Math.max(0, Math.min(100, event.percent ?? 0)),
								};
							} else if (event.type === 'done' || event.type === 'error') {
								finalEvent = event;
							}
						} catch {
							// Ignore malformed line; stream keeps going
						}
					}
					newlineIdx = buffer.indexOf('\n');
				}
			}

			if (!finalEvent) {
				throw new Error('Migration stream ended without a result');
			}

			if (finalEvent.type === 'error') {
				throw new Error(finalEvent.error || 'Migration failed');
			}

			const result = finalEvent.result;
			if (result?.status === 'already_graduated') {
				errorMessage =
					result.message ||
					'Project was already on Postgres. Nothing to migrate.';
				phase = 'error';
				return;
			}

			archivePath = result?.archivePath || null;
			graduatedTaskCount = result?.summary?.tasks ?? previewSummary.tasks;
			graduatedInserted = result?.summary?.inserted ?? graduatedTaskCount;
			graduatedSkipped = result?.summary?.skipped ?? 0;
			progress = { phase: 'complete', message: 'Graduation complete.', percent: 100 };
			phase = 'done';
			successToast(
				'Graduation complete',
				graduatedSkipped > 0
					? `${graduatedInserted} tasks imported, ${graduatedSkipped} duplicates skipped`
					: `${graduatedInserted} tasks now live on Postgres`,
			);
			onGraduated?.(projectKey);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			errorMessage = msg;
			phase = 'error';
			errorToast('Graduation failed', msg);
		} finally {
			abortController = null;
		}
	}

	function back() {
		if (phase === 'running') return;
		if (step === 2) step = 1;
		else if (step === 3) step = 2;
		phase = 'idle';
		errorMessage = null;
	}

	const teammateCommand = $derived(
		projectKey
			? `jat join-project ${projectKey} --postgres-url '${connectionUrl.trim()}'`
			: '',
	);

	async function copyTeammateCommand() {
		if (!teammateCommand) return;
		try {
			await navigator.clipboard.writeText(teammateCommand);
			copied = true;
			successToast('Copied', 'Teammate setup command copied to clipboard');
			setTimeout(() => (copied = false), 3000);
		} catch {
			errorToast('Copy failed', 'Could not copy to clipboard');
		}
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
		<div class="modal-box max-w-xl" role="dialog" aria-modal="true" aria-label="Graduate to Team backend">
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
			<ul class="steps w-full mb-6" aria-label="Graduation steps">
				<li class="step" class:step-primary={step >= 1} aria-current={step === 1 ? 'step' : undefined}>Backend</li>
				<li class="step" class:step-primary={step >= 2} aria-current={step === 2 ? 'step' : undefined}>Preview</li>
				<li class="step" class:step-primary={step >= 3} aria-current={step === 3 ? 'step' : undefined}>Confirm</li>
			</ul>

			<!-- Step 1: Pick backend -->
			{#if step === 1}
				<div class="space-y-4">
					<p class="text-sm text-base-content/70">
						Move this project's tasks from local SQLite to a shared Postgres
						database so your team can collaborate. This is a one-way migration
						&mdash; the local database is archived as a backup after the move.
					</p>

					<div class="rounded-lg bg-base-200/50 border border-base-300 p-3 flex items-center gap-3 text-xs">
						<span class="font-mono bg-base-300 px-2 py-1 rounded">SQLite</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
						<span class="font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">Postgres</span>
					</div>

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
								Starts with <code>postgres://</code> or <code>postgresql://</code>
							</span>
						</div>
					</div>

					{#if errorMessage}
						<div class="alert alert-error text-sm" role="alert">
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
				{@const bd = previewSummary.breakdown}
				{@const statusOrder = ['open', 'in_progress', 'blocked', 'closed', 'dev', 'submitted']}
				{@const statusColors: Record<string, string> = { open: 'text-info', in_progress: 'text-warning', blocked: 'text-error', closed: 'text-success', dev: 'text-base-content/50', submitted: 'text-secondary' }}
				{@const typeOrder = ['task', 'bug', 'feature', 'epic', 'chore']}
				{@const typeColors: Record<string, string> = { task: 'text-primary', bug: 'text-error', feature: 'text-success', epic: 'text-secondary', chore: 'text-base-content/60' }}
				<div class="space-y-4">
					<!-- Primary: what you're migrating -->
					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<p class="text-sm font-medium">
								Connection verified &mdash; <span class="text-primary font-mono">{previewSummary.tasks}</span> tasks ready to migrate
							</p>
						</div>

						<!-- Top-level counts -->
						<div class="grid grid-cols-4 gap-2">
							{#each [['Tasks', previewSummary.tasks, 'text-primary'], ['Deps', previewSummary.dependencies, ''], ['Labels', previewSummary.labels, ''], ['Comments', previewSummary.comments, '']] as [label, count, cls]}
								<div class="rounded-lg border border-base-300 p-2 text-center">
									<div class="text-xl font-bold font-mono {cls}">{count}</div>
									<div class="text-xs text-base-content/60 uppercase tracking-wide">{label}</div>
								</div>
							{/each}
						</div>

						<!-- Breakdown: status + type side by side -->
						{#if bd}
							<div class="grid grid-cols-2 gap-3">
								<div class="rounded-lg border border-base-300 p-3 space-y-1.5">
									<div class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">By Status</div>
									{#each statusOrder as s}
										{#if bd.byStatus[s]}
											<div class="flex items-center justify-between text-sm">
												<span class="capitalize {statusColors[s] ?? ''}">{s.replace('_', ' ')}</span>
												<span class="font-mono font-semibold">{bd.byStatus[s]}</span>
											</div>
										{/if}
									{/each}
									{#each Object.entries(bd.byStatus).filter(([s]) => !statusOrder.includes(s)) as [s, n]}
										<div class="flex items-center justify-between text-sm">
											<span class="capitalize">{s}</span>
											<span class="font-mono font-semibold">{n}</span>
										</div>
									{/each}
								</div>
								<div class="rounded-lg border border-base-300 p-3 space-y-1.5">
									<div class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">By Type</div>
									{#each typeOrder as t}
										{#if bd.byType[t]}
											<div class="flex items-center justify-between text-sm">
												<span class="capitalize {typeColors[t] ?? ''}">{t}</span>
												<span class="font-mono font-semibold">{bd.byType[t]}</span>
											</div>
										{/if}
									{/each}
									{#each Object.entries(bd.byType).filter(([t]) => !typeOrder.includes(t)) as [t, n]}
										<div class="flex items-center justify-between text-sm">
											<span class="capitalize">{t}</span>
											<span class="font-mono font-semibold">{n}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Divider between zones -->
					<div class="divider text-xs text-base-content/40 my-1">Migration options</div>

					<!-- Secondary: migration options -->
					<div class="space-y-3">
						<div class="form-control">
							<label class="label" for="import-status-select">
								<span class="label-text font-medium text-sm">Initial status for imported tasks</span>
							</label>
							<select
								id="import-status-select"
								class="select select-bordered select-sm"
								bind:value={importStatus}
							>
								<option value="dev">Dev &mdash; hidden from clients until promoted</option>
								<option value="submitted">Submitted &mdash; visible, pending triage</option>
								<option value="">Keep original &mdash; preserve each task's current status</option>
							</select>
						</div>

						<div class="rounded-lg bg-base-200 p-3 space-y-1 text-xs font-mono">
							<div>
								<span class="text-base-content/50">project:</span>
								{previewSummary.project}
							</div>
							<div class="break-all">
								<span class="text-base-content/50">postgres:</span>
								{maskUrl(connectionUrl)}
							</div>
						</div>
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
					<div class="space-y-4">
						<!-- Celebration header -->
						<div class="text-center py-4">
							<div class="text-4xl mb-2">🎉</div>
							<h4 class="text-lg font-bold">
								<span class="font-mono">{projectKey}</span> is live on Postgres
							</h4>
							<div class="badge badge-success badge-sm mt-2 gap-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Migration complete
							</div>
						</div>

						<!-- Migration stats -->
						<div class="grid gap-2" class:grid-cols-2={graduatedSkipped > 0}>
							<div class="rounded-lg bg-base-200 p-3 text-center">
								<div class="text-2xl font-bold font-mono text-success">
									{graduatedInserted}
								</div>
								<div class="text-xs text-base-content/60 uppercase tracking-wide">
									tasks imported
								</div>
							</div>
							{#if graduatedSkipped > 0}
								<div class="rounded-lg bg-base-200 p-3 text-center">
									<div class="text-2xl font-bold font-mono text-base-content/50">
										{graduatedSkipped}
									</div>
									<div class="text-xs text-base-content/60 uppercase tracking-wide">
										duplicates skipped
									</div>
								</div>
							{/if}
						</div>

						<!-- Details (compact) -->
						<div class="text-xs text-base-content/50 space-y-1">
							<div>Each task's original JAT ID is stored in the <code class="font-mono bg-base-200 px-1 py-0.5 rounded">jat_id</code> column.</div>
							{#if archivePath}
								<div>Local backup: <code class="font-mono text-[0.7rem] break-all">{archivePath}</code></div>
							{/if}
						</div>

						<!-- Teammate setup — collapsible next step -->
						<details class="rounded-lg border border-base-300">
							<summary class="p-3 cursor-pointer text-sm font-medium flex items-center gap-2 select-none">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Invite teammates
							</summary>
							<div class="px-3 pb-3 space-y-2 border-t border-base-300 pt-2">
								<p class="text-xs text-base-content/60">
									They run this on their machine to join the shared backend:
								</p>
								<div class="bg-base-300 rounded p-2 font-mono text-xs break-all select-all">
									{teammateCommand}
								</div>
								<button
									class="btn btn-sm w-full gap-2"
									class:btn-ghost={!copied}
									class:btn-success={copied}
									onclick={copyTeammateCommand}
								>
									{#if copied}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										Copied!
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012-2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
										Copy command
									{/if}
								</button>
							</div>
						</details>
					</div>

					<div class="modal-action">
						<a
							href="/tasks?project={projectKey}"
							class="btn btn-primary btn-sm"
							onclick={handleClose}
						>
							View project
						</a>
					</div>
				{:else}
					<div class="space-y-4">
						<!-- Migration summary — reassurance at the high-anxiety moment -->
						<div class="rounded-lg border border-base-300 bg-base-200/50 p-3 space-y-2 text-sm">
							<div class="flex items-center justify-between">
								<span class="text-base-content/60">Tasks to migrate</span>
								<span class="font-mono font-bold text-primary">{previewSummary.tasks}</span>
							</div>
							<div class="space-y-0.5">
								<span class="text-base-content/60">Destination</span>
								<div class="font-mono text-xs break-all text-base-content/80">{maskUrl(connectionUrl)}</div>
							</div>
							{#if importStatus}
								<div class="flex items-center justify-between">
									<span class="text-base-content/60">Import as</span>
									<span class="badge badge-sm" class:badge-ghost={importStatus === 'dev'} class:badge-secondary={importStatus === 'submitted'}>{importStatus}</span>
								</div>
							{/if}
						</div>

						<!-- Safety note -->
						<div class="text-xs text-base-content/50 flex items-start gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
							<span>
								Migration is atomic &mdash; if anything fails, Postgres rolls back
								and your local database stays untouched. A backup of <code class="font-mono">tasks.db</code> is archived either way.
							</span>
						</div>

						<!-- Confirmation input -->
						<div class="form-control">
							<label class="label" for="graduation-confirm">
								<span class="label-text text-sm">
									Type <code class="font-mono bg-base-200 px-1.5 py-0.5 rounded font-semibold">{projectKey}</code> to confirm
								</span>
							</label>
							<input
								id="graduation-confirm"
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
							<div class="alert alert-error text-xs" role="alert">
								<span>{errorMessage}</span>
							</div>
						{/if}

						{#if phase === 'running'}
							<div class="rounded-lg bg-base-200 p-4 space-y-3">
								<div class="flex items-center gap-3 text-sm">
									<span
										class="loading loading-spinner loading-sm text-primary"
									></span>
									<span class="font-medium">
										{progress.message || 'Running migration…'}
									</span>
								</div>
								<div>
									<progress
										class="progress progress-primary w-full"
										value={progress.percent}
										max="100"
										aria-label="Migration progress"
									></progress>
									<div
										class="flex items-center justify-between text-xs text-base-content/60 mt-1 font-mono"
									>
										<span>{progress.phase || '—'}</span>
										<span>{progress.percent}%</span>
									</div>
								</div>
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
