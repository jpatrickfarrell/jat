/**
 * Shared elapsed-time formatter for mobile session surfaces.
 * Both TasksActive swipe cards and MobileSessionDrawer render identical
 * HH:MM:SS timers, so the format lives here to keep them in lockstep.
 */
export interface FormattedElapsed {
	hours: string;
	minutes: string;
	seconds: string;
	showHours: boolean;
}

export function getElapsedFormatted(createdISO: string | null | undefined, nowMs?: number): FormattedElapsed | null {
	if (!createdISO) return null;
	const created = new Date(createdISO).getTime();
	if (Number.isNaN(created)) return null;
	const now = nowMs ?? Date.now();
	const elapsedMs = Math.max(0, now - created);
	const totalSeconds = Math.floor(elapsedMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return {
		hours: String(hours).padStart(2, '0'),
		minutes: String(minutes).padStart(2, '0'),
		seconds: String(seconds).padStart(2, '0'),
		showHours: hours > 0
	};
}
