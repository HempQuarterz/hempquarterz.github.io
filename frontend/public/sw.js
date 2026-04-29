/**
 * All4Yah service worker — app shell + IIIF tile caching.
 *
 * Verse data is cached in IndexedDB by the app (see services/offlineCache.js).
 * This SW handles static assets, the HTML shell, and IIIF tile / manifest
 * requests so codex pages remain viewable when the user goes offline.
 *
 * Strategies:
 * - /assets/* (Vite content-hashed) → cache-first, indefinitely
 * - /, /*.html, manifest.json, og-image.svg, favicon* → network-first w/ cache fallback
 * - cross-origin IIIF tiles (`*\/iiifimage\/*.jpg|.png|.webp`) → cache-first, LRU-capped
 * - cross-origin IIIF manifest / info.json → stale-while-revalidate
 * - everything else (Supabase, fonts, etc.) → passthrough (no SW interception)
 *
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §5.D.3
 */

const VERSION = 'all4yah-v2';
const ASSET_CACHE = `assets-${VERSION}`;
const SHELL_CACHE = `shell-${VERSION}`;
const IIIF_TILE_CACHE = `iiif-tiles-${VERSION}`;
const IIIF_MANIFEST_CACHE = `iiif-manifests-${VERSION}`;

// LRU cap on the tile cache. ~400 tiles ≈ 30–80 MB depending on tile dimensions.
const IIIF_TILE_CACHE_MAX = 400;

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

// IIIF Image API tile (matches `…/iiifimage/<id>/<region>/<size>/<rot>/<quality>.<fmt>`)
const IIIF_TILE_PATTERN = /\/iiif(?:image)?\/.+\.(?:jpg|jpeg|png|webp|gif|tif|tiff)$/i;
// IIIF Image API descriptor or Presentation API manifest
const IIIF_DESCRIPTOR_PATTERN = /\/iiif(?:image)?\/.+\/(?:info|manifest)\.json$/i;

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

/**
 * Cache-first with FIFO trimming. We intentionally don't track real LRU order
 * (would require a separate metadata store); FIFO is a "good enough"
 * approximation for tile reuse and keeps storage bounded.
 */
async function cacheFirstCapped(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).then(() => trimCache(cacheName, maxEntries));
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const overflow = keys.length - maxEntries;
  if (overflow <= 0) return;
  for (let i = 0; i < overflow; i += 1) {
    await cache.delete(keys[i]);
  }
}

/**
 * Stale-while-revalidate — return cached response immediately if any, then
 * refresh the cache from the network in the background. Used for IIIF
 * manifest / info.json that change rarely but should not pin to old data.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || networkPromise || fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin IIIF — handle BEFORE the same-origin bailout below so codex
  // tiles from digi.vatlib.it / codexsinaiticus.org / etc. become offline-
  // replayable.
  if (url.origin !== self.location.origin) {
    if (IIIF_TILE_PATTERN.test(url.pathname)) {
      event.respondWith(cacheFirstCapped(request, IIIF_TILE_CACHE, IIIF_TILE_CACHE_MAX));
      return;
    }
    if (IIIF_DESCRIPTOR_PATTERN.test(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request, IIIF_MANIFEST_CACHE));
      return;
    }
    // Other cross-origin (Supabase, Google Fonts, etc.) — passthrough.
    return;
  }

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
