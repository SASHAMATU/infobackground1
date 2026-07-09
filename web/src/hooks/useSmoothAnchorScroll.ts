"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Ports the original eased anchor-scroll: intercepts clicks on same-page
 * `a[href^="#"]` links, animates scrollY with a cubic ease-out over a
 * distance-scaled duration, accounting for the fixed header's height.
 * Mount once (e.g. in the page-level client wrapper).
 */
export function useSmoothAnchorScroll() {
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    function smoothScrollTo(target: HTMLElement) {
      const headerOffset = 88;
      const startY = window.scrollY;
      const targetY = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - headerOffset
      );
      const distance = targetY - startY;
      if (reduceMotion || Math.abs(distance) < 2) {
        window.scrollTo(0, targetY);
        return;
      }
      const duration = Math.min(1000, Math.max(400, Math.abs(distance) * 0.5));
      const t0 = performance.now();
      const ease = (p: number) => 1 - Math.pow(1 - p, 3);
      function step(t: number) {
        const p = Math.min(1, (t - t0) / duration);
        window.scrollTo(0, startY + distance * ease(p));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
      history.pushState(null, "", id);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduceMotion]);
}
