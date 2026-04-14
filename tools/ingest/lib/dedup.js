/**
 * Dedup module — ingest.db retired.
 *
 * - isDuplicate / recordItem: no-ops. Real dedup is handled by the unique index
 *   on (source, source_item_id) in tasks.db — jt create uses INSERT OR IGNORE.
 * - logPoll: no-op (audit-only, not load-bearing).
 * - Thread tracking: delegated to threadTracker.js (JSON sidecar files).
 * - getOriginByTaskId: reads from tasks.db (source + metadata columns).
 */

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getEnabledSources } from './config.js';

export {
  findThreadByParentItemId,
  registerThread,
  getActiveThreads,
  updateThreadCursor,
  deactivateThread
} from './threadTracker.js';

// ---------------------------------------------------------------------------
// No-ops (replaced by tasks.db unique index + jt create INSERT OR IGNORE)
// ---------------------------------------------------------------------------

export function getDb() { return null; }
export function closeDb() {}
export function isDuplicate(_sourceId, _itemId) { return false; }
export function recordItem(_sourceId, _itemId, _hash, _taskId, _title, _origin) {}
export function logPoll(_sourceId, _found, _new, _error, _ms) {}
export function getRecentPolls(_sourceId, _limit) { return []; }
export function getItemCount(_sourceId) { return 0; }
export function getLastPoll(_sourceId) { return null; }
export function getAllSourceStats() { return []; }

// ---------------------------------------------------------------------------
// getOriginByTaskId — reads from tasks.db via the source + metadata columns.
// ---------------------------------------------------------------------------

function findTasksDb() {
  // Walk up from cwd to find .jat/tasks.db (same logic as jt)
  const candidates = [];
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    candidates.push(join(dir, '.jat', 'tasks.db'));
    const parent = join(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return candidates.find(p => existsSync(p)) || null;
}

/**
 * Look up origin metadata for a task that was created by the ingest daemon.
 * Previously queried ingested_items; now reads from tasks.source + tasks.metadata.
 *
 * @param {string} taskId
 * @returns {{ sourceId, adapterType, channelId, senderId, threadId, metadata } | null}
 */
export function getOriginByTaskId(taskId) {
  // First: find which source owns this task from tasks.db
  const dbPath = findTasksDb();
  if (dbPath) {
    let db;
    try {
      db = new Database(dbPath, { readonly: true });
      const row = db.prepare(
        'SELECT source, source_item_id, metadata FROM tasks WHERE id = ?'
      ).get(taskId);
      if (row && row.source) {
        let meta = {};
        try { meta = row.metadata ? JSON.parse(row.metadata) : {}; } catch {}
        // Resolve source config to get the source id
        const sources = getEnabledSources();
        const source = sources.find(s => s.type === row.source || s.id === row.source);
        return {
          sourceId: source?.id || row.source,
          adapterType: row.source,
          channelId: meta.channelId || meta.channel_id || null,
          senderId: meta.senderId || meta.sender_id || null,
          threadId: meta.threadId || meta.thread_id || row.source_item_id || null,
          metadata: meta
        };
      }
    } catch (err) {
      // tasks.db may not have source column yet on old installs
    } finally {
      db?.close();
    }
  }
  return null;
}
