/**
 * Conditional formatting engine for data table cells.
 *
 * Supports two types of formatting:
 *   1. Conditional rules — threshold-based conditions with text/bg colors and formatting
 *   2. Color scales — numeric gradient interpolation across color stops
 *
 * Uses oklch color space for perceptually uniform gradients.
 */

import type {
	ColorStop,
	ColorScaleRule,
	ConditionalFormatRule,
	FormatCondition,
	TableConditionalFormat,
	TextFormatting,
} from '$lib/types/dataTable';

// ---------------------------------------------------------------------------
// oklch color utilities
// ---------------------------------------------------------------------------

/** Parse an oklch color string into [L, C, H] components */
function parseOklch(color: string): [number, number, number] | null {
	const m = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
	if (!m) return null;
	return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
}

/** Interpolate between two oklch colors at ratio t (0–1) */
function lerpOklch(
	a: [number, number, number],
	b: [number, number, number],
	t: number,
): string {
	const l = a[0] + (b[0] - a[0]) * t;
	const c = a[1] + (b[1] - a[1]) * t;

	// Interpolate hue via shortest path
	let dh = b[2] - a[2];
	if (dh > 180) dh -= 360;
	if (dh < -180) dh += 360;
	let h = a[2] + dh * t;
	if (h < 0) h += 360;
	if (h >= 360) h -= 360;

	return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

// ---------------------------------------------------------------------------
// Condition evaluation
// ---------------------------------------------------------------------------

/** Coerce a cell value to a number, returning NaN if not numeric */
function toNumber(value: unknown): number {
	if (typeof value === 'number') return value;
	if (value == null || value === '') return NaN;
	return parseFloat(String(value));
}

/** Coerce a cell value to a comparable string */
function toString(value: unknown): string {
	if (value == null) return '';
	return String(value);
}

/**
 * Evaluate a single format condition against a row of data.
 */
export function evaluateCondition(
	condition: FormatCondition,
	row: Record<string, unknown>,
): boolean {
	const cellValue = row[condition.column];
	const { operator, value, value2 } = condition;

	// Empty/non-empty checks don't need a comparison value
	if (operator === 'is_empty') {
		return cellValue == null || String(cellValue).trim() === '';
	}
	if (operator === 'is_not_empty') {
		return cellValue != null && String(cellValue).trim() !== '';
	}

	// Numeric comparisons
	if (['>', '>=', '<', '<=', 'between'].includes(operator)) {
		const num = toNumber(cellValue);
		const cmp = toNumber(value);
		if (isNaN(num) || isNaN(cmp)) return false;

		switch (operator) {
			case '>': return num > cmp;
			case '>=': return num >= cmp;
			case '<': return num < cmp;
			case '<=': return num <= cmp;
			case 'between': {
				const cmp2 = toNumber(value2);
				if (isNaN(cmp2)) return false;
				return num >= Math.min(cmp, cmp2) && num <= Math.max(cmp, cmp2);
			}
		}
	}

	// String comparisons (case-insensitive)
	const str = toString(cellValue).toLowerCase();
	const cmpStr = (value ?? '').toLowerCase();

	switch (operator) {
		case '==': return str === cmpStr;
		case '!=': return str !== cmpStr;
		case 'contains': return str.includes(cmpStr);
		case 'not_contains': return !str.includes(cmpStr);
		case 'starts_with': return str.startsWith(cmpStr);
		case 'ends_with': return str.endsWith(cmpStr);
	}

	return false;
}

/**
 * Evaluate a conditional format rule against a row.
 * All conditions must match (AND logic).
 */
export function evaluateRule(
	rule: ConditionalFormatRule,
	row: Record<string, unknown>,
): boolean {
	if (!rule.enabled || !rule.conditions.length) return false;
	return rule.conditions.every(c => evaluateCondition(c, row));
}

// ---------------------------------------------------------------------------
// Color scale interpolation
// ---------------------------------------------------------------------------

/**
 * Interpolate a color from a color scale based on a numeric value's position.
 */
export function interpolateColorScale(
	value: unknown,
	rule: ColorScaleRule,
	min: number,
	max: number,
): string | null {
	if (!rule.enabled || !rule.colorStops?.length) return null;

	const num = toNumber(value);
	if (isNaN(num)) return null;

	const effectiveMin = rule.rangeMode === 'manual' && rule.manualMin != null ? rule.manualMin : min;
	const effectiveMax = rule.rangeMode === 'manual' && rule.manualMax != null ? rule.manualMax : max;

	const range = effectiveMax - effectiveMin;
	if (range === 0) {
		const midStop = rule.colorStops[Math.floor(rule.colorStops.length / 2)];
		return midStop.color;
	}

	const position = Math.max(0, Math.min(100, ((num - effectiveMin) / range) * 100));
	const stops = [...rule.colorStops].sort((a, b) => a.position - b.position);

	if (position <= stops[0].position) return stops[0].color;
	if (position >= stops[stops.length - 1].position) return stops[stops.length - 1].color;

	for (let i = 0; i < stops.length - 1; i++) {
		if (position >= stops[i].position && position <= stops[i + 1].position) {
			const segRange = stops[i + 1].position - stops[i].position;
			const t = segRange === 0 ? 0 : (position - stops[i].position) / segRange;

			const colorA = parseOklch(stops[i].color);
			const colorB = parseOklch(stops[i + 1].color);

			if (colorA && colorB) return lerpOklch(colorA, colorB, t);
			return t < 0.5 ? stops[i].color : stops[i + 1].color;
		}
	}
	return null;
}

// ---------------------------------------------------------------------------
// Compute column range for color scales
// ---------------------------------------------------------------------------

export function computeColumnRange(
	rows: Record<string, unknown>[],
	columnName: string,
): { min: number; max: number } {
	let min = Infinity;
	let max = -Infinity;

	for (const row of rows) {
		const num = toNumber(row[columnName]);
		if (!isNaN(num)) {
			if (num < min) min = num;
			if (num > max) max = num;
		}
	}

	if (min === Infinity) return { min: 0, max: 0 };
	return { min, max };
}

// ---------------------------------------------------------------------------
// Cell style computation — the main entry point
// ---------------------------------------------------------------------------

export interface CellStyle {
	backgroundColor?: string;
	textColor?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
}

/**
 * Compute the combined style for a cell given the table's conditional format config.
 *
 * Rules are evaluated in order. The first matching rule's styles are applied.
 * Color scales are applied separately (they don't conflict with rules).
 *
 * @param columnName - The column this cell belongs to
 * @param row - The full row data
 * @param format - The table-level conditional format configuration
 * @param columnRanges - Precomputed min/max for numeric columns (for color scales)
 */
export function getCellStyle(
	columnName: string,
	row: Record<string, unknown>,
	format: TableConditionalFormat | null | undefined,
	columnRanges: Record<string, { min: number; max: number }>,
): CellStyle | null {
	if (!format) return null;

	const style: CellStyle = {};
	let hasStyle = false;

	// 1. Evaluate conditional rules (first match wins)
	for (const rule of format.rules) {
		if (!rule.enabled) continue;

		// Check if this rule applies to this column
		const appliesTo = rule.applyTo === 'all_columns' ||
			(Array.isArray(rule.applyTo) && rule.applyTo.includes(columnName));
		if (!appliesTo) continue;

		if (evaluateRule(rule, row)) {
			if (rule.textColor) { style.textColor = rule.textColor; hasStyle = true; }
			if (rule.backgroundColor) { style.backgroundColor = rule.backgroundColor; hasStyle = true; }
			if (rule.formatting) {
				if (rule.formatting.bold) { style.bold = true; hasStyle = true; }
				if (rule.formatting.italic) { style.italic = true; hasStyle = true; }
				if (rule.formatting.underline) { style.underline = true; hasStyle = true; }
				if (rule.formatting.strikethrough) { style.strikethrough = true; hasStyle = true; }
			}
			break; // First match wins
		}
	}

	// 2. Apply color scales (can layer on top of rules, bg only)
	for (const scale of format.colorScales) {
		if (!scale.enabled) continue;

		const appliesTo = scale.applyTo === 'value_column'
			? scale.column === columnName
			: Array.isArray(scale.applyTo) && scale.applyTo.includes(columnName);
		if (!appliesTo) continue;

		const range = columnRanges[scale.column];
		if (!range) continue;

		const color = interpolateColorScale(row[scale.column], scale, range.min, range.max);
		if (color && !style.backgroundColor) {
			// Use at 25% opacity for readability
			style.backgroundColor = `color-mix(in oklch, ${color} 25%, transparent)`;
			hasStyle = true;
		}
	}

	return hasStyle ? style : null;
}

/**
 * Convert a CellStyle to an inline CSS string.
 */
export function cellStyleToCSS(style: CellStyle | null): string {
	if (!style) return '';
	const parts: string[] = [];
	if (style.backgroundColor) parts.push(`background-color: ${style.backgroundColor}`);
	if (style.textColor) parts.push(`color: ${style.textColor}`);
	if (style.bold) parts.push('font-weight: 700');
	if (style.italic) parts.push('font-style: italic');
	if (style.underline && style.strikethrough) {
		parts.push('text-decoration: underline line-through');
	} else if (style.underline) {
		parts.push('text-decoration: underline');
	} else if (style.strikethrough) {
		parts.push('text-decoration: line-through');
	}
	return parts.join('; ');
}
