import { useEffect, useState } from 'react';

/**
 * Detects the user preference for reduced motion in an SSR-safe way.
 *
 * The hook mirrors the behaviour of CSS' `prefers-reduced-motion` media query
 * and will update whenever the preference changes.
 */
export function useReducedMotion() {
  const getPreference = () => {
    if (typeof window === 'undefined') return false;
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    return query?.matches ?? false;
  };

  const [reduced, setReduced] = useState(getPreference);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setReduced(mediaQuery.matches);
    };

    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return reduced;
}

