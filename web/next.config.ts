import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// CSP is built conditionally per configured provider, mirroring the
// "modular, auto-disabled without configuration" philosophy applied to
// analytics elsewhere in this project. Rolled out as Report-Only first —
// flip to the enforcing header once a deploy has run clean with no
// violations reported.
function buildCsp() {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  const connectSrc = ["'self'"];
  const imgSrc = ["'self'", "data:"];
  const frameSrc: string[] = [];

  if (process.env.NEXT_PUBLIC_GTM_ID || process.env.NEXT_PUBLIC_GA_ID) {
    scriptSrc.push("https://www.googletagmanager.com");
    connectSrc.push("https://www.google-analytics.com", "https://*.analytics.google.com");
  }
  if (process.env.NEXT_PUBLIC_META_PIXEL_ID) {
    scriptSrc.push("https://connect.facebook.net");
    connectSrc.push("https://www.facebook.com", "https://connect.facebook.net");
  }
  if (process.env.NEXT_PUBLIC_CLARITY_ID) {
    scriptSrc.push("https://www.clarity.ms");
    connectSrc.push("https://www.clarity.ms", "https://*.clarity.ms");
  }
  if (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) {
    connectSrc.push("https://googleads.g.doubleclick.net");
  }
  if (process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID) {
    scriptSrc.push("https://analytics.tiktok.com");
    connectSrc.push("https://analytics.tiktok.com");
  }
  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    scriptSrc.push("https://challenges.cloudflare.com");
    frameSrc.push("https://challenges.cloudflare.com");
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    connectSrc.push(process.env.NEXT_PUBLIC_SUPABASE_URL);
  }

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src 'self'`,
    `media-src 'self'`,
    `connect-src ${connectSrc.join(" ")}`,
    frameSrc.length ? `frame-src ${frameSrc.join(" ")}` : `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ];
  return directives.join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: buildCsp(),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
