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

  it('returns the manuscript-level manifestRoot when no per-book manifest exists', () => {
    const url = resolveManifest({ manuscriptId: 'VATICANUS', book: 'MAT', chapter: 1 });
    expect(url).toBe(MANIFEST_REGISTRY.VATICANUS.manifestRoot);
    expect(url).toMatch(/^https:\/\/digi\.vatlib\.it\/iiif\/.+\/manifest\.json$/);
  });

  it('normalizes input casing for both manuscript and book', () => {
    expect(resolveManifest({ manuscriptId: 'vaticanus', book: 'mat', chapter: 1 })).toBe(
      MANIFEST_REGISTRY.VATICANUS.manifestRoot
    );
    expect(resolveManifest({ manuscriptId: ' VATICANUS ', book: ' MAT ', chapter: 1 })).toBe(
      MANIFEST_REGISTRY.VATICANUS.manifestRoot
    );
  });

  it('handles missing or undefined inputs without throwing', () => {
    expect(() => resolveManifest({})).not.toThrow();
    expect(resolveManifest({})).toBeNull();
    expect(resolveManifest({ manuscriptId: null })).toBeNull();
  });
});

describe('hasVerifiedManifests', () => {
  it('returns true for VATICANUS (has verified manifestRoot)', () => {
    expect(hasVerifiedManifests('VATICANUS')).toBe(true);
  });

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
  it('returns only manuscripts with at least one verified manifest path', () => {
    const list = listVerifiedManuscripts();
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((m) => hasVerifiedManifests(m.id))).toBe(true);
    const ids = list.map((m) => m.id);
    expect(ids).toContain('VATICANUS');
    expect(ids).not.toContain('SIN');
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
