"use server";

import { deliverLead, rateLimited, spamCheck } from "@/lib/mailer";
import { receivedAt } from "@/lib/email-templates";
import { readMockup, validateMockup, type MockupErrors, type MockupField, type MockupValues } from "@/lib/mockup-schema";
import type { FormStatus } from "@/lib/form-status";

export type MockupState = { status: FormStatus; errors?: MockupErrors; values?: Partial<MockupValues> };

/** Demande de maquette gratuite : transmise par email à l'agence, qui prépare la maquette (aucune génération automatique). */
export async function requestMockup(_prev: MockupState, formData: FormData): Promise<MockupState> {
  const values = readMockup((k: MockupField) => formData.get(k));

  const spam = spamCheck(formData);
  if (spam === "honeypot") return { status: "blocked", values };
  if (spam === "too-fast") return { status: "too-fast", values };

  const errors = validateMockup(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };
  if (await rateLimited("maquette")) return { status: "limited", values };

  const result = await deliverLead({
    kind: "maquette",
    subject: `[WEBPRO] Demande de maquette gratuite — ${values.company} (${values.sector})`,
    replyTo: values.email,
    prospectName: values.name,
    rows: [
      ["Nom et prénom", values.name],
      ["Entreprise", values.company],
      ["Email", values.email],
      ["Téléphone", values.phone],
      ["Secteur d'activité", values.sector],
      ["Site internet existant", values.siteUrl],
      ["Date de réception", receivedAt()],
    ],
    blocks: [
      ["Description de l'entreprise", values.description],
      ["Informations complémentaires", values.extra],
    ],
  });
  return result.ok ? { status: "sent" } : { status: result.reason, values };
}
