import { json } from '@sveltejs/kit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import type { RequestHandler } from './$types';

/**
 * GET/PUT /api/config/user
 *
 * The JAT IDE operator's identity. Used as the `author` on comments posted
 * from the IDE, and (by email) to resolve a per-project `profiles` UUID so
 * comments show the canonical name in each Supabase project.
 *
 * ## Identity resolution order
 *
 * 1. `~/.config/jat/identity.json` (JAT-specific override) — optional
 * 2. `git config --global user.{name,email}` — fallback
 *
 * Intentional: your git identity may legitimately differ from the identity
 * you use in your SaaS/Supabase projects (e.g. personal email on git, work
 * email in apps). The JAT-specific override lets you set the cross-project
 * identity without touching your git config.
 *
 * The override file is plain JSON, written with mode 0600:
 *
 *     { "name": "Joseph Winke", "email": "j@chimaro.ai" }
 *
 * Either key may be omitted — a missing key falls back to git.
 */

interface Identity {
	name?: string;
	email?: string;
}

const IDENTITY_PATH = join(homedir(), '.config', 'jat', 'identity.json');

function readIdentityFile(): Identity {
	try {
		if (!existsSync(IDENTITY_PATH)) return {};
		const raw = readFileSync(IDENTITY_PATH, 'utf-8');
		const parsed = JSON.parse(raw);
		return {
			name: typeof parsed.name === 'string' ? parsed.name : undefined,
			email: typeof parsed.email === 'string' ? parsed.email : undefined
		};
	} catch {
		return {};
	}
}

function gitConfig(key: string): string {
	try {
		return execSync(`git config --global ${key}`, {
			encoding: 'utf-8',
			timeout: 3000
		}).trim();
	} catch {
		return '';
	}
}

function computeInitials(name: string): string {
	return name
		? name
				.split(/\s+/)
				.map((w) => w[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: '';
}

export const GET: RequestHandler = async () => {
	const override = readIdentityFile();
	const name = (override.name && override.name.trim()) || gitConfig('user.name');
	const email = (override.email && override.email.trim()) || gitConfig('user.email');
	const initials = computeInitials(name);

	return json({
		name,
		email,
		initials,
		// Expose which values came from the JAT override so the UI can show
		// them as "customized" vs "from git config".
		source: {
			name: override.name ? 'jat' : name ? 'git' : 'none',
			email: override.email ? 'jat' : email ? 'git' : 'none'
		}
	});
};

export const PUT: RequestHandler = async ({ request }) => {
	let body: any;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	// Accept null/empty to CLEAR an override (falls back to git). Non-string
	// values are rejected; missing keys leave the current value untouched.
	const current = readIdentityFile();
	const next: Identity = { ...current };

	if ('name' in body) {
		if (body.name === null || body.name === '') {
			delete next.name;
		} else if (typeof body.name === 'string') {
			next.name = body.name.trim();
		} else {
			return json({ error: '`name` must be a string or null' }, { status: 400 });
		}
	}
	if ('email' in body) {
		if (body.email === null || body.email === '') {
			delete next.email;
		} else if (typeof body.email === 'string') {
			next.email = body.email.trim();
		} else {
			return json({ error: '`email` must be a string or null' }, { status: 400 });
		}
	}

	try {
		mkdirSync(dirname(IDENTITY_PATH), { recursive: true });
		writeFileSync(IDENTITY_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8');
		// Restrict permissions — this file carries identity even if it's not a
		// secret, and sitting next to credentials.json makes 0600 the right
		// default for this directory.
		try {
			chmodSync(IDENTITY_PATH, 0o600);
		} catch {
			// Non-fatal on filesystems that don't support it.
		}
	} catch (err) {
		const e = err as Error;
		return json({ error: `Failed to write identity: ${e.message}` }, { status: 500 });
	}

	// Return the GET shape so the client can update state without a refetch.
	const name = (next.name && next.name.trim()) || gitConfig('user.name');
	const email = (next.email && next.email.trim()) || gitConfig('user.email');
	return json({
		name,
		email,
		initials: computeInitials(name),
		source: {
			name: next.name ? 'jat' : name ? 'git' : 'none',
			email: next.email ? 'jat' : email ? 'git' : 'none'
		}
	});
};
