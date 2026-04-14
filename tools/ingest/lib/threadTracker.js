/**
 * Thread Tracker — JSON-based replacement for the ingest.db thread_replies table.
 *
 * Stores per-source thread mappings at:
 *   ~/.config/jat/thread-tracking/{sourceId}.json
 *
 * Format: { [parentItemId]: { taskId, parentTs, lastReplyTs, replyCount, active, updatedAt } }
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const TRACKING_DIR = join(process.env.HOME, '.config', 'jat', 'thread-tracking');

function getPath(sourceId) {
  return join(TRACKING_DIR, `${sourceId.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
}

function load(sourceId) {
  const p = getPath(sourceId);
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return {};
  }
}

function save(sourceId, data) {
  mkdirSync(TRACKING_DIR, { recursive: true });
  writeFileSync(getPath(sourceId), JSON.stringify(data, null, 2));
}

export function findThreadByParentItemId(sourceId, parentItemId) {
  const data = load(sourceId);
  const entry = data[parentItemId];
  if (!entry || !entry.active) return null;
  return { task_id: entry.taskId, parent_item_id: parentItemId, ...entry };
}

export function registerThread(sourceId, parentItemId, parentTs, taskId) {
  const data = load(sourceId);
  if (!data[parentItemId]) {
    data[parentItemId] = {
      taskId,
      parentTs: parentTs || new Date().toISOString(),
      lastReplyTs: null,
      replyCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    save(sourceId, data);
  }
}

export function getActiveThreads(sourceId, limit = 50) {
  const data = load(sourceId);
  return Object.entries(data)
    .filter(([, v]) => v.active)
    .sort((a, b) => new Date(b[1].updatedAt || 0) - new Date(a[1].updatedAt || 0))
    .slice(0, limit)
    .map(([parentItemId, v]) => ({ ...v, parent_item_id: parentItemId, source_id: sourceId }));
}

export function updateThreadCursor(sourceId, parentItemId, lastReplyTs) {
  const data = load(sourceId);
  if (data[parentItemId]) {
    data[parentItemId].lastReplyTs = lastReplyTs;
    data[parentItemId].replyCount = (data[parentItemId].replyCount || 0) + 1;
    data[parentItemId].updatedAt = new Date().toISOString();
    save(sourceId, data);
  }
}

export function deactivateThread(sourceId, parentItemId) {
  const data = load(sourceId);
  if (data[parentItemId]) {
    data[parentItemId].active = false;
    data[parentItemId].updatedAt = new Date().toISOString();
    save(sourceId, data);
  }
}
