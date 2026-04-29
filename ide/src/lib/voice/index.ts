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
	resolveTaskId,
	TASK_ID_THRESHOLD,
	AMBIGUITY_MARGIN,
	MAX_CANDIDATES,
	type VisibleTask
} from './resolvers/taskIdResolver';

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

export {
	publishVisibleTasks,
	publishSelectedTask,
	publishLastMatchedAction,
	_resetJatContextBridge,
	type VisibleTaskRef
} from './jat-context-builder';

// Side-effect import: registers the JAT context builder with the framework.
// Per PRD §7.4 this is the only supported seam between framework and app.
import './register-jat';
