/**
 * Resolver behavior for the IIIF manifest registry.
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §3.A.1
 */

import { describe, it, expect } from 'vitest';
import {
  resolveManifest,
  hasVerifiedManifests,
  listVerifiedManuscripts,
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
