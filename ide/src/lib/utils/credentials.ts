/**
 * Credentials Management Utility
 *
 * Handles secure storage and retrieval of API keys and service credentials.
 * Storage location: ~/.config/jat/credentials.json
 *
 * Security:
 * - File created with 0600 permissions (user read/write only)
 * - Keys are masked when returned to browser (sk-ant-...7x4k)
 * - Full keys only used server-side
 *
 * Fallback chain for API keys:
 * 1. ~/.config/jat/credentials.json (preferred)
 * 2. ide/.env file
 * 3. Environment variables
 */

import { readFileSync, writeFileSync, existsSync, chmodSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

// Types
export interface ApiKeyEntry {
	key: string;
	addedAt: string;
	lastVerified?: string;
	verificationError?: string;
}

export interface MaskedApiKeyEntry {
	masked: string;
	addedAt: string;
	lastVerified?: string;
	verificationError?: string;
	isSet: boolean;
}

export interface CodingAgentConfig {
	model?: string;
	flags?: string;
	[key: string]: string | undefined;
}

// Per-project secrets (database URLs, service keys, etc.)
export interface ProjectSecretEntry {
	value: string;
	addedAt: string;
	description?: string;
}

export interface ProjectSecrets {
	// Supabase
	supabase_url?: ProjectSecretEntry;
	supabase_anon_key?: ProjectSecretEntry;
	supabase_service_role_key?: ProjectSecretEntry;
	// Database
	database_url?: ProjectSecretEntry;
	// Generic key-value for other services
	[key: string]: ProjectSecretEntry | undefined;
}

export interface MaskedProjectSecrets {
	supabase_url?: { masked: string; addedAt: string; isSet: boolean };
	supabase_anon_key?: { masked: string; addedAt: string; isSet: boolean };
	supabase_service_role_key?: { masked: string; addedAt: string; isSet: boolean };
	database_url?: { masked: string; addedAt: string; isSet: boolean };
	[key: string]: { masked: string; addedAt: string; isSet: boolean } | undefined;
}

// Custom user-defined API key
export interface CustomApiKey {
	value: string;
	envVar: string;
	description?: string;
	addedAt: string;
}

export interface Credentials {
	apiKeys: {
		anthropic?: ApiKeyEntry;
		google?: ApiKeyEntry;
		openai?: ApiKeyEntry;
		[key: string]: ApiKeyEntry | undefined;
	};
	// User-defined custom API keys
	customApiKeys?: {
		[name: string]: CustomApiKey;
	};
	codingAgents?: {
		default?: string;
		installed?: string[];
		configs?: {
			[agent: string]: CodingAgentConfig;
		};
	};
	// Per-project secrets
	projectSecrets?: {
		[projectKey: string]: ProjectSecrets;
	};
}

export interface MaskedCredentials {
	apiKeys: {
		anthropic?: MaskedApiKeyEntry;
		google?: MaskedApiKeyEntry;
		openai?: MaskedApiKeyEntry;
		[key: string]: MaskedApiKeyEntry | undefined;
	};
	codingAgents?: Credentials['codingAgents'];
	projectSecrets?: {
		[projectKey: string]: MaskedProjectSecrets;
	};
}

// Provider metadata
export interface ApiKeyProvider {
	id: string;
	name: string;
	description: string;
	keyPrefix: string;
	envVar: string;
	verifyUrl: string;
	usedBy: string[];
	docsUrl: string;
}

export const API_KEY_PROVIDERS: ApiKeyProvider[] = [
	// --- Secret Backend ---
	{
		id: '1password',
		name: '1Password',
		description: 'Service Account Token for 1Password vault integration. Enables jat-secret to read secrets from your 1Password JAT vault.',
		keyPrefix: 'ops_',
		envVar: 'OP_SERVICE_ACCOUNT_TOKEN',
		verifyUrl: '',
		usedBy: ['jat-secret fallback', '1Password vault access', 'Agent credential retrieval'],
		docsUrl: 'https://developer.1password.com/docs/service-accounts/'
	},

	// --- AI Providers ---
	{
		id: 'anthropic',
		name: 'Anthropic',
		description: 'Claude API for task suggestions and AI features',
		keyPrefix: 'sk-ant-',
		envVar: 'ANTHROPIC_API_KEY',
		verifyUrl: 'https://api.anthropic.com/v1/messages',
		usedBy: ['Task suggestions', 'Usage metrics', 'AI completions'],
		docsUrl: 'https://console.anthropic.com/settings/keys'
	},
	{
		id: 'google',
		name: 'Google / Gemini',
		description: 'Gemini API for image generation and editing',
		keyPrefix: 'AIza',
		envVar: 'GEMINI_API_KEY',
		verifyUrl: 'https://generativelanguage.googleapis.com/v1/models',
		usedBy: ['gemini-edit', 'gemini-image', 'Avatar generation'],
		docsUrl: 'https://aistudio.google.com/app/apikey'
	},
	{
		id: 'openai',
		name: 'OpenAI',
		description: 'OpenAI API for future Codex integration',
		keyPrefix: 'sk-',
		envVar: 'OPENAI_API_KEY',
		verifyUrl: 'https://api.openai.com/v1/models',
		usedBy: ['Codex integration (future)'],
		docsUrl: 'https://platform.openai.com/api-keys'
	},
	{
		id: 'openrouter',
		name: 'OpenRouter',
		description: 'OpenRouter API for accessing 200+ models from various providers',
		keyPrefix: 'sk-or-',
		envVar: 'OPENROUTER_API_KEY',
		verifyUrl: 'https://openrouter.ai/api/v1/auth/key',
		usedBy: ['Dynamic model discovery', 'Multi-provider access'],
		docsUrl: 'https://openrouter.ai/settings/keys'
	},

	// --- Chat / Messaging ---
	{
		id: 'slack',
		name: 'Slack',
		description: 'Slack Bot Token for workspace integrations',
		keyPrefix: 'xoxb-',
		envVar: 'SLACK_BOT_TOKEN',
		verifyUrl: 'https://slack.com/api/auth.test',
		usedBy: ['Ingest daemon', 'Slack integrations'],
		docsUrl: 'https://api.slack.com/apps'
	},
	{
		id: 'telegram',
		name: 'Telegram',
		description: 'Telegram Bot Token for chat integrations',
		keyPrefix: '',
		envVar: 'TELEGRAM_BOT_TOKEN',
		verifyUrl: 'https://api.telegram.org/bot{key}/getMe',
		usedBy: ['Ingest daemon', 'Telegram integrations'],
		docsUrl: 'https://core.telegram.org/bots'
	},
	{
		id: 'discord',
		name: 'Discord',
		description: 'Discord Bot Token for server integrations',
		keyPrefix: '',
		envVar: 'DISCORD_BOT_TOKEN',
		verifyUrl: 'https://discord.com/api/v10/users/@me',
		usedBy: ['Discord integrations'],
		docsUrl: 'https://discord.com/developers/applications'
	},
	{
		id: 'gmail',
		name: 'Gmail',
		description: 'Gmail App Password for email ingestion via IMAP',
		keyPrefix: '',
		envVar: 'GMAIL_APP_PASSWORD',
		verifyUrl: '',
		usedBy: ['Ingest daemon', 'Gmail integrations'],
		docsUrl: 'https://support.google.com/accounts/answer/185833'
	},

	// --- Infrastructure / Deploy ---
	{
		id: 'cloudflare',
		name: 'Cloudflare',
		description: 'Cloudflare API Token for Workers, Pages, and DNS',
		keyPrefix: '',
		envVar: 'CLOUDFLARE_API_TOKEN',
		verifyUrl: 'https://api.cloudflare.com/client/v4/user/tokens/verify',
		usedBy: ['Cloudflare Workers', 'DNS management'],
		docsUrl: 'https://dash.cloudflare.com/profile/api-tokens'
	},
	{
		id: 'vercel',
		name: 'Vercel',
		description: 'Vercel Token for deployments and project management',
		keyPrefix: '',
		envVar: 'VERCEL_TOKEN',
		verifyUrl: 'https://api.vercel.com/v2/user',
		usedBy: ['Vercel deployments'],
		docsUrl: 'https://vercel.com/account/tokens'
	},
	{
		id: 'fly',
		name: 'Fly.io',
		description: 'Fly.io API Token for app deployments',
		keyPrefix: 'fo1_',
		envVar: 'FLY_API_TOKEN',
		verifyUrl: 'https://api.machines.dev/v1/apps',
		usedBy: ['Fly.io deployments'],
		docsUrl: 'https://fly.io/docs/flyctl/tokens/'
	},
	{
		id: 'convex',
		name: 'Convex',
		description: 'Convex Deploy Key for backend deployments',
		keyPrefix: '',
		envVar: 'CONVEX_DEPLOY_KEY',
		verifyUrl: '',
		usedBy: ['Convex deployments'],
		docsUrl: 'https://docs.convex.dev/production/project-configuration'
	},

	// --- Developer Services ---
	{
		id: 'github',
		name: 'GitHub',
		description: 'GitHub Personal Access Token for API access',
		keyPrefix: 'ghp_ or github_pat_',
		envVar: 'GITHUB_TOKEN',
		verifyUrl: 'https://api.github.com/user',
		usedBy: ['GitHub API', 'Repository access'],
		docsUrl: 'https://github.com/settings/tokens'
	},
	{
		id: 'linear',
		name: 'Linear',
		description: 'Linear API Key for project management integration',
		keyPrefix: 'lin_api_',
		envVar: 'LINEAR_API_KEY',
		verifyUrl: 'https://api.linear.app/graphql',
		usedBy: ['Linear integration'],
		docsUrl: 'https://linear.app/settings/api'
	},
	{
		id: 'sentry',
		name: 'Sentry',
		description: 'Sentry Auth Token for error tracking',
		keyPrefix: 'sntrys_',
		envVar: 'SENTRY_AUTH_TOKEN',
		verifyUrl: 'https://sentry.io/api/0/',
		usedBy: ['Sentry error tracking'],
		docsUrl: 'https://sentry.io/settings/auth-tokens/'
	},

	// --- Database / Data ---
	{
		id: 'turso',
		name: 'Turso',
		description: 'Turso Auth Token for LibSQL database access',
		keyPrefix: '',
		envVar: 'TURSO_AUTH_TOKEN',
		verifyUrl: '',
		usedBy: ['Turso database'],
		docsUrl: 'https://turso.tech/app'
	},
	{
		id: 'upstash',
		name: 'Upstash',
		description: 'Upstash REST Token for Redis and Kafka',
		keyPrefix: '',
		envVar: 'UPSTASH_REST_TOKEN',
		verifyUrl: '',
		usedBy: ['Upstash Redis/Kafka'],
		docsUrl: 'https://console.upstash.com'
	},
	{
		id: 'neon',
		name: 'Neon',
		description: 'Neon API Key for serverless Postgres management',
		keyPrefix: '',
		envVar: 'NEON_API_KEY',
		verifyUrl: 'https://console.neon.tech/api/v2/projects',
		usedBy: ['Neon Postgres'],
		docsUrl: 'https://neon.tech/docs/manage/api-keys'
	},
	{
		id: 'pinecone',
		name: 'Pinecone',
		description: 'Pinecone API Key for vector database',
		keyPrefix: '',
		envVar: 'PINECONE_API_KEY',
		verifyUrl: '',
		usedBy: ['Pinecone vector DB'],
		docsUrl: 'https://app.pinecone.io'
	},

	// --- Communications ---
	{
		id: 'resend',
		name: 'Resend',
		description: 'Resend API Key for transactional email',
		keyPrefix: 're_',
		envVar: 'RESEND_API_KEY',
		verifyUrl: 'https://api.resend.com/api-keys',
		usedBy: ['Transactional email'],
		docsUrl: 'https://resend.com/api-keys'
	},
	{
		id: 'twilio',
		name: 'Twilio',
		description: 'Twilio Auth Token for SMS and voice',
		keyPrefix: '',
		envVar: 'TWILIO_AUTH_TOKEN',
		verifyUrl: '',
		usedBy: ['Twilio SMS/voice'],
		docsUrl: 'https://console.twilio.com'
	}
];

// Paths
const CONFIG_DIR = join(homedir(), '.config', 'jat');
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json');

/**
 * Ensure config directory exists
 */
function ensureConfigDir(): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
	}
}

/**
 * Read credentials from file
 */
export function getCredentials(): Credentials {
	ensureConfigDir();

	if (!existsSync(CREDENTIALS_FILE)) {
		return { apiKeys: {} };
	}

	try {
		const content = readFileSync(CREDENTIALS_FILE, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		console.error('Error reading credentials file:', error);
		return { apiKeys: {} };
	}
}

/**
 * Write credentials to file with secure permissions
 */
export function saveCredentials(credentials: Credentials): void {
	ensureConfigDir();

	writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), {
		encoding: 'utf-8',
		mode: 0o600
	});

	// Ensure permissions are correct (in case file already existed)
	chmodSync(CREDENTIALS_FILE, 0o600);
}

/**
 * Mask an API key for display (show first 7 and last 4 chars)
 * Example: sk-ant-api03-abc...xyz9
 */
export function maskApiKey(key: string): string {
	if (!key || key.length < 12) {
		return '****';
	}

	const prefix = key.slice(0, 10);
	const suffix = key.slice(-4);
	return `${prefix}...${suffix}`;
}

/**
 * Mask a secret value for display
 * For URLs: show protocol and host, mask the rest
 * For keys: show first 8 and last 4 chars
 */
export function maskSecret(value: string): string {
	if (!value || value.length < 8) {
		return '****';
	}

	// Check if it's a URL (database URL, Supabase URL, etc.)
	try {
		const url = new URL(value);
		// Mask password in URL if present
		if (url.password) {
			return `${url.protocol}//${url.username}:****@${url.host}${url.pathname ? '/...' : ''}`;
		}
		// Show host for URLs without auth
		return `${url.protocol}//${url.host}${url.pathname ? '/...' : ''}`;
	} catch {
		// Not a URL, mask like a key
		const prefix = value.slice(0, 8);
		const suffix = value.slice(-4);
		return `${prefix}...${suffix}`;
	}
}

/**
 * Get credentials with masked API keys (safe to send to browser)
 */
export function getMaskedCredentials(): MaskedCredentials {
	const creds = getCredentials();

	const maskedApiKeys: MaskedCredentials['apiKeys'] = {};

	for (const [provider, entry] of Object.entries(creds.apiKeys)) {
		if (entry) {
			maskedApiKeys[provider] = {
				masked: maskApiKey(entry.key),
				addedAt: entry.addedAt,
				lastVerified: entry.lastVerified,
				verificationError: entry.verificationError,
				isSet: true
			};
		}
	}

	// Add placeholders for known providers that aren't set
	for (const provider of API_KEY_PROVIDERS) {
		if (!maskedApiKeys[provider.id]) {
			maskedApiKeys[provider.id] = {
				masked: '',
				addedAt: '',
				isSet: false
			};
		}
	}

	// Mask project secrets
	const maskedProjectSecrets: MaskedCredentials['projectSecrets'] = {};
	if (creds.projectSecrets) {
		for (const [projectKey, secrets] of Object.entries(creds.projectSecrets)) {
			maskedProjectSecrets[projectKey] = {};
			for (const [secretKey, entry] of Object.entries(secrets)) {
				if (entry) {
					maskedProjectSecrets[projectKey][secretKey] = {
						masked: maskSecret(entry.value),
						addedAt: entry.addedAt,
						isSet: true
					};
				}
			}
		}
	}

	return {
		apiKeys: maskedApiKeys,
		codingAgents: creds.codingAgents,
		projectSecrets: maskedProjectSecrets
	};
}

/**
 * Set an API key for a provider
 */
export function setApiKey(provider: string, key: string): void {
	const creds = getCredentials();

	creds.apiKeys[provider] = {
		key: key.trim(),
		addedAt: new Date().toISOString()
	};

	saveCredentials(creds);
}

/**
 * Delete an API key
 */
export function deleteApiKey(provider: string): void {
	const creds = getCredentials();
	delete creds.apiKeys[provider];
	saveCredentials(creds);
}

/**
 * Get a specific API key (full, unmasked - for server-side use only)
 */
export function getApiKey(provider: string): string | undefined {
	const creds = getCredentials();
	return creds.apiKeys[provider]?.key;
}

/**
 * Update verification status for a key
 */
export function updateKeyVerification(
	provider: string,
	success: boolean,
	error?: string
): void {
	const creds = getCredentials();

	if (creds.apiKeys[provider]) {
		if (success) {
			creds.apiKeys[provider]!.lastVerified = new Date().toISOString();
			delete creds.apiKeys[provider]!.verificationError;
		} else {
			creds.apiKeys[provider]!.verificationError = error || 'Verification failed';
		}
		saveCredentials(creds);
	}
}

/**
 * Get API key with fallback chain:
 * 1. credentials.json (built-in apiKeys)
 * 2. Custom API keys (by provider name or env var match)
 * 3. Environment variable
 *
 * @param provider - Provider ID (anthropic, google, openai, openrouter)
 * @param envVarName - Environment variable name to check
 */
export function getApiKeyWithFallback(provider: string, envVarName: string): string | undefined {
	// 1. Built-in apiKeys in credentials.json
	const credKey = getApiKey(provider);
	if (credKey) {
		return credKey;
	}

	// 2. Custom API keys — match by name or envVar
	const creds = getCredentials();
	if (creds.customApiKeys) {
		// Direct name match (e.g., customApiKeys.openrouter)
		if (creds.customApiKeys[provider]?.value) {
			return creds.customApiKeys[provider].value;
		}
		// Search by envVar match (e.g., custom key with envVar: "OPENROUTER_API_KEY")
		for (const entry of Object.values(creds.customApiKeys)) {
			if (entry.envVar === envVarName && entry.value) {
				return entry.value;
			}
		}
	}

	// 3. Environment variable
	return process.env[envVarName];
}

/**
 * Verify an Anthropic API key
 */
export async function verifyAnthropicKey(key: string): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': key,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-haiku-4-5',
				max_tokens: 1,
				messages: [{ role: 'user', content: 'Hi' }]
			})
		});

		if (response.ok || response.status === 400) {
			// 400 is OK - means key is valid but request might be malformed
			// We just want to verify the key works
			return { success: true };
		}

		if (response.status === 401) {
			return { success: false, error: 'Invalid API key' };
		}

		if (response.status === 403) {
			return { success: false, error: 'API key does not have required permissions' };
		}

		const errorText = await response.text();
		return { success: false, error: `API error: ${response.status} - ${errorText.slice(0, 100)}` };
	} catch (error) {
		return { success: false, error: `Connection error: ${(error as Error).message}` };
	}
}

/**
 * Verify a Google/Gemini API key
 */
export async function verifyGoogleKey(key: string): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`
		);

		if (response.ok) {
			return { success: true };
		}

		if (response.status === 400 || response.status === 403) {
			return { success: false, error: 'Invalid API key' };
		}

		const errorText = await response.text();
		return { success: false, error: `API error: ${response.status} - ${errorText.slice(0, 100)}` };
	} catch (error) {
		return { success: false, error: `Connection error: ${(error as Error).message}` };
	}
}

/**
 * Verify an OpenAI API key
 */
export async function verifyOpenAIKey(key: string): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('https://api.openai.com/v1/models', {
			headers: {
				Authorization: `Bearer ${key}`
			}
		});

		if (response.ok) {
			return { success: true };
		}

		if (response.status === 401) {
			return { success: false, error: 'Invalid API key' };
		}

		const errorText = await response.text();
		return { success: false, error: `API error: ${response.status} - ${errorText.slice(0, 100)}` };
	} catch (error) {
		return { success: false, error: `Connection error: ${(error as Error).message}` };
	}
}

/**
 * Verify an OpenRouter API key
 */
export async function verifyOpenRouterKey(key: string): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
			headers: {
				'Authorization': `Bearer ${key}`
			}
		});

		if (response.ok) {
			return { success: true };
		}

		if (response.status === 401) {
			return { success: false, error: 'Invalid API key' };
		}

		const errorText = await response.text();
		return { success: false, error: `API error: ${response.status} - ${errorText.slice(0, 100)}` };
	} catch (error) {
		return { success: false, error: `Connection error: ${(error as Error).message}` };
	}
}

/**
 * Verify an API key for any provider
 */
export async function verifyApiKey(
	provider: string,
	key: string
): Promise<{ success: boolean; error?: string }> {
	switch (provider) {
		case 'anthropic':
			return verifyAnthropicKey(key);
		case 'google':
			return verifyGoogleKey(key);
		case 'openai':
			return verifyOpenAIKey(key);
		case 'openrouter':
			return verifyOpenRouterKey(key);
		default:
			return verifyGenericProvider(provider, key);
	}
}

/**
 * Generic verification for providers with a verifyUrl.
 * Sends a Bearer-token request to the verify URL and checks for 2xx response.
 * Providers without a verifyUrl skip verification and return success.
 */
async function verifyGenericProvider(
	provider: string,
	key: string
): Promise<{ success: boolean; error?: string }> {
	const providerInfo = API_KEY_PROVIDERS.find((p) => p.id === provider);
	if (!providerInfo) {
		return { success: true }; // Unknown provider, skip verification
	}

	if (!providerInfo.verifyUrl) {
		return { success: true }; // No verify URL, skip verification
	}

	try {
		let url = providerInfo.verifyUrl;
		const headers: Record<string, string> = {};

		// Handle special URL patterns
		if (url.includes('{key}')) {
			// Telegram-style: key embedded in URL
			url = url.replace('{key}', key);
		} else if (provider === 'slack') {
			// Slack uses Bearer token with form-encoded POST
			headers['Authorization'] = `Bearer ${key}`;
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		} else if (provider === 'linear') {
			// Linear uses Bearer token with GraphQL POST
			headers['Authorization'] = key;
			headers['Content-Type'] = 'application/json';
		} else {
			// Standard Bearer token
			headers['Authorization'] = `Bearer ${key}`;
		}

		const isPost = provider === 'slack';
		const res = await fetch(url, {
			method: isPost ? 'POST' : 'GET',
			headers
		});

		if (res.ok) {
			return { success: true };
		}

		// Try to extract error message from response
		try {
			const data = await res.json();
			const errMsg = data.error || data.message || data.errors?.[0]?.message;
			if (errMsg) {
				return { success: false, error: `Verification failed: ${errMsg}` };
			}
		} catch {
			// Ignore JSON parse errors
		}

		return { success: false, error: `Verification failed: HTTP ${res.status}` };
	} catch (err) {
		return {
			success: false,
			error: `Verification failed: ${err instanceof Error ? err.message : 'Connection error'}`
		};
	}
}

/**
 * Validate API key format
 */
export function validateKeyFormat(provider: string, key: string): { valid: boolean; error?: string } {
	const providerInfo = API_KEY_PROVIDERS.find((p) => p.id === provider);

	if (!providerInfo) {
		return { valid: true }; // Unknown provider, skip format check
	}

	if (!key || key.trim().length === 0) {
		return { valid: false, error: 'API key is required' };
	}

	const trimmedKey = key.trim();

	// Check prefix from provider metadata
	if (providerInfo.keyPrefix) {
		const prefixes = providerInfo.keyPrefix.split(' or ').map((p: string) => p.trim());
		const hasValidPrefix = prefixes.some((p: string) => trimmedKey.startsWith(p));
		if (!hasValidPrefix) {
			return { valid: false, error: `${providerInfo.name} keys should start with ${providerInfo.keyPrefix}` };
		}
	}

	// Check minimum length
	if (trimmedKey.length < 10) {
		return { valid: false, error: 'API key seems too short' };
	}

	return { valid: true };
}

// ============================================================================
// Custom API Keys Management
// ============================================================================

/**
 * Get all custom API keys (masked for browser)
 */
export function getCustomApiKeys(): {
	[name: string]: { masked: string; envVar: string; description?: string; addedAt: string; isSet: boolean };
} {
	const creds = getCredentials();
	const result: {
		[name: string]: { masked: string; envVar: string; description?: string; addedAt: string; isSet: boolean };
	} = {};

	if (creds.customApiKeys) {
		for (const [name, entry] of Object.entries(creds.customApiKeys)) {
			result[name] = {
				masked: maskApiKey(entry.value),
				envVar: entry.envVar,
				description: entry.description,
				addedAt: entry.addedAt,
				isSet: true
			};
		}
	}

	return result;
}

/**
 * Get a custom API key value (full, unmasked - server-side only)
 */
export function getCustomApiKey(name: string): string | undefined {
	const creds = getCredentials();
	return creds.customApiKeys?.[name]?.value;
}

/**
 * Get custom API key metadata
 */
export function getCustomApiKeyMeta(
	name: string
): { envVar: string; description?: string } | undefined {
	const creds = getCredentials();
	const entry = creds.customApiKeys?.[name];
	if (!entry) return undefined;
	return { envVar: entry.envVar, description: entry.description };
}

/**
 * Set a custom API key
 */
export function setCustomApiKey(
	name: string,
	value: string,
	envVar: string,
	description?: string
): void {
	const creds = getCredentials();

	if (!creds.customApiKeys) {
		creds.customApiKeys = {};
	}

	creds.customApiKeys[name] = {
		value: value.trim(),
		envVar: envVar.trim(),
		description: description?.trim(),
		addedAt: new Date().toISOString()
	};

	saveCredentials(creds);
}

/**
 * Delete a custom API key
 */
export function deleteCustomApiKey(name: string): void {
	const creds = getCredentials();

	if (creds.customApiKeys?.[name]) {
		delete creds.customApiKeys[name];

		// Clean up empty object
		if (Object.keys(creds.customApiKeys).length === 0) {
			delete creds.customApiKeys;
		}

		saveCredentials(creds);
	}
}

/**
 * Get all custom API keys as environment variables (for shell scripts)
 * Returns a string of export statements
 */
export function getCustomApiKeysAsExports(): string {
	const creds = getCredentials();
	const exports: string[] = [];

	if (creds.customApiKeys) {
		for (const [, entry] of Object.entries(creds.customApiKeys)) {
			// Escape single quotes in value
			const escapedValue = entry.value.replace(/'/g, "'\\''");
			exports.push(`export ${entry.envVar}='${escapedValue}'`);
		}
	}

	return exports.join('\n');
}

/**
 * Validate custom API key name (for creating new keys)
 */
export function validateCustomKeyName(name: string): { valid: boolean; error?: string } {
	if (!name || name.trim().length === 0) {
		return { valid: false, error: 'Name is required' };
	}

	const trimmed = name.trim();

	// Check length
	if (trimmed.length < 2) {
		return { valid: false, error: 'Name must be at least 2 characters' };
	}

	if (trimmed.length > 64) {
		return { valid: false, error: 'Name must be 64 characters or less' };
	}

	// Check format (alphanumeric, hyphens, underscores)
	if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(trimmed)) {
		return { valid: false, error: 'Name must start with a letter and contain only letters, numbers, hyphens, and underscores' };
	}

	// Check for reserved names (built-in providers)
	const reserved = new Set(API_KEY_PROVIDERS.map((p) => p.id));
	if (reserved.has(trimmed.toLowerCase())) {
		return { valid: false, error: 'This name is reserved for built-in providers' };
	}

	return { valid: true };
}

/**
 * Validate environment variable name
 */
export function validateEnvVarName(name: string): { valid: boolean; error?: string } {
	if (!name || name.trim().length === 0) {
		return { valid: false, error: 'Environment variable name is required' };
	}

	const trimmed = name.trim();

	// Check format (uppercase, underscores, must start with letter)
	if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
		return { valid: false, error: 'Must be uppercase with underscores only, starting with a letter (e.g., MY_API_KEY)' };
	}

	// Check length
	if (trimmed.length < 2) {
		return { valid: false, error: 'Must be at least 2 characters' };
	}

	if (trimmed.length > 128) {
		return { valid: false, error: 'Must be 128 characters or less' };
	}

	return { valid: true };
}

// ============================================================================
// Project Secrets Management
// ============================================================================

/**
 * Project secret type metadata
 */
export interface ProjectSecretType {
	id: string;
	name: string;
	description: string;
	placeholder: string;
	isUrl?: boolean;
	envVarName?: string; // For fallback
	integration?: string; // Which integration section this belongs to
}

/**
 * Integration section definition for grouping secrets in the UI
 */
export interface IntegrationSection {
	id: string;
	name: string;
	description: string;
	icon: string; // SVG path data
	iconViewBox?: string;
	color: string; // oklch accent color
}

export const INTEGRATION_SECTIONS: IntegrationSection[] = [
	{
		id: 'supabase',
		name: 'Supabase',
		description: 'Database, auth, and storage',
		icon: 'M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z',
		color: 'oklch(0.65 0.18 155)'
	},
	{
		id: 'cloudflare',
		name: 'Cloudflare',
		description: 'CDN, DNS, Workers, and Pages',
		icon: 'M16.309 6.282c-.163 0-.323.013-.48.04l-.248-.605a5.36 5.36 0 0 0-5.076-3.588A5.37 5.37 0 0 0 5.4 6.169l-.173-.037a4.3 4.3 0 0 0-4.96 3.353 4.3 4.3 0 0 0 3.052 5.227l13.07.012a3.004 3.004 0 0 0 2.924-3.07 3.004 3.004 0 0 0-3.004-2.94zm3.99 1.3l-1.086.452c-.154-.83-.625-1.569-1.313-2.06l.524-.96a.11.11 0 0 0-.045-.148.11.11 0 0 0-.055-.015h-.002a.11.11 0 0 0-.093.054l-.516.944a3.55 3.55 0 0 0-2.404-.413l-.29-.71a.11.11 0 0 0-.144-.06.11.11 0 0 0-.06.06l-.29.71a3.53 3.53 0 0 0-2.404.413',
		color: 'oklch(0.70 0.15 55)'
	},
	{
		id: 'database',
		name: 'Database',
		description: 'Direct database connections',
		icon: 'M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2zM4 6.5C4 5.12 7.58 4 12 4s8 1.12 8 2.5S16.42 9 12 9 4 7.88 4 6.5zM20 17.5c0 1.38-3.58 2.5-8 2.5s-8-1.12-8-2.5v-3.04c1.78 1 4.74 1.54 8 1.54s6.22-.54 8-1.54v3.04zm0-5.5c0 1.38-3.58 2.5-8 2.5s-8-1.12-8-2.5V8.96c1.78 1 4.74 1.54 8 1.54s6.22-.54 8-1.54V12z',
		color: 'oklch(0.65 0.15 200)'
	}
];

export const PROJECT_SECRET_TYPES: ProjectSecretType[] = [
	{
		id: 'supabase_url',
		name: 'Supabase URL',
		description: 'Your Supabase project URL',
		placeholder: 'https://xxxxx.supabase.co',
		isUrl: true,
		envVarName: 'SUPABASE_URL',
		integration: 'supabase'
	},
	{
		id: 'supabase_anon_key',
		name: 'Supabase Anon Key',
		description: 'Public anonymous key (safe for client-side)',
		placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		envVarName: 'SUPABASE_ANON_KEY',
		integration: 'supabase'
	},
	{
		id: 'supabase_service_role_key',
		name: 'Supabase Service Role Key',
		description: 'Server-side key with full access (keep secret!)',
		placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		envVarName: 'SUPABASE_SERVICE_ROLE_KEY',
		integration: 'supabase'
	},
	{
		id: 'supabase_db_password',
		name: 'Supabase DB Password',
		description: 'Database password for SQL queries (from Supabase dashboard)',
		placeholder: 'your-database-password',
		envVarName: 'SUPABASE_DB_PASSWORD',
		integration: 'supabase'
	},
	{
		id: 'cloudflare_api_token',
		name: 'Cloudflare API Token',
		description: 'API token for Workers, Pages, and DNS management',
		placeholder: 'your-cloudflare-api-token',
		envVarName: 'CLOUDFLARE_API_TOKEN',
		integration: 'cloudflare'
	},
	{
		id: 'database_url',
		name: 'Database URL',
		description: 'PostgreSQL connection string',
		placeholder: 'postgresql://user:password@host:5432/database',
		isUrl: true,
		envVarName: 'DATABASE_URL',
		integration: 'database'
	}
];

/**
 * Get all secrets for a project (full, unmasked - server-side only)
 */
export function getProjectSecrets(projectKey: string): ProjectSecrets | undefined {
	const creds = getCredentials();
	return creds.projectSecrets?.[projectKey];
}

/**
 * Get a specific project secret (full, unmasked - server-side only)
 */
export function getProjectSecret(projectKey: string, secretKey: string): string | undefined {
	const creds = getCredentials();
	return creds.projectSecrets?.[projectKey]?.[secretKey]?.value;
}

/**
 * Get project secret with fallback to environment variable
 */
export function getProjectSecretWithFallback(
	projectKey: string,
	secretKey: string
): string | undefined {
	// First try credentials.json
	const credSecret = getProjectSecret(projectKey, secretKey);
	if (credSecret) {
		return credSecret;
	}

	// Fall back to environment variable
	const secretType = PROJECT_SECRET_TYPES.find((t) => t.id === secretKey);
	if (secretType?.envVarName) {
		return process.env[secretType.envVarName];
	}

	return undefined;
}

/**
 * Set a project secret
 */
export function setProjectSecret(
	projectKey: string,
	secretKey: string,
	value: string,
	description?: string
): void {
	const creds = getCredentials();

	if (!creds.projectSecrets) {
		creds.projectSecrets = {};
	}

	if (!creds.projectSecrets[projectKey]) {
		creds.projectSecrets[projectKey] = {};
	}

	creds.projectSecrets[projectKey][secretKey] = {
		value: value.trim(),
		addedAt: new Date().toISOString(),
		description
	};

	saveCredentials(creds);
}

/**
 * Delete a project secret
 */
export function deleteProjectSecret(projectKey: string, secretKey: string): void {
	const creds = getCredentials();

	if (creds.projectSecrets?.[projectKey]) {
		delete creds.projectSecrets[projectKey][secretKey];

		// Clean up empty project entries
		if (Object.keys(creds.projectSecrets[projectKey]).length === 0) {
			delete creds.projectSecrets[projectKey];
		}

		saveCredentials(creds);
	}
}

/**
 * Delete all secrets for a project
 */
export function deleteAllProjectSecrets(projectKey: string): void {
	const creds = getCredentials();

	if (creds.projectSecrets?.[projectKey]) {
		delete creds.projectSecrets[projectKey];
		saveCredentials(creds);
	}
}

/**
 * Get masked secrets for a specific project (safe for browser)
 */
export function getMaskedProjectSecrets(projectKey: string): MaskedProjectSecrets {
	const creds = getCredentials();
	const secrets = creds.projectSecrets?.[projectKey] || {};
	const masked: MaskedProjectSecrets = {};

	// Add existing secrets
	for (const [key, entry] of Object.entries(secrets)) {
		if (entry) {
			masked[key] = {
				masked: maskSecret(entry.value),
				addedAt: entry.addedAt,
				isSet: true
			};
		}
	}

	// Add placeholders for known secret types that aren't set
	for (const secretType of PROJECT_SECRET_TYPES) {
		if (!masked[secretType.id]) {
			masked[secretType.id] = {
				masked: '',
				addedAt: '',
				isSet: false
			};
		}
	}

	return masked;
}
