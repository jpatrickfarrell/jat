import { json } from '@sveltejs/kit';
import { execSync } from 'child_process';

/**
 * GET /api/config/user
 *
 * Returns the JAT IDE operator's identity, sourced from the machine's global
 * git config. This is the human behind the keyboard — used as the `author`
 * on comments posted from the IDE, and (by email) as the identity to resolve
 * against per-project `profiles` tables when a stable UUID is needed.
 */
export async function GET() {
	let name = '';
	let email = '';

	try {
		name = execSync('git config --global user.name', { encoding: 'utf-8', timeout: 3000 }).trim();
	} catch {
		// git config not set or git not installed
	}
	try {
		email = execSync('git config --global user.email', { encoding: 'utf-8', timeout: 3000 }).trim();
	} catch {
		// git config not set or git not installed
	}

	const initials = name
		? name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
		: '';

	return json({ name, initials, email });
}
