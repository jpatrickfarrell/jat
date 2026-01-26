/**
 * Provider Logos Configuration
 *
 * Maps agent providers (Anthropic, OpenAI, Google, etc.) to their branding.
 * Used in AgentSelector and other UI components.
 *
 * Logo paths sourced from Bootstrap Icons where available.
 * @see https://icons.getbootstrap.com/icons/anthropic/
 * @see https://icons.getbootstrap.com/icons/openai/
 */

export interface ProviderInfo {
	/** Provider identifier */
	id: string;
	/** Display name */
	name: string;
	/** Brand color (oklch) */
	color: string;
	/** SVG viewBox (default: "0 0 16 16") */
	viewBox?: string;
	/** SVG path for the logo icon */
	iconPath: string;
	/** Optional secondary path for multi-part logos */
	iconPath2?: string;
}

/**
 * Provider information lookup.
 *
 * Keys match apiKeyProvider values and agent IDs.
 */
export const PROVIDERS: Record<string, ProviderInfo> = {
	// Anthropic - Claude (Bootstrap Icons)
	anthropic: {
		id: 'anthropic',
		name: 'Anthropic',
		color: 'oklch(0.70 0.12 45)', // Anthropic tan/beige
		viewBox: '0 0 16 16',
		// Official Anthropic logo from Bootstrap Icons
		iconPath:
			'M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z'
	},

	// OpenAI (Bootstrap Icons)
	openai: {
		id: 'openai',
		name: 'OpenAI',
		color: 'oklch(0.55 0.00 0)', // OpenAI black/gray
		viewBox: '0 0 16 16',
		// Official OpenAI logo from Bootstrap Icons
		iconPath:
			'M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934 4.1 4.1 0 0 0-1.778-.14 4.15 4.15 0 0 0-2.118.114 4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679 4 4 0 0 0-.844 1.277 3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z'
	},

	// Google - Gemini
	google: {
		id: 'google',
		name: 'Google',
		color: 'oklch(0.60 0.20 250)', // Google blue
		viewBox: '0 0 24 24',
		// Google 'G' logo
		iconPath:
			'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
	},

	// OpenCode
	opencode: {
		id: 'opencode',
		name: 'OpenCode',
		color: 'oklch(0.70 0.18 280)', // Purple
		viewBox: '0 0 24 24',
		// Code brackets icon
		iconPath:
			'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'
	},

	// Aider
	aider: {
		id: 'aider',
		name: 'Aider',
		color: 'oklch(0.65 0.20 100)', // Yellow/gold
		viewBox: '0 0 24 24',
		// Chat bubble with code
		iconPath:
			'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z'
	},

	// Generic/fallback
	generic: {
		id: 'generic',
		name: 'AI Agent',
		color: 'oklch(0.60 0.10 250)', // Neutral blue
		viewBox: '0 0 24 24',
		// Robot/AI icon
		iconPath:
			'M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z'
	}
};

/**
 * Get provider info for an agent program.
 *
 * Looks up by:
 * 1. Direct agent ID match (e.g., 'claude-code' → 'anthropic')
 * 2. apiKeyProvider value
 * 3. Falls back to 'generic'
 */
export function getProviderForAgent(
	agentId: string,
	apiKeyProvider?: string
): ProviderInfo {
	// Direct mappings from agent ID to provider
	const agentToProvider: Record<string, string> = {
		'claude-code': 'anthropic',
		'codex-cli': 'openai',
		'codex': 'openai',
		'gemini-code': 'google',
		'gemini': 'google',
		'opencode': 'opencode',
		'aider': 'aider'
	};

	// Try agent ID mapping first
	const providerId = agentToProvider[agentId];
	if (providerId && PROVIDERS[providerId]) {
		return PROVIDERS[providerId];
	}

	// Try apiKeyProvider
	if (apiKeyProvider && PROVIDERS[apiKeyProvider]) {
		return PROVIDERS[apiKeyProvider];
	}

	// Fallback to generic
	return PROVIDERS.generic;
}
