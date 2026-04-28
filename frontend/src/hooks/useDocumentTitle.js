import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'All4Yah';
const ORIGIN = 'https://all4yah.com';

/**
 * Sets document.title for the current page and reverts on unmount.
 * Pass a string to override the full title, or just the page name to
 * append " · All4Yah".
 */
export function useDocumentTitle(title, { full = false } = {}) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = full ? title : `${title} · ${SITE_NAME}`;
    return () => { document.title = previous; };
  }, [title, full]);
}

/**
 * Updates <link rel="canonical"> to match the current pathname.
 * Falls back to creating the link if it doesn't exist.
 * Mount this once at app level (or per page if path is known statically).
 */
export function useCanonicalUrl(pathname) {
  const location = useLocation();
  const path = pathname ?? location.pathname;

  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    const previous = link.href;
    link.href = `${ORIGIN}${path}`;
    return () => { link.href = previous; };
  }, [path]);
}
