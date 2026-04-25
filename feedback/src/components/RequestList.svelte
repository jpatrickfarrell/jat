<script lang="ts">
  import { respondToReport, fetchTaskComments, postTaskComment, type ReportSummary, type TaskComment } from '../lib/api';
  import type { ThreadEntry, ElementData } from '../lib/types';
  import { captureViewport } from '../lib/screenshot';
  import { startElementPicker } from '../lib/elementPicker';
  import { slide } from 'svelte/transition';
  import { onDestroy } from 'svelte';
  import TimelineViewer from './TimelineViewer.svelte';

  let {
    endpoint,
    reports = $bindable<ReportSummary[]>([]),
    loading,
    error,
    onreload,
    userId = '',
    userName = '',
    userEmail = '',
  }: {
    endpoint: string;
    reports: ReportSummary[];
    loading: boolean;
    error: string;
    onreload: () => void;
    userId?: string;
    userName?: string;
    userEmail?: string;
  } = $props();

  let expandedScreenshot = $state<string | null>(null);
  let expandedThreadId = $state<string | null>(null);
  let expandedCardId = $state<string | null>(null);
  let scrollEl = $state<HTMLElement | undefined>();

  // Task comment thread state
  let taskComments = $state<Map<string, TaskComment[]>>(new Map());
  let commentsLoading = $state<Set<string>>(new Set());
  let commentErrors = $state<Map<string, string>>(new Map());
  let replyText = $state<Map<string, string>>(new Map());
  let replySending = $state<Set<string>>(new Set());
  let pollTimers = new Map<string, ReturnType<typeof setInterval>>();

  async function loadComments(reportId: string) {
    if (commentsLoading.has(reportId)) return;
    commentsLoading = new Set([...commentsLoading, reportId]);
    const result = await fetchTaskComments(endpoint, reportId);
    commentsLoading.delete(reportId);
    commentsLoading = new Set(commentsLoading);
    // Always populate taskComments (even on error, with empty array) so the
    // reply box renders instead of staying in the "not loaded" state.
    taskComments = new Map([...taskComments, [reportId, result.comments]]);
    if (result.error) {
      commentErrors = new Map([...commentErrors, [reportId, result.error]]);
    } else {
      commentErrors.delete(reportId);
      commentErrors = new Map(commentErrors);
    }
  }

  function startPolling(reportId: string) {
    if (pollTimers.has(reportId)) return;
    const t = setInterval(() => loadComments(reportId), 30_000);
    pollTimers.set(reportId, t);
  }

  function stopPolling(reportId: string) {
    const t = pollTimers.get(reportId);
    if (t !== undefined) { clearInterval(t); pollTimers.delete(reportId); }
  }

  async function sendReply(reportId: string) {
    const text = replyText.get(reportId)?.trim();
    if (!text || replySending.has(reportId)) return;
    replySending = new Set([...replySending, reportId]);
    const author = userName || userEmail || 'You';
    const result = await postTaskComment(endpoint, reportId, {
      text,
      author,
      author_email: userEmail || undefined,
      author_type: 'user',
      comment_type: 'note',
    });
    replySending.delete(reportId);
    replySending = new Set(replySending);
    if (result.ok && result.comment) {
      const existing = taskComments.get(reportId) || [];
      taskComments = new Map([...taskComments, [reportId, [...existing, result.comment]]]);
      replyText = new Map([...replyText, [reportId, '']]);
    }
  }

  function authorLabel(comment: TaskComment): string {
    if (comment.author_type === 'agent') return 'Agent';
    if (comment.author_type === 'user') {
      // If the author matches the current user, show "You"
      if (userEmail && comment.author === userEmail) return 'You';
      if (userName && comment.author === userName) return 'You';
      return comment.author || 'You';
    }
    return comment.author || 'Team';
  }

  function commentStyle(comment: TaskComment): 'reporter' | 'agent' | 'team' {
    if (comment.author_type === 'agent') return 'agent';
    if (comment.author_type === 'user') return 'reporter';
    return 'team';
  }

  onDestroy(() => {
    for (const t of pollTimers.values()) clearInterval(t);
  });

  let respondingId = $state('');
  let rejectingId = $state('');
  let rejectReason = $state('');

  // Enhanced rejection: screenshots and elements
  let rejectScreenshots = $state<string[]>([]);
  let rejectElements = $state<Array<{ tagName: string; className: string; id: string; selector: string; textContent: string }>>([]);
  let capturingScreenshot = $state(false);

  // Status subtab state
  // In Progress = all active/actionable items (submitted, in_progress, rejected, completed, wontfix)
  // Done = fully resolved / archival (accepted, closed)
  type SubTab = 'active' | 'done';
  let activeSubTab = $state<SubTab>('active');

  // Source filter: All | Feedback | Tasks
  type SourceFilter = 'all' | 'feedback' | 'jat';
  let sourceFilter = $state<SourceFilter>('all');

  // Filter reports by source, then by status subtab
  let sourceFilteredReports = $derived.by(() => {
    if (sourceFilter === 'all') return reports;
    return reports.filter(r => (r.source || 'feedback') === sourceFilter);
  });

  let filteredReports = $derived.by(() => {
    if (activeSubTab === 'active') {
      return sourceFilteredReports.filter(r => ['submitted', 'in_progress', 'rejected', 'completed', 'wontfix'].includes(r.status));
    } else {
      return sourceFilteredReports.filter(r => r.status === 'accepted' || r.status === 'closed');
    }
  });

  // Counts for subtab badges (respect source filter)
  let activeCount = $derived(sourceFilteredReports.filter(r => ['submitted', 'in_progress', 'rejected', 'completed', 'wontfix'].includes(r.status)).length);
  let doneCount = $derived(sourceFilteredReports.filter(r => r.status === 'accepted' || r.status === 'closed').length);

  // Source counts for filter pills
  let feedbackCount = $derived(reports.filter(r => (r.source || 'feedback') === 'feedback').length);
  let taskCount = $derived(reports.filter(r => r.source === 'jat').length);
  let hasMultipleSources = $derived(feedbackCount > 0 && taskCount > 0);

  function renderMarkdown(text: string): string {
    if (!text) return '';
    // XSS-escape raw text first
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    return escaped
      // Headers: ## Heading → <strong>
      .replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>')
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Bullet list items: - item or * item
      .replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  function toggleCard(reportId: string) {
    const wasExpanded = expandedCardId === reportId;
    expandedCardId = wasExpanded ? null : reportId;
    if (wasExpanded) {
      if (expandedThreadId === reportId) expandedThreadId = null;
      expandedScreenshot = null;
      stopPolling(reportId);
    } else {
      loadComments(reportId);
      startPolling(reportId);
      setTimeout(() => {
        if (!scrollEl) return;
        const card = scrollEl.querySelector(`[data-card-id="${reportId}"]`) as HTMLElement | null;
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 220);
    }
  }

  function startReject(reportId: string) {
    rejectingId = reportId;
    rejectReason = '';
    rejectScreenshots = [];
    rejectElements = [];
  }

  function cancelReject() {
    rejectingId = '';
    rejectReason = '';
    rejectScreenshots = [];
    rejectElements = [];
  }

  async function captureRejectScreenshot() {
    if (capturingScreenshot) return;
    capturingScreenshot = true;
    try {
      const dataUrl = await captureViewport();
      rejectScreenshots = [...rejectScreenshots, dataUrl];
    } catch (err) {
      console.error('Screenshot capture failed:', err);
    }
    capturingScreenshot = false;
  }

  function removeRejectScreenshot(index: number) {
    rejectScreenshots = rejectScreenshots.filter((_, i) => i !== index);
  }

  function pickRejectElement() {
    startElementPicker((data: ElementData) => {
      rejectElements = [...rejectElements, {
        tagName: data.tagName,
        className: data.className,
        id: data.id,
        selector: data.selector,
        textContent: data.textContent,
      }];
    });
  }

  function removeRejectElement(index: number) {
    rejectElements = rejectElements.filter((_, i) => i !== index);
  }

  async function handleRespond(reportId: string, response: 'accepted' | 'rejected', reason?: string) {
    respondingId = reportId;
    const options = response === 'rejected' ? {
      screenshots: rejectScreenshots.length > 0 ? rejectScreenshots : undefined,
      elements: rejectElements.length > 0 ? rejectElements : undefined,
    } : undefined;

    const result = await respondToReport(endpoint, reportId, response, reason, options);
    if (result.ok) {
      reports = reports.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: response === 'rejected' ? 'submitted' : 'accepted',
            responded_at: new Date().toISOString(),
            ...(response === 'rejected' ? { revision_count: (r.revision_count || 0) + 1 } : {}),
          };
        }
        return r;
      });
      rejectingId = '';
      rejectReason = '';
      rejectScreenshots = [];
      rejectElements = [];
      // Reload to get fresh thread data
      onreload();
    } else {
      rejectingId = '';
    }
    respondingId = '';
  }

  function toggleThread(reportId: string) {
    expandedThreadId = expandedThreadId === reportId ? null : reportId;
  }

  function threadEntryCount(thread: ThreadEntry[] | null): number {
    return thread ? thread.length : 0;
  }

  function entryTypeLabel(entry: ThreadEntry): string {
    const labels: Record<string, string> = {
      submission: 'Submitted',
      completion: 'Completed',
      rejection: 'Rejected',
      acceptance: 'Accepted',
      note: 'Note',
    };
    return labels[entry.type] || entry.type;
  }

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      submitted: 'Submitted',
      in_progress: 'Working On It',
      completed: 'Ready for Review',
      accepted: 'Done',
      rejected: 'Revising',
      wontfix: "Won't Fix",
      closed: 'Closed',
    };
    return labels[status] || status;
  }

  function statusColor(status: string): string {
    const colors: Record<string, string> = {
      submitted: '#6b7280',
      in_progress: '#3b82f6',
      completed: '#f59e0b',
      accepted: '#10b981',
      rejected: '#f59e0b',
      wontfix: '#6b7280',
      closed: '#6b7280',
    };
    return colors[status] || '#6b7280';
  }

  function typeIcon(report: ReportSummary): string {
    // Use issue_type if available (v3.0.0+), fall back to source_type
    const t = report.issue_type || report.type;
    if (t === 'bug') return '\u{1F41B}';
    if (t === 'enhancement' || t === 'feature') return '\u{2728}';
    if (t === 'task') return '\u{2705}';
    if (t === 'epic') return '\u{1F3AF}';
    return '\u{1F4DD}';
  }

  function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }
</script>

<div class="request-list">
  <!-- Source filter (only shown when items from multiple sources exist) -->
  {#if hasMultipleSources}
    <div class="source-filters">
      <button class="source-pill" class:active={sourceFilter === 'all'} onclick={() => sourceFilter = 'all'}>
        All <span class="source-pill-count">{reports.length}</span>
      </button>
      <button class="source-pill" class:active={sourceFilter === 'feedback'} onclick={() => sourceFilter = 'feedback'}>
        Feedback <span class="source-pill-count">{feedbackCount}</span>
      </button>
      <button class="source-pill" class:active={sourceFilter === 'jat'} onclick={() => sourceFilter = 'jat'}>
        Tasks <span class="source-pill-count">{taskCount}</span>
      </button>
    </div>
  {/if}

  <!-- Subtabs -->
  <div class="subtabs">
    <button class="subtab" class:active={activeSubTab === 'active'} onclick={() => activeSubTab = 'active'}>
      In Progress
      {#if activeCount > 0}<span class="subtab-count">{activeCount}</span>{/if}
    </button>
    <button class="subtab" class:active={activeSubTab === 'done'} onclick={() => activeSubTab = 'done'}>
      Done
      {#if doneCount > 0}<span class="subtab-count done-count">{doneCount}</span>{/if}
    </button>
  </div>

  <div class="request-scroll" bind:this={scrollEl}>
    {#key activeSubTab}
    <div transition:slide={{ duration: 200 }}>
    {#if loading}
      <div class="loading">
        <span class="spinner"></span>
        <span>Loading your requests...</span>
      </div>
    {:else if error && reports.length === 0}
      <div class="empty">
        <p class="error-text">{error}</p>
        <button class="retry-btn" onclick={onreload}>Retry</button>
      </div>
    {:else if reports.length === 0}
      <div class="empty">
        <div class="empty-icon">{'\u{1F4CB}'}</div>
        <p>No requests yet</p>
        <p class="empty-sub">Submit feedback using the New Report tab</p>
      </div>
    {:else if filteredReports.length === 0}
      <div class="empty">
        <p class="empty-sub">{activeSubTab === 'submitted' ? 'No submitted requests' : activeSubTab === 'review' ? 'Nothing to review right now' : 'No completed requests yet'}</p>
      </div>
    {:else}
      <div class="reports">
        {#each filteredReports as report (report.id)}
          <div class="report-card" data-card-id={report.id} class:awaiting={report.status === 'completed'} class:expanded={expandedCardId === report.id}>
            <!-- Collapsed header (always visible, clickable) -->
            <button class="card-toggle" onclick={() => toggleCard(report.id)}>
              <span class="report-type">{typeIcon(report)}</span>
              <span class="report-title">{report.title}</span>
              <span class="report-status" style="background: {statusColor(report.status)}20; color: {statusColor(report.status)}; border-color: {statusColor(report.status)}40;">
                {statusLabel(report.status)}
              </span>
              <svg class="chevron" class:chevron-open={expandedCardId === report.id} width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Expanded content -->
            {#if expandedCardId === report.id}
              <div class="card-body" transition:slide={{ duration: 200 }}>
                {#if report.page_url}
                  <a class="report-url" href={report.page_url} target="_blank" rel="noopener noreferrer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span>{report.page_url.replace(/^https?:\/\//, '').split('?')[0]}</span>
                  </a>
                {/if}

                {#if report.revision_count > 0 && report.status !== 'accepted'}
                  <p class="revision-note">Revision {report.revision_count}</p>
                {/if}

                <!-- Comment thread (new unified model) -->
                {#if commentsLoading.has(report.id) && !taskComments.has(report.id)}
                  <div class="comments-loading"><span class="spinner"></span></div>

                {:else if (taskComments.get(report.id) ?? []).length > 0}
                  <button class="thread-toggle" onclick={() => toggleThread(report.id)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="thread-toggle-icon" class:expanded={expandedThreadId === report.id}>
                      <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{(taskComments.get(report.id) ?? []).length} {(taskComments.get(report.id) ?? []).length === 1 ? 'message' : 'messages'}</span>
                  </button>

                  {#if expandedThreadId === report.id}
                    <div class="thread">
                      {#each (taskComments.get(report.id) ?? []) as comment (comment.id)}
                        <div class="thread-entry"
                             class:thread-reporter={commentStyle(comment) === 'reporter'}
                             class:thread-agent={commentStyle(comment) === 'agent'}
                             class:thread-team={commentStyle(comment) === 'team'}>
                          <div class="thread-entry-header">
                            <span class="thread-from">{authorLabel(comment)}</span>
                            {#if commentStyle(comment) === 'agent'}
                              <span class="thread-type-badge agent-badge">Agent</span>
                            {:else if commentStyle(comment) === 'team'}
                              <span class="thread-type-badge team-badge">Team</span>
                            {/if}
                            <span class="thread-time">{timeAgo(comment.created_at)}</span>
                          </div>
                          <p class="thread-message">{@html renderMarkdown(comment.text)}</p>
                        </div>
                      {/each}
                    </div>

                    <div class="reply-form">
                      <textarea
                        class="reply-input"
                        placeholder="Reply…"
                        rows="2"
                        value={replyText.get(report.id) || ''}
                        oninput={(e) => replyText = new Map([...replyText, [report.id, (e.target as HTMLTextAreaElement).value]])}
                        onkeydown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendReply(report.id); } }}
                      ></textarea>
                      <button
                        class="reply-send-btn"
                        disabled={!replyText.get(report.id)?.trim() || replySending.has(report.id)}
                        onclick={() => sendReply(report.id)}
                      >{replySending.has(report.id) ? '…' : 'Send'}</button>
                    </div>
                  {/if}

                {:else if taskComments.has(report.id) && report.thread && report.thread.length > 0}
                  <!-- Legacy sidecar thread fallback (no comments yet) -->
                  <button class="thread-toggle" onclick={() => toggleThread(report.id)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="thread-toggle-icon" class:expanded={expandedThreadId === report.id}>
                      <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{threadEntryCount(report.thread)} {threadEntryCount(report.thread) === 1 ? 'message' : 'messages'}</span>
                  </button>

                  {#if expandedThreadId === report.id}
                    <div class="thread">
                      {#each report.thread as entry (entry.id)}
                        <div class="thread-entry" class:thread-reporter={entry.from === 'user'} class:thread-team={entry.from === 'dev'}>
                          <div class="thread-entry-header">
                            <span class="thread-from">{entry.from === 'user' ? 'You' : 'Dev'}</span>
                            <span class="thread-type-badge" class:submission={entry.type === 'submission'} class:completion={entry.type === 'completion'} class:rejection={entry.type === 'rejection'} class:acceptance={entry.type === 'acceptance'}>
                              {entryTypeLabel(entry)}
                            </span>
                            <span class="thread-time">{timeAgo(entry.at)}</span>
                          </div>
                          <p class="thread-message">{@html renderMarkdown(entry.message)}</p>

                          {#if entry.summary && entry.summary.length > 0}
                            <ul class="thread-summary">
                              {#each entry.summary as item}<li>{item}</li>{/each}
                            </ul>
                          {/if}

                          {#if entry.screenshots && entry.screenshots.length > 0}
                            <div class="thread-screenshots">
                              {#each entry.screenshots as screenshot, i}
                                {#if screenshot.url}
                                  <button class="screenshot-thumb" onclick={() => expandedScreenshot = expandedScreenshot === screenshot.url ? null : screenshot.url} aria-label="Screenshot {i + 1}">
                                    <img src="{endpoint}{screenshot.url}" alt="Screenshot {i + 1}" loading="lazy" />
                                  </button>
                                {/if}
                              {/each}
                            </div>
                            {#if expandedScreenshot}
                              {#each entry.screenshots.filter(s => s.url === expandedScreenshot) as s}
                                <div class="screenshot-expanded">
                                  <img src="{endpoint}{expandedScreenshot}" alt="Screenshot" />
                                  <button class="screenshot-close" onclick={() => expandedScreenshot = null} aria-label="Close">&times;</button>
                                </div>
                              {/each}
                            {/if}
                          {/if}

                          {#if entry.elements && entry.elements.length > 0}
                            <div class="thread-elements">
                              {#each entry.elements as el}
                                <span class="element-badge" title={el.selector}>
                                  &lt;{el.tagName.toLowerCase()}{el.id ? `#${el.id}` : ''}{el.className ? `.${el.className.split(' ')[0]}` : ''}&gt;
                                </span>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}

                {:else if taskComments.has(report.id)}
                  <!-- Loaded, no comments — show description + reply box -->
                  {#if report.description}
                    <p class="report-desc">{report.description.length > 120 ? report.description.slice(0, 120) + '...' : report.description}</p>
                  {/if}
                  <div class="reply-form">
                    <textarea
                      class="reply-input"
                      placeholder="Add a message…"
                      rows="2"
                      value={replyText.get(report.id) || ''}
                      oninput={(e) => replyText = new Map([...replyText, [report.id, (e.target as HTMLTextAreaElement).value]])}
                      onkeydown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendReply(report.id); } }}
                    ></textarea>
                    <button
                      class="reply-send-btn"
                      disabled={!replyText.get(report.id)?.trim() || replySending.has(report.id)}
                      onclick={() => sendReply(report.id)}
                    >{replySending.has(report.id) ? '…' : 'Send'}</button>
                  </div>

                {:else if report.description}
                  <!-- Not loaded yet — show description excerpt -->
                  <p class="report-desc">{report.description.length > 120 ? report.description.slice(0, 120) + '...' : report.description}</p>
                {/if}

                {#if !report.thread && report.screenshot_urls && report.screenshot_urls.length > 0}
                  <div class="report-screenshots">
                    {#each report.screenshot_urls as url, i}
                      <button class="screenshot-thumb" onclick={() => expandedScreenshot = expandedScreenshot === url ? null : url} aria-label="Screenshot {i + 1}">
                        <img src="{endpoint}{url}" alt="Screenshot {i + 1}" loading="lazy" />
                      </button>
                    {/each}
                  </div>
                  {#if expandedScreenshot && report.screenshot_urls.includes(expandedScreenshot)}
                    <div class="screenshot-expanded">
                      <img src="{endpoint}{expandedScreenshot}" alt="Screenshot" />
                      <button class="screenshot-close" onclick={() => expandedScreenshot = null} aria-label="Close">&times;</button>
                    </div>
                  {/if}
                {/if}

                <!-- Recording replay -->
                {#if report.recording_url || (report.thread && report.thread.some(e => e.recordingUrl))}
                  {@const recUrl = report.recording_url ?? report.thread?.find(e => e.recordingUrl)?.recordingUrl ?? null}
                  {#if recUrl}
                    <div class="replay-header">
                      <span class="replay-label">Session Recording</span>
                      <a
                        href="{endpoint}/feedback/replay?id={report.id}"
                        target="_blank"
                        rel="noreferrer"
                        class="replay-fullscreen-btn"
                        title="Open full replay in new tab"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 2h4v4M14 2L9 7M6 14H2v-4M2 14l5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Full replay
                      </a>
                    </div>
                    <TimelineViewer
                      recordingUrl={recUrl}
                      {endpoint}
                      consoleLogs={report.console_logs ?? null}
                      networkRequests={report.network_requests ?? null}
                    />
                  {/if}
                {/if}

                {#if report.dev_notes && !report.thread && report.status !== 'in_progress'}
                  <div class="dev-notes">
                    <span class="dev-notes-label">Dev response:</span>
                    <span class="dev-notes-content">{@html renderMarkdown(report.dev_notes)}</span>
                  </div>
                {/if}

                <div class="report-footer">
                  <span class="report-time">{timeAgo(report.created_at)}</span>

                  {#if report.status === 'accepted'}
                    <span class="status-pill accepted">{'\u2713'} Accepted</span>
                  {:else if report.status === 'rejected'}
                    <span class="status-pill rejected">{'\u2717'} Rejected</span>
                  {:else if report.status === 'completed' || report.status === 'wontfix'}
                    {#if rejectingId === report.id}
                      <div class="reject-reason-form">
                        <textarea
                          class="reject-reason-input"
                          placeholder="Why are you rejecting? (min 10 characters)"
                          bind:value={rejectReason}
                          rows="2"
                        ></textarea>

                        <!-- Attachment buttons -->
                        <div class="reject-attachments">
                          <button class="attach-btn" onclick={captureRejectScreenshot} disabled={capturingScreenshot} title="Capture screenshot">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            {capturingScreenshot ? '...' : 'Screenshot'}
                          </button>
                          <button class="attach-btn" onclick={pickRejectElement} title="Pick an element">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Pick Element
                          </button>
                        </div>

                        <!-- Screenshot previews -->
                        {#if rejectScreenshots.length > 0}
                          <div class="reject-preview-strip">
                            {#each rejectScreenshots as screenshot, i}
                              <div class="reject-preview-item">
                                <img src={screenshot} alt="Screenshot {i + 1}" />
                                <button class="reject-preview-remove" onclick={() => removeRejectScreenshot(i)} aria-label="Remove">&times;</button>
                              </div>
                            {/each}
                          </div>
                        {/if}

                        <!-- Element badges -->
                        {#if rejectElements.length > 0}
                          <div class="reject-element-strip">
                            {#each rejectElements as el, i}
                              <span class="element-badge removable">
                                &lt;{el.tagName.toLowerCase()}{el.id ? `#${el.id}` : ''}&gt;
                                <button class="element-remove" onclick={() => removeRejectElement(i)}>&times;</button>
                              </span>
                            {/each}
                          </div>
                        {/if}

                        <div class="reject-reason-actions">
                          <button class="cancel-btn" onclick={cancelReject}>Cancel</button>
                          <button
                            class="confirm-reject-btn"
                            disabled={rejectReason.trim().length < 10 || respondingId === report.id}
                            onclick={() => handleRespond(report.id, 'rejected', rejectReason.trim())}
                          >
                            {respondingId === report.id ? '...' : '\u2717 Reject'}
                          </button>
                        </div>
                        {#if rejectReason.trim().length > 0 && rejectReason.trim().length < 10}
                          <span class="char-hint">{10 - rejectReason.trim().length} more characters needed</span>
                        {/if}
                      </div>
                    {:else}
                      <div class="response-actions">
                        <button
                          class="accept-btn"
                          disabled={respondingId === report.id}
                          onclick={() => handleRespond(report.id, 'accepted')}
                        >
                          {respondingId === report.id ? '...' : '\u2713 Accept'}
                        </button>
                        <button
                          class="reject-btn"
                          disabled={respondingId === report.id}
                          onclick={() => startReject(report.id)}
                        >
                          {'\u2717'} Reject
                        </button>
                      </div>
                    {/if}
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
    </div>
    {/key}
  </div>
</div>

<style>
  .request-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  /* Source filters */
  .source-filters {
    display: flex;
    gap: 4px;
    padding: 8px 12px 4px;
    flex-shrink: 0;
  }
  .source-pill {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    color: #9ca3af;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .source-pill:hover {
    border-color: #4b5563;
    color: #d1d5db;
  }
  .source-pill.active {
    background: #3b82f620;
    border-color: #3b82f640;
    color: #60a5fa;
  }
  .source-pill-count {
    font-size: 9px;
    opacity: 0.7;
  }

  /* Subtabs */
  .subtabs {
    display: flex;
    border-bottom: 1px solid #1f2937;
    padding: 0 12px;
    flex-shrink: 0;
  }
  .subtab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 10px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6b7280;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .subtab:hover { color: #d1d5db; }
  .subtab.active {
    color: #f9fafb;
    border-bottom-color: #3b82f6;
  }
  .subtab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    border-radius: 7px;
    background: #374151;
    color: #d1d5db;
    font-size: 9px;
    font-weight: 700;
    line-height: 1;
  }
  .subtab.active .subtab-count {
    background: #3b82f6;
    color: #fff;
  }
  .subtab-count.done-count {
    background: #10b98130;
    color: #34d399;
  }
  .subtab.active .subtab-count.done-count {
    background: #3b82f6;
    color: #fff;
  }

  .request-scroll {
    padding: 10px 12px;
    padding-bottom: 80px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 0;
    color: #9ca3af;
    font-size: 13px;
  }
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty {
    text-align: center;
    padding: 40px 0;
    color: #6b7280;
    font-size: 13px;
  }
  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  .empty-sub {
    font-size: 12px;
    color: #4b5563;
    margin-top: 4px;
  }
  .error-text {
    color: #ef4444;
    margin-bottom: 8px;
  }
  .retry-btn {
    padding: 5px 14px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }
  .retry-btn:hover { background: #374151; }

  .reports {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .report-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    transition: border-color 0.15s;
    overflow: hidden;
  }
  .report-card.awaiting {
    border-color: #f59e0b40;
    box-shadow: 0 0 0 1px #f59e0b20;
  }
  .report-card.expanded {
    border-color: #4b556380;
  }

  /* Collapsed card header (clickable toggle) */
  .card-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 9px 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    color: inherit;
  }
  .card-toggle:hover {
    background: #ffffff06;
  }
  .report-type {
    font-size: 13px;
    flex-shrink: 0;
  }
  .report-title {
    font-size: 12px;
    font-weight: 600;
    color: #f3f4f6;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .report-status {
    font-size: 9px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .chevron {
    flex-shrink: 0;
    color: #6b7280;
    transition: transform 0.15s;
  }
  .chevron-open {
    transform: rotate(90deg);
  }

  /* Expanded card body */
  .card-body {
    padding: 0 10px 10px;
    border-top: 1px solid #ffffff08;
  }

  .report-url {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 6px 0 0;
    font-size: 11px;
    color: #60a5fa;
    text-decoration: none;
    overflow: hidden;
    transition: color 0.15s;
  }
  .report-url:hover { color: #93c5fd; }
  .report-url svg { flex-shrink: 0; }
  .report-url span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .report-screenshots {
    display: flex;
    gap: 4px;
    margin-top: 6px;
    overflow-x: auto;
  }
  .screenshot-thumb {
    flex-shrink: 0;
    width: 52px;
    height: 36px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #374151;
    background: #111827;
    cursor: pointer;
    padding: 0;
    transition: border-color 0.15s;
  }
  .screenshot-thumb:hover { border-color: #60a5fa; }
  .screenshot-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .screenshot-expanded {
    position: relative;
    margin-top: 4px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #374151;
  }
  .screenshot-expanded img {
    width: 100%;
    display: block;
    border-radius: 5px;
  }
  .screenshot-close {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    color: #e5e7eb;
    border: none;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .screenshot-close:hover { background: rgba(0,0,0,0.9); }
  .revision-note {
    font-size: 10px;
    color: #f59e0b;
    margin: 3px 0 0;
    font-weight: 500;
  }
  .report-desc {
    font-size: 12px;
    color: #9ca3af;
    margin: 6px 0 0;
    line-height: 1.4;
  }
  .dev-notes {
    margin-top: 6px;
    padding: 6px 8px;
    background: #111827;
    border-radius: 5px;
    font-size: 12px;
    color: #d1d5db;
    border-left: 2px solid #3b82f6;
  }
  .replay-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    margin-bottom: 4px;
  }
  .replay-label {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
  }
  .replay-fullscreen-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #60a5fa;
    text-decoration: none;
    padding: 2px 7px;
    border: 1px solid #1e3a5f;
    border-radius: 4px;
    background: #0f1e33;
    transition: background 0.15s;
  }
  .replay-fullscreen-btn:hover {
    background: #1e3a5f;
    color: #93c5fd;
  }
  .dev-notes-label {
    font-weight: 600;
    color: #60a5fa;
    margin-right: 4px;
    font-size: 11px;
  }
  .dev-notes-content {
    line-height: 1.5;
  }

  /* Thread toggle button */
  .thread-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    padding: 3px 6px;
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }
  .thread-toggle:hover {
    color: #d1d5db;
    background: #111827;
  }
  .thread-toggle-icon {
    transition: transform 0.15s;
  }
  .thread-toggle-icon.expanded {
    transform: rotate(90deg);
  }

  /* Thread container */
  .thread {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .thread-entry {
    padding: 6px 8px;
    border-radius: 5px;
    font-size: 12px;
    border-left: 2px solid;
  }
  .thread-reporter {
    background: #111827;
    border-left-color: #6b7280;
  }
  .thread-agent {
    background: #0f172a;
    border-left-color: #3b82f6;
  }
  .thread-team {
    background: #0f1a2e;
    border-left-color: #8b5cf6;
  }
  .thread-entry-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 3px;
  }
  .thread-from {
    font-weight: 600;
    font-size: 11px;
    color: #d1d5db;
  }
  .thread-type-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .thread-type-badge.submission {
    background: #6b728020;
    color: #9ca3af;
  }
  .thread-type-badge.completion {
    background: #3b82f620;
    color: #60a5fa;
  }
  .thread-type-badge.rejection {
    background: #ef444420;
    color: #f87171;
  }
  .thread-type-badge.acceptance {
    background: #10b98120;
    color: #34d399;
  }
  .thread-type-badge.agent-badge {
    background: #3b82f620;
    color: #60a5fa;
  }
  .thread-type-badge.team-badge {
    background: #8b5cf620;
    color: #a78bfa;
  }

  .comments-loading {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  /* Reply form */
  .reply-form {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    align-items: flex-end;
  }
  .reply-input {
    flex: 1;
    padding: 5px 8px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    font-family: inherit;
    resize: none;
    min-height: 36px;
    line-height: 1.4;
  }
  .reply-input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  .reply-input::placeholder { color: #4b5563; }
  .reply-send-btn {
    flex-shrink: 0;
    padding: 5px 12px;
    background: #3b82f618;
    border: 1px solid #3b82f640;
    border-radius: 5px;
    color: #60a5fa;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: background 0.15s;
    align-self: flex-end;
  }
  .reply-send-btn:hover:not(:disabled) { background: #3b82f630; }
  .reply-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .thread-time {
    font-size: 10px;
    color: #4b5563;
    margin-left: auto;
  }
  .thread-message {
    color: #d1d5db;
    line-height: 1.5;
    margin: 0;
    word-break: break-word;
  }
  .thread-summary {
    margin: 4px 0 0 0;
    padding: 0 0 0 16px;
    font-size: 11px;
    color: #9ca3af;
  }
  .thread-summary li {
    margin: 1px 0;
  }
  .thread-screenshots {
    display: flex;
    gap: 4px;
    margin-top: 4px;
  }
  .thread-elements {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .element-badge {
    font-size: 10px;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    padding: 1px 5px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 3px;
    color: #94a3b8;
  }
  .element-badge.removable {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .element-remove {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    line-height: 1;
  }
  .element-remove:hover { color: #ef4444; }

  /* Enhanced rejection form */
  .reject-attachments {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
  .attach-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 4px;
    color: #9ca3af;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, color 0.15s;
  }
  .attach-btn:hover:not(:disabled) {
    border-color: #60a5fa;
    color: #d1d5db;
  }
  .attach-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .reject-preview-strip {
    display: flex;
    gap: 4px;
    margin-top: 6px;
    overflow-x: auto;
  }
  .reject-preview-item {
    position: relative;
    flex-shrink: 0;
    width: 52px;
    height: 36px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #374151;
  }
  .reject-preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .reject-preview-remove {
    position: absolute;
    top: 1px;
    right: 1px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    color: #e5e7eb;
    border: none;
    cursor: pointer;
    font-size: 10px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .reject-preview-remove:hover { background: #ef4444; }
  .reject-element-strip {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .report-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }
  .report-time {
    font-size: 11px;
    color: #6b7280;
  }
  .status-pill {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .status-pill.accepted {
    color: #10b981;
    background: #10b98118;
  }
  .status-pill.rejected {
    color: #ef4444;
    background: #ef444418;
  }
  .response-actions {
    display: flex;
    gap: 6px;
  }
  .accept-btn, .reject-btn {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid;
    font-family: inherit;
    transition: background 0.15s;
  }
  .accept-btn {
    background: #10b98118;
    color: #10b981;
    border-color: #10b98140;
  }
  .accept-btn:hover:not(:disabled) { background: #10b98130; }
  .reject-btn {
    background: #ef444418;
    color: #ef4444;
    border-color: #ef444440;
  }
  .reject-btn:hover:not(:disabled) { background: #ef444430; }
  .accept-btn:disabled, .reject-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .reject-reason-form {
    width: 100%;
    margin-top: 6px;
  }
  .reject-reason-input {
    width: 100%;
    padding: 6px 8px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    font-family: inherit;
    resize: vertical;
    min-height: 40px;
  }
  .reject-reason-input:focus {
    outline: none;
    border-color: #ef4444;
  }
  .reject-reason-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 6px;
  }
  .cancel-btn {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #374151;
    background: #1f2937;
    color: #9ca3af;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cancel-btn:hover { background: #374151; }
  .confirm-reject-btn {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #ef444440;
    background: #ef444418;
    color: #ef4444;
    font-family: inherit;
    transition: background 0.15s;
  }
  .confirm-reject-btn:hover:not(:disabled) { background: #ef444430; }
  .confirm-reject-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .char-hint {
    display: block;
    font-size: 10px;
    color: #6b7280;
    margin-top: 3px;
  }
</style>
