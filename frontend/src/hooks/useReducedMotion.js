import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion.
 * Used for accessibility to disable/reduce animations.
 *
 * @returns {boolean} true if user prefers reduced motion
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * const variants = prefersReducedMotion ? {} : animatedVariants;
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Returns animation variants that respect reduced motion preference.
 * When reduced motion is preferred, returns empty/instant variants.
 *
 * @param {Object} animatedVariants - The full animation variants
 * @param {Object} reducedVariants - Optional reduced motion variants (defaults to empty)
 * @returns {Object} Appropriate variants based on user preference
 */
export const useMotionVariants = (animatedVariants, reducedVariants = {}) => {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedVariants : animatedVariants;
};

export default useReducedMotion;
