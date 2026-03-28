# jat-feedback

Embeddable feedback widget for bug reports and feature requests. Ships as a web component (`<jat-feedback>`) that captures screenshots, console logs, and user context.

Reports are stored in your Supabase database. The JAT ingest daemon polls for new rows and creates tasks automatically.

```
User clicks "Report Bug" → Widget captures context → POST /api/feedback/report
  → Supabase project_tasks table → JAT ingest daemon → JAT task created
```

## Install

```bash
npm install jat-feedback
```

The package includes the widget bundle, Supabase migration, and edge function — all three are needed for the full pipeline.

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
| `agent-proxy` | No | `''` | URL path for the LLM proxy endpoint (e.g., `'/api/feedback/agent'`). Enables the Agent tab. |
| `agent-model` | No | `'claude-sonnet-4-6'` | LLM model identifier passed to the proxy endpoint |
| `agent-context` | No | `''` | Static app context injected into Agent system prompt (describe your app, key pages, nav) |

## Agent Tab: LLM Proxy Endpoint

The Agent tab lets users control the host page with natural language commands (powered by [page-agent](https://github.com/alibaba/page-agent)). To use it, set `agent-proxy` to a URL on your server that forwards LLM API calls. **API keys stay server-side — the widget never sees them.**

### How It Works

```
Widget (browser)                    Your Server                     LLM Provider
─────────────────                   ────────────                    ────────────
User types command
  → page-agent builds prompt
  → POST /api/feedback/agent ────→ Receives request
                                    Adds API key from env
                                    POST api.anthropic.com ──────→ Processes request
                                    ← Response ◄──────────────────── Returns completion
  ← JSON response ◄──────────────
  → Agent executes action on page
```

### Proxy Endpoint Spec

Your server implements a single endpoint:

- **Method:** `POST`
- **Path:** Whatever you set in `agent-proxy` (e.g., `/api/feedback/agent`)
- **Request body:** OpenAI-compatible chat completion request

```json
{
  "model": "claude-sonnet-4-6",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "Click the login button" }
  ],
  "tools": [...]
}
```

- **Response:** OpenAI-compatible chat completion response
- **Auth:** Your endpoint adds the API key server-side — the widget sends no auth headers

### SvelteKit Example

Create `src/routes/api/feedback/agent/[...path]/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANTHROPIC_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request, params }) => {
  const path = params.path || 'chat/completions';
  const body = await request.json();

  const response = await fetch(`https://api.anthropic.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw error(response.status, `LLM API error: ${detail.slice(0, 200)}`);
  }

  const data = await response.json();
  return json(data);
};
```

**Environment variable** (`.env`):
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Widget Usage

```html
<jat-feedback
  endpoint="http://localhost:5173"
  project="my-app"
  agent-proxy="/api/feedback/agent"
  agent-model="claude-sonnet-4-6"
></jat-feedback>
```

The Agent tab appears automatically when `agent-proxy` is set. Without it, only the feedback form and history tabs are shown.

### Page-Level Tool Registration

Register custom tools that the agent can call during its execution loop. Tools run client-side with full access to your app's state, auth context, and data — the LLM decides when to call them and reasons over the results.

#### `registerTools()` API Reference

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

const widget = document.querySelector('jat-feedback');
widget.registerTools(tools: ToolDefinition[]): void
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique tool name (snake_case). The LLM uses this to call the tool. |
| `description` | `string` | Tells the LLM what the tool does and when to use it. |
| `parameters` | `object` | JSON Schema describing the tool's arguments. Use `{ type: 'object', properties: {} }` for no-arg tools. |
| `handler` | `async (args) => any` | Runs client-side when the LLM calls the tool. Receives parsed args, returns any JSON-serializable value. |

**Behavior:**
- Multiple `registerTools()` calls **accumulate** — tools are added, not replaced
- Register tools before the user opens the Agent tab (typically in `onMount`)
- If a handler throws, the error message is returned to the LLM so it can recover gracefully
- Handlers have full access to the page's DOM, stores, and JS context

#### Example: Global Tools in SvelteKit

Register tools in your root `+layout.svelte` so they're available on every page. For page-specific tools, call `registerTools()` again in that page's layout or component — tools accumulate across calls.

```svelte
<script lang="ts">
  import { page } from "$app/stores"
  import { onMount } from "svelte"

  onMount(() => {
    const widget = document.querySelector("jat-feedback")
    if (!widget?.registerTools) return

    widget.registerTools([
      {
        name: "get_current_user",
        description: "Get the currently authenticated user profile",
        parameters: { type: "object", properties: {} },
        handler: async () => {
          const session = $page.data.session
          if (!session?.user) return { authenticated: false }
          const u = session.user
          return {
            authenticated: true,
            id: u.id,
            email: u.email,
            name: u.user_metadata?.full_name ?? null,
          }
        },
      },
      {
        name: "get_current_route",
        description: "Get the current page URL, pathname, and route parameters",
        parameters: { type: "object", properties: {} },
        handler: async () => ({
          pathname: $page.url.pathname,
          params: $page.params,
          search: Object.fromEntries($page.url.searchParams),
        }),
      },
      {
        name: "get_page_data",
        description: "Get data exposed by the current page's load function",
        parameters: { type: "object", properties: {} },
        handler: async () => {
          const { supabase, session, ...rest } = $page.data
          return rest
        },
      },
    ])
  })
</script>
```

#### Example: Page-Specific Tools

Add tools that only make sense on a specific page:

```svelte
<!-- src/routes/admin/reports/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte"

  onMount(() => {
    const widget = document.querySelector("jat-feedback")
    if (!widget?.registerTools) return

    widget.registerTools([
      {
        name: "update_report_status",
        description: "Update a feedback report status",
        parameters: {
          type: "object",
          properties: {
            report_id: { type: "string" },
            status: { type: "string", enum: ["open", "in_progress", "resolved"] },
          },
          required: ["report_id", "status"],
        },
        handler: async (args) => {
          const { error } = await supabase
            .from("project_tasks")
            .update({ status: args.status })
            .eq("id", args.report_id)
          if (error) throw new Error(error.message)
          return { success: true }
        },
      },
    ])
  })
</script>
```

#### How Tools Work

Tools are integrated into the page-agent's action loop:
- The LLM sees registered tools alongside built-in browser actions (click, type, scroll, etc.)
- Each agent step picks one action — either a browser action or a registered tool
- Tool results feed back to the LLM on the next step automatically
- If a handler throws, the error message is returned to the LLM so it can recover gracefully

### Error Handling

The widget handles proxy errors gracefully:

| HTTP Status | User Message |
|-------------|-------------|
| 401 / 403 | "Check that the server has a valid API key configured" |
| 429 | "Too many requests — wait a moment and try again" |
| 500+ | Server error with detail from response body |
| Timeout (60s) | "The server may be overloaded — try again" |
| Network error | "Check that your server is running" |

## Agent Notes: CRUD Endpoints

Agent notes store user-written markdown context that gets injected into the page-agent's system prompt. Notes have two scopes: **site-wide** (`route` is `null`) and **per-route** (keyed by URL pathname). Requires the `1.8.0_add_agent_notes.sql` migration.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/feedback/notes?project=X` | List all notes for a project |
| `GET` | `/api/feedback/notes?project=X&route=/path` | Get note for a specific route |
| `PUT` | `/api/feedback/notes` | Create or update a note (upsert by project+route) |
| `DELETE` | `/api/feedback/notes/:id` | Delete a note |

### SvelteKit Example

Create `src/routes/api/feedback/notes/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// GET /api/feedback/notes?project=X[&route=/path]
export const GET: RequestHandler = async ({ url, locals }) => {
  const project = url.searchParams.get('project');
  if (!project) {
    return json({ error: 'project parameter is required' }, { status: 400, headers: CORS_HEADERS });
  }

  const supabase = locals.supabaseServiceRole;
  let query = supabase.from('agent_notes').select('*').eq('project', project);

  const route = url.searchParams.get('route');
  if (route !== null) {
    query = query.eq('route', route);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    return json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }

  return json({ notes: data }, { headers: CORS_HEADERS });
};

// PUT /api/feedback/notes — upsert by project + route
export const PUT: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();

  if (!body.project || typeof body.project !== 'string') {
    return json({ error: 'project is required' }, { status: 400, headers: CORS_HEADERS });
  }

  const supabase = locals.supabaseServiceRole;
  const route = body.route ?? null;

  // Check if note already exists for this project+route
  let query = supabase.from('agent_notes').select('id').eq('project', body.project);
  if (route === null) {
    query = query.is('route', null);
  } else {
    query = query.eq('route', route);
  }
  const { data: existing } = await query.maybeSingle();

  let data, error;
  if (existing) {
    // Update existing note
    ({ data, error } = await supabase
      .from('agent_notes')
      .update({ title: body.title ?? '', content: body.content ?? '' })
      .eq('id', existing.id)
      .select()
      .single());
  } else {
    // Insert new note
    ({ data, error } = await supabase
      .from('agent_notes')
      .insert({ project: body.project, route, title: body.title ?? '', content: body.content ?? '' })
      .select()
      .single());
  }

  if (error) {
    return json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }

  return json({ ok: true, note: data }, { status: existing ? 200 : 201, headers: CORS_HEADERS });
};
```

Create `src/routes/api/feedback/notes/[id]/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// DELETE /api/feedback/notes/:id
export const DELETE: RequestHandler = async ({ params, locals }) => {
  const supabase = locals.supabaseServiceRole;

  const { error } = await supabase
    .from('agent_notes')
    .delete()
    .eq('id', params.id);

  if (error) {
    return json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }

  return json({ ok: true }, { headers: CORS_HEADERS });
};
```

### Upsert Behavior

The `PUT` endpoint checks for an existing note matching `project` + `route`, then inserts or updates accordingly. The database has a unique index on `(project, COALESCE(route, ''))` as a safety net.

- If no note exists for the given `project` + `route` → creates a new note (returns `201`)
- If a note already exists for that combination → updates `title`, `content`, and `updated_at` (returns `200`)
- Site-wide notes use `route: null` (only one per project)
- Per-route notes use the URL pathname (e.g., `route: "/invoices"`)

### CORS

All endpoints include permissive CORS headers (`Access-Control-Allow-Origin: *`) so the widget can call them cross-origin. For production, restrict the origin to your widget's domain:

```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-app.com',
  // ...
};
```

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

The widget is a web component bundled at `dist/jat-feedback.js`. Use `vite-plugin-static-copy` to copy it into your build output, then load it from your own server.

**vite.config.ts:**
```typescript
import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default {
  plugins: [
    sveltekit(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/jat-feedback/dist/jat-feedback.js',
          dest: '.'
        }
      ]
    })
  ]
};
```

**src/app.html:**
```html
<!-- before closing </body> tag -->
<script src="/jat-feedback.js"></script>
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

    const { data: row, error: insertError } = await supabase
      .from('project_tasks')
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

### Step 3: Run the Supabase Migration

The `project_tasks` table schema is included in this package. Copy it into your migrations folder and push:

```bash
# Copy ALL migrations (rename to match your timestamp convention)
for f in node_modules/jat-feedback/supabase/migrations/*.sql; do
  base=$(basename "$f" .sql)
  cp "$f" "supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_${base}.sql"
  sleep 1  # ensure unique timestamps
done

# Push to Supabase
supabase db push
```

**When upgrading jat-feedback:** check `node_modules/jat-feedback/supabase/migrations/` for new versioned files and copy+apply any you haven't run yet. The `3.0.0_rename_to_project_tasks.sql` migration renames `feedback_reports` to `project_tasks`.

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
  "table": "project_tasks",
  "statusColumn": "status",
  "statusNew": "submitted",
  "taskIdColumn": "jat_task_id",
  "titleColumn": "title",
  "descriptionTemplate": "**Reporter:** {reporter_name} ({reporter_email}) — {reporter_role}\n**Page:** {page_url}\n**Browser:** {user_agent}\n\n{description}",
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
  "table": "project_tasks",
  "statusColumn": "status",
  "statusNew": "submitted",
  "taskIdColumn": "jat_task_id",
  "titleColumn": "title",
  "descriptionTemplate": "**Reporter:** {reporter_name} ({reporter_email}) — {reporter_role}\n**Page:** {page_url}\n**Browser:** {user_agent}\n\n{description}",
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
    "referenceTable": "project_tasks",
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
      "urlTemplate": "{projectUrl}/project/default/editor/project_tasks?filter=id%3Deq.{referenceId}",
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

The `jat-webhook` Supabase Edge Function receives status-change callbacks from JAT and updates your `project_tasks` rows. It's included in this package — copy it into your project and deploy it.

```bash
# Copy the function into your project
mkdir -p supabase/functions/jat-webhook
cp node_modules/jat-feedback/supabase/functions/jat-webhook/index.ts \
   supabase/functions/jat-webhook/index.ts

# Deploy to Supabase (--no-verify-jwt required for service role key auth)
supabase functions deploy jat-webhook --no-verify-jwt
```

The function uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — both are injected automatically by Supabase.

**If callbacks fail with "Invalid authorization":** Newer Supabase projects use an `sb_secret_` format for the runtime `SUPABASE_SERVICE_ROLE_KEY`, which doesn't match the JWT service role key that JAT sends. Set a custom secret:

```bash
supabase secrets set JAT_WEBHOOK_SECRET="eyJhbG..."  # paste your JWT service role key from API settings
```

The function checks `JAT_WEBHOOK_SECRET` first, falling back to `SUPABASE_SERVICE_ROLE_KEY`.

**Skip this step** if you don't need bidirectional status sync (i.e., you only want JAT to ingest reports, not push status back to Supabase).

### Step 7: Verify

```bash
# Check the API endpoint is working
curl http://localhost:5173/api/feedback/report
# → {"status":"ok","service":"feedback-report","timestamp":"..."}

# Check ingest daemon sees the source
jat ingest status
# → Should list your project's feedback source

# Submit a test report via the widget, then check:
# 1. Row appears in project_tasks table
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

The `project_tasks` table columns used by the pipeline:

| Column | Type | Since | Purpose |
|--------|------|-------|---------|
| `status` | TEXT | 1.0.0 | Lifecycle: `submitted` → `in_progress` → `completed` → `accepted` \| `rejected` |
| `jat_task_id` | TEXT | 1.0.0 | JAT task ID written back after ingest (e.g., `myapp-abc`) |
| `rejection_reason` | TEXT | 1.0.0 | User-provided reason when rejecting a completed report |
| `dev_notes` | TEXT | 1.0.0 | Developer notes pushed back via callback |
| `source_type` | TEXT | 3.0.0 | Original `type` column renamed — `bug`, `enhancement`, `other` |
| `source` | TEXT | 3.0.0 | Where the item came from: `feedback`, `jat`, `manual` |
| `issue_type` | TEXT | 3.0.0 | Classification: `bug`, `feature`, `task`, `epic` |
| `assignee` | TEXT | 3.0.0 | Assigned agent or person |
| `due_date` | TIMESTAMPTZ | 3.0.0 | Due date for the task |
| `labels` | TEXT[] | 3.0.0 | Flexible categorization labels |
| `parent_id` | UUID | 3.0.0 | Self-referential parent for hierarchical tasks |
| `updated_at` | TIMESTAMPTZ | 3.0.0 | Auto-updated timestamp |

## Upgrading

npm never auto-updates — you need to explicitly upgrade and then handle each type of change manually.

```bash
# 1. Update the package
npm install jat-feedback@latest
```

Then handle whatever changed in the release notes:

**Widget JS changes** (UI, behavior, new attributes):
```bash
# Nothing extra — the updated bundle is copied to your build output automatically
# Just redeploy your app
```

**Schema changes** (new columns, indexes):
```bash
# Check for new migration files
ls node_modules/jat-feedback/supabase/migrations/

# Copy any new ones into your project and run them
cp node_modules/jat-feedback/supabase/migrations/1.1.0_*.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_1_1_0.sql

supabase db push
```

**Edge function changes** (webhook behavior):
```bash
# Re-copy and redeploy
cp node_modules/jat-feedback/supabase/functions/jat-webhook/index.ts \
   supabase/functions/jat-webhook/index.ts

supabase functions deploy jat-webhook --no-verify-jwt
```

## Versioning

This package follows semver. The `^` range in consuming projects (`"jat-feedback": "^1.1.0"`) means:

- **Patch and minor** (1.1.x, 1.2.0) — auto-accepted by `npm install`
- **Major** (2.0.0) — requires manual version bump in `package.json`

### What triggers a major version

| Change | Version |
|--------|---------|
| New nullable column (additive) | patch/minor |
| New widget attribute (optional) | minor |
| Removing or renaming a column | **major** |
| Changing a column's type | **major** |
| Renaming `status` values (e.g. `submitted` → `new`) | **major** |
| Required integrations.json config field added/renamed | **major** |

### Rule for additive schema changes

Any column added in a `1.x` release **must** be nullable with no required default. This ensures consuming projects don't break even if they haven't run the migration yet — the insert just omits the column and it lands as `NULL`.

If a new column is required (non-nullable, no default), that's a breaking change and belongs in a major version.

## License

MIT
