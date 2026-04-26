## Supabase RLS Patterns

### Never subquery `auth.users` from a policy granted `TO authenticated`

**Rule:** Inside any `CREATE POLICY ... TO authenticated`, do not write `(SELECT … FROM auth.users WHERE id = auth.uid())` or any other read from `auth.users`. The `authenticated` role does not have `SELECT` on `auth.users`, so the subquery throws

```
permission denied for table users
```

at policy-evaluation time and the entire request fails — even when the rest of the policy logic would have allowed it.

**Use the JWT helpers instead:**

| Need | Use |
|------|-----|
| Caller's email | `auth.email()` |
| Caller's user id | `auth.uid()` |
| Custom JWT claim | `auth.jwt() ->> 'role'`, `auth.jwt() -> 'app_metadata' ->> 'tenant_id'`, etc. |

These read directly from the JWT in the current `request.jwt.claims` setting — no table access required, works for every authenticated request.

**Wrong:**
```sql
create policy invitation_select on team_invitations for select to authenticated
  using (
    has_team_role(team_id, 'admin')
    or email = (select email from auth.users where id = auth.uid())  -- ❌ "permission denied for table users"
  );
```

**Right:**
```sql
create policy invitation_select on team_invitations for select to authenticated
  using (
    has_team_role(team_id, 'admin')
    or email = auth.email()  -- ✅ JWT claim, no table access
  );
```

**FK references are fine.** `references auth.users(id)` in a `CREATE TABLE` is DDL — it does not run as the calling user and does not need SELECT on `auth.users`. The rule above applies only to runtime expressions inside `USING` / `WITH CHECK`.

**If you genuinely need richer user data in a policy** (full name, role, anything not in the JWT), denormalize it into `public.profiles` (or your project's equivalent) via an `after insert on auth.users` trigger and reference `profiles` from the policy. The `authenticated` role has SELECT on tables in `public` by default.

**Historical context:** burned on meadow-d63i2 (2026-04-26). Two policies hit this in production — `project_tasks_comments` UPDATE/DELETE blocked all comment edits/deletes, and `team_invitations.invitation_select` would have blocked invitee email lookups. Both originated from the same `multi_tenant_teams.sql` migration in the JST template.
