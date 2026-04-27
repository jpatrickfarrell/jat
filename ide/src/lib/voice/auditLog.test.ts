/**
 * Unit tests for voice audit log rotation (jat-68j78.27).
 *
 * Tests exercise the rotation helpers (`shouldRotate`, `rotateGenerations`,
 * `readOldestEpochMs`) directly against a per-test tmpdir so they don't touch
 * the user's `~/.config/jat/voice-audit.jsonl`. The acceptance test composes
 * the helpers into a "rotate-then-append" sequence — the same sequence
 * `appendAuditEntry` runs in production via `maybeRotateBeforeAppend` — so a
 * passing acceptance test proves the production flow rotates correctly when
 * seeded with >10MB of lines.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, stat, readFile, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { readOldestEpochMs, rotateGenerations, shouldRotate } from './auditLog';

const sampleEntry = (ts: string, provider = 'openai') =>
	JSON.stringify({ ts, provider, op: 'transcribe', bytes: 0, latencyMs: 1, model: 'm', ok: true }) +
	'\n';

let testDir: string;
let testPath: string;

beforeEach(async () => {
	testDir = join(
		tmpdir(),
		`voice-audit-rotation-${Date.now()}-${Math.random().toString(36).slice(2)}`
	);
	await mkdir(testDir, { recursive: true });
	testPath = join(testDir, 'voice-audit.jsonl');
});

afterEach(async () => {
	await rm(testDir, { recursive: true, force: true });
});

describe('readOldestEpochMs', () => {
	it('returns null for missing files', async () => {
		expect(await readOldestEpochMs(testPath)).toBeNull();
	});

	it('returns null for empty files', async () => {
		await writeFile(testPath, '', 'utf-8');
		expect(await readOldestEpochMs(testPath)).toBeNull();
	});

	it('parses the first valid JSONL line', async () => {
		const ts = '2026-04-01T12:00:00.000Z';
		await writeFile(testPath, sampleEntry(ts) + sampleEntry('2026-04-02T12:00:00.000Z'), 'utf-8');
		expect(await readOldestEpochMs(testPath)).toBe(Date.parse(ts));
	});

	it('returns null on a malformed first line', async () => {
		await writeFile(testPath, '{not json\n', 'utf-8');
		expect(await readOldestEpochMs(testPath)).toBeNull();
	});
});

describe('shouldRotate', () => {
	it('returns false for a missing file', async () => {
		expect(await shouldRotate(testPath, Date.now())).toBe(false);
	});

	it('returns false for an empty file', async () => {
		await writeFile(testPath, '', 'utf-8');
		expect(await shouldRotate(testPath, Date.now())).toBe(false);
	});

	it('returns false for a small recent file', async () => {
		await writeFile(testPath, sampleEntry(new Date().toISOString()), 'utf-8');
		expect(await shouldRotate(testPath, Date.now())).toBe(false);
	});

	it('returns true when size crosses the byte threshold', async () => {
		const tinyMaxBytes = 1024;
		await writeFile(testPath, 'x'.repeat(2048), 'utf-8');
		expect(await shouldRotate(testPath, Date.now(), tinyMaxBytes)).toBe(true);
	});

	it('returns true when oldest entry is older than the age threshold', async () => {
		const now = Date.now();
		const oldTs = new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString();
		await writeFile(testPath, sampleEntry(oldTs), 'utf-8');
		expect(await shouldRotate(testPath, now)).toBe(true);
	});

	it('returns false when oldest entry is just inside the age threshold', async () => {
		const now = Date.now();
		const recentTs = new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString();
		await writeFile(testPath, sampleEntry(recentTs), 'utf-8');
		expect(await shouldRotate(testPath, now)).toBe(false);
	});
});

describe('rotateGenerations', () => {
	it('moves the current file to .1 when no prior generations exist', async () => {
		await writeFile(testPath, 'gen0\n', 'utf-8');
		await rotateGenerations(testPath, 3);
		expect(existsSync(testPath)).toBe(false);
		expect(await readFile(`${testPath}.1`, 'utf-8')).toBe('gen0\n');
		expect(existsSync(`${testPath}.2`)).toBe(false);
	});

	it('shifts each generation up by one and never creates .4', async () => {
		await writeFile(testPath, 'gen0\n', 'utf-8');
		await writeFile(`${testPath}.1`, 'gen1\n', 'utf-8');
		await writeFile(`${testPath}.2`, 'gen2\n', 'utf-8');
		await writeFile(`${testPath}.3`, 'gen3\n', 'utf-8');

		await rotateGenerations(testPath, 3);

		expect(existsSync(testPath)).toBe(false);
		expect(existsSync(`${testPath}.4`)).toBe(false);
		// Old gen3 (the oldest) is dropped; remaining generations shift up.
		expect(await readFile(`${testPath}.1`, 'utf-8')).toBe('gen0\n');
		expect(await readFile(`${testPath}.2`, 'utf-8')).toBe('gen1\n');
		expect(await readFile(`${testPath}.3`, 'utf-8')).toBe('gen2\n');
	});

	it('handles missing intermediate generations', async () => {
		await writeFile(testPath, 'gen0\n', 'utf-8');
		await writeFile(`${testPath}.2`, 'gen2\n', 'utf-8');
		// no .1 — simulates a corrupted state

		await rotateGenerations(testPath, 3);

		expect(existsSync(testPath)).toBe(false);
		expect(await readFile(`${testPath}.1`, 'utf-8')).toBe('gen0\n');
		expect(await readFile(`${testPath}.3`, 'utf-8')).toBe('gen2\n');
		expect(existsSync(`${testPath}.2`)).toBe(false);
	});
});

describe('rotate-then-append (acceptance, PRD §5.4.1)', () => {
	it('seeding >10MB triggers rotation; .jsonl + .jsonl.1 remain; .jsonl.4 never exists', async () => {
		const tenMB = 10 * 1024 * 1024;
		const oldEntry = sampleEntry('2026-03-01T00:00:00.000Z', 'old');
		// Repeat enough to clear the 10MB threshold (~145 bytes/line × 80k = ~11MB).
		const repeats = Math.ceil(tenMB / oldEntry.length) + 100;
		await writeFile(testPath, oldEntry.repeat(repeats), 'utf-8');
		const seededSize = (await stat(testPath)).size;
		expect(seededSize).toBeGreaterThanOrEqual(tenMB);

		// Run the same sequence appendAuditEntry runs internally: rotate-if-needed, then append.
		expect(await shouldRotate(testPath, Date.now())).toBe(true);
		await rotateGenerations(testPath, 3);
		const freshEntry = sampleEntry(new Date().toISOString(), 'new');
		await appendFile(testPath, freshEntry, 'utf-8');

		// Current file holds only the post-rotation entry.
		expect(await readFile(testPath, 'utf-8')).toBe(freshEntry);
		// The 10MB+ history landed in .1.
		expect(existsSync(`${testPath}.1`)).toBe(true);
		expect((await stat(`${testPath}.1`)).size).toBe(seededSize);
		// .4 is never created.
		expect(existsSync(`${testPath}.4`)).toBe(false);
	});

	it('three successive rotations populate .1/.2/.3 and never leak into .4', async () => {
		for (let gen = 0; gen < 3; gen++) {
			await writeFile(testPath, `gen-${gen}\n`, 'utf-8');
			await rotateGenerations(testPath, 3);
		}
		expect(existsSync(testPath)).toBe(false);
		expect(existsSync(`${testPath}.4`)).toBe(false);
		// Most recent rotation lands in .1, oldest surviving in .3.
		expect(await readFile(`${testPath}.1`, 'utf-8')).toBe('gen-2\n');
		expect(await readFile(`${testPath}.2`, 'utf-8')).toBe('gen-1\n');
		expect(await readFile(`${testPath}.3`, 'utf-8')).toBe('gen-0\n');
	});
});
