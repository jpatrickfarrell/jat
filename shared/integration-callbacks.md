## Integration Callbacks: Bidirectional Status Sync

When JAT ingests items from an external source (Supabase, Slack, etc.), the **callback system** syncs task status changes back to the source. This closes the loop: external report comes in, JAT creates a task, agent works on it, and the original reporter sees the status update.

```
External Source ──ingest──► JAT Task ──callback──► External Source
  (new report)                (agent works)          (status updated)
                                                          │
                                                          ▼
                                                     User accepts/rejects
                                                          │
                                                          ▼
                                              JAT Inbound Webhook ──► Reopen/Log
```

### How It Works

1. **Ingest** — The ingest daemon polls the external source and creates JAT tasks
2. **Work** — An agent picks up the task and works on it
3. **Auto-fire on completion** — When `/jat:complete` runs, `jat-step callback` automatically fires a webhook with the agent's completion summary
4. **Manual sync** — Users can also click "Sync Status" in the IDE to push status on demand
5. **User response** — The end user sees the update (e.g. in a widget), and can Accept or Reject
6. **Reverse webhook** — Accept/Reject fires a reverse webhook back to JAT's inbound endpoint
7. **JAT response** — Accept logs silently; Reject reopens the task with the rejection reason

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  OUTBOUND (JAT → External)                                          │
│                                                                     │
│  /jat:complete                                                      │
│    └─► jat-step callback                                            │
│          └─► GET /api/tasks/integrations?taskIds={id}               │
│          └─► Read review signal (summary[])                         │
│          └─► POST /api/integrations/{sourceId}/callback             │
│                └─► Fire webhook to external system                  │
│                └─► Log to .jat/callback-log/{task-id}.jsonl         │
│                                                                     │
│  Manual: User clicks "Sync Status" in IDE                           │
│    └─► POST /api/integrations/{sourceId}/callback                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  INBOUND (External → JAT)                                           │
│                                                                     │
│  User clicks Accept/Reject in widget                                │
│    └─► PATCH /api/feedback/reports/{id}/respond                     │
│          └─► Update local record                                    │
│          └─► POST {JAT_CALLBACK_URL} (reverse webhook)              │
│                └─► POST /api/integrations/inbound                   │
│                      └─► Validate Bearer token                      │
│                      └─► "accepted" → Log to callback log only      │
│                      └─► "rejected" → Log + reopen task (open)      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Auto-Fire on Completion

When an agent runs `/jat:complete`, the `jat-step callback` step automatically fires:

1. Queries `GET /api/tasks/integrations?taskIds={taskId}` to find integration config
2. If no integration or no callback → skips silently
3. Reads the review signal file for the `summary[]` array
4. Formats summary as markdown notes
5. Fires `POST /api/integrations/{sourceId}/callback` with `event: "task_closed"`, mapped status, and notes
6. Logs result to `.jat/callback-log/{task-id}.jsonl`
7. Does NOT fail the completion if callback fails

The auto-fire step sits at 55% progress, between closing (50%) and releasing (75%).

### User Accept/Reject Flow

After an agent completes a task and the external record is updated (e.g. status → "completed", dev_notes → summary), the end user sees the result in their widget/app.

**Accept:**
- User clicks Accept in widget
- Widget calls respond endpoint with `{ response: "accepted" }`
- Respond endpoint fires reverse webhook to JAT inbound endpoint
- JAT logs `user_responded: accepted` to callback log
- No task modification — task stays closed

**Reject:**
- User clicks Reject in widget, enters reason (min 10 characters)
- Widget calls respond endpoint with `{ response: "rejected", reason: "..." }`
- Respond endpoint sets status back to "submitted", fires reverse webhook
- JAT logs `user_responded: rejected` with reason to callback log
- JAT reopens task (`jt update {taskId} --status open`)
- Agent sees reopened task, rejection reason visible in integration section

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

You can also configure callbacks through the **IngestWizard** in the IDE — see the "Wizard Setup" section below.

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

#### Step 4: Configure Reverse Webhook (for Accept/Reject)

To enable user accept/reject flow, configure your external app to fire a reverse webhook back to JAT:

**On the external app side (e.g. Flush `.env`):**
```
PRIVATE_JAT_CALLBACK_URL=http://your-jat-ide:3333/api/integrations/inbound
PRIVATE_JAT_CALLBACK_SECRET=<your-inbound-webhook-secret>
```

**On the JAT side:**
```bash
# Store the inbound webhook secret
# This must match what the external app sends as Bearer token
jat-secret jat-inbound-webhook-secret
```

**Reverse webhook payload format:**
```json
{
  "source": "flush",
  "event": "user_responded",
  "data": {
    "response": "accepted",
    "task_id": "flush-abc",
    "reason": "The sidebar still overflows on mobile"
  }
}
```

#### Step 5: Deploy the Webhook Receiver

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

#### Step 6: Ensure Database Columns Exist

Your external table needs a column for each status value in `statusMapping`, plus columns for user response. For Supabase, create a migration:

```sql
-- User-facing status column (updated by jat-webhook)
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'in_progress', 'completed', 'wontfix', 'closed'));

-- Developer notes (passed through from JAT on completion)
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS dev_notes TEXT;

-- User response columns (for accept/reject flow)
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS user_response TEXT
    CHECK (user_response IN ('accepted', 'rejected'));
ALTER TABLE feedback_reports
  ADD COLUMN IF NOT EXISTS user_response_at TIMESTAMPTZ;
```

Apply:
```bash
supabase db push
```

### Wizard Setup

The IngestWizard in the IDE provides a GUI for configuring callbacks and actions. When creating or editing an integration source:

1. **Callbacks step** — Toggle "Enable status callbacks", then configure:
   - Webhook URL (required)
   - Secret name (for auth)
   - Events (checkboxes: `status_changed`, `task_closed`)
   - Status mapping (JAT status → external status, visual key→value pairs)
   - Reference table and reference ID field

2. **Actions step** — Toggle "Add action buttons", then add actions:
   - Each action has: Label, Type (callback/link), Event or URL template, Icon, optional Confirm message
   - Click "+ Add Action" to add more, click × to remove

Both steps appear after Automation and before Filters/Review in the wizard flow.

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

### Inbound Webhook Format

The inbound endpoint (`POST /api/integrations/inbound`) accepts:

```json
{
  "source": "flush",
  "event": "user_responded",
  "data": {
    "response": "accepted",
    "task_id": "flush-abc",
    "reason": "The sidebar still overflows on mobile"
  }
}
```

| Field | Description |
|-------|-------------|
| `source` | Identifier of the external system |
| `event` | Event type (`user_responded`) |
| `data.response` | `"accepted"` or `"rejected"` |
| `data.task_id` | The JAT task ID |
| `data.reason` | Optional rejection reason (required for rejects in widget UI) |

Auth: `Authorization: Bearer <secret>` validated against `jat-inbound-webhook-secret` from credentials store.

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

**Test the inbound endpoint:**
```bash
SECRET=$(jat-secret jat-inbound-webhook-secret)
curl -X POST "http://127.0.0.1:3333/api/integrations/inbound" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{
    "source": "flush",
    "event": "user_responded",
    "data": { "response": "rejected", "task_id": "flush-abc", "reason": "Sidebar still overflows" }
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

Inbound webhooks (user accept/reject) are also logged:

```json
{
  "timestamp": "2026-02-18T21:00:00.000Z",
  "event": "user_responded",
  "source": "flush",
  "response": "rejected",
  "task_id": "flush-abc",
  "reason": "Sidebar still overflows",
  "task_reopened": true
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
| "Webhook secret not configured" (inbound) | Missing `jat-inbound-webhook-secret` | Add via `jat-secret` or Settings → Custom Keys |
| Inbound webhook 403 | Token mismatch | Ensure external app sends same secret as stored in `jat-inbound-webhook-secret` |
| Auto-fire doesn't trigger | No integration for task | Check `GET /api/tasks/integrations?taskIds={id}` returns a source with callback config |
| User reject doesn't reopen task | `jt update` failed | Check `jt` is on PATH and task exists |

### Files Reference

| File | Purpose |
|------|---------|
| `~/.config/jat/integrations.json` | Integration source configuration with callback/actions |
| `ide/src/routes/api/integrations/[sourceId]/callback/+server.ts` | Outbound callback endpoint (fires webhooks) |
| `ide/src/routes/api/integrations/inbound/+server.ts` | Inbound webhook endpoint (receives accept/reject) |
| `ide/src/routes/api/tasks/integrations/+server.js` | Task integration lookup API |
| `ide/src/routes/api/tasks/[id]/callbacks/+server.ts` | Callback log reader |
| `ide/src/lib/components/sessions/TaskDetailPaneB.svelte` | Integration UI (actions, status sync, callback log) |
| `ide/src/lib/components/ingest/IngestWizard.svelte` | Wizard UI for configuring callbacks and actions |
| `tools/scripts/jat-step` | Completion step tool (includes `callback` step) |
| `skills/jat-complete/SKILL.md` | Completion skill (step 4.7 fires callback) |
| `~/code/flush/widget/src/components/RequestList.svelte` | Widget with accept/reject buttons |
| `~/code/flush/widget/src/lib/api.ts` | Widget API (respondToReport with reason) |
| `~/code/flush/src/routes/api/feedback/reports/[id]/respond/+server.ts` | Flush respond endpoint (fires reverse webhook) |
| `.jat/callback-log/{task-id}.jsonl` | Per-task callback log |
