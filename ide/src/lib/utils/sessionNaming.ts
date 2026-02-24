/**
 * Session naming constants and classification helper.
 *
 * Centralizes the logic that is currently duplicated across ~8 page files
 * with startsWith('server-') checks.
 *
 * NEW naming convention:
 *   jat-{PascalCase}    = agent session (e.g. jat-FairBay)
 *   jat-pending-*       = agent starting
 *   jat-app-{project}   = project dev server (e.g. jat-app-benzinga)
 *   jat-app-ide         = JAT IDE dev server
 *   jat-integrations    = integrations daemon
 *   jat-scheduler       = scheduler daemon
 *
 * LEGACY naming (still detected for backwards compatibility):
 *   server-{project}    = project dev server (e.g. server-benzinga)
 *   server-jat          = JAT IDE dev server
 *   server-ingest       = integrations daemon
 *   server-scheduler    = scheduler daemon
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Prefix for all JAT-managed tmux sessions */
export const SESSION_PREFIX = 'jat-';

/** Prefix for project dev server sessions */
export const APP_PREFIX = 'jat-app-';

/** Well-known system service session names */
export const SYSTEM_SERVICES: Record<string, string> = {
	integrations: 'jat-integrations',
	scheduler: 'jat-scheduler'
};

/** The IDE dev server session name */
export const IDE_SESSION = 'jat-app-ide';

/** Legacy prefix used before the unified naming convention */
export const LEGACY_SERVER_PREFIX = 'server-';

/** Map legacy service names to their new equivalents */
const LEGACY_SERVICE_MAP: Record<string, string> = {
	ingest: 'integrations',
	scheduler: 'scheduler'
};

/** Map legacy server names to display names */
const LEGACY_IDE_NAMES = ['jat', 'server-jat'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionType = 'agent' | 'app' | 'service' | 'ide' | 'other';

export interface SessionClassification {
	type: SessionType;
	/** Project name for 'app' sessions, undefined otherwise */
	project?: string;
	/** Service key for 'service' sessions (e.g. 'integrations', 'scheduler') */
	service?: string;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/**
 * PascalCase test: first char is uppercase ASCII letter, contains at least one
 * lowercase letter (to distinguish from all-caps or numeric suffixes).
 */
function isPascalCase(s: string): boolean {
	if (s.length === 0) return false;
	const first = s.charCodeAt(0);
	// A-Z
	if (first < 65 || first > 90) return false;
	// Must contain at least one lowercase a-z
	return /[a-z]/.test(s);
}

/**
 * Classify a tmux session name into its type.
 *
 * Handles both the NEW naming convention (jat-app-*, jat-integrations, etc.)
 * and the LEGACY convention (server-*) for backwards compatibility.
 */
export function classifySession(name: string): SessionClassification {
	// --- New convention ---

	// IDE session
	if (name === IDE_SESSION) {
		return { type: 'ide' };
	}

	// System services (exact match)
	for (const [serviceKey, sessionName] of Object.entries(SYSTEM_SERVICES)) {
		if (name === sessionName) {
			return { type: 'service', service: serviceKey };
		}
	}

	// App (project dev server): jat-app-{project}
	if (name.startsWith(APP_PREFIX)) {
		const project = name.slice(APP_PREFIX.length);
		if (project) {
			return { type: 'app', project };
		}
	}

	// Agent session: jat-{PascalCase} or jat-pending-*
	if (name.startsWith(SESSION_PREFIX)) {
		const suffix = name.slice(SESSION_PREFIX.length);

		// jat-pending-* is an agent that hasn't registered yet
		if (suffix.startsWith('pending-')) {
			return { type: 'agent' };
		}

		// PascalCase after jat- means agent
		if (isPascalCase(suffix)) {
			return { type: 'agent' };
		}

		// If it starts with jat- but isn't PascalCase, app, service, or pending,
		// it's 'other' (could be a custom session)
	}

	// --- Legacy convention ---

	// Legacy IDE: server-jat
	if (name === 'server-jat') {
		return { type: 'ide' };
	}

	// Legacy server-* pattern
	if (name.startsWith(LEGACY_SERVER_PREFIX)) {
		const project = name.slice(LEGACY_SERVER_PREFIX.length);

		// Legacy service names
		if (project in LEGACY_SERVICE_MAP) {
			return { type: 'service', service: LEGACY_SERVICE_MAP[project] };
		}

		// Regular project dev server
		if (project) {
			return { type: 'app', project };
		}
	}

	// Fallback for standalone 'jat' session (legacy IDE session name)
	if (name === 'jat') {
		return { type: 'ide' };
	}

	return { type: 'other' };
}

// ---------------------------------------------------------------------------
// Name generators
// ---------------------------------------------------------------------------

/**
 * Get the new-convention session name for a project dev server.
 *
 * @example getAppSessionName('benzinga') // 'jat-app-benzinga'
 */
export function getAppSessionName(project: string): string {
	return `${APP_PREFIX}${project}`;
}

/**
 * Get the session name for a system service.
 *
 * @example getServiceSessionName('integrations') // 'jat-integrations'
 * @example getServiceSessionName('scheduler')    // 'jat-scheduler'
 */
export function getServiceSessionName(service: string): string {
	if (service in SYSTEM_SERVICES) {
		return SYSTEM_SERVICES[service];
	}
	return `${SESSION_PREFIX}${service}`;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Produce a human-readable display name for a tmux session.
 *
 * @example getDisplayName('jat-app-benzinga')  // 'Benzinga Dev Server'
 * @example getDisplayName('jat-integrations')  // 'Integrations'
 * @example getDisplayName('jat-scheduler')     // 'Scheduler'
 * @example getDisplayName('jat-app-ide')       // 'JAT IDE'
 * @example getDisplayName('jat-FairBay')       // 'FairBay'
 * @example getDisplayName('server-benzinga')   // 'Benzinga Dev Server'
 * @example getDisplayName('server-ingest')     // 'Integrations'
 */
export function getDisplayName(name: string): string {
	const classification = classifySession(name);

	switch (classification.type) {
		case 'ide':
			return 'JAT IDE';

		case 'service': {
			const s = classification.service ?? '';
			return s.charAt(0).toUpperCase() + s.slice(1);
		}

		case 'app': {
			const project = classification.project ?? '';
			const capitalized = project.charAt(0).toUpperCase() + project.slice(1);
			return `${capitalized} Dev Server`;
		}

		case 'agent': {
			// Extract agent name from the session name
			if (name.startsWith(SESSION_PREFIX)) {
				return name.slice(SESSION_PREFIX.length);
			}
			return name;
		}

		default:
			return name;
	}
}

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

/**
 * Check whether a session name represents an agent session.
 *
 * Agent sessions are `jat-{PascalCase}` or `jat-pending-*`.
 */
export function isAgentSession(name: string): boolean {
	return classifySession(name).type === 'agent';
}

/**
 * Check whether a session name represents any kind of server
 * (app dev server, system service, or IDE).
 */
export function isServerSession(name: string): boolean {
	const t = classifySession(name).type;
	return t === 'app' || t === 'service' || t === 'ide';
}

/**
 * Check whether a session name uses the legacy `server-*` naming.
 */
export function isLegacyName(name: string): boolean {
	return name.startsWith(LEGACY_SERVER_PREFIX) || LEGACY_IDE_NAMES.includes(name);
}
