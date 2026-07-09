"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const NAV_ITEMS = [
  { href: "#approach", key: "nav.approach" },
  { href: "#services", key: "nav.services" },
  { href: "#process", key: "nav.process" },
  { href: "#whyus", key: "nav.whyus" },
  { href: "#testimonials", key: "nav.testimonials" },
  { href: "#contact", key: "nav.contacts" },
] as const;

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}`} id="header">
      <Link className="logo" href="#hero" aria-label="Infobackground">
        info<em>background</em>
      </Link>
      <nav className={`nav${navOpen ? " is-open" : ""}`} id="nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setNavOpen(false)}>
            {t(item.key)}
          </a>
        ))}
      </nav>
      <div className="header__right">
        <div className="lang" role="group" aria-label="Language">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              className={l === locale ? "is-active" : ""}
            >
              {l === "ua" ? "UA" : l.toUpperCase()}
            </Link>
          ))}
        </div>
        <a className="btn btn--primary" href="#contact">
          <span>{t("header.cta")}</span>
        </a>
        <button
          className={`burger${navOpen ? " is-open" : ""}`}
          id="burger"
          aria-label="Menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <i />
        </button>
      </div>
    </header>
  );
}
