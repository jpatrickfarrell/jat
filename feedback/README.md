# jat-feedback

Embeddable feedback widget for bug reports and feature requests. Ships as a web component (`<jat-feedback>`) that captures screenshots, console logs, and user context.

Reports are stored in your Supabase database. The JAT ingest daemon polls for new rows and creates tasks automatically.

```
User clicks "Report Bug" → Widget captures context → POST /api/feedback/report
  → Supabase feedback_reports table → JAT ingest daemon → JAT task created
```

## Install

### Option 1: CDN (recommended)

```html
<script src="https://unpkg.com/jat-feedback@^1/dist/jat-feedback.js"></script>
<jat-feedback project="my-app"></jat-feedback>
<script>
  document.querySelector('jat-feedback').setAttribute('endpoint', location.origin);
</script>
```

### Option 2: npm

```bash
npm install jat-feedback
```

```js
import 'jat-feedback';
```

## Widget Attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `endpoint` | Yes | `''` | Base URL for the report API (usually `location.origin`) |
| `project` | Yes | `''` | Project identifier (e.g., `"my-app"`) |
| `position` | No | `'bottom-right'` | Widget position: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `theme` | No | `'dark'` | Color theme: `light`, `dark`, `auto` |
| `buttoncolor` | No | `'#3b82f6'` | Hex color for the floating button |
| `user-id` | No | `''` | Authenticated user's ID |
| `user-email` | No | `''` | Authenticated user's email |
| `user-name` | No | `''` | Authenticated user's display name |
| `user-role` | No | `''` | User's role (e.g., `admin`, `user`) |
| `org-id` | No | `''` | Organization/tenant ID |
| `org-name` | No | `''` | Organization name |

## What the Widget Captures

Each report includes:

- **Title and description** (user-provided)
- **Type**: bug, enhancement, or other
- **Priority**: low, medium, high, critical
- **Screenshots**: Full-page captures as base64 data URLs
- **Console logs**: Recent console output (errors, warnings, logs)
- **Selected elements**: DOM elements the user highlighted
- **Page URL and user agent**
- **User context**: All `user-*` and `org-*` attributes

## Programmatic Control

Open the widget from a button in your app:

```js
window.dispatchEvent(new CustomEvent('jat-feedback:open'));
```

---

## Integration Guide: SvelteKit + Supabase

Full setup for any SvelteKit app with Supabase. Creates the feedback pipeline from widget to JAT task.

### Prerequisites

- SvelteKit app with Supabase auth
- `supabaseServiceRole` available on `locals` (server-side)
- JAT installed with ingest daemon configured

### Step 1: Add Widget to app.html

```html
<!-- src/app.html — before closing </body> tag -->
<script src="https://unpkg.com/jat-feedback@^1/dist/jat-feedback.js"></script>
<jat-feedback project="YOUR_PROJECT"></jat-feedback>
<script>
  (function() {
    var el = document.querySelector('jat-feedback');
    if (el) el.setAttribute('endpoint', location.origin);
  })();
</script>
```

### Step 2: Create API Endpoint

Create `src/routes/api/feedback/report/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const GET: RequestHandler = async () => {
  return json(
    { status: 'ok', service: 'feedback-report', timestamp: new Date().toISOString() },
    { headers: CORS_HEADERS }
  );
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return json({ ok: false, error: 'Title is required' }, { status: 400, headers: CORS_HEADERS });
    }

    const supabase = locals.supabaseServiceRole;

    // Upload screenshots to Storage
    const screenshotPaths: string[] = [];
    if (body.screenshots && Array.isArray(body.screenshots)) {
      for (let i = 0; i < body.screenshots.length; i++) {
        const dataUrl = body.screenshots[i];
        if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) continue;

        const [header, base64] = dataUrl.split(',');
        if (!base64) continue;

        const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const filePath = `reports/${filename}`;

        const binaryStr = atob(base64);
        const buffer = new Uint8Array(binaryStr.length);
        for (let j = 0; j < binaryStr.length; j++) {
          buffer[j] = binaryStr.charCodeAt(j);
        }

        const { error: uploadError } = await supabase.storage
          .from('feedback-screenshots')
          .upload(filePath, buffer, { contentType: mime, upsert: false });

        if (uploadError) {
          console.warn(`[feedback] Screenshot upload failed (${i}):`, uploadError.message);
        } else {
          screenshotPaths.push(filePath);
        }
      }
    }

    const reporter = body.metadata?.reporter || {};
    const org = body.metadata?.organization || {};

    const { data: row, error: insertError } = await supabase
      .from('feedback_reports')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || '',
        type: body.type || 'bug',
        priority: body.priority || 'medium',
        page_url: body.page_url || null,
        user_agent: body.user_agent || null,
        reporter_user_id: reporter.userId || null,
        reporter_email: reporter.email || null,
        reporter_name: reporter.name || null,
        reporter_role: reporter.role || null,
        organization_id: org.id || null,
        organization_name: org.name || null,
        console_logs: body.console_logs || null,
        selected_elements: body.selected_elements || null,
        screenshot_paths: screenshotPaths.length > 0 ? screenshotPaths : null,
        metadata: body.metadata || null
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[feedback] Insert failed:', insertError);
      return json({ ok: false, error: insertError.message }, { status: 500, headers: CORS_HEADERS });
    }

    return json(
      { ok: true, id: row.id, message: `Report saved (${row.id})` },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('[feedback] Error:', err);
    return json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to submit report' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
};
```

**Note:** If your app doesn't have organizations, remove the `organization_id` and `organization_name` fields from the insert and from the migration (Step 3).

### Step 3: Supabase Migration

Create a migration file (e.g., `supabase/migrations/YYYYMMDD000000_feedback_reports.sql`):

```sql
-- Feedback reports table for jat-feedback widget
-- Widget POSTs to /api/feedback/report → this table
-- JAT ingest daemon polls for jat_status = 'new'

CREATE TABLE IF NOT EXISTS feedback_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'bug' CHECK (type IN ('bug', 'enhancement', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  page_url TEXT,
  user_agent TEXT,

  -- Reporter identity
  reporter_user_id UUID REFERENCES auth.users(id),
  reporter_email TEXT,
  reporter_name TEXT,
  reporter_role TEXT,

  -- Organization context (remove if not applicable)
  organization_id UUID,
  organization_name TEXT,

  -- Structured data
  console_logs JSONB,
  selected_elements JSONB,
  screenshot_paths TEXT[],
  metadata JSONB,

  -- JAT ingest tracking
  jat_status TEXT DEFAULT 'new' CHECK (jat_status IN ('new', 'ingested', 'failed', 'rejected')),
  jat_task_id TEXT,

  -- User-facing status tracking
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'in_progress', 'completed', 'wontfix', 'closed')),
  dev_notes TEXT,
  user_response TEXT CHECK (user_response IN ('accepted', 'rejected')),
  user_response_at TIMESTAMPTZ,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_feedback_reports_jat_status ON feedback_reports(jat_status) WHERE jat_status = 'new';
CREATE INDEX idx_feedback_reports_jat_rejected ON feedback_reports(jat_status) WHERE jat_status = 'rejected';
CREATE INDEX idx_feedback_reports_reporter ON feedback_reports(reporter_user_id, created_at DESC);

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-screenshots', 'feedback-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert feedback"
  ON feedback_reports FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own feedback reports"
  ON feedback_reports FOR SELECT TO authenticated
  USING (reporter_user_id = auth.uid());

CREATE POLICY "Users can respond to own feedback"
  ON feedback_reports FOR UPDATE TO authenticated
  USING (reporter_user_id = auth.uid())
  WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Service role full access to feedback"
  ON feedback_reports FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Storage policies
CREATE POLICY "Authenticated users can upload feedback screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'feedback-screenshots');

CREATE POLICY "Service role can read feedback screenshots"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'feedback-screenshots');
```

Push the migration:

```bash
supabase db push
# or
supabase migration up
```

### Step 4: Wire User Context

In your authenticated layout, set widget attributes after login so reports include user identity.

**SvelteKit example** (in your auth layout's `onMount`):

```typescript
onMount(() => {
  const user = session?.user;
  if (user) {
    const el = document.querySelector('jat-feedback');
    if (el) {
      if (user.id) el.setAttribute('user-id', user.id);
      if (user.email) el.setAttribute('user-email', user.email);
      // Adjust based on where your app stores display name:
      if (user.user_metadata?.full_name) el.setAttribute('user-name', user.user_metadata.full_name);
      if (user.user_metadata?.role) el.setAttribute('user-role', user.user_metadata.role);
      // If your app has organizations:
      // if (user.organization_id) el.setAttribute('org-id', user.organization_id);
    }
  }
});
```

**Optional: Add a "Report Bug" button** anywhere in your UI:

```svelte
<button onclick={() => window.dispatchEvent(new CustomEvent('jat-feedback:open'))}>
  Report Bug
</button>
```

### Step 5: Configure JAT Ingest Daemon

This connects the Supabase table to JAT so new reports automatically become tasks.

**5a. Store Supabase credentials:**

If you've already configured Supabase project secrets in **IDE Settings → Project Secrets**, you can skip this step — the ingest daemon will auto-resolve `supabase_url` and `supabase_service_role_key` from project secrets.

Otherwise, store the service role key manually:

```bash
jat-secret --set YOUR_PROJECT-supabase-service-role "eyJhbGci..." \
  --desc "Supabase service role key for YOUR_PROJECT feedback ingest"
```

**5b. Add source to `~/.config/jat/integrations.json`:**

Add this entry to the `sources` array.

**Minimal config** (when project secrets are configured in IDE Settings):

```json
{
  "id": "YOUR_PROJECT-feedback",
  "type": "supabase",
  "enabled": true,
  "project": "YOUR_PROJECT",
  "pollInterval": 120,
  "taskDefaults": {
    "type": "bug",
    "priority": 2,
    "labels": ["widget", "feedback"]
  },
  "table": "feedback_reports",
  "statusColumn": "jat_status",
  "statusNew": "new",
  "statusDone": "ingested",
  "taskIdColumn": "jat_task_id",
  "titleColumn": "title",
  "descriptionTemplate": "**Reporter:** {reporter_name} ({reporter_email})\n**Page:** {page_url}\n**Browser:** {user_agent}\n\n{description}",
  "authorColumn": "reporter_email",
  "timestampColumn": "created_at",
  "attachmentColumn": "screenshot_paths",
  "storageBucket": "feedback-screenshots"
}
```

> **Note:** `projectUrl` and `secretName` are omitted above. The adapter resolves them automatically from IDE Settings → Project Secrets (`supabase_url` and `supabase_service_role_key`).

**Full config** (with explicit `projectUrl` and `secretName`):

```json
{
  "id": "YOUR_PROJECT-feedback",
  "type": "supabase",
  "enabled": true,
  "project": "YOUR_PROJECT",
  "pollInterval": 120,
  "taskDefaults": {
    "type": "bug",
    "priority": 2,
    "labels": ["widget", "feedback"]
  },
  "projectUrl": "https://YOUR_SUPABASE_PROJECT_ID.supabase.co",
  "secretName": "YOUR_PROJECT-supabase-service-role",
  "table": "feedback_reports",
  "statusColumn": "jat_status",
  "statusNew": "new",
  "statusDone": "ingested",
  "taskIdColumn": "jat_task_id",
  "titleColumn": "title",
  "descriptionTemplate": "**Reporter:** {reporter_name} ({reporter_email})\n**Page:** {page_url}\n**Browser:** {user_agent}\n\n{description}",
  "authorColumn": "reporter_email",
  "timestampColumn": "created_at",
  "attachmentColumn": "screenshot_paths",
  "storageBucket": "feedback-screenshots"
}
```

**Optional fields you can add:**

```json
{
  "automation": {
    "action": "delay",
    "command": "/jat:start",
    "delay": 5,
    "delayUnit": "minutes"
  },
  "callback": {
    "url": "https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/jat-webhook",
    "events": ["status_changed", "task_closed"],
    "statusMapping": {
      "open": "submitted",
      "in_progress": "in_progress",
      "closed": "completed"
    },
    "referenceTable": "feedback_reports",
    "referenceIdFrom": "item_id"
  },
  "actions": [
    {
      "id": "sync_status",
      "label": "Sync Status",
      "description": "Push current task status to Supabase",
      "type": "callback",
      "event": "status_changed",
      "icon": "refresh"
    },
    {
      "id": "open_record",
      "label": "View in Supabase",
      "description": "Open the original feedback report in Supabase dashboard",
      "type": "link",
      "urlTemplate": "{projectUrl}/project/default/editor/feedback_reports?filter=id%3Deq.{referenceId}",
      "icon": "external-link"
    }
  ]
}
```

- **automation**: Auto-spawn an agent when a report is ingested
- **callback**: Push JAT task status changes back to Supabase — requires deploying the `jat-webhook` edge function (see Step 6)
- **actions**: Adds "Sync Status" and "View in Supabase" buttons in the JAT IDE task panel

The ingest daemon picks up config changes automatically (no restart needed).

### Step 6: Deploy the JAT Webhook Edge Function (for callbacks)

The `jat-webhook` Supabase Edge Function receives status-change callbacks from JAT and updates your `feedback_reports` rows. It's included in this package at `supabase/functions/jat-webhook/index.ts` — copy it into your project and deploy it.

```bash
# Copy the function into your project
mkdir -p supabase/functions/jat-webhook
cp node_modules/jat-feedback/supabase/functions/jat-webhook/index.ts \
   supabase/functions/jat-webhook/index.ts

# Deploy to Supabase
supabase functions deploy jat-webhook
```

The function uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — both are injected automatically by Supabase, no extra configuration needed.

**Skip this step** if you don't need bidirectional status sync (i.e., you only want JAT to ingest reports, not push status back to Supabase).

### Step 6: Verify

```bash
# Check the API endpoint is working
curl http://localhost:5173/api/feedback/report
# → {"status":"ok","service":"feedback-report","timestamp":"..."}

# Check ingest daemon sees the source
jat ingest status
# → Should list your project's feedback source

# Submit a test report via the widget, then check:
# 1. Row appears in feedback_reports table
# 2. JAT task gets created after next poll cycle (pollInterval seconds)
```

---

## Pipeline Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  jat-feedback │────►│  Your App    │────►│   Supabase   │────►│  JAT Ingest  │
│  (widget)     │     │  /api/report │     │  feedback_   │     │  Daemon      │
│              │     │              │     │  reports     │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘     └──────┬───────┘
                                                 ▲                    │
                                                 │                    ▼
                                          ┌──────┴───────┐   ┌──────────────┐
                                          │  jat-webhook  │◄──│  JAT Task    │
                                          │  (edge fn)    │   │  status      │
                                          │  status sync  │   │  changes     │
                                          └──────────────┘   └──────────────┘
```

## Column Reference

The `feedback_reports` table columns used by the pipeline:

| Column | Type | Purpose |
|--------|------|---------|
| `jat_status` | TEXT | Ingest state: `new` → `ingested` (or `failed`, `rejected`) |
| `jat_task_id` | TEXT | JAT task ID written back after ingest (e.g., `myapp-abc`) |
| `status` | TEXT | User-facing status synced from JAT task lifecycle |
| `dev_notes` | TEXT | Developer notes pushed back via callback |
| `user_response` | TEXT | User accept/reject of completed fix |

## License

MIT
