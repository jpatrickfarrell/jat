<script lang="ts">
	/**
	 * Project Secrets Editor
	 *
	 * Manages per-project secrets organized by integration sections (Supabase,
	 * Cloudflare, Database, etc.) plus freeform user-defined secrets.
	 * Secrets are stored securely in ~/.config/jat/credentials.json
	 */

	import { successToast, errorToast } from '$lib/stores/toasts.svelte';

	interface SecretType {
		id: string;
		name: string;
		description: string;
		placeholder: string;
		isUrl?: boolean;
		integration?: string;
		envVarName?: string;
	}

	interface IntegrationSection {
		id: string;
		name: string;
		description: string;
		icon: string;
		iconViewBox?: string;
		color: string;
	}

	interface MaskedSecret {
		masked: string;
		addedAt: string;
		isSet: boolean;
	}

	interface Props {
		projectKey: string;
	}

	let { projectKey }: Props = $props();

	// State
	let loading = $state(true);
	let error = $state<string | null>(null);
	let secrets = $state<Record<string, MaskedSecret>>({});
	let secretTypes = $state<SecretType[]>([]);
	let integrationSections = $state<IntegrationSection[]>([]);

	// Collapse state per section (persisted in localStorage)
	let collapsedSections = $state<Set<string>>(new Set());

	// Edit modal state
	let editingSecret = $state<SecretType | null>(null);
	let editValue = $state('');
	let editError = $state<string | null>(null);
	let saving = $state(false);

	// Add freeform secret modal
	let addingFreeform = $state(false);
	let freeformName = $state('');
	let freeformEnvVar = $state('');
	let freeformValue = $state('');
	let freeformDescription = $state('');
	let freeformError = $state<string | null>(null);
	let freeformSaving = $state(false);

	// Delete confirmation
	let deletingSecret = $state<string | null>(null);

	// Derived: group secret types by integration
	let sectionSecrets = $derived.by(() => {
		const groups = new Map<string, SecretType[]>();
		for (const section of integrationSections) {
			groups.set(section.id, secretTypes.filter(t => t.integration === section.id));
		}
		return groups;
	});

	// Derived: freeform secrets (not in any integration section)
	let freeformSecrets = $derived.by(() => {
		const knownIds = new Set(secretTypes.map(t => t.id));
		const result: { id: string; masked: string; addedAt: string }[] = [];
		for (const [key, val] of Object.entries(secrets)) {
			if (val?.isSet && !knownIds.has(key)) {
				result.push({ id: key, masked: val.masked, addedAt: val.addedAt });
			}
		}
		return result;
	});

	// Derived: count configured secrets per section
	function sectionConfiguredCount(sectionId: string): number {
		const types = sectionSecrets.get(sectionId) || [];
		return types.filter(t => secrets[t.id]?.isSet).length;
	}

	// Load collapse state from localStorage
	function loadCollapseState() {
		try {
			const stored = localStorage.getItem(`jat-secrets-collapsed-${projectKey}`);
			if (stored) collapsedSections = new Set(JSON.parse(stored));
		} catch { /* ignore */ }
	}

	function saveCollapseState() {
		try {
			localStorage.setItem(`jat-secrets-collapsed-${projectKey}`, JSON.stringify([...collapsedSections]));
		} catch { /* ignore */ }
	}

	function toggleSection(sectionId: string) {
		if (collapsedSections.has(sectionId)) {
			collapsedSections.delete(sectionId);
		} else {
			collapsedSections.add(sectionId);
		}
		collapsedSections = new Set(collapsedSections);
		saveCollapseState();
	}

	// Fetch secrets on mount and when project changes
	$effect(() => {
		if (projectKey) {
			fetchSecrets();
			loadCollapseState();
		}
	});

	async function fetchSecrets() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/config/credentials/${encodeURIComponent(projectKey)}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch secrets');
			}

			secrets = data.secrets || {};
			secretTypes = data.secretTypes || [];
			integrationSections = data.integrationSections || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load secrets';
			console.error('[ProjectSecrets] Error fetching:', err);
		} finally {
			loading = false;
		}
	}

	function openEditModal(secretType: SecretType) {
		editingSecret = secretType;
		editValue = '';
		editError = null;
	}

	function closeEditModal() {
		editingSecret = null;
		editValue = '';
		editError = null;
	}

	async function saveSecret() {
		if (!editingSecret || !editValue.trim()) {
			editError = 'Value is required';
			return;
		}

		saving = true;
		editError = null;

		try {
			const response = await fetch(`/api/config/credentials/${encodeURIComponent(projectKey)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					secretKey: editingSecret.id,
					value: editValue.trim()
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to save secret');
			}

			secrets = data.secrets || {};
			successToast(`${editingSecret.name} saved`, 'Secret stored securely');
			closeEditModal();
		} catch (err) {
			editError = err instanceof Error ? err.message : 'Failed to save secret';
		} finally {
			saving = false;
		}
	}

	async function deleteSecret(secretKey: string) {
		try {
			const response = await fetch(
				`/api/config/credentials/${encodeURIComponent(projectKey)}?secretKey=${encodeURIComponent(secretKey)}`,
				{ method: 'DELETE' }
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete secret');
			}

			secrets = data.secrets || {};
			const secretType = secretTypes.find((t) => t.id === secretKey);
			successToast(`${secretType?.name || secretKey} deleted`, 'Secret removed');
		} catch (err) {
			errorToast('Delete failed', err instanceof Error ? err.message : 'Unknown error');
		} finally {
			deletingSecret = null;
		}
	}

	// Freeform secret handling
	function openFreeformModal() {
		addingFreeform = true;
		freeformName = '';
		freeformEnvVar = '';
		freeformValue = '';
		freeformDescription = '';
		freeformError = null;
	}

	function closeFreeformModal() {
		addingFreeform = false;
		freeformName = '';
		freeformEnvVar = '';
		freeformValue = '';
		freeformDescription = '';
		freeformError = null;
	}

	// Auto-derive env var name from secret name
	function deriveEnvVar(name: string): string {
		return name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
	}

	$effect(() => {
		if (freeformName && !freeformEnvVar) {
			freeformEnvVar = deriveEnvVar(freeformName);
		}
	});

	async function saveFreeformSecret() {
		const envVar = freeformEnvVar.trim();
		const value = freeformValue.trim();

		if (!envVar) {
			freeformError = 'Environment variable name is required';
			return;
		}
		if (!/^[A-Z][A-Z0-9_]*$/.test(envVar)) {
			freeformError = 'Env var must start with a letter and contain only A-Z, 0-9, _';
			return;
		}
		if (!value) {
			freeformError = 'Value is required';
			return;
		}

		// Use env var as the secret key (lowercase for storage)
		const secretKey = envVar.toLowerCase();

		freeformSaving = true;
		freeformError = null;

		try {
			const response = await fetch(`/api/config/credentials/${encodeURIComponent(projectKey)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					secretKey,
					value,
					description: freeformDescription.trim() || undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to save secret');
			}

			secrets = data.secrets || {};
			successToast(`${freeformName || envVar} saved`, 'Custom secret stored');
			closeFreeformModal();
		} catch (err) {
			freeformError = err instanceof Error ? err.message : 'Failed to save secret';
		} finally {
			freeformSaving = false;
		}
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="project-secrets">
	<div class="secrets-header">
		<h4 class="secrets-title">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			Project Secrets
		</h4>
		<button class="add-secret-btn" onclick={openFreeformModal} title="Add custom secret">
			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Secret
		</button>
	</div>

	{#if loading}
		<div class="secrets-loading">
			<span class="loading loading-spinner loading-sm"></span>
			<span>Loading secrets...</span>
		</div>
	{:else if error}
		<div class="secrets-error">
			<span>{error}</span>
			<button class="btn btn-xs btn-ghost" onclick={fetchSecrets}>Retry</button>
		</div>
	{:else}
		<!-- Integration Sections -->
		{#each integrationSections as section}
			{@const sectionTypes = sectionSecrets.get(section.id) || []}
			{@const configuredCount = sectionConfiguredCount(section.id)}
			{@const isCollapsed = collapsedSections.has(section.id)}
			{#if sectionTypes.length > 0}
				<div class="integration-section" style="--section-color: {section.color};">
					<button
						class="section-header"
						onclick={() => toggleSection(section.id)}
						aria-expanded={!isCollapsed}
					>
						<div class="section-header-left">
							<svg class="section-icon" fill="currentColor" viewBox={section.iconViewBox || '0 0 24 24'}>
								<path d={section.icon} />
							</svg>
							<span class="section-name">{section.name}</span>
							<span class="section-desc">{section.description}</span>
						</div>
						<div class="section-header-right">
							{#if configuredCount > 0}
								<span class="section-count">{configuredCount}/{sectionTypes.length}</span>
							{/if}
							<svg
								class="chevron"
								class:rotated={!isCollapsed}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</button>

					{#if !isCollapsed}
						<table class="secrets-table">
							<thead>
								<tr>
									<th class="col-name">Name</th>
									<th class="col-value">Value</th>
									<th class="col-date">Added</th>
									<th class="col-status">Status</th>
									<th class="col-actions"></th>
								</tr>
							</thead>
							<tbody>
								{#each sectionTypes as secretType}
									{@const secret = secrets[secretType.id]}
									<tr class:is-set={secret?.isSet}>
										<td class="col-name">
											<span class="name-text">{secretType.name}</span>
											{#if secretType.envVarName}
												<code class="env-var-inline">${secretType.envVarName}</code>
											{/if}
											<span class="desc-text">{secretType.description}</span>
										</td>
										<td class="col-value">
											{#if secret?.isSet}
												<code class="masked-value">{secret.masked}</code>
											{:else}
												<span class="not-set">--</span>
											{/if}
										</td>
										<td class="col-date">
											{#if secret?.isSet && secret.addedAt}
												<span class="date-text">{formatDate(secret.addedAt)}</span>
											{/if}
										</td>
										<td class="col-status">
											{#if secret?.isSet}
												<span class="status-badge status-configured">Configured</span>
											{:else}
												<span class="status-badge status-missing">Not Set</span>
											{/if}
										</td>
										<td class="col-actions">
											{#if secret?.isSet}
												{#if deletingSecret === secretType.id}
													<button class="btn btn-xs btn-error" onclick={() => deleteSecret(secretType.id)}>Delete</button>
													<button class="btn btn-xs btn-ghost" onclick={() => (deletingSecret = null)}>Cancel</button>
												{:else}
													<button class="action-btn" onclick={() => openEditModal(secretType)} title="Edit">
														<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
													</button>
													<button class="action-btn action-btn-danger" onclick={() => (deletingSecret = secretType.id)} title="Delete">
														<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
													</button>
												{/if}
											{:else}
												<button class="btn btn-xs btn-primary" onclick={() => openEditModal(secretType)}>Add</button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			{/if}
		{/each}

		<!-- Freeform (custom) Secrets -->
		{#if freeformSecrets.length > 0}
			<div class="integration-section" style="--section-color: oklch(0.70 0.10 280);">
				<div class="section-header static-header">
					<div class="section-header-left">
						<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
						<span class="section-name">Custom Secrets</span>
						<span class="section-desc">{freeformSecrets.length} secret{freeformSecrets.length !== 1 ? 's' : ''}</span>
					</div>
				</div>
				<table class="secrets-table">
					<thead>
						<tr>
							<th class="col-name">Env Variable</th>
							<th class="col-value">Value</th>
							<th class="col-date">Added</th>
							<th class="col-status">Status</th>
							<th class="col-actions"></th>
						</tr>
					</thead>
					<tbody>
						{#each freeformSecrets as freeform}
							<tr class="is-set">
								<td class="col-name">
									<code class="env-var-badge">{freeform.id.toUpperCase()}</code>
								</td>
								<td class="col-value">
									<code class="masked-value">{freeform.masked}</code>
								</td>
								<td class="col-date">
									{#if freeform.addedAt}
										<span class="date-text">{formatDate(freeform.addedAt)}</span>
									{/if}
								</td>
								<td class="col-status">
									<span class="status-badge status-configured">Configured</span>
								</td>
								<td class="col-actions">
									{#if deletingSecret === freeform.id}
										<button class="btn btn-xs btn-error" onclick={() => deleteSecret(freeform.id)}>Delete</button>
										<button class="btn btn-xs btn-ghost" onclick={() => (deletingSecret = null)}>Cancel</button>
									{:else}
										<button class="action-btn" onclick={() => openEditModal({ id: freeform.id, name: freeform.id.toUpperCase(), description: 'Custom secret', placeholder: 'Enter value...' })} title="Edit">
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
										</button>
										<button class="action-btn action-btn-danger" onclick={() => (deletingSecret = freeform.id)} title="Delete">
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>

<!-- Edit Modal (for known + custom secrets) -->
{#if editingSecret}
	<div class="modal modal-open" role="dialog" aria-modal="true">
		<div class="modal-box max-w-md" style="background: oklch(0.18 0.02 250);">
			<h3 class="font-bold text-lg mb-4" style="color: oklch(0.90 0.02 250);">
				{secrets[editingSecret.id]?.isSet ? 'Update' : 'Add'} {editingSecret.name}
			</h3>

			<p class="text-sm mb-4" style="color: oklch(0.60 0.02 250);">
				{editingSecret.description}
			</p>

			<div class="form-control">
				<input
					type="text"
					class="input input-bordered w-full"
					placeholder={editingSecret.placeholder}
					bind:value={editValue}
					style="background: oklch(0.14 0.01 250); border-color: oklch(0.28 0.02 250); color: oklch(0.90 0.02 250);"
				/>
				{#if editError}
					<label class="label">
						<span class="label-text-alt text-error">{editError}</span>
					</label>
				{/if}
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={closeEditModal} disabled={saving}>Cancel</button>
				<button class="btn btn-primary" onclick={saveSecret} disabled={saving || !editValue.trim()}>
					{#if saving}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					Save
				</button>
			</div>
		</div>
		<button class="modal-backdrop" onclick={closeEditModal} aria-label="Close modal"></button>
	</div>
{/if}

<!-- Add Freeform Secret Modal -->
{#if addingFreeform}
	<div class="modal modal-open" role="dialog" aria-modal="true">
		<div class="modal-box max-w-md" style="background: oklch(0.18 0.02 250);">
			<h3 class="font-bold text-lg mb-4" style="color: oklch(0.90 0.02 250);">
				Add Custom Secret
			</h3>

			<p class="text-sm mb-4" style="color: oklch(0.55 0.02 250);">
				Add any environment variable or secret. Accessible via <code style="font-size: 0.75rem; padding: 0.1rem 0.3rem; background: oklch(0.14 0.01 250); border-radius: 0.2rem; color: oklch(0.70 0.08 200);">jat-secret</code> CLI.
			</p>

			<div class="flex flex-col gap-3">
				<div class="form-control">
					<label class="label py-1">
						<span class="label-text text-sm" style="color: oklch(0.75 0.02 250);">Name (optional)</span>
					</label>
					<input
						type="text"
						class="input input-bordered input-sm w-full"
						placeholder="e.g. Stripe API Key"
						bind:value={freeformName}
						style="background: oklch(0.14 0.01 250); border-color: oklch(0.28 0.02 250); color: oklch(0.90 0.02 250);"
					/>
				</div>

				<div class="form-control">
					<label class="label py-1">
						<span class="label-text text-sm" style="color: oklch(0.75 0.02 250);">Environment Variable *</span>
					</label>
					<input
						type="text"
						class="input input-bordered input-sm w-full font-mono"
						placeholder="e.g. STRIPE_API_KEY"
						bind:value={freeformEnvVar}
						oninput={() => { freeformEnvVar = freeformEnvVar.toUpperCase().replace(/[^A-Z0-9_]/g, ''); }}
						style="background: oklch(0.14 0.01 250); border-color: oklch(0.28 0.02 250); color: oklch(0.90 0.02 250);"
					/>
				</div>

				<div class="form-control">
					<label class="label py-1">
						<span class="label-text text-sm" style="color: oklch(0.75 0.02 250);">Value *</span>
					</label>
					<input
						type="text"
						class="input input-bordered input-sm w-full"
						placeholder="Secret value"
						bind:value={freeformValue}
						style="background: oklch(0.14 0.01 250); border-color: oklch(0.28 0.02 250); color: oklch(0.90 0.02 250);"
					/>
				</div>

				<div class="form-control">
					<label class="label py-1">
						<span class="label-text text-sm" style="color: oklch(0.75 0.02 250);">Description (optional)</span>
					</label>
					<input
						type="text"
						class="input input-bordered input-sm w-full"
						placeholder="What is this secret for?"
						bind:value={freeformDescription}
						style="background: oklch(0.14 0.01 250); border-color: oklch(0.28 0.02 250); color: oklch(0.90 0.02 250);"
					/>
				</div>

				{#if freeformError}
					<div class="text-error text-xs mt-1">{freeformError}</div>
				{/if}
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={closeFreeformModal} disabled={freeformSaving}>Cancel</button>
				<button
					class="btn btn-primary"
					onclick={saveFreeformSecret}
					disabled={freeformSaving || !freeformEnvVar.trim() || !freeformValue.trim()}
				>
					{#if freeformSaving}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					Add Secret
				</button>
			</div>
		</div>
		<button class="modal-backdrop" onclick={closeFreeformModal} aria-label="Close modal"></button>
	</div>
{/if}

<style>
	.project-secrets {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.secrets-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.secrets-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		margin: 0;
	}

	.add-secret-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.6rem;
		font-size: 0.7rem;
		font-weight: 500;
		color: oklch(0.75 0.08 200);
		background: oklch(0.20 0.02 200 / 0.3);
		border: 1px solid oklch(0.30 0.04 200 / 0.4);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.add-secret-btn:hover {
		background: oklch(0.25 0.04 200 / 0.4);
		border-color: oklch(0.40 0.06 200 / 0.5);
		color: oklch(0.85 0.10 200);
	}

	.secrets-loading,
	.secrets-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		font-size: 0.8rem;
		color: oklch(0.55 0.02 250);
		background: oklch(0.16 0.01 250);
		border-radius: 0.5rem;
	}

	.secrets-error {
		color: oklch(0.65 0.12 25);
		background: oklch(0.20 0.04 25 / 0.2);
	}

	/* Integration Sections */
	.integration-section {
		margin-bottom: 0.5rem;
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 0.5rem;
		overflow: hidden;
		transition: border-color 0.15s ease;
	}

	.integration-section:hover {
		border-color: oklch(0.28 0.03 250);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border: none;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.section-header:hover {
		background: oklch(0.18 0.02 250);
	}

	.static-header {
		cursor: default;
	}

	.static-header:hover {
		background: oklch(0.16 0.01 250);
	}

	.section-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-icon {
		width: 0.9rem;
		height: 0.9rem;
		color: var(--section-color);
		flex-shrink: 0;
	}

	.section-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
	}

	.section-desc {
		font-size: 0.65rem;
		color: oklch(0.45 0.02 250);
	}

	.section-header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-count {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 0.05rem 0.35rem;
		border-radius: 0.2rem;
		background: var(--section-color, oklch(0.65 0.15 200));
		color: oklch(0.10 0.01 250);
	}

	.chevron {
		width: 0.8rem;
		height: 0.8rem;
		color: oklch(0.50 0.02 250);
		transition: transform 0.2s ease;
	}

	.chevron.rotated {
		transform: rotate(90deg);
	}

	/* Secrets Table */
	.secrets-table {
		width: 100%;
		border-collapse: collapse;
		border-top: 1px solid oklch(0.22 0.02 250);
	}

	.secrets-table thead tr {
		background: oklch(0.13 0.01 250);
	}

	.secrets-table th {
		padding: 0.3rem 0.6rem;
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(0.50 0.02 250);
		text-align: left;
		border-bottom: 1px solid oklch(0.20 0.01 250);
	}

	.secrets-table td {
		padding: 0.4rem 0.6rem;
		font-size: 0.75rem;
		color: oklch(0.80 0.02 250);
		vertical-align: middle;
		background: oklch(0.14 0.01 250);
	}

	.secrets-table tbody tr {
		border-bottom: 1px solid oklch(0.18 0.01 250);
		transition: background 0.1s ease;
	}

	.secrets-table tbody tr:last-child {
		border-bottom: none;
	}

	.secrets-table tbody tr:hover {
		background: oklch(0.16 0.01 250);
	}

	.secrets-table tbody tr:hover td {
		background: transparent;
	}

	.secrets-table tbody tr.is-set td {
		background: oklch(0.15 0.01 145 / 0.06);
	}

	.secrets-table tbody tr.is-set:hover td {
		background: transparent;
	}

	.col-name {
		width: 30%;
	}

	.col-value {
		width: 24%;
	}

	.col-date {
		width: 14%;
	}

	.col-status {
		width: 12%;
	}

	.col-actions {
		width: 10%;
		text-align: right !important;
		white-space: nowrap;
	}

	td.col-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.2rem;
	}

	.name-text {
		font-weight: 500;
		color: oklch(0.85 0.02 250);
		display: block;
		font-size: 0.75rem;
	}

	.desc-text {
		font-size: 0.6rem;
		color: oklch(0.45 0.02 250);
		display: block;
		line-height: 1.3;
	}

	.masked-value {
		font-size: 0.65rem;
		padding: 0.15rem 0.35rem;
		background: oklch(0.12 0.01 250);
		border-radius: 0.2rem;
		color: oklch(0.70 0.08 145);
		font-family: ui-monospace, monospace;
	}

	.not-set {
		font-size: 0.65rem;
		color: oklch(0.35 0.02 250);
	}

	.date-text {
		font-size: 0.6rem;
		color: oklch(0.45 0.02 250);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.action-btn:hover {
		background: oklch(0.22 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.action-btn-danger:hover {
		background: oklch(0.25 0.08 25 / 0.3);
		color: oklch(0.70 0.15 25);
	}

	.env-var-inline {
		font-size: 0.6rem;
		padding: 0.05rem 0.25rem;
		background: oklch(0.20 0.03 200 / 0.25);
		border-radius: 0.15rem;
		color: oklch(0.65 0.08 200);
		font-family: ui-monospace, monospace;
		font-weight: 500;
		display: inline-block;
		margin-left: 0.3rem;
		vertical-align: middle;
	}

	.env-var-badge {
		font-size: 0.7rem;
		padding: 0.1rem 0.35rem;
		background: oklch(0.20 0.03 200 / 0.3);
		border-radius: 0.2rem;
		color: oklch(0.75 0.10 200);
		font-family: ui-monospace, monospace;
		font-weight: 500;
	}

	.status-badge {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		border-radius: 0.25rem;
		white-space: nowrap;
	}

	.status-configured {
		background: oklch(0.30 0.08 145 / 0.3);
		color: oklch(0.70 0.15 145);
	}

	.status-missing {
		background: oklch(0.25 0.02 250 / 0.3);
		color: oklch(0.45 0.02 250);
	}

	/* Modal backdrop */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.6);
		cursor: pointer;
		border: none;
	}
</style>
