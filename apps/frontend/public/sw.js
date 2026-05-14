const CACHE = 'aldrava-cache-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/manifest.webmanifest'])));
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});

self.addEventListener('push', (event) => {
  const data = event.data?.json?.() ?? { title: 'Aldrava', body: 'Nova chamada na portaria' };
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icon.svg' }));
});
