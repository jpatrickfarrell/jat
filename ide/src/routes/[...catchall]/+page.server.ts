import { redirect, error } from '@sveltejs/kit';
import { DEFAULT_ROUTE } from '$lib/config/constants';

export function load({ url }) {
	// Don't redirect API routes — return proper 404
	if (url.pathname.startsWith('/api/')) {
		throw error(404, 'Not found');
	}

	throw redirect(302, DEFAULT_ROUTE);
}
