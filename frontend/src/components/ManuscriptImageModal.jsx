/**
 * ManuscriptImageModal — overlay that mounts ManuscriptImageViewer on demand.
 *
 * The viewer (and its OpenSeadragon dep, ~120 KB) is lazy-imported via
 * React.lazy, so the bundle cost only lands on users who open the modal.
 *
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §3.A.1
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { listVerifiedManuscripts } from '../api/iiif';
import '../styles/manuscript-image-modal.css';

const ManuscriptImageViewer = lazy(() => import('./ManuscriptImageViewer'));

// `inset: 0` defaults to `100vh` for height; on iOS Safari that's the
// LARGEST viewport (with URL bar hidden), so the bottom of the modal can
// sit below the visible area when the URL bar is shown — hiding the close
// button. `100dvh` (dynamic viewport height) tracks the visible viewport
// and avoids that. iOS Safari 15.4+ / all modern browsers.
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '100dvh',
  background: 'rgba(0, 0, 0, 0.78)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.5rem',
  borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
  color: 'var(--brand-gold, #F9E4A4)',
  fontFamily: 'Cinzel, serif',
};

const bodyStyle = {
  flex: 1,
  padding: '1rem 1.5rem 1.5rem',
  overflow: 'hidden',
};

const closeBtnStyle = {
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  color: 'rgba(255, 255, 255, 0.85)',
  borderRadius: 6,
  padding: '0.4rem 0.8rem',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
};

const pickerStyle = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const pickerBtnStyle = (active) => ({
  padding: '0.35rem 0.85rem',
  background: active ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.06)',
  border: active ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 999,
  color: active ? '#F9E4A4' : 'rgba(255, 255, 255, 0.7)',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.85rem',
});

const ManuscriptImageModal = ({ open, onClose, initialManuscriptId, book, chapter }) => {
  const verified = listVerifiedManuscripts();
  const [activeId, setActiveId] = useState(initialManuscriptId ?? verified[0]?.id ?? null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const active = verified.find((m) => m.id === activeId) ?? verified[0];

  // Click on the dimmed overlay (above the sheet on mobile) closes the
  // modal. Stop the event from triggering on clicks inside the sheet.
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manuscript-image-title"
      onClick={handleOverlayClick}
    >
      <div className="miv-sheet">
        <header style={headerStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
            <h2 id="manuscript-image-title" style={{ margin: 0, fontSize: '1.15rem' }}>
              Manuscript page imagery
            </h2>
            {verified.length > 1 ? (
              <div style={pickerStyle} role="tablist" aria-label="Codex picker">
                {verified.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={m.id === active?.id}
                    style={pickerBtnStyle(m.id === active?.id)}
                    onClick={() => setActiveId(m.id)}
                  >
                    {m.manuscript}
                  </button>
                ))}
              </div>
            ) : active ? (
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                {active.manuscript}
              </span>
            ) : null}
          </div>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Close manuscript imagery">
            Close
          </button>
        </header>

        <div style={bodyStyle}>
          {active ? (
            <Suspense
              fallback={
                <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingTop: '4rem' }}>
                  Loading deep-zoom viewer…
                </div>
              }
            >
              <ManuscriptImageViewer
                key={`${active.id}:${book ?? '_'}:${chapter ?? '_'}`}
                manuscriptId={active.id}
                book={book}
                chapter={chapter}
                ariaLabel={`${active.manuscript} digital facsimile${book ? `, ${book} ${chapter ?? ''}`.trim() : ''}`}
                height="100%"
              />
            </Suspense>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingTop: '4rem' }}>
              No verified manuscript imagery is available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManuscriptImageModal;
