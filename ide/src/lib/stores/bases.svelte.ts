/**
 * Knowledge Bases Store
 *
 * Manages bases state using Svelte 5 runes.
 * Fetches from /api/bases endpoints (server-side DB, not localStorage).
 */

import type { KnowledgeBase, CreateBaseInput, UpdateBaseInput, RenderedBase } from '$lib/types/knowledgeBase';

// =============================================================================
// STATE
// =============================================================================

interface BasesState {
	bases: KnowledgeBase[];
	initialized: boolean;
	loading: boolean;
	error: string | null;
	currentProject: string | null;
}

let state = $state<BasesState>({
	bases: [],
	initialized: false,
	loading: false,
	error: null,
	currentProject: null
});

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize (or re-initialize) the store by fetching bases from API.
 * Call on mount or when project changes.
 */
export async function initializeStore(project: string): Promise<void> {
	if (state.loading) return;

	state.loading = true;
	state.error = null;
	state.currentProject = project;

	try {
		const url = project
			? `/api/bases?project=${encodeURIComponent(project)}&includeGlobal=true`
			: '/api/bases?includeGlobal=true';
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch bases: ${res.status}`);
		const data = await res.json();
		state.bases = data.bases || [];
		state.initialized = true;
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'Unknown error';
		console.error('[bases] Failed to initialize:', err);
	} finally {
		state.loading = false;
	}
}

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

/**
 * Create a new base via API and add to local state.
 */
export async function createBase(input: CreateBaseInput): Promise<KnowledgeBase | null> {
	if (!state.currentProject) return null;

	try {
		const res = await fetch('/api/bases', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...input, project: state.currentProject })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error || `Create failed: ${res.status}`);
		}
		const data = await res.json();
		const base = data.base as KnowledgeBase;
		state.bases = [...state.bases, base];
		return base;
	} catch (err) {
		console.error('[bases] Create failed:', err);
		throw err;
	}
}

/**
 * Update an existing base via API and update local state.
 */
export async function updateBase(id: string, input: UpdateBaseInput): Promise<KnowledgeBase | null> {
	if (!state.currentProject) return null;

	try {
		const res = await fetch(`/api/bases/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...input, project: state.currentProject })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error || `Update failed: ${res.status}`);
		}
		const data = await res.json();
		const updated = data.base as KnowledgeBase;
		state.bases = state.bases.map(b => b.id === id ? updated : b);
		return updated;
	} catch (err) {
		console.error('[bases] Update failed:', err);
		throw err;
	}
}

/**
 * Delete a base via API and remove from local state.
 */
export async function deleteBase(id: string): Promise<boolean> {
	if (!state.currentProject) return false;

	try {
		const res = await fetch(`/api/bases/${id}?project=${encodeURIComponent(state.currentProject)}`, {
			method: 'DELETE'
		});
		if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
		state.bases = state.bases.filter(b => b.id !== id);
		return true;
	} catch (err) {
		console.error('[bases] Delete failed:', err);
		throw err;
	}
}

/**
 * Toggle always_inject for a base.
 */
export async function toggleAlwaysInject(id: string): Promise<boolean> {
	const base = state.bases.find(b => b.id === id);
	if (!base || base._system) return false; // System bases are always injected

	const updated = await updateBase(id, { always_inject: !base.always_inject });
	return updated !== null;
}

/**
 * Render a base (get preview content).
 * @param opts.collapsible - Wrap resolved @-references in collapsible <details> elements
 */
export async function renderBase(id: string, opts?: { collapsible?: boolean }): Promise<RenderedBase | null> {
	if (!state.currentProject) return null;

	try {
		const res = await fetch(`/api/bases/${id}/render`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ project: state.currentProject, collapsible: opts?.collapsible })
		});
		if (!res.ok) throw new Error(`Render failed: ${res.status}`);
		const data = await res.json();
		return data.rendered as RenderedBase;
	} catch (err) {
		console.error('[bases] Render failed:', err);
		return null;
	}
}

/**
 * Search bases via FTS.
 */
export async function searchBases(query: string): Promise<KnowledgeBase[]> {
	if (!state.currentProject || !query.trim()) return state.bases;

	try {
		const params = new URLSearchParams({
			project: state.currentProject,
			q: query,
			limit: '50'
		});
		const res = await fetch(`/api/bases/search?${params}`);
		if (!res.ok) throw new Error(`Search failed: ${res.status}`);
		const data = await res.json();
		return data.results || [];
	} catch (err) {
		console.error('[bases] Search failed:', err);
		return [];
	}
}

// =============================================================================
// REACTIVE GETTERS
// =============================================================================

export function getBases(): KnowledgeBase[] {
	return state.bases;
}

export function getBase(id: string): KnowledgeBase | undefined {
	return state.bases.find(b => b.id === id);
}

export function isLoading(): boolean {
	return state.loading;
}

export function getError(): string | null {
	return state.error;
}

export function isStoreInitialized(): boolean {
	return state.initialized;
}

export function getCurrentProject(): string | null {
	return state.currentProject;
}

// Export state for direct reactive access
export { state as basesState };
