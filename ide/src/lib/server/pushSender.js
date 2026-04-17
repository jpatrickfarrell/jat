/**
 * Web Push Sender
 *
 * Loads VAPID keys + stored subscriptions and sends push notifications
 * through the web-push library. Dead subscriptions (404/410) are pruned
 * from the subscriptions file automatically.
 *
 * Used by the signal watcher to deliver pushes when agents transition
 * to `needs_input` or `ready-for-review`.
 */

import webpush from 'web-push';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.config', 'jat');
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json');
const SUBSCRIPTIONS_FILE = join(CONFIG_DIR, 'push-subscriptions.json');

// mailto: contact required by the VAPID spec. Real value doesn't matter for
// a local tool, but some push services (APNs) reject missing subjects.
const VAPID_SUBJECT = 'mailto:agent@jat.local';

let vapidConfigured = false;

function getVapidKeys() {
	if (!existsSync(CREDENTIALS_FILE)) return null;
	try {
		const creds = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8'));
		return creds.vapid || null;
	} catch {
		return null;
	}
}

function loadSubscriptions() {
	if (!existsSync(SUBSCRIPTIONS_FILE)) return [];
	try {
		return JSON.parse(readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
	} catch {
		return [];
	}
}

function saveSubscriptions(subs) {
	writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
}

function ensureVapidConfigured() {
	if (vapidConfigured) return true;
	const vapid = getVapidKeys();
	if (!vapid?.publicKey || !vapid?.privateKey) return false;
	webpush.setVapidDetails(VAPID_SUBJECT, vapid.publicKey, vapid.privateKey);
	vapidConfigured = true;
	return true;
}

/**
 * Send a push payload to every stored subscription.
 *
 * Fire-and-forget from the caller's perspective; errors are logged but
 * never thrown. Dead endpoints (404/410) are pruned so the file stays
 * lean on its own.
 *
 * @param {{title: string, body?: string, tag?: string, url?: string, requireInteraction?: boolean}} payload
 * @returns {Promise<{sent: number, pruned: number, failed: number}>}
 */
export async function sendPushToSubscribers(payload) {
	if (!ensureVapidConfigured()) {
		return { sent: 0, pruned: 0, failed: 0 };
	}

	const subscriptions = loadSubscriptions();
	if (subscriptions.length === 0) {
		return { sent: 0, pruned: 0, failed: 0 };
	}

	const body = JSON.stringify(payload);
	const deadEndpoints = new Set();
	let sent = 0;
	let failed = 0;

	await Promise.all(
		subscriptions.map(async (sub) => {
			try {
				await webpush.sendNotification(sub, body, { TTL: 60 });
				sent++;
			} catch (err) {
				// statusCode 404 = gone, 410 = unregistered. Prune either.
				const status = err?.statusCode;
				if (status === 404 || status === 410) {
					deadEndpoints.add(sub.endpoint);
				} else {
					failed++;
					console.error(`[pushSender] delivery failed (${status ?? 'unknown'}): ${err?.message ?? err}`);
				}
			}
		})
	);

	if (deadEndpoints.size > 0) {
		const remaining = subscriptions.filter((s) => !deadEndpoints.has(s.endpoint));
		saveSubscriptions(remaining);
	}

	return { sent, pruned: deadEndpoints.size, failed };
}
