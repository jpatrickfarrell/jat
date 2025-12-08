/**
 * JSONL Parser Worker Thread
 *
 * This worker runs in a separate thread to prevent JSONL parsing
 * from blocking the main Node.js event loop.
 *
 * Handles:
 * - parseSessionFile: Parse a single JSONL session file
 * - parseMultipleSessions: Parse multiple session files
 * - aggregateHourlyUsage: Parse and aggregate into hourly buckets
 */

import { parentPort, workerData } from 'worker_threads';
import { readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// Types
// ============================================================================

interface TokenUsage {
	input_tokens: number;
	cache_creation_input_tokens: number;
	cache_read_input_tokens: number;
	output_tokens: number;
	total_tokens: number;
	cost: number;
	sessionCount: number;
}

interface SessionUsageResult {
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

interface HourlyBucket {
	timestamp: string;
	tokens: number;
	cost: number;
}

interface WorkerMessage {
	id: number;
	type: 'parseSessionFile' | 'parseMultipleSessions' | 'aggregateHourlyUsage' | 'parseAllProjects';
	payload: any;
}

interface WorkerResponse {
	id: number;
	success: boolean;
	result?: any;
	error?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Claude Sonnet 4.5 Pricing (per million tokens)
const PRICING = {
	input: 3.0,
	cache_creation: 3.75,
	cache_read: 0.30,
	output: 15.0
} as const;

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Calculate cost from token breakdown
 */
function calculateCost(
	input: number,
	cacheCreation: number,
	cacheRead: number,
	output: number
): number {
	return (
		(input / 1_000_000) * PRICING.input +
		(cacheCreation / 1_000_000) * PRICING.cache_creation +
		(cacheRead / 1_000_000) * PRICING.cache_read +
		(output / 1_000_000) * PRICING.output
	);
}

/**
 * Parse a single JSONL session file
 */
function parseSessionFile(filePath: string): SessionUsageResult | null {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const lines = content.trim().split('\n');

		let totalInput = 0;
		let totalCacheCreation = 0;
		let totalCacheRead = 0;
		let totalOutput = 0;
		let lastTimestamp = new Date().toISOString();

		for (const line of lines) {
			if (!line.trim()) continue;

			try {
				const entry = JSON.parse(line);

				if (entry.timestamp) {
					lastTimestamp = entry.timestamp;
				}

				if (entry.message?.usage) {
					const usage = entry.message.usage;
					totalInput += usage.input_tokens || 0;
					totalCacheCreation += usage.cache_creation_input_tokens || 0;
					totalCacheRead += usage.cache_read_input_tokens || 0;
					totalOutput += usage.output_tokens || 0;
				}
			} catch {
				// Skip malformed lines
				continue;
			}
		}

		const totalTokens = totalInput + totalCacheCreation + totalCacheRead + totalOutput;
		const cost = calculateCost(totalInput, totalCacheCreation, totalCacheRead, totalOutput);

		// Extract session ID from filename
		const sessionId = path.basename(filePath, '.jsonl');

		return {
			sessionId,
			agentName: null,
			timestamp: lastTimestamp,
			tokens: {
				input: totalInput,
				cache_creation: totalCacheCreation,
				cache_read: totalCacheRead,
				output: totalOutput,
				total: totalTokens
			},
			cost
		};
	} catch {
		return null;
	}
}

/**
 * Parse multiple session files and aggregate
 */
function parseMultipleSessions(
	filePaths: string[],
	timeRange?: 'today' | 'week' | 'all'
): TokenUsage {
	let totalInput = 0;
	let totalCacheCreation = 0;
	let totalCacheRead = 0;
	let totalOutput = 0;
	let sessionCount = 0;

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	for (const filePath of filePaths) {
		const result = parseSessionFile(filePath);
		if (!result) continue;

		// Filter by time range
		if (timeRange && timeRange !== 'all') {
			const timestamp = new Date(result.timestamp);
			if (timeRange === 'today' && timestamp < todayStart) continue;
			if (timeRange === 'week' && timestamp < weekAgo) continue;
		}

		totalInput += result.tokens.input;
		totalCacheCreation += result.tokens.cache_creation;
		totalCacheRead += result.tokens.cache_read;
		totalOutput += result.tokens.output;
		sessionCount++;
	}

	const totalTokens = totalInput + totalCacheCreation + totalCacheRead + totalOutput;
	const cost = calculateCost(totalInput, totalCacheCreation, totalCacheRead, totalOutput);

	return {
		input_tokens: totalInput,
		cache_creation_input_tokens: totalCacheCreation,
		cache_read_input_tokens: totalCacheRead,
		output_tokens: totalOutput,
		total_tokens: totalTokens,
		cost,
		sessionCount
	};
}

/**
 * Parse session files and aggregate into hourly buckets
 */
function aggregateHourlyUsage(
	filePaths: string[],
	hours: number = 24
): HourlyBucket[] {
	const now = new Date();
	const hourlyBuckets = new Map<string, { tokens: number; cost: number }>();

	// Initialize hourly buckets
	for (let i = hours - 1; i >= 0; i--) {
		const hourTime = new Date(now.getTime() - i * 60 * 60 * 1000);
		hourTime.setMinutes(0, 0, 0);
		const hourKey = hourTime.toISOString();
		hourlyBuckets.set(hourKey, { tokens: 0, cost: 0 });
	}

	const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

	for (const filePath of filePaths) {
		try {
			const content = readFileSync(filePath, 'utf-8');
			const lines = content.trim().split('\n');

			for (const line of lines) {
				if (!line.trim()) continue;

				try {
					const entry = JSON.parse(line);
					if (!entry.message?.usage || !entry.timestamp) continue;

					const timestamp = new Date(entry.timestamp);
					if (timestamp < cutoffTime) continue;

					// Round to hour start
					timestamp.setMinutes(0, 0, 0);
					const hourKey = timestamp.toISOString();

					const bucket = hourlyBuckets.get(hourKey);
					if (!bucket) continue;

					const usage = entry.message.usage;
					const tokens = (
						(usage.input_tokens || 0) +
						(usage.cache_creation_input_tokens || 0) +
						(usage.cache_read_input_tokens || 0) +
						(usage.output_tokens || 0)
					);

					const cost = calculateCost(
						usage.input_tokens || 0,
						usage.cache_creation_input_tokens || 0,
						usage.cache_read_input_tokens || 0,
						usage.output_tokens || 0
					);

					bucket.tokens += tokens;
					bucket.cost += cost;
				} catch {
					continue;
				}
			}
		} catch {
			continue;
		}
	}

	// Convert to sorted array
	return Array.from(hourlyBuckets.entries())
		.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
		.map(([timestamp, data]) => ({
			timestamp,
			tokens: data.tokens,
			cost: data.cost
		}));
}

/**
 * Parse all JSONL files across all projects for multi-project time series
 */
function parseAllProjects(
	projectPaths: Array<{ key: string; path: string; color: string }>,
	range: '24h' | '7d' | 'all',
	bucketSizeMs: number
): {
	buckets: Map<string, Map<string, { tokens: number; cost: number }>>;
	projectKeys: string[];
} {
	const homeDir = os.homedir();
	const now = new Date();

	// Calculate start time based on range
	let startTime: Date;
	switch (range) {
		case '24h':
			startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			break;
		case '7d':
			startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case 'all':
		default:
			startTime = new Date(0);
			break;
	}

	// Map: bucketKey -> projectKey -> { tokens, cost }
	const bucketProjectData = new Map<string, Map<string, { tokens: number; cost: number }>>();
	const foundProjectKeys = new Set<string>();

	for (const project of projectPaths) {
		const projectSlug = project.path.replace(/\//g, '-');
		const projectsDir = path.join(homeDir, '.claude', 'projects', projectSlug);

		let sessionFiles: string[] = [];
		try {
			const files = readdirSync(projectsDir);
			// Filter by file modification time BEFORE reading content
			// Only read files that could have data in our time range
			sessionFiles = files
				.filter(f => f.endsWith('.jsonl'))
				.map(f => path.join(projectsDir, f))
				.filter(filePath => {
					try {
						const stat = statSync(filePath);
						// Skip files not modified since startTime (can't have relevant data)
						return stat.mtime >= startTime;
					} catch {
						return false;
					}
				});
		} catch {
			continue;
		}

		for (const filePath of sessionFiles) {
			try {
				const content = readFileSync(filePath, 'utf-8');
				const lines = content.trim().split('\n');

				for (const line of lines) {
					if (!line.trim()) continue;

					try {
						const entry = JSON.parse(line);
						if (!entry.message?.usage || !entry.timestamp) continue;

						const timestamp = new Date(entry.timestamp);
						if (timestamp < startTime || timestamp > now) continue;

						const usage = entry.message.usage;
						const tokens = (
							(usage.input_tokens || 0) +
							(usage.cache_creation_input_tokens || 0) +
							(usage.cache_read_input_tokens || 0) +
							(usage.output_tokens || 0)
						);

						const cost = calculateCost(
							usage.input_tokens || 0,
							usage.cache_creation_input_tokens || 0,
							usage.cache_read_input_tokens || 0,
							usage.output_tokens || 0
						);

						// Determine bucket key
						const bucketTime = new Date(Math.floor(timestamp.getTime() / bucketSizeMs) * bucketSizeMs);
						const bucketKey = bucketTime.toISOString();

						foundProjectKeys.add(project.key);

						if (!bucketProjectData.has(bucketKey)) {
							bucketProjectData.set(bucketKey, new Map());
						}
						const projectMap = bucketProjectData.get(bucketKey)!;

						if (projectMap.has(project.key)) {
							const existing = projectMap.get(project.key)!;
							existing.tokens += tokens;
							existing.cost += cost;
						} else {
							projectMap.set(project.key, { tokens, cost });
						}
					} catch {
						continue;
					}
				}
			} catch {
				continue;
			}
		}
	}

	return {
		buckets: bucketProjectData,
		projectKeys: Array.from(foundProjectKeys)
	};
}

// ============================================================================
// Message Handler
// ============================================================================

if (parentPort) {
	parentPort.on('message', (message: WorkerMessage) => {
		const { id, type, payload } = message;

		try {
			let result: any;

			switch (type) {
				case 'parseSessionFile':
					result = parseSessionFile(payload.filePath);
					break;

				case 'parseMultipleSessions':
					result = parseMultipleSessions(payload.filePaths, payload.timeRange);
					break;

				case 'aggregateHourlyUsage':
					result = aggregateHourlyUsage(payload.filePaths, payload.hours);
					break;

				case 'parseAllProjects':
					const parsed = parseAllProjects(
						payload.projectPaths,
						payload.range,
						payload.bucketSizeMs
					);
					// Convert Map to serializable object
					const bucketsObj: Record<string, Record<string, { tokens: number; cost: number }>> = {};
					for (const [bucketKey, projectMap] of parsed.buckets) {
						bucketsObj[bucketKey] = Object.fromEntries(projectMap);
					}
					result = {
						buckets: bucketsObj,
						projectKeys: parsed.projectKeys
					};
					break;

				default:
					throw new Error(`Unknown message type: ${type}`);
			}

			const response: WorkerResponse = { id, success: true, result };
			parentPort!.postMessage(response);
		} catch (error) {
			const response: WorkerResponse = {
				id,
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
			parentPort!.postMessage(response);
		}
	});
}
