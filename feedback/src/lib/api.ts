import type { FeedbackReport, ThreadEntry, AgentNote, ConsoleLogEntry, NetworkRequestEntry } from './types';

export async function submitReport(endpoint: string, report: FeedbackReport): Promise<{ ok: boolean; id?: string; error?: string }> {
  const url = `${endpoint.replace(/\/$/, '')}/api/feedback/report`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });

  const data = await response.json();

  if (!response.ok) {
    return { ok: false, error: data.error || `HTTP ${response.status}` };
  }

  return { ok: true, id: data.id };
}

export async function uploadRecording(
  endpoint: string,
  events: unknown[],
  reportId: string,
): Promise<{ ok: boolean; recording_url?: string; error?: string }> {
  const url = `${endpoint.replace(/\/$/, '')}/api/feedback/recordings`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, reportId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || `HTTP ${response.status}` };
    }

    return { ok: true, recording_url: data.recording_url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to upload recording' };
  }
}

export async function healthCheck(endpoint: string): Promise<boolean> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/report`;
    const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export interface ReportSummary {
  id: string;
  title: string;
  description: string;
  /** source_type: bug, enhancement, other (renamed from `type` in v3.0.0) */
  type: string;
  priority: string;
  status: string;
  dev_notes: string | null;
  revision_count: number;
  responded_at: string | null;
  page_url: string | null;
  screenshot_urls: string[] | null;
  thread: ThreadEntry[] | null;
  created_at: string;
  /** Source of the item: feedback, jat, or manual (v3.0.0+) */
  source?: 'feedback' | 'jat' | 'manual';
  /** Issue classification: bug, feature, task, epic (v3.0.0+) */
  issue_type?: string;
  /** Assigned agent or person (v3.0.0+) */
  assignee?: string | null;
  /** Labels for categorization (v3.0.0+) */
  labels?: string[] | null;
  /** URL to stored rrweb recording (v3.2.0+) */
  recording_url?: string | null;
  /** Console logs captured with the report */
  console_logs?: ConsoleLogEntry[] | null;
  /** Network requests captured with the report */
  network_requests?: NetworkRequestEntry[] | null;
}

export async function fetchReports(endpoint: string): Promise<{ reports: ReportSummary[]; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/reports`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      // 401/403 = not logged in → just show empty reports, not an error
      if (response.status === 401 || response.status === 403) {
        return { reports: [] };
      }
      const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      return { reports: [], error: data.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { reports: data.reports || [] };
  } catch (err) {
    return { reports: [], error: err instanceof Error ? err.message : 'Failed to fetch' };
  }
}

export async function respondToReport(
  endpoint: string,
  reportId: string,
  response: 'accepted' | 'rejected',
  reason?: string,
  options?: { screenshots?: string[]; elements?: Array<{ tagName: string; className: string; id: string; selector: string; textContent: string }> },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/reports/${reportId}/respond`;
    const body: Record<string, unknown> = { response };
    if (reason) body.reason = reason;
    if (options?.screenshots && options.screenshots.length > 0) body.screenshots = options.screenshots;
    if (options?.elements && options.elements.length > 0) body.elements = options.elements;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to respond' };
  }
}

// --- Agent Notes CRUD ---

const notesUrl = (endpoint: string) => `${endpoint.replace(/\/$/, '')}/api/feedback/notes`;

export async function fetchNotes(
  endpoint: string,
  project: string,
  route?: string,
): Promise<{ notes: AgentNote[]; error?: string }> {
  try {
    let url = `${notesUrl(endpoint)}?project=${encodeURIComponent(project)}`;
    if (route !== undefined) url += `&route=${encodeURIComponent(route)}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { notes: [], error: data.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { notes: data.notes || [] };
  } catch (err) {
    return { notes: [], error: err instanceof Error ? err.message : 'Failed to fetch notes' };
  }
}

export async function createNote(
  endpoint: string,
  note: { project: string; route: string | null; title: string; content: string },
): Promise<{ ok: boolean; note?: AgentNote; error?: string }> {
  try {
    const res = await fetch(notesUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, note: data.note };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to create note' };
  }
}

export async function updateNote(
  endpoint: string,
  id: string,
  updates: { title?: string; content?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${notesUrl(endpoint)}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update note' };
  }
}

export async function upsertNote(
  endpoint: string,
  note: { project: string; route: string | null; title: string; content: string },
): Promise<{ ok: boolean; note?: AgentNote; error?: string }> {
  try {
    const res = await fetch(notesUrl(endpoint), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, note: data.note };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to upsert note' };
  }
}

export async function fetchRecordingSummary(
  endpoint: string,
  recording_url: string,
  console_logs?: ConsoleLogEntry[] | null,
  network_requests?: NetworkRequestEntry[] | null,
): Promise<{ ok: boolean; summary?: string; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/recordings/summary`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recording_url, console_logs, network_requests }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, summary: data.summary };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to fetch recording summary' };
  }
}

// --- Task Comments (external thread for reporter view) ---

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  author_type: string | null;
  comment_type: string | null;
  external: boolean;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

export async function fetchTaskComments(
  endpoint: string,
  taskId: string,
): Promise<{ comments: TaskComment[]; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/tasks/${encodeURIComponent(taskId)}/comments?external=true`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { comments: [] };
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { comments: [], error: data.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { comments: data.comments || [] };
  } catch (err) {
    return { comments: [], error: err instanceof Error ? err.message : 'Failed to fetch comments' };
  }
}

export async function postTaskComment(
  endpoint: string,
  taskId: string,
  opts: {
    text: string;
    author: string;
    author_email?: string;
    author_type?: string;
    comment_type?: string;
  },
): Promise<{ ok: boolean; comment?: TaskComment; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/tasks/${encodeURIComponent(taskId)}/comments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        text: opts.text,
        author: opts.author,
        author_email: opts.author_email,
        author_type: opts.author_type ?? 'user',
        comment_type: opts.comment_type ?? 'note',
        external: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, comment: data.comment };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to post comment' };
  }
}

export async function deleteNote(endpoint: string, id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${notesUrl(endpoint)}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to delete note' };
  }
}
