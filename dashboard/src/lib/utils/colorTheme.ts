/**
 * Centralized Color Theming Utility for Component Styling
 *
 * This utility provides a consistent OKLCH-based color system for the JAT dashboard.
 * All colors are defined in OKLCH (Oklab Lightness Chroma Hue) for perceptually uniform
 * color manipulation.
 *
 * ## Color System Overview
 *
 * The system is built around semantic color roles:
 * - **Base colors**: Neutral grays for backgrounds, borders, and text
 * - **Accent colors**: Primary, secondary, info, success, warning, error
 * - **State colors**: Working, idle, active, blocked, completed
 *
 * ## Usage
 *
 * ```typescript
 * import { colors, withAlpha, getGradient } from '$lib/utils/colorTheme';
 *
 * // Direct color access
 * const bg = colors.base[100];  // 'oklch(0.22 0.01 250)'
 *
 * // With transparency
 * const bgTint = withAlpha(colors.accent.primary, 0.1);  // 'oklch(0.70 0.18 240 / 0.1)'
 *
 * // Gradients
 * const fadeGradient = getGradient('horizontal', colors.accent.success, 'transparent');
 * ```
 *
 * ## Integration with CSS Variables
 *
 * These colors align with the CSS custom properties in app.css:
 * - `--color-base-*` matches `colors.base`
 * - `--anim-*` matches `colors.accent` and `colors.state`
 *
 * @see app.css for CSS variable definitions
 * @see statusColors.ts for status-specific visual configurations
 */

// =============================================================================
// OKLCH COLOR PRIMITIVES
// =============================================================================

/**
 * OKLCH hue values for semantic color categories.
 * These are the "essence" of each color - combine with lightness/chroma for variants.
 */
export const HUE = {
	/** Neutral slate (250°) - backgrounds, borders, muted text */
	slate: 250,
	/** Primary blue (240°) - links, selections, primary actions */
	blue: 240,
	/** Info cyan (200°) - informational elements, badges */
	cyan: 200,
	/** Success green (145°) - success states, completions */
	green: 145,
	/** Warning amber (85°) - working states, caution */
	amber: 85,
	/** Warning orange (45-55°) - stronger warnings, human tasks */
	orange: 45,
	/** Error red (25°) - errors, failures, critical */
	red: 25,
	/** Secondary purple (280°) - epic, special states */
	purple: 280,
	/** Tertiary teal (180°) - alternative accent */
	teal: 180
} as const;

/**
 * Standard chroma (saturation) levels.
 * OKLCH chroma typically ranges from 0 (gray) to ~0.37 (maximum saturation).
 */
export const CHROMA = {
	/** Zero saturation - pure grays */
	none: 0,
	/** Barely visible color hint (0.01-0.02) */
	minimal: 0.02,
	/** Subtle tint (0.05) */
	subtle: 0.05,
	/** Low saturation (0.10) */
	low: 0.10,
	/** Medium saturation (0.15) - good for UI elements */
	medium: 0.15,
	/** High saturation (0.18) - vibrant colors */
	high: 0.18,
	/** Very high saturation (0.20) - attention-grabbing */
	vivid: 0.20,
	/** Maximum practical saturation (0.22) - use sparingly */
	max: 0.22
} as const;

/**
 * Standard lightness levels.
 * OKLCH lightness ranges from 0 (black) to 1 (white).
 */
export const LIGHTNESS = {
	/** Near black (0.12-0.14) - darkest backgrounds */
	darkest: 0.14,
	/** Very dark (0.16-0.18) - secondary backgrounds */
	darker: 0.18,
	/** Dark (0.20-0.22) - primary backgrounds */
	dark: 0.22,
	/** Medium-dark (0.25-0.30) - borders, dividers */
	mediumDark: 0.28,
	/** Medium (0.45-0.55) - muted text, icons */
	medium: 0.50,
	/** Medium-light (0.60-0.65) - secondary text */
	mediumLight: 0.60,
	/** Light (0.70-0.75) - accent colors, highlights */
	light: 0.70,
	/** Very light (0.80-0.85) - bright accents */
	lighter: 0.85,
	/** Near white (0.90-0.95) - primary text */
	lightest: 0.90
} as const;

// =============================================================================
// COLOR BUILDER FUNCTIONS
// =============================================================================

/**
 * Build an OKLCH color string from components.
 *
 * @param l - Lightness (0-1)
 * @param c - Chroma (0-0.37, typically 0-0.22 for UI)
 * @param h - Hue (0-360 degrees)
 * @returns OKLCH color string
 *
 * @example
 * oklch(0.70, 0.18, 240)  // 'oklch(0.70 0.18 240)'
 */
export function oklch(l: number, c: number, h: number): string {
	return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${h})`;
}

/**
 * Add alpha (transparency) to any color string.
 *
 * @param color - Base color string (OKLCH, RGB, hex, etc.)
 * @param alpha - Alpha value (0-1)
 * @returns Color string with alpha
 *
 * @example
 * withAlpha('oklch(0.70 0.18 240)', 0.5)  // 'oklch(0.70 0.18 240 / 0.5)'
 * withAlpha('#3b82f6', 0.5)               // '#3b82f680' or similar
 */
export function withAlpha(color: string, alpha: number): string {
	// Handle OKLCH colors
	if (color.startsWith('oklch(')) {
		// Remove closing paren and add alpha
		return `${color.slice(0, -1)} / ${alpha})`;
	}
	// For other formats, return CSS color-mix approach
	return `color-mix(in oklch, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/**
 * Build a linear gradient string.
 *
 * @param direction - Gradient direction
 * @param stops - Array of color stops (can include position like 'red 50%')
 * @returns CSS linear-gradient string
 *
 * @example
 * getGradient('horizontal', ['oklch(0.70 0.18 145)', 'transparent'])
 * // 'linear-gradient(90deg, oklch(0.70 0.18 145), transparent)'
 */
export function getGradient(
	direction: 'horizontal' | 'vertical' | 'diagonal' | number,
	...stops: string[]
): string {
	const deg =
		direction === 'horizontal' ? 90 :
		direction === 'vertical' ? 180 :
		direction === 'diagonal' ? 135 :
		direction;
	return `linear-gradient(${deg}deg, ${stops.join(', ')})`;
}

/**
 * Build a radial gradient string.
 *
 * @param shape - 'circle' or 'ellipse'
 * @param position - Position like 'center', '50% 50%', 'top left'
 * @param stops - Array of color stops
 * @returns CSS radial-gradient string
 */
export function getRadialGradient(
	shape: 'circle' | 'ellipse' = 'circle',
	position: string = 'center',
	...stops: string[]
): string {
	return `radial-gradient(${shape} at ${position}, ${stops.join(', ')})`;
}

// =============================================================================
// SEMANTIC COLOR PALETTE
// =============================================================================

/**
 * Base neutral colors for backgrounds, borders, and text.
 * All use hue 250 (slate) with minimal chroma for neutral appearance.
 */
export const base = {
	/** Main background - oklch(0.22 0.01 250) */
	100: oklch(0.22, 0.01, HUE.slate),
	/** Slightly darker - oklch(0.18 0.015 250) */
	200: oklch(0.18, 0.015, HUE.slate),
	/** Darkest - oklch(0.14 0.02 250) */
	300: oklch(0.14, 0.02, HUE.slate),

	/** Standard border - oklch(0.25 0.02 250) */
	border: oklch(0.25, CHROMA.minimal, HUE.slate),
	/** Subtle border - oklch(0.22 0.02 250) */
	borderSubtle: oklch(0.22, CHROMA.minimal, HUE.slate),
	/** Strong border - oklch(0.30 0.02 250) */
	borderStrong: oklch(0.30, CHROMA.minimal, HUE.slate),

	/** Primary text - oklch(0.85 0.02 250) */
	content: oklch(0.85, CHROMA.minimal, HUE.slate),
	/** Secondary text - oklch(0.60 0.02 250) */
	contentMuted: oklch(0.60, CHROMA.minimal, HUE.slate),
	/** Tertiary text - oklch(0.50 0.02 250) */
	contentSubtle: oklch(0.50, CHROMA.minimal, HUE.slate),
	/** Disabled text - oklch(0.35 0.02 250) */
	contentDisabled: oklch(0.35, CHROMA.minimal, HUE.slate)
} as const;

/**
 * Accent colors for UI elements requiring visual emphasis.
 * Each accent includes a main color and variants.
 */
export const accent = {
	// Primary (blue 240°)
	primary: oklch(0.70, CHROMA.high, HUE.blue),
	primaryBright: oklch(0.80, CHROMA.high, HUE.blue),
	primaryDim: oklch(0.60, CHROMA.medium, HUE.blue),
	primaryMuted: oklch(0.50, CHROMA.low, HUE.blue),

	// Secondary (purple 280°)
	secondary: oklch(0.60, CHROMA.high, HUE.purple),
	secondaryBright: oklch(0.70, CHROMA.vivid, HUE.purple),
	secondaryDim: oklch(0.50, CHROMA.medium, HUE.purple),

	// Info (cyan 200°)
	info: oklch(0.70, CHROMA.medium, HUE.cyan),
	infoBright: oklch(0.85, CHROMA.high, HUE.cyan),
	infoDim: oklch(0.55, CHROMA.medium, HUE.cyan),
	infoHighlight: oklch(0.70, CHROMA.high, 220), // Slightly more blue

	// Success (green 145°)
	success: oklch(0.65, CHROMA.vivid, HUE.green),
	successBright: oklch(0.70, CHROMA.max, HUE.green),
	successDim: oklch(0.55, CHROMA.high, HUE.green),

	// Warning (amber 85°)
	warning: oklch(0.75, CHROMA.medium, HUE.amber),
	warningBright: oklch(0.80, CHROMA.high, HUE.amber),
	warningGold: oklch(0.75, CHROMA.vivid, HUE.amber),

	// Error (red 25°)
	error: oklch(0.65, CHROMA.max, HUE.red),
	errorBright: oklch(0.70, CHROMA.vivid, HUE.red),
	errorDim: oklch(0.55, CHROMA.high, HUE.red)
} as const;

/**
 * State colors for session and task states.
 * Each state has accent (vibrant), bgTint (subtle background), and glow (emphasis) variants.
 */
export const state = {
	// Starting (cyan 200°)
	starting: {
		accent: oklch(0.75, CHROMA.medium, HUE.cyan),
		bgTint: withAlpha(oklch(0.75, CHROMA.medium, HUE.cyan), 0.10),
		glow: withAlpha(oklch(0.75, CHROMA.medium, HUE.cyan), 0.5)
	},

	// Working (blue 250° with slight cyan)
	working: {
		accent: oklch(0.70, CHROMA.high, HUE.slate),
		bgTint: withAlpha(oklch(0.70, CHROMA.high, HUE.slate), 0.08),
		glow: withAlpha(oklch(0.70, CHROMA.high, HUE.slate), 0.4)
	},

	// Needs Input (orange 45°)
	needsInput: {
		accent: oklch(0.75, CHROMA.vivid, HUE.orange),
		bgTint: withAlpha(oklch(0.75, CHROMA.vivid, HUE.orange), 0.10),
		glow: withAlpha(oklch(0.75, CHROMA.vivid, HUE.orange), 0.5)
	},

	// Ready for Review (amber 85°)
	review: {
		accent: oklch(0.70, CHROMA.vivid, HUE.amber),
		bgTint: withAlpha(oklch(0.70, CHROMA.vivid, HUE.amber), 0.08),
		glow: withAlpha(oklch(0.70, CHROMA.vivid, HUE.amber), 0.4)
	},

	// Completing (teal 175°)
	completing: {
		accent: oklch(0.65, CHROMA.medium, 175),
		bgTint: withAlpha(oklch(0.65, CHROMA.medium, 175), 0.08),
		glow: withAlpha(oklch(0.65, CHROMA.medium, 175), 0.4)
	},

	// Completed (green 145°)
	completed: {
		accent: oklch(0.70, CHROMA.vivid, HUE.green),
		bgTint: withAlpha(oklch(0.70, CHROMA.vivid, HUE.green), 0.08),
		glow: withAlpha(oklch(0.70, CHROMA.vivid, HUE.green), 0.4)
	},

	// Idle (slate 250°, muted)
	idle: {
		accent: oklch(0.55, CHROMA.subtle, HUE.slate),
		bgTint: withAlpha(oklch(0.55, CHROMA.subtle, HUE.slate), 0.05),
		glow: withAlpha(oklch(0.55, CHROMA.subtle, HUE.slate), 0.2)
	},

	// Blocked (red 25-30°)
	blocked: {
		accent: oklch(0.55, CHROMA.high, 30),
		bgTint: withAlpha(oklch(0.55, CHROMA.high, 30), 0.08),
		glow: withAlpha(oklch(0.55, CHROMA.high, 30), 0.4)
	},

	// Active/Live (green 145°, bright)
	active: {
		accent: oklch(0.75, CHROMA.vivid, HUE.green),
		bgTint: withAlpha(oklch(0.75, CHROMA.vivid, HUE.green), 0.08),
		glow: withAlpha(oklch(0.75, CHROMA.vivid, HUE.green), 0.4)
	},

	// Recovering (cyan 190°)
	recovering: {
		accent: oklch(0.70, CHROMA.vivid, 190),
		bgTint: withAlpha(oklch(0.70, CHROMA.vivid, 190), 0.10),
		glow: withAlpha(oklch(0.70, CHROMA.vivid, 190), 0.5)
	}
} as const;

/**
 * Issue type accent colors.
 * These provide consistent theming for different task/issue types.
 */
export const issueType = {
	bug: {
		accent: oklch(0.65, 0.25, HUE.red),
		bgTint: withAlpha(oklch(0.65, 0.25, HUE.red), 0.08)
	},
	feature: {
		accent: oklch(0.75, CHROMA.high, HUE.green),
		bgTint: withAlpha(oklch(0.75, CHROMA.high, HUE.green), 0.08)
	},
	task: {
		accent: oklch(0.70, 0.14, HUE.slate),
		bgTint: withAlpha(oklch(0.70, 0.14, HUE.slate), 0.08)
	},
	chore: {
		accent: oklch(0.65, CHROMA.subtle, HUE.slate),
		bgTint: withAlpha(oklch(0.65, CHROMA.subtle, HUE.slate), 0.06)
	},
	epic: {
		accent: oklch(0.70, CHROMA.vivid, 300), // Magenta-purple
		bgTint: withAlpha(oklch(0.70, CHROMA.vivid, 300), 0.08)
	},
	docs: {
		accent: oklch(0.72, 0.12, HUE.cyan),
		bgTint: withAlpha(oklch(0.72, 0.12, HUE.cyan), 0.06)
	},
	refactor: {
		accent: oklch(0.70, 0.16, HUE.amber),
		bgTint: withAlpha(oklch(0.70, 0.16, HUE.amber), 0.08)
	},
	test: {
		accent: oklch(0.68, CHROMA.high, HUE.teal),
		bgTint: withAlpha(oklch(0.68, CHROMA.high, HUE.teal), 0.08)
	}
} as const;

// =============================================================================
// UNIFIED COLOR EXPORT
// =============================================================================

/**
 * Complete color system export.
 *
 * @example
 * import { colors } from '$lib/utils/colorTheme';
 *
 * // Base colors
 * colors.base[100]          // Main background
 * colors.base.content       // Primary text
 *
 * // Accent colors
 * colors.accent.primary     // Primary blue
 * colors.accent.success     // Success green
 *
 * // State colors
 * colors.state.working.accent    // Working state accent
 * colors.state.completed.bgTint  // Completed background tint
 *
 * // Issue types
 * colors.issueType.bug.accent    // Bug red
 */
export const colors = {
	base,
	accent,
	state,
	issueType
} as const;

// =============================================================================
// STYLE BUILDER HELPERS
// =============================================================================

/**
 * Build inline style object for accent bar styling.
 * Commonly used for SessionCard left accent bars.
 *
 * @param colorOrState - Either a raw color string or a state name
 * @returns Style object with background color
 */
export function getAccentBarStyle(colorOrState: string | keyof typeof state): { background: string } {
	if (colorOrState in state) {
		return { background: state[colorOrState as keyof typeof state].accent };
	}
	return { background: colorOrState };
}

/**
 * Build inline style object for glow effects.
 * Creates a box-shadow glow using the provided color.
 *
 * @param color - Color for the glow
 * @param intensity - Glow intensity (small, medium, large)
 * @returns Style object with box-shadow
 */
export function getGlowStyle(
	color: string,
	intensity: 'small' | 'medium' | 'large' = 'medium'
): { boxShadow: string } {
	const sizes = {
		small: '0 0 10px',
		medium: '0 0 20px',
		large: '0 0 30px 5px'
	};
	return { boxShadow: `${sizes[intensity]} ${color}` };
}

/**
 * Build background tint style with optional gradient fade.
 *
 * @param color - Base color for the tint
 * @param alpha - Transparency (0-1)
 * @param fadeDirection - Optional gradient direction
 * @returns Style object with background
 */
export function getTintStyle(
	color: string,
	alpha: number = 0.1,
	fadeDirection?: 'horizontal' | 'vertical'
): { background: string } {
	const tintColor = withAlpha(color, alpha);

	if (fadeDirection) {
		return {
			background: getGradient(fadeDirection, tintColor, 'transparent')
		};
	}

	return { background: tintColor };
}

/**
 * Build border style with left accent.
 *
 * @param color - Accent color
 * @param width - Border width in pixels
 * @returns Style object with borderLeft
 */
export function getAccentBorderStyle(
	color: string,
	width: number = 2
): { borderLeft: string } {
	return { borderLeft: `${width}px solid ${color}` };
}

// =============================================================================
// CSS VARIABLE HELPERS
// =============================================================================

/**
 * Get a CSS variable reference.
 * Useful for referencing theme colors from app.css.
 *
 * @param name - Variable name (without --)
 * @returns CSS var() reference
 *
 * @example
 * cssVar('color-primary')  // 'var(--color-primary)'
 */
export function cssVar(name: string): string {
	return `var(--${name})`;
}

/**
 * Reference to commonly used CSS animation colors from app.css.
 * These match the --anim-* variables defined in the jat theme.
 */
export const animVars = {
	primary: cssVar('anim-primary'),
	primaryBright: cssVar('anim-primary-bright'),
	primaryDim: cssVar('anim-primary-dim'),
	success: cssVar('anim-success'),
	successBright: cssVar('anim-success-bright'),
	successDim: cssVar('anim-success-dim'),
	warning: cssVar('anim-warning'),
	warningBright: cssVar('anim-warning-bright'),
	warningGold: cssVar('anim-warning-gold'),
	error: cssVar('anim-error'),
	errorDim: cssVar('anim-error-dim'),
	info: cssVar('anim-info'),
	infoBright: cssVar('anim-info-bright'),
	infoHighlight: cssVar('anim-info-highlight'),
	secondary: cssVar('anim-secondary'),
	secondaryBright: cssVar('anim-secondary-bright'),
	secondaryDim: cssVar('anim-secondary-dim'),
	baseHover: cssVar('anim-base-hover'),
	baseRow: cssVar('anim-base-row')
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Hue = typeof HUE[keyof typeof HUE];
export type Chroma = typeof CHROMA[keyof typeof CHROMA];
export type Lightness = typeof LIGHTNESS[keyof typeof LIGHTNESS];
export type BaseColor = keyof typeof base;
export type AccentColor = keyof typeof accent;
export type StateColor = keyof typeof state;
export type IssueTypeColor = keyof typeof issueType;
