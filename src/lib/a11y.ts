import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(QUERY);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    try {
      mediaQuery.addEventListener('change', listener);
    } catch (error) {
      // Safari < 14 fallback
      // @ts-expect-error deprecated API fallback
      mediaQuery.addListener(listener);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', listener);
      } catch (error) {
        // @ts-expect-error deprecated API fallback
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return prefersReduced;
}
