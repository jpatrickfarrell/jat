/**
 * Server-side data store integration
 * Wraps lib/data.js for use in SvelteKit server routes
 */

export {
	// Init
	initDataDb,
	// Validation
	validateTableName,
	validateColumnName,
	validateColumnType,
	validateSemanticType,
	// Tables
	getDataTables,
	getTableSchema,
	createDataTable,
	dropDataTable,
	renameDataTable,
	duplicateDataTable,
	// Column Metadata
	getColumnMetadata,
	setColumnMetadata,
	deleteColumnMetadata,
	deleteTableColumnMetadata,
	// Rows
	getTableRows,
	insertRow,
	insertRows,
	updateRow,
	deleteRow,
	duplicateRow,
	// Column Operations
	addColumn,
	deleteColumn,
	duplicateColumn,
	renameColumn,
	// Context Views
	getContextView,
	setContextView,
	previewContextQuery,
	// Raw SQL
	queryDataTable,
	execDataSql,
	// Views
	getViews,
	getAllViews,
	getView,
	createView,
	updateView,
	deleteView,
	getViewRows,
	// Resolution
	resolveRelationColumns,
	// System Tables
	isSystemTable,
	getSystemTables,
	getSystemTableSchema,
	getSystemTableRows,
} from '../../../../lib/data.js';
