/**
 * Auto-Pause Configuration Store
 *
 * Manages runtime configuration for auto-pausing idle sessions.
 * This store is loaded from the API at startup and updated when the user saves settings.
 *
 * When enabled, sessions in 'idle' or 'completed' state for longer than
 * idleTimeoutSeconds are paused (tmux session killed). This reclaims tmux
 * sessions that would otherwise be captured on every /api/work poll.
 */

import { writable, get } from 'svelte/store';
import { AUTO_PAUSE_IDLE } from '$lib/config/constants';

export interface AutoPauseConfig {
	enabled: boolean;
	idleTimeoutSeconds: number;
}

// Default config from constants (used as fallback before API loads)
const defaultConfig: AutoPauseConfig = {
	enabled: AUTO_PAUSE_IDLE.ENABLED,
	idleTimeoutSeconds: AUTO_PAUSE_IDLE.IDLE_TIMEOUT_SECONDS
};

// Create the store with default values
export const autoPauseConfig = writable<AutoPauseConfig>(defaultConfig);

/**
 * Load auto-pause configuration from the API.
 * Called on IDE startup (connectSessionEvents).
 */
export async function loadAutoPauseConfig(): Promise<void> {
	try {
		const response = await fetch('/api/config/defaults');
		if (!response.ok) {
			console.warn('Failed to load auto-pause config, using defaults');
			return;
		}

		const data = await response.json();
		const defaults = data.defaults || {};

		autoPauseConfig.set({
			enabled: defaults.auto_pause_enabled ?? AUTO_PAUSE_IDLE.ENABLED,
			idleTimeoutSeconds: defaults.auto_pause_idle_timeout ?? AUTO_PAUSE_IDLE.IDLE_TIMEOUT_SECONDS
		});
	} catch (error) {
		console.warn('Error loading auto-pause config:', error);
	}
}

/**
 * Check if auto-pause is enabled (synchronous getter for sessionEvents).
 */
export function isAutoPauseEnabled(): boolean {
	return get(autoPauseConfig).enabled;
}

/**
 * Get the idle timeout in seconds (synchronous getter for sessionEvents).
 */
export function getAutoPauseTimeout(): number {
	return get(autoPauseConfig).idleTimeoutSeconds;
}
