const CACHE_VERSION = 1;
const CURRENT_CACHES = new Set([
  `static_${CACHE_VERSION}`,
  `dynamic_${CACHE_VERSION}`,
]);

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);

  const urlsToCache = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
  ];

  event.waitUntil(
    caches.open(`static_${CACHE_VERSION}`).then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ....', event);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!CURRENT_CACHES.has(cacheName)) {
            console.log('[Service Worker] removing old caches');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((res) => {
            return caches.open(`dynamic_${CACHE_VERSION}`).then((cache) => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch((err) => console.error(err));
      })
      .catch((error) => {
        console.error('  Error in fetch handler:', error);
      })
  );
});
