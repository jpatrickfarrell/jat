/**
 * Parameter Resolver Framework
 *
 * Generic registry for translating raw parameter text from an LLM intent into
 * concrete domain values (task IDs, session names, project slugs, etc). The
 * framework owns dispatch only — it never knows what shapes are valid for a
 * given parameter type. Apps register one resolver per parameter type via
 * `registerResolver(paramType, fn)`; the interpret pipeline then calls
 * `resolveParameter(paramType, text, ctx)` when an action's matched parameter
 * has that type.
 *
 * This is the third registration surface alongside `registerActions` and
 * `registerContextBuilder` (PRD §7.4) and is what lets future tenants plug a
 * `contract-id` resolver, `fellow-id` resolver, etc., into the same pipeline
 * without touching framework code.
 */

/**
 * Tri-state result returned by every resolver. `resolved` means a single
 * unambiguous match; `ambiguous` means several candidates scored within the
 * margin and the user must disambiguate; `not-found` means nothing scored
 * above the resolver's threshold.
 */
export type ResolveResult =
	| { status: 'resolved'; value: unknown; confidence?: number }
	| {
			status: 'ambiguous';
			candidates: Array<{ value: unknown; label: string; confidence?: number }>;
	  }
	| { status: 'not-found'; reason?: string };

/**
 * Opaque context blob assembled by the registered context-builder. The
 * framework treats it as `Record<string, unknown>`; resolvers cast to whatever
 * shape their app defines.
 */
export type ResolverContext = Record<string, unknown>;

export type Resolver = (text: string, ctx: ResolverContext) => ResolveResult;

const resolvers = new Map<string, Resolver>();

/**
 * Register a resolver for a parameter type. Re-registering the same paramType
 * replaces the prior resolver so Vite HMR doesn't accumulate duplicates.
 */
export function registerResolver(paramType: string, fn: Resolver): void {
	resolvers.set(paramType, fn);
}

/** Look up a resolver by paramType. Returns undefined if none registered. */
export function getResolver(paramType: string): Resolver | undefined {
	return resolvers.get(paramType);
}

/**
 * Resolve a single parameter. Returns `not-found` (with a diagnostic reason)
 * when no resolver is registered for the type — callers that want strict
 * behavior should check `getResolver()` first.
 */
export function resolveParameter(
	paramType: string,
	text: string,
	ctx: ResolverContext
): ResolveResult {
	const fn = resolvers.get(paramType);
	if (!fn) {
		return {
			status: 'not-found',
			reason: `No resolver registered for paramType "${paramType}"`
		};
	}
	return fn(text, ctx);
}

/** For tests — clears the registry. */
export function _resetParameterResolvers(): void {
	resolvers.clear();
}
