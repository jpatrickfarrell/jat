/**
 * Voice framework barrel — generic, tenant-agnostic surface only.
 *
 * Per PRD §7.4 acceptance criterion: "No compile-time imports of JAT-specific
 * data from framework modules." This file MUST NOT export anything that knows
 * what a JAT task, project, or session is. App-specific symbols (resolvers,
 * publishers, the JAT context builder, the registration side-effect) live in
 * `./jat` and are imported separately by the app boot path.
 *
 * Future tenants depend on this barrel; they should never see anything JAT.
 */

export type {
	TranscribeResult,
	TranscribeProvider,
	IntentResult,
	IntentProvider,
	SpeakProvider
} from './types';

export { voice, type VoiceStatus } from './voiceSubsystem.svelte';

export {
	registerResolver,
	getResolver,
	resolveParameter,
	_resetParameterResolvers,
	type Resolver,
	type ResolveResult,
	type ResolverContext
} from './parameterResolver';

export {
	registerContextBuilder,
	hasContextBuilder,
	assembleContext,
	CONTEXT_BUDGET_BYTES,
	_resetContextBuilder,
	type AssembledContext,
	type ContextBuilder,
	type AssemblyResult
} from './contextAssembly';
