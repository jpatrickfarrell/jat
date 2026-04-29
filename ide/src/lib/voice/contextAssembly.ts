/**
 * Voice context-assembly framework (generic, tenant-agnostic).
 *
 * Spec: ide/docs/prd-siri-for-jat.md §5.4 + §7.4.
 *
 * Apps register a single context builder via `registerContextBuilder(fn)`. At
 * dispatch time the framework calls the builder with the current route, runs
 * a 4 KB size enforcement (trimming oldest non-hovered items first), and
 * returns a stable serialized blob to inject as the dynamic prompt suffix.
 *
 * The framework is opaque to tenant-specific shapes. The only contract is the
 * `AssembledContext` envelope: `pinned` fields are kept verbatim; `trimmable`
 * arrays are tail-trimmed until the serialized payload fits the budget.
 *
 * Tenants are responsible for ordering trimmable arrays so the most-relevant
 * (hovered/selected) item is at index 0 — or for placing references to those
 * items in `pinned`. The framework does not inspect array contents.
 */

/** Soft cap on the rendered context block (PRD §5.4 acceptance). */
export const CONTEXT_BUDGET_BYTES = 4 * 1024;

/**
 * Stable shape returned by a registered context builder.
 *
 * `pinned`     — opaque object kept verbatim. Use for route, hoveredSession,
 *                selectedTask, projects, lastMatchedAction — anything the
 *                builder considers load-bearing for dispatch.
 * `trimmable`  — named arrays the framework may shrink. Sort newest/highest-
 *                priority first; the tail is dropped first.
 */
export interface AssembledContext {
	pinned: Record<string, unknown>;
	trimmable: Record<string, readonly unknown[]>;
}

export type ContextBuilder = (args: {
	route: string;
}) => AssembledContext | Promise<AssembledContext>;

export interface AssemblyResult {
	/** Final envelope after trim — same shape as the builder return. */
	context: AssembledContext;
	/** Deterministic JSON string suitable for prompt injection. */
	serialized: string;
	/** Byte count of `serialized` (UTF-8). */
	sizeBytes: number;
	/** True when the framework trimmed at least one item to fit the budget. */
	truncated: boolean;
	/** Per-array trim counts for telemetry / tests. */
	dropped: Record<string, number>;
}

let registeredBuilder: ContextBuilder | null = null;

/**
 * Register the app's context builder. Call once at module load. Re-registration
 * replaces the prior builder (HMR-friendly, mirrors `registerVoiceActionHandlers`).
 */
export function registerContextBuilder(fn: ContextBuilder): void {
	registeredBuilder = fn;
}

/** True iff a builder is registered. */
export function hasContextBuilder(): boolean {
	return registeredBuilder !== null;
}

/** For tests — clears the registry slot. */
export function _resetContextBuilder(): void {
	registeredBuilder = null;
}

/**
 * Assemble the prompt-suffix context for the current dispatch.
 *
 * Returns an empty envelope when no builder is registered (callers should treat
 * this as "no app context" — dispatch falls back to vocabulary-only prompts).
 */
export async function assembleContext(args: {
	route: string;
	budgetBytes?: number;
}): Promise<AssemblyResult> {
	const budget = args.budgetBytes ?? CONTEXT_BUDGET_BYTES;

	if (!registeredBuilder) {
		const empty: AssembledContext = { pinned: {}, trimmable: {} };
		const serialized = serializeContext(empty);
		return {
			context: empty,
			serialized,
			sizeBytes: byteLen(serialized),
			truncated: false,
			dropped: {}
		};
	}

	const built = await registeredBuilder({ route: args.route });
	const trimmable = cloneTrimmable(built.trimmable);
	const dropped: Record<string, number> = {};
	for (const key of Object.keys(trimmable)) dropped[key] = 0;

	let working: AssembledContext = { pinned: built.pinned, trimmable };
	let serialized = serializeContext(working);
	let size = byteLen(serialized);
	let truncated = false;

	// Round-robin tail-trim across trimmable arrays until under budget.
	// Largest array is shrunk first each pass; this keeps the trim "oldest
	// non-hovered first" while sharing the burden when arrays are similarly
	// sized. Pinned fields are never touched.
	const arrayKeys = Object.keys(trimmable);
	while (size > budget) {
		let target: string | null = null;
		let targetLen = 0;
		for (const key of arrayKeys) {
			const len = trimmable[key].length;
			if (len > targetLen) {
				target = key;
				targetLen = len;
			}
		}
		if (!target) break; // nothing left to trim
		// Drop the tail entry (oldest by builder convention).
		(trimmable[target] as unknown[]).pop();
		dropped[target] += 1;
		truncated = true;
		serialized = serializeContext(working);
		size = byteLen(serialized);
	}

	return {
		context: working,
		serialized,
		sizeBytes: size,
		truncated,
		dropped
	};
}

/**
 * Stable JSON serialization. We keep top-level key order = `pinned` first,
 * `trimmable` second so prompt-prefix caching has a stable suffix shape.
 * Within each section, keys are sorted alphabetically for determinism.
 */
function serializeContext(ctx: AssembledContext): string {
	return JSON.stringify({
		pinned: sortObject(ctx.pinned),
		trimmable: sortObject(ctx.trimmable as Record<string, unknown>)
	});
}

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const key of Object.keys(obj).sort()) out[key] = obj[key];
	return out;
}

function cloneTrimmable(
	src: Record<string, readonly unknown[]>
): Record<string, unknown[]> {
	const out: Record<string, unknown[]> = {};
	for (const [key, arr] of Object.entries(src)) out[key] = [...arr];
	return out;
}

function byteLen(s: string): number {
	// Buffer is server-only; use TextEncoder which is universal.
	return new TextEncoder().encode(s).byteLength;
}
