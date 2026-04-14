import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const STATE_PATH = join(process.env.HOME, '.config/jat/daemon-state.json');
const LEGACY_DB_PATH = join(process.env.HOME, '.local/share/jat/ingest.db');

let cache = null;

function load() {
  if (cache) return cache;
  if (existsSync(STATE_PATH)) {
    try {
      const parsed = JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
      cache = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      console.error(`[adapterState] failed to parse ${STATE_PATH}: ${err.message}`);
      cache = {};
    }
    return cache;
  }
  cache = migrateFromLegacyDb();
  persist();
  return cache;
}

function migrateFromLegacyDb() {
  const state = {};
  if (!existsSync(LEGACY_DB_PATH)) {
    console.log(`[adapterState] no legacy ingest.db; starting fresh at ${STATE_PATH}`);
    return state;
  }
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (err) {
    console.error(`[adapterState] better-sqlite3 unavailable, skipping migration: ${err.message}`);
    return state;
  }
  let db;
  try {
    db = new Database(LEGACY_DB_PATH, { readonly: true, fileMustExist: true });
    const hasTable = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='adapter_state'`
    ).get();
    if (!hasTable) {
      console.log('[adapterState] legacy ingest.db has no adapter_state table; starting fresh');
      return state;
    }
    const rows = db.prepare('SELECT source_id, state_json FROM adapter_state').all();
    for (const row of rows) {
      try {
        state[row.source_id] = JSON.parse(row.state_json);
      } catch {
        state[row.source_id] = {};
      }
    }
    console.log(`[adapterState] migrated ${rows.length} adapter_state rows from ingest.db -> ${STATE_PATH}`);
  } catch (err) {
    console.error(`[adapterState] migration read failed: ${err.message}`);
  } finally {
    try { db?.close(); } catch {}
  }
  return state;
}

function persist() {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  const tmp = `${STATE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(cache, null, 2));
  renameSync(tmp, STATE_PATH);
}

export function getAdapterState(sourceId) {
  const all = load();
  return all[sourceId] ? { ...all[sourceId] } : {};
}

export function setAdapterState(sourceId, state) {
  const all = load();
  all[sourceId] = state ?? {};
  persist();
}
