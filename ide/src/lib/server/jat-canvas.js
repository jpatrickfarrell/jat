/**
 * Server-side canvas integration
 * Wraps lib/canvas.js for use in SvelteKit server routes
 */

export {
	listCanvasPages,
	getCanvasPage,
	createCanvasPage,
	updateCanvasPage,
	deleteCanvasPage,
} from '../../../../lib/canvas.js';
