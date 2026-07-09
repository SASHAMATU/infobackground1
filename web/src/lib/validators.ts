// Single source of truth for lead-form validation, used by both the
// client (instant field feedback, ported from the original vanilla JS
// validators) and the Server Action (authoritative check — never trust
// the client alone).
export const leadValidators = {
  name: (v: string) => v.trim().length >= 2,
  contact: (v: string) => v.trim().length >= 3,
  service: (v: string) => v !== "",
  task: (v: string) => v.trim().length >= 5,
};

export type LeadField = keyof typeof leadValidators;

export interface LeadPayload {
  name: string;
  contact: string;
  service: string;
  task: string;
  budget: string;
  lang: string;
  idempotencyKey: string;
  honeypot: string;
}

export function validateLead(payload: Omit<LeadPayload, "idempotencyKey" | "honeypot">) {
  const errors: Partial<Record<LeadField, boolean>> = {};
  let ok = true;
  (Object.keys(leadValidators) as LeadField[]).forEach((key) => {
    const valid = leadValidators[key](payload[key]);
    if (!valid) {
      errors[key] = true;
      ok = false;
    }
  });
  return { ok, errors };
}
