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
	// Task ↔ Base attachment
	attachBaseToTask,
	detachBaseFromTask,
	getTaskBases,
	// Task ↔ Data Table attachment
	attachTableToTask,
	detachTableFromTask,
	getTaskTables,
	renderDataTable,
	// Search
	searchBases,
	// Render
	renderBase,
} from '../../../../lib/bases.js';
