import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

/**
 * JAT Webhook — generic status-sync endpoint.
 *
 * Receives callbacks from JAT when task status changes and updates
 * the originating row in Supabase. Copy this file into your project's
 * `supabase/functions/jat-webhook/` directory and deploy it.
 *
 * Deploy:
 *   supabase functions deploy jat-webhook
 *
 * Expected payload from JAT ingest daemon:
 * {
 *   source: "jat",
 *   event: "status_changed" | "task_closed",
 *   reference_table: "feedback_reports",
 *   reference_id: "uuid-of-row",
 *   data: {
 *     status: "in_progress" | "completed" | ...,
 *     task_id: "myproject-abc",
 *     notes?: "optional developer note"
 *   }
 * }
 *
 * Auth: Bearer token must match the Supabase service role key.
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
 * by Supabase when the function runs — no configuration needed.
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
 *     "referenceTable": "feedback_reports",
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
  }
}

// Tables and the columns that JAT is allowed to update.
// Add more tables here if you want JAT to sync status for other record types.
const TABLE_CONFIG: Record<string, { statusCol: string; taskIdCol: string }> = {
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
  if (token !== supabaseServiceKey) {
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

  // Build the update object from the payload fields
  const update: Record<string, unknown> = {}
  if (data.status) update[config.statusCol] = data.status
  if (data.task_id) update[config.taskIdCol] = data.task_id
  if (data.notes) update.dev_notes = data.notes

  if (Object.keys(update).length === 0) {
    return new Response(
      JSON.stringify({ error: "No updatable fields in payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase
    .from(reference_table)
    .update(update)
    .eq("id", reference_id)
    .select("id")

  if (error) {
    console.error(`JAT webhook failed: ${error.message}`, {
      reference_table,
      reference_id,
      update,
    })
    return new Response(
      JSON.stringify({ error: `Update failed: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  if (!data || data.length === 0) {
    console.warn(`JAT webhook: no rows matched ${reference_table}[${reference_id}]`, update)
    return new Response(
      JSON.stringify({
        error: `No rows matched: ${reference_table} id=${reference_id}`,
        table: reference_table,
        id: reference_id,
        rowsAffected: 0,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    )
  }

  console.log(`JAT webhook: ${event} → ${reference_table}[${reference_id}] (${data.length} row(s))`, update)

  return new Response(
    JSON.stringify({
      success: true,
      table: reference_table,
      id: reference_id,
      updated: update,
      rowsAffected: data.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
})
