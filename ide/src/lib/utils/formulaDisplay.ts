/**
 * Shared formula display utilities for rendering @fx:expression
 * as evaluated values with hover tooltips across the IDE.
 */

import { evaluateFormula } from '$lib/utils/formulaEval';

export interface FxSegment {
	type: 'text' | 'formula';
	display: string;
	tooltip?: string;
}

/**
 * Parse text containing @fx:expression(...) into segments.
 * Formula segments get evaluated against the provided context.
 */
export function parseFx(text: string, ctx: Record<string, any> = {}): FxSegment[] {
	if (!text || !text.includes('@fx:')) return [{ type: 'text', display: text }];

	const segs: FxSegment[] = [];
	const re = /@fx:([a-zA-Z_]\w*\([^)]*(?:\([^)]*\))*[^)]*\))/g;
	let last = 0;
	let m: RegExpExecArray | null;

	while ((m = re.exec(text)) !== null) {
		if (m.index > last) segs.push({ type: 'text', display: text.slice(last, m.index) });
		const expr = m[1];
		let display: string;
		try {
			const r = evaluateFormula(expr, ctx);
			display = r !== null && r !== undefined ? String(r) : expr;
		} catch {
			display = expr;
		}
		segs.push({ type: 'formula', display, tooltip: `ƒx ${expr}` });
		last = re.lastIndex;
	}

	if (last < text.length) segs.push({ type: 'text', display: text.slice(last) });
	return segs;
}

/** Check if text contains any @fx: formula references */
export function hasFx(text: string): boolean {
	return !!text && text.includes('@fx:');
}
