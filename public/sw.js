const CACHE_NAME = 'studyforge-cache-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Basic core caching layout for PWA
      return cache.addAll([
        OFFLINE_URL,
        '/favicon.ico',
        '/icon-192x192.png',
        '/icon-512x512.png',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((name) => {
        if (name !== CACHE_NAME) {
          return caches.delete(name);
        }
      })
    ))
  );
  self.clients.claim();
});

// Cache First Strategy for assets, Network First for HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).then((networkResponse) => {
        // Optional: Cache dynamically generated chunks
        return networkResponse;
      }).catch(() => {
        // Offline Fallback for Navigation
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
