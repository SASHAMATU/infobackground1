"use client";

import { useEffect, useRef } from "react";

/**
 * Ports the original animated-counter IntersectionObserver: counts up
 * from 0 to the numeric value of `data-count` once the element scrolls
 * into view, using a cubic ease-out over 1400ms. One decimal place is
 * kept if the source value contains a ".", e.g. "6.2".
 */
export function useCounters<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const targets = Array.from(
      container.querySelectorAll<HTMLElement>("[data-count]")
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const el = entry.target as HTMLElement;
          const target = parseFloat(el.dataset.count ?? "0");
          const frac = String(el.dataset.count).includes(".") ? 1 : 0;
          const t0 = performance.now();
          const dur = 1400;
          function step(t: number) {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(frac);
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
