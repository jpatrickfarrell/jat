# JAT Identity & Cross-Project User Linking

Who you are in JAT, how your identity maps into each Supabase-backed project,
and how comments / routing resolve to the right profile everywhere.

> **Related:** This doc covers **comment-author** identity resolution (who wrote a reply). For **task-actor** identity (creator / requester / approver — who owns, asked for, and must sign off on a task), see `shared/tasks.md` § *Task Identity & Routing* and the full spec at `ide/docs/prd-task-identity-routing.md`. Both systems use email as the cross-project anchor and resolve through `auth.users` in postgres projects.

## The problem

JAT is one IDE that talks to many projects, each with its own Supabase database
and its own `auth.users` / `profiles` tables. Your user record is a **different
UUID in every project**. The UUID is not a useful cross-project identifier.

What *is* stable across projects is **your email**. Every Supabase project's
`auth.users` table has an `email` column. JAT uses email as the one anchor that
resolves into each project's local UUID on demand.

```
JAT identity  ──── email ────► per-project auth.users.id (UUID)
                   "j@wn.ke"   meadow:      39d8c496-...
                                flush:       f3f575ae-...
                                headcount:   7aedb962-...
                                steelbridge: 8d0222dc-...
```

## Source of truth for your identity

Resolution order (both the IDE and `jat-identity-sync` follow this):

1. `~/.config/jat/identity.json` — JAT-specific override, written via the IDE's
   UserProfile dropdown or by hand. Either `name` or `email` may be omitted;
   missing keys fall through.
2. `git config --global user.name` / `git config --global user.email` — fallback.

The override exists because your git identity may legitimately differ from the
identity you use inside your SaaS projects (personal email on git, work email in
apps). Saving an override in the IDE writes:

```json
// ~/.config/jat/identity.json  (mode 0600)
{ "name": "Joseph Winke", "email": "j@wn.ke" }
```

**API:** `GET /api/config/user` returns `{ name, email, initials, source: { name: 'jat'|'git'|'none', email: 'jat'|'git'|'none' } }`. `PUT` accepts either field; sending an empty string or `null` clears that field's override (falls back to git).

## Comment authorship flow

When you reply to a task via `/tasks-fast` (or any future identity-aware UI),
the client sends three fields:

```json
{
  "text": "...",
  "author": "Joseph Winke",
  "author_email": "j@wn.ke",
  "author_type": "user",
  "comment_type": "note"
}
```

The server-side comment handler (`ide/src/routes/api/tasks/[id]/comments/+server.js`) passes `author_email` through to the backend.

The postgres-backed `addComment` in `lib/tasks-project-tasks.js` resolves the
email via **`auth.users`** (not `profiles`), because `profiles` schemas vary
per project while `auth.users.email` is always there:

```sql
SELECT au.id, p.full_name
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE lower(au.email) = lower($1)
LIMIT 1
```

What gets stored on the comment row:

| Column / field | Source | Purpose |
|---|---|---|
| `author` | `profiles.full_name` if found, else caller's value | Canonical display name per project |
| `metadata.author_id` | `auth.users.id` from the join | Stable UUID for avatar / permissions / future `@mention` features |
| `metadata.author_email` | what the client sent | Cross-project anchor for future lookups |
| `author_type` | caller's value | `'user'` / `'agent'` / `'system'` |

SQLite-backed projects don't have `auth.users`; they store `metadata.author_email` verbatim for future use.

## Integration with the graduate flow

When a project graduates from SQLite → Postgres via the IDE (`/config` →
Projects → Graduate, backed by `GraduationWizard.svelte`), identity sync runs
automatically as a trailing step:

1. `graduateProject()` finishes (tasks + comments copied, backend flipped).
2. The endpoint resolves your JAT identity (`resolveIdentity()`).
3. `syncIdentityForProject(project, identity, { apply: true })` is called.
4. The result is attached to the response as `result.identitySync`.
5. GraduationWizard's success screen renders a success / skip / error row
   showing what was done (e.g. "created auth user", "updated profiles.full_name").

The sync is **best-effort and non-blocking**: a failure (no service role key,
project unreachable, etc.) does *not* fail the graduation. The user sees a
warning panel with the exact CLI invocation to re-try:
`jat-identity-sync --project <name> --apply`.

Both the synchronous (`POST /api/projects/[name]/graduate`) and streaming
(`POST /api/projects/[name]/graduate/stream`) endpoints run the trailing
identity sync. The streaming endpoint emits a progress event
(`phase: 'identity-sync'`, `percent: 98`) so the UI can surface it before the
final `done` event.

## Homogenizing identity across projects: `jat-identity-sync`

```
jat-identity-sync              # dry-run: show what would change
jat-identity-sync --apply      # actually write
jat-identity-sync --project X  # restrict to one project
```

The tool walks every project registered with `jat-secret` (any `<proj>-supabase-service-role-key`) and, using the service role key:

1. **`admin.createUser`** if no `auth.users` row matches your email.
2. **`admin.updateUserById`** if `user_metadata.full_name` differs from your JAT name.
3. **Upsert `profiles.full_name`** (only touches that column — leaves `company_name`, `organization_id`, etc. alone).

Re-run after any of:
- editing `identity.json` (name or email change)
- adding a new project with Supabase credentials
- restoring a paused Supabase project (it shows as `error fetch failed` until reachable)

The tool is **idempotent**: second run shows `✅ ok` everywhere it already is.

**Implementation:** `tools/core/jat-identity-sync` (Node ESM, uses the Supabase
Admin API + PostgREST directly). Installed by `install.sh` as `~/.local/bin/jat-identity-sync`.

## Caveats by project type

| Project shape | What sync does | What it does NOT do |
|---|---|---|
| **Single-tenant JST app** (meadow, steelbridge, headcount) | Creates your auth user + profile row | Nothing else needed |
| **Multi-tenant** (flush) | Creates your auth user + profile row | Does NOT add you to any `organization_users` — you can be comment-routed but can't log in to the app until someone adds you to an org |
| **Self-hosted** (jat-vps) | Works the same — service role key is all it needs | — |
| **Paused / unreachable** (e.g. arkagent) | Reports `error fetch failed`, continues with others | Will pick up automatically on the next run once the project is live again |

## Schema assumptions

The sync tool only requires:
- `auth.users` (guaranteed by Supabase)
- `public.profiles` with an `id` UUID PK that matches `auth.users.id` (JST template default; present in all current children)
- a `full_name TEXT` column on `profiles` (JST template default)

It does **not** require `profiles.email`. If your project adds one (meadow does, via the JST feedback 3.0.0 migration), it continues to work — JAT reads email from `auth.users` regardless.

## Avatars

`profiles.avatar_url` is already populated by each project when users upload an
avatar in the app. `jat-identity-sync` does not currently upload or link
avatars — it only writes name / email. Cross-project avatar rendering (showing
*your* avatar next to comments posted from JAT) is tracked by jat-vlc8s and
future identity work.

## Files

| File | Role |
|---|---|
| `~/.config/jat/identity.json` | Per-machine JAT identity override |
| `ide/src/routes/api/config/user/+server.ts` | GET + PUT identity endpoint |
| `ide/src/lib/components/UserProfile.svelte` | Avatar dropdown edit UI |
| `ide/src/lib/components/tasks-fast/TaskFastCompose.svelte` | Sends `author` + `author_email` |
| `ide/src/routes/api/tasks/[id]/comments/+server.js` | Accepts `author_email`, passes through |
| `lib/tasks-project-tasks.js` → `addComment` | Resolves email → `auth.users.id` + `profiles.full_name` |
| `tools/core/jat-identity-sync` | CLI: propagate identity to all projects |
