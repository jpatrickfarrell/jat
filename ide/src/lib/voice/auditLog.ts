// Server-side audit log writer for the Voice Subsystem.
// Spec: ide/docs/prd-voice-subsystem.md §5.4.1, §8.2
//
// Append-only JSONL at ~/.config/jat/voice-audit.jsonl, one line per CLOUD
// STT/LLM/TTS call. Local calls are NOT recorded here (debugBuffer covers
// the dev-facing in-memory case, this file is the user-facing transparency
// record). Lazy file creation — voice-audit.jsonl appears only on the
// first cloud call.
//
// Rotation policy (PRD §5.4.1): on append, if the file's size is >= 10MB OR
// the oldest entry is >30 days old, rotate generations: the current file
// becomes .1, .1 becomes .2, .2 becomes .3, and the previous .3 is deleted.
// A .4 generation is never created. The `/api/config/voice/audit` endpoint
// already walks `.jsonl` then `.jsonl.1/.2/.3` when tailing, so consumers
// see a contiguous reverse-chronological stream across rotations.
//
// Imports fs/promises and is server-only. Do not import from client code.

import { appendFile, mkdir, stat, rename, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

export const AUDIT_LOG_PATH = join(homedir(), '.config', 'jat', 'voice-audit.jsonl');

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_GENERATIONS = 3;

export type VoiceAuditOp = 'transcribe' | 'classify' | 'speak';

export interface VoiceAuditEntry {
	/** ISO-8601 timestamp. */
	ts: string;
	/** Provider id (e.g. 'openai', 'anthropic', 'elevenlabs'). */
	provider: string;
	op: VoiceAuditOp;
	/** Approximate request body size in bytes. Never the body itself. */
	bytes: number;
	/** Wall-clock latency in milliseconds. */
	latencyMs: number;
	/** Model identifier sent to the provider. */
	model: string;
	ok: boolean;
	/** Coarse failure class on ok=false: 'network' | 'timeout' | 'no_key' | 'schema' | 'http' | 'unknown'. */
	errorClass?: string;
}

let dirEnsured = false;

async function ensureDir(): Promise<void> {
	if (dirEnsured) return;
	const dir = dirname(AUDIT_LOG_PATH);
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true });
	}
	dirEnsured = true;
}

/**
 * Read the epoch-ms of the file's first valid JSONL entry, or null if the file
 * is missing/empty/malformed. Exported for testing.
 */
export async function readOldestEpochMs(path: string): Promise<number | null> {
	let content: string;
	try {
		content = await readFile(path, 'utf-8');
	} catch {
		return null;
	}
	const newline = content.indexOf('\n');
	const firstLine = (newline === -1 ? content : content.slice(0, newline)).trim();
	if (!firstLine) return null;
	try {
		const parsed = JSON.parse(firstLine) as { ts?: unknown };
		if (typeof parsed.ts !== 'string') return null;
		const ms = Date.parse(parsed.ts);
		return Number.isFinite(ms) ? ms : null;
	} catch {
		return null;
	}
}

/**
 * Decide whether the file at `path` should be rotated under the size/age policy.
 * Reads the oldest entry's timestamp from disk when needed. Exported for testing.
 */
export async function shouldRotate(
	path: string,
	now: number,
	maxBytes = MAX_SIZE_BYTES,
	maxAgeMs = MAX_AGE_MS
): Promise<boolean> {
	if (!existsSync(path)) return false;
	let size: number;
	try {
		size = (await stat(path)).size;
	} catch {
		return false;
	}
	if (size >= maxBytes) return true;
	if (size === 0) return false;
	const oldest = await readOldestEpochMs(path);
	return oldest !== null && now - oldest >= maxAgeMs;
}

/**
 * Bump generations: delete `.{maxGenerations}`, then rename `.{N}` → `.{N+1}`
 * for each lower generation, finally rename the current file to `.1`. Exported
 * for testing.
 */
export async function rotateGenerations(path: string, maxGenerations = MAX_GENERATIONS): Promise<void> {
	const oldest = `${path}.${maxGenerations}`;
	if (existsSync(oldest)) {
		try {
			await unlink(oldest);
		} catch (err) {
			console.error('[voice/auditLog] failed to delete oldest generation:', err);
		}
	}
	for (let i = maxGenerations - 1; i >= 1; i--) {
		const src = `${path}.${i}`;
		if (!existsSync(src)) continue;
		try {
			await rename(src, `${path}.${i + 1}`);
		} catch (err) {
			console.error(`[voice/auditLog] failed to rotate .${i} → .${i + 1}:`, err);
		}
	}
	if (existsSync(path)) {
		try {
			await rename(path, `${path}.1`);
		} catch (err) {
			console.error('[voice/auditLog] failed to rotate current → .1:', err);
		}
	}
}

// Cached epoch-ms of the current file's oldest entry. null = unknown/refresh-needed.
// Reading the first line is a full readFile on a possibly-9.99MB file, so we cache
// after the first probe and reset on rotation.
let cachedOldestEpochMs: number | null = null;

// Serialize writes through a chained promise so concurrent providers can't
// interleave partial JSONL lines, and so rotation is atomic with respect to
// appends. fs.appendFile already opens with O_APPEND (atomic per write on
// POSIX for sub-PIPE_BUF payloads), but chaining keeps the contract explicit
// and survives non-POSIX filesystems.
let writeChain: Promise<void> = Promise.resolve();

/**
 * Append one cloud-call entry, rotating first if the size/age policy fires.
 * Best-effort — never throws. On failure, logs to the server console and
 * continues so a borked audit log never breaks the voice path itself.
 */
export function appendAuditEntry(entry: VoiceAuditEntry): Promise<void> {
	const line = JSON.stringify(entry) + '\n';
	const next = writeChain.then(async () => {
		try {
			await ensureDir();
			await maybeRotateBeforeAppend();
			await appendFile(AUDIT_LOG_PATH, line, 'utf-8');
			if (cachedOldestEpochMs === null) {
				const ms = Date.parse(entry.ts);
				cachedOldestEpochMs = Number.isFinite(ms) ? ms : null;
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error('[voice/auditLog] append failed:', msg);
		}
	});
	writeChain = next;
	return next;
}

async function maybeRotateBeforeAppend(): Promise<void> {
	if (!existsSync(AUDIT_LOG_PATH)) {
		cachedOldestEpochMs = null;
		return;
	}
	let size: number;
	try {
		size = (await stat(AUDIT_LOG_PATH)).size;
	} catch {
		return;
	}
	let needRotate = size >= MAX_SIZE_BYTES;
	if (!needRotate && size > 0) {
		if (cachedOldestEpochMs === null) {
			cachedOldestEpochMs = await readOldestEpochMs(AUDIT_LOG_PATH);
		}
		if (cachedOldestEpochMs !== null && Date.now() - cachedOldestEpochMs >= MAX_AGE_MS) {
			needRotate = true;
		}
	}
	if (needRotate) {
		await rotateGenerations(AUDIT_LOG_PATH, MAX_GENERATIONS);
		cachedOldestEpochMs = null;
	}
}

/**
 * Convenience wrapper: build a `VoiceAuditEntry` from a (start, end) pair and
 * a partial result. Returns the same promise as `appendAuditEntry`.
 */
export function recordCloudCall(
	args: Omit<VoiceAuditEntry, 'ts' | 'latencyMs'> & {
		startedAt: number;
		endedAt?: number;
	}
): Promise<void> {
	const { startedAt, endedAt, ...rest } = args;
	const ts = new Date(endedAt ?? Date.now()).toISOString();
	const latencyMs = Math.max(0, (endedAt ?? Date.now()) - startedAt);
	return appendAuditEntry({ ...rest, ts, latencyMs });
}
