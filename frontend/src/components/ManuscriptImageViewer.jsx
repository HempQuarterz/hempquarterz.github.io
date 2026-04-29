/**
 * ManuscriptImageViewer — IIIF deep-zoom panel powered by OpenSeadragon.
 *
 * Mounted lazily (React.lazy in the parent) so OpenSeadragon's ~120 KB only
 * loads when the user explicitly opens the image view. When no manifest URL
 * resolves, the component renders a text-only fallback so the verse is still
 * readable.
 *
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §3.A.1
 */

import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { resolveManifest } from '../api/iiif';

/**
 * Extract IIIF Image API tile-source URLs from a IIIF Presentation v2/v3
 * manifest. OpenSeadragon's `tileSources` arg cannot parse a Presentation
 * manifest directly — it needs per-canvas Image API `info.json` URLs.
 */
const extractTileSources = (manifest) => {
  if (!manifest) return [];

  // IIIF Presentation v2 — sequences[0].canvases[].images[0].resource.service
  const v2Canvases = manifest.sequences?.[0]?.canvases;
  if (Array.isArray(v2Canvases) && v2Canvases.length) {
    return v2Canvases
      .map((c) => c.images?.[0]?.resource?.service?.['@id'])
      .filter(Boolean)
      .map((id) => `${id.replace(/\/+$/, '')}/info.json`);
  }

  // IIIF Presentation v3 — items[].items[0].items[0].body.service[0].id
  const v3Canvases = manifest.items;
  if (Array.isArray(v3Canvases) && v3Canvases.length) {
    return v3Canvases
      .map((c) => {
        const body = c.items?.[0]?.items?.[0]?.body;
        const svc = (body?.service && (Array.isArray(body.service) ? body.service[0] : body.service)) || null;
        return svc?.id || svc?.['@id'] || null;
      })
      .filter(Boolean)
      .map((id) => `${id.replace(/\/+$/, '')}/info.json`);
  }

  return [];
};

const ManuscriptImageViewer = ({
  manifestUrl: manifestUrlProp,
  manuscriptId,
  book,
  chapter,
  height = 480,
  ariaLabel,
}) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);
  const [tileSources, setTileSources] = useState(null);

  // Direct prop wins, otherwise resolve via the registry.
  const manifestUrl =
    manifestUrlProp ?? resolveManifest({ manuscriptId, book, chapter });

  // Step 1 — fetch the IIIF Presentation manifest, derive Image API URLs.
  useEffect(() => {
    if (!manifestUrl) {
      setTileSources(null);
      setError(null);
      return undefined;
    }
    let cancelled = false;
    setError(null);
    setTileSources(null);

    fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((manifest) => {
        if (cancelled) return;
        const sources = extractTileSources(manifest);
        if (!sources.length) {
          setError('Manifest contained no resolvable Image API services');
          return;
        }
        setTileSources(sources);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load manifest');
      });

    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  // Step 2 — once tileSources is populated, mount OpenSeadragon.
  useEffect(() => {
    if (!tileSources || !containerRef.current) return undefined;

    const viewer = OpenSeadragon({
      element: containerRef.current,
      tileSources,
      sequenceMode: tileSources.length > 1,
      showReferenceStrip: false,
      prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@6/build/openseadragon/images/',
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      gestureSettingsTouch: { pinchRotate: false },
      animationTime: 0.6,
      blendTime: 0.2,
      maxZoomPixelRatio: 3,
      crossOriginPolicy: 'Anonymous',
    });

    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [tileSources]);

  if (!manifestUrl) {
    return (
      <div
        className="manuscript-image-fallback"
        role="status"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-tertiary, rgba(255,255,255,0.6))',
          fontStyle: 'italic',
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: 8,
        }}
      >
        No verified manuscript image is available for this passage yet.
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="manuscript-image-error"
        role="alert"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#ef9a9a',
          border: '1px solid rgba(198, 40, 40, 0.4)',
          background: 'rgba(198, 40, 40, 0.1)',
          borderRadius: 8,
        }}
      >
        Could not load manuscript imagery: {error}
      </div>
    );
  }

  if (!tileSources) {
    return (
      <div
        className="manuscript-image-loading"
        role="status"
        aria-live="polite"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        Loading manifest…
      </div>
    );
  }

  const computedLabel =
    ariaLabel ??
    ([manuscriptId, book, chapter].filter(Boolean).join(' ') ||
      'Manuscript page imagery');

  return (
    <div
      ref={containerRef}
      className="manuscript-image-viewer"
      style={{
        width: '100%',
        height,
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        viewTransitionName: manuscriptId
          ? `codex-image-${String(manuscriptId).toLowerCase()}`
          : undefined,
      }}
      aria-label={computedLabel}
    />
  );
};

export default ManuscriptImageViewer;
