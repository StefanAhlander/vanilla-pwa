importScripts('/src/js/idb.js');
importScripts('/src/js/utilities.js');

const CACHE_VERSION = 3;
const CURRENT_CACHES = new Set([
  `static_${CACHE_VERSION}`,
  `dynamic_${CACHE_VERSION}`,
]);
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/material.min.js',
  '/src/js/idb.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];
// const CACHE_LIMIT = 10;

/* function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
} */

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);

  event.waitUntil(
    caches.open(`static_${CACHE_VERSION}`).then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      return cache.addAll(STATIC_FILES);
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
  const url =
    'https://pwagram-25646-default-rtdb.europe-west1.firebasedatabase.app/posts';

  if (event.request.url.includes(url)) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clonedRes = res.clone();
        clearAllData('posts')
          .then(() => {
            return clonedRes.json();
          })
          .then((data) => {
            for (let key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
      })
    );
  } else {
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
                // trimCache(`dynamic_${CACHE_VERSION}`, CACHE_LIMIT);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch((err) => {
              return caches.open(`static_${CACHE_VERSION}`).then((cache) => {
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
              });
            });
        })
        .catch((err) => {
          console.error(err);
        })
    );
  }
});
