/**
 * Mobile surface tokens.
 *
 * Colors that aren't semantic enough to belong in SESSION_STATE_VISUALS but
 * are shared across mobile components (terminal surface, panel chrome, form
 * controls). Keep this list tight — if a token isn't used in 2+ places,
 * inline it in the component instead.
 *
 * Semantic, state-driven colors should come from SESSION_STATE_VISUALS in
 * `statusColors.ts`, not from this file.
 */
export const mobileSurface = {
	terminalBg: 'oklch(0.17 0.01 250)',
	terminalFg: 'oklch(0.90 0.01 250)',
	panelBg: 'oklch(0.20 0.02 250)',
	inputBg: 'oklch(0.18 0.02 250)',
	hoverBg: 'oklch(0.25 0.03 250)',
	subtleBorder: 'oklch(0.40 0.03 250)',
	textMuted: 'oklch(0.65 0.02 250)',
	textDim: 'oklch(0.80 0.02 250)',
	textBright: 'oklch(0.98 0.01 250)'
} as const;

export type MobileSurface = typeof mobileSurface;
