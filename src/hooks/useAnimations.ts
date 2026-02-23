"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Intersection-observer hook – triggers once when element scrolls into view.
 * Reusable across every page that needs scroll-reveal.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/**
 * Staggered reveal – returns className helpers for children with index-based delay.
 */
export function useStagger(visible: boolean, baseDelay = 80) {
  const getClass = useCallback(
    (index: number) =>
      visible ? "animate-slide-up" : "opacity-0 translate-y-8",
    [visible]
  );

  const getStyle = useCallback(
    (index: number) => ({ animationDelay: `${index * baseDelay}ms` }),
    [baseDelay]
  );

  return { getClass, getStyle };
}

/**
 * Mounted state hook – useful for page-enter animations.
 * Returns true after first render (after a micro-tick).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

/**
 * Scroll-based parallax offset (lightweight).
 */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
}
