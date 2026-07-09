"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const STACK_CHIPS = [
  "AI",
  "Claude",
  "Figma",
  "Tilda",
  "Webflow",
  "n8n",
  "ManyChat",
  "OpenAI",
  "Telegram",
  "Make",
];

export default function Hero() {
  const t = useTranslations();
  const reduceMotion = usePrefersReducedMotion();

  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const subRef = useReveal<HTMLParagraphElement>();
  const ctaRef = useReveal<HTMLDivElement>();
  const stackRef = useReveal<HTMLDivElement>();

  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Marquee: duplicate chips once for a seamless CSS-driven loop.
  const trackHtml = (
    <>
      {STACK_CHIPS.concat(STACK_CHIPS).map((chip, i) => (
        <span className="chip" key={`${chip}-${i}`}>
          <i />
          {chip}
        </span>
      ))}
    </>
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    };
    const conn = nav.connection || nav.webkitConnection;
    const lowData = !!(
      conn &&
      (conn.saveData || /^(slow-2g|2g)$/.test(conn.effectiveType || ""))
    );

    if (reduceMotion || lowData) {
      video.pause();
      video.removeAttribute("autoplay");
      video.removeAttribute("src");
      video.querySelectorAll("source").forEach((s) => s.remove());
      video.load();
    } else {
      video.playbackRate = 0.65;
      const reveal = () => video.classList.add("is-ready");
      if (video.readyState >= 3) reveal();
      else video.addEventListener("canplay", reveal, { once: true });
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const hero = heroRef.current;
    const media = mediaRef.current;
    const glow = glowRef.current;
    if (!hero || !media) return;

    let onMove: ((e: MouseEvent) => void) | undefined;
    let onLeave: (() => void) | undefined;
    if (glow && window.matchMedia("(pointer: fine)").matches) {
      onMove = (e: MouseEvent) => {
        const px = e.clientX / innerWidth - 0.5;
        const py = e.clientY / innerHeight - 0.5;
        glow.style.transform = `translate3d(${(px * 18).toFixed(1)}px, ${(py * 14).toFixed(1)}px, 0)`;
      };
      onLeave = () => {
        glow.style.transform = "";
      };
      hero.addEventListener("mousemove", onMove, { passive: true });
      hero.addEventListener("mouseleave", onLeave);
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.scrollY < hero.offsetHeight + 200) {
          media.style.transform = `translate3d(0, ${(window.scrollY * 0.16).toFixed(1)}px, 0)`;
        }
        ticking = false;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (onMove) hero.removeEventListener("mousemove", onMove);
      if (onLeave) hero.removeEventListener("mouseleave", onLeave);
      removeEventListener("scroll", onScroll);
    };
  }, [reduceMotion]);

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <div className="hero__media" aria-hidden="true" ref={mediaRef}>
        <video
          id="heroVideo"
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/hero-poster.jpg"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" ref={glowRef}>
        <span />
        <span />
        <span />
      </div>
      <div className="hero__deco" aria-hidden="true">
        <span className="hero__ring hero__ring--a" />
        <span className="hero__ring hero__ring--b" />
        <span className="hero__dot" />
      </div>

      <div className="wrap">
        <p className="eyebrow hero__eyebrow reveal" ref={eyebrowRef}>
          {t("hero.eyebrow")}
        </p>
        <h1 className="hero__title reveal" data-d="1" ref={titleRef}>
          {t.rich("hero.title", {
            drama: (chunks) => <span className="drama">{chunks}</span>,
          })}
        </h1>
        <p className="hero__sub reveal" data-d="2" ref={subRef}>
          {t("hero.sub")}
        </p>
        <div className="hero__cta reveal" data-d="3" ref={ctaRef}>
          <a className="btn btn--primary" href="#contact">
            <span>{t("hero.cta1")}</span>
            <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M3 9h11M10 4.5 14.5 9 10 13.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a className="btn btn--ghost" href="#services">
            <span>{t("hero.cta2")}</span>
          </a>
        </div>
        <div className="hero__stack reveal" data-d="4" ref={stackRef}>
          <span className="hero__stack-label">{t("hero.stack")}</span>
          <div className="marquee">
            <div className="marquee__track" ref={trackRef}>
              {trackHtml}
            </div>
          </div>
        </div>
      </div>
      <div className="hero__scroll" aria-hidden="true">
        scroll
      </div>
    </section>
  );
}
