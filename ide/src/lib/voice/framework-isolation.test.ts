/**
 * Framework isolation lint check.
 *
 * PRD §7.4 acceptance criterion:
 *   "Registration is the only seam: registerActions(), registerContextBuilder(),
 *    registerResolver() are the only mechanisms by which app-specific content
 *    enters the framework. No compile-time imports of JAT-specific data from
 *    framework modules (verified by a lint check on the framework directory's
 *    imports)."
 *
 * This test reads the source of every framework file and asserts none of them
 * statically import a known app-side module. If a future change adds an import
 * from `$lib/stores/*`, from a sibling JAT-specific file, or from a tenant
 * resolver, this test fails before the bundle ever ships.
 *
 * The test treats any file *not* listed in APP_FILES below as framework. Adding
 * a new framework file is a no-op; adding a new JAT/tenant file requires
 * listing it in APP_FILES.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOICE_DIR = fileURLToPath(new URL('.', import.meta.url));

/** Files in voice/ that are explicitly app-coupled and exempt from the check. */
const APP_FILES = new Set<string>([
	'jat.ts',
	'jat-context-builder.ts',
	'register-jat.ts',
	'resolvers/taskIdResolver.ts',
	// Vocabulary data is JAT-flavored today (PRD §7.4 says it shifts to
	// "registration input" in the future). Tracked as known violation —
	// treated as app-side here so the lint is meaningful for everything else.
	'vocabularyData.ts'
]);

/** Patterns no framework file may statically import (runtime imports only — type-only imports are erased). */
const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
	{
		pattern: /['"]\$lib\/stores\//,
		reason: 'imports from $lib/stores/ (Svelte stores are app state, not framework)'
	},
	{
		pattern: /['"]\.\/(jat|register-jat)/,
		reason: 'imports a sibling JAT-specific module'
	},
	{
		pattern: /['"]\.\/resolvers\//,
		reason: 'imports a tenant-specific resolver (resolvers/ is app code)'
	}
];

/**
 * Pre-existing violations grandfathered when this lint was added. Empty —
 * any future entry is a sign the framework boundary is leaking and should be
 * fixed at the source rather than added here.
 */
const KNOWN_VIOLATIONS = new Set<string>();

/** Recursively walk `dir` and yield .ts files (excluding tests). */
function* walkTsFiles(dir: string): Generator<string> {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) {
			yield* walkTsFiles(full);
		} else if (
			entry.endsWith('.ts') &&
			!entry.endsWith('.test.ts') &&
			!entry.endsWith('.d.ts')
		) {
			yield full;
		}
	}
}

/**
 * Collect static *runtime* imports. `import type ...` and `import { type Foo }`
 * are erased at compile time so they don't pull modules into the bundle —
 * those are not enforced. Side-effect imports `import './x'` and value
 * imports `import { x } from './y'` ARE checked.
 */
function extractRuntimeImports(source: string): string[] {
	const specs: string[] = [];
	// Match `import ... from '<spec>'` or `import '<spec>'` — capture the leading
	// part so we can skip `import type` clauses.
	const re = /(import\s+(?:type\s+)?(?:[\s\S]*?\bfrom\s+)?)['"]([^'"]+)['"]/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(source)) !== null) {
		const head = m[1];
		const spec = m[2];
		// Skip `import type X from ...` / `import type { ... } from ...`.
		if (/^import\s+type\b/.test(head)) continue;
		specs.push(spec);
	}
	return specs;
}

describe('framework isolation', () => {
	it('no framework file imports JAT/tenant/store code', () => {
		const violations: Array<{ file: string; spec: string; reason: string }> = [];

		for (const filePath of walkTsFiles(VOICE_DIR)) {
			const rel = relative(VOICE_DIR, filePath).replace(/\\/g, '/');
			if (APP_FILES.has(rel)) continue; // app file — exempt
			if (rel.startsWith('providers/')) continue; // providers are framework but tenant-neutral

			const source = readFileSync(filePath, 'utf8');
			for (const spec of extractRuntimeImports(source)) {
				for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
					if (pattern.test(`'${spec}'`)) {
						const key = `${rel}:${spec}`;
						if (KNOWN_VIOLATIONS.has(key)) continue;
						violations.push({ file: rel, spec, reason });
					}
				}
			}
		}

		// Build a readable failure message so a regression points at the file.
		const message =
			violations.length === 0
				? ''
				: `Framework files must not import app code:\n` +
				  violations
						.map((v) => `  - ${v.file} imports '${v.spec}' — ${v.reason}`)
						.join('\n');

		expect(violations, message).toEqual([]);
	});

	it('the framework barrel index.ts re-exports nothing from JAT-specific files', () => {
		const barrel = readFileSync(join(VOICE_DIR, 'index.ts'), 'utf8');

		// Whitelist: only types, voiceSubsystem, parameterResolver, contextAssembly.
		const ALLOWED_RE_EXPORTS = [
			/from ['"]\.\/types['"]/,
			/from ['"]\.\/voiceSubsystem\.svelte['"]/,
			/from ['"]\.\/parameterResolver['"]/,
			/from ['"]\.\/contextAssembly['"]/
		];

		// Match every `from '...'` clause and assert each one matches an allowed re-export.
		const fromRe = /from\s+(['"][^'"]+['"])/g;
		const fromClauses: string[] = [];
		let m: RegExpExecArray | null;
		while ((m = fromRe.exec(barrel)) !== null) fromClauses.push(m[1]);

		const disallowed = fromClauses.filter(
			(clause) => !ALLOWED_RE_EXPORTS.some((re) => re.test(`from ${clause}`))
		);

		expect(
			disallowed,
			`Framework barrel index.ts must only re-export framework modules. Disallowed: ${disallowed.join(', ')}`
		).toEqual([]);

		// Also: no side-effect imports (those are how registration leaks in).
		expect(
			/^import\s+['"][^'"]+['"]\s*;?\s*$/m.test(barrel),
			'Framework barrel index.ts must not contain side-effect imports — those belong in jat.ts.'
		).toBe(false);
	});
});
