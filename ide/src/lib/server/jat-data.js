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
	getDataTable as pgGetDataTable,
	updateDataTable as pgUpdateDataTable,
	getTableSchema as pgGetTableSchema,
	getTableRows as pgGetTableRows,
	getColumnMetadata as pgGetColumnMetadata,
	setColumnMetadata as pgSetColumnMetadata,
	deleteColumnMetadata as pgDeleteColumnMetadata,
	addColumn as pgAddColumn,
	deleteColumn as pgDeleteColumn,
	duplicateColumn as pgDuplicateColumn,
	renameColumn as pgRenameColumn,
	createDataTable as pgCreateDataTable,
	dropDataTable as pgDropDataTable,
	renameDataTable as pgRenameDataTable,
	duplicateDataTable as pgDuplicateDataTable,
	insertRow as pgInsertRow,
	insertRows as pgInsertRows,
	getRow as pgGetRow,
	updateRow as pgUpdateRow,
	deleteRow as pgDeleteRow,
	batchUpdateRows as pgBatchUpdateRows,
	getAllViews as pgGetAllViews,
	getViews as pgGetViews,
	getView as pgGetView,
	createView as pgCreateView,
	updateView as pgUpdateView,
	deleteView as pgDeleteView,
	getViewRows as pgGetViewRows,
	getContextView as pgGetContextView,
	setContextView as pgSetContextView,
	previewContextQuery as pgPreviewContextQuery,
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
	getDataTable,
	getTableSchema,
	createDataTable,
	dropDataTable,
	updateDataTable,
	renameDataTable,
	duplicateDataTable,
	// Column Metadata
	getColumnMetadata,
	setColumnMetadata,
	deleteColumnMetadata,
	deleteTableColumnMetadata,
	// Rows
	getTableRows,
	getRow,
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
