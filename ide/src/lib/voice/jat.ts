/**
 * JAT-specific voice barrel.
 *
 * Importing this module is the seam between the generic voice framework
 * (`./index.ts`, `./parameterResolver.ts`, `./contextAssembly.ts`) and the
 * JAT app's data: visible-task publishers, the task-id resolver, and the
 * `registerContextBuilder()` side effect.
 *
 * Import this once at app boot (e.g. in `+layout.svelte`); from anywhere else
 * import only `'$lib/voice'`.
 *
 * Future tenants ship their own `./meadow.ts`, `./flush.ts`, etc. — same
 * pattern, different registrations, no framework changes.
 */

export {
	resolveTaskId,
	TASK_ID_THRESHOLD,
	AMBIGUITY_MARGIN,
	MAX_CANDIDATES,
	type VisibleTask
} from './resolvers/taskIdResolver';

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
