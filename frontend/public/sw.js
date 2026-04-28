/**
 * All4Yah service worker — app shell only.
 *
 * Verse data is cached in IndexedDB by the app (see services/offlineCache.js).
 * This SW handles static assets and HTML so the app boots offline.
 *
 * Strategies:
 * - /assets/* (Vite content-hashed) → cache-first, indefinitely
 * - /, /*.html, manifest.json, og-image.svg, favicon* → network-first w/ cache fallback
 * - everything else (Supabase, fonts, etc.) → passthrough (no SW interception)
 */

const VERSION = 'all4yah-v1';
const ASSET_CACHE = `assets-${VERSION}`;
const SHELL_CACHE = `shell-${VERSION}`;

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/apple-touch-icon.png',
  '/og-image.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Tolerate failures on individual assets so a single 404 doesn't break install.
      Promise.all(SHELL_URLS.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.endsWith(`-${VERSION}`))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // For navigation requests, fall back to the cached app shell
    if (request.mode === 'navigate') {
      const shell = await cache.match('/index.html') || await cache.match('/');
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests; let Supabase/fonts/etc. pass through.
  if (url.origin !== self.location.origin) return;

  // Hashed Vite assets — cache-first forever.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // App shell candidates — network-first, fall back to cached.
  if (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/og-image.svg' ||
    url.pathname.startsWith('/favicon') ||
    url.pathname === '/apple-touch-icon.png'
  ) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  // Everything else: default browser behavior.
});
