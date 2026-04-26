/**
 * Voice Subsystem Audit Log API
 * GET /api/config/voice/audit?limit=50 — Tail the last N rows of
 * ~/.config/jat/voice-audit.jsonl, returned reverse-chronological
 * (most recent first).
 *
 * Rotation-aware: when the current file holds fewer than `limit` rows, walks
 * `.jsonl.1`, `.jsonl.2`, `.jsonl.3` (rotated generations written by
 * jat-68j78.27). Missing rotation files are skipped silently — this endpoint
 * works whether rotation has happened yet or not.
 *
 * Spec: ide/docs/prd-voice-subsystem.md §5.4.1, §7.2
 */

import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { AUDIT_LOG_PATH, type VoiceAuditEntry } from '$lib/voice/auditLog';
import type { RequestHandler } from './$types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

const ROTATION_FILES = [
	AUDIT_LOG_PATH,
	`${AUDIT_LOG_PATH}.1`,
	`${AUDIT_LOG_PATH}.2`,
	`${AUDIT_LOG_PATH}.3`
];

function parseLimit(raw: string | null): number {
	if (!raw) return DEFAULT_LIMIT;
	const n = parseInt(raw, 10);
	if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
	return Math.min(n, MAX_LIMIT);
}

function parseLines(raw: string): VoiceAuditEntry[] {
	const out: VoiceAuditEntry[] = [];
	for (const line of raw.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			out.push(JSON.parse(trimmed) as VoiceAuditEntry);
		} catch {
			// Skip malformed lines silently — the audit log is append-only and a
			// truncated/half-written line during a crash shouldn't poison the read.
		}
	}
	return out;
}

async function readLastN(limit: number): Promise<VoiceAuditEntry[]> {
	// Walk newest → oldest, popping from each file's tail until we have `limit`.
	// Append-only means every file is chronologically ordered; the *current* file
	// holds the newest entries, rotated files hold older ones.
	const collected: VoiceAuditEntry[] = [];
	for (const path of ROTATION_FILES) {
		if (!existsSync(path)) continue;
		let content: string;
		try {
			content = await readFile(path, 'utf-8');
		} catch {
			continue;
		}
		const entries = parseLines(content);
		for (let i = entries.length - 1; i >= 0 && collected.length < limit; i--) {
			collected.push(entries[i]);
		}
		if (collected.length >= limit) break;
	}
	return collected;
}

export const GET: RequestHandler = async ({ url }) => {
	const limit = parseLimit(url.searchParams.get('limit'));
	try {
		const entries = await readLastN(limit);
		return json({
			success: true,
			entries,
			limit,
			path: AUDIT_LOG_PATH
		});
	} catch (error) {
		console.error('[config/voice/audit] GET error:', error);
		return json(
			{
				error: 'Failed to read voice audit log',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
