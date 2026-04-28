# PRD: JST Self-Hosted Stack Migration

## Product overview

### Document title and version

**PRD: JST Self-Hosted Stack — Supabase Replacement**
Version 1.0 — April 2026

### Product summary

JST (Joe's Software Template) is the shared SvelteKit 5 + DaisyUI foundation from which all product projects (Meadow, Flush, and future apps) are cloned. It currently ships Supabase as its entire backend: PostgREST for database queries, GoTrue for authentication, Supabase Storage for file uploads, and Cloudflare Pages for hosting. Every new project provisioned against a Supabase free tier eventually needs upgrading to a paid plan ($25/month minimum), and every development instance with zero real users incurs the same $25/month charge.

This document defines all code-level changes required to replace Supabase with an equivalent self-hosted stack running on a Hetzner VPS. The replacement stack uses `postgres.js` for direct database access, Better Auth for TypeScript-native session management, MinIO for S3-compatible file storage, drizzle-kit for schema migrations, and `adapter-node` for SvelteKit's server runtime under Caddy's reverse proxy. The change is made at the JST template level so that all downstream projects inherit the new stack when they pull template updates via the `jat-propagate` workflow.

The outcome is a cost model where a new project costs approximately $0 in incremental infrastructure (projects share the VPS) compared to $25/month per Supabase project, while preserving the same developer experience: `npm run dev` continues to work locally backed by a local Postgres container instead of Supabase.

---

## Goals

### Business goals

- Reduce per-project monthly infrastructure cost from $25 to ~$0 incremental by sharing a single Hetzner VPS across all projects.
- Remove the $25/month barrier to spinning up dev/staging environments for existing and new projects.
- Eliminate Supabase vendor lock-in without sacrificing Postgres as the underlying database.
- Enable JST-derived projects to adopt the new stack via a single `jat-propagate` pull with a defined migration checklist rather than a bespoke per-project rewrite.

### User goals

- **Developer (template maintainer):** Change the template once and propagate to all downstream projects with minimal per-project manual work.
- **Developer (project maintainer):** Run `npm run dev` against local Postgres without needing a Supabase account or project. Deploy with `docker build` + `docker push` rather than a Cloudflare Pages wrangler config.
- **End user (product user):** Experience no change — login, file upload, and all product features continue to work with equivalent behavior.

### Non-goals

- Replacing Supabase Realtime — SSE and polling patterns are sufficient for current projects.
- Migrating existing project data — each project's data migration is handled by a separate per-project PRD.
- Building or configuring Coolify or any Hetzner provisioning infrastructure — separate infra PRD.
- This PRD covers template code changes only, not operational runbooks.

---

## User personas

### Key user types

1. **Template maintainer** — the engineer who owns JST and applies the migration changes to the template itself.
2. **Project maintainer** — an engineer maintaining a downstream project (Meadow, Flush). Receives template changes via `jat-propagate`.
3. **End user** — a customer of a product built on JST. Experiences no visible change.

---

## Functional requirements

### FR-001 — Adapter replacement (P0)

Replace `@sveltejs/adapter-cloudflare` with `@sveltejs/adapter-node` in `svelte.config.js`. The build output must be a Node.js-compatible server bundle executable with `bun build/index.js`.

### FR-002 — Database client (P0)

Add `postgres` (postgres.js) as a production dependency. Create `src/lib/server/db.ts` exporting a singleton connection pool from `DATABASE_URL`, a typed `sql` tagged-template helper, and a `withRLS(session, fn)` wrapper that sets `request.jwt.claims` before executing a query block.

### FR-003 — Remove supabase-js (P0)

Remove `@supabase/supabase-js` and `@supabase/ssr`. Replace all `event.locals.supabase.from(…)` and `event.locals.supabaseServiceRole.from(…)` call sites with `locals.db` postgres.js queries. Remove `locals.supabase` and `locals.supabaseServiceRole` from `src/app.d.ts`.

### FR-004 — RLS compatibility layer (P0)

Preserve `auth.uid()`, `auth.email()`, and `auth.role()` as SQL functions in a migration file reading from `request.jwt.claims`. The `withRLS` wrapper calls `SET LOCAL request.jwt.claims = '...'` before each transaction.

```sql
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.email() RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'email'
$$ LANGUAGE sql STABLE;
```

### FR-005 — Better Auth integration (P0)

Add `better-auth`. Create `src/lib/server/auth.ts` configuring:
- Email+password provider
- Google OAuth (reusing `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)
- Magic link / email OTP
- Organizations/teams plugin (replaces multi-tenant team membership)
- Sessions in `auth_sessions` Postgres table

Mount Better Auth's handler at `/api/auth/**` in `hooks.server.ts`.

### FR-006 — Locals shape (P0)

Update `src/app.d.ts`:

```typescript
interface Locals {
  db: postgres.Sql
  session: BetterAuthSession | null
  user: BetterAuthUser | null
  role: UserRole | null
  currentTeam: TeamContext | null
  orgConfig: OrgConfig | null
  resolvedTeamId: string | null
}
```

### FR-007 — Auth UI replacement (P0)

Remove `@supabase/auth-ui-svelte` and `@supabase/auth-ui-shared`. Replace `src/routes/login/+page.svelte` with a custom Svelte 5 form posting to Better Auth's email+password, Google OAuth, and magic link endpoints. DaisyUI card layout preserved.

### FR-008 — MinIO storage client (P0)

Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`. Create `src/lib/server/storage.ts` exporting:
- `uploadFile(bucket, key, body, contentType)`
- `deleteFile(bucket, key)`
- `getPublicUrl(bucket, key)` — uses `PUBLIC_MINIO_BASE_URL`
- `getPresignedUploadUrl(bucket, key, contentType, expiresIn)`
- `getPresignedDownloadUrl(bucket, key, expiresIn)`

### FR-009 — Storage call-site migration (P0)

Replace all `supabase.storage.from(bucket).upload(...)`, `.getPublicUrl(...)`, `.createSignedUrl(...)` call sites with the helpers from FR-008.

### FR-010 — Drizzle schema and migrations (P0)

Add `drizzle-orm` and `drizzle-kit`. Create `drizzle.config.ts` and `src/lib/server/db/schema.ts`. Add npm scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`. Remove `supabase/` directory. Preserve existing migration SQL as Drizzle baseline in `drizzle/`.

### FR-011 — Dockerfile (P1)

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "build/index.js"]
```

Add `.dockerignore` excluding `node_modules`, `.env*`, `supabase/`.

### FR-012 — Environment variables (P0)

New `.env.example`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://yourdomain.com
PUBLIC_MINIO_BASE_URL=https://media.yourdomain.com
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_MEDIA=media
MINIO_BUCKET_FILES=files
```

Remove `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PRIVATE_SUPABASE_SERVICE_ROLE` everywhere.

### FR-013 — Local dev compose file (P1)

Add `docker-compose.dev.yml` with Postgres 16 (pg_cron enabled) and MinIO services using named volumes.

### FR-014 — pg_cron continuation (P1)

Preserve all pg_cron jobs in Drizzle migration SQL. Replace `pg_net` HTTP calls with `src/lib/server/cron.ts` using `croner` library — starts with the server process, fires HTTP requests to `/api/cron/*` routes on their original schedules.

### FR-015 — jat-propagate checklist (P1)

Create `docs/self-hosted-adoption-checklist.md` with every manual migration step:
1. Set new environment variables in all environments
2. Provision MinIO buckets with correct ACLs (media=public, files=private)
3. Run `npm run db:migrate` against production database
4. Update Google Cloud Console OAuth callback URLs
5. Remove stale `supabase/` directory
6. Update CI/CD from Cloudflare Pages to Docker build+push
7. 30-day rollback window: keep Supabase project provisioned

### FR-016 — DatabaseDefinitions.ts removal (P1)

Remove `src/DatabaseDefinitions.ts`. Replace `Database['public']['Tables']['table']['Row']` patterns with `typeof table.$inferSelect` from Drizzle schema.

### FR-017 — Auth hook compatibility (P0)

Rewrite `orgBranding` and `teamContext` hooks in `hooks.server.ts` to use `locals.db` postgres.js queries. `locals.currentTeam`, `locals.orgConfig`, `locals.resolvedTeamId` behavior preserved identically.

### FR-018 — TypeScript strict compliance (P1)

All new files pass `npm run check` with zero errors. No `@ts-expect-error` suppressions in new files.

### FR-019 — Test coverage (P2)

Vitest unit tests for `withRLS`, `getPublicUrl`, `checkRouteAccess`, `requireRole`.

---

## New environment variables

| Old (Supabase) | New (Self-hosted) |
|---|---|
| `PUBLIC_SUPABASE_URL` | `DATABASE_URL` |
| `PUBLIC_SUPABASE_ANON_KEY` | `BETTER_AUTH_SECRET` |
| `PRIVATE_SUPABASE_SERVICE_ROLE` | `BETTER_AUTH_URL` |
| — | `PUBLIC_MINIO_BASE_URL` |
| — | `MINIO_ENDPOINT` |
| — | `MINIO_ACCESS_KEY` |
| — | `MINIO_SECRET_KEY` |
| — | `MINIO_BUCKET_MEDIA` |
| — | `MINIO_BUCKET_FILES` |

---

## Data model changes

### New tables (Better Auth managed)
- `auth_sessions` — active user sessions
- `auth_accounts` — OAuth provider accounts linked to users
- `auth_verifications` — email verification and magic link tokens

### Preserved tables (unchanged)
All existing application tables (`profiles`, `teams`, `team_members`, `team_invitations`, etc.) are unchanged. Schema is carried forward in the Drizzle baseline migration.

### Removed
- Supabase internal schemas (`auth.*` GoTrue tables) are no longer present — Better Auth manages its own tables in `public`.

---

## Technical considerations

### Better Auth session shape
Better Auth session and user objects have different field names than Supabase's types. A compatibility type in `src/lib/auth.ts` eases the transition. Recommended: keep custom `teams`/`team_members` tables and use Better Auth only for session/user management (option B) to minimize blast radius.

### Connection pooling
postgres.js pool size defaults to 10, configurable via `DATABASE_POOL_MAX`. PgBouncer is an optional future addition — connection string format is compatible.

### MinIO public URLs
`getPublicUrl()` uses `PUBLIC_MINIO_BASE_URL` (e.g., `https://media.yourdomain.com`) not the internal MinIO endpoint. Caddy proxies this subdomain to MinIO.

### pg_net replacement
`src/lib/server/cron.ts` using `croner` fires HTTP requests to `/api/cron/*` on original schedules. Starts with server process. Errors are logged, never crash the server.

### Cloudflare compatibility
Any downstream project using `event.platform.env` (CF bindings) must remove those usages before adopting `adapter-node`. Grep for `platform` in `*.server.ts` is part of the adoption checklist.

---

## Milestones

### Phase 1 — Foundation (weeks 1–2, P0 FRs)
FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-012, FR-017.

**Milestone:** Clean clone passes `npm run check`. Developer can register, log in, upload a file, and see admin dashboard with zero Supabase credentials.

### Phase 2 — Packaging and tooling (week 3, P1 FRs)
FR-011, FR-013, FR-014, FR-015, FR-016, FR-018.

**Milestone:** `docker build` produces a runnable image. `docker compose -f docker-compose.dev.yml up -d && npm run dev` is the documented local setup.

### Phase 3 — Meadow adoption (week 4)
Apply via `jat-propagate`. Replace all `supabase.from()` call sites. Update type imports. Verify auth, media upload, PDF generation, admin portal in staging.

**Milestone:** Meadow passes `npm run check`, all tests pass, staging QA complete.

### Phase 4 — Flush adoption + tests (weeks 5–6)
Apply to Flush. Handle Stripe sync engine replacement. Add P2 test coverage.

**Milestone:** Flush staging functional, FR-019 tests green, template declared stable.

---

## Success metrics

- New project incremental infrastructure cost: $0
- Per-project adoption effort: under 2 developer-days
- `npm run dev` cold start: under 5 minutes from `git clone`
- `npm run check`: zero errors on clean clone
- Server cold start: under 3 seconds
- DB query latency: ≤ equivalent PostgREST latency (direct postgres.js removes HTTP round-trip)

---

## User stories (40 total)

See full user story list covering: authentication (US-001–US-010), database access (US-011–US-017), file storage (US-018–US-022), developer experience (US-023–US-028), pg_cron (US-030–US-031), security (US-032–US-035), migration compatibility (US-036–US-040).

Key acceptance criteria:
- US-001: `npm run dev` starts with zero Supabase env vars
- US-002: Login with email+password sets HttpOnly session cookie
- US-003: Google OAuth creates/links user record
- US-011: `sql` tagged template returns typed rows
- US-012: `withRLS` correctly sets and clears `request.jwt.claims`
- US-018: `uploadFile()` stores object in MinIO bucket
- US-023: `docker compose -f docker-compose.dev.yml up -d` starts full local stack
- US-026: `docker build` produces image under 400MB
- US-029: Rollback procedure documented with 30-day Supabase grace period
- US-032: `DATABASE_URL` only imported from `$env/dynamic/private`
- US-040: Media analysis pipeline works with MinIO URLs
