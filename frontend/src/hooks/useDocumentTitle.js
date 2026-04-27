import { useEffect } from 'react';

const SITE_NAME = 'All4Yah';

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
