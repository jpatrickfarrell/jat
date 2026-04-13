#!/usr/bin/env node
/**
 * Backfill JAT task attachments → Supabase Storage
 *
 * For each Meadow task in task-images.json that has local attachments but
 * screenshot_paths = null in project_tasks, uploads the files to Supabase
 * Storage (screenshots bucket) and updates screenshot_paths.
 *
 * Usage:
 *   node scripts/backfill-supabase-attachments.js [--dry-run] [--project meadow]
 */

import { readFileSync, existsSync, readFile as fsReadFile } from 'fs';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { homedir } from 'os';

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT = process.argv.includes('--project')
  ? process.argv[process.argv.indexOf('--project') + 1]
  : 'meadow';

const DRY_RUN = process.argv.includes('--dry-run');

const JAT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const TASK_IMAGES_PATH = join(JAT_ROOT, '.jat', 'task-images.json');

// ── Supabase credentials from project .env ────────────────────────────────────

function getProjectPath(projectName) {
  const cfgPath = join(homedir(), '.config', 'jat', 'projects.json');
  if (!existsSync(cfgPath)) throw new Error('~/.config/jat/projects.json not found');
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'));
  const entry = cfg.projects?.[projectName];
  if (!entry?.path) throw new Error(`Project "${projectName}" not found in projects.json`);
  return entry.path.replace(/^~/, homedir());
}

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    vars[t.slice(0, eq).trim()] = val;
  }
  return vars;
}

function getSupabaseCreds(projectName) {
  const projectPath = getProjectPath(projectName);
  const envPath = join(projectPath, '.env');
  if (!existsSync(envPath)) throw new Error(`.env not found at ${envPath}`);
  const env = parseEnv(readFileSync(envPath, 'utf-8'));
  const url = env['PUBLIC_SUPABASE_URL'];
  const key = env['PRIVATE_SUPABASE_SERVICE_ROLE'];
  if (!url || !key) throw new Error('Missing PUBLIC_SUPABASE_URL or PRIVATE_SUPABASE_SERVICE_ROLE in .env');
  return { url, key };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMimeType(ext) {
  const m = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', txt: 'text/plain' };
  return m[ext.toLowerCase()] || 'application/octet-stream';
}

async function uploadToStorage(supabaseUrl, serviceKey, storagePath, buffer, mimeType) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/screenshots/${storagePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${body}`);
  }
}

async function getProjectTaskRow(supabaseUrl, serviceKey, jatId) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/project_tasks?jat_id=eq.${encodeURIComponent(jatId)}&select=id,screenshot_paths`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
  );
  if (!res.ok) throw new Error(`Failed to fetch project_tasks: ${res.status}`);
  const rows = await res.json();
  return rows[0] ?? null;
}

async function updateScreenshotPaths(supabaseUrl, serviceKey, rowId, paths) {
  const res = await fetch(`${supabaseUrl}/rest/v1/project_tasks?id=eq.${rowId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ screenshot_paths: paths }),
  });
  if (!res.ok) throw new Error(`Failed to patch screenshot_paths: ${res.status}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Backfill JAT attachments → Supabase Storage`);
  console.log(`   Project: ${PROJECT}  |  Dry run: ${DRY_RUN}\n`);

  if (!existsSync(TASK_IMAGES_PATH)) {
    console.log('No task-images.json found. Nothing to migrate.');
    process.exit(0);
  }

  const { url: supabaseUrl, key: serviceKey } = getSupabaseCreds(PROJECT);
  const taskImages = JSON.parse(readFileSync(TASK_IMAGES_PATH, 'utf-8'));

  // Filter to tasks for the target project
  const prefix = `${PROJECT}-`;
  const relevant = Object.entries(taskImages).filter(([id]) => id.startsWith(prefix));
  console.log(`Found ${relevant.length} ${PROJECT} tasks with JAT attachments\n`);

  let migrated = 0, skipped = 0, errors = 0;

  for (const [taskId, images] of relevant) {
    const arr = Array.isArray(images) ? images : [images];
    const localPaths = arr.map(img => img.path).filter(Boolean);
    const existingLocal = localPaths.filter(p => existsSync(p));

    if (existingLocal.length === 0) {
      console.log(`  ⚠  ${taskId}: all local files missing, skipping`);
      skipped++;
      continue;
    }

    // Check current state in Supabase
    const row = await getProjectTaskRow(supabaseUrl, serviceKey, taskId);
    if (!row) {
      console.log(`  ⚠  ${taskId}: no project_tasks row (jat_id not found), skipping`);
      skipped++;
      continue;
    }

    const existing = row.screenshot_paths ?? [];
    const newPaths = [...existing];
    let uploaded = 0;

    for (const localPath of existingLocal) {
      const ext = extname(localPath).slice(1) || 'png';
      const storagePath = `tasks/${taskId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const mimeType = getMimeType(ext);

      if (DRY_RUN) {
        console.log(`  [dry] ${taskId}: would upload ${localPath} → screenshots/${storagePath}`);
        newPaths.push(storagePath);
        uploaded++;
        continue;
      }

      try {
        const buffer = await readFile(localPath);
        await uploadToStorage(supabaseUrl, serviceKey, storagePath, buffer, mimeType);
        newPaths.push(storagePath);
        uploaded++;
        console.log(`  ✓  ${taskId}: uploaded ${localPath.split('/').pop()} → screenshots/${storagePath}`);
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        console.error(`  ✗  ${taskId}: upload failed for ${localPath}: ${err.message}`);
        errors++;
      }
    }

    if (uploaded > 0 && !DRY_RUN) {
      await updateScreenshotPaths(supabaseUrl, serviceKey, row.id, newPaths);
      console.log(`  ✓  ${taskId}: screenshot_paths updated (${newPaths.length} total)\n`);
      migrated++;
    } else if (uploaded > 0) {
      console.log(`  [dry] ${taskId}: would update screenshot_paths (${newPaths.length} total)\n`);
      migrated++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Migrated: ${migrated}  |  Skipped: ${skipped}  |  Errors: ${errors}`);
  if (DRY_RUN) console.log(`  (dry run — no changes made)`);
  console.log();
}

main().catch(err => { console.error(err); process.exit(1); });
