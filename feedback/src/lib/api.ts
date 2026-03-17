import type { FeedbackReport, ThreadEntry, AgentNote } from './types';

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
}

export async function fetchReports(endpoint: string): Promise<{ reports: ReportSummary[]; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/reports`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
    });

    if (!response.ok) {
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
