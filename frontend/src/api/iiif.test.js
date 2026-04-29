/**
 * Resolver behavior for the IIIF manifest registry.
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §3.A.1
 */

import { describe, it, expect } from 'vitest';
import {
  resolveManifest,
  hasVerifiedManifests,
  MANIFEST_REGISTRY,
  MIRRORED_PAGES,
} from './iiif';

describe('resolveManifest', () => {
  it('returns null for unverified manuscripts (default state)', () => {
    expect(resolveManifest({ manuscriptId: 'SIN', book: 'JHN', chapter: 1 })).toBeNull();
    expect(resolveManifest({ manuscriptId: 'WLC', book: 'GEN', chapter: 1 })).toBeNull();
  });

  it('returns null for unknown manuscripts', () => {
    expect(resolveManifest({ manuscriptId: 'NOPE', book: 'GEN', chapter: 1 })).toBeNull();
  });

  it('normalizes input casing for both manuscript and book', () => {
    expect(resolveManifest({ manuscriptId: 'sin', book: 'jhn', chapter: 1 })).toBeNull();
    expect(resolveManifest({ manuscriptId: ' SIN ', book: 'JHN ', chapter: 1 })).toBeNull();
  });

  it('handles missing or undefined inputs without throwing', () => {
    expect(() => resolveManifest({})).not.toThrow();
    expect(resolveManifest({})).toBeNull();
    expect(resolveManifest({ manuscriptId: null })).toBeNull();
  });
});

describe('hasVerifiedManifests', () => {
  it('returns false for every registered manuscript by default', () => {
    for (const id of Object.keys(MANIFEST_REGISTRY)) {
      expect(hasVerifiedManifests(id)).toBe(false);
    }
  });

  it('returns false for unknown manuscripts', () => {
    expect(hasVerifiedManifests('NOPE')).toBe(false);
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
