/**
 * JAT's voice-framework registration layer.
 *
 * Importing this module is the only thing that wires JAT's app-specific data
 * (currently: the context builder) into the generic framework in
 * `contextAssembly.ts`. Per PRD §7.4 this is the only supported seam between
 * "the framework" and "the app". Future tenants ship a sibling
 * `register-{tenant}.ts` calling the same APIs with different inputs.
 *
 * Side-effect on import: registers the JAT context builder. Module load is
 * idempotent — `registerContextBuilder` replaces on re-call so HMR is safe.
 */

import { registerContextBuilder } from './contextAssembly';
import { buildJatContext } from './jat-context-builder';

registerContextBuilder(buildJatContext);
