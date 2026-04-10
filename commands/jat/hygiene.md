---
argument-hint: [--safe-only | --dry-run]
---

# /jat:hygiene - Code Hygiene Pass

Manual cleanup of dead code, broken type refs, stale config, and schema cruft. Works on TypeScript/Svelte projects, with optional Postgres/Supabase checks. Tailored for the JST stack.

**Use this when:** The user wants a hygiene/cleanup pass, or periodic tech-debt grooming.

**Flags:**
- `--safe-only` — Apply only auto-safe fixes (JSDoc, stale config, dead ts-ignores). Skip all deletion steps.
- `--dry-run` — Report findings without modifying any files.

**This is NOT for:** Linting/formatting (that's `prettier`/`eslint`), or refactoring.

---

## Philosophy

Dead-code tools (knip, ts-prune) produce **candidates, not verdicts.** Every file/dep they flag needs human judgment because of these blind spots:

- Dynamic string imports (`target: 'pino-pretty'`)
- Build-time config refs (`vite.config.ts`, static copies)
- HTML `<script>` tag refs (`app.html`, `static/*.html`)
- Svelte dynamic components (`<svelte:component this={...}>`)
- Test fixtures / e2e harnesses outside source tree
- Type-only exports consumed externally

**Rule:** Apply safe fixes automatically. Verify every deletion candidate by hand.

---

## STEP 0 — Stack Detection

Before starting, detect what applies to this project:

```bash
# Is there a frontend (Svelte/TS)?
test -f package.json && echo "has-node"
test -d src && ls src/**/*.svelte 2>/dev/null | head -1 && echo "has-svelte"
grep -l "typescript" package.json 2>/dev/null && echo "has-ts"

# Is there a database?
test -d supabase && echo "has-supabase"
test -d migrations && echo "has-migrations"
grep -l '"pg"\|"postgres"\|@supabase' package.json 2>/dev/null && echo "has-pg-client"

# Is this a SvelteKit app?
test -f svelte.config.js && echo "has-sveltekit"
```

Announce what you detected and skip irrelevant steps.

---

## STEP 1 — Safe Auto-Fixes (always run, never ask)

These are pure wins with no behavioral risk. Apply them silently, then mention the total in the report.

### 1a. Broken JSDoc Type Imports

Find `@type` / `@typedef` / `@param` blocks importing nonexistent files:

```bash
# If svelte-check is available, use it
npx svelte-check --output machine 2>&1 | grep -i "cannot find module" || true

# Otherwise grep for JSDoc imports and verify each path
grep -rn "import('\./" src/ --include='*.js' --include='*.ts' --include='*.svelte' | \
  grep -oP "import\('[^']+'" | sort -u
```

For each broken ref:
- If the correct path is obvious (file was moved, import path wrong), fix it
- Otherwise replace with `any` — JSDoc is non-runtime, this is safe

### 1b. Stale Build Config

Check that every package referenced in build config actually exists in `package.json`:

```bash
# Grep for package names in build files
grep -oE "'[a-z0-9@/-]+'" vite.config.ts svelte.config.js 2>/dev/null | sort -u
```

Remove stale refs in:
- `vite.config.ts` — `ssr.external`, `optimizeDeps.include`, `rollupOptions.external`, `resolve.alias`
- `svelte.config.js` — `kit.alias`, preprocessor plugins
- `tsconfig.json` — `paths`, `types` arrays pointing at deleted `@types/*`

### 1c. Dead TS-Ignore Comments

```bash
# Run tsc and look for "unused @ts-expect-error" errors
npx tsc --noEmit 2>&1 | grep "unused" || true
```

Remove every `// @ts-expect-error` / `// @ts-ignore` that TypeScript reports as unused.

---

## STEP 2 — Knip Scan + Manual Review

Only run if `--safe-only` was not passed.

```bash
# Make sure knip is available
npx knip --no-progress 2>&1 | tee /tmp/knip-report.txt
```

Classify findings into these buckets. **Do not delete anything yet.**

### Bucket A: Unused Files

For each flagged file, run these checks before deleting:

```bash
# 1. Is it referenced anywhere by basename? (catches dynamic imports, HTML refs)
git grep -F "$(basename FILE .svelte)"

# 2. Is it referenced by relative path? (catches partial matches)
git grep -F "FILE_PATH"

# 3. Is it a SvelteKit convention file? (+page, +layout, +server, +error)
# If yes → KEEP. knip should know but sometimes misses.

# 4. Is it in static/ and loaded from HTML?
grep -r "FILENAME" static/*.html src/app.html 2>/dev/null
```

**Decision:**
- 0 hits outside itself → candidate for deletion
- Any hit → investigate, likely a false positive

### Bucket B: Unused Dependencies

For each flagged package, two false-positive patterns to check:

```bash
# 1. Dynamic string imports (pino-pretty trap)
git grep -F "'PACKAGE_NAME'"
git grep -F "\"PACKAGE_NAME\""

# 2. Build-time usage
git grep -F "PACKAGE_NAME" vite.config.ts svelte.config.js scripts/ package.json
```

If either returns a hit, **keep** the dep and note why.

### Bucket C: Unused Exports / Types (LOW priority)

Skip unless the user explicitly asks. These have high churn risk and low cleanup value. Unused type exports in particular are cheap to keep and annoying if wrong.

**Exception:** Duplicate exports (same symbol exported twice) — usually safe to consolidate.

---

## STEP 3 — Svelte-Specific Checks

Only for projects with `.svelte` files.

```bash
# svelte-check should report zero new errors (or only known baseline)
npx svelte-check 2>&1 | tail -20

# Look for runes used in wrong file types
grep -rn '\$state\|\$derived\|\$props' src/ --include='*.ts' --include='*.js' \
  | grep -v '\.svelte\.' || true
# These only work in .svelte / .svelte.ts / .svelte.js files
```

Flag any runes used outside `.svelte*` files — they're silently broken.

---

## STEP 4 — Postgres / Supabase Hygiene (if applicable)

Only for projects with a database. Read-only checks — never modify schema without explicit approval.

```bash
# If Supabase CLI is installed
supabase db lint 2>/dev/null || echo "supabase CLI not available"

# Unused indexes (via any PG client the project uses)
# Report only — do NOT drop indexes automatically
```

Queries to run manually (report results, don't act):

```sql
-- Unused indexes (never scanned)
SELECT schemaname, relname AS table, indexrelname AS index, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Tables with no incoming foreign keys (potential orphans)
SELECT c.relname FROM pg_class c
LEFT JOIN pg_constraint con ON con.confrelid = c.oid AND con.contype = 'f'
WHERE c.relkind = 'r' AND con.oid IS NULL
  AND c.relnamespace = 'public'::regnamespace;

-- Bloated tables (candidates for VACUUM FULL)
SELECT relname, n_dead_tup, n_live_tup,
  round(n_dead_tup::numeric / NULLIF(n_live_tup, 0), 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC NULLS LAST;
```

Also check:
- `migrations/` or `supabase/migrations/` — look for duplicate/abandoned migration files
- RLS policies still match the current auth model (if Supabase)

**Report findings only.** Any schema change is out of scope for hygiene.

---

## STEP 5 — Present Findings for Review

Before deleting anything, show the user a structured report and ask for approval:

```
┌─ 🧹 HYGIENE REPORT ────────────────────────────────────────────┐
│                                                                │
│  Stack: SvelteKit 5 + TS + Supabase                            │
│                                                                │
│  ✅ SAFE FIXES APPLIED (no approval needed)                    │
│     • 3 broken JSDoc imports fixed                             │
│     • 2 stale vite.config externals removed                    │
│     • 1 unused @ts-ignore removed                              │
│                                                                │
│  🔍 DELETION CANDIDATES (need your OK)                         │
│     Unused files (N):                                          │
│       • src/lib/utils/oldHelper.ts — 0 refs found              │
│       • src/lib/components/Unused.svelte — 0 refs found        │
│     Unused deps (N):                                           │
│       • lodash-es — 0 imports, 0 string refs                   │
│                                                                │
│  ⚠️  FALSE POSITIVES (keeping, documented)                     │
│     • pino-pretty — dynamic ref in logger.ts:44                │
│     • static/widget.js — loaded via app.html <script>          │
│                                                                │
│  📊 POSTGRES FINDINGS (manual review)                          │
│     • 3 unused indexes (combined 14 MB)                        │
│     • 2 bloated tables (dead_ratio > 0.3)                      │
│                                                                │
│  SKIPPED (low priority, not requested):                        │
│     • 527 unused type exports                                  │
│     • 213 unused interface declarations                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Proceed with deletions? [use AskUserQuestion]
```

Use `jat-signal needs_input` + `AskUserQuestion` with options:
- `Delete all candidates` — proceed with every file/dep listed
- `Delete files only` — skip dep changes (safer for npm tree)
- `Let me pick` — one-by-one confirmation
- `Report only, don't delete` — document and stop

---

## STEP 6 — Split-Commit Strategy

If the user approves deletions, commit in logical chunks for reviewability:

```bash
# Commit 1: Safe auto-fixes
git add <jsdoc fixes, config cleanups>
git commit -m "chore: fix broken JSDoc refs and stale build config"

# Commit 2: Unused dependencies (run npm install after)
git add package.json package-lock.json
git commit -m "chore: remove N unused npm dependencies"

# Commit 3: Unused files (batched, with file count in message)
git add -A
git commit -m "chore: delete N unused files (knip scan)"
```

Never use `git add .` — name files explicitly or use focused add patterns.

---

## STEP 7 — Verify and Report

After commits, run verification:

```bash
# Zero new type errors
npx svelte-check 2>&1 | tail -5

# Build still passes
npm run build 2>&1 | tail -5

# Git status clean
git status
```

Then emit review signal and present the final report:

```bash
jat-signal review '{
  "taskId": "TASK_ID",
  "taskTitle": "Code hygiene pass",
  "summary": [
    "Applied N safe fixes (JSDoc, config, ts-ignore)",
    "Deleted M unused files",
    "Removed P unused dependencies",
    "Documented Q false positives"
  ],
  "filesModified": [...],
  "testsStatus": "skipped",
  "buildStatus": "clean"
}'
```

---

## Output Format

End with a concise summary the user can scan:

```
🧹 HYGIENE PASS COMPLETE

Applied:  3 JSDoc fixes, 2 config cleanups, 1 dead ts-ignore
Deleted:  12 files, 3 dependencies
Kept:     4 flagged items (false positives documented)
Skipped:  Type exports (527), interfaces (213) — low priority
Commits:  3 (chore: config / chore: deps / chore: files)

Next: review commits, then push when ready.
```

---

## Error Handling

**Knip not installed:**
```bash
npx knip  # Will auto-install via npx
# Or: npm install -D knip
```

**svelte-check crashes:**
Skip Step 3 and report it. Don't block the rest of the pass.

**No frontend detected:**
Skip Steps 1-3, run only Step 4 (Postgres) if applicable.

**No database detected:**
Skip Step 4. That's fine.

**User declines deletions in Step 5:**
Stop cleanly. The safe fixes from Step 1 are already applied — commit them with `chore: safe hygiene fixes only` and exit.
