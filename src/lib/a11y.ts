import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getMediaQueryList() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return undefined;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY);
}

export function useReducedMotion(defaultValue = false) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(defaultValue);

  useEffect(() => {
    const mediaQueryList = getMediaQueryList();
    if (!mediaQueryList) {
      return undefined;
    }

    const updatePreference = () => setPrefersReducedMotion(mediaQueryList.matches);

    updatePreference();

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', updatePreference);
      return () => mediaQueryList.removeEventListener('change', updatePreference);
    }

    mediaQueryList.addListener(updatePreference);
    return () => mediaQueryList.removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
