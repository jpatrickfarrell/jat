/**
 * Server-side data store integration
 * Wraps lib/data.js for use in SvelteKit server routes.
 *
 * Postgres-backed projects use the `pg*` re-exports below (from
 * lib/data-postgres.js). Call isPostgresProject(projectName) to decide
 * which path to take; the SQLite exports remain sync, the pg exports
 * are async.
 */

export {
	isPostgresProject,
	getDataTables as pgGetDataTables,
	getTableSchema as pgGetTableSchema,
	getTableRows as pgGetTableRows,
	getColumnMetadata as pgGetColumnMetadata,
	createDataTable as pgCreateDataTable,
	dropDataTable as pgDropDataTable,
	insertRow as pgInsertRow,
	updateRow as pgUpdateRow,
	deleteRow as pgDeleteRow,
	getAllViews as pgGetAllViews,
	getSystemTables as pgGetSystemTables,
	queryDataTable as pgQueryDataTable,
	execDataSql as pgExecDataSql,
} from '../../../../lib/data-postgres.js';

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
	batchUpdateRows,
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
