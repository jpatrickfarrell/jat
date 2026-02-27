/**
 * Shared cron expression utilities.
 *
 * Consolidates cron description, preset definitions, and validation
 * previously duplicated across ScheduledTasksTable, TaskDetailDrawer,
 * quick-commands, and workflowNodes.
 */

/** Cron preset for picker UIs */
export interface CronPreset {
	label: string;
	cron: string;
	description?: string;
}

/** Standard cron presets used across the IDE */
export const CRON_PRESETS: CronPreset[] = [
	{ label: 'Every minute', cron: '* * * * *', description: 'Runs every minute' },
	{ label: 'Every 5 minutes', cron: '*/5 * * * *', description: 'Runs every 5 minutes' },
	{ label: 'Every 15 minutes', cron: '*/15 * * * *', description: 'Runs every 15 minutes' },
	{ label: 'Every 30 minutes', cron: '*/30 * * * *', description: 'Runs every 30 minutes' },
	{ label: 'Hourly', cron: '0 * * * *', description: 'Runs at the start of every hour' },
	{ label: 'Every 2 hours', cron: '0 */2 * * *', description: 'Runs every 2 hours' },
	{ label: 'Every 4 hours', cron: '0 */4 * * *', description: 'Runs every 4 hours' },
	{ label: 'Every 6 hours', cron: '0 */6 * * *', description: 'Runs every 6 hours' },
	{ label: 'Every 12 hours', cron: '0 */12 * * *', description: 'Runs every 12 hours' },
	{ label: 'Daily at 9 AM', cron: '0 9 * * *', description: 'Runs every day at 9:00 AM' },
	{ label: 'Daily at midnight', cron: '0 0 * * *', description: 'Runs every day at midnight' },
	{ label: 'Weekdays at 9 AM', cron: '0 9 * * 1-5', description: 'Runs Monday through Friday at 9:00 AM' },
	{ label: '9 AM & 5 PM', cron: '0 9,17 * * *', description: 'Runs twice daily at 9 AM and 5 PM' },
	{ label: 'Weekly on Sunday', cron: '0 0 * * 0', description: 'Runs every Sunday at midnight' },
	{ label: 'Monthly on the 1st', cron: '0 0 1 * *', description: 'Runs on the first of each month at midnight' }
];

/**
 * Convert a cron expression to a human-readable description.
 *
 * Tries an exact-match lookup table first (for concise common labels),
 * then falls back to parsing the five cron fields for a descriptive string.
 * Returns the raw expression if it can't be interpreted.
 */
export function describeCron(cron: string | null | undefined): string {
	if (!cron) return '';
	const trimmed = cron.trim();
	if (!trimmed) return '';

	// Exact-match lookup for common patterns (concise labels)
	const preset = CRON_PRESETS.find((p) => p.cron === trimmed);
	if (preset) return preset.label;

	// Parse the five fields
	const parts = trimmed.split(/\s+/);
	if (parts.length < 5) return trimmed;

	const [min, hour, dom, month, dow] = parts;

	// Interval patterns (*/N)
	if (min.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
		return `Every ${min.slice(2)} minutes`;
	}
	if (hour.startsWith('*/') && dom === '*' && month === '*' && dow === '*') {
		return `Every ${hour.slice(2)} hours at :${min.padStart(2, '0')}`;
	}

	// Format hour:minute for readable output
	const time = formatTime(hour, min);

	// Every minute
	if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
		return 'Every minute';
	}

	// Hourly at :MM
	if (hour === '*' && dom === '*' && month === '*' && dow === '*') {
		return `Every hour at :${min.padStart(2, '0')}`;
	}

	// Daily at HH:MM
	if (dom === '*' && month === '*' && dow === '*' && time) {
		return `Daily at ${time}`;
	}

	// Weekdays
	if (dom === '*' && month === '*' && dow === '1-5' && time) {
		return `Weekdays at ${time}`;
	}

	// Day-of-week patterns
	const dayNames: Record<string, string> = {
		'0': 'Sundays',
		'1': 'Mondays',
		'2': 'Tuesdays',
		'3': 'Wednesdays',
		'4': 'Thursdays',
		'5': 'Fridays',
		'6': 'Saturdays',
		'7': 'Sundays'
	};
	if (dom === '*' && month === '*' && dayNames[dow] && time) {
		return `${dayNames[dow]} at ${time}`;
	}

	// Monthly on the Nth
	if (month === '*' && dow === '*' && dom !== '*' && time) {
		const ordinal = getOrdinal(parseInt(dom, 10));
		return `Monthly on the ${ordinal} at ${time}`;
	}

	// Multi-hour (e.g., 0 9,17 * * *)
	if (hour.includes(',') && dom === '*' && month === '*' && dow === '*') {
		const hours = hour.split(',').map((h) => formatTime(h, min)).filter(Boolean);
		if (hours.length) return `Daily at ${hours.join(' & ')}`;
	}

	// Fallback to raw expression
	return trimmed;
}

/**
 * Validate a cron expression (basic client-side check).
 *
 * Checks that the expression has 5 space-separated fields and each field
 * contains only valid cron characters. Does NOT validate semantic correctness
 * (e.g., day 32 or month 13).
 */
export function validateCron(cron: string | null | undefined): { valid: boolean; error?: string } {
	if (!cron || !cron.trim()) {
		return { valid: false, error: 'Cron expression is empty' };
	}

	const parts = cron.trim().split(/\s+/);
	if (parts.length !== 5) {
		return { valid: false, error: `Expected 5 fields (minute hour day month weekday), got ${parts.length}` };
	}

	const fieldNames = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];
	const fieldRanges = [
		{ min: 0, max: 59 },
		{ min: 0, max: 23 },
		{ min: 1, max: 31 },
		{ min: 1, max: 12 },
		{ min: 0, max: 7 }
	];

	// Valid cron field characters: digits, *, /, -, ,
	const fieldPattern = /^[\d*\/\-,]+$/;

	for (let i = 0; i < 5; i++) {
		if (!fieldPattern.test(parts[i])) {
			return { valid: false, error: `Invalid characters in ${fieldNames[i]} field: "${parts[i]}"` };
		}

		// Check simple numeric values are in range
		const numMatch = parts[i].match(/^(\d+)$/);
		if (numMatch) {
			const val = parseInt(numMatch[1], 10);
			if (val < fieldRanges[i].min || val > fieldRanges[i].max) {
				return {
					valid: false,
					error: `${fieldNames[i]} value ${val} is out of range (${fieldRanges[i].min}-${fieldRanges[i].max})`
				};
			}
		}

		// Check step values (*/N)
		const stepMatch = parts[i].match(/^\*\/(\d+)$/);
		if (stepMatch) {
			const step = parseInt(stepMatch[1], 10);
			if (step === 0) {
				return { valid: false, error: `Step value in ${fieldNames[i]} cannot be 0` };
			}
		}
	}

	return { valid: true };
}

/**
 * Compute the next N run times from a cron expression (browser-compatible).
 *
 * Handles common patterns: fixed hour/min, day-of-week, day-of-month,
 * and step intervals. Returns ISO strings.
 */
export function computeNextCronRuns(cron: string | null | undefined, count: number = 3): string[] {
	if (!cron) return [];
	const parts = cron.trim().split(/\s+/);
	if (parts.length !== 5) return [];

	const [minF, hourF, domF, monthF, dowF] = parts;

	// Parse field into list of matching values
	function parseField(field: string, min: number, max: number): number[] | null {
		if (field === '*') return null; // wildcard
		if (field.startsWith('*/')) {
			const step = parseInt(field.slice(2), 10);
			if (isNaN(step) || step <= 0) return null;
			const vals: number[] = [];
			for (let i = min; i <= max; i += step) vals.push(i);
			return vals;
		}
		if (field.includes(',')) {
			return field.split(',').map(v => parseInt(v, 10)).filter(v => !isNaN(v));
		}
		if (field.includes('-')) {
			const [a, b] = field.split('-').map(v => parseInt(v, 10));
			if (isNaN(a) || isNaN(b)) return null;
			const vals: number[] = [];
			for (let i = a; i <= b; i++) vals.push(i);
			return vals;
		}
		const v = parseInt(field, 10);
		if (isNaN(v)) return null;
		return [v];
	}

	const minutes = parseField(minF, 0, 59);
	const hours = parseField(hourF, 0, 23);
	const doms = parseField(domF, 1, 31);
	const months = parseField(monthF, 1, 12);
	const dows = parseField(dowF, 0, 7); // 0 and 7 both = Sunday

	// Normalize DOW: 7 → 0 (Sunday)
	const dowSet = dows ? new Set(dows.map(d => d === 7 ? 0 : d)) : null;

	const results: string[] = [];
	const candidate = new Date();
	candidate.setSeconds(0, 0);
	candidate.setMinutes(candidate.getMinutes() + 1); // start from next minute

	const maxIterations = 366 * 24 * 60; // one year of minutes
	for (let i = 0; i < maxIterations && results.length < count; i++) {
		const m = candidate.getMinutes();
		const h = candidate.getHours();
		const d = candidate.getDate();
		const mo = candidate.getMonth() + 1;
		const dow = candidate.getDay();

		if ((!minutes || minutes.includes(m)) &&
			(!hours || hours.includes(h)) &&
			(!doms || doms.includes(d)) &&
			(!months || months.includes(mo)) &&
			(!dowSet || dowSet.has(dow))) {
			results.push(candidate.toISOString());
		}

		candidate.setMinutes(candidate.getMinutes() + 1);
	}

	return results;
}

/**
 * Compute the next run time from a cron expression (browser-compatible).
 * Convenience wrapper around computeNextCronRuns for single result.
 */
export function computeNextCronRun(cron: string | null | undefined): string | null {
	const runs = computeNextCronRuns(cron, 1);
	return runs.length > 0 ? runs[0] : null;
}

// --- Internal helpers ---

/** Format hour and minute into a readable time string like "9:00 AM" */
function formatTime(hour: string, min: string): string | null {
	const h = parseInt(hour, 10);
	if (isNaN(h)) return null;
	const m = parseInt(min, 10);
	const minuteStr = isNaN(m) ? '00' : String(m).padStart(2, '0');
	const ampm = h >= 12 ? 'PM' : 'AM';
	const hour12 = h % 12 || 12;
	if (minuteStr === '00') return `${hour12} ${ampm}`;
	return `${hour12}:${minuteStr} ${ampm}`;
}

/** Get ordinal suffix for a number (1st, 2nd, 3rd, etc.) */
function getOrdinal(n: number): string {
	if (isNaN(n)) return String(n);
	const s = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
