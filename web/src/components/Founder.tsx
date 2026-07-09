"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";

export default function Founder() {
  const t = useTranslations();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const quoteRef = useReveal<HTMLParagraphElement>();
  const textRef = useReveal<HTMLParagraphElement>();
  const signRef = useReveal<HTMLParagraphElement>();
  const photoRef = useReveal<HTMLDivElement>();

  return (
    <section className="founder" id="founder">
      <div className="wrap">
        <div>
          <p className="eyebrow reveal" ref={eyebrowRef}>
            {t("f.eyebrow")}
          </p>
          <h2 className="h2 reveal" data-d="1" ref={titleRef}>
            {t("f.title")}
          </h2>
          <p className="founder__quote reveal" data-d="2" ref={quoteRef}>
            {t.rich("f.quote", {
              accent: (chunks) => <span className="accent">{chunks}</span>,
            })}
          </p>
          <p className="founder__text reveal" data-d="3" ref={textRef}>
            {t("f.text")}
          </p>
          <p className="founder__sign reveal" data-d="4" ref={signRef}>
            <span>
              <b>{t("f.name")}</b>
              <span>{t("f.role")}</span>
            </span>
          </p>
        </div>
        <div className="founder__photo reveal" data-d="2" data-reveal="right" ref={photoRef}>
          <Image
            src="/assets/founder.webp"
            alt={t("f.alt")}
            width={720}
            height={907}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
