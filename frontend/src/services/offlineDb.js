/**
 * IndexedDB schema for offline scripture cache.
 *
 * Tables:
 * - verses: all cached verse rows, keyed by (manuscript, book, chapter, verse)
 * - chapters_cached: which chapters are fully populated (for read-through skip)
 * - books_cached: which books were bulk-downloaded (for the "downloaded" badge)
 * - meta: { id: 'data_version', version: 'v1' } for invalidation
 */

import Dexie from 'dexie';

// Bump this when the manuscript data changes incompatibly to force a refetch.
// (e.g., after re-importing a manuscript with corrections)
export const DATA_VERSION = 'v1-2026-04-27';

export const db = new Dexie('all4yah_offline');

db.version(1).stores({
  verses: '[manuscript+book+chapter+verse], [manuscript+book+chapter], [manuscript+book]',
  chapters_cached: 'key, cachedAt',
  books_cached: 'key, cachedAt',
  meta: 'id',
});

/**
 * On first load (or after DATA_VERSION bump), wipe stale data.
 * Safe to call repeatedly; no-op when versions match.
 */
export async function ensureCacheVersion() {
  try {
    const stored = await db.meta.get('data_version');
    if (stored?.version === DATA_VERSION) return;

    await db.transaction('rw', db.verses, db.chapters_cached, db.books_cached, db.meta, async () => {
      await db.verses.clear();
      await db.chapters_cached.clear();
      await db.books_cached.clear();
      await db.meta.put({ id: 'data_version', version: DATA_VERSION, updatedAt: Date.now() });
    });
  } catch (err) {
    console.warn('ensureCacheVersion failed (cache may be unavailable):', err);
  }
}
