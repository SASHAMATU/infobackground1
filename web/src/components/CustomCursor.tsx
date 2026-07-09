"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function CustomCursor() {
  const reduceMotion = usePrefersReducedMotion();
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let raf = 0;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
    }
    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      if (cursor) cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    }
    addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    function onEnter() {
      cursor?.classList.add("is-active");
    }
    function onLeave() {
      cursor?.classList.remove("is-active");
    }
    const interactive = document.querySelectorAll("a,button,select,input,textarea");
    interactive.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      interactive.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [reduceMotion]);

  return <div className="cursor" aria-hidden="true" id="cursor" ref={cursorRef} />;
}
