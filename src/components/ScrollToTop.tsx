import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') {
      return;
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (error) {
      // Fallback for environments (like jsdom) that only support the legacy signature.
      try {
        window.scrollTo(0, 0);
      } catch {
        // If scrolling still fails we silently ignore the error; this keeps tests
        // and non-browser environments from crashing while preserving production behaviour.
      }
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
