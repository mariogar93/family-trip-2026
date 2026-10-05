const CACHE_NAME = 'family-trip-v2';

self.addEventListener('install', (event) => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete all old caches immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass API requests and uploads straight to network
  if (
    event.request.url.includes('/api/') || 
    event.request.url.includes('/uploads/') || 
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-First for HTML/navigation requests so browser always receives current build
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // For static assets: try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
