<script lang="ts">
	/**
	 * CredentialsEditor Component (Secret Vault)
	 *
	 * Manages global provider API keys stored in ~/.config/jat/credentials.json.
	 * Integration-scoped secrets (Slack tokens, etc.) are managed through their
	 * respective integration configurations, not here.
	 *
	 * Features:
	 * - Add/edit/delete provider API keys
	 * - Verify keys work with provider
	 * - Masked display (sk-ant-...7x4k)
	 * - Provider documentation links
	 * - "Used by" badges for all configured keys
	 */

	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Types
	interface MaskedApiKeyEntry {
		masked: string;
		addedAt: string;
		lastVerified?: string;
		verificationError?: string;
		isSet: boolean;
	}

	interface ApiKeyProvider {
		id: string;
		name: string;
		description: string;
		keyPrefix: string;
		envVar: string;
		verifyUrl: string;
		usedBy: string[];
		docsUrl: string;
	}

	interface Credentials {
		apiKeys: {
			[key: string]: MaskedApiKeyEntry | undefined;
		};
	}

	// State
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let credentials = $state<Credentials | null>(null);
	let providers = $state<ApiKeyProvider[]>([]);

	// Edit modal state
	let editingProvider = $state<string | null>(null);
	let editingKey = $state('');
	let editingError = $state<string | null>(null);
	let isSaving = $state(false);
	let isVerifying = $state(false);
	let verifyOnSave = $state(true);

	// Delete confirmation state
	let deletingProvider = $state<string | null>(null);
	let isDeleting = $state(false);

	// Verification state (for re-verify button)
	let verifyingProvider = $state<string | null>(null);

	// Fetch credentials on mount
	onMount(() => {
		fetchCredentials();
	});

	async function fetchCredentials() {
		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/config/credentials');
			if (!response.ok) {
				throw new Error('Failed to fetch credentials');
			}

			const data = await response.json();
			credentials = data.credentials;
			providers = data.providers || [];
		} catch (err) {
			error = (err as Error).message;
		} finally {
			isLoading = false;
		}
	}

	function openEditModal(providerId: string) {
		editingProvider = providerId;
		editingKey = '';
		editingError = null;
		verifyOnSave = true;
	}

	function closeEditModal() {
		editingProvider = null;
		editingKey = '';
		editingError = null;
	}

	async function saveApiKey() {
		if (!editingProvider || !editingKey.trim()) {
			editingError = 'API key is required';
			return;
		}

		isSaving = true;
		editingError = null;

		try {
			const response = await fetch('/api/config/credentials', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					provider: editingProvider,
					key: editingKey.trim(),
					verify: verifyOnSave
				})
			});

			const data = await response.json();

			if (!response.ok) {
				editingError = data.error || 'Failed to save API key';
				return;
			}

			// Update credentials
			credentials = data.credentials;

			// Show verification result
			if (verifyOnSave && !data.verified) {
				editingError = `Key saved but verification failed: ${data.verificationError}`;
				// Don't close modal so user can see the error
				return;
			}

			closeEditModal();
		} catch (err) {
			editingError = (err as Error).message;
		} finally {
			isSaving = false;
		}
	}

	function openDeleteConfirm(providerId: string) {
		deletingProvider = providerId;
	}

	function closeDeleteConfirm() {
		deletingProvider = null;
	}

	async function deleteApiKey() {
		if (!deletingProvider) return;

		isDeleting = true;

		try {
			const response = await fetch(
				`/api/config/credentials?provider=${encodeURIComponent(deletingProvider)}`,
				{ method: 'DELETE' }
			);

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to delete API key';
				return;
			}

			credentials = data.credentials;
			closeDeleteConfirm();
		} catch (err) {
			error = (err as Error).message;
		} finally {
			isDeleting = false;
		}
	}

	async function verifyExistingKey(providerId: string) {
		verifyingProvider = providerId;

		try {
			const response = await fetch('/api/config/credentials', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ provider: providerId })
			});

			const data = await response.json();

			if (response.ok) {
				credentials = data.credentials;
			}
		} catch (err) {
			console.error('Verification error:', err);
		} finally {
			verifyingProvider = null;
		}
	}

	function formatDate(isoString: string): string {
		if (!isoString) return '';
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getProviderInfo(providerId: string): ApiKeyProvider | undefined {
		return providers.find((p) => p.id === providerId);
	}

	// Get the editing provider info
	let editingProviderInfo = $derived(
		editingProvider ? getProviderInfo(editingProvider) : null
	);

	// Provider-specific setup instructions (matches IngestWizard styling)
	interface ProviderInstruction {
		title: string;
		color: number; // oklch hue
		steps: string[];
		note?: string;
	}

	const PROVIDER_INSTRUCTIONS: Record<string, ProviderInstruction> = {
		anthropic: {
			title: 'How to get an Anthropic API Key',
			color: 30,
			steps: [
				'Go to <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com/settings/keys</a>',
				'Sign in or create an account',
				'Click <strong>Create Key</strong>',
				'Give the key a name (e.g. <code>JAT IDE</code>) and click <strong>Create Key</strong>',
				'Copy the key immediately — it starts with <code>sk-ant-</code> and won\'t be shown again'
			],
			note: 'You need a paid plan or credits on your account for API access. The key is separate from a Claude Pro/Max subscription.'
		},
		google: {
			title: 'How to get a Gemini API Key',
			color: 55,
			steps: [
				'Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com/app/apikey</a>',
				'Sign in with your Google account',
				'Click <strong>Create API key</strong>',
				'Select or create a Google Cloud project when prompted',
				'Copy the key — it starts with <code>AIza</code>'
			],
			note: 'The free tier includes generous usage limits. Used for image generation (gemini-image, gemini-edit) and avatar generation.'
		},
		openai: {
			title: 'How to get an OpenAI API Key',
			color: 145,
			steps: [
				'Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com/api-keys</a>',
				'Sign in or create an account',
				'Click <strong>Create new secret key</strong>',
				'Give the key a name (e.g. <code>JAT</code>) and click <strong>Create secret key</strong>',
				'Copy the key — it starts with <code>sk-</code> and won\'t be shown again'
			],
			note: 'Requires a paid account with API credits. Separate from a ChatGPT Plus subscription.'
		},
		openrouter: {
			title: 'How to get an OpenRouter API Key',
			color: 280,
			steps: [
				'Go to <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener">openrouter.ai/settings/keys</a>',
				'Sign in or create an account',
				'Click <strong>Create Key</strong>',
				'Give the key a name and click <strong>Create</strong>',
				'Copy the key — it starts with <code>sk-or-</code>'
			],
			note: 'OpenRouter provides access to 200+ models from various providers through a single API key. Pay-per-use pricing.'
		},
		slack: {
			title: 'How to get a Slack Bot Token',
			color: 220,
			steps: [
				'Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener">api.slack.com/apps</a> and click <strong>Create New App</strong>',
				'Choose <strong>From scratch</strong>, name it (e.g. <code>JAT</code>), and select your workspace',
				'In the sidebar, click <strong>OAuth & Permissions</strong>',
				'Under <strong>Bot Token Scopes</strong>, add: <code>channels:history</code>, <code>channels:read</code>, <code>groups:read</code>, <code>chat:write</code>',
				'Click <strong>Install to Workspace</strong> and authorize',
				'Copy the <strong>Bot User OAuth Token</strong> — it starts with <code>xoxb-</code>'
			]
		},
		telegram: {
			title: 'How to get a Telegram Bot Token',
			color: 220,
			steps: [
				'Open Telegram and message <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a>',
				'Send <code>/newbot</code> and follow the prompts to name your bot',
				'Copy the <strong>HTTP API token</strong> — it looks like <code>123456:ABC-DEF1234...</code>',
				'Add the bot to your group/channel and give it permission to read messages'
			]
		},
		discord: {
			title: 'How to get a Discord Bot Token',
			color: 270,
			steps: [
				'Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener">discord.com/developers/applications</a>',
				'Click <strong>New Application</strong> and give it a name',
				'Go to the <strong>Bot</strong> section in the sidebar',
				'Click <strong>Reset Token</strong> to generate a new token, then copy it',
				'Under <strong>Privileged Gateway Intents</strong>, enable <strong>Message Content Intent</strong>'
			],
			note: 'You\'ll also need to invite the bot to your server using an OAuth2 URL with the appropriate scopes.'
		},
		gmail: {
			title: 'How to get a Gmail App Password',
			color: 25,
			steps: [
				'Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener">myaccount.google.com/security</a>',
				'Enable <strong>2-Step Verification</strong> if not already on',
				'Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">App Passwords</a>',
				'Enter a name (e.g. <code>JAT Ingest</code>) and click <strong>Create</strong>',
				'Copy the 16-character password (spaces are optional)'
			],
			note: 'Also create a Gmail label (e.g. <code>JAT</code>) and a filter rule to route relevant emails there.'
		},
		cloudflare: {
			title: 'How to get a Cloudflare API Token',
			color: 55,
			steps: [
				'Go to <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener">dash.cloudflare.com/profile/api-tokens</a> and click <strong>Create Token</strong>',
				'Scroll to the bottom and click <strong>Get started</strong> next to <strong>Create Custom Token</strong>',
				'Give the token a name (e.g. <code>JAT</code>)',
				'Under <strong>Permissions</strong>, set the three dropdowns: <strong>Account</strong> → <strong>Cloudflare Pages</strong> → <strong>Read</strong>',
				'Leave Account Resources, Client IP Address Filtering, and TTL as defaults',
				'Click <strong>Continue to summary</strong> → <strong>Create Token</strong>, then copy the token'
			]
		},
		vercel: {
			title: 'How to get a Vercel Token',
			color: 0,
			steps: [
				'Go to <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener">vercel.com/account/tokens</a>',
				'Click <strong>Create</strong>',
				'Give the token a name (e.g. <code>JAT</code>), select scope and expiration',
				'Click <strong>Create Token</strong> and copy it immediately'
			],
			note: 'For full deployment access, use a token with your personal account scope or select the appropriate team.'
		},
		fly: {
			title: 'How to get a Fly.io API Token',
			color: 280,
			steps: [
				'Install the Fly CLI: <code>curl -L https://fly.io/install.sh | sh</code>',
				'Run <code>fly auth login</code> to authenticate',
				'Run <code>fly tokens create deploy</code> to create a deploy token',
				'Copy the token — it starts with <code>fo1_</code>'
			],
			note: 'You can also create tokens at <a href="https://fly.io/docs/flyctl/tokens/" target="_blank" rel="noopener">fly.io dashboard</a>. Deploy tokens are scoped to a single app.'
		},
		convex: {
			title: 'How to get a Convex Deploy Key',
			color: 200,
			steps: [
				'Go to your project at <a href="https://dashboard.convex.dev" target="_blank" rel="noopener">dashboard.convex.dev</a>',
				'Navigate to <strong>Settings</strong> → <strong>Deploy Key</strong>',
				'Click <strong>Generate Deploy Key</strong>',
				'Copy the deploy key'
			],
			note: 'Deploy keys are used for CI/CD and programmatic deployments. They have full access to your Convex project.'
		},
		github: {
			title: 'How to get a GitHub Personal Access Token',
			color: 130,
			steps: [
				'Go to <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">github.com/settings/tokens</a>',
				'Click <strong>Generate new token</strong> (Fine-grained recommended)',
				'Give the token a name, set expiration, and select the repositories',
				'Under <strong>Permissions</strong>, grant the access you need (e.g. <strong>Contents: Read</strong>)',
				'Click <strong>Generate token</strong> and copy it — it starts with <code>ghp_</code>'
			],
			note: 'Fine-grained tokens are recommended over classic tokens. They allow precise repository and permission scoping.'
		},
		linear: {
			title: 'How to get a Linear API Key',
			color: 270,
			steps: [
				'Go to <a href="https://linear.app/settings/api" target="_blank" rel="noopener">linear.app/settings/api</a>',
				'Under <strong>Personal API keys</strong>, click <strong>Create key</strong>',
				'Give the key a label (e.g. <code>JAT</code>)',
				'Copy the key — it starts with <code>lin_api_</code>'
			]
		},
		sentry: {
			title: 'How to get a Sentry Auth Token',
			color: 25,
			steps: [
				'Go to <a href="https://sentry.io/settings/auth-tokens/" target="_blank" rel="noopener">sentry.io/settings/auth-tokens</a>',
				'Click <strong>Create New Token</strong>',
				'Select the required scopes (e.g. <code>project:read</code>, <code>org:read</code>)',
				'Click <strong>Create Token</strong> and copy it — it starts with <code>sntrys_</code>'
			]
		},
		turso: {
			title: 'How to get a Turso Auth Token',
			color: 175,
			steps: [
				'Install the Turso CLI: <code>curl -sSfL https://get.tur.so/install.sh | bash</code>',
				'Run <code>turso auth login</code> to authenticate',
				'Run <code>turso db tokens create &lt;db-name&gt;</code> for a database token',
				'Copy the JWT token'
			],
			note: 'You can also create tokens from the <a href="https://turso.tech/app" target="_blank" rel="noopener">Turso dashboard</a> under your database settings.'
		},
		upstash: {
			title: 'How to get an Upstash REST Token',
			color: 145,
			steps: [
				'Go to <a href="https://console.upstash.com" target="_blank" rel="noopener">console.upstash.com</a>',
				'Select your Redis database (or create one)',
				'Go to the <strong>REST API</strong> section',
				'Copy the <strong>UPSTASH_REDIS_REST_TOKEN</strong>'
			],
			note: 'Each database has its own REST URL and token. You\'ll need both for API access.'
		},
		neon: {
			title: 'How to get a Neon API Key',
			color: 145,
			steps: [
				'Go to <a href="https://console.neon.tech/app/settings/api-keys" target="_blank" rel="noopener">console.neon.tech → API Keys</a>',
				'Click <strong>Create new API key</strong>',
				'Copy the key immediately — it won\'t be shown again'
			],
			note: 'API keys give full access to your Neon account. For connection strings, use the project dashboard instead.'
		},
		pinecone: {
			title: 'How to get a Pinecone API Key',
			color: 200,
			steps: [
				'Go to <a href="https://app.pinecone.io" target="_blank" rel="noopener">app.pinecone.io</a>',
				'Navigate to <strong>API Keys</strong> in the left sidebar',
				'Copy the default key, or click <strong>Create API Key</strong> for a new one'
			]
		},
		resend: {
			title: 'How to get a Resend API Key',
			color: 200,
			steps: [
				'Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener">resend.com/api-keys</a>',
				'Click <strong>Create API Key</strong>',
				'Give the key a name, select permissions (<strong>Full access</strong> or <strong>Sending access</strong>)',
				'Copy the key — it starts with <code>re_</code>'
			],
			note: 'You must also verify a domain before sending emails. Add DNS records in <strong>Domains</strong> settings.'
		},
		twilio: {
			title: 'How to get a Twilio Auth Token',
			color: 25,
			steps: [
				'Go to <a href="https://console.twilio.com" target="_blank" rel="noopener">console.twilio.com</a>',
				'Your <strong>Auth Token</strong> is on the main dashboard under <strong>Account Info</strong>',
				'Click the eye icon to reveal it, then copy'
			],
			note: 'You\'ll also need your <strong>Account SID</strong> (shown above the Auth Token) for most API calls.'
		}
	};
</script>

<div class="credentials-editor">
	<div class="section-header">
		<h2>Secret Vault</h2>
		<p class="section-description">
			Global API keys for AI providers and services. Integration-specific secrets are managed through their source configurations.
		</p>
	</div>

	{#if isLoading}
		<div class="loading">
			<span class="loading-spinner"></span>
			Loading credentials...
		</div>
	{:else if error}
		<div class="error-banner">
			<span>{error}</span>
			<button class="btn btn-sm" onclick={() => fetchCredentials()}>Retry</button>
		</div>
	{:else if credentials}
		<!-- Provider Keys Section -->
		<div class="section-subheader">
			<h3>Provider Keys</h3>
			<p class="section-subdescription">API keys for AI providers and integration services</p>
		</div>

		<table class="vault-table">
			<thead>
				<tr>
					<th class="vt-name">Name</th>
					<th class="vt-env">Env Var</th>
					<th class="vt-value">Value</th>
					<th class="vt-date">Added</th>
					<th class="vt-status">Status</th>
					<th class="vt-actions"></th>
				</tr>
			</thead>
			<tbody>
				{#each providers as provider}
					{@const keyEntry = credentials.apiKeys[provider.id]}
					<tr class:is-set={keyEntry?.isSet}>
						<td class="vt-name">
							<span class="vt-name-text">{provider.name}</span>
							<span class="vt-desc-text">{provider.description}</span>
							<div class="vt-used-by">
								{#each provider.usedBy as feature}
									<span class="used-by-badge">{feature}</span>
								{/each}
							</div>
						</td>
						<td class="vt-env">
							<code class="vt-env-badge">${provider.envVar}</code>
						</td>
						<td class="vt-value">
							{#if keyEntry?.isSet}
								<code class="vt-masked">{keyEntry.masked}</code>
							{:else}
								<span class="vt-not-set">--</span>
							{/if}
						</td>
						<td class="vt-date">
							{#if keyEntry?.isSet && keyEntry.addedAt}
								<span class="vt-date-text">{formatDate(keyEntry.addedAt)}</span>
							{/if}
						</td>
						<td class="vt-status">
							{#if keyEntry?.isSet}
								<span class="vt-badge vt-badge-configured">Configured</span>
								{#if keyEntry.lastVerified}
									<span class="vt-verified-text">Verified {formatDate(keyEntry.lastVerified)}</span>
								{:else if keyEntry.verificationError}
									<span class="vt-error-text" title={keyEntry.verificationError}>Verify failed</span>
								{/if}
							{:else}
								<span class="vt-badge vt-badge-missing">Not Set</span>
							{/if}
						</td>
						<td class="vt-actions">
							{#if keyEntry?.isSet}
								<button class="vt-action-btn" onclick={() => verifyExistingKey(provider.id)} disabled={verifyingProvider === provider.id} title="Verify">
									{#if verifyingProvider === provider.id}
										<span class="loading-spinner small"></span>
									{:else}
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									{/if}
								</button>
								<button class="vt-action-btn" onclick={() => openEditModal(provider.id)} title="Edit">
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
								</button>
								<button class="vt-action-btn vt-action-danger" onclick={() => openDeleteConfirm(provider.id)} title="Delete">
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
								</button>
							{:else}
								<button class="btn btn-xs btn-primary" onclick={() => openEditModal(provider.id)}>Add</button>
								<a href={provider.docsUrl} target="_blank" rel="noopener noreferrer" class="vt-docs-link" title="Get API Key">
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
								</a>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<!-- Edit Modal -->
{#if editingProvider && editingProviderInfo}
	<div class="modal-overlay" onclick={closeEditModal} transition:fade={{ duration: 150 }}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{credentials?.apiKeys[editingProvider]?.isSet ? 'Update' : 'Add'} {editingProviderInfo.name} API Key</h3>
				<button class="btn btn-ghost btn-sm btn-circle" onclick={closeEditModal}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<p class="modal-description">{editingProviderInfo.description}</p>

				<div class="form-group">
					<label for="api-key">API Key</label>
					<input
						type="password"
						id="api-key"
						class="input input-bordered w-full"
						placeholder={`${editingProviderInfo.keyPrefix}...`}
						bind:value={editingKey}
						onkeydown={(e) => e.key === 'Enter' && saveApiKey()}
					/>
					<p class="form-hint">
						Get your API key from
						<a href={editingProviderInfo.docsUrl} target="_blank" rel="noopener noreferrer">
							{editingProviderInfo.docsUrl.replace('https://', '')}
						</a>
					</p>
				</div>

				{#if PROVIDER_INSTRUCTIONS[editingProvider!]}{@const instructions = PROVIDER_INSTRUCTIONS[editingProvider!]}
					<details
						class="provider-instructions rounded-lg"
						style="background: oklch(0.20 0.04 {instructions.color} / 0.3); border: 1px solid oklch(0.30 0.04 {instructions.color});"
					>
						<summary class="cursor-pointer px-3 py-2.5 font-mono text-[11px] font-semibold select-none" style="color: oklch(0.70 0.10 {instructions.color});">
							{instructions.title}
						</summary>
						<div class="px-3 pb-3 space-y-2">
							<ol class="font-mono text-[10px] space-y-1.5 list-decimal list-inside" style="color: oklch(0.60 0.02 250);">
								{#each instructions.steps as step}
									<li>{@html step}</li>
								{/each}
							</ol>
							{#if instructions.note}
								<div
									class="px-2.5 py-2 rounded mt-2"
									style="background: oklch(0.18 0.02 250); border: 1px solid oklch(0.25 0.02 250);"
								>
									<p class="font-mono text-[10px]" style="color: oklch(0.55 0.02 250);">
										{@html instructions.note}
									</p>
								</div>
							{/if}
						</div>
					</details>
				{/if}

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={verifyOnSave} />
						<span>Verify key before saving</span>
					</label>
				</div>

				{#if editingError}
					<div class="error-message">{editingError}</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn btn-ghost" onclick={closeEditModal}>Cancel</button>
				<button
					class="btn btn-primary"
					onclick={saveApiKey}
					disabled={isSaving || !editingKey.trim()}
				>
					{#if isSaving}
						<span class="loading-spinner small"></span>
						{verifyOnSave ? 'Verifying...' : 'Saving...'}
					{:else}
						Save
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deletingProvider}
	{@const providerInfo = getProviderInfo(deletingProvider)}
	<div class="modal-overlay" onclick={closeDeleteConfirm} transition:fade={{ duration: 150 }}>
		<div class="modal-content modal-sm" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Delete API Key</h3>
			</div>

			<div class="modal-body">
				<p>
					Are you sure you want to delete the <strong>{providerInfo?.name}</strong> API key?
					Features that use this key will stop working.
				</p>
			</div>

			<div class="modal-footer">
				<button class="btn btn-ghost" onclick={closeDeleteConfirm}>Cancel</button>
				<button
					class="btn btn-error"
					onclick={deleteApiKey}
					disabled={isDeleting}
				>
					{#if isDeleting}
						<span class="loading-spinner small"></span>
						Deleting...
					{:else}
						Delete
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.credentials-editor {
		padding: 1rem;
	}

	.section-header {
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		margin: 0 0 0.5rem 0;
	}

	.section-description {
		font-size: 0.875rem;
		color: oklch(0.60 0.02 250);
		margin: 0;
	}

	.section-description code {
		background: oklch(0.20 0.02 250);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	.section-subheader {
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.section-subheader h3 {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		margin: 0 0 0.25rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-subheader h3::before {
		content: '';
		display: inline-block;
		width: 3px;
		height: 1rem;
		background: oklch(0.55 0.15 200);
		border-radius: 2px;
	}

	.section-subdescription {
		font-size: 0.8125rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
		padding-left: 0.875rem;
	}

	.section-subdescription code {
		background: oklch(0.20 0.02 250);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem;
		color: oklch(0.60 0.02 250);
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid oklch(0.30 0.02 250);
		border-top-color: oklch(0.70 0.15 200);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-spinner.small {
		width: 14px;
		height: 14px;
		border-width: 1.5px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: oklch(0.25 0.08 30);
		border: 1px solid oklch(0.40 0.12 30);
		border-radius: 8px;
		color: oklch(0.85 0.10 30);
	}

	/* Vault Table */
	.vault-table {
		width: 100%;
		border-collapse: collapse;
		border-top: 1px solid oklch(0.22 0.02 250);
		margin-bottom: 1rem;
	}

	.vault-table thead tr {
		background: oklch(0.13 0.01 250);
	}

	.vault-table th {
		padding: 0.3rem 0.6rem;
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(0.50 0.02 250);
		text-align: left;
		border-bottom: 1px solid oklch(0.20 0.01 250);
	}

	.vault-table td {
		padding: 0.4rem 0.6rem;
		font-size: 0.75rem;
		color: oklch(0.80 0.02 250);
		vertical-align: middle;
		background: oklch(0.14 0.01 250);
	}

	.vault-table tbody tr {
		border-bottom: 1px solid oklch(0.18 0.01 250);
		transition: background 0.1s ease;
	}

	.vault-table tbody tr:last-child {
		border-bottom: none;
	}

	.vault-table tbody tr:hover {
		background: oklch(0.16 0.01 250);
	}

	.vault-table tbody tr:hover td {
		background: transparent;
	}

	.vault-table tbody tr.is-set td {
		background: oklch(0.15 0.01 145 / 0.06);
	}

	.vault-table tbody tr.is-set:hover td {
		background: transparent;
	}

	/* Table column widths (provider keys - 6 columns) */
	th.vt-name, td.vt-name { width: 22%; }
	th.vt-env, td.vt-env { width: 18%; }
	th.vt-value, td.vt-value { width: 20%; }
	th.vt-date, td.vt-date { width: 12%; }
	th.vt-status, td.vt-status { width: 14%; }
	th.vt-actions, td.vt-actions {
		width: 14%;
		text-align: right !important;
		white-space: nowrap;
	}

	td.vt-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.2rem;
	}

	/* Cell content styles */
	.vt-name-text {
		font-weight: 500;
		color: oklch(0.85 0.02 250);
		display: block;
		font-size: 0.75rem;
	}

	.vt-desc-text {
		font-size: 0.6rem;
		color: oklch(0.45 0.02 250);
		display: block;
		line-height: 1.3;
	}

	.vt-used-by {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.2rem;
	}

	.used-by-badge {
		font-size: 0.6rem;
		padding: 0.05rem 0.35rem;
		background: oklch(0.22 0.04 200);
		color: oklch(0.70 0.08 200);
		border-radius: 9999px;
		font-weight: 500;
		white-space: nowrap;
	}

	.vt-masked {
		font-size: 0.65rem;
		padding: 0.15rem 0.35rem;
		background: oklch(0.12 0.01 250);
		border-radius: 0.2rem;
		color: oklch(0.70 0.08 145);
		font-family: ui-monospace, monospace;
	}

	.vt-not-set {
		font-size: 0.65rem;
		color: oklch(0.35 0.02 250);
	}

	.vt-date-text {
		font-size: 0.6rem;
		color: oklch(0.45 0.02 250);
	}

	.vt-env-badge {
		font-size: 0.6rem;
		padding: 0.05rem 0.25rem;
		background: oklch(0.20 0.03 200 / 0.25);
		border-radius: 0.15rem;
		color: oklch(0.65 0.08 200);
		font-family: ui-monospace, monospace;
		font-weight: 500;
		display: inline-block;
		margin-top: 0.15rem;
	}

	/* Status badges */
	.vt-badge {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		border-radius: 0.25rem;
		white-space: nowrap;
	}

	.vt-badge-configured {
		background: oklch(0.30 0.08 145 / 0.3);
		color: oklch(0.70 0.15 145);
	}

	.vt-badge-missing {
		background: oklch(0.25 0.02 250 / 0.3);
		color: oklch(0.45 0.02 250);
	}

	.vt-verified-text {
		display: block;
		font-size: 0.55rem;
		color: oklch(0.55 0.08 145);
		margin-top: 0.1rem;
	}

	.vt-error-text {
		display: block;
		font-size: 0.55rem;
		color: oklch(0.65 0.12 30);
		margin-top: 0.1rem;
		cursor: help;
	}

	/* Action buttons */
	.vt-action-btn {
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

	.vt-action-btn:hover {
		background: oklch(0.22 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.vt-action-danger:hover {
		background: oklch(0.25 0.08 25 / 0.3);
		color: oklch(0.70 0.15 25);
	}

	.vt-docs-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		color: oklch(0.55 0.02 250);
		transition: color 0.1s ease;
	}

	.vt-docs-link:hover {
		color: oklch(0.70 0.12 200);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
	}

	.btn-sm {
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
	}

	.btn-primary {
		background: oklch(0.55 0.15 200);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: oklch(0.60 0.15 200);
	}

	.btn-ghost {
		background: transparent;
		color: oklch(0.70 0.02 250);
	}

	.btn-ghost:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
	}

	.btn-error {
		color: oklch(0.80 0.15 30);
	}

	.btn-error:hover:not(:disabled) {
		background: oklch(0.30 0.10 30);
	}

	.btn-circle {
		padding: 0.375rem;
		border-radius: 50%;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.icon {
		width: 16px;
		height: 16px;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 1rem;
	}

	.modal-content {
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 12px;
		width: 100%;
		max-width: 480px;
		box-shadow: 0 20px 40px oklch(0 0 0 / 0.3);
	}

	.modal-sm {
		max-width: 360px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.modal-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		margin: 0;
	}

	.modal-body {
		padding: 1.25rem;
	}

	.modal-description {
		font-size: 0.875rem;
		color: oklch(0.65 0.02 250);
		margin: 0 0 1rem 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.75 0.02 250);
		margin-bottom: 0.375rem;
	}

	.input {
		width: 100%;
		padding: 0.625rem 0.75rem;
		background: oklch(0.12 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 6px;
		color: oklch(0.90 0.02 250);
		font-size: 0.875rem;
		font-family: ui-monospace, monospace;
	}

	.input:focus {
		outline: none;
		border-color: oklch(0.55 0.15 200);
	}

	.form-hint {
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		margin-top: 0.375rem;
	}

	.form-hint a {
		color: oklch(0.70 0.12 200);
		text-decoration: none;
	}

	.form-hint a:hover {
		text-decoration: underline;
	}

	.checkbox-group {
		margin-bottom: 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-label input {
		width: 16px;
		height: 16px;
		accent-color: oklch(0.55 0.15 200);
	}

	.checkbox-label span {
		font-size: 0.8125rem;
		color: oklch(0.70 0.02 250);
	}

	.error-message {
		padding: 0.625rem 0.75rem;
		background: oklch(0.25 0.08 30);
		border: 1px solid oklch(0.40 0.12 30);
		border-radius: 6px;
		color: oklch(0.85 0.10 30);
		font-size: 0.8125rem;
		margin-top: 1rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	/* Provider instructions */
	.provider-instructions {
		margin-bottom: 1rem;
	}

	.provider-instructions :global(a) {
		text-decoration: underline;
	}

	.provider-instructions :global(strong) {
		color: oklch(0.75 0.02 250);
	}

	.provider-instructions :global(code) {
		color: oklch(0.65 0.02 250);
	}

</style>
