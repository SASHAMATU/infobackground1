"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Ports the original 3D-tilt + cursor-spotlight effect used on
 * .principle / .service / .quote / .num / .testi__arrow.
 *
 * Writes directly to el.style (never React state) so mousemove-frequency
 * updates don't trigger re-renders. Gated to fine pointers + no reduced
 * motion, same as the original. Skips while an ancestor
 * `.testi__viewport` is mid-drag (set by the testimonials carousel).
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    function onMove(e: MouseEvent) {
      if (el!.closest(".testi__viewport.is-dragging")) return;
      const r = el!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const wobble = px * py * -6;
      el!.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) rotateZ(${wobble.toFixed(2)}deg) scale3d(1.04,1.04,1.04)`;
      el!.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
      el!.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
    }
    function onLeave() {
      el!.style.transform = "";
    }

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  return ref;
}
