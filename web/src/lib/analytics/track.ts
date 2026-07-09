"use client";

// Fan-out event dispatcher for the conversion events listed in the spec
// (page view, scroll depth, session duration, CTA/phone/WhatsApp/Telegram/
// Instagram clicks, form submission, lead generated). Every provider call
// is individually guarded — with zero analytics env vars configured, this
// entire module is a no-op and touches no global objects.

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: unknown) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  // GTM / GA4 (via dataLayer, matches next/third-parties' GoogleTagManager
  // and GoogleAnalytics components, which both read from window.dataLayer).
  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params });
  }
  // Direct gtag (only present if GA4 was loaded outside of GTM).
  if (window.gtag) {
    window.gtag("event", name, params);
  }
  // Meta Pixel.
  if (window.fbq) {
    window.fbq("trackCustom", name, params);
  }
  // TikTok Pixel.
  if (window.ttq) {
    window.ttq.track(name, params);
  }
}

export const trackPageView = () => trackEvent("page_view");
export const trackScrollDepth = (percent: number) =>
  trackEvent("scroll_depth", { percent });
export const trackCtaClick = (label: string) => trackEvent("cta_click", { label });
export const trackContactClick = (channel: "phone" | "whatsapp" | "telegram" | "instagram") =>
  trackEvent("contact_click", { channel });
export const trackFormSubmit = () => trackEvent("form_submission");
export const trackLeadGenerated = (lang: string) => trackEvent("lead_generated", { lang });
