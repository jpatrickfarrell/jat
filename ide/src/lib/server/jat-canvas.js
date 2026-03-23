/**
 * Server-side canvas integration
 * Re-exports from unified lib/bases.js for use in SvelteKit server routes
 */

export {
	listCanvasPages,
	getCanvasPage,
	createCanvasPage,
	updateCanvasPage,
	deleteCanvasPage,
	listCanvasBasePages,
	serializeCanvasToMarkdown,
} from '../../../../lib/bases.js';

export {
	getTemplates,
	getTemplate,
	instantiateTemplate,
	seedCanvasTemplates,
} from '../../../../lib/canvas-templates.js';
