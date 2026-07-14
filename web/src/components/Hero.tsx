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
  const stackRef = useReveal<HTMLDivElement>();

  // title/sub/cta are animated by the GSAP scrub timeline below instead
  // of the generic reveal-on-scroll system, so they use plain refs.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // ==========================================================
  // HERO SCROLL-SCRUB — video never plays on its own; GSAP
  // ScrollTrigger's scroll progress drives video.currentTime, and
  // the same timeline fades the heading/subhead/CTA in and out.
  // Lenis feeds ScrollTrigger a smoothed scroll position.
  //
  // GSAP/ScrollTrigger/Lenis are dynamically imported inside this
  // effect (never at module scope) so nothing touches `window` during
  // server-side rendering of this Client Component.
  // ==========================================================
  useEffect(() => {
    const video = videoRef.current;
    const hero = heroRef.current;
    const titleEl = titleRef.current;
    const subEl = subRef.current;
    const ctaEl = ctaRef.current;
    if (!video || !hero) return;

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    };
    const conn = nav.connection || nav.webkitConnection;
    const lowData = !!(
      conn &&
      (conn.saveData || /^(slow-2g|2g)$/.test(conn.effectiveType || ""))
    );

    function showPosterOnly() {
      video!.pause();
      video!.removeAttribute("preload");
      video!.querySelectorAll("source").forEach((s) => s.remove());
      video!.load();
    }

    // Reduced motion / save-data: static poster background, no pin, no
    // scrub — text is already visible (nothing hides it unless/until
    // initScrub() below actually runs).
    if (reduceMotion || lowData) {
      showPosterOnly();
      return;
    }

    let cancelled = false;
    let timeline: gsap.core.Timeline | null = null;
    let scrubRafId: number | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let ownsLenis = false;
    let gsapRef: typeof import("gsap").gsap | null = null;
    let scrollTriggerRef: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;
    let lenisRef: InstanceType<typeof import("lenis").default> | null = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;

      gsapRef = gsap;
      scrollTriggerRef = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Reuse a shared Lenis instance if one already exists on the
      // page; otherwise create it and wire it into ScrollTrigger. Only
      // an instance WE create gets destroyed on cleanup.
      type LenisWindow = Window & { __lenis?: InstanceType<typeof Lenis> };
      const w = window as LenisWindow;
      let lenis = w.__lenis;
      if (!lenis) {
        lenis = new Lenis();
        w.__lenis = lenis;
        ownsLenis = true;
        lenis.on("scroll", ScrollTrigger.update);
        tickerFn = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);
      }
      lenisRef = lenis;

      function revealVideo() {
        video!.classList.add("is-ready");
      }

      function initScrub() {
        if (cancelled) return;
        if (!isFinite(video!.duration) || video!.duration <= 0) {
          showPosterOnly();
          return;
        }

        let target = 0;
        let current = 0;

        function tick() {
          current += (target - current) * 0.12;
          if (Math.abs(target - current) > 0.001) {
            video!.currentTime = current;
            scrubRafId = requestAnimationFrame(tick);
          } else {
            current = target;
            video!.currentTime = current;
            scrubRafId = null;
          }
        }
        function requestTick() {
          if (scrubRafId === null) scrubRafId = requestAnimationFrame(tick);
        }

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=250%",
            scrub: true,
            pin: true,
            onUpdate: (self) => {
              target = self.progress * video!.duration;
              requestTick();
            },
          },
        });
        if (titleEl) timeline.to(titleEl, { autoAlpha: 0, y: -40, ease: "power2.out", duration: 0.33 }, 0);
        if (subEl) timeline.fromTo(subEl, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power2.out", duration: 0.34 }, 0.33);
        if (ctaEl) timeline.fromTo(ctaEl, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.33 }, 0.67);

        revealVideo();
      }

      // Single error handler covers both "failed before metadata" and
      // "failed mid-scrub" — always falls back to the static poster,
      // and additionally unwinds the timeline/pin if one was built.
      video!.addEventListener(
        "error",
        () => {
          showPosterOnly();
          if (timeline) {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            timeline = null;
            gsap.set([titleEl, subEl, ctaEl].filter(Boolean), { clearProps: "all" });
          }
        },
        { once: true }
      );

      if (video!.readyState >= 1 && video!.duration) initScrub();
      else video!.addEventListener("loadedmetadata", initScrub, { once: true });
    })();

    return () => {
      cancelled = true;
      if (scrubRafId !== null) cancelAnimationFrame(scrubRafId);
      if (timeline) {
        timeline.scrollTrigger?.kill();
        timeline.kill();
        timeline = null;
      }
      // Explicit safety net requested alongside the above: nothing else
      // in this app uses ScrollTrigger, so this only ever affects Hero's
      // own instance(s).
      scrollTriggerRef?.getAll().forEach((st) => st.kill());
      if (gsapRef && tickerFn) gsapRef.ticker.remove(tickerFn);
      if (ownsLenis && lenisRef) {
        lenisRef.destroy();
        delete (window as Window & { __lenis?: unknown }).__lenis;
      }
    };
  }, [reduceMotion]);

  // ==========================================================
  // HERO GLOW — ambient blob drift follows the pointer (desktop only)
  // ==========================================================
  useEffect(() => {
    if (reduceMotion) return;
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const px = e.clientX / innerWidth - 0.5;
      const py = e.clientY / innerHeight - 0.5;
      glow.style.transform = `translate3d(${(px * 18).toFixed(1)}px, ${(py * 14).toFixed(1)}px, 0)`;
    };
    const onLeave = () => {
      glow.style.transform = "";
    };
    hero.addEventListener("mousemove", onMove, { passive: true });
    hero.addEventListener("mouseleave", onLeave);

    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <div className="hero__media" aria-hidden="true">
        <video id="heroVideo" ref={videoRef} muted playsInline preload="auto" poster="/assets/hero-poster.jpg">
          <source src="/assets/hero-scrub-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/assets/hero-scrub-desktop.mp4" type="video/mp4" />
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
        <h1 className="hero__title" ref={titleRef}>
          {t.rich("hero.title", {
            drama: (chunks) => <span className="drama">{chunks}</span>,
          })}
        </h1>
        <p className="hero__sub" ref={subRef}>
          {t("hero.sub")}
        </p>
        <div className="hero__cta" ref={ctaRef}>
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
