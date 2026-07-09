"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";
import { useTilt } from "@/hooks/useTilt";
import { useCounters } from "@/hooks/useCounters";
import { useMergedRef } from "@/hooks/useMergedRef";

type NumDef = { count: string; sfx?: string; prefix: string };

const NUMS: NumDef[] = [
  { count: "27", sfx: "+", prefix: "n1" },
  { count: "7", prefix: "n2" },
  { count: "6.2", sfx: "%", prefix: "n3" },
  { count: "30", prefix: "n4" },
];

function Num({ count, sfx, prefix }: NumDef) {
  const t = useTranslations();
  const tiltRef = useTilt<HTMLDivElement>();

  return (
    <div className="num" ref={tiltRef}>
      <b>
        <span data-count={count}>0</span>
        {sfx && <span className="sfx">{sfx}</span>}
      </b>
      <span>{t(`${prefix}.t`)}</span>
      <p>{t(`${prefix}.d`)}</p>
    </div>
  );
}

export default function WhyUs() {
  const t = useTranslations();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const leadRef = useReveal<HTMLParagraphElement>();
  const revealRef = useReveal<HTMLDivElement>();
  const countersRef = useCounters<HTMLDivElement>();
  const numbersRef = useMergedRef(revealRef, countersRef);

  return (
    <section id="whyus">
      <div className="wrap">
        <p className="eyebrow reveal" ref={eyebrowRef}>
          {t("why.eyebrow")}
        </p>
        <h2 className="h2 reveal" data-d="1" ref={titleRef}>
          {t("why.title")}
        </h2>
        <p className="lead reveal" data-d="2" ref={leadRef}>
          {t("why.lead")}
        </p>

        <div className="numbers reveal" data-d="2" ref={numbersRef}>
          {NUMS.map((n) => (
            <Num key={n.prefix} {...n} />
          ))}
        </div>
      </div>
    </section>
  );
}
