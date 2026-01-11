/**
 * Worker Pool Manager
 *
 * Manages a pool of worker threads for offloading expensive JSONL parsing
 * operations from the main event loop.
 *
 * Features:
 * - Configurable pool size (defaults to CPU cores - 1)
 * - Task queuing with FIFO execution
 * - Automatic worker recycling on error
 * - Timeout handling
 * - Graceful shutdown
 */

import { Worker } from 'worker_threads';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

// ============================================================================
// Types
// ============================================================================

interface PendingTask {
	id: number;
	resolve: (result: any) => void;
	reject: (error: Error) => void;
	timeout: ReturnType<typeof setTimeout>;
}

interface WorkerState {
	worker: Worker;
	busy: boolean;
	taskCount: number;
}

type MessageType = 'parseSessionFile' | 'parseMultipleSessions' | 'aggregateHourlyUsage' | 'parseAllProjects';

// ============================================================================
// Worker Pool Class
// ============================================================================

class WorkerPool {
	private workers: WorkerState[] = [];
	private taskQueue: Array<{ type: MessageType; payload: any; resolve: Function; reject: Function }> = [];
	private pendingTasks = new Map<number, PendingTask>();
	private nextTaskId = 0;
	private isShuttingDown = false;
	private initialized = false;
	private initPromise: Promise<void> | null = null;

	// Configuration
	private readonly poolSize: number;
	private readonly taskTimeout: number;
	private readonly workerPath: string;

	constructor(options: { poolSize?: number; taskTimeout?: number } = {}) {
		// Default to CPU cores - 1, minimum 1, maximum 4
		const cpuCount = os.cpus().length;
		this.poolSize = Math.min(Math.max(options.poolSize ?? cpuCount - 1, 1), 4);
		this.taskTimeout = options.taskTimeout ?? 30000; // 30 second default timeout

		// Worker file path - use import.meta.url for ESM compatibility
		// This resolves to the directory containing this file
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		this.workerPath = path.join(__dirname, 'jsonlWorker.ts');
	}

	/**
	 * Initialize the worker pool
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;
		if (this.initPromise) return this.initPromise;

		this.initPromise = this._doInitialize();
		return this.initPromise;
	}

	private async _doInitialize(): Promise<void> {
		console.log(`[WorkerPool] Initializing with ${this.poolSize} workers...`);

		for (let i = 0; i < this.poolSize; i++) {
			await this.createWorker();
		}

		this.initialized = true;
		console.log(`[WorkerPool] Initialized ${this.workers.length} workers`);
	}

	/**
	 * Create a new worker
	 */
	private async createWorker(): Promise<WorkerState> {
		return new Promise((resolve, reject) => {
			try {
				// Use tsx to run TypeScript workers in development
				const worker = new Worker(this.workerPath, {
					execArgv: ['--import', 'tsx']
				});

				const state: WorkerState = {
					worker,
					busy: false,
					taskCount: 0
				};

				worker.on('message', (response: { id: number; success: boolean; result?: any; error?: string }) => {
					const pending = this.pendingTasks.get(response.id);
					if (!pending) return;

					clearTimeout(pending.timeout);
					this.pendingTasks.delete(response.id);

					// Mark worker as available
					state.busy = false;

					if (response.success) {
						pending.resolve(response.result);
					} else {
						pending.reject(new Error(response.error || 'Worker task failed'));
					}

					// Process next queued task
					this.processQueue();
				});

				worker.on('error', (error) => {
					console.error('[WorkerPool] Worker error:', error);
					this.handleWorkerFailure(state);
				});

				worker.on('exit', (code) => {
					if (code !== 0 && !this.isShuttingDown) {
						console.warn(`[WorkerPool] Worker exited with code ${code}, replacing...`);
						this.handleWorkerFailure(state);
					}
				});

				// Worker is ready when it's listening for messages
				worker.on('online', () => {
					this.workers.push(state);
					resolve(state);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Handle worker failure - reject pending task and replace worker
	 */
	private async handleWorkerFailure(state: WorkerState): Promise<void> {
		// Remove from pool
		const index = this.workers.indexOf(state);
		if (index !== -1) {
			this.workers.splice(index, 1);
		}

		// Terminate worker
		try {
			await state.worker.terminate();
		} catch {
			// Ignore termination errors
		}

		// Replace worker if not shutting down
		if (!this.isShuttingDown) {
			try {
				await this.createWorker();
			} catch (error) {
				console.error('[WorkerPool] Failed to replace worker:', error);
			}
		}
	}

	/**
	 * Find an available worker
	 */
	private getAvailableWorker(): WorkerState | null {
		return this.workers.find(w => !w.busy) || null;
	}

	/**
	 * Process queued tasks
	 */
	private processQueue(): void {
		if (this.taskQueue.length === 0) return;

		const worker = this.getAvailableWorker();
		if (!worker) return;

		const task = this.taskQueue.shift()!;
		this.executeTask(worker, task.type, task.payload, task.resolve, task.reject);
	}

	/**
	 * Execute a task on a specific worker
	 */
	private executeTask(
		state: WorkerState,
		type: MessageType,
		payload: any,
		resolve: Function,
		reject: Function
	): void {
		const id = this.nextTaskId++;
		state.busy = true;
		state.taskCount++;

		// Set up timeout
		const timeout = setTimeout(() => {
			const pending = this.pendingTasks.get(id);
			if (pending) {
				this.pendingTasks.delete(id);
				state.busy = false;
				pending.reject(new Error(`Worker task timed out after ${this.taskTimeout}ms`));
				this.processQueue();
			}
		}, this.taskTimeout);

		this.pendingTasks.set(id, {
			id,
			resolve: resolve as (result: any) => void,
			reject: reject as (error: Error) => void,
			timeout
		});

		state.worker.postMessage({ id, type, payload });
	}

	/**
	 * Run a task - will queue if no workers available
	 */
	async runTask<T>(type: MessageType, payload: any): Promise<T> {
		// Ensure pool is initialized
		await this.initialize();

		return new Promise((resolve, reject) => {
			const worker = this.getAvailableWorker();

			if (worker) {
				this.executeTask(worker, type, payload, resolve, reject);
			} else {
				// Queue the task
				this.taskQueue.push({ type, payload, resolve, reject });
			}
		});
	}

	/**
	 * Gracefully shutdown the pool
	 */
	async shutdown(): Promise<void> {
		this.isShuttingDown = true;

		// Clear task queue
		for (const task of this.taskQueue) {
			task.reject(new Error('Worker pool shutting down'));
		}
		this.taskQueue = [];

		// Clear pending tasks
		for (const pending of this.pendingTasks.values()) {
			clearTimeout(pending.timeout);
			pending.reject(new Error('Worker pool shutting down'));
		}
		this.pendingTasks.clear();

		// Terminate all workers
		await Promise.all(
			this.workers.map(async (state) => {
				try {
					await state.worker.terminate();
				} catch {
					// Ignore termination errors
				}
			})
		);

		this.workers = [];
		this.initialized = false;
		this.initPromise = null;
	}

	/**
	 * Get pool statistics
	 */
	stats(): {
		poolSize: number;
		activeWorkers: number;
		busyWorkers: number;
		queuedTasks: number;
		pendingTasks: number;
	} {
		return {
			poolSize: this.poolSize,
			activeWorkers: this.workers.length,
			busyWorkers: this.workers.filter(w => w.busy).length,
			queuedTasks: this.taskQueue.length,
			pendingTasks: this.pendingTasks.size
		};
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let poolInstance: WorkerPool | null = null;

/**
 * Get or create the worker pool singleton
 */
export function getWorkerPool(): WorkerPool {
	if (!poolInstance) {
		poolInstance = new WorkerPool();
	}
	return poolInstance;
}

/**
 * Shutdown the worker pool (for cleanup)
 */
export async function shutdownWorkerPool(): Promise<void> {
	if (poolInstance) {
		await poolInstance.shutdown();
		poolInstance = null;
	}
}

// ============================================================================
// Convenience Functions
// ============================================================================

export interface TokenUsage {
	input_tokens: number;
	cache_creation_input_tokens: number;
	cache_read_input_tokens: number;
	output_tokens: number;
	total_tokens: number;
	cost: number;
	sessionCount: number;
}

export interface SessionUsageResult {
	sessionId: string;
	agentName: string | null;
	timestamp: string;
	tokens: {
		input: number;
		cache_creation: number;
		cache_read: number;
		output: number;
		total: number;
	};
	cost: number;
}

export interface HourlyBucket {
	timestamp: string;
	tokens: number;
	cost: number;
}

/**
 * Parse a single JSONL session file in a worker thread
 */
export async function parseSessionFileAsync(filePath: string): Promise<SessionUsageResult | null> {
	const pool = getWorkerPool();
	return pool.runTask('parseSessionFile', { filePath });
}

/**
 * Parse multiple JSONL session files and aggregate in a worker thread
 */
export async function parseMultipleSessionsAsync(
	filePaths: string[],
	timeRange?: 'today' | 'week' | 'all'
): Promise<TokenUsage> {
	const pool = getWorkerPool();
	return pool.runTask('parseMultipleSessions', { filePaths, timeRange });
}

/**
 * Parse session files and aggregate into hourly buckets in a worker thread
 */
export async function aggregateHourlyUsageAsync(
	filePaths: string[],
	hours: number = 24
): Promise<HourlyBucket[]> {
	const pool = getWorkerPool();
	return pool.runTask('aggregateHourlyUsage', { filePaths, hours });
}

/**
 * Parse all projects for multi-project time series in a worker thread
 */
export async function parseAllProjectsAsync(
	projectPaths: Array<{ key: string; path: string; color: string }>,
	range: '24h' | '7d' | 'all',
	bucketSizeMs: number
): Promise<{
	buckets: Record<string, Record<string, { tokens: number; cost: number }>>;
	projectKeys: string[];
}> {
	const pool = getWorkerPool();
	return pool.runTask('parseAllProjects', { projectPaths, range, bucketSizeMs });
}
