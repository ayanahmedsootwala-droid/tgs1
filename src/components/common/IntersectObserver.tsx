import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Observer } from 'tailwindcss-intersect';

const IntersectObserver = () => {
  const location = useLocation();

  useEffect(() => {
    // When the location changes, we need to restart the observer
    // to pick up new elements on the page.
    // We use a small timeout to ensure the DOM has updated.
    const timer = setTimeout(() => {
      try {
        if (typeof Observer !== 'undefined' && Observer.restart) {
          Observer.restart();
        }
      } catch (e) {
        console.warn('IntersectObserver error caught:', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

export default IntersectObserver;
