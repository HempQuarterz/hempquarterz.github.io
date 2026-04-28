/**
 * Read-through offline cache for verses and chapters.
 *
 * Pattern: try IDB first, fall back to Supabase, write-back to IDB.
 * When Supabase is unreachable (offline), IDB hits return; misses throw.
 *
 * Tier 1 (auto): WEB English chapters cached on first read.
 * Tier 2 (auto): any chapter the user views is cached for next time.
 * Tier 3 (opt-in): bulk download a whole book via downloadBook().
 */

import { supabase } from '../config/supabase';
import { db, ensureCacheVersion } from './offlineDb';

let manuscriptIdCache = null;

async function loadManuscripts() {
  if (manuscriptIdCache) return manuscriptIdCache;
  const { data, error } = await supabase.from('manuscripts').select('id, code');
  if (error) throw new Error(`Failed to load manuscripts: ${error.message}`);
  manuscriptIdCache = Object.fromEntries(data.map((m) => [m.code, m.id]));
  return manuscriptIdCache;
}

export async function clearManuscriptIdCache() {
  manuscriptIdCache = null;
}

/**
 * Cache-first single verse fetch.
 */
export async function cachedGetVerse(manuscript, book, chapter, verse) {
  await ensureCacheVersion();

  const cached = await db.verses.get([manuscript, book, chapter, verse]);
  if (cached) return cached;

  const manuscripts = await loadManuscripts();
  const manuscriptId = manuscripts[manuscript];
  if (!manuscriptId) throw new Error(`Unknown manuscript: ${manuscript}`);

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', manuscriptId)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .maybeSingle();

  if (error) throw new Error(`Failed to get verse: ${error.message}`);
  if (!data) return null;

  const row = { manuscript, ...data };
  try { await db.verses.put(row); } catch (e) { /* IDB write failure is non-fatal */ }
  return row;
}

/**
 * Cache-first chapter fetch. Returns the full verse list and marks
 * the chapter as cached so subsequent calls go straight to IDB.
 */
export async function cachedGetChapter(manuscript, book, chapter) {
  await ensureCacheVersion();

  const chapterKey = `${manuscript}-${book}-${chapter}`;
  const isCached = await db.chapters_cached.get(chapterKey);

  if (isCached) {
    return db.verses
      .where('[manuscript+book+chapter]')
      .equals([manuscript, book, chapter])
      .sortBy('verse');
  }

  const manuscripts = await loadManuscripts();
  const manuscriptId = manuscripts[manuscript];
  if (!manuscriptId) throw new Error(`Unknown manuscript: ${manuscript}`);

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', manuscriptId)
    .eq('book', book)
    .eq('chapter', chapter)
    .order('verse');

  if (error) throw new Error(`Failed to get chapter: ${error.message}`);

  const rows = (data || []).map((v) => ({ manuscript, ...v }));
  try {
    await db.transaction('rw', db.verses, db.chapters_cached, async () => {
      await db.verses.bulkPut(rows);
      await db.chapters_cached.put({ key: chapterKey, cachedAt: Date.now() });
    });
  } catch (e) { /* IDB write failure is non-fatal */ }

  return rows;
}

/**
 * Tier 3: bulk download a whole book for offline reading.
 * Iterates chapters, populating IDB. Reports progress via callback.
 */
export async function downloadBook(manuscript, book, totalChapters, onProgress) {
  for (let ch = 1; ch <= totalChapters; ch++) {
    await cachedGetChapter(manuscript, book, ch);
    if (onProgress) onProgress(ch, totalChapters);
  }
  await db.books_cached.put({
    key: `${manuscript}-${book}`,
    cachedAt: Date.now(),
  });
}

/**
 * Check whether a book is fully downloaded for offline.
 */
export async function isBookDownloaded(manuscript, book) {
  const row = await db.books_cached.get(`${manuscript}-${book}`);
  return !!row;
}

/**
 * Remove a downloaded book (frees IDB space).
 */
export async function removeBookFromCache(manuscript, book) {
  await db.transaction('rw', db.verses, db.chapters_cached, db.books_cached, async () => {
    await db.verses.where('[manuscript+book]').equals([manuscript, book]).delete();
    await db.chapters_cached
      .where('key')
      .startsWith(`${manuscript}-${book}-`)
      .delete();
    await db.books_cached.delete(`${manuscript}-${book}`);
  });
}

/**
 * Total cache stats for display in settings.
 */
export async function getCacheStats() {
  const [verseCount, chapterCount, bookCount] = await Promise.all([
    db.verses.count(),
    db.chapters_cached.count(),
    db.books_cached.count(),
  ]);
  return { verseCount, chapterCount, bookCount };
}

/**
 * Manually clear everything (settings UI escape hatch).
 */
export async function clearAllCache() {
  await db.transaction('rw', db.verses, db.chapters_cached, db.books_cached, async () => {
    await db.verses.clear();
    await db.chapters_cached.clear();
    await db.books_cached.clear();
  });
}
