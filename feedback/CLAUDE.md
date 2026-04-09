# jat-feedback — Developer Guide

npm package: embeddable feedback widget + Supabase pipeline + JAT ingest integration.

## Package Structure

```
jat-feedback/
├── src/                    # Widget source (Svelte web component)
├── dist/                   # Built widget bundle (jat-feedback.js)
├── supabase/
│   ├── migrations/         # Versioned SQL migrations (bundled with npm)
│   └── functions/
│       └── jat-webhook/    # Edge function for status callbacks
├── package.json            # "files" includes dist/ and supabase/
└── README.md
```

## Versioning Rules

This package follows semver. Consuming projects use `"jat-feedback": "^1.x.x"` which auto-accepts patches and minors but requires a manual bump for majors.

### What triggers each version

| Change | Version bump |
|--------|-------------|
| Bug fix in widget JS | patch |
| New nullable column (additive) | patch or minor |
| New optional widget attribute | minor |
| New optional integrations.json field | minor |
| Removing or renaming a column | **major** |
| Changing a column's type | **major** |
| Renaming `status` values (`submitted` → `new`) | **major** |
| Required integrations.json field added or renamed | **major** |

### Rule for additive schema changes

Any column added in a `1.x` release **must** be nullable with no required default:

```sql
-- CORRECT: safe for 1.x (consuming projects won't break without migration)
ALTER TABLE project_tasks ADD COLUMN org_id TEXT;

-- WRONG: non-nullable without default = breaking = must be 2.0.0
ALTER TABLE project_tasks ADD COLUMN org_id TEXT NOT NULL;
```

If a new column is required at insert time, that's a breaking change — bump to the next major.

## Adding a Migration

1. Add a new versioned file in `supabase/migrations/`:
   ```
   supabase/migrations/1.2.0_add_org_fields.sql
   ```
2. Use additive-only SQL (`ALTER TABLE ... ADD COLUMN`, new indexes — never `DROP` or `RENAME` in a minor/patch)
3. Confirm `"supabase"` is in the `files` array in `package.json` (it is)
4. Bump the package version and publish

Consuming projects copy the migration manually:
```bash
cp node_modules/jat-feedback/supabase/migrations/1.2.0_*.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_1_2_0.sql
supabase db push
```

## Changelog

### 3.3.3

- Fixed `recording_url` never being persisted: recordings POST now UPDATEs `project_tasks`, report INSERT now includes `recording_url` from body
- Fixed reports GET SELECT missing `recording_url` column (history "Full replay" link was never appearing)
- Added `routes/feedback/replay/` — prerendered SvelteKit route; copy to `src/routes/feedback/replay/` in each consumer project. Fixes Cloudflare Pages `.html` stripping that caused 404 on the static replay page
- Added `static/feedback/` to npm package (replay.html, rrweb-replay.min.js/css) — copied via `viteStaticCopy` in consumer projects
- Fixed widget URLs: removed `.html` from replay hrefs in FeedbackPanel and RequestList

### Consumer project checklist (per-project, not in npm package)

These files must be present in each consumer project — they are NOT auto-applied:

| File | Action |
|------|--------|
| `src/routes/feedback/replay/+page.js` | Copy from `node_modules/jat-feedback/routes/feedback/replay/` |
| `src/routes/feedback/replay/+page.svelte` | Copy from `node_modules/jat-feedback/routes/feedback/replay/` |
| `src/routes/api/feedback/recordings/+server.ts` | Add `.update({ recording_url }).eq('id', reportId)` after storage upload |
| `src/routes/api/feedback/report/+server.ts` | Add `recording_url: body.recording_url \|\| null` to INSERT |
| `src/routes/api/feedback/reports/+server.ts` | Add `recording_url` to `.select(...)` string |
| `vite.config.ts` | Add `viteStaticCopy` target for `node_modules/jat-feedback/static/feedback` |

### 3.2.0

- Added `recording_url` TEXT column (nullable) to `feedback_reports` table
- Added `feedback-recordings` Supabase Storage bucket (private, with RLS)
- Added `POST /api/feedback/recordings` endpoint for uploading rrweb events
- FeedbackPanel now uploads recording events separately before report submission
- Recording events no longer sent inline in the report payload (replaced by URL)

## Building the Widget

```bash
npm install
npm run build   # outputs dist/jat-feedback.js
```

Consuming projects use `vite-plugin-static-copy` to copy `dist/jat-feedback.js` into their build output and serve it as `/jat-feedback.js`.

## Publishing

```bash
npm version patch   # or minor / major
npm publish
```

After publishing, update consuming projects:
- `jat/ide` — `cd ide && npm install jat-feedback@latest`
- `jst` — `npm install jat-feedback@latest`
- `steelbridge` — `npm install jat-feedback@latest`

Check each project's `supabase/migrations/` against the new migration files and apply any new ones.

If the edge function was updated, redeploy to all consuming projects:
```bash
for proj in flush steelbridge headcount; do
  cp feedback/supabase/functions/jat-webhook/index.ts ~/code/$proj/supabase/functions/jat-webhook/index.ts
  cd ~/code/$proj && npx supabase functions deploy jat-webhook --no-verify-jwt && cd ~/code/jat
done
```
