"use server";

import { headers } from "next/headers";
import { contact } from "@/config/site";
import { readValues, validate, type ContactErrors, type ContactValues, type Field } from "@/lib/contact-schema";

export type ContactState = {
  status: "idle" | "invalid" | "sent" | "unconfigured" | "failed" | "limited";
  errors?: ContactErrors;
  values?: Partial<ContactValues>;
};

/* Limitation de fréquence (au mieux) : 5 envois par adresse IP et par période de 10 minutes.
   En hébergement « serverless », la mémoire n'est pas partagée entre instances : c'est une protection d'appoint. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = readValues((k: Field) => formData.get(k));

  // Pièges à robots : champ invisible rempli, ou formulaire envoyé en moins de 3 secondes.
  const honeypot = String(formData.get("website") ?? "");
  const startedAt = Number(formData.get("startedAt") ?? 0);
  const tooFast = startedAt > 0 && Date.now() - startedAt < 3000;
  if (honeypot || tooFast) {
    // Réponse identique à un succès : le robot n'apprend rien.
    return { status: "sent" };
  }

  const errors = validate(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "inconnue";
  if (rateLimited(ip)) return { status: "limited", values };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || contact.email;
  if (!apiKey || !from) {
    console.warn("[contact] Envoi non configuré : définir RESEND_API_KEY et CONTACT_FROM_EMAIL (voir README).");
    return { status: "unconfigured", values };
  }

  const name = `${values.firstName} ${values.lastName}`.trim();
  const rows: [string, string][] = [
    ["Nom", name],
    ["Entreprise", values.company || "—"],
    ["Email", values.email],
    ["Téléphone", values.phone || "—"],
    ["Prestation", values.service],
    ["Budget", values.budget || "Non précisé"],
  ];
  const text = `${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\nMessage :\n${values.message}\n\n— Envoyé depuis le formulaire du site (consentement donné).`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
<h2 style="margin:0 0 16px">Nouvelle demande de contact</h2>
<table style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`)
    .join("")}</table>
<p style="margin:20px 0 6px;color:#666">Message :</p>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(values.message)}</p>
<p style="margin:24px 0 0;color:#999;font-size:12px">Envoyé depuis le formulaire du site. Le visiteur a accepté d'être recontacté.</p></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: values.email,
        subject: `Demande de contact — ${values.service} — ${name}${values.company ? ` (${values.company})` : ""}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] Échec de l'envoi", res.status, await res.text().catch(() => ""));
      return { status: "failed", values };
    }
  } catch (err) {
    console.error("[contact] Erreur réseau lors de l'envoi", err);
    return { status: "failed", values };
  }
  return { status: "sent" };
}
