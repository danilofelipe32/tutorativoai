// This service worker enables PWA features like offline caching.

const CACHE_NAME = 'tutor-ativo-ai-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // NOTE: Add paths to your bundled JS/CSS files here if you use a bundler.
  // The import-map URLs are fetched dynamically and might be cached by the browser automatically.
];

// Install the service worker and cache the application shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Serve cached content when offline.
self.addEventListener('fetch', event => {
  // We only cache local assets, not external CDNs, to keep it simple.
  // The browser is generally good at caching CDN resources.
  if (URLS_TO_CACHE.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  } else {
    // For all other requests, just fetch from the network.
    event.respondWith(fetch(event.request));
  }
});

// Clean up old caches on activation.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});