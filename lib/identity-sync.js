/**
 * Identity Sync — shared module.
 *
 * Propagates the JAT operator's identity (name + email) into a single Supabase
 * project using the project's service role key. Used by:
 *   - `tools/core/jat-identity-sync` CLI (loops every project)
 *   - `/api/projects/[name]/graduate` endpoint (auto-run after graduation)
 *
 * See `shared/identity.md` for the full design.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Identity resolution (JAT override → git config)
// ---------------------------------------------------------------------------

export function readIdentityOverride() {
	const p = join(homedir(), '.config', 'jat', 'identity.json');
	try {
		if (!existsSync(p)) return {};
		return JSON.parse(readFileSync(p, 'utf-8')) || {};
	} catch {
		return {};
	}
}

function gitConfig(key) {
	try {
		return execSync(`git config --global ${key}`, {
			encoding: 'utf-8',
			timeout: 3000,
			stdio: ['ignore', 'pipe', 'ignore']
		}).trim();
	} catch {
		return '';
	}
}

/**
 * @returns {{ name: string, email: string }}
 */
export function resolveIdentity() {
	const o = readIdentityOverride();
	const name = (o.name && o.name.trim()) || gitConfig('user.name');
	const email = (o.email && o.email.trim()) || gitConfig('user.email');
	return { name, email };
}

// ---------------------------------------------------------------------------
// Secret lookup via jat-secret
// ---------------------------------------------------------------------------

function getSecret(key) {
	try {
		return execSync(`jat-secret ${key}`, {
			encoding: 'utf-8',
			timeout: 5000,
			stdio: ['ignore', 'pipe', 'ignore']
		}).trim();
	} catch {
		return '';
	}
}

/**
 * Enumerate every project that has a `<name>-supabase-service-role-key` secret.
 * @returns {string[]}
 */
export function listProjectsWithServiceRoleKey() {
	try {
		const out = execSync('jat-secret --list', {
			encoding: 'utf-8',
			timeout: 5000,
			stdio: ['ignore', 'pipe', 'ignore']
		});
		const projects = new Set();
		for (const line of out.split('\n')) {
			const m = line.match(/^\s*([a-z0-9_-]+)-supabase-service-role-key\s/);
			if (m) projects.add(m[1]);
		}
		return [...projects].sort();
	} catch {
		return [];
	}
}

// ---------------------------------------------------------------------------
// Supabase Admin API helpers
// ---------------------------------------------------------------------------

async function sbFetch(url, serviceKey, path, init = {}) {
	const headers = {
		apikey: serviceKey,
		Authorization: `Bearer ${serviceKey}`,
		'Content-Type': 'application/json',
		...(init.headers || {})
	};
	return fetch(`${url}${path}`, { ...init, headers });
}

async function findAuthUserByEmail(url, serviceKey, email) {
	const res = await sbFetch(url, serviceKey, '/auth/v1/admin/users?page=1&per_page=200');
	if (!res.ok) throw new Error(`auth.users list failed: HTTP ${res.status}`);
	const data = await res.json();
	const users = data.users || [];
	return users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase()) || null;
}

async function createAuthUser(url, serviceKey, email, name) {
	const res = await sbFetch(url, serviceKey, '/auth/v1/admin/users', {
		method: 'POST',
		body: JSON.stringify({
			email,
			email_confirm: true,
			user_metadata: { full_name: name, name }
		})
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`admin.createUser failed: HTTP ${res.status} ${body.slice(0, 300)}`);
	}
	return await res.json();
}

async function updateAuthUserName(url, serviceKey, userId, name) {
	const res = await sbFetch(url, serviceKey, `/auth/v1/admin/users/${userId}`, {
		method: 'PUT',
		body: JSON.stringify({ user_metadata: { full_name: name, name } })
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`admin.updateUserById failed: HTTP ${res.status} ${body.slice(0, 300)}`);
	}
	return await res.json();
}

async function fetchProfile(url, serviceKey, userId) {
	const res = await sbFetch(url, serviceKey, `/rest/v1/profiles?id=eq.${userId}&limit=1`);
	if (!res.ok) return null;
	const rows = await res.json();
	return rows[0] || null;
}

async function upsertProfileName(url, serviceKey, userId, name) {
	const res = await sbFetch(url, serviceKey, '/rest/v1/profiles?on_conflict=id', {
		method: 'POST',
		headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
		body: JSON.stringify({ id: userId, full_name: name })
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`profiles upsert failed: HTTP ${res.status} ${body.slice(0, 300)}`);
	}
	const rows = await res.json();
	return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Per-project sync
// ---------------------------------------------------------------------------

/**
 * Ensure the identity (name + email) exists as an `auth.users` row and a
 * `profiles.full_name` row in the given project's Supabase.
 *
 * @param {string} project          Project name (e.g. "meadow")
 * @param {{name: string, email: string}} identity
 * @param {{apply?: boolean}} [opts]  If `apply` is false, no writes are made.
 * @returns {Promise<{
 *   project: string,
 *   status: 'ok' | 'updated' | 'pending' | 'skip' | 'error',
 *   userId?: string | null,
 *   actions?: string[],
 *   reason?: string
 * }>}
 */
export async function syncIdentityForProject(project, identity, { apply = false } = {}) {
	const url = getSecret(`${project}-supabase-url`);
	const serviceKey = getSecret(`${project}-supabase-service-role-key`);
	if (!url || !serviceKey) {
		return { project, status: 'skip', reason: 'missing supabase credentials' };
	}
	if (!identity?.email) {
		return { project, status: 'error', reason: 'identity has no email' };
	}
	const name = identity.name || identity.email;

	try {
		const existing = await findAuthUserByEmail(url, serviceKey, identity.email);
		const actions = [];
		let userId = existing?.id || null;

		if (!existing) {
			if (apply) {
				const created = await createAuthUser(url, serviceKey, identity.email, name);
				userId = created.id || created.user?.id;
				actions.push(`created auth user (id=${String(userId).slice(0, 8)})`);
			} else {
				actions.push(`would create auth user (${identity.email})`);
			}
		} else {
			const currentName =
				existing.user_metadata?.full_name || existing.user_metadata?.name || null;
			if (!currentName || currentName !== name) {
				if (apply) {
					await updateAuthUserName(url, serviceKey, existing.id, name);
					actions.push(`updated user_metadata.full_name → "${name}"`);
				} else {
					actions.push(
						`would update user_metadata.full_name (was ${JSON.stringify(currentName)})`
					);
				}
			}
		}

		if (userId) {
			const prof = await fetchProfile(url, serviceKey, userId);
			if (!prof || prof.full_name !== name) {
				if (apply) {
					await upsertProfileName(url, serviceKey, userId, name);
					actions.push(prof ? `updated profiles.full_name → "${name}"` : 'inserted profiles row');
				} else {
					actions.push(
						prof
							? `would update profiles.full_name (was ${JSON.stringify(prof.full_name)})`
							: 'would insert profiles row'
					);
				}
			}
		}

		return {
			project,
			status: actions.length ? (apply ? 'updated' : 'pending') : 'ok',
			userId,
			actions
		};
	} catch (err) {
		return {
			project,
			status: 'error',
			reason: err instanceof Error ? err.message : String(err)
		};
	}
}
