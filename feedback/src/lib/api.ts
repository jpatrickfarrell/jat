import type { FeedbackReport } from './types';

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
  created_at: string;
}

export async function fetchReports(endpoint: string): Promise<{ reports: ReportSummary[]; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/reports`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
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

export async function respondToReport(endpoint: string, reportId: string, response: 'accepted' | 'rejected', reason?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/feedback/reports/${reportId}/respond`;
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, ...(reason ? { reason } : {}) }),
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
