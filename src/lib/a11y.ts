import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Hook that returns whether the user prefers reduced motion.
 */
export function useReducedMotion(defaultValue = false): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    updatePreference(mediaQueryList);

    const listener = (event: MediaQueryListEvent) => updatePreference(event);

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    }

    // Fallback for older browsers
    mediaQueryList.addListener(listener);
    return () => mediaQueryList.removeListener(listener);
  }, []);

  return prefersReducedMotion;
}
