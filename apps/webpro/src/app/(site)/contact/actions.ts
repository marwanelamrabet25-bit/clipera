"use server";

import { deliverLead, isBot, rateLimited } from "@/lib/mailer";
import { readValues, validate, type ContactErrors, type ContactValues, type Field } from "@/lib/contact-schema";

export type ContactState = {
  status: "idle" | "invalid" | "sent" | "unconfigured" | "failed" | "limited";
  errors?: ContactErrors;
  values?: Partial<ContactValues>;
};

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Robot détecté : réponse identique à un succès, rien n'est envoyé.
  if (isBot(formData)) return { status: "sent" };

  const values = readValues((k: Field) => formData.get(k));
  const errors = validate(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };
  if (await rateLimited("contact")) return { status: "limited", values };

  const name = `${values.firstName} ${values.lastName}`.trim();
  const result = await deliverLead({
    kind: "contact",
    subject: `Demande de contact — ${values.service} — ${name}${values.company ? ` (${values.company})` : ""}`,
    replyTo: values.email,
    rows: [
      ["Nom", name],
      ["Entreprise", values.company || "—"],
      ["Email", values.email],
      ["Téléphone", values.phone || "—"],
      ["Objet", values.service],
    ],
    message: values.message,
  });
  return result === "sent" ? { status: "sent" } : { status: result, values };
}
