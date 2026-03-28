import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({
  locals: { supabase, safeGetSession },
  url,
}) => {
  const { user } = await safeGetSession()
  if (!user) {
    redirect(303, "/login")
  }

  // Read filters from URL search params
  const status = url.searchParams.get("status") || ""
  const issueType = url.searchParams.get("type") || ""
  const priority = url.searchParams.get("priority") || ""

  // Build query — RLS ensures users only see their own tasks
  let query = supabase
    .from("project_tasks")
    .select("*, project_tasks_comments(count)")
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }
  if (issueType) {
    query = query.eq("issue_type", issueType)
  }
  if (priority) {
    query = query.eq("priority", priority)
  }

  const { data: tasks, error } = await query.limit(100)

  if (error) {
    console.error("Failed to load tasks:", error.message)
  }

  return {
    tasks: tasks ?? [],
    filters: { status, issueType, priority },
    user,
  }
}
