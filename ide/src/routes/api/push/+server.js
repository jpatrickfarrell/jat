/**
 * Push Subscription API
 *
 * GET  /api/push  — Returns the VAPID public key for client subscription
 * POST /api/push  — Stores a new push subscription
 * DELETE /api/push — Removes a push subscription
 *
 * Subscriptions are stored in ~/.config/jat/push-subscriptions.json
 */

import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.config', 'jat');
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json');
const SUBSCRIPTIONS_FILE = join(CONFIG_DIR, 'push-subscriptions.json');

function getVapidKeys() {
  if (!existsSync(CREDENTIALS_FILE)) {
    return null;
  }
  try {
    const creds = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8'));
    return creds.vapid || null;
  } catch {
    return null;
  }
}

function loadSubscriptions() {
  if (!existsSync(SUBSCRIPTIONS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveSubscriptions(subscriptions) {
  writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2), 'utf-8');
}

/** GET /api/push — Return VAPID public key */
export async function GET() {
  const vapid = getVapidKeys();
  if (!vapid) {
    return json({ error: 'VAPID keys not configured' }, { status: 503 });
  }
  return json({ publicKey: vapid.publicKey });
}

/** POST /api/push — Store a push subscription */
export async function POST({ request }) {
  let subscription;
  try {
    subscription = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!subscription?.endpoint) {
    return json({ error: 'Missing endpoint in subscription' }, { status: 400 });
  }

  const subscriptions = loadSubscriptions();

  // Check for existing subscription with same endpoint
  const existing = subscriptions.findIndex((s) => s.endpoint === subscription.endpoint);

  const entry = {
    ...subscription,
    addedAt: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || 'unknown'
  };

  if (existing >= 0) {
    subscriptions[existing] = entry;
  } else {
    subscriptions.push(entry);
  }

  saveSubscriptions(subscriptions);

  return json({ success: true, count: subscriptions.length });
}

/** DELETE /api/push — Remove a push subscription */
export async function DELETE({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { endpoint } = body;
  if (!endpoint) {
    return json({ error: 'Missing endpoint' }, { status: 400 });
  }

  const subscriptions = loadSubscriptions();
  const filtered = subscriptions.filter((s) => s.endpoint !== endpoint);
  saveSubscriptions(filtered);

  return json({ success: true, removed: subscriptions.length - filtered.length });
}
