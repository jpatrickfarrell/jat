/**
 * Widget comments API — consumer route template.
 * Copy to: src/routes/api/tasks/[id]/comments/+server.ts
 *
 * Requires jat-feedback v3.5.0 migration (external column on project_tasks_comments).
 *
 * GET  ?external=true  → external comments for a task (for widget thread view)
 * POST               → reporter posts a reply comment (always external=true)
 */
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, locals, url }) => {
  const { id } = params
  const externalOnly = url.searchParams.get('external') === 'true'

  // Verify task exists
  const { data: task, error: taskErr } = await locals.supabaseServiceRole
    .from('project_tasks')
    .select('id')
    .eq('id', id)
    .single()

  if (taskErr || !task) {
    return json({ error: 'Task not found' }, { status: 404 })
  }

  let query = locals.supabaseServiceRole
    .from('project_tasks_comments')
    .select('id, text, author, author_type, comment_type, external, created_at, metadata')
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  if (externalOnly) {
    query = (query as any).eq('external', true)
  }

  const { data, error } = await query

  if (error) {
    return json({ error: error.message }, { status: 500 })
  }

  const comments = (data || []).map((c: any) => ({
    ...c,
    metadata: c.metadata ? safeParse(c.metadata) : null,
    external: c.external !== false,
  }))

  return json({ comments })
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { text, author, author_email, author_type, comment_type, metadata } = body

  if (!text || typeof text !== 'string' || !text.trim()) {
    return json({ error: 'text is required' }, { status: 400 })
  }
  if (!author || typeof author !== 'string') {
    return json({ error: 'author is required' }, { status: 400 })
  }

  // Verify task exists
  const { data: task, error: taskErr } = await locals.supabaseServiceRole
    .from('project_tasks')
    .select('id')
    .eq('id', id)
    .single()

  if (taskErr || !task) {
    return json({ error: 'Task not found' }, { status: 404 })
  }

  const { data: comment, error } = await locals.supabaseServiceRole
    .from('project_tasks_comments')
    .insert({
      task_id: id,
      text: (text as string).trim(),
      author,
      author_type: author_type ?? 'user',
      comment_type: comment_type ?? 'note',
      external: true,
      metadata: metadata != null ? JSON.stringify(metadata) : null,
    })
    .select('id, text, author, author_type, comment_type, external, created_at, metadata')
    .single()

  if (error) {
    return json({ error: error.message }, { status: 500 })
  }

  return json({ comment: { ...comment, external: true } }, { status: 201 })
}

function safeParse(s: unknown) {
  if (typeof s !== 'string') return s
  try { return JSON.parse(s) } catch { return s }
}
