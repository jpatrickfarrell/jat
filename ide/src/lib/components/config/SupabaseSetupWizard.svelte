<script lang="ts">
	/**
	 * Supabase Setup Wizard
	 *
	 * Multi-step wizard for configuring Supabase in a project:
	 * 1. Initialize Supabase (if needed)
	 * 2. Enter Supabase credentials
	 * 3. Run `supabase link` in tmux for authentication
	 * 4. Save credentials to project secrets
	 * 5. Verify and complete
	 */

	type WizardStep = 'init' | 'credentials' | 'linking' | 'saving' | 'complete';

	interface Props {
		project: string;
		projectPath: string;
		onComplete?: () => void;
		onCancel?: () => void;
	}

	let { project, projectPath, onComplete, onCancel }: Props = $props();

	// Wizard state
	let currentStep = $state<WizardStep>('init');
	let error = $state<string | null>(null);
	let isLoading = $state(false);

	// Init state
	let hasSupabase = $state(false);
	let isInitialized = $state(false);
	let initChecked = $state(false);

	// Credentials state
	let projectRef = $state('');
	let supabaseUrl = $state('');
	let anonKey = $state('');
	let serviceRoleKey = $state('');
	let dbPassword = $state('');

	// Linking state
	let linkSessionName = $state('');
	let linkSessionExists = $state(false);
	let isLinked = $state(false);
	let linkedProjectRef = $state<string | null>(null);
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	// Check Supabase status on mount
	$effect(() => {
		checkSupabaseStatus();
		return () => {
			if (pollInterval) {
				clearInterval(pollInterval);
			}
		};
	});

	async function checkSupabaseStatus() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch(`/api/supabase/status?project=${encodeURIComponent(project)}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to check Supabase status');
			}

			hasSupabase = data.hasSupabase;
			isLinked = data.isLinked;
			linkedProjectRef = data.projectRef || null;
			initChecked = true;

			// If already linked, skip to complete
			if (isLinked && linkedProjectRef) {
				projectRef = linkedProjectRef;
				currentStep = 'complete';
			} else if (hasSupabase) {
				// Supabase initialized, go to credentials
				isInitialized = true;
				currentStep = 'credentials';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to check status';
		} finally {
			isLoading = false;
		}
	}

	async function initializeSupabase() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch('/api/supabase/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to initialize Supabase');
			}

			isInitialized = true;
			hasSupabase = true;
			currentStep = 'credentials';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to initialize';
		} finally {
			isLoading = false;
		}
	}

	function validateCredentials(): boolean {
		if (!projectRef.trim()) {
			error = 'Project Reference is required';
			return false;
		}

		// Project ref should be alphanumeric
		if (!/^[a-z0-9]+$/i.test(projectRef.trim())) {
			error = 'Project Reference should only contain letters and numbers';
			return false;
		}

		// Optional URL validation
		if (supabaseUrl.trim() && !supabaseUrl.startsWith('https://')) {
			error = 'Supabase URL must start with https://';
			return false;
		}

		return true;
	}

	async function startLinking() {
		if (!validateCredentials()) {
			return;
		}

		try {
			isLoading = true;
			error = null;

			const response = await fetch('/api/supabase/link', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project,
					projectRef: projectRef.trim(),
					dbPassword: dbPassword.trim() || undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to start linking');
			}

			linkSessionName = data.sessionName;
			currentStep = 'linking';

			// Start polling for link status
			startLinkStatusPolling();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to start linking';
		} finally {
			isLoading = false;
		}
	}

	function startLinkStatusPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
		}

		// Poll every 2 seconds
		pollInterval = setInterval(async () => {
			try {
				const response = await fetch(`/api/supabase/link?project=${encodeURIComponent(project)}`);
				const data = await response.json();

				linkSessionExists = data.sessionExists;
				isLinked = data.isLinked;
				linkedProjectRef = data.linkedProjectRef;

				if (isLinked) {
					// Linking complete, move to saving
					if (pollInterval) {
						clearInterval(pollInterval);
						pollInterval = null;
					}
					currentStep = 'saving';
					saveCredentials();
				}
			} catch {
				// Ignore polling errors
			}
		}, 2000);
	}

	async function saveCredentials() {
		try {
			isLoading = true;
			error = null;

			// Save each credential that has a value
			const secretsToSave: Array<{ key: string; value: string }> = [];

			if (supabaseUrl.trim()) {
				secretsToSave.push({ key: 'supabase_url', value: supabaseUrl.trim() });
			}

			if (anonKey.trim()) {
				secretsToSave.push({ key: 'supabase_anon_key', value: anonKey.trim() });
			}

			if (serviceRoleKey.trim()) {
				secretsToSave.push({ key: 'supabase_service_role_key', value: serviceRoleKey.trim() });
			}

			if (dbPassword.trim()) {
				secretsToSave.push({ key: 'supabase_db_password', value: dbPassword.trim() });
			}

			// Save each secret
			for (const secret of secretsToSave) {
				const response = await fetch(`/api/config/credentials/${encodeURIComponent(project)}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ key: secret.key, value: secret.value })
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || `Failed to save ${secret.key}`);
				}
			}

			currentStep = 'complete';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save credentials';
		} finally {
			isLoading = false;
		}
	}

	function handleComplete() {
		onComplete?.();
	}

	function handleCancel() {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		onCancel?.();
	}

	// Auto-generate URL from project ref
	$effect(() => {
		if (projectRef && !supabaseUrl) {
			supabaseUrl = `https://${projectRef}.supabase.co`;
		}
	});
</script>

<div class="supabase-wizard">
	<div class="wizard-header">
		<h2 class="text-xl font-bold flex items-center gap-2">
			<svg class="w-6 h-6" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase-grad-a)"/>
				<path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase-grad-b)" fill-opacity="0.2"/>
				<path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04076L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.16584 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
				<defs>
					<linearGradient id="supabase-grad-a" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
						<stop stop-color="#249361"/>
						<stop offset="1" stop-color="#3ECF8E"/>
					</linearGradient>
					<linearGradient id="supabase-grad-b" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
						<stop/>
						<stop offset="1" stop-opacity="0"/>
					</linearGradient>
				</defs>
			</svg>
			Supabase Setup
		</h2>
		<p class="text-sm text-base-content/60 mt-1">Configure Supabase for {project}</p>
	</div>

	<!-- Step Indicator -->
	<div class="steps-indicator">
		<div class="step" class:active={currentStep === 'init'} class:completed={currentStep !== 'init' && initChecked}>
			<span class="step-number">1</span>
			<span class="step-label">Initialize</span>
		</div>
		<div class="step-connector" class:completed={currentStep !== 'init'}></div>
		<div class="step" class:active={currentStep === 'credentials'} class:completed={['linking', 'saving', 'complete'].includes(currentStep)}>
			<span class="step-number">2</span>
			<span class="step-label">Credentials</span>
		</div>
		<div class="step-connector" class:completed={['linking', 'saving', 'complete'].includes(currentStep)}></div>
		<div class="step" class:active={currentStep === 'linking'} class:completed={['saving', 'complete'].includes(currentStep)}>
			<span class="step-number">3</span>
			<span class="step-label">Link</span>
		</div>
		<div class="step-connector" class:completed={currentStep === 'complete'}></div>
		<div class="step" class:active={currentStep === 'complete'} class:completed={currentStep === 'complete'}>
			<span class="step-number">4</span>
			<span class="step-label">Complete</span>
		</div>
	</div>

	<!-- Error Display -->
	{#if error}
		<div class="alert alert-error mb-4">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{error}</span>
			<button class="btn btn-sm btn-ghost" onclick={() => (error = null)}>Dismiss</button>
		</div>
	{/if}

	<!-- Step Content -->
	<div class="step-content">
		{#if currentStep === 'init'}
			<div class="init-step">
				{#if isLoading && !initChecked}
					<div class="flex items-center gap-3">
						<span class="loading loading-spinner loading-md"></span>
						<span>Checking Supabase status...</span>
					</div>
				{:else if !hasSupabase}
					<div class="prose prose-sm max-w-none">
						<p>
							Supabase hasn't been initialized in this project yet.
							Click the button below to run <code>supabase init</code>.
						</p>
					</div>
					<button
						class="btn btn-primary mt-4"
						onclick={initializeSupabase}
						disabled={isLoading}
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Initialize Supabase
					</button>
				{:else}
					<div class="prose prose-sm max-w-none">
						<p class="text-success flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
							Supabase is already initialized
						</p>
					</div>
					<button class="btn btn-primary mt-4" onclick={() => (currentStep = 'credentials')}>
						Continue to Credentials
					</button>
				{/if}
			</div>

		{:else if currentStep === 'credentials'}
			<div class="credentials-step">
				<p class="text-sm text-base-content/70 mb-4">
					Enter your Supabase project credentials. You can find these in your
					<a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" class="link link-primary">
						Supabase Dashboard
					</a>
					under Project Settings → API.
				</p>

				<div class="form-control w-full mb-4">
					<label class="label">
						<span class="label-text font-semibold">Project Reference <span class="text-error">*</span></span>
					</label>
					<input
						type="text"
						placeholder="e.g., rpqhowthvegohrjjxywf"
						class="input input-bordered w-full"
						bind:value={projectRef}
					/>
					<label class="label">
						<span class="label-text-alt text-base-content/60">
							Found in Project Settings → General → Reference ID
						</span>
					</label>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label">
						<span class="label-text font-semibold">Supabase URL</span>
					</label>
					<input
						type="text"
						placeholder="https://your-project.supabase.co"
						class="input input-bordered w-full"
						bind:value={supabaseUrl}
					/>
					<label class="label">
						<span class="label-text-alt text-base-content/60">
							Auto-generated from project ref, or find in API settings
						</span>
					</label>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label">
						<span class="label-text font-semibold">Anon (Public) Key</span>
					</label>
					<input
						type="password"
						placeholder="eyJhbGciOiJIUzI1NiIs..."
						class="input input-bordered w-full font-mono text-sm"
						bind:value={anonKey}
					/>
					<label class="label">
						<span class="label-text-alt text-base-content/60">
							Safe to expose in browser - used for client-side requests
						</span>
					</label>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label">
						<span class="label-text font-semibold">Service Role Key</span>
					</label>
					<input
						type="password"
						placeholder="eyJhbGciOiJIUzI1NiIs..."
						class="input input-bordered w-full font-mono text-sm"
						bind:value={serviceRoleKey}
					/>
					<label class="label">
						<span class="label-text-alt text-warning">
							⚠️ Keep secret! Server-side only - bypasses RLS
						</span>
					</label>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label">
						<span class="label-text font-semibold">Database Password</span>
					</label>
					<input
						type="password"
						placeholder="Your database password"
						class="input input-bordered w-full"
						bind:value={dbPassword}
					/>
					<label class="label">
						<span class="label-text-alt text-base-content/60">
							Used for direct database connections and migrations
						</span>
					</label>
				</div>

				<div class="flex gap-2 mt-6">
					<button class="btn btn-ghost" onclick={handleCancel}>
						Cancel
					</button>
					<button
						class="btn btn-primary"
						onclick={startLinking}
						disabled={isLoading || !projectRef.trim()}
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Link Project
					</button>
				</div>
			</div>

		{:else if currentStep === 'linking'}
			<div class="linking-step">
				<div class="prose prose-sm max-w-none">
					<p>
						A terminal window has opened to complete the Supabase authentication.
						Please follow the prompts in the terminal.
					</p>
				</div>

				<div class="mt-4 p-4 bg-base-200 rounded-lg">
					<div class="flex items-center gap-3">
						{#if linkSessionExists && !isLinked}
							<span class="loading loading-spinner loading-md text-primary"></span>
							<div>
								<p class="font-semibold">Waiting for authentication...</p>
								<p class="text-sm text-base-content/60">
									Complete the login in the terminal window
								</p>
							</div>
						{:else if isLinked}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
							<div>
								<p class="font-semibold text-success">Project linked successfully!</p>
								<p class="text-sm text-base-content/60">
									Project ref: {linkedProjectRef}
								</p>
							</div>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-warning" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
							<div>
								<p class="font-semibold">Session not found</p>
								<p class="text-sm text-base-content/60">
									The linking session may have ended. Try again.
								</p>
							</div>
						{/if}
					</div>
				</div>

				<div class="flex gap-2 mt-6">
					<button class="btn btn-ghost" onclick={handleCancel}>
						Cancel
					</button>
					<button
						class="btn btn-primary"
						onclick={startLinking}
						disabled={isLoading || linkSessionExists}
					>
						Retry Linking
					</button>
				</div>
			</div>

		{:else if currentStep === 'saving'}
			<div class="saving-step">
				<div class="flex items-center gap-3">
					<span class="loading loading-spinner loading-md"></span>
					<span>Saving credentials to project secrets...</span>
				</div>
			</div>

		{:else if currentStep === 'complete'}
			<div class="complete-step">
				<div class="text-center py-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-success mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
					<h3 class="text-xl font-bold text-success mb-2">Supabase Setup Complete!</h3>
					<p class="text-base-content/70">
						Your project is now linked to Supabase project: <code class="bg-base-200 px-2 py-0.5 rounded">{linkedProjectRef || projectRef}</code>
					</p>
				</div>

				<div class="mt-4 p-4 bg-base-200 rounded-lg">
					<h4 class="font-semibold mb-2">What's configured:</h4>
					<ul class="space-y-1 text-sm">
						<li class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							Supabase CLI linked to project
						</li>
						{#if supabaseUrl}
							<li class="flex items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
								Supabase URL saved
							</li>
						{/if}
						{#if anonKey}
							<li class="flex items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
								Anon key saved
							</li>
						{/if}
						{#if serviceRoleKey}
							<li class="flex items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
								Service role key saved
							</li>
						{/if}
						{#if dbPassword}
							<li class="flex items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
								Database password saved
							</li>
						{/if}
					</ul>
				</div>

				<div class="flex gap-2 mt-6 justify-center">
					<button class="btn btn-primary" onclick={handleComplete}>
						Done
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.supabase-wizard {
		padding: 1.5rem;
	}

	.wizard-header {
		margin-bottom: 1.5rem;
	}

	.steps-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: oklch(0.20 0.02 250 / 0.5);
		border-radius: 0.5rem;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		opacity: 0.5;
		transition: opacity 0.2s;
	}

	.step.active {
		opacity: 1;
	}

	.step.completed {
		opacity: 0.8;
	}

	.step-number {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: oklch(0.30 0.02 250);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.step.active .step-number {
		background: oklch(0.55 0.15 145);
		color: white;
	}

	.step.completed .step-number {
		background: oklch(0.55 0.15 145 / 0.3);
		color: oklch(0.55 0.15 145);
	}

	.step-label {
		font-size: 0.75rem;
		color: oklch(0.70 0.02 250);
	}

	.step.active .step-label {
		color: oklch(0.90 0.02 250);
		font-weight: 500;
	}

	.step-connector {
		flex: 1;
		height: 2px;
		max-width: 3rem;
		background: oklch(0.30 0.02 250);
		margin: 0 0.5rem;
		margin-bottom: 1.25rem;
	}

	.step-connector.completed {
		background: oklch(0.55 0.15 145 / 0.5);
	}

	.step-content {
		min-height: 200px;
	}
</style>
