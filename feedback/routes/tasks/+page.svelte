<script lang="ts">
  import { goto, invalidate } from "$app/navigation"
  import { page } from "$app/state"
  import { onMount } from "svelte"

  let { data } = $props()

  // ── Reactive task list (server data + realtime inserts) ──
  let tasks = $state(data.tasks)

  // Sync when server data changes (e.g. filter navigation)
  $effect(() => {
    tasks = data.tasks
  })

  // Realtime subscription — new/updated rows refresh the list
  onMount(() => {
    const channel = data.supabase
      .channel("project_tasks_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_tasks" },
        async () => {
          // Re-fetch with current filters applied
          let query = data.supabase
            .from("project_tasks")
            .select("*, project_tasks_comments(count)")
            .order("created_at", { ascending: false })
            .limit(100)

          const status = page.url.searchParams.get("status")
          const issueType = page.url.searchParams.get("type")
          const priority = page.url.searchParams.get("priority")
          if (status) query = query.eq("status", status)
          if (issueType) query = query.eq("issue_type", issueType)
          if (priority) query = query.eq("priority", priority)

          const { data: fresh } = await query
          if (fresh) tasks = fresh
        },
      )
      .subscribe()

    return () => {
      data.supabase.removeChannel(channel)
    }
  })

  // ── Task detail drawer state ──
  let selectedTask: (typeof data.tasks)[0] | null = $state(null)
  let comments: { id: string; author: string; author_role: string; text: string; created_at: string }[] = $state([])
  let loadingComments = $state(false)
  let commentText = $state("")
  let submittingComment = $state(false)

  // ── Filter helpers ──
  const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "wontfix", label: "Won't Fix" },
    { value: "closed", label: "Closed" },
  ]

  const typeOptions = [
    { value: "", label: "All types" },
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "task", label: "Task" },
    { value: "epic", label: "Epic" },
  ]

  const priorityOptions = [
    { value: "", label: "All priorities" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ]

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(page.url.searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    goto(`?${params.toString()}`, { replaceState: true })
  }

  // ── Status badge colors ──
  function statusColor(status: string): string {
    switch (status) {
      case "submitted":
        return "badge-info"
      case "in_progress":
        return "badge-warning"
      case "completed":
      case "accepted":
        return "badge-success"
      case "rejected":
      case "wontfix":
        return "badge-error"
      case "closed":
        return "badge-neutral"
      default:
        return "badge-ghost"
    }
  }

  function priorityColor(priority: string): string {
    switch (priority) {
      case "critical":
        return "text-error font-bold"
      case "high":
        return "text-warning font-semibold"
      case "medium":
        return "text-info"
      case "low":
        return "text-base-content/60"
      default:
        return ""
    }
  }

  function typeIcon(type: string): string {
    switch (type) {
      case "bug":
        return "🐛"
      case "feature":
        return "✨"
      case "task":
        return "📋"
      case "epic":
        return "🏔️"
      default:
        return "📄"
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  function statusLabel(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // ── Task detail ──
  async function openTask(task: (typeof data.tasks)[0]) {
    selectedTask = task
    loadingComments = true
    comments = []

    const { data: commentData, error } = await data.supabase
      .from("project_tasks_comments")
      .select("*")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true })

    if (!error && commentData) {
      comments = commentData
    }
    loadingComments = false
  }

  function closeDrawer() {
    selectedTask = null
    comments = []
    commentText = ""
  }

  async function submitComment() {
    if (!commentText.trim() || !selectedTask) return
    submittingComment = true

    const { error } = await data.supabase
      .from("project_tasks_comments")
      .insert({
        task_id: selectedTask.id,
        author: data.user.email || "Anonymous",
        author_role: "user",
        text: commentText.trim(),
      })

    if (!error) {
      comments = [
        ...comments,
        {
          id: crypto.randomUUID(),
          author: data.user.email || "Anonymous",
          author_role: "user",
          text: commentText.trim(),
          created_at: new Date().toISOString(),
        },
      ]
      commentText = ""
    }
    submittingComment = false
  }

  function handleCommentKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      submitComment()
    }
  }

  // ── Comment count from nested select ──
  function commentCount(task: (typeof data.tasks)[0]): number {
    const c = task.project_tasks_comments
    if (Array.isArray(c) && c.length > 0 && typeof c[0]?.count === "number") {
      return c[0].count
    }
    return 0
  }
</script>

<svelte:head>
  <title>Tasks</title>
</svelte:head>

<svelte:window onkeydown={(e) => e.key === "Escape" && selectedTask && closeDrawer()} />

<!-- Header -->
<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold">Tasks</h1>
    <p class="text-base-content/60 text-sm mt-1">
      Track bugs, features, and requests for your project.
    </p>
  </div>
  <div class="text-sm text-base-content/50">
    {tasks.length} task{tasks.length !== 1 ? "s" : ""}
  </div>
</div>

<!-- Filters -->
<div class="flex flex-wrap gap-2 mb-6">
  <select
    class="select select-bordered select-sm"
    value={data.filters.status}
    onchange={(e) => applyFilter("status", e.currentTarget.value)}
  >
    {#each statusOptions as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>

  <select
    class="select select-bordered select-sm"
    value={data.filters.issueType}
    onchange={(e) => applyFilter("type", e.currentTarget.value)}
  >
    {#each typeOptions as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>

  <select
    class="select select-bordered select-sm"
    value={data.filters.priority}
    onchange={(e) => applyFilter("priority", e.currentTarget.value)}
  >
    {#each priorityOptions as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>

  {#if data.filters.status || data.filters.issueType || data.filters.priority}
    <button
      class="btn btn-ghost btn-sm"
      onclick={() => goto("?", { replaceState: true })}
    >
      Clear filters
    </button>
  {/if}
</div>

<!-- Task list -->
{#if tasks.length === 0}
  <div class="text-center py-16 text-base-content/50">
    <div class="text-4xl mb-3">📭</div>
    <p class="text-lg font-medium">No tasks found</p>
    <p class="text-sm mt-1">
      {#if data.filters.status || data.filters.issueType || data.filters.priority}
        Try adjusting your filters.
      {:else}
        Tasks will appear here when they are created.
      {/if}
    </p>
  </div>
{:else}
  <!-- Desktop table -->
  <div class="hidden sm:block overflow-x-auto">
    <table class="table table-sm">
      <thead>
        <tr class="text-base-content/60">
          <th>Title</th>
          <th>Type</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assignee</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each tasks as task (task.id)}
          <tr
            class="hover:bg-base-200/50 cursor-pointer transition-colors"
            onclick={() => openTask(task)}
          >
            <td class="font-medium max-w-xs truncate">{task.title}</td>
            <td>
              <span class="text-sm" title={task.issue_type}>
                {typeIcon(task.issue_type)} {task.issue_type}
              </span>
            </td>
            <td>
              <span class="badge badge-sm {statusColor(task.status)}">
                {statusLabel(task.status)}
              </span>
            </td>
            <td>
              <span class={priorityColor(task.priority)}>
                {task.priority || "—"}
              </span>
            </td>
            <td class="text-sm text-base-content/60">
              {task.assignee || "—"}
            </td>
            <td class="text-sm text-base-content/60">
              {formatDate(task.created_at)}
            </td>
            <td>
              {#if commentCount(task) > 0}
                <span class="text-xs text-base-content/50" title="{commentCount(task)} comments">
                  💬 {commentCount(task)}
                </span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Mobile cards -->
  <div class="sm:hidden flex flex-col gap-3">
    {#each tasks as task (task.id)}
      <button
        class="card bg-base-100 shadow-sm border border-base-300 p-4 text-left w-full"
        onclick={() => openTask(task)}
      >
        <div class="flex items-start justify-between gap-2">
          <div class="font-medium text-sm leading-snug flex-1 min-w-0">
            <span class="mr-1">{typeIcon(task.issue_type)}</span>
            {task.title}
          </div>
          <span class="badge badge-sm {statusColor(task.status)} shrink-0">
            {statusLabel(task.status)}
          </span>
        </div>
        <div class="flex items-center gap-3 mt-2 text-xs text-base-content/50">
          <span class={priorityColor(task.priority)}>{task.priority || "—"}</span>
          {#if task.assignee}
            <span>{task.assignee}</span>
          {/if}
          <span>{formatDate(task.created_at)}</span>
          {#if commentCount(task) > 0}
            <span>💬 {commentCount(task)}</span>
          {/if}
        </div>
      </button>
    {/each}
  </div>
{/if}

<!-- Task detail drawer -->
{#if selectedTask}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/30 z-40"
    onclick={closeDrawer}
    role="presentation"
  ></div>

  <!-- Drawer panel -->
  <div class="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-base-100 shadow-xl flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-base-300">
      <div class="flex items-center gap-2 min-w-0">
        <span>{typeIcon(selectedTask.issue_type)}</span>
        <h2 class="text-lg font-bold truncate">{selectedTask.title}</h2>
      </div>
      <button class="btn btn-ghost btn-sm btn-square" onclick={closeDrawer}>
        ✕
      </button>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-5 py-4">
      <!-- Meta badges -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="badge {statusColor(selectedTask.status)}">
          {statusLabel(selectedTask.status)}
        </span>
        <span class="badge badge-outline">{selectedTask.issue_type}</span>
        {#if selectedTask.priority}
          <span class="badge badge-outline {priorityColor(selectedTask.priority)}">
            {selectedTask.priority}
          </span>
        {/if}
        {#if selectedTask.source && selectedTask.source !== "feedback"}
          <span class="badge badge-ghost">{selectedTask.source}</span>
        {/if}
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
        {#if selectedTask.assignee}
          <div class="text-base-content/50">Assignee</div>
          <div>{selectedTask.assignee}</div>
        {/if}
        {#if selectedTask.due_date}
          <div class="text-base-content/50">Due date</div>
          <div>{formatDate(selectedTask.due_date)}</div>
        {/if}
        <div class="text-base-content/50">Created</div>
        <div>{formatDateTime(selectedTask.created_at)}</div>
        {#if selectedTask.updated_at}
          <div class="text-base-content/50">Updated</div>
          <div>{formatDateTime(selectedTask.updated_at)}</div>
        {/if}
        {#if selectedTask.labels?.length}
          <div class="text-base-content/50">Labels</div>
          <div class="flex flex-wrap gap-1">
            {#each selectedTask.labels as label}
              <span class="badge badge-sm badge-ghost">{label}</span>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Description -->
      {#if selectedTask.description}
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-base-content/60 mb-2">Description</h3>
          <div class="prose prose-sm max-w-none whitespace-pre-wrap">
            {selectedTask.description}
          </div>
        </div>
      {/if}

      <!-- Page URL -->
      {#if selectedTask.page_url}
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-base-content/60 mb-2">Page</h3>
          <a href={selectedTask.page_url} class="link link-primary text-sm break-all" target="_blank" rel="noopener">
            {selectedTask.page_url}
          </a>
        </div>
      {/if}

      <!-- Screenshots -->
      {#if selectedTask.screenshot_paths?.length}
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-base-content/60 mb-2">Screenshots</h3>
          <div class="flex gap-2 flex-wrap">
            {#each selectedTask.screenshot_paths as path}
              {@const proxyUrl = `/api/feedback/screenshots/${path}`}
              <a href={proxyUrl} target="_blank" rel="noopener" class="block">
                <img src={proxyUrl} alt="Screenshot" class="w-32 h-24 object-cover rounded border border-base-300" />
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Comments -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold text-base-content/60 mb-3">
          Comments
          {#if comments.length > 0}
            <span class="font-normal">({comments.length})</span>
          {/if}
        </h3>

        {#if loadingComments}
          <div class="flex items-center gap-2 text-sm text-base-content/50 py-4">
            <span class="loading loading-spinner loading-sm"></span>
            Loading comments...
          </div>
        {:else if comments.length === 0}
          <p class="text-sm text-base-content/40 py-2">No comments yet.</p>
        {:else}
          <div class="flex flex-col gap-3 mb-4">
            {#each comments as comment}
              <div class="bg-base-200/50 rounded-lg px-4 py-3">
                <div class="flex items-center gap-2 text-xs text-base-content/50 mb-1">
                  <span class="font-medium text-base-content/80">{comment.author}</span>
                  {#if comment.author_role !== "user"}
                    <span class="badge badge-xs badge-primary">{comment.author_role}</span>
                  {/if}
                  <span>{formatDateTime(comment.created_at)}</span>
                </div>
                <p class="text-sm whitespace-pre-wrap">{comment.text}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Comment input (fixed at bottom) -->
    <div class="border-t border-base-300 px-5 py-3">
      <div class="flex gap-2">
        <textarea
          class="textarea textarea-bordered flex-1 text-sm min-h-[2.5rem] max-h-32"
          placeholder="Add a comment... (Ctrl+Enter to send)"
          rows="2"
          bind:value={commentText}
          onkeydown={handleCommentKeydown}
        ></textarea>
        <button
          class="btn btn-primary btn-sm self-end"
          disabled={!commentText.trim() || submittingComment}
          onclick={submitComment}
        >
          {#if submittingComment}
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            Send
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
