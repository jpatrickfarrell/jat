/**
 * Cloud provider factory.
 *
 * `getProvider(name?)` returns a configured CloudProvider instance for the
 * named provider, pulling the API token from the JAT credentials store and
 * region/size/image defaults from `~/.config/jat/projects.json`.
 *
 * Default provider name comes from `defaults.cloud_provider` in projects.json
 * if `name` is omitted.
 *
 * @typedef {import('./types.d.ts').CloudProvider} CloudProvider
 * @typedef {import('./types.d.ts').ProviderName} ProviderName
 */

import { execFileSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import { LinodeProvider } from './linode.js';
import { DigitalOceanProvider } from './digitalocean.js';

const PROJECTS_FILE = join(homedir(), '.config', 'jat', 'projects.json');
const CREDENTIALS_FILE = join(homedir(), '.config', 'jat', 'credentials.json');

/** @type {ProviderName[]} */
export const SUPPORTED_PROVIDERS = ['linode', 'digitalocean'];

/**
 * Token names in the credentials store. These match the `name` field that
 * `jat-secret --set <name> <value>` writes into customApiKeys.
 */
const TOKEN_KEYS = {
	linode: 'linode_api_token',
	digitalocean: 'digitalocean_api_token'
};

function readJson(path) {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf-8'));
	} catch {
		return null;
	}
}

/**
 * Resolve an API token for the given provider. Order:
 *   1. credentials.json customApiKeys[<token-key>].value
 *   2. `jat-secret <token-key>` (handles 1Password fallback)
 * Returns empty string if nothing is configured — providers will throw a
 * clear error on first use.
 */
function resolveToken(providerName) {
	const key = TOKEN_KEYS[providerName];
	if (!key) return '';
	const creds = readJson(CREDENTIALS_FILE);
	const inline = creds?.customApiKeys?.[key]?.value;
	if (inline) return inline;
	try {
		// jat-secret handles credentials.json + 1Password chain.
		return execFileSync('jat-secret', [key], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return '';
	}
}

/**
 * Read cloud-related defaults from projects.json. All fields are optional —
 * providers fall back to their own constants if unset.
 */
export function readCloudDefaults() {
	const cfg = readJson(PROJECTS_FILE);
	const d = cfg?.defaults || {};
	return {
		provider: d.cloud_provider || '',
		region: d.cloud_region || '',
		size: d.cloud_size || '',
		image: d.cloud_image || '',
		sshKeyIds: Array.isArray(d.cloud_ssh_key_ids) ? d.cloud_ssh_key_ids : [],
		tag: d.cloud_tag || 'jat-worker'
	};
}

/**
 * Construct a provider instance.
 *
 * @param {ProviderName} [name] — defaults to defaults.cloud_provider
 * @returns {CloudProvider}
 */
export function getProvider(name) {
	const defaults = readCloudDefaults();
	const providerName = name || defaults.provider || 'linode';
	if (!SUPPORTED_PROVIDERS.includes(providerName)) {
		throw new Error(`Unknown cloud provider: ${providerName}. Supported: ${SUPPORTED_PROVIDERS.join(', ')}`);
	}
	const token = resolveToken(providerName);
	const opts = {
		token,
		defaultRegion: defaults.region || undefined,
		defaultSize: defaults.size || undefined,
		defaultImage: defaults.image || undefined
	};
	if (providerName === 'linode') return new LinodeProvider(opts);
	if (providerName === 'digitalocean') return new DigitalOceanProvider(opts);
	throw new Error(`Provider ${providerName} not implemented`);
}

/**
 * Report which providers currently have an API token configured.
 * Useful for surfacing setup status in the IDE.
 *
 * @returns {{ name: ProviderName, configured: boolean, tokenKey: string }[]}
 */
export function listProvidersStatus() {
	return SUPPORTED_PROVIDERS.map((name) => ({
		name,
		configured: !!resolveToken(name),
		tokenKey: TOKEN_KEYS[name]
	}));
}

export { LinodeProvider, DigitalOceanProvider };
