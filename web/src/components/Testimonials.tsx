"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";
import { useTilt } from "@/hooks/useTilt";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMergedRef } from "@/hooks/useMergedRef";

const AVATARS = [
  { prefix: "t0", ava: "СВ" },
  { prefix: "t1", ava: "МД" },
  { prefix: "t2", ava: "ЕК" },
] as const;

function QuoteCard({ prefix, ava }: (typeof AVATARS)[number]) {
  const t = useTranslations();
  const tiltRef = useTilt<HTMLElement>();

  return (
    <figure className="quote" ref={tiltRef}>
      <blockquote>
        {t.rich(`${prefix}.q`, {
          accent: (chunks) => <span className="accent">{chunks}</span>,
        })}
      </blockquote>
      <figcaption>
        <span className="quote__ava">{ava}</span>
        <span>
          <b>{t(`${prefix}.name`)}</b>
          <span>{t(`${prefix}.role`)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const t = useTranslations();
  const reduceMotion = usePrefersReducedMotion();

  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const leadRef = useReveal<HTMLParagraphElement>();
  const carouselRevealRef = useReveal<HTMLDivElement>();

  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prevTiltRef = useTilt<HTMLButtonElement>();
  const nextTiltRef = useTilt<HTMLButtonElement>();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const prevMergedRef = useMergedRef(prevTiltRef, prevRef);
  const nextMergedRef = useMergedRef(nextTiltRef, nextRef);

  // Cursor glow across the section.
  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    function onMove(e: MouseEvent) {
      const r = section!.getBoundingClientRect();
      glow!.style.transform = `translate(${(e.clientX - r.left).toFixed(1)}px, ${(e.clientY - r.top).toFixed(1)}px) translate(-50%,-50%)`;
    }
    function onEnter() {
      glow!.classList.add("is-active");
    }
    function onLeave() {
      glow!.classList.remove("is-active");
    }
    section.addEventListener("mousemove", onMove, { passive: true });
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  // Drag/swipe momentum + arrow navigation.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    if (!viewport || !track) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let momentumRaf = 0;

    function stopMomentum() {
      if (momentumRaf) cancelAnimationFrame(momentumRaf);
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      stopMomentum();
      isDown = true;
      viewport!.classList.add("is-dragging");
      startX = e.clientX;
      startScroll = viewport!.scrollLeft;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      viewport!.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      viewport!.scrollLeft = startScroll - dx;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
    }
    function endDrag() {
      if (!isDown) return;
      isDown = false;
      viewport!.classList.remove("is-dragging");
      if (!reduceMotion && Math.abs(velocity) > 0.02) {
        let v = velocity * 16;
        const coast = () => {
          viewport!.scrollLeft -= v;
          v *= 0.94;
          if (Math.abs(v) > 0.4) momentumRaf = requestAnimationFrame(coast);
        };
        coast();
      }
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", endDrag);

    function cardStep() {
      const card = track!.querySelector<HTMLElement>(".quote");
      if (!card) return viewport!.clientWidth * 0.8;
      const gap = parseFloat(getComputedStyle(track!).gap) || 20;
      return card.getBoundingClientRect().width + gap;
    }
    function onPrev() {
      stopMomentum();
      viewport!.scrollBy({ left: -cardStep(), behavior: reduceMotion ? "auto" : "smooth" });
    }
    function onNext() {
      stopMomentum();
      viewport!.scrollBy({ left: cardStep(), behavior: reduceMotion ? "auto" : "smooth" });
    }
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      stopMomentum();
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("pointerleave", endDrag);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, [reduceMotion]);

  return (
    <section id="testimonials" ref={sectionRef}>
      <div className="testi__cursor-glow" aria-hidden="true" ref={glowRef} />
      <div className="wrap">
        <p className="eyebrow reveal" ref={eyebrowRef}>
          {t("t.eyebrow")}
        </p>
        <h2 className="h2 reveal" data-d="1" ref={titleRef}>
          {t("t.title")}
        </h2>
        <p className="lead reveal" data-d="2" ref={leadRef}>
          {t("t.lead")}
        </p>

        <div className="testi__carousel reveal" data-d="3" ref={carouselRevealRef}>
          <button
            className="testi__arrow testi__arrow--prev"
            type="button"
            aria-label={t("t.prev")}
            ref={prevMergedRef}
          >
            <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M11 3.5 5.5 9 11 14.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="testi__viewport" id="testiViewport" ref={viewportRef}>
            <div className="testi__track" id="testiTrack" ref={trackRef}>
              {AVATARS.map((a) => (
                <QuoteCard key={a.prefix} {...a} />
              ))}
            </div>
          </div>
          <button
            className="testi__arrow testi__arrow--next"
            type="button"
            aria-label={t("t.next")}
            ref={nextMergedRef}
          >
            <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M7 3.5 12.5 9 7 14.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
