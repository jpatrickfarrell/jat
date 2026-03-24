/**
 * Server-side knowledge bases integration
 * Wraps lib/bases.js for use in SvelteKit server routes
 */

export {
	// Init
	initBasesDb,
	// Validation
	validateSourceType,
	// Bases CRUD
	getBases,
	getBase,
	createBase,
	updateBase,
	deleteBase,
	reorderBases,
	// Task ↔ Base attachment
	attachBaseToTask,
	detachBaseFromTask,
	getTaskBases,
	// Task ↔ Data Table attachment
	attachTableToTask,
	detachTableFromTask,
	getTaskTables,
	renderDataTable,
	renderDataView,
	// Search
	searchBases,
	// Render
	renderBase,
	resolveReferences,
	// Canvas compatibility
	listCanvasPages,
	getCanvasPage,
	createCanvasPage,
	updateCanvasPage,
	deleteCanvasPage,
	listCanvasBasePages,
	serializeCanvasToMarkdown,
} from '../../../../lib/bases.js';
