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

import { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { resolveManifest } from '../api/iiif';

const ManuscriptImageViewer = ({ manuscriptId, book, chapter, height = 480 }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const manifestUrl = resolveManifest({ manuscriptId, book, chapter });

  useEffect(() => {
    if (!manifestUrl || !containerRef.current) return undefined;

    const viewer = OpenSeadragon({
      element: containerRef.current,
      tileSources: manifestUrl,
      prefixUrl: '/openseadragon/images/',
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      gestureSettingsTouch: { pinchRotate: false },
      animationTime: 0.6,
      blendTime: 0.2,
      maxZoomPixelRatio: 3,
    });

    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [manifestUrl]);

  // No verified manifest for this view — text-only fallback so the user still
  // sees the verse content via the surrounding reader components.
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

  return (
    <div
      ref={containerRef}
      className="manuscript-image-viewer"
      style={{
        width: '100%',
        height,
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
        viewTransitionName: `codex-image-${manuscriptId}`,
      }}
      aria-label={`${manuscriptId} ${book} ${chapter} manuscript page`}
    />
  );
};

export default ManuscriptImageViewer;
