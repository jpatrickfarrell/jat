/**
 * Paused Sessions API
 * GET /api/tasks/paused-sessions?project=X&closedAfter=...&closedBefore=...
 *
 * Scans /tmp/jat-timeline-jat-*.jsonl for `paused` signal events and returns
 * them as entries to be merged into the completed-tasks timeline on /tasks.
 *
 * Filters:
 *   - taskId !== "unknown"           (skip dev-server sessions)
 *   - task.status !== "closed"       (skip post-completion auto-pauses
 *                                     that would duplicate a completed row)
 *   - event timestamp within window  (closedAfter/closedBefore)
 *   - project prefix matches         (if ?project provided)
 *
 * Each paused event becomes its own entry. startedAt is derived by walking
 * back through the same timeline file to find the most recent
 * `starting`/`working` event for the same taskId before the pause.
 */

import { json } from '@sveltejs/kit';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getTaskById } from '$lib/server/jat-tasks.js';
import { singleFlight, cacheKey } from '$lib/server/cache.js';
import { reconcileOrphansForProject } from '../../../../../../lib/reconcile-orphans.js';
import type { RequestHandler } from './$types';

interface PausedSession {
    id: string;
    taskId: string;
    taskTitle: string;
    agentName: string;
    reason: string;
    startedAt: string | null;
    endedAt: string;
    project: string;
}

interface TimelineEvent {
    type?: string;
    state?: string;
    task_id?: string;
    timestamp?: string;
    data?: {
        taskId?: string;
        taskTitle?: string;
        agentName?: string;
        reason?: string;
    };
}

function extractProjectFromTaskId(taskId: string): string {
    const dash = taskId.indexOf('-');
    return dash > 0 ? taskId.slice(0, dash) : '';
}

function isClosedTaskCache(): Map<string, boolean> {
    return new Map();
}

export const GET: RequestHandler = async ({ url }) => {
    const project = url.searchParams.get('project');
    const closedAfter = url.searchParams.get('closedAfter');
    const closedBefore = url.searchParams.get('closedBefore');

    const key = cacheKey('paused-sessions', { project, closedAfter, closedBefore });

    const responseData = await singleFlight(key, async () => {
        if (project) {
            try {
                await reconcileOrphansForProject(project);
            } catch {
                // non-fatal: proceed with timeline scan
            }
        }

        const tmpDir = '/tmp';
        const timelinePattern = /^jat-timeline-jat-(.+)\.jsonl$/;
        const sessions: PausedSession[] = [];
        const closedCache = isClosedTaskCache();

        let files: string[] = [];
        try {
            files = readdirSync(tmpDir).filter((f) => timelinePattern.test(f));
        } catch {
            return { sessions: [] };
        }

        for (const file of files) {
            const match = file.match(timelinePattern);
            if (!match) continue;
            const tmuxAgentName = match[1];

            let content: string;
            try {
                content = readFileSync(join(tmpDir, file), 'utf-8');
            } catch {
                continue;
            }

            const lines = content.trim().split('\n').filter(Boolean);
            const events: TimelineEvent[] = [];
            for (const line of lines) {
                try {
                    events.push(JSON.parse(line));
                } catch {
                    // skip
                }
            }

            for (let i = 0; i < events.length; i++) {
                const ev = events[i];
                if (ev.type !== 'signal' || ev.state !== 'paused') continue;

                const taskId = ev.data?.taskId || ev.task_id;
                if (!taskId || taskId === 'unknown') continue;

                const endedAt = ev.timestamp || ev.data?.['timestamp' as keyof typeof ev.data];
                if (!endedAt) continue;

                // Window filter (event timestamp)
                if (closedAfter && endedAt < closedAfter) continue;
                if (closedBefore && endedAt >= closedBefore) continue;

                // Project filter
                const taskProject = extractProjectFromTaskId(taskId);
                if (project && taskProject !== project) continue;

                // Skip if task is currently closed (post-completion auto-pause)
                let isClosed = closedCache.get(taskId);
                if (isClosed === undefined) {
                    try {
                        const task = getTaskById(taskId);
                        isClosed = task?.status === 'closed';
                    } catch {
                        isClosed = false;
                    }
                    closedCache.set(taskId, isClosed);
                }
                if (isClosed) continue;

                // Walk back to find the most recent starting/working event
                // for the same taskId before this pause.
                let startedAt: string | null = null;
                for (let j = i - 1; j >= 0; j--) {
                    const prev = events[j];
                    const prevTaskId = prev.data?.taskId || prev.task_id;
                    if (prevTaskId !== taskId) continue;
                    if (
                        prev.type === 'signal' &&
                        (prev.state === 'starting' || prev.state === 'working')
                    ) {
                        startedAt = prev.timestamp || null;
                        break;
                    }
                }

                const agentName = ev.data?.agentName || tmuxAgentName;
                const taskTitle = ev.data?.taskTitle || taskId;
                const reason = ev.data?.reason || 'Paused';

                sessions.push({
                    id: `paused-${agentName}-${taskId}-${endedAt}`,
                    taskId,
                    taskTitle,
                    agentName,
                    reason,
                    startedAt,
                    endedAt,
                    project: taskProject,
                });
            }
        }

        // Sort by endedAt descending (most recent first)
        sessions.sort((a, b) => b.endedAt.localeCompare(a.endedAt));

        return { sessions };
    }, 5000);

    return json(responseData);
};
