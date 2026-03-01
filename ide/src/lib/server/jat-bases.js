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
	// Task attachment
	attachBaseToTask,
	detachBaseFromTask,
	getTaskBases,
	// Search
	searchBases,
	// Render
	renderBase,
} from '../../../../lib/bases.js';
