// src/hooks/useInView.js
import { useRef, useState, useEffect, useCallback } from 'react';
export default function useInView(options = {}, { once = true } = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  const ref = useCallback((node) => {
    // cleanup observer cũ
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (once) obs.unobserve(entry.target);
      } else if (!once) {
        setIsVisible(false);
      }
    }, options);

    obs.observe(node);
    observerRef.current = obs;
  }, [once, options]);

  useEffect(() => () => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  return [ref, isVisible];
}
