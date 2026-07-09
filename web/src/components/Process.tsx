"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";

function Step({ num, prefix, d }: { num: string; prefix: string; d?: string }) {
  const t = useTranslations();
  const ref = useReveal<HTMLElement>();
  return (
    <article className="step reveal" data-d={d} ref={ref}>
      <span className="step__num">{num}</span>
      <h3>{t(`${prefix}.t`)}</h3>
      <p>{t(`${prefix}.d`)}</p>
    </article>
  );
}

export default function Process() {
  const t = useTranslations();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const leadRef = useReveal<HTMLParagraphElement>();

  return (
    <section className="process" id="process">
      <div className="wrap">
        <p className="eyebrow reveal" ref={eyebrowRef}>
          {t("process.eyebrow")}
        </p>
        <h2 className="h2 reveal" data-d="1" ref={titleRef}>
          {t("process.title")}
        </h2>
        <p className="lead reveal" data-d="2" ref={leadRef}>
          {t("process.lead")}
        </p>

        <div className="steps">
          <Step num="01" prefix="st1" />
          <Step num="02" prefix="st2" d="1" />
          <Step num="03" prefix="st3" d="2" />
          <Step num="04" prefix="st4" d="3" />
        </div>
      </div>
    </section>
  );
}
