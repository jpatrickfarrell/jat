/**
 * Spawn Configuration
 * Settings for agent spawning
 */

// Default model for spawned agents
export const DEFAULT_MODEL = 'opus-4.5';

// Maximum concurrent tmux sessions (system limit)
export const MAX_TMUX_SESSIONS = 12;

// Default number of agents to spawn (if enough tasks available)
export const DEFAULT_AGENT_COUNT = 4;

// Minimum agents (always allow at least 1)
export const MIN_AGENT_COUNT = 1;

// Stagger delay between spawns (ms) to avoid overwhelming system
export const SPAWN_STAGGER_MS = 1000;
