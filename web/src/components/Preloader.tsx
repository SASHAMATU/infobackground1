"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SESSION_KEY = "ib-preloaded";

function alreadyPlayed() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export default function Preloader() {
  const reduceMotion = usePrefersReducedMotion();
  // Lazy-init from sessionStorage: on the very first server-rendered load
  // this always agrees with the server (both "not yet played"), so there's
  // no hydration mismatch. On later client-side locale-switch navigations
  // (which remount this component but never touch the server), it reads
  // the already-set flag immediately and skips the flash entirely — the
  // ignition sequence is a first-visit-per-tab thing, not a per-route one.
  const [removed, setRemoved] = useState(alreadyPlayed);
  const [done, setDone] = useState(alreadyPlayed);
  const barRef = useRef<HTMLElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alreadyPlayed()) return;
    if (reduceMotion) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setRemoved(true);
      return;
    }
    const t0 = performance.now();
    const dur = 1300;
    let raf = 0;
    function tick(t: number) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(eased * 100)}%`;
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
        setTimeout(() => setRemoved(true), 800);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  if (removed) return null;

  return (
    <div className={`preloader${done ? " is-done" : ""}`} aria-hidden="true">
      <div className="preloader__mark">
        info<em>background</em>
      </div>
      <div className="preloader__bar">
        <i ref={barRef} />
      </div>
      <div className="preloader__pct" ref={pctRef}>
        0%
      </div>
    </div>
  );
}
