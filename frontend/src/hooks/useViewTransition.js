import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Wraps react-router navigation in document.startViewTransition where supported,
 * giving Chrome 111+ users a smooth cross-fade between routes for free.
 *
 * On unsupported browsers (Safari < 18, older Firefox) it just navigates
 * normally — no animation, no breakage.
 *
 * Pair with CSS:
 *   ::view-transition-old(root) { animation: ... }
 *   ::view-transition-new(root) { animation: ... }
 */
export function useViewTransition() {
  const navigate = useNavigate();

  return useCallback((to, options) => {
    if (typeof document === 'undefined' || !document.startViewTransition) {
      navigate(to, options);
      return;
    }
    document.startViewTransition(() => navigate(to, options));
  }, [navigate]);
}
