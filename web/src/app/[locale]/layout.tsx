import type { Metadata } from "next";
import { Manrope, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

import NoiseOverlay from "@/components/NoiseOverlay";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import PageEffects from "@/components/PageEffects";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  style: ["italic"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});

const LANG_ATTR: Record<string, string> = { ru: "ru", en: "en", ua: "uk" };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const languages: Record<string, string> = {};
  routing.locales.forEach((l) => {
    languages[LANG_ATTR[l]] = `${SITE_URL}/${l}`;
  });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("desc"),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("desc"),
      type: "website",
      url: `${SITE_URL}/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("desc"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Infobackground",
    url: SITE_URL,
    image: `${SITE_URL}/assets/hero-poster.jpg`,
    founder: {
      "@type": "Person",
      name: "Александр Маточкин",
    },
    sameAs: ["https://t.me/infobackground", "https://instagram.com/infobackground"],
  };

  return (
    <html lang={LANG_ATTR[locale] ?? locale} className={`${manrope.variable} ${playfairDisplay.variable} ${jetBrainsMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <NoiseOverlay />
          <CustomCursor />
          <Preloader />
          <AnalyticsScripts />
          <Header />
          <main>{children}</main>
          <Footer />
          <PageEffects />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
