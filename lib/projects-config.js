/**
 * JAT Projects Config Reader
 *
 * Single source of truth for reading `~/.config/jat/projects.json` and
 * resolving per-project backend selection.
 *
 * A project entry supports these optional backend fields (default: sqlite):
 *
 *   {
 *     "backend":     "sqlite" | "postgres",   // optional; default "sqlite"
 *     "backend_url": "postgres://..."         // required when backend="postgres"
 *   }
 *
 * `database_url` (legacy) is the *app* database URL (e.g. Supabase for chimaro).
 * It is NOT the JAT task backend URL — keep the two concepts distinct.
 *
 * Zero-migration contract: any project entry without a `backend` field resolves
 * to sqlite, so all existing configs continue to work unchanged.
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');

/** @typedef {'sqlite' | 'postgres'} BackendKind */

/**
 * @typedef {Object} BackendConfig
 * @property {BackendKind} kind
 * @property {string|null} url   - DSN for postgres; null for sqlite
 */

/**
 * Read and parse `~/.config/jat/projects.json`.
 * Returns null when the file is missing or unparseable.
 *
 * @returns {{ projects?: Record<string, any> } | null}
 */
export function readProjectsConfig() {
  if (!existsSync(CONFIG_PATH)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function expandHome(p) {
  if (!p) return p;
  return p.startsWith('~') ? p.replace(/^~/, homedir()) : p;
}

/**
 * Look up a project config entry by name or absolute path.
 * Matching order: exact name, case-insensitive name, path equality.
 *
 * @param {string} nameOrPath
 * @returns {{ name: string, config: any } | null}
 */
export function getProjectConfig(nameOrPath) {
  const cfg = readProjectsConfig();
  if (!cfg?.projects) return null;

  if (Object.prototype.hasOwnProperty.call(cfg.projects, nameOrPath)) {
    return { name: nameOrPath, config: cfg.projects[nameOrPath] };
  }

  const lowerKey = nameOrPath.toLowerCase();
  for (const [name, entry] of Object.entries(cfg.projects)) {
    if (name.toLowerCase() === lowerKey) return { name, config: entry };
  }

  const target = resolve(expandHome(nameOrPath));
  for (const [name, entry] of Object.entries(cfg.projects)) {
    const entryPath = resolve(expandHome(/** @type {any} */ (entry).path || ''));
    if (entryPath && entryPath === target) return { name, config: entry };
  }

  return null;
}

/**
 * Resolve the task backend for a project.  Defaults to sqlite when the
 * project entry omits `backend` or no config file exists.
 *
 * Throws when `backend="postgres"` is declared without a `backend_url` —
 * silent fallback to sqlite would hide a serious misconfiguration.
 *
 * @param {string} nameOrPath - Project name or absolute path
 * @returns {BackendConfig}
 */
export function resolveBackendForProject(nameOrPath) {
  const entry = getProjectConfig(nameOrPath);
  if (!entry) return { kind: 'sqlite', url: null };

  const { name, config } = entry;
  const kind = /** @type {BackendKind} */ (config.backend || 'sqlite');

  if (kind === 'postgres') {
    const url = config.backend_url || null;
    if (!url) {
      throw new Error(
        `Project "${name}" is configured with backend="postgres" but backend_url is missing. ` +
        `Add a "backend_url" field to ~/.config/jat/projects.json.`
      );
    }
    return { kind: 'postgres', url };
  }

  if (kind !== 'sqlite') {
    throw new Error(
      `Project "${name}" has unknown backend "${kind}". Valid values: "sqlite", "postgres".`
    );
  }

  return { kind: 'sqlite', url: null };
}

/**
 * True when the given project is backed by sqlite (the default).
 *
 * @param {string} nameOrPath
 * @returns {boolean}
 */
export function isSqliteProject(nameOrPath) {
  try {
    return resolveBackendForProject(nameOrPath).kind === 'sqlite';
  } catch {
    return false;
  }
}

/**
 * @typedef {Object} SupabaseConfig
 * @property {string} supabaseUrl   - e.g. "https://abc.supabase.co"
 * @property {string} serviceRoleKey - Service role JWT
 */

/**
 * Parse a .env file into a key→value map (simple KEY=VALUE, no shell expansion).
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseEnvFile(content) {
  /** @type {Record<string, string>} */
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip optional surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) vars[key] = val;
  }
  return vars;
}

/**
 * Return the Supabase URL + service-role key for a postgres-backed project
 * by reading its .env file.  Returns null if not found or not applicable.
 *
 * Reads: PUBLIC_SUPABASE_URL and PRIVATE_SUPABASE_SERVICE_ROLE (JST convention)
 *
 * @param {string} projectName
 * @returns {SupabaseConfig | null}
 */
export function getProjectSupabaseConfig(projectName) {
  const entry = getProjectConfig(projectName);
  if (!entry) return null;

  const projectPath = expandHome(entry.config.path || '');
  if (!projectPath) return null;

  const envPath = join(projectPath, '.env');
  if (!existsSync(envPath)) return null;

  try {
    const content = readFileSync(envPath, 'utf-8');
    const env = parseEnvFile(content);
    const supabaseUrl = env['PUBLIC_SUPABASE_URL'] || '';
    const serviceRoleKey = env['PRIVATE_SUPABASE_SERVICE_ROLE'] || '';
    if (!supabaseUrl || !serviceRoleKey) return null;
    return { supabaseUrl, serviceRoleKey };
  } catch {
    return null;
  }
}
