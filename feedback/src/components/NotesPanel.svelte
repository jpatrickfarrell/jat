<script lang="ts">
  import type { AgentNote } from '../lib/types';
  import { fetchNotes, createNote, updateNote, deleteNote } from '../lib/api';
  import { slide } from 'svelte/transition';

  let {
    endpoint,
    project,
  }: {
    endpoint: string;
    project: string;
  } = $props();

  // State
  let notes = $state<AgentNote[]>([]);
  let loading = $state(false);
  let error = $state('');
  let saving = $state(false);

  // Current route from host page
  let currentRoute = $state(window.location.pathname);

  // View state: 'list' or 'edit'
  let view = $state<'list' | 'edit'>('list');
  let editingNote = $state<AgentNote | null>(null);
  let isNewNote = $state(false);
  let editTitle = $state('');
  let editContent = $state('');
  let editRoute = $state<string | null>(null);
  let previewMode = $state(false);
  let confirmDelete = $state(false);

  // Derived
  let siteNote = $derived(notes.find(n => n.route === null));
  let routeNotes = $derived(
    notes.filter(n => n.route !== null).sort((a, b) => (a.route || '').localeCompare(b.route || ''))
  );
  let currentRouteHasNote = $derived(notes.some(n => n.route === currentRoute));

  // Load notes
  async function loadNotes() {
    loading = true;
    error = '';
    const result = await fetchNotes(endpoint, project);
    notes = result.notes;
    if (result.error) error = result.error;
    loading = false;
  }

  // Load on mount
  $effect(() => {
    if (endpoint && project) {
      loadNotes();
    }
  });

  // Track route changes (SPA navigation)
  $effect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname !== currentRoute) {
        currentRoute = window.location.pathname;
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  function openEdit(note: AgentNote) {
    editingNote = note;
    isNewNote = false;
    editTitle = note.title;
    editContent = note.content;
    editRoute = note.route;
    previewMode = false;
    confirmDelete = false;
    view = 'edit';
  }

  function openNew(route: string | null) {
    editingNote = null;
    isNewNote = true;
    editTitle = route ? routeLabel(route) : 'Site-wide notes';
    editContent = '';
    editRoute = route;
    previewMode = false;
    confirmDelete = false;
    view = 'edit';
  }

  function goBack() {
    view = 'list';
    editingNote = null;
    isNewNote = false;
    confirmDelete = false;
  }

  async function handleSave() {
    if (!editTitle.trim()) return;
    saving = true;

    if (isNewNote) {
      const result = await createNote(endpoint, {
        project,
        route: editRoute,
        title: editTitle.trim(),
        content: editContent,
      });
      if (result.ok && result.note) {
        notes = [...notes, result.note];
        goBack();
      } else {
        error = result.error || 'Failed to create note';
      }
    } else if (editingNote) {
      const result = await updateNote(endpoint, editingNote.id, {
        title: editTitle.trim(),
        content: editContent,
      });
      if (result.ok) {
        notes = notes.map(n =>
          n.id === editingNote!.id ? { ...n, title: editTitle.trim(), content: editContent, updated_at: new Date().toISOString() } : n
        );
        goBack();
      } else {
        error = result.error || 'Failed to update note';
      }
    }
    saving = false;
  }

  async function handleDelete() {
    if (!editingNote) return;
    if (!confirmDelete) {
      confirmDelete = true;
      return;
    }
    saving = true;
    const result = await deleteNote(endpoint, editingNote.id);
    if (result.ok) {
      notes = notes.filter(n => n.id !== editingNote!.id);
      goBack();
    } else {
      error = result.error || 'Failed to delete note';
    }
    saving = false;
  }

  function routeLabel(route: string | null): string {
    return route || 'Site-wide';
  }

  function lineCount(content: string): number {
    if (!content) return 0;
    return content.split('\n').filter(l => l.trim()).length;
  }

  function renderMarkdown(text: string): string {
    if (!text) return '<span style="color:#6b7280;font-style:italic">No content</span>';
    // Escape HTML
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    // Code blocks (``` ... ```)
    html = html.replace(/```([^`]*?)```/gs, '<pre style="background:#1f2937;padding:8px;border-radius:4px;font-size:11px;overflow-x:auto;margin:4px 0">$1</pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:1px 4px;border-radius:3px;font-size:11px">$1</code>');
    // Headers
    html = html.replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:12px;color:#d1d5db">$1</strong>');
    html = html.replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:13px;color:#e5e7eb">$1</strong>');
    html = html.replace(/^# (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:14px;color:#f3f4f6">$1</strong>');
    // Bold & italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<span style="display:block;padding-left:12px">&#8226; $1</span>');
    // Ordered lists
    html = html.replace(/^(\d+)\. (.+)$/gm, '<span style="display:block;padding-left:12px">$1. $2</span>');
    // Newlines (but not inside pre blocks)
    html = html.replace(/\n(?!<)/g, '<br>');
    return html;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && view === 'edit') {
      e.stopPropagation();
      goBack();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="notes-panel" onkeydown={handleKeydown}>
  {#if view === 'list'}
    <div class="notes-list" transition:slide={{ duration: 200 }}>
      <div class="list-header">
        <span class="list-title">Notes</span>
        <button class="new-btn" onclick={() => openNew(null)} title="New site-wide note" disabled={!!siteNote}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          New
        </button>
      </div>

      {#if loading}
        <div class="loading">
          <span class="spinner"></span>
          Loading notes...
        </div>
      {:else if error}
        <div class="error-msg">
          {error}
          <button class="retry-btn" onclick={loadNotes}>Retry</button>
        </div>
      {:else}
        <!-- Site-wide note -->
        {#if siteNote}
          <button class="note-row site-note" onclick={() => openEdit(siteNote)}>
            <div class="note-row-left">
              <svg class="note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2" stroke="currentColor" stroke-width="1.8"/>
              </svg>
              <div class="note-info">
                <span class="note-name">{siteNote.title || 'Site-wide notes'}</span>
                <span class="note-preview">{lineCount(siteNote.content)} line{lineCount(siteNote.content) !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <span class="note-edit-hint">edit</span>
          </button>
        {:else}
          <button class="note-row site-note empty" onclick={() => openNew(null)}>
            <div class="note-row-left">
              <svg class="note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2" stroke="currentColor" stroke-width="1.8"/>
              </svg>
              <span class="note-name add-prompt">Add site-wide notes</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </button>
        {/if}

        <!-- Route divider -->
        {#if routeNotes.length > 0 || !currentRouteHasNote}
          <div class="section-divider">
            <span>Routes</span>
          </div>
        {/if}

        <!-- Route notes -->
        {#each routeNotes as note}
          <button
            class="note-row"
            class:current={note.route === currentRoute}
            onclick={() => openEdit(note)}
          >
            <div class="note-row-left">
              <svg class="note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="currentColor" stroke-width="1.8"/>
                <path d="M13 2v7h7" stroke="currentColor" stroke-width="1.8"/>
              </svg>
              <div class="note-info">
                <span class="note-name">
                  {note.route}
                  {#if note.route === currentRoute}
                    <span class="current-badge">current</span>
                  {/if}
                </span>
                <span class="note-preview">{lineCount(note.content)} line{lineCount(note.content) !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <span class="note-edit-hint">edit</span>
          </button>
        {/each}

        <!-- Quick-create for current route -->
        {#if !currentRouteHasNote}
          <button class="note-row add-route" onclick={() => openNew(currentRoute)}>
            <div class="note-row-left">
              <svg class="note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span class="note-name add-prompt">Add note for {currentRoute}</span>
            </div>
          </button>
        {/if}

        {#if notes.length === 0 && !loading}
          <div class="empty-state">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p>No notes yet</p>
            <p class="empty-hint">Notes give context to the page agent about your app</p>
          </div>
        {/if}
      {/if}
    </div>

  {:else if view === 'edit'}
    <div class="note-editor" transition:slide={{ duration: 200 }}>
      <div class="editor-header">
        <button class="back-btn" onclick={goBack} title="Back to list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="editor-route">{editRoute ? editRoute : 'Site-wide'}</span>
        <button
          class="preview-toggle"
          class:active={previewMode}
          onclick={() => previewMode = !previewMode}
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div class="editor-body">
        <div class="field">
          <label for="note-title">Title</label>
          <input
            id="note-title"
            type="text"
            bind:value={editTitle}
            placeholder="Note title"
            disabled={saving}
          />
        </div>

        {#if previewMode}
          <div class="preview-area">
            {@html renderMarkdown(editContent)}
          </div>
        {:else}
          <div class="field">
            <label for="note-content">Content <span class="label-hint">(markdown)</span></label>
            <textarea
              id="note-content"
              bind:value={editContent}
              placeholder="Describe this page/app for the agent...&#10;&#10;Supports **bold**, *italic*, # headers, - lists, `code`"
              rows="12"
              disabled={saving}
            ></textarea>
          </div>
        {/if}

        {#if error}
          <div class="error-msg compact">{error}</div>
        {/if}
      </div>

      <div class="editor-actions">
        {#if !isNewNote}
          <button
            class="delete-btn"
            class:confirm={confirmDelete}
            onclick={handleDelete}
            disabled={saving}
          >
            {confirmDelete ? 'Confirm delete?' : 'Delete'}
          </button>
        {/if}
        <div class="action-spacer"></div>
        <button class="cancel-btn" onclick={goBack} disabled={saving}>Cancel</button>
        <button class="save-btn" onclick={handleSave} disabled={saving || !editTitle.trim()}>
          {#if saving}
            <span class="spinner"></span>
          {/if}
          {isNewNote ? 'Create' : 'Save'}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .notes-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* List view */
  .notes-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 0;
  }
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid #1f2937;
  }
  .list-title {
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
  }
  .new-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }
  .new-btn:hover:not(:disabled) { background: #374151; }
  .new-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Note rows */
  .note-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 14px;
    background: none;
    border: none;
    border-bottom: 1px solid #1f293780;
    color: #e5e7eb;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .note-row:hover {
    background: #1f2937;
  }
  .note-row.current {
    background: rgba(59, 130, 246, 0.06);
    border-left: 2px solid #3b82f6;
  }
  .note-row.site-note {
    border-bottom: 1px solid #374151;
  }
  .note-row.empty {
    color: #6b7280;
  }
  .note-row.add-route {
    color: #6b7280;
    border-bottom: none;
  }
  .note-row-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }
  .note-icon {
    color: #6b7280;
    flex-shrink: 0;
  }
  .note-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .note-name {
    font-size: 12px;
    font-weight: 500;
    color: #e5e7eb;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .add-prompt {
    color: #6b7280;
    font-weight: 400;
  }
  .note-preview {
    font-size: 10px;
    color: #6b7280;
  }
  .note-edit-hint {
    font-size: 10px;
    color: #4b5563;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .note-row:hover .note-edit-hint {
    opacity: 1;
  }
  .current-badge {
    font-size: 9px;
    font-weight: 600;
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.12);
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .section-divider {
    padding: 8px 14px 4px;
    font-size: 10px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 32px 20px;
    color: #6b7280;
    text-align: center;
  }
  .empty-state p {
    margin: 0;
    font-size: 13px;
  }
  .empty-hint {
    font-size: 11px !important;
    color: #4b5563;
  }

  /* Editor view */
  .note-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .editor-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid #1f2937;
  }
  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .back-btn:hover {
    background: #1f2937;
    color: #e5e7eb;
  }
  .editor-route {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .preview-toggle {
    padding: 3px 10px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 4px;
    color: #9ca3af;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .preview-toggle:hover { color: #d1d5db; }
  .preview-toggle.active {
    background: #3b82f620;
    border-color: #3b82f6;
    color: #93c5fd;
  }

  .editor-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field label {
    font-weight: 600;
    font-size: 11px;
    color: #9ca3af;
  }
  .label-hint {
    font-weight: 400;
    color: #4b5563;
  }
  .field input {
    padding: 7px 10px;
    border: 1px solid #374151;
    border-radius: 5px;
    font-size: 13px;
    font-family: inherit;
    color: #e5e7eb;
    background: #1f2937;
    transition: border-color 0.15s;
  }
  .field input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .field input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .field textarea {
    padding: 8px 10px;
    border: 1px solid #374151;
    border-radius: 5px;
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
    color: #e5e7eb;
    background: #1f2937;
    resize: vertical;
    min-height: 200px;
    line-height: 1.5;
    transition: border-color 0.15s;
  }
  .field textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .field textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-area {
    flex: 1;
    padding: 10px 12px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    font-size: 12px;
    line-height: 1.6;
    color: #d1d5db;
    overflow-y: auto;
    min-height: 200px;
  }

  .editor-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-top: 1px solid #1f2937;
  }
  .action-spacer { flex: 1; }

  .delete-btn {
    padding: 6px 12px;
    background: none;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #6b7280;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .delete-btn:hover:not(:disabled) {
    color: #ef4444;
    border-color: #ef444480;
  }
  .delete-btn.confirm {
    color: #ef4444;
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }
  .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cancel-btn {
    padding: 6px 12px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cancel-btn:hover:not(:disabled) { background: #374151; }
  .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .save-btn {
    padding: 6px 14px;
    background: #3b82f6;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.15s;
  }
  .save-btn:hover:not(:disabled) { background: #2563eb; }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Shared */
  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 20px 14px;
    color: #9ca3af;
    font-size: 12px;
  }
  .error-msg {
    padding: 10px 14px;
    color: #ef4444;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .error-msg.compact {
    padding: 6px 0;
  }
  .retry-btn {
    padding: 3px 8px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 4px;
    color: #d1d5db;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
  }
  .retry-btn:hover { background: #374151; }

  .spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: notes-spin 0.6s linear infinite;
  }
  @keyframes notes-spin {
    to { transform: rotate(360deg); }
  }
</style>
