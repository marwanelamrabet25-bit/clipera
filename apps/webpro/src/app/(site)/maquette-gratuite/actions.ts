"use server";

import { deliverLead, isBot, rateLimited } from "@/lib/mailer";
import { readMockup, validateMockup, type MockupErrors, type MockupField, type MockupValues } from "@/lib/mockup-schema";

export type MockupState = {
  status: "idle" | "invalid" | "sent" | "unconfigured" | "failed" | "limited";
  errors?: MockupErrors;
  values?: Partial<MockupValues>;
};

/** Demande de maquette gratuite : transmise à l'agence, qui prépare la proposition visuelle (aucune génération automatique). */
export async function requestMockup(_prev: MockupState, formData: FormData): Promise<MockupState> {
  if (isBot(formData)) return { status: "sent" };

  const values = readMockup((k: MockupField) => formData.get(k));
  const errors = validateMockup(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };
  if (await rateLimited("maquette")) return { status: "limited", values };

  const result = await deliverLead({
    kind: "maquette",
    subject: `Demande de maquette gratuite — ${values.company} (${values.sector})`,
    replyTo: values.email,
    rows: [
      ["Nom", values.name],
      ["Entreprise", values.company],
      ["Secteur d'activité", values.sector],
      ["Email", values.email],
      ["Téléphone", values.phone || "—"],
      ["Site existant", values.siteUrl || "—"],
      ["Informations complémentaires", values.extra || "—"],
    ],
    message: values.description,
    messageLabel: "Description de l'entreprise",
  });
  return result === "sent" ? { status: "sent" } : { status: result, values };
}
