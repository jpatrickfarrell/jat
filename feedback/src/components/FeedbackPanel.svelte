<script lang="ts">
  import type { ConsoleLogEntry, NetworkRequestEntry, ElementData, FileAttachment, FeedbackReport, ToolDefinition } from '../lib/types';
  import { submitReport, uploadRecording, fetchReports, type ReportSummary } from '../lib/api';
  import { enqueue } from '../lib/queue';
  import { captureViewport, captureViewportQuick } from '../lib/screenshot';
  import { startElementPicker } from '../lib/elementPicker';
  import { getCapturedLogs } from '../lib/consoleCapture';
  import { getCapturedRequests } from '../lib/networkCapture';
  import { startRecording, stopRecording, isRecording } from '../lib/sessionRecorder';
  import { slide } from 'svelte/transition';
  import ScreenshotPreview from './ScreenshotPreview.svelte';
  import AnnotationEditor from './AnnotationEditor.svelte';
  import ConsoleLogList from './ConsoleLogList.svelte';
  import StatusToast from './StatusToast.svelte';
  import RequestList from './RequestList.svelte';
  import AgentPanel from './AgentPanel.svelte';
  import NotesPanel from './NotesPanel.svelte';
  import type { ChatMessage, AgentState } from '../lib/types';
  import { AgentBridge, type ReportContext } from '../lib/agentBridge';
  import { onDestroy } from 'svelte';

  declare const __JAT_FEEDBACK_VERSION__: string;
  const version = __JAT_FEEDBACK_VERSION__;

  let {
    endpoint,
    project,
    isOpen = false,
    userId = '',
    userEmail = '',
    userName = '',
    userRole = '',
    orgId = '',
    orgName = '',
    onclose,
    ongrip,
    agentProxy = '',
    agentModel = '',
    agentContext = '',
    registeredTools = [],
    supabaseUrl = '',
    supabaseAnonKey = '',
  }: {
    endpoint: string;
    project: string;
    isOpen?: boolean;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    orgId?: string;
    orgName?: string;
    agentProxy?: string;
    agentModel?: string;
    agentContext?: string;
    registeredTools?: ToolDefinition[];
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    onclose: () => void;
    ongrip?: (e: MouseEvent) => void;
  } = $props();

  let activeTab = $state<'new' | 'requests' | 'agent' | 'notes' | 'voice'>('new');

  // Lazy init: don't mount AgentPanel/NotesPanel until user first opens the tab
  let agentTabOpened = $state(false);
  let notesTabOpened = $state(false);

  // === Session recording state ===
  let sessionRecording = $state(false);
  let recordedEvents = $state<unknown[]>([]);

  function handleToggleRecording() {
    if (sessionRecording) {
      const events = stopRecording();
      recordedEvents = events;
      sessionRecording = false;
      showToast(`Session recorded (${events.length} events)`, 'success');
    } else {
      startRecording();
      recordedEvents = [];
      sessionRecording = true;
      showToast('Recording session...', 'info');
    }
  }

  // === Voice capture state machine ===
  // States: idle → recording → uploading → transcribing → confirming → submitted | error
  let voiceStatus = $state<'idle' | 'recording' | 'uploading' | 'transcribing' | 'confirming' | 'submitted' | 'error'>('idle');
  let voiceStatusMsg = $state('');
  let voiceMediaRecorder = $state<MediaRecorder | null>(null);
  let voiceChunks: Blob[] = [];
  let voiceTaskId = $state<string | null>(null);
  let voiceTitle = $state('');
  let voiceDescription = $state('');
  // Multi-task review state
  let voiceTasks = $state<{title: string, description: string}[]>([]);
  let voiceTaskIndex = $state(0);
  // Watcher cleanup handles
  let voiceTranscribeTimer: ReturnType<typeof setTimeout> | null = null;
  let voiceRealtimeWs: WebSocket | null = null;
  let voicePollTimer: ReturnType<typeof setInterval> | null = null;

  function cleanupVoiceWatchers() {
    if (voiceTranscribeTimer) { clearTimeout(voiceTranscribeTimer); voiceTranscribeTimer = null; }
    if (voiceRealtimeWs) { try { voiceRealtimeWs.close(); } catch {} voiceRealtimeWs = null; }
    if (voicePollTimer) { clearInterval(voicePollTimer); voicePollTimer = null; }
  }

  function onTranscriptionComplete(tasks: {title: string, description: string}[]) {
    cleanupVoiceWatchers();
    voiceTasks = tasks.filter(t => t.title || t.description);
    if (voiceTasks.length === 0) voiceTasks = [{ title: '', description: '' }];
    voiceTaskIndex = 0;
    voiceTitle = voiceTasks[0].title || '';
    voiceDescription = voiceTasks[0].description || '';
    voiceStatus = 'confirming';
    voiceStatusMsg = '';
  }

  function onTranscriptionFailed(msg = 'Transcription failed. Try again.') {
    cleanupVoiceWatchers();
    voiceStatus = 'error';
    voiceStatusMsg = msg;
  }

  /** Save edits to current task slot and advance to next, or finish. */
  function advanceVoiceTask() {
    // Persist edits for current task
    voiceTasks = voiceTasks.map((t, i) =>
      i === voiceTaskIndex ? { title: voiceTitle, description: voiceDescription } : t
    );
    if (voiceTaskIndex < voiceTasks.length - 1) {
      voiceTaskIndex++;
      voiceTitle = voiceTasks[voiceTaskIndex].title || '';
      voiceDescription = voiceTasks[voiceTaskIndex].description || '';
      voiceStatus = 'confirming';
    } else {
      voiceStatus = 'submitted';
      voiceStatusMsg = '';
      setTimeout(() => { activeTab = 'requests'; loadReports(); }, 1500);
    }
  }

  /** Skip current task without submitting, advance to next or discard. */
  function skipVoiceTask() {
    if (voiceTaskIndex < voiceTasks.length - 1) {
      voiceTaskIndex++;
      voiceTitle = voiceTasks[voiceTaskIndex].title || '';
      voiceDescription = voiceTasks[voiceTaskIndex].description || '';
    } else {
      resetVoice();
    }
  }

  function startRealtimeWatch(taskId: string) {
    const base = supabaseUrl.replace(/\/$/, '');
    const wsUrl = base.replace(/^https/, 'wss').replace(/^http/, 'ws') +
      `/realtime/v1/websocket?apikey=${supabaseAnonKey}&vsn=1.0.0`;

    let ws: WebSocket;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let refCounter = 1;
    function getRef() { return String(refCounter++); }

    try {
      ws = new WebSocket(wsUrl);
    } catch {
      startPollingWatch(taskId);
      return;
    }
    voiceRealtimeWs = ws;

    ws.onopen = () => {
      const joinRef = getRef();
      ws.send(JSON.stringify({
        topic: 'realtime:*',
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { self: false },
            presence: { key: '' },
            postgres_changes: [
              { event: 'UPDATE', schema: 'public', table: 'project_tasks', filter: `id=eq.${taskId}` }
            ]
          },
          access_token: supabaseAnonKey
        },
        ref: joinRef,
        join_ref: joinRef
      }));
      heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: getRef() }));
        }
      }, 30_000);
    };

    ws.onmessage = async (e) => {
      let msg: any;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.event === 'postgres_changes' && msg.payload?.data) {
        const { type, record } = msg.payload.data;
        if (type === 'UPDATE' && record) {
          if (record.status === 'open') {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            onTranscriptionComplete([{ title: record.title || '', description: record.description || '' }]);
          } else if (record.status === 'voice_split') {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            // Fetch all child tasks by ID
            try {
              const taskIds: string[] = JSON.parse(record.description || '{}').taskIds || [];
              if (taskIds.length > 0) {
                const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/project_tasks?id=in.(${taskIds.join(',')})&select=id,title,description&order=created_at`;
                const res = await fetch(url, {
                  headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
                });
                if (res.ok) {
                  const rows = await res.json();
                  onTranscriptionComplete(rows.map((r: any) => ({ title: r.title || '', description: r.description || '' })));
                  return;
                }
              }
            } catch {}
            onTranscriptionComplete([{ title: record.title || '', description: '' }]);
          } else if (record.status === 'failed') {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            onTranscriptionFailed('Transcription failed. Try again.');
          }
        }
      }
    };

    ws.onerror = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      voiceRealtimeWs = null;
      // Fall back to polling if Realtime errors out
      startPollingWatch(taskId);
    };

    ws.onclose = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    };
  }

  function startPollingWatch(taskId: string) {
    if (voicePollTimer) return; // already polling
    voicePollTimer = setInterval(async () => {
      try {
        let status: string | null = null;
        let title = '';
        let desc = '';
        let pollTasks: {title: string, description: string}[] = [];

        if (supabaseUrl && supabaseAnonKey) {
          // Poll Supabase REST API directly
          const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/project_tasks?id=eq.${taskId}&select=id,status,title,description`;
          const res = await fetch(url, {
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          });
          if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows) && rows.length > 0) {
              status = rows[0].status;
              title = rows[0].title || '';
              desc = rows[0].description || '';
              if (status === 'voice_split') {
                // Fetch all child tasks by ID
                try {
                  const taskIds: string[] = JSON.parse(desc || '{}').taskIds || [];
                  if (taskIds.length > 0) {
                    const childUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/project_tasks?id=in.(${taskIds.join(',')})&select=id,title,description&order=created_at`;
                    const childRes = await fetch(childUrl, {
                      headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
                    });
                    if (childRes.ok) {
                      const childRows = await childRes.json();
                      pollTasks = childRows.map((r: any) => ({ title: r.title || '', description: r.description || '' }));
                    }
                  }
                } catch {}
              }
            }
          }
        } else {
          // Poll JAT server endpoint
          const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/tasks/voice?id=${encodeURIComponent(taskId)}`);
          if (res.ok) {
            const data = await res.json();
            status = data.status;
            // Use tasks array if present (multi-task), fall back to single title/description
            if (Array.isArray(data.tasks) && data.tasks.length > 0) {
              pollTasks = data.tasks;
            } else {
              title = data.title || ''; desc = data.description || '';
            }
          }
        }

        if (status === 'open' || status === 'voice_split') {
          clearInterval(voicePollTimer!); voicePollTimer = null;
          const tasksToUse = pollTasks.length > 0 ? pollTasks : [{ title, description: desc }];
          onTranscriptionComplete(tasksToUse);
        } else if (status === 'failed') {
          clearInterval(voicePollTimer!); voicePollTimer = null;
          onTranscriptionFailed('Transcription failed. Try again.');
        }
      } catch {
        // ignore poll errors — keep trying
      }
    }, 3000);
  }

  function startTranscriptionWatch(taskId: string) {
    // 30s client-side timeout
    voiceTranscribeTimer = setTimeout(() => {
      cleanupVoiceWatchers();
      voiceStatus = 'error';
      voiceStatusMsg = 'Transcription timed out (30s). Try again.';
    }, 30_000);

    if (supabaseUrl && supabaseAnonKey) {
      startRealtimeWatch(taskId);
    } else {
      startPollingWatch(taskId);
    }
  }

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType });
      voiceChunks = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) voiceChunks.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        submitVoiceRecording(new Blob(voiceChunks, { type: mimeType }), mimeType);
      };
      mr.start(500);
      voiceMediaRecorder = mr;
      voiceStatus = 'recording';
      voiceStatusMsg = '';
    } catch (err: any) {
      voiceStatus = 'error';
      voiceStatusMsg = err.message?.includes('Permission') ? 'Microphone permission denied' : 'Could not start recording';
    }
  }

  function stopVoiceRecording() {
    if (voiceMediaRecorder && voiceMediaRecorder.state !== 'inactive') {
      voiceMediaRecorder.stop();
    }
    voiceMediaRecorder = null;
    voiceStatus = 'uploading';
    voiceStatusMsg = '';
  }

  async function submitVoiceRecording(blob: Blob, mimeType: string) {
    voiceStatus = 'uploading';
    try {
      const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('ogg') ? 'ogg' : 'audio';
      const formData = new FormData();
      formData.append('audio', blob, `voice-note.${ext}`);
      if (project) formData.append('project', project);
      if (userId) formData.append('user_id', userId);

      const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/tasks/voice`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const taskId = data.id;
        if (!taskId) throw new Error('No task ID returned from server');
        voiceTaskId = taskId;
        voiceStatus = 'transcribing';
        voiceStatusMsg = '';
        startTranscriptionWatch(taskId);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || `Upload failed (${res.status})`);
      }
    } catch (err: any) {
      voiceStatus = 'error';
      voiceStatusMsg = err.message || 'Failed to upload recording';
    } finally {
      voiceChunks = [];
    }
  }

  async function confirmVoiceNote() {
    if (!voiceTaskId) return;
    voiceStatus = 'uploading'; // reuse as "submitting" indicator
    voiceStatusMsg = '';
    try {
      if (supabaseUrl && supabaseAnonKey) {
        const res = await fetch(
          `${supabaseUrl.replace(/\/$/, '')}/rest/v1/project_tasks?id=eq.${voiceTaskId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ title: voiceTitle, description: voiceDescription, status: 'submitted' })
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        const res = await fetch(
          `${endpoint.replace(/\/$/, '')}/api/tasks/voice?id=${encodeURIComponent(voiceTaskId)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: voiceTitle, description: voiceDescription, status: 'submitted' })
          }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
      }
      // Advance to next task or finish
      advanceVoiceTask();
    } catch (err: any) {
      // Return to confirming so user can retry
      voiceStatus = 'confirming';
      voiceStatusMsg = err.message || 'Failed to submit. Please try again.';
    }
  }

  function resetVoice() {
    cleanupVoiceWatchers();
    if (voiceMediaRecorder && voiceMediaRecorder.state !== 'inactive') {
      voiceMediaRecorder.stop();
    }
    voiceMediaRecorder = null;
    voiceStatus = 'idle';
    voiceStatusMsg = '';
    voiceChunks = [];
    voiceTaskId = null;
    voiceTitle = '';
    voiceDescription = '';
    voiceTasks = [];
    voiceTaskIndex = 0;
  }

  // Agent state — managed by AgentBridge, fed to AgentPanel as props
  let agentMessages = $state<ChatMessage[]>([]);
  let agentState = $state<AgentState>('idle');
  let agentStep = $state(0);
  let agentAutoApprove = $state(false);
  let bridge = $state<AgentBridge | null>(null);

  function getAgentBridge(): AgentBridge {
    if (!bridge) {
      bridge = new AgentBridge({
        proxyUrl: agentProxy,
        model: agentModel || undefined,
        maxSteps: 20,
        appContext: agentContext || undefined,
        endpoint,
        project,
        registeredTools,
        onMessagesChange: (msgs) => { agentMessages = msgs; },
        onStateChange: (state, step) => { agentState = state; agentStep = step; },
      });
    }
    return bridge;
  }

  /** Called by NotesPanel when user edits notes — invalidates agent's cached context */
  function handleNotesChanged() {
    bridge?.invalidateNotesCache();
  }

  // Initialize bridge on first agent tab open
  $effect(() => {
    if (activeTab === 'agent' && !agentTabOpened) {
      agentTabOpened = true;
    }
  });

  // Initialize notes on first tab open
  $effect(() => {
    if (activeTab === 'notes' && !notesTabOpened) {
      notesTabOpened = true;
    }
  });

  function handleAgentSend(text: string) {
    getAgentBridge().execute(text);
  }

  function handleAgentStop() {
    bridge?.stop();
  }

  function handleAgentApprove(messageId: string) {
    bridge?.approve(messageId);
  }

  function handleAgentSkip(messageId: string) {
    bridge?.skip(messageId);
  }

  function handleAutoApproveChange(value: boolean) {
    agentAutoApprove = value;
    if (bridge) bridge.autoApprove = value;
  }

  onDestroy(() => {
    bridge?.dispose();
    cleanupVoiceWatchers();
    if (voiceMediaRecorder && voiceMediaRecorder.state !== 'inactive') {
      voiceMediaRecorder.stop();
    }
  });

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
    if (endpoint) {
      loadReports();
    }
  });

  let title = $state('');
  let description = $state('');
  let type = $state<'bug' | 'enhancement' | 'other'>('bug');
  let priority = $state<'low' | 'medium' | 'high' | 'critical'>('medium');

  let screenshots = $state<string[]>([]);
  let attachments = $state<FileAttachment[]>([]);
  let selectedElements = $state<ElementData[]>([]);
  let consoleLogs = $state<ConsoleLogEntry[]>([]);
  let networkRequests = $state<NetworkRequestEntry[]>([]);

  let fileInput = $state<HTMLInputElement | undefined>();

  const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

  function handleFileUpload() {
    fileInput?.click();
  }

  async function handleFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        const dataUrl = await readFileAsDataUrl(file);

        if (IMAGE_TYPES.includes(file.type)) {
          // Images go into screenshots array
          screenshots = [...screenshots, dataUrl];
          showToast(`Image added: ${file.name}`, 'success');
        } else {
          // Non-image files go into attachments
          attachments = [...attachments, {
            name: file.name,
            type: file.type || 'application/octet-stream',
            data: dataUrl,
            size: file.size,
          }];
          showToast(`File attached: ${file.name}`, 'success');
        }
      } catch (err) {
        showToast(`Failed to read: ${file.name}`, 'error');
      }
    }

    // Reset input so the same file can be re-selected
    input.value = '';
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function handleRemoveAttachment(index: number) {
    attachments = attachments.filter((_, i) => i !== index);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  let submitting = $state(false);
  let capturing = $state(false);
  let picking = $state(false);
  let lastSubmittedId = $state<string | null>(null);
  let lastHadRecording = $state(false);

  // Annotation editor state
  let editingScreenshotIndex = $state<number | null>(null);
  let pendingScreenshotDataUrl = $state('');

  // Auto-capture on open: screenshot in bg + focus title
  let titleInput = $state<HTMLInputElement | undefined>();
  let wasOpen = false;
  $effect(() => {
    if (isOpen && !wasOpen) {
      // Just opened — focus title after layout settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          titleInput?.focus();
        });
      });
      if (activeTab === 'new') {
        // Always capture fresh screenshot on open so it reflects current page state
        setTimeout(() => {
          captureViewportQuick().then((dataUrl) => {
            if (screenshots.length === 0) {
              screenshots = [dataUrl];
            } else {
              // Replace the first (auto-captured) screenshot with fresh one
              screenshots = [dataUrl, ...screenshots.slice(1)];
            }
          }).catch(() => {});
        }, 300);
      }
    }
    wasOpen = isOpen;
  });

  let toastMessage = $state('');
  let toastType = $state<'success' | 'error' | 'info'>('success');
  let toastVisible = $state(false);

  function showToast(message: string, type: 'success' | 'error' | 'info') {
    toastMessage = message;
    toastType = type;
    toastVisible = true;
    setTimeout(() => { toastVisible = false; }, 3000);
  }

  async function handleCapture() {
    capturing = true;
    try {
      const dataUrl = await captureViewport();
      // Open annotation editor instead of immediately appending
      pendingScreenshotDataUrl = dataUrl;
      editingScreenshotIndex = screenshots.length; // new index (not yet in array)
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

  function handleEditScreenshot(index: number) {
    pendingScreenshotDataUrl = screenshots[index];
    editingScreenshotIndex = index;
  }

  function handleAnnotationSave(dataUrl: string) {
    if (editingScreenshotIndex !== null) {
      if (editingScreenshotIndex >= screenshots.length) {
        // New capture — append
        screenshots = [...screenshots, dataUrl];
        showToast(`Screenshot captured (${screenshots.length})`, 'success');
      } else {
        // Editing existing — replace
        screenshots = screenshots.map((s, i) => i === editingScreenshotIndex ? dataUrl : s);
        showToast('Screenshot updated', 'success');
      }
    }
    editingScreenshotIndex = null;
    pendingScreenshotDataUrl = '';
  }

  function handleAnnotationCancel() {
    if (editingScreenshotIndex !== null && editingScreenshotIndex >= screenshots.length) {
      // New capture cancelled — still append the unannotated original
      screenshots = [...screenshots, pendingScreenshotDataUrl];
      showToast(`Screenshot captured (${screenshots.length})`, 'success');
    }
    editingScreenshotIndex = null;
    pendingScreenshotDataUrl = '';
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
    networkRequests = getCapturedRequests();
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

    // Auto-stop recording if user submits while still recording
    if (sessionRecording) {
      const events = stopRecording();
      recordedEvents = events;
      sessionRecording = false;
    }

    // Upload recording events separately if present, get back URL
    let recording_url: string | undefined;
    if (recordedEvents.length > 0) {
      const reportId = crypto.randomUUID();
      const uploadResult = await uploadRecording(endpoint, recordedEvents, reportId);
      if (uploadResult.ok && uploadResult.recording_url) {
        recording_url = uploadResult.recording_url;
      }
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
      network_requests: networkRequests.length > 0 ? networkRequests : null,
      selected_elements: selectedElements.length > 0 ? selectedElements : null,
      recording_events: null,
      screenshots: screenshots.length > 0 ? screenshots : null,
      attachments: attachments.length > 0 ? attachments : null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      recording_url: recording_url || null,
    };

    try {
      const result = await submitReport(endpoint, report);
      if (result.ok) {
        // Pass report context to agent bridge so recording summary is available
        if (report.recording_url) {
          const ctx: ReportContext = {
            recording_url: report.recording_url,
            console_logs: report.console_logs,
            network_requests: report.network_requests,
          };
          getAgentBridge().setReportContext(ctx);
        }

        lastSubmittedId = result.id;
        lastHadRecording = !!report.recording_url;
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
    attachments = [];
    selectedElements = [];
    consoleLogs = [];
    networkRequests = [];
    recordedEvents = [];
    if (sessionRecording) {
      stopRecording();
      sessionRecording = false;
    }
  }

  // Grab initial logs on mount
  $effect(() => {
    refreshLogs();
  });

  // Stop keyboard events from bubbling out of the widget to the host app.
  // Without this, typing in the title/description fields leaks keydown events
  // through the shadow DOM boundary, triggering host-app keyboard shortcuts.
  function containKeyboard(e: KeyboardEvent) {
    e.stopPropagation();
  }

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
    return screenshots.length + attachments.length + selectedElements.length;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="panel" onkeydown={containKeyboard} onkeyup={containKeyboard} onkeypress={containKeyboard}>
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
        New
      </button>
      <button class="tab" class:active={activeTab === 'requests'} onclick={() => activeTab = 'requests'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        History
        {#if pendingCount > 0}
          <span class="tab-badge">{pendingCount}</span>
        {/if}
      </button>
      {#if agentProxy}
        <button class="tab" class:active={activeTab === 'agent'} onclick={() => { activeTab = 'agent'; agentTabOpened = true; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
            <path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Agent
        </button>
      {/if}
      <button class="tab" class:active={activeTab === 'notes'} onclick={() => { activeTab = 'notes'; notesTabOpened = true; }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.8"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        Notes
      </button>
      <button class="tab" class:active={activeTab === 'voice'} onclick={() => activeTab = 'voice'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>
        </svg>
        Voice
      </button>
    </div>
    <button class="close-btn" onclick={onclose} aria-label="Close">&times;</button>
  </div>

  {#if activeTab === 'new'}
    <form class="panel-body" transition:slide={{ duration: 200 }} onsubmit={handleSubmit}>
      <div class="field">
        <label for="jat-fb-title">Title <span class="req">*</span></label>
        <input id="jat-fb-title" type="text" bind:value={title} bind:this={titleInput} placeholder="Brief description" required disabled={submitting} />
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
        <div class="tool-buttons">
          <button type="button" class="tool-btn" onclick={handleCapture} disabled={capturing}>
            {#if capturing}
              <span class="capture-spinner"></span>
              Capturing...
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Screenshot{#if screenshots.length > 0} <span class="tool-count">{screenshots.length}</span>{/if}
            {/if}
          </button>

          <button type="button" class="tool-btn" onclick={handlePickElement} disabled={picking}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {#if picking}
              Click an element...
            {:else}
              Pick{#if selectedElements.length > 0} <span class="tool-count">{selectedElements.length}</span>{/if}
            {/if}
          </button>

          <button type="button" class="tool-btn" class:recording-active={sessionRecording} onclick={handleToggleRecording} disabled={submitting}>
            {#if sessionRecording}
              <span class="recording-pulse"></span>
              Stop
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
              </svg>
              Record{#if recordedEvents.length > 0} <span class="tool-count">{recordedEvents.length}</span>{/if}
            {/if}
          </button>

          <button type="button" class="tool-btn" onclick={handleFileUpload} disabled={submitting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Upload{#if attachments.length > 0} <span class="tool-count">{attachments.length}</span>{/if}
          </button>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.md,.txt,.pdf,.doc,.docx,.csv,.json,.xml,.html,.log"
            bind:this={fileInput}
            onchange={handleFilesSelected}
            style="display:none"
          />
        </div>

        <ScreenshotPreview {screenshots} {capturing} oncapture={handleCapture} onremove={handleRemoveScreenshot} onedit={handleEditScreenshot} />
      </div>

      {#if attachments.length > 0}
        <div class="attachments-list">
          {#each attachments as file, i}
            <div class="attachment-item">
              <span class="attachment-icon">
                {#if file.type.includes('pdf')}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"/></svg>
                {:else if file.type.includes('markdown') || file.name.endsWith('.md')}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 15V9l3 4 3-4v6M17 12h-3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {:else}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"/></svg>
                {/if}
              </span>
              <span class="attachment-name">{file.name}</span>
              <span class="attachment-size">{formatFileSize(file.size)}</span>
              <button class="attachment-remove" onclick={() => handleRemoveAttachment(i)} aria-label="Remove">&times;</button>
            </div>
          {/each}
        </div>
      {/if}

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
        <span class="panel-version">v{version}</span>
        <button type="button" class="cancel-btn" onclick={onclose} disabled={submitting}>Cancel</button>
        <button type="submit" class="submit-btn" disabled={submitting || !title.trim()} title={sessionRecording ? 'Stop recording first, or click Submit to auto-stop' : ''}>
          {#if submitting}
            <span class="spinner"></span>
            Submitting...
          {:else}
            Submit
          {/if}
        </button>
      </div>
    </form>
  {/if}

  {#if activeTab === 'requests'}
    <div class="requests-wrapper" transition:slide={{ duration: 200 }}>
      {#if lastSubmittedId && lastHadRecording}
        <div class="replay-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><polygon points="10,8 16,12 10,16" fill="currentColor"/></svg>
          <span>Recording captured —</span>
          <a href="{endpoint}/feedback/replay?id={lastSubmittedId}" target="_blank" rel="noreferrer">View replay</a>
          <button class="replay-banner-dismiss" onclick={() => { lastSubmittedId = null; lastHadRecording = false; }} aria-label="Dismiss">×</button>
        </div>
      {/if}
      <RequestList
        {endpoint}
        bind:reports
        loading={reportsLoading}
        error={reportsError}
        onreload={loadReports}
      />
    </div>
  {/if}

  {#if activeTab === 'agent' && agentTabOpened}
    <div class="agent-wrapper" transition:slide={{ duration: 200 }}>
      <AgentPanel
        messages={agentMessages}
        agentState={agentState}
        currentStep={agentStep}
        maxSteps={bridge?.getMaxSteps() ?? 20}
        autoApprove={agentAutoApprove}
        onsend={handleAgentSend}
        onstop={handleAgentStop}
        onapprove={handleAgentApprove}
        onskip={handleAgentSkip}
        onautoapprovechange={handleAutoApproveChange}
      />
    </div>
  {/if}

  {#if activeTab === 'notes' && notesTabOpened}
    <div class="notes-wrapper" transition:slide={{ duration: 200 }}>
      <NotesPanel {endpoint} {project} onnoteschanged={handleNotesChanged} />
    </div>
  {/if}

  {#if activeTab === 'voice'}
    <div class="voice-wrapper" transition:slide={{ duration: 200 }}>
      <div class="voice-body">

        {#if voiceStatus === 'idle'}
          <p class="voice-hint">Record a voice note — JAT will transcribe it and create a task you can review before submitting.</p>
          <div class="voice-mic-row">
            <button class="voice-btn voice-btn-start" onclick={startVoiceRecording}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>
              </svg>
              Start Recording
            </button>
          </div>
          <p class="voice-footer">Transcription uses <strong>voxtype</strong> + <strong>ollama</strong> locally — no cloud needed.</p>

        {:else if voiceStatus === 'recording'}
          <p class="voice-hint">Recording… speak your note, then tap Stop.</p>
          <div class="voice-mic-row">
            <button class="voice-btn voice-btn-stop" onclick={stopVoiceRecording}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
              </svg>
              Stop Recording
            </button>
            <div class="voice-recording-indicator">
              <span class="voice-dot"></span>
              <span class="voice-dot"></span>
              <span class="voice-dot"></span>
            </div>
          </div>

        {:else if voiceStatus === 'uploading'}
          <div class="voice-processing">
            <span class="voice-spinner"></span>
            <span class="voice-status-text">Uploading…</span>
          </div>

        {:else if voiceStatus === 'transcribing'}
          <div class="voice-processing">
            <span class="voice-spinner"></span>
            <span class="voice-status-text">Transcribing…</span>
          </div>
          <p class="voice-hint" style="margin-top: 0.25rem;">This usually takes a few seconds.</p>

        {:else if voiceStatus === 'confirming'}
          <div class="voice-confirm">
            {#if voiceTasks.length > 1}
              <div class="voice-task-nav">
                <div class="voice-task-dots">
                  {#each voiceTasks as _, i}
                    <span class="voice-task-dot {i === voiceTaskIndex ? 'voice-task-dot-active' : ''}"></span>
                  {/each}
                </div>
                <span class="voice-task-counter">Task {voiceTaskIndex + 1} of {voiceTasks.length}</span>
              </div>
            {/if}
            <p class="voice-confirm-hint">Review and edit before submitting as feedback.</p>
            {#if voiceStatusMsg}
              <p class="voice-error-text" style="font-size: 12px; margin: 0 0 0.5rem;">{voiceStatusMsg}</p>
            {/if}
            <div class="voice-confirm-field">
              <label class="voice-confirm-label" for="voice-title">Title</label>
              <input
                id="voice-title"
                class="voice-confirm-input"
                type="text"
                bind:value={voiceTitle}
                placeholder="Task title"
              />
            </div>
            <div class="voice-confirm-field">
              <label class="voice-confirm-label" for="voice-desc">Description</label>
              <textarea
                id="voice-desc"
                class="voice-confirm-textarea"
                bind:value={voiceDescription}
                placeholder="Task description"
                rows="4"
              ></textarea>
            </div>
            <div class="voice-confirm-actions">
              <button class="voice-reset" onclick={resetVoice}>Discard all</button>
              {#if voiceTasks.length > 1}
                <button class="voice-btn voice-btn-skip" onclick={skipVoiceTask}>
                  Skip
                </button>
              {/if}
              <button class="voice-btn voice-btn-submit" onclick={confirmVoiceNote} disabled={!voiceTitle.trim()}>
                {#if voiceTasks.length > 1 && voiceTaskIndex < voiceTasks.length - 1}
                  Submit &amp; next →
                {:else}
                  Submit as feedback
                {/if}
              </button>
            </div>
          </div>

        {:else if voiceStatus === 'submitted'}
          <div class="voice-done">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="36" height="36">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <p class="voice-status-text voice-done-text">Submitted! Switching to history…</p>

        {:else if voiceStatus === 'error'}
          <div class="voice-error-icon">!</div>
          <p class="voice-status-text voice-error-text">{voiceStatusMsg}</p>
          <button class="voice-reset" onclick={resetVoice}>Try again</button>
        {/if}

      </div>
    </div>
  {/if}

  <StatusToast message={toastMessage} type={toastType} visible={toastVisible} />
</div>

{#if editingScreenshotIndex !== null}
  <AnnotationEditor
    imageDataUrl={pendingScreenshotDataUrl}
    onsave={handleAnnotationSave}
    oncancel={handleAnnotationCancel}
  />
{/if}

<style>
  .panel {
    width: 460px;
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
  .tool-buttons {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tool-buttons .tool-btn {
    flex: 1 1 auto;
    min-width: 0;
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
  .tool-btn:hover:not(:disabled) { background: #374151; }
  .tool-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .capture-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: capture-spin 0.6s linear infinite;
  }
  @keyframes capture-spin {
    to { transform: rotate(360deg); }
  }

  .tool-btn.recording-active {
    background: #7f1d1d;
    border-color: #dc2626;
    color: #fca5a5;
  }
  .tool-btn.recording-active:hover:not(:disabled) {
    background: #991b1b;
  }
  .recording-pulse {
    display: inline-block;
    width: 10px;
    height: 10px;
    background: #ef4444;
    border-radius: 50%;
    animation: recording-pulse 1s ease-in-out infinite;
  }
  @keyframes recording-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

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
  .attachments-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .attachment-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: #1e2d3f;
    border: 1px solid #374151;
    border-radius: 5px;
    font-size: 11px;
    color: #d1d5db;
  }
  .attachment-icon {
    display: flex;
    align-items: center;
    color: #9ca3af;
    flex-shrink: 0;
  }
  .attachment-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .attachment-size {
    color: #6b7280;
    font-size: 10px;
    flex-shrink: 0;
  }
  .attachment-remove {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 14px;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
  }
  .attachment-remove:hover { color: #ef4444; }
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
  .replay-banner {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #0f1e33;
    border-top: 1px solid #1e3a5f;
    font-size: 12px;
    color: #93c5fd;
  }
  .replay-banner a {
    color: #60a5fa;
    text-decoration: underline;
    font-weight: 500;
  }
  .replay-banner a:hover { color: #93c5fd; }
  .replay-banner-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: #4b6a8a;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
  }
  .replay-banner-dismiss:hover { color: #93c5fd; }
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
  .requests-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .agent-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .notes-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel-version {
    font-size: 10px;
    color: #4b5563;
    margin-right: auto;
    align-self: flex-end;
    padding-bottom: 6px;
  }

  /* Voice tab */
  .voice-wrapper {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .voice-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1.25rem;
    text-align: center;
  }
  .voice-hint {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0;
    max-width: 280px;
  }
  .voice-mic-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }
  .voice-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    font-family: inherit;
  }
  .voice-btn:active { transform: scale(0.96); }
  .voice-btn-start {
    background: #1d4ed8;
    color: white;
    width: 100%;
  }
  .voice-btn-start:hover { background: #2563eb; }
  .voice-btn-stop {
    background: #991b1b;
    color: white;
    width: 100%;
  }
  .voice-btn-stop:hover { background: #b91c1c; }

  @keyframes voice-pulse {
    0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
    50% { opacity: 1; transform: scaleY(1); }
  }
  .voice-recording-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 24px;
  }
  .voice-dot {
    width: 4px;
    height: 16px;
    background: #ef4444;
    border-radius: 2px;
    animation: voice-pulse 0.8s ease-in-out infinite;
  }
  .voice-dot:nth-child(2) { animation-delay: 0.15s; }
  .voice-dot:nth-child(3) { animation-delay: 0.3s; }

  .voice-processing {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #9ca3af;
    font-size: 13px;
  }
  @keyframes voice-spin { to { transform: rotate(360deg); } }
  .voice-spinner {
    width: 16px; height: 16px;
    border: 2px solid #374151;
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: voice-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  .voice-status-text { font-size: 12px; color: #9ca3af; margin: 0; }
  .voice-done { color: #22c55e; }
  .voice-done-text { color: #22c55e !important; font-weight: 500; }
  .voice-error-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #991b1b;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
  }
  .voice-error-text { color: #f87171 !important; }
  .voice-reset {
    font-size: 12px;
    color: #60a5fa;
    background: transparent;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    font-family: inherit;
    padding: 0;
  }
  .voice-footer {
    font-size: 11px;
    color: #4b5563;
    margin: 0;
    line-height: 1.5;
  }
  .voice-footer strong { color: #6b7280; }

  /* Voice confirmation UI */
  .voice-confirm {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    text-align: left;
  }
  .voice-confirm-hint {
    font-size: 12px;
    color: #9ca3af;
    margin: 0;
    line-height: 1.4;
  }
  .voice-confirm-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .voice-confirm-label {
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .voice-confirm-input {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    color: #e5e7eb;
    font-size: 13px;
    font-family: inherit;
    padding: 0.5rem 0.625rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
  }
  .voice-confirm-input:focus { border-color: #4b6cf7; }
  .voice-confirm-textarea {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    color: #e5e7eb;
    font-size: 13px;
    font-family: inherit;
    padding: 0.5rem 0.625rem;
    box-sizing: border-box;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
    min-height: 80px;
  }
  .voice-confirm-textarea:focus { border-color: #4b6cf7; }
  .voice-confirm-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.25rem;
  }
  .voice-btn-submit {
    background: #1d4ed8;
    color: white;
    padding: 0.5rem 1.125rem;
    font-size: 13px;
  }
  .voice-btn-submit:hover:not(:disabled) { background: #2563eb; }
  .voice-btn-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .voice-task-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .voice-task-dots {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .voice-task-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #374151;
    transition: background 0.2s;
  }
  .voice-task-dot-active {
    background: #1d4ed8;
    width: 8px;
    height: 8px;
  }
  .voice-task-counter {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .voice-btn-skip {
    background: transparent;
    color: #6b7280;
    border: 1px solid #374151;
    padding: 0.5rem 0.875rem;
    font-size: 13px;
  }
  .voice-btn-skip:hover { color: #9ca3af; border-color: #4b5563; }
</style>
