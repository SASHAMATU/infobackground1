"use client";

import { useActionState, useEffect, useId, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";
import { submitLead, type LeadActionState } from "@/app/[locale]/actions/lead";
import { leadValidators, type LeadField } from "@/lib/validators";
import { trackEvent } from "@/lib/analytics/track";

const SERVICE_OPTIONS = ["opt1", "opt2", "opt3", "opt4", "opt5"];

const initialState: LeadActionState = { status: "idle" };

function SubmitButton() {
  const t = useTranslations();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--primary" style={{ justifyContent: "center" }} disabled={pending}>
      <span>{pending ? "…" : t("form.submit")}</span>
      <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M3 9h11M10 4.5 14.5 9 10 13.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Contact() {
  const t = useTranslations();
  const locale = useLocale();
  const eyebrowRef = useReveal<HTMLParagraphElement>();
  const titleRef = useReveal<HTMLHeadingElement>();
  const leadRef = useReveal<HTMLParagraphElement>();
  const waysRef = useReveal<HTMLDivElement>();
  const formRef = useReveal<HTMLFormElement>();
  const formId = useId();

  const [state, formAction] = useActionState(submitLead, initialState);
  const [touched, setTouched] = useState<Partial<Record<LeadField, boolean>>>({});
  const [values, setValues] = useState({ name: "", contact: "", service: "", task: "" });
  const idempotencyKey = useMemo(
    () => (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())),
    [state]
  );

  useEffect(() => {
    if (state.status === "success") {
      trackEvent("lead_generated", { lang: locale });
    }
  }, [state.status, locale]);

  const invalid: Partial<Record<LeadField, boolean>> = {};
  (Object.keys(leadValidators) as LeadField[]).forEach((key) => {
    const fromServer = state.fieldErrors?.[key];
    const fromClient = touched[key] && !leadValidators[key](values[key as keyof typeof values] ?? "");
    if (fromServer || fromClient) invalid[key] = true;
  });

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div>
          <p className="eyebrow reveal" ref={eyebrowRef}>
            {t("c.eyebrow")}
          </p>
          <h2 className="h2 reveal" data-d="1" ref={titleRef}>
            {t("c.title")}
          </h2>
          <p className="lead reveal" data-d="2" ref={leadRef}>
            {t("c.lead")}
          </p>

          <div className="contact__ways reveal" data-d="3" ref={waysRef}>
            <a className="way" href="https://t.me/infobackground" target="_blank" rel="noopener">
              <span>Telegram</span>
              <b>@infobackground</b>
            </a>
            <a className="way" href="https://instagram.com/infobackground" target="_blank" rel="noopener">
              <span>Instagram</span>
              <b>@infobackground</b>
            </a>
            <a className="way" href="mailto:matochkinaleksandr3@gmail.com">
              <span>Email</span>
              <b>matochkinaleksandr3@gmail.com</b>
            </a>
            <div className="way">
              <span>{t("c.reply.label")}</span>
              <b>{t("c.reply.value")}</b>
            </div>
          </div>
        </div>

        <form
          className={`form reveal${state.status === "success" ? " is-sent" : ""}${state.status === "error" ? " is-error" : ""}`}
          data-d="2"
          ref={formRef}
          action={formAction}
        >
          <input type="hidden" name="lang" value={locale} />
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          <div className="field field--honeypot" aria-hidden="true">
            <label htmlFor={`${formId}-hp`}>{t("form.honeypot.label")}</label>
            <input id={`${formId}-hp`} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className={`field${invalid.name ? " is-invalid" : ""}`} data-field="name">
            <label htmlFor={`${formId}-name`}>{t("form.name.label")}</label>
            <input
              id={`${formId}-name`}
              name="name"
              type="text"
              autoComplete="name"
              placeholder={t("form.name.ph")}
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              onBlur={() => setTouched((v) => ({ ...v, name: true }))}
            />
            <span className="field__error">{t("form.name.err")}</span>
          </div>

          <div className={`field${invalid.contact ? " is-invalid" : ""}`} data-field="contact">
            <label htmlFor={`${formId}-contact`}>{t("form.contact.label")}</label>
            <input
              id={`${formId}-contact`}
              name="contact"
              type="text"
              placeholder={t("form.contact.ph")}
              value={values.contact}
              onChange={(e) => setValues((v) => ({ ...v, contact: e.target.value }))}
              onBlur={() => setTouched((v) => ({ ...v, contact: true }))}
            />
            <span className="field__error">{t("form.contact.err")}</span>
          </div>

          <div className={`field${invalid.service ? " is-invalid" : ""}`} data-field="service">
            <label htmlFor={`${formId}-service`}>{t("form.service.label")}</label>
            <select
              id={`${formId}-service`}
              name="service"
              value={values.service}
              onChange={(e) => setValues((v) => ({ ...v, service: e.target.value }))}
              onBlur={() => setTouched((v) => ({ ...v, service: true }))}
            >
              <option value="">{t("form.service.opt0")}</option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={t(`form.service.${opt}`)}>
                  {t(`form.service.${opt}`)}
                </option>
              ))}
            </select>
            <span className="field__error">{t("form.service.err")}</span>
          </div>

          <div className={`field${invalid.task ? " is-invalid" : ""}`} data-field="task">
            <label htmlFor={`${formId}-task`}>{t("form.task.label")}</label>
            <textarea
              id={`${formId}-task`}
              name="task"
              placeholder={t("form.task.ph")}
              value={values.task}
              onChange={(e) => setValues((v) => ({ ...v, task: e.target.value }))}
              onBlur={() => setTouched((v) => ({ ...v, task: true }))}
            />
            <span className="field__error">{t("form.task.err")}</span>
          </div>

          <div className="field" data-field="budget">
            <label htmlFor={`${formId}-budget`}>
              <span>{t("form.budget.label")}</span> <small>{t("form.budget.opt")}</small>
            </label>
            <input id={`${formId}-budget`} name="budget" type="text" placeholder={t("form.budget.ph")} />
          </div>

          <SubmitButton />
          <p className="form__note">{t("form.note")}</p>
          <p className="form__ok" role="status">
            {t("form.success")}
          </p>
          <p className="form__err" role="status">
            {t("form.error")}
          </p>
        </form>
      </div>
    </section>
  );
}
