const CACHE = 'durable-set-log-shell-v7';
const SHELL = ['/', '/index.html', '/demo', '/routines', '/ledger', '/more', '/demo/workout', '/demo/routines', '/demo/more', '/privacy/', '/terms/', '/offline.html', '/manifest.webmanifest', '/icons/icon.d79ae09e.svg', '/icons/icon-192.8abc28cb.png', '/icons/icon-512.76e12d28.png', '/icons/icon-maskable-512.174f2747.png', '/art/ledger-stamp-640.d21a9309.avif', '/art/ledger-stamp-960.d2855062.avif', '/art/ledger-stamp-640.1a534b29.webp', '/art/ledger-stamp-960.68c0987e.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) =>
    cache.addAll(SHELL.map((path) => new Request(path, { cache: 'reload' }))),
  ));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('durable-set-log-') && key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
