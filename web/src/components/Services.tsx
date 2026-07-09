"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";
import { useTilt } from "@/hooks/useTilt";
import { useMergedRef } from "@/hooks/useMergedRef";

type ServiceDef = {
  num: string;
  prefix: string;
  hot?: boolean;
  d?: string;
  reveal?: "scale";
  price: string;
};

const SERVICES: ServiceDef[] = [
  { num: "01", prefix: "s1", price: "€400" },
  { num: "02", prefix: "s2", hot: true, d: "1", reveal: "scale", price: "€800" },
  { num: "03", prefix: "s3", d: "2", price: "€1500" },
  { num: "04", prefix: "s4", d: "3", reveal: "scale", price: "€600" },
];

function Service({ num, prefix, hot, d, reveal, price }: ServiceDef) {
  const t = useTranslations();
  const revealRef = useReveal<HTMLElement>();
  const tiltRef = useTilt<HTMLElement>();
  const ref = useMergedRef(revealRef, tiltRef);

  return (
    <article
      className={`service${hot ? " service--hot" : ""} reveal`}
      data-d={d}
      data-reveal={reveal}
      ref={ref}
    >
      <div className="service__top">
        <b>{`// ${num}`}</b>
        <time>{t(`${prefix}.days`)}</time>
      </div>
      {hot && <span className="service__badge">{t("s2.badge")}</span>}
      <h3>{t(`${prefix}.t`)}</h3>
      <p>{t(`${prefix}.d`)}</p>
      <ul>
        {[1, 2, 3, 4].map((i) => (
          <li key={i}>{t(`${prefix}.li${i}`)}</li>
        ))}
      </ul>
      <div className="service__foot">
        <div className="service__price">
          <small>{t("s.from")}</small>
          <b>{price}</b>
        </div>
        <a className={`btn btn--${hot ? "primary" : "ghost"}`} href="#contact">
          <span>{t("s.cta")}</span>
        </a>
      </div>
    </article>
  );
}

export default function Services() {
  const t = useTranslations();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const leadRef = useReveal<HTMLParagraphElement>();

  return (
    <section id="services">
      <div className="wrap">
        <p className="eyebrow reveal" ref={eyebrowRef}>
          {t("services.eyebrow")}
        </p>
        <h2 className="h2 reveal" data-d="1" ref={titleRef}>
          {t("services.title")}
        </h2>
        <p className="lead reveal" data-d="2" ref={leadRef}>
          {t("services.lead")}
        </p>

        <div className="services__grid">
          {SERVICES.map((s) => (
            <Service key={s.prefix} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
