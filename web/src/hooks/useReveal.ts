"use client";

import { useEffect, useRef } from "react";

/**
 * Ports the original single shared IntersectionObserver reveal system:
 * one observer instance for the whole page, elements get `.is-visible`
 * added once and are then unobserved. Attach the returned ref to any
 * element carrying the `.reveal` class (optionally `data-reveal`/`data-d`).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
