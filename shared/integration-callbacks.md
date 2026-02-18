## Integration Callbacks: Bidirectional Status Sync

When JAT ingests items from an external source (Supabase, Slack, etc.), the **callback system** syncs task status changes back to the source. This closes the loop: external report comes in, JAT creates a task, agent works on it, and the original reporter sees the status update.

```
External Source ──ingest──► JAT Task ──callback──► External Source
  (new report)                (agent works)          (status updated)
```

### How It Works

1. **Ingest** — The ingest daemon polls the external source and creates JAT tasks
2. **Work** — An agent picks up the task and works on it
3. **Callback** — When the user clicks "Sync Status" or "Mark Resolved" in the IDE, the callback endpoint fires a webhook to the source's callback URL
4. **Update** — The webhook receiver updates the original record's status

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  IDE (TaskDetailPaneB)                                              │
│  ┌─────────────────────────────┐                                    │
│  │ [Sync Status] [Mark Resolved]│ ← User clicks action button      │
│  └──────────┬──────────────────┘                                    │
│             │ POST /api/integrations/{sourceId}/callback             │
│             ▼                                                        │
│  ┌─────────────────────────────┐                                    │
│  │ Callback Endpoint            │                                    │
│  │ 1. Load integrations.json    │                                    │
│  │ 2. Validate event            │                                    │
│  │ 3. Resolve secret            │                                    │
│  │ 4. Map status                │                                    │
│  │ 5. Fire webhook              │                                    │
│  │ 6. Log result                │                                    │
│  └──────────┬──────────────────┘                                    │
│             │ POST (webhook payload)                                 │
│             ▼                                                        │
│  ┌─────────────────────────────┐                                    │
│  │ External Webhook Receiver    │ (e.g., Supabase Edge Function)    │
│  │ - Validates auth token       │                                    │
│  │ - Updates record status      │                                    │
│  └─────────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Setup Guide

#### Step 1: Configure the Integration Source

Add a `callback` section to your integration source in `~/.config/jat/integrations.json`:

```json
{
  "id": "my-feedback",
  "type": "supabase",
  "enabled": true,
  "project": "myapp",
  "secretName": "my-supabase-service-role",
  "projectUrl": "https://xxxxxxxxxxxx.supabase.co",
  "table": "feedback_reports",
  "statusColumn": "jat_status",
  "statusNew": "new",
  "statusDone": "ingested",
  "taskIdColumn": "jat_task_id",
  "titleColumn": "title",

  "callback": {
    "url": "https://xxxxxxxxxxxx.supabase.co/functions/v1/jat-webhook",
    "events": ["status_changed", "task_closed"],
    "statusMapping": {
      "open": "submitted",
      "in_progress": "in_progress",
      "closed": "completed"
    },
    "referenceTable": "feedback_reports",
    "referenceIdFrom": "item_id"
  }
}
```

**Callback fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Webhook endpoint URL |
| `events` | Yes | Array of events that trigger callbacks: `status_changed`, `task_closed` |
| `statusMapping` | Yes | Maps JAT task status → external status values |
| `referenceTable` | Yes | The table name to include in the webhook payload |
| `referenceIdFrom` | No | How to extract the external record ID (default: `item_id`) |
| `secretName` | No | Override secret for callbacks (falls back to source's `secretName`) |

**Status mapping:** Keys are JAT task statuses (`open`, `in_progress`, `blocked`, `closed`). Values are whatever your external system expects. Make sure the values match your database column constraints.

#### Step 2: Add Action Buttons

Add an `actions` array to your source config to define what buttons appear in the IDE:

```json
{
  "actions": [
    {
      "id": "sync_status",
      "label": "Sync Status",
      "description": "Push current task status to the external system",
      "type": "callback",
      "event": "status_changed",
      "icon": "refresh"
    },
    {
      "id": "mark_resolved",
      "label": "Mark Resolved",
      "description": "Mark this report as resolved",
      "type": "callback",
      "event": "task_closed",
      "confirmMessage": "This will mark the report as resolved. Continue?",
      "icon": "check"
    },
    {
      "id": "open_record",
      "label": "View in Dashboard",
      "description": "Open the original record in the external dashboard",
      "type": "link",
      "urlTemplate": "{projectUrl}/project/default/editor/{referenceTable}?filter=id%3Deq.{referenceId}",
      "icon": "external-link"
    }
  ]
}
```

**Action types:**

| Type | Description |
|------|-------------|
| `callback` | Fires a webhook via the callback endpoint. Requires `event` field. |
| `link` | Opens a URL. Supports template variables: `{projectUrl}`, `{referenceId}`, `{referenceTable}`. |

**Available icons:** `refresh`, `check`, `external-link`, `send`, `eye`, `trash`

**Optional fields:**
- `confirmMessage` — Shows a confirmation dialog before firing the callback

#### Step 3: Store the Secret

The callback endpoint authenticates with the external service using a secret from the JAT credentials store. Add it via Settings → API Keys → Custom Keys, or:

```bash
# The secret name must match secretName in integrations.json
# For Supabase, use the service role key
jat-secret my-supabase-service-role
# Should output the key value
```

The secret is sent as `Authorization: Bearer <secret>` in the webhook request.

#### Step 4: Deploy the Webhook Receiver

The webhook receiver is an endpoint at your `callback.url` that accepts POST requests and updates the external record. You need to deploy one for your platform.

##### Supabase Edge Function

Create `supabase/functions/jat-webhook/index.ts`:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// Tables and columns the webhook can update
const TABLE_CONFIG: Record<string, { statusCol: string; taskIdCol: string }> = {
  feedback_reports: { statusCol: "status", taskIdCol: "jat_task_id" },
  // Add more tables here as needed
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    })
  }

  // Verify Bearer token matches service role key
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (token !== supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403, headers: { "Content-Type": "application/json" },
    })
  }

  const { reference_table, reference_id, data, event } = await req.json()
  const config = TABLE_CONFIG[reference_table]
  if (!config) {
    return new Response(JSON.stringify({ error: `Table not configured: ${reference_table}` }), {
      status: 403, headers: { "Content-Type": "application/json" },
    })
  }

  // Build update payload
  const update: Record<string, unknown> = {}
  if (data.status) update[config.statusCol] = data.status
  if (data.task_id) update[config.taskIdCol] = data.task_id
  if (data.notes) update.dev_notes = data.notes

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { error } = await supabase.from(reference_table).update(update).eq("id", reference_id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ success: true, updated: update }), {
    status: 200, headers: { "Content-Type": "application/json" },
  })
})
```

Deploy:
```bash
cd ~/code/myapp
supabase functions deploy jat-webhook --no-verify-jwt --use-api
```

> **Tip:** Use `--use-api` to bundle server-side if Docker networking has issues.

##### Other Platforms

For non-Supabase integrations, create any HTTP endpoint that:
1. Accepts POST with `Authorization: Bearer <token>` header
2. Reads the JSON payload (see format below)
3. Updates the referenced record
4. Returns `2xx` on success

#### Step 5: Ensure Database Columns Exist

Your external table needs a column for each status value in `statusMapping`. For Supabase, create a migration:

```sql
-- User-facing status column (updated by jat-webhook)
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'in_progress', 'completed', 'wontfix', 'closed'));

-- Developer notes (optional, passed through from JAT)
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS dev_notes TEXT;
```

Apply:
```bash
supabase db push
```

### Webhook Payload Format

The callback endpoint sends this payload to `callback.url`:

```json
{
  "source": "jat",
  "event": "status_changed",
  "reference_table": "feedback_reports",
  "reference_id": "f402c915-7412-4e5e-a2eb-f94b7c68be54",
  "data": {
    "status": "in_progress",
    "task_id": "flush-abc",
    "notes": "Optional note from the agent"
  }
}
```

| Field | Description |
|-------|-------------|
| `source` | Always `"jat"` |
| `event` | The event name from the action config |
| `reference_table` | From `callback.referenceTable` |
| `reference_id` | The external record's ID (extracted from the ingest item_id) |
| `data.status` | The mapped status (after applying `statusMapping`) |
| `data.task_id` | The JAT task ID |
| `data.notes` | Optional notes passed from the UI |

### Testing

**Test the callback endpoint directly:**
```bash
curl -X POST "http://127.0.0.1:3333/api/integrations/my-feedback/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "myapp-abc",
    "event": "status_changed",
    "referenceId": "uuid-of-record",
    "taskStatus": "in_progress"
  }'
```

**Test the webhook receiver directly:**
```bash
SECRET=$(jat-secret my-supabase-service-role)
curl -X POST "https://xxxxxxxxxxxx.supabase.co/functions/v1/jat-webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{
    "source": "jat",
    "event": "status_changed",
    "reference_table": "feedback_reports",
    "reference_id": "uuid-of-record",
    "data": { "status": "in_progress", "task_id": "myapp-abc" }
  }'
```

### Callback Logs

Every callback attempt is logged to `.jat/callback-log/{task-id}.jsonl` in the task's project directory. Each line is a JSON object:

```json
{
  "timestamp": "2026-02-18T20:47:00.000Z",
  "event": "status_changed",
  "url": "https://xxxxxxxxxxxx.supabase.co/functions/v1/jat-webhook",
  "status": 200,
  "response": { "success": true, "updated": { "status": "in_progress" } },
  "duration_ms": 355
}
```

Failed callbacks include an `error` field. The callback log is displayed in the IDE's integration section.

### Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "No secret configured" | Missing `secretName` on source or callback | Add `secretName` to source config |
| "Failed to resolve secret" | Secret not in credentials store | Add via Settings → API Keys → Custom Keys |
| HTTP 404 from webhook | Edge function not deployed | Deploy with `supabase functions deploy` |
| HTTP 403 from webhook | Token doesn't match service role key | Check the secret value matches `SUPABASE_SERVICE_ROLE_KEY` |
| "Column not found" | Missing database column | Run migration to add the status column |
| Status values rejected | Column CHECK constraint mismatch | Ensure `statusMapping` values match the column's CHECK constraint |
| Integration icons missing | Task IDs not sent to API | Check `fetchTaskIntegrations()` runs after tasks load |

### Files Reference

| File | Purpose |
|------|---------|
| `~/.config/jat/integrations.json` | Integration source configuration with callback/actions |
| `ide/src/routes/api/integrations/[sourceId]/callback/+server.ts` | Callback endpoint (fires webhooks) |
| `ide/src/routes/api/tasks/integrations/+server.js` | Task integration lookup API |
| `ide/src/lib/components/sessions/TaskDetailPaneB.svelte` | Integration UI (actions, status sync, callback log) |
| `.jat/callback-log/{task-id}.jsonl` | Per-task callback log |
