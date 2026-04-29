/**
 * Resolver behavior for the IIIF manifest registry.
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §3.A.1
 */

import { describe, it, expect } from 'vitest';
import {
  resolveManifest,
  resolveCanvasIndex,
  hasVerifiedManifests,
  listVerifiedManuscripts,
  CANVAS_MAPS,
  MANIFEST_REGISTRY,
  MIRRORED_PAGES,
} from './iiif';

describe('resolveManifest', () => {
  it('returns null for unverified manuscripts', () => {
    expect(resolveManifest({ manuscriptId: 'SIN', book: 'JHN', chapter: 1 })).toBeNull();
    expect(resolveManifest({ manuscriptId: 'WLC', book: 'GEN', chapter: 1 })).toBeNull();
  });

  it('returns null for unknown manuscripts', () => {
    expect(resolveManifest({ manuscriptId: 'NOPE', book: 'GEN', chapter: 1 })).toBeNull();
  });

  it.each([
    ['VATICANUS', /^https:\/\/digi\.vatlib\.it\/iiif\/MSS_Vat\.gr\.1209\/manifest\.json$/],
    ['BEZAE', /^https:\/\/cudl\.lib\.cam\.ac\.uk\/iiif\/MS-NN-00002-00041$/],
    ['MARCHALIANUS', /^https:\/\/digi\.vatlib\.it\/iiif\/MSS_Vat\.gr\.2125\/manifest\.json$/],
    ['REG_LAT_7', /^https:\/\/digi\.vatlib\.it\/iiif\/MSS_Reg\.lat\.7\/manifest\.json$/],
  ])('returns the verified manifestRoot for %s', (id, urlPattern) => {
    const url = resolveManifest({ manuscriptId: id, book: 'MAT', chapter: 1 });
    expect(url).toBe(MANIFEST_REGISTRY[id].manifestRoot);
    expect(url).toMatch(urlPattern);
  });

  it('normalizes input casing for both manuscript and book', () => {
    expect(resolveManifest({ manuscriptId: 'vaticanus', book: 'mat', chapter: 1 })).toBe(
      MANIFEST_REGISTRY.VATICANUS.manifestRoot
    );
    expect(resolveManifest({ manuscriptId: ' bezae ', book: ' jhn ', chapter: 1 })).toBe(
      MANIFEST_REGISTRY.BEZAE.manifestRoot
    );
  });

  it('handles missing or undefined inputs without throwing', () => {
    expect(() => resolveManifest({})).not.toThrow();
    expect(resolveManifest({})).toBeNull();
    expect(resolveManifest({ manuscriptId: null })).toBeNull();
  });
});

describe('hasVerifiedManifests', () => {
  it.each(['VATICANUS', 'BEZAE', 'MARCHALIANUS', 'REG_LAT_7'])(
    'returns true for %s (verified manifestRoot)',
    (id) => {
      expect(hasVerifiedManifests(id)).toBe(true);
    }
  );

  it('returns false for unverified manuscripts', () => {
    expect(hasVerifiedManifests('SIN')).toBe(false);
    expect(hasVerifiedManifests('WLC')).toBe(false);
    expect(hasVerifiedManifests('ALEPPO')).toBe(false);
    expect(hasVerifiedManifests('DSS')).toBe(false);
  });

  it('returns false for unknown manuscripts', () => {
    expect(hasVerifiedManifests('NOPE')).toBe(false);
  });
});

describe('listVerifiedManuscripts', () => {
  it('returns all four verified codices, none of the unverified ones', () => {
    const list = listVerifiedManuscripts();
    const ids = list.map((m) => m.id).sort();
    expect(ids).toEqual(['BEZAE', 'MARCHALIANUS', 'REG_LAT_7', 'VATICANUS']);
    expect(list.every((m) => hasVerifiedManifests(m.id))).toBe(true);
  });

  it('shape contract: id, manuscript, source', () => {
    for (const m of listVerifiedManuscripts()) {
      expect(m).toMatchObject({
        id: expect.any(String),
        manuscript: expect.any(String),
        source: expect.stringMatching(/^https:\/\//),
      });
    }
  });
});

describe('resolveCanvasIndex', () => {
  it('returns the curated entry when (codex, book) is in CANVAS_MAPS', () => {
    expect(resolveCanvasIndex({ manuscriptId: 'VATICANUS', book: 'GEN' })).toBe(4);
    expect(resolveCanvasIndex({ manuscriptId: 'BEZAE', book: 'MAT' })).toBe(2);
    expect(resolveCanvasIndex({ manuscriptId: 'REG_LAT_7', book: 'MAT' })).toBe(2);
  });

  it('falls back to coverCanvases for unmapped books on a verified codex', () => {
    expect(resolveCanvasIndex({ manuscriptId: 'VATICANUS', book: 'MAT' })).toBe(
      MANIFEST_REGISTRY.VATICANUS.coverCanvases
    );
    expect(resolveCanvasIndex({ manuscriptId: 'MARCHALIANUS', book: 'ISA' })).toBe(
      MANIFEST_REGISTRY.MARCHALIANUS.coverCanvases
    );
  });

  it('returns 0 for unknown manuscripts (no coverCanvases)', () => {
    expect(resolveCanvasIndex({ manuscriptId: 'NOPE', book: 'GEN' })).toBe(0);
  });

  it('normalizes case + whitespace on manuscriptId and book', () => {
    expect(resolveCanvasIndex({ manuscriptId: 'vaticanus', book: 'gen' })).toBe(4);
    expect(resolveCanvasIndex({ manuscriptId: ' BEZAE ', book: ' mat ' })).toBe(2);
  });

  it('handles missing inputs without throwing', () => {
    expect(() => resolveCanvasIndex({})).not.toThrow();
    expect(resolveCanvasIndex({})).toBe(0);
  });
});

describe('CANVAS_MAPS shape contract', () => {
  it('every canvas index is a non-negative integer', () => {
    for (const [codex, book2idx] of Object.entries(CANVAS_MAPS)) {
      for (const [book, idx] of Object.entries(book2idx)) {
        expect(Number.isInteger(idx), `${codex}.${book}`).toBe(true);
        expect(idx, `${codex}.${book}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('CANVAS_MAPS and its child maps are frozen', () => {
    expect(Object.isFrozen(CANVAS_MAPS)).toBe(true);
    for (const child of Object.values(CANVAS_MAPS)) {
      expect(Object.isFrozen(child)).toBe(true);
    }
  });

  it('verified codices in MANIFEST_REGISTRY declare numeric coverCanvases', () => {
    for (const [id, entry] of Object.entries(MANIFEST_REGISTRY)) {
      if (!entry.verified) continue;
      expect(Number.isFinite(entry.coverCanvases), `${id}.coverCanvases`).toBe(true);
      expect(entry.coverCanvases).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('MANIFEST_REGISTRY shape contract', () => {
  it('every entry has manuscript, source, manifests, verified fields', () => {
    for (const [id, entry] of Object.entries(MANIFEST_REGISTRY)) {
      expect(entry, `entry for ${id}`).toMatchObject({
        manuscript: expect.any(String),
        source: expect.stringMatching(/^https:\/\//),
        manifests: expect.any(Object),
        verified: expect.any(Boolean),
      });
    }
  });

  it('is frozen (write-protected) so accidental mutations fail loudly', () => {
    expect(Object.isFrozen(MANIFEST_REGISTRY)).toBe(true);
    expect(Object.isFrozen(MIRRORED_PAGES)).toBe(true);
  });
});
