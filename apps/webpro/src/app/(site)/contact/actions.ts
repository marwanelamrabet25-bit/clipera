"use server";

import { deliverLead, rateLimited, spamCheck } from "@/lib/mailer";
import { receivedAt } from "@/lib/email-templates";
import { readValues, validate, type ContactErrors, type ContactValues, type Field } from "@/lib/contact-schema";
import type { FormStatus } from "@/lib/form-status";

export type ContactState = { status: FormStatus; errors?: ContactErrors; values?: Partial<ContactValues> };

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = readValues((k: Field) => formData.get(k));

  const spam = spamCheck(formData);
  if (spam === "honeypot") return { status: "blocked", values };
  if (spam === "too-fast") return { status: "too-fast", values };

  const errors = validate(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };
  if (await rateLimited("contact")) return { status: "limited", values };

  const name = `${values.firstName} ${values.lastName}`.trim();
  const result = await deliverLead({
    kind: "contact",
    subject: `[WEBPRO] Nouvelle demande de contact — ${name}${values.company ? ` (${values.company})` : ""}`,
    replyTo: values.email,
    prospectName: values.firstName,
    rows: [
      ["Nom et prénom", name],
      ["Entreprise", values.company],
      ["Email", values.email],
      ["Téléphone", values.phone],
      ["Prestation souhaitée", values.service],
      ["Budget", values.budget],
      ["Date de réception", receivedAt()],
    ],
    blocks: [["Message", values.message]],
  });
  return result.ok ? { status: "sent" } : { status: result.reason, values };
}
