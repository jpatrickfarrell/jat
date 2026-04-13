/**
 * JAT Service Worker
 *
 * Handles web push notifications from the JAT IDE server.
 * Receives push events when agents need input or are ready for review.
 */

const CACHE_NAME = 'jat-sw-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push event - fired when a push message is received
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'JAT', body: event.data.text() };
    }
  }

  const title = data.title || 'JAT Agent Alert';
  const options = {
    body: data.body || 'An agent needs your attention.',
    icon: '/icon-192.png',
    badge: '/favicon.png',
    tag: data.tag || 'jat-agent',
    data: data.url ? { url: data.url } : {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing JAT window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event (track dismissals if needed)
self.addEventListener('notificationclose', () => {
  // Intentionally no-op — dismissals are user-driven
});
