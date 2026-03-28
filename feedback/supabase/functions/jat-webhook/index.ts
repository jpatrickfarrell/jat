import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// JAT sends the project's JWT service role key as the Bearer token.
// On newer Supabase projects, SUPABASE_SERVICE_ROLE_KEY in the runtime
// may use the sb_secret_ format instead of the JWT format. JAT_WEBHOOK_SECRET
// is a custom secret set to the JWT service role key for those projects.
const webhookSecret = Deno.env.get("JAT_WEBHOOK_SECRET") || supabaseServiceKey

/**
 * JAT Webhook — generic status-sync endpoint.
 *
 * Receives callbacks from JAT when task status changes and updates
 * the originating row in Supabase. Copy this file into your project's
 * `supabase/functions/jat-webhook/` directory and deploy it.
 *
 * Deploy:
 *   supabase functions deploy jat-webhook --no-verify-jwt
 *
 * Setup (if auth fails with "Invalid authorization"):
 *   Your project's SUPABASE_SERVICE_ROLE_KEY runtime var may use the
 *   new sb_secret_ format. Set JAT_WEBHOOK_SECRET to the JWT service
 *   role key from your project's API settings:
 *
 *   supabase secrets set JAT_WEBHOOK_SECRET="eyJhbG..."
 *
 * Expected payload:
 * {
 *   source: "jat",
 *   event: "status_changed" | "task_closed",
 *   reference_table: "project_tasks",
 *   reference_id: "uuid-of-row",
 *   data: {
 *     status: "in_progress" | "completed" | ...,
 *     task_id: "myproject-abc",
 *     notes?: "optional developer note",
 *     issue_type?: "bug" | "feature" | "task" | "epic",
 *     assignee?: "agent or user name",
 *     labels?: ["label1", "label2"],
 *     due_date?: "2026-04-01T00:00:00Z",
 *     source?: "jat"
 *   }
 * }
 *
 * Auth: Bearer token must match JAT_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY.
 *
 * integrations.json callback config:
 * {
 *   "callback": {
 *     "url": "https://YOUR_PROJECT_REF.supabase.co/functions/v1/jat-webhook",
 *     "events": ["status_changed", "task_closed"],
 *     "statusMapping": {
 *       "open": "submitted",
 *       "in_progress": "in_progress",
 *       "closed": "completed"
 *     },
 *     "referenceTable": "project_tasks",
 *     "referenceIdFrom": "item_id"
 *   }
 * }
 */

interface WebhookPayload {
  source: string
  event: string
  reference_table: string
  reference_id: string
  data: {
    status?: string
    task_id?: string
    notes?: string
    issue_type?: string
    assignee?: string
    labels?: string[]
    due_date?: string
    source?: string
  }
}

// Tables and the columns that JAT is allowed to update.
// Add more tables here if you want JAT to sync status for other record types.
// "feedback_reports" kept as alias for backward compat with pre-v3 callers.
const TABLE_CONFIG: Record<string, { statusCol: string; taskIdCol: string }> = {
  project_tasks: { statusCol: "status", taskIdCol: "jat_task_id" },
  feedback_reports: { statusCol: "status", taskIdCol: "jat_task_id" },
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Verify auth — caller must pass service role key as Bearer token
  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  const token = authHeader.slice(7)
  if (token !== webhookSecret && token !== supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Invalid authorization" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { reference_table, reference_id, data, event } = payload

  if (!reference_table || !reference_id || !data) {
    return new Response(
      JSON.stringify({ error: "Missing reference_table, reference_id, or data" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  const config = TABLE_CONFIG[reference_table]
  if (!config) {
    return new Response(
      JSON.stringify({ error: `Table "${reference_table}" is not configured` }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    )
  }

  // Resolve actual table name — "feedback_reports" alias maps to "project_tasks"
  const actualTable = reference_table === "feedback_reports" ? "project_tasks" : reference_table

  // Build the update object from the payload fields
  const update: Record<string, unknown> = {}
  if (data.status) update[config.statusCol] = data.status
  if (data.task_id) update[config.taskIdCol] = data.task_id
  if (data.notes) update.dev_notes = data.notes
  if (data.issue_type) update.issue_type = data.issue_type
  if (data.assignee) update.assignee = data.assignee
  if (data.labels) update.labels = data.labels
  if (data.due_date) update.due_date = data.due_date
  if (data.source) update.source = data.source

  if (Object.keys(update).length === 0) {
    return new Response(
      JSON.stringify({ error: "No updatable fields in payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const result = await supabase
    .from(actualTable)
    .update(update)
    .eq("id", reference_id)
    .select("id")

  if (result.error) {
    console.error(`JAT webhook failed: ${result.error.message}`, {
      table: actualTable,
      reference_id,
      update,
    })
    return new Response(
      JSON.stringify({ error: `Update failed: ${result.error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  if (!result.data || result.data.length === 0) {
    console.warn(`JAT webhook: no rows matched ${actualTable}[${reference_id}]`, update)
    return new Response(
      JSON.stringify({
        error: `No rows matched: ${actualTable} id=${reference_id}`,
        table: actualTable,
        id: reference_id,
        rowsAffected: 0,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    )
  }

  console.log(`JAT webhook: ${event} → ${actualTable}[${reference_id}] (${result.data.length} row(s))`, update)

  return new Response(
    JSON.stringify({
      success: true,
      table: actualTable,
      id: reference_id,
      updated: update,
      rowsAffected: result.data.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
})
