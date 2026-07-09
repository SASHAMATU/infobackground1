"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";
import { useTilt } from "@/hooks/useTilt";
import { useMergedRef } from "@/hooks/useMergedRef";

function Principle({
  num,
  reveal,
  d,
  titleKey,
  descKey,
}: {
  num: string;
  reveal?: "left" | "right";
  d?: string;
  titleKey: string;
  descKey: string;
}) {
  const t = useTranslations();
  const revealRef = useReveal<HTMLElement>();
  const tiltRef = useTilt<HTMLElement>();
  const ref = useMergedRef(revealRef, tiltRef);

  return (
    <article className="principle reveal" data-reveal={reveal} data-d={d} ref={ref}>
      <span className="principle__num">{`// ${num}`}</span>
      <h3>{t(titleKey)}</h3>
      <p>{t(descKey)}</p>
    </article>
  );
}

export default function Approach() {
  const t = useTranslations();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const smallRef = useReveal<HTMLParagraphElement>();
  const bigRef = useReveal<HTMLHeadingElement>();
  const leadRef = useReveal<HTMLParagraphElement>();

  return (
    <section className="manifesto" id="approach">
      <div className="wrap">
        <p className="eyebrow reveal" ref={eyebrowRef}>
          {t("approach.eyebrow")}
        </p>
        <p className="manifesto__small reveal" data-d="1" ref={smallRef}>
          {t("approach.small")}
        </p>
        <h2 className="manifesto__big reveal" data-d="2" ref={bigRef}>
          {t.rich("approach.big", {
            drama: (chunks) => <span className="drama">{chunks}</span>,
          })}
        </h2>
        <p className="lead reveal" data-d="3" ref={leadRef}>
          {t("approach.lead")}
        </p>

        <div className="principles">
          <Principle num="01" reveal="left" titleKey="p1.t" descKey="p1.d" />
          <Principle num="02" d="1" titleKey="p2.t" descKey="p2.d" />
          <Principle num="03" reveal="right" d="2" titleKey="p3.t" descKey="p3.d" />
        </div>
      </div>
    </section>
  );
}
