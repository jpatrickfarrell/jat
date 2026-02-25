<script lang="ts">
  import { respondToReport, type ReportSummary } from '../lib/api';

  let {
    endpoint,
    reports = $bindable<ReportSummary[]>([]),
    loading,
    error,
    onreload,
  }: {
    endpoint: string;
    reports: ReportSummary[];
    loading: boolean;
    error: string;
    onreload: () => void;
  } = $props();

  let expandedScreenshot = $state<string | null>(null);

  let respondingId = $state('');
  let rejectingId = $state('');
  let rejectReason = $state('');

  function startReject(reportId: string) {
    rejectingId = reportId;
    rejectReason = '';
  }

  function cancelReject() {
    rejectingId = '';
    rejectReason = '';
  }

  async function handleRespond(reportId: string, response: 'accepted' | 'rejected', reason?: string) {
    respondingId = reportId;
    const result = await respondToReport(endpoint, reportId, response, reason);
    if (result.ok) {
      reports = reports.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: response === 'rejected' ? 'rejected' : 'accepted',
            responded_at: new Date().toISOString(),
            ...(response === 'rejected' ? { revision_count: (r.revision_count || 0) + 1 } : {}),
          };
        }
        return r;
      });
      rejectingId = '';
      rejectReason = '';
    } else {
      // surface error briefly, then clear
      rejectingId = '';
    }
    respondingId = '';
  }

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      submitted: 'Submitted',
      in_progress: 'In Progress',
      completed: 'Completed',
      accepted: 'Accepted',
      rejected: 'Rejected',
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
      rejected: '#ef4444',
      wontfix: '#6b7280',
      closed: '#6b7280',
    };
    return colors[status] || '#6b7280';
  }

  function typeIcon(type: string): string {
    if (type === 'bug') return '🐛';
    if (type === 'enhancement') return '✨';
    return '📝';
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
      <div class="empty-icon">📋</div>
      <p>No requests yet</p>
      <p class="empty-sub">Submit feedback using the New Report tab</p>
    </div>
  {:else}
    <div class="reports">
      {#each reports as report (report.id)}
        <div class="report-card" class:awaiting={report.status === 'completed'}>
          <div class="report-header">
            <span class="report-type">{typeIcon(report.type)}</span>
            <span class="report-title">{report.title}</span>
            <span class="report-status" style="background: {statusColor(report.status)}20; color: {statusColor(report.status)}; border-color: {statusColor(report.status)}40;">
              {statusLabel(report.status)}
            </span>
          </div>

          {#if report.page_url}
            <a class="report-url" href={report.page_url} target="_blank" rel="noopener noreferrer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>{report.page_url.replace(/^https?:\/\//, '').split('?')[0]}</span>
            </a>
          {/if}

          {#if report.revision_count > 0 && report.status !== 'accepted'}
            <p class="revision-note">Revision {report.revision_count}</p>
          {/if}

          {#if report.description}
            <p class="report-desc">{report.description.length > 120 ? report.description.slice(0, 120) + '...' : report.description}</p>
          {/if}

          {#if report.screenshot_urls && report.screenshot_urls.length > 0}
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

          {#if report.dev_notes}
            <div class="dev-notes">
              <span class="dev-notes-label">Dev response:</span>
              <span>{report.dev_notes}</span>
            </div>
          {/if}

          <div class="report-footer">
            <span class="report-time">{timeAgo(report.created_at)}</span>

            {#if report.status === 'accepted'}
              <span class="status-pill accepted">✓ Accepted</span>
            {:else if report.status === 'rejected'}
              <span class="status-pill rejected">✗ Rejected</span>
            {:else if report.status === 'completed' || report.status === 'wontfix'}
              {#if rejectingId === report.id}
                <div class="reject-reason-form">
                  <textarea
                    class="reject-reason-input"
                    placeholder="Why are you rejecting? (min 10 characters)"
                    bind:value={rejectReason}
                    rows="2"
                  ></textarea>
                  <div class="reject-reason-actions">
                    <button class="cancel-btn" onclick={cancelReject}>Cancel</button>
                    <button
                      class="confirm-reject-btn"
                      disabled={rejectReason.trim().length < 10 || respondingId === report.id}
                      onclick={() => handleRespond(report.id, 'rejected', rejectReason.trim())}
                    >
                      {respondingId === report.id ? '...' : '✗ Reject'}
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
                    {respondingId === report.id ? '...' : '✓ Accept'}
                  </button>
                  <button
                    class="reject-btn"
                    disabled={respondingId === report.id}
                    onclick={() => startReject(report.id)}
                  >
                    ✗ Reject
                  </button>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .request-list {
    padding: 14px 16px;
    overflow-y: auto;
    max-height: 400px;
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
    gap: 8px;
  }
  .report-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 10px 12px;
    transition: border-color 0.15s;
  }
  .report-card.awaiting {
    border-color: #f59e0b40;
    box-shadow: 0 0 0 1px #f59e0b20;
  }
  .report-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .report-type {
    font-size: 14px;
    flex-shrink: 0;
  }
  .report-title {
    font-size: 13px;
    font-weight: 600;
    color: #f3f4f6;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .report-status {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 10px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .report-url {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 0;
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
  .dev-notes-label {
    font-weight: 600;
    color: #60a5fa;
    margin-right: 4px;
    font-size: 11px;
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
