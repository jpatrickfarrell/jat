/**
 * Worker Pool Exports
 *
 * Re-exports the worker pool API for use in other modules.
 *
 * Usage:
 * ```typescript
 * import {
 *   parseSessionFileAsync,
 *   parseMultipleSessionsAsync,
 *   aggregateHourlyUsageAsync,
 *   parseAllProjectsAsync
 * } from '$lib/server/workers';
 * ```
 */

export {
	getWorkerPool,
	shutdownWorkerPool,
	parseSessionFileAsync,
	parseMultipleSessionsAsync,
	aggregateHourlyUsageAsync,
	parseAllProjectsAsync,
	type TokenUsage,
	type SessionUsageResult,
	type HourlyBucket
} from './workerPool';
