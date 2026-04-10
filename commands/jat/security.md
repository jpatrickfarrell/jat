---
argument-hint: [--dry-run | --no-tasks | --severity=critical|high|all]
---

# /jat:security - Stack-Specific Security Audit

Passive security audit for TypeScript/Svelte/Postgres projects. Scans for the known attack vectors in each layer, triages findings by severity, and creates tasks only for exploitable issues.

**Use this when:** User asks for a security audit, pre-launch review, or periodic security hygiene.

**Flags:**
- `--dry-run` — Report findings, don't create any tasks
- `--no-tasks` — Same as --dry-run (alias)
- `--severity=critical` — Only create tasks for 🔴 findings (default: critical + high)
- `--severity=all` — Create tasks for every non-green finding (noisy)

**This is NOT for:** Active probing, pentesting, WAF evasion, or anything that could look like an attack. Passive code + config review only.

---

## Philosophy: Signal Over Noise

Security scanners are notorious for producing CVE dust and theoretical findings. This command triages into three buckets and **only creates tasks for the first two**:

| Icon | Severity | Criteria | Action |
|---|---|---|---|
| 🔴 | **Critical** | Exploitable right now by an unauthenticated attacker | Create task, P0 |
| 🟡 | **High** | Exploitable with some condition (authed user, specific flow) | Create task, P1 |
| 🟢 | **Defense-in-depth** | Hardening opportunity, no current vuln | Report only |

**Never do:**
- Active probing (no curl against the live site)
- Brute-force anything
- Bypass WAFs / rate limiters
- Anything that could trip a security alert on the target infrastructure

**Always do:**
- Read-only code + config review
- Grep for dangerous patterns
- Check `git log` for leaked secrets
- Inspect built bundles for exposed keys

---

## STEP 0 — Stack Detection

Detect which layers apply, skip irrelevant sections:

```bash
# Frontend
test -f package.json && echo "has-node"
test -f svelte.config.js && echo "has-sveltekit"
ls src/**/*.svelte 2>/dev/null | head -1 && echo "has-svelte"

# Database
test -d supabase && echo "has-supabase"
grep -l '"pg"\|"postgres"\|@supabase' package.json 2>/dev/null && echo "has-pg"
test -d migrations -o -d supabase/migrations && echo "has-migrations"

# Deployment
test -f .env -o -f .env.local && echo "has-env"
test -f vercel.json -o -f netlify.toml && echo "has-cloud-deploy"
```

Announce detected layers, skip checks that don't apply.

---

## STEP 1 — Secrets & Credentials (🔴 highest priority)

### 1a. Secrets in git history

```bash
# If gitleaks available, use it — best tool for this
which gitleaks && gitleaks detect --source . --no-git --verbose 2>&1 | tail -40

# Fallback: grep git log for common patterns
git log --all -p 2>&1 | \
  grep -E "(api[_-]?key|secret|password|token|private[_-]?key).*['\"][a-zA-Z0-9_-]{20,}" | \
  head -20

# Scan current working tree
grep -rIE "(sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]+\.)" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.svelte-kit 2>/dev/null | head -20
```

**Severity:**
- Secret in current working tree → 🔴 Critical
- Secret in git history (still in remote) → 🔴 Critical (rotate + purge)
- Secret only in .env.local with proper gitignore → 🟢 OK

### 1b. .env hygiene

```bash
# Is .env in gitignore?
grep -E "^\.env($|\.local|\.production)" .gitignore || echo "MISSING"

# Are any .env files actually tracked?
git ls-files | grep -E "\.env" | grep -v "\.env\.example"
```

- Tracked `.env` file → 🔴 Critical
- Missing gitignore entry → 🟡 High

### 1c. Keys in client bundles

```bash
# Build project, then scan the output for secrets
# Only run if a build output exists — don't trigger a fresh build
if [ -d .svelte-kit/output/client ]; then
  grep -rE "(sk-|ghp_|AKIA|service_role)" .svelte-kit/output/client/ 2>/dev/null | head -10
fi
if [ -d build ]; then
  grep -rE "(sk-|ghp_|AKIA|service_role)" build/ 2>/dev/null | head -10
fi
```

- Any secret in client bundle → 🔴 Critical (attacker just opens devtools)

### 1d. SvelteKit PUBLIC_ misuse

SvelteKit convention: `PUBLIC_*` env vars are bundled into the client. `$env/static/private` / `$env/dynamic/private` are server-only. Common mistakes:

```bash
# Private secrets accidentally prefixed PUBLIC_
grep -rE "PUBLIC_.*(SECRET|KEY|TOKEN|PASSWORD)" .env* 2>/dev/null

# $env/dynamic/public accessing sensitive-looking values
git grep -E "env/dynamic/public.*(secret|key|token)" src/ 2>/dev/null
```

- `PUBLIC_*_SECRET` / `PUBLIC_*_KEY` for anything non-public → 🔴 Critical

---

## STEP 2 — Postgres / Supabase RLS (if applicable)

**This is the biggest attack surface in Supabase apps.** Most RLS bugs are silent and catastrophic.

### 2a. RLS enabled on every public table

Run via `db-query` / `supabase db` / psql:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

- Any table returned → 🔴 Critical. Public table with RLS off is world-readable via the anon key.

### 2b. Tables with RLS enabled but no policies

```sql
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public' AND t.rowsecurity = true AND p.policyname IS NULL;
```

- Any table returned → 🔴 Critical. RLS enabled + no policies = deny-all, usually a bug that leads to "fix" via disabling RLS.

### 2c. Policies missing WITH CHECK on INSERT/UPDATE

```sql
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('INSERT', 'UPDATE', 'ALL')
  AND with_check IS NULL;
```

- Policies on INSERT/UPDATE without `WITH CHECK` let users insert rows they couldn't select → 🟡 High

### 2d. Service role key usage in client code

```bash
# service_role key has RLS-bypass superpowers, must NEVER appear in client code
git grep -E "SUPABASE_SERVICE_ROLE|service_role" src/ --include='*.svelte' --include='*.ts' --include='*.js' | \
  grep -v "\.server\."
```

- Service role key referenced in non-`.server.*` files → 🔴 Critical

### 2e. Policies using dangerous patterns

```sql
-- Policies that allow 'true' (no actual check)
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public' AND qual = 'true';
```

- Policies with `USING (true)` → 🟡 High (often intentional for public-read, verify per table)

---

## STEP 3 — SvelteKit Server Routes

`+server.ts` and `+page.server.ts` are prime attack surface — they run with full server privileges.

### 3a. API routes without auth guards

```bash
# Find +server.ts files and check for auth patterns
find src/routes -name "+server.ts" -o -name "+server.js" | while read f; do
  if ! grep -qE "locals\.(user|session|supabase)|throw.*error\(401|requireAuth" "$f"; then
    echo "NO AUTH: $f"
  fi
done
```

- Routes matching sensitive paths (`/api/admin`, `/api/user`, `/api/*/delete`) without auth → 🔴 Critical
- Other routes without auth → 🟡 High (verify if intentional)

### 3b. Form actions without CSRF

SvelteKit handles CSRF automatically for form actions, but **only if the request has the right origin header and content-type**. JSON APIs bypass this.

```bash
# Check hooks.server.ts for CSRF config
grep -rE "csrf.*false|checkOrigin.*false" src/hooks.server.* src/app.d.ts 2>/dev/null
```

- `csrf: { checkOrigin: false }` → 🟡 High unless documented

### 3c. SSRF in server-side fetch

```bash
# Server-side fetch() using user input without allowlist
grep -rE "fetch\(.*request\.|fetch\(.*params\.|fetch\(.*url\." \
  src/routes/**/+*.server.* src/routes/**/+server.* 2>/dev/null | head -20
```

- User-controlled URL passed to server `fetch()` → 🟡 High (can probe internal services, cloud metadata endpoints)

### 3d. Open redirects

```bash
# redirect() using user input
grep -rE "redirect\([0-9]+,\s*(url|params|request|locals)" src/routes/ 2>/dev/null | head -20
```

- User-controlled redirect target → 🟡 High (phishing vector)

### 3e. SQL injection in raw queries

```bash
# String concatenation into SQL
grep -rE "(query|execute|sql)\s*\(\s*[\"\`'].*\\\$\{" src/ --include='*.ts' --include='*.js' 2>/dev/null
```

- Template literal in SQL query → 🔴 Critical

---

## STEP 4 — Svelte Component XSS

### 4a. {@html} with user input

```bash
# {@html someVar} where someVar comes from server/props/form
git grep -nE '\{@html\s+' src/ --include='*.svelte'
```

For each hit: trace the variable back. If it's user-controllable and not explicitly sanitized (via DOMPurify or similar) → 🔴 Critical.

### 4b. User-controlled href / src

```bash
# href/src bindings to user data without scheme validation
git grep -nE 'href=\{[^}]*\}|src=\{[^}]*\}' src/ --include='*.svelte' | \
  grep -iE "(user|profile|post|comment|review)"
```

Verify schemes. `javascript:` URIs in href = XSS → 🔴 Critical.

### 4c. Dangerous DOM manipulation

```bash
git grep -nE "innerHTML|outerHTML|document\.write|eval\(" src/ --include='*.svelte' --include='*.ts'
```

- `.innerHTML = userInput` → 🔴 Critical
- `eval(userInput)` → 🔴 Critical

---

## STEP 5 — Dependencies

### 5a. npm audit

```bash
npm audit --production --json 2>/dev/null | \
  jq -r '.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high") | "\(.value.severity): \(.key) — \(.value.via[0].title // .value.via[0])"' 2>/dev/null | head -20
```

- `critical` severity + reachable from production code → 🔴
- `high` severity in production deps → 🟡
- `moderate` / `low` / devDeps only → 🟢

### 5b. Known-abandoned / typo-squat packages

Quick manual check: any suspicious-looking package names in `package.json`? Any deps you don't recognize? (Supply-chain attacks often use typo-squats like `reqeust`, `lodahs`.)

---

## STEP 6 — HTTP Hardening

### 6a. Security headers in hooks.server.ts

```bash
# Check for common security headers
grep -rE "(Content-Security-Policy|X-Frame-Options|Strict-Transport-Security|X-Content-Type-Options)" \
  src/hooks.server.* 2>/dev/null
```

Missing headers → 🟢 (defense-in-depth, not exploitable by itself)

### 6b. CORS wide-open

```bash
grep -rE "Access-Control-Allow-Origin.*\*" src/ 2>/dev/null
```

- `*` on a route that returns authenticated data → 🟡 High
- `*` on a public read-only API → 🟢

### 6c. CSP presence

```bash
grep -r "Content-Security-Policy" src/app.html src/hooks.server.* svelte.config.js 2>/dev/null
```

Missing CSP → 🟢

---

## STEP 7 — Triage & Present Findings

Compile all findings into a categorized report:

```
┌─ 🔒 SECURITY AUDIT REPORT ─────────────────────────────────────┐
│                                                                │
│  Stack: SvelteKit 5 + Supabase                                 │
│  Scanned: N files, M routes, P policies, Q deps                │
│                                                                │
│  🔴 CRITICAL (N findings) — create P0 tasks                    │
│     • Supabase service_role key in src/lib/client.ts:14        │
│     • RLS disabled on public.user_profiles                     │
│     • {@html bio} in src/routes/u/[id]/+page.svelte:42         │
│                                                                │
│  🟡 HIGH (M findings) — create P1 tasks                        │
│     • +server.ts admin route without auth: /api/admin/seed     │
│     • SSRF: fetch(request.url.searchParams.get('target'))      │
│     • npm audit: lodash@4.17.15 (prototype pollution)          │
│                                                                │
│  🟢 DEFENSE-IN-DEPTH (P findings) — report only                │
│     • Missing CSP header                                       │
│     • No HSTS header                                           │
│     • CORS * on public /api/feed                               │
│                                                                │
│  ✅ CHECKS PASSED                                              │
│     • No secrets in git history (gitleaks clean)               │
│     • .env files properly gitignored                           │
│     • No service_role in client bundle                         │
│     • RLS enabled on all other public tables                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Use `jat-signal needs_input` + `AskUserQuestion` with options:
- `Create all tasks (critical + high)` — default
- `Critical only` — P0 tasks only
- `Report only, don't create tasks` — exit cleanly
- `Let me pick` — one-by-one

---

## STEP 8 — Create Tasks (if approved)

For each finding that gets approved, create a task with structured description:

```bash
jt create "SECURITY: <short description>" \
  --type bug \
  --priority <0 for critical, 1 for high> \
  --labels "security,audit,<layer>" \
  --description "$(cat <<'EOF'
**Severity:** 🔴 Critical
**Layer:** Supabase RLS
**Attack vector:** Unauthenticated read of user_profiles

## Finding
RLS is disabled on public.user_profiles. Any caller with the anon key can:

\`\`\`sql
SELECT * FROM user_profiles;
\`\`\`

Detected by: /jat:security on YYYY-MM-DD

## Evidence
\`\`\`sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';
-- rowsecurity: false
\`\`\`

## Remediation
1. Enable RLS: \`ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;\`
2. Add policies for SELECT/INSERT/UPDATE/DELETE matching the auth model
3. Verify with a test query using the anon key
4. Deploy migration via supabase db push

## Verification
After fix, re-run /jat:security — this finding should be gone.
EOF
)"
```

One task per finding. Label consistently so they can be filtered: `jt list --labels security`.

---

## STEP 9 — Optional Deep Dive

For any 🔴 finding the user wants investigated further, offer to delegate to the `security-auditor` subagent:

```
Want me to delegate any critical findings to the security-auditor subagent for
a deep-dive analysis (full exploit chain, blast radius, mitigation options)?
```

Only do this when the user explicitly asks — the subagent is expensive and the
command already gives a actionable triage.

---

## Output Format

End with a concise summary:

```
🔒 SECURITY AUDIT COMPLETE

Findings:  3 🔴 critical, 5 🟡 high, 7 🟢 defense-in-depth
Tasks:     8 created (3 P0, 5 P1)
Passed:    12 checks

Next: review created tasks with `jt list --labels security`
      then pick the P0s first with `/jat:start`
```

---

## Error Handling

**gitleaks not installed:**
Fall back to manual grep patterns in 1a. Note the gap in the report.

**No database access:**
Skip Step 2 and note it. Don't fail the whole audit.

**Build output doesn't exist:**
Skip 1c (client bundle scan). Don't trigger a fresh build — too slow.

**npm audit fails:**
Note it and move on. Some projects have broken lockfiles.

**User declines all tasks in Step 7:**
Exit cleanly. Don't create anything. The report already happened.
