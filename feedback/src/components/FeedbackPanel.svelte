<script lang="ts">
  import type { ConsoleLogEntry, ElementData, FeedbackReport } from '../lib/types';
  import { submitReport, fetchReports, type ReportSummary } from '../lib/api';
  import { enqueue } from '../lib/queue';
  import { captureViewport } from '../lib/screenshot';
  import { startElementPicker } from '../lib/elementPicker';
  import { getCapturedLogs } from '../lib/consoleCapture';
  import ScreenshotPreview from './ScreenshotPreview.svelte';
  import ConsoleLogList from './ConsoleLogList.svelte';
  import StatusToast from './StatusToast.svelte';
  import RequestList from './RequestList.svelte';

  let {
    endpoint,
    project,
    userId = '',
    userEmail = '',
    userName = '',
    userRole = '',
    orgId = '',
    orgName = '',
    onclose,
    ongrip,
  }: {
    endpoint: string;
    project: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    orgId?: string;
    orgName?: string;
    onclose: () => void;
    ongrip?: (e: MouseEvent) => void;
  } = $props();

  let activeTab = $state<'new' | 'requests'>('new');

  // Reports state — loaded eagerly so badge count is available before tab is clicked
  let reports = $state<ReportSummary[]>([]);
  let reportsLoading = $state(false);
  let reportsError = $state('');

  let pendingCount = $derived(reports.filter(r => r.status === 'completed').length);

  async function loadReports() {
    reportsLoading = true;
    reportsError = '';
    const result = await fetchReports(endpoint);
    reports = result.reports;
    if (result.error) reportsError = result.error;
    reportsLoading = false;
  }

  $effect(() => {
    loadReports();
  });

  let title = $state('');
  let description = $state('');
  let type = $state<'bug' | 'enhancement' | 'other'>('bug');
  let priority = $state<'low' | 'medium' | 'high' | 'critical'>('medium');

  let screenshots = $state<string[]>([]);
  let selectedElements = $state<ElementData[]>([]);
  let consoleLogs = $state<ConsoleLogEntry[]>([]);

  let submitting = $state(false);
  let capturing = $state(false);
  let picking = $state(false);

  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');
  let toastVisible = $state(false);

  function showToast(message: string, type: 'success' | 'error') {
    toastMessage = message;
    toastType = type;
    toastVisible = true;
    setTimeout(() => { toastVisible = false; }, 3000);
  }

  async function handleCapture() {
    capturing = true;
    try {
      const dataUrl = await captureViewport();
      screenshots = [...screenshots, dataUrl];
      showToast(`Screenshot captured (${screenshots.length})`, 'success');
    } catch (err) {
      console.error('[jat-feedback] Screenshot failed:', err);
      showToast('Screenshot failed: ' + (err instanceof Error ? err.message : 'unknown error'), 'error');
    } finally {
      capturing = false;
    }
  }

  function handleRemoveScreenshot(index: number) {
    screenshots = screenshots.filter((_, i) => i !== index);
  }

  function handlePickElement() {
    picking = true;
    startElementPicker((data) => {
      selectedElements = [...selectedElements, data];
      picking = false;
      showToast(`Element captured: <${data.tagName.toLowerCase()}>`, 'success');
    });
  }

  function refreshLogs() {
    consoleLogs = getCapturedLogs();
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    submitting = true;

    // Refresh logs right before submit
    refreshLogs();

    // Build metadata with reporter/org context if available
    const metadata: FeedbackReport['metadata'] = {};
    if (userId || userEmail || userName || userRole) {
      metadata.reporter = {};
      if (userId) metadata.reporter.userId = userId;
      if (userEmail) metadata.reporter.email = userEmail;
      if (userName) metadata.reporter.name = userName;
      if (userRole) metadata.reporter.role = userRole;
    }
    if (orgId || orgName) {
      metadata.organization = {};
      if (orgId) metadata.organization.id = orgId;
      if (orgName) metadata.organization.name = orgName;
    }

    const report: FeedbackReport = {
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      project: project || '',
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: consoleLogs.length > 0 ? consoleLogs : null,
      selected_elements: selectedElements.length > 0 ? selectedElements : null,
      screenshots: screenshots.length > 0 ? screenshots : null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    };

    try {
      const result = await submitReport(endpoint, report);
      if (result.ok) {
        showToast(`Report submitted (${result.id})`, 'success');
        resetForm();
        // Switch to requests tab to show the new report (reload first to include it)
        setTimeout(() => { loadReports(); activeTab = 'requests'; }, 1200);
      } else {
        // Queue for retry
        enqueue(endpoint, report);
        showToast('Queued for retry (endpoint unreachable)', 'error');
      }
    } catch {
      enqueue(endpoint, report);
      showToast('Queued for retry (endpoint unreachable)', 'error');
    } finally {
      submitting = false;
    }
  }

  function resetForm() {
    title = '';
    description = '';
    type = 'bug';
    priority = 'medium';
    screenshots = [];
    selectedElements = [];
    consoleLogs = [];
  }

  // Grab initial logs on mount
  $effect(() => {
    refreshLogs();
  });

  const typeOptions = [
    { value: 'bug', label: 'Bug' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'other', label: 'Other' },
  ] as const;

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ] as const;

  function attachmentCount(): number {
    return screenshots.length + selectedElements.length;
  }
</script>

<div class="panel">
  <div class="panel-header">
    {#if ongrip}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="drag-handle" onmousedown={ongrip}>
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          <circle cx="3" cy="3" r="1.5" fill="currentColor"/>
          <circle cx="7" cy="3" r="1.5" fill="currentColor"/>
          <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="3" cy="13" r="1.5" fill="currentColor"/>
          <circle cx="7" cy="13" r="1.5" fill="currentColor"/>
        </svg>
      </div>
    {/if}
    <div class="tabs">
      <button class="tab" class:active={activeTab === 'new'} onclick={() => activeTab = 'new'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        New Report
      </button>
      <button class="tab" class:active={activeTab === 'requests'} onclick={() => activeTab = 'requests'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        My Requests
        {#if pendingCount > 0}
          <span class="tab-badge">{pendingCount}</span>
        {/if}
      </button>
    </div>
    <button class="close-btn" onclick={onclose} aria-label="Close">&times;</button>
  </div>

  {#if activeTab === 'new'}
    <form class="panel-body" onsubmit={handleSubmit}>
      <div class="field">
        <label for="jat-fb-title">Title <span class="req">*</span></label>
        <input id="jat-fb-title" type="text" bind:value={title} placeholder="Brief description" required disabled={submitting} />
      </div>

      <div class="field">
        <label for="jat-fb-desc">Description</label>
        <textarea id="jat-fb-desc" bind:value={description} placeholder="Steps to reproduce, expected vs actual..." rows="3" disabled={submitting}></textarea>
      </div>

      <div class="field-row">
        <div class="field half">
          <label for="jat-fb-type">Type</label>
          <select id="jat-fb-type" bind:value={type} disabled={submitting}>
            {#each typeOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
        <div class="field half">
          <label for="jat-fb-priority">Priority</label>
          <select id="jat-fb-priority" bind:value={priority} disabled={submitting}>
            {#each priorityOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="tools">
        <ScreenshotPreview {screenshots} {capturing} oncapture={handleCapture} onremove={handleRemoveScreenshot} />

        <button type="button" class="tool-btn" onclick={handlePickElement} disabled={picking}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {#if picking}
            Click an element...
          {:else}
            Pick Element{#if selectedElements.length > 0} <span class="tool-count">{selectedElements.length}</span>{/if}
          {/if}
        </button>
      </div>

      {#if selectedElements.length > 0}
        <div class="elements-list">
          {#each selectedElements as el, i}
            <div class="element-item">
              <span class="element-tag">&lt;{el.tagName.toLowerCase()}&gt;</span>
              <span class="element-text">{el.textContent?.substring(0, 40) || el.selector}</span>
              <button class="element-remove" onclick={() => { selectedElements = selectedElements.filter((_, idx) => idx !== i); }} aria-label="Remove">&times;</button>
            </div>
          {/each}
        </div>
      {/if}

      <ConsoleLogList logs={consoleLogs} />

      {#if attachmentCount() > 0}
        <div class="attach-summary">
          {attachmentCount()} attachment{attachmentCount() > 1 ? 's' : ''} will be included
        </div>
      {/if}

      <div class="actions">
        <button type="button" class="cancel-btn" onclick={onclose} disabled={submitting}>Cancel</button>
        <button type="submit" class="submit-btn" disabled={submitting || !title.trim()}>
          {#if submitting}
            <span class="spinner"></span>
            Submitting...
          {:else}
            Submit
          {/if}
        </button>
      </div>
    </form>
  {:else}
    <RequestList
      {endpoint}
      bind:reports
      loading={reportsLoading}
      error={reportsError}
      onreload={loadReports}
    />
  {/if}

  <StatusToast message={toastMessage} type={toastType} visible={toastVisible} />
</div>

<style>
  .panel {
    width: 380px;
    max-height: 702px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #e5e7eb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 0;
    border-bottom: 1px solid #1f2937;
  }
  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    padding: 0 2px 0 8px;
    color: #6b7280;
    cursor: grab;
    flex-shrink: 0;
    user-select: none;
    transition: color 0.15s;
  }
  .drag-handle:hover {
    color: #d1d5db;
  }
  .drag-handle:active {
    cursor: grabbing;
    color: #e5e7eb;
  }
  .tabs {
    display: flex;
    flex: 1;
  }
  .tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 11px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .tab:hover { color: #d1d5db; }
  .tab.active {
    color: #f9fafb;
    border-bottom-color: #3b82f6;
  }
  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: #f59e0b;
    color: #111827;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }
  .close-btn {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    flex-shrink: 0;
  }
  .close-btn:hover { color: #e5e7eb; }

  .panel-body {
    padding: 14px 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field-row {
    display: flex;
    gap: 10px;
  }
  .half { flex: 1; }

  label {
    font-weight: 600;
    font-size: 12px;
    color: #9ca3af;
  }
  .req { color: #ef4444; }

  input, textarea, select {
    padding: 7px 10px;
    border: 1px solid #374151;
    border-radius: 5px;
    font-size: 13px;
    font-family: inherit;
    color: #e5e7eb;
    background: #1f2937;
    transition: border-color 0.15s;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  input:disabled, textarea:disabled, select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  textarea {
    resize: vertical;
    min-height: 48px;
  }
  select {
    appearance: auto;
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .tool-btn:hover { background: #374151; }

  .tool-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #3b82f6;
    color: white;
    font-size: 10px;
    font-weight: 700;
    margin-left: 2px;
  }
  .elements-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .element-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: #1e3a5f;
    border: 1px solid #2563eb40;
    border-radius: 5px;
    font-size: 11px;
    color: #93c5fd;
  }
  .element-tag {
    font-family: monospace;
    font-weight: 600;
    color: #60a5fa;
    flex-shrink: 0;
  }
  .element-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #9ca3af;
  }
  .element-remove {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 14px;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
  }
  .element-remove:hover { color: #ef4444; }
  .attach-summary {
    font-size: 11px;
    color: #6b7280;
    text-align: center;
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 4px;
  }
  .cancel-btn {
    padding: 7px 14px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
  }
  .cancel-btn:hover:not(:disabled) { background: #374151; }
  .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .submit-btn {
    padding: 7px 16px;
    background: #3b82f6;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    transition: background 0.15s;
  }
  .submit-btn:hover:not(:disabled) { background: #2563eb; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
