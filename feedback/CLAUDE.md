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
ALTER TABLE feedback_reports ADD COLUMN org_id TEXT;

-- WRONG: non-nullable without default = breaking = must be 2.0.0
ALTER TABLE feedback_reports ADD COLUMN org_id TEXT NOT NULL;
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
