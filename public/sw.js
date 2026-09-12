// ZenMind Service Worker — handles browser push notifications
self.addEventListener('push', event => {
  let data = { title: 'ZenMind', body: 'Time to check your wellness goals! 🌿', url: '/' };
  try {
    data = JSON.parse(event.data?.text() || '{}');
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'ZenMind', {
      body:    data.body  || '',
      icon:    data.icon  || '/favicon.ico',
      badge:   '/favicon.ico',
      tag:     'zenmind-nudge',
      renotify: true,
      data:    { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});
