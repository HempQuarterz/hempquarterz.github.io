/**
 * Visual upgrades regression test.
 *
 * File-content assertions over the CSS / HTML changes shipped during the
 * 2026-04-27 frontend visual upgrades phase. These guard against silent
 * regressions when the relevant files are refactored. Asserting on file
 * text rather than rendered DOM keeps the test fast and platform-free —
 * the actual browser rendering is verified in production via Lighthouse.
 *
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../..');
const read = (rel) => readFileSync(resolve(repoRoot, rel), 'utf8');

describe('B.1 — typography polish (scripture-reader.css)', () => {
  const css = read('src/styles/scripture-reader.css');

  it('uses text-wrap: pretty for orphan elimination', () => {
    expect(css).toMatch(/text-wrap:\s*pretty/);
  });

  it('uses hanging-punctuation for typographic margins', () => {
    expect(css).toMatch(/hanging-punctuation:\s*first\s+allow-end\s+last/);
  });
});

describe('B.2c — persistent view-transition elements', () => {
  it('covenant-dock declares view-transition-name: dock', () => {
    const css = read('src/styles/covenant-dock.css');
    expect(css).toMatch(/view-transition-name:\s*dock/);
  });

  it('breadcrumb-ribbon declares view-transition-name: header', () => {
    const css = read('src/styles/breadcrumb-ribbon.css');
    expect(css).toMatch(/view-transition-name:\s*header/);
  });

  it('view-transitions.css opts dock + header out of root cross-fade', () => {
    const css = read('src/styles/view-transitions.css');
    expect(css).toMatch(/::view-transition-group\(dock\)/);
    expect(css).toMatch(/::view-transition-group\(header\)/);
    expect(css).toMatch(/::view-transition-old\(dock\)/);
    expect(css).toMatch(/::view-transition-new\(header\)/);
  });
});

describe('A.2 — Ezra SIL replaces Noto Serif Hebrew', () => {
  it('index.html imports Ezra+SIL via Google Fonts', () => {
    const html = read('index.html');
    expect(html).toMatch(/family=Ezra\+SIL/);
  });

  it('index.html no longer imports Noto+Serif+Hebrew', () => {
    const html = read('index.html');
    expect(html).not.toMatch(/family=Noto\+Serif\+Hebrew/);
  });

  it('manuscripts.css uses Ezra SIL for Hebrew text-family', () => {
    const css = read('src/styles/manuscripts.css');
    expect(css).toMatch(/font-family:\s*'Ezra SIL'/);
    expect(css).not.toMatch(/font-family:\s*'Noto Serif Hebrew'/);
  });

  it('scripture-reader.css uses Ezra SIL for Hebrew', () => {
    const css = read('src/styles/scripture-reader.css');
    expect(css).toMatch(/font-family:\s*'Ezra SIL'/);
    expect(css).not.toMatch(/font-family:\s*'Noto Serif Hebrew'/);
  });
});

describe('B.3 — native CSS scroll-driven reveals', () => {
  const css = read('src/styles/scroll-effects.css');

  it('double-gates with prefers-reduced-motion + @supports animation-timeline', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
    expect(css).toMatch(/@supports\s*\(animation-timeline:\s*view\(\)\)/);
  });

  it('drives verse entry off animation-timeline: view()', () => {
    expect(css).toMatch(/animation-timeline:\s*view\(\)/);
    expect(css).toMatch(/animation-range:\s*entry/);
    expect(css).toMatch(/@keyframes\s+ink-spread-entry/);
  });

  it('drives parchment patina off animation-timeline: scroll(root)', () => {
    expect(css).toMatch(/animation-timeline:\s*scroll\(root\)/);
    expect(css).toMatch(/@keyframes\s+parchment-aging-deepen/);
  });

  it('App.jsx loads scroll-effects.css globally', () => {
    const app = read('src/App.jsx');
    expect(app).toMatch(/import\s+['"]\.\/styles\/scroll-effects\.css['"]/);
  });
});

describe('Phase H D.3 — IIIF tile caching in custom SW', () => {
  const sw = read('public/sw.js');

  it('VERSION bumped past v1 (so existing clients clear stale caches on activate)', () => {
    expect(sw).toMatch(/const\s+VERSION\s*=\s*['"]all4yah-v[2-9]/);
  });

  it('declares IIIF tile + manifest caches', () => {
    expect(sw).toMatch(/IIIF_TILE_CACHE\s*=\s*`iiif-tiles-\$\{VERSION\}`/);
    expect(sw).toMatch(/IIIF_MANIFEST_CACHE\s*=\s*`iiif-manifests-\$\{VERSION\}`/);
  });

  it('caps the tile cache to a finite number of entries', () => {
    expect(sw).toMatch(/IIIF_TILE_CACHE_MAX\s*=\s*\d+/);
    expect(sw).toMatch(/cacheFirstCapped\s*\(\s*request,\s*IIIF_TILE_CACHE,\s*IIIF_TILE_CACHE_MAX\s*\)/);
  });

  it('uses stale-while-revalidate for IIIF manifest / info.json', () => {
    expect(sw).toMatch(/staleWhileRevalidate\s*\(/);
    expect(sw).toMatch(/IIIF_DESCRIPTOR_PATTERN/);
  });

  it('matches IIIF tile URLs (jpg/png/webp under /iiif or /iiifimage)', () => {
    expect(sw).toMatch(/IIIF_TILE_PATTERN\s*=\s*\/.*iiif/);
    // Spot-check the regex catches a real tile URL pattern.
    const match = sw.match(/const\s+IIIF_TILE_PATTERN\s*=\s*(\/.+?\/[gimsuy]*);/);
    expect(match).not.toBeNull();
    const re = new RegExp(match[1].slice(1, match[1].lastIndexOf('/')), match[1].split('/').pop());
    expect(re.test('/iiifimage/MSS_Vat.gr.1209/Vat.gr.1209_0001.jp2/full/200,/0/default.jpg')).toBe(true);
    expect(re.test('/iiif/some-codex/canvas/p0001/full/full/0/default.webp')).toBe(true);
    expect(re.test('/api/users/123')).toBe(false);
  });

  it('IIIF handler runs BEFORE the same-origin bailout (cross-origin tiles are intercepted)', () => {
    const idxIIIF = sw.indexOf('IIIF_TILE_PATTERN.test');
    const idxBailout = sw.indexOf('Other cross-origin');
    expect(idxIIIF).toBeGreaterThan(-1);
    expect(idxBailout).toBeGreaterThan(idxIIIF);
  });
});

describe('Phase B Subgrid — ParallelPassageViewer cross-card alignment', () => {
  const css = read('src/styles/parallel-passage.css');

  it('pp-source and pp-parallel use grid-template-rows: subgrid', () => {
    expect(css).toMatch(/grid-template-rows:\s*subgrid/);
  });

  it('parent .pp-grid declares the three explicit row tracks', () => {
    expect(css).toMatch(/\.pp-grid\s*\{[^}]*grid-template-rows:\s*auto\s+1fr\s+auto/s);
  });

  it('subgrid children span all three rows', () => {
    expect(css).toMatch(/grid-row:\s*span\s+3/);
  });

  it('@supports fallback for pre-subgrid browsers', () => {
    expect(css).toMatch(/@supports\s+not\s+\(grid-template-rows:\s*subgrid\)/);
  });

  it('manuscripts.css no longer carries the orphaned .parallel-view rule', () => {
    const ms = read('src/styles/manuscripts.css');
    expect(ms).not.toMatch(/^\.parallel-view\s*\{/m);
  });
});
