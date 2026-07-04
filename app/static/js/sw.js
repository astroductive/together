/* Together — Service Worker
 *
 * Strategy:
 *  - App shell + static assets: cache-first, refreshed in the background.
 *  - MediaPipe CDN (cross-origin): cache-first so the camera + skeleton work
 *    offline (opaque responses are fine here).
 *  - Navigations: network-first with an offline fallback to the cached shell.
 *  - /api/ and socket.io: network-only (never cache dynamic / authed data).
 *
 * NOTE: sign *recognition* runs server-side (TFLite), so true offline
 * detection is not possible — when offline the UI, camera and skeleton still
 * load, and detection degrades gracefully until the server is reachable again.
 */
const CACHE = 'together-v2'; // bump on strategy changes — activate() drops old caches

const APP_SHELL = [
  '/static/css/main.css',
  '/static/css/theme.css',
  '/static/css/ui.css',
  '/static/js/app.js',
  '/static/js/auth.js',
  '/static/js/theme.js',
  '/static/js/landmark-player.js',
  '/static/img/logo-mark-color.png',
  '/static/img/logo-wordmark.png',
  '/static/img/tab-icon.svg',
  '/static/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll is atomic — guard each asset so one 404 can't abort install.
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isMediaPipeCdn(url) {
  return /cdn\.jsdelivr\.net\/npm\/@mediapipe|unpkg\.com\/@mediapipe/.test(url);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache APIs, auth, or realtime traffic.
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/socket.io') ||
      url.pathname.startsWith('/auth')) {
    return; // default network handling
  }

  // MediaPipe CDN assets: cache-first (large, immutable, needed for camera).
  if (isMediaPipeCdn(req.url)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) =>
          hit || fetch(req).then((res) => {
            cache.put(req, res.clone()).catch(() => {});
            return res;
          }).catch(() => hit)
        )
      )
    );
    return;
  }

  // Navigations: network-first, fall back to cached shell when offline.
  // Successful navigations are cached as we go — without that put() the
  // fallback below could never hit (nothing ever cached '/dashboard' or the
  // visited page) and the installed PWA showed the browser error page offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        fetch(req).then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
          return res;
        }).catch(() =>
          cache.match(req).then((hit) => hit || cache.match('/dashboard'))
        )
      )
    );
    return;
  }

  // App code (JS/CSS): NETWORK-first with cache fallback. These change on
  // every deploy and are small; serving them cache-first meant users ran the
  // PREVIOUS deploy's code until a couple of reloads later (measurements and
  // bug reports were chasing stale JavaScript). Offline still works via the
  // cached copy.
  if (url.origin === self.location.origin &&
      (url.pathname.startsWith('/static/js/') || url.pathname.startsWith('/static/css/'))) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        fetch(req).then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
          return res;
        }).catch(() => cache.match(req))
      )
    );
    return;
  }

  // Everything else under /static/ (fonts, images, the 70MB of vendored
  // MediaPipe WASM/models — versioned by path, effectively immutable):
  // cache-first, refreshed in the background.
  if (url.origin === self.location.origin && url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const fetchPromise = fetch(req).then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
            return res;
          }).catch(() => hit);
          return hit || fetchPromise;
        })
      )
    );
  }
});
