/**
 * Orphan task reconciliation.
 *
 * An "orphan" is a task whose status is `in_progress` but whose assignee agent
 * no longer has a live tmux session. This happens when a session is killed
 * ungracefully (without running `/jat:complete`), leaving the task stuck
 * in_progress forever.
 *
 * reconcileOrphansForProject() finds these, resets them to status=open, and
 * appends a `paused` timeline event so they surface in the IDE's paused section
 * with reason "Session ended without completion".
 */

import { execFile } from 'child_process';
import { appendFile } from 'fs/promises';
import { promisify } from 'util';
import { resolveBackendForProject } from './projects-config.js';
import { getBackendForProject } from './tasks-backend.js';

const execFileAsync = promisify(execFile);

async function tmuxSessionExists(name) {
  try {
    await execFileAsync('tmux', ['has-session', '-t', name], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Find orphaned in_progress tasks for a project and reset them to open.
 *
 * @param {string} projectName
 * @returns {Promise<Array<{taskId: string, agentName: string, title: string}>>}
 */
export async function reconcileOrphansForProject(projectName) {
  if (!projectName) return [];

  let backend;
  try {
    // resolveBackendForProject throws when backend=postgres but backend_url missing
    resolveBackendForProject(projectName);
    backend = await getBackendForProject(projectName);
  } catch {
    return [];
  }

  let inProgress;
  try {
    const list = backend.list({ projectName, status: 'in_progress' });
    inProgress = list && typeof list.then === 'function' ? await list : list;
  } catch {
    return [];
  }
  if (!Array.isArray(inProgress) || inProgress.length === 0) return [];

  const orphans = [];
  const nowIso = new Date().toISOString();

  for (const task of inProgress) {
    const assignee = task.assignee;
    if (!assignee) continue; // Nothing to check without an agent name
    const sessionName = `jat-${assignee}`;
    if (await tmuxSessionExists(sessionName)) continue;

    // Orphan — reset. Clear assignee so the task reads as available.
    try {
      const r = backend.update(task.id, { status: 'open', assignee: null });
      if (r && typeof r.then === 'function') await r;
    } catch {
      continue;
    }

    const event = {
      type: 'signal',
      state: 'paused',
      task_id: task.id,
      timestamp: nowIso,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        agentName: assignee,
        reason: 'Session ended without completion',
      },
    };
    try {
      await appendFile(
        `/tmp/jat-timeline-jat-${assignee}.jsonl`,
        JSON.stringify(event) + '\n',
        'utf-8'
      );
    } catch {
      // non-fatal
    }

    orphans.push({ taskId: task.id, agentName: assignee, title: task.title });
  }

  return orphans;
}
