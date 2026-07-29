// Service Worker لمنصة اتقِ الله التعليمية (Offline PWA Capabilities)
const CACHE_NAME = 'atqallah-v1.2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/library.html',
  '/news.html',
  '/hub.html',
  '/community.html',
  '/store.html',
  '/profile.html',
  '/support.html',
  '/about.html',
  '/teachers.html',
  '/styles.css',
  '/components.js',
  '/firebase-config.js',
  '/firebase-service.js',
  '/at.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('SW cache partial error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});
