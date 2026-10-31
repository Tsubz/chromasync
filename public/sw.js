// Both placeholders are filled in at build time by the `precache-manifest` plugin in vite.config.ts.
const BUILD_ID = '__BUILD_ID__';
const PRECACHE_URLS = self.__PRECACHE_MANIFEST__ || ['/'];
const CACHE_NAME = `chromasync-${BUILD_ID}`;

self.addEventListener('install', (event) => {
  // Cache the whole app shell up front so the app works offline after the first visit
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function putInCache(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets never change: serve from cache first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => putInCache(request, res)))
    );
    return;
  }

  // Everything else (pages, manifest, icons): network first so updates show up, cache when offline
  event.respondWith(
    fetch(request)
      .then((res) => putInCache(request, res))
      .catch(() =>
        caches.match(request).then((cached) => cached || (request.mode === 'navigate' ? caches.match('/') : undefined))
      )
  );
});
