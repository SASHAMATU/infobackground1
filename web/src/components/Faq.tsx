"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";

const QUESTIONS = ["q1", "q2", "q3", "q4", "q5"];

export default function Faq() {
  const t = useTranslations();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const listRef = useReveal<HTMLDivElement>();
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section id="faq">
      <div className="wrap">
        <p className="eyebrow reveal" ref={eyebrowRef}>
          {t("faq.eyebrow")}
        </p>
        <h2 className="h2 reveal" data-d="1" ref={titleRef}>
          {t("faq.title")}
        </h2>

        <div className="faq__list reveal" data-d="2" ref={listRef}>
          {QUESTIONS.map((key) => {
            const isOpen = openKey === key;
            return (
              <div className={`faq__item${isOpen ? " is-open" : ""}`} key={key}>
                <button
                  className="faq__q"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                >
                  <span>{t(`${key}.q`)}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </button>
                <div
                  className="faq__a"
                  style={{ maxHeight: isOpen ? "480px" : undefined }}
                >
                  <p>{t(`${key}.a`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
