import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';

const STATE_PATH = join(process.env.HOME, '.config/jat/daemon-state.json');

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
  cache = {};
  persist();
  return cache;
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
