// Server-side audit log writer for the Voice Subsystem.
// Spec: ide/docs/prd-voice-subsystem.md §5.4.1, §8.2
//
// Append-only JSONL at ~/.config/jat/voice-audit.jsonl, one line per CLOUD
// STT/LLM/TTS call. Local calls are NOT recorded here (debugBuffer covers
// the dev-facing in-memory case, this file is the user-facing transparency
// record). Lazy file creation — voice-audit.jsonl appears only on the
// first cloud call. Rotation is owned by jat-68j78.27; this module only
// appends.
//
// Imports fs/promises and is server-only. Do not import from client code.

import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

export const AUDIT_LOG_PATH = join(homedir(), '.config', 'jat', 'voice-audit.jsonl');

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

// Serialize writes through a chained promise so concurrent providers can't
// interleave partial JSONL lines. fs.appendFile already opens with O_APPEND
// (atomic per write on POSIX for sub-PIPE_BUF payloads), but chaining keeps
// the contract explicit and survives non-POSIX filesystems.
let writeChain: Promise<void> = Promise.resolve();

/**
 * Append one cloud-call entry. Best-effort — never throws. On failure, logs
 * to the server console and continues so a borked audit log never breaks
 * the voice path itself.
 */
export function appendAuditEntry(entry: VoiceAuditEntry): Promise<void> {
	const line = JSON.stringify(entry) + '\n';
	const next = writeChain.then(async () => {
		try {
			await ensureDir();
			await appendFile(AUDIT_LOG_PATH, line, 'utf-8');
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error('[voice/auditLog] append failed:', msg);
		}
	});
	writeChain = next;
	return next;
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
