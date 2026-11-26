import "server-only";
import { headers } from "next/headers";
import { contact } from "@/config/site";

/**
 * Gestion des demandes (contact, maquette gratuite) :
 *  1. Email à l'agence via Resend (RESEND_API_KEY + CONTACT_FROM_EMAIL), réponse directe au demandeur (Reply-To).
 *  2. Optionnel : copie JSON vers LEADS_WEBHOOK_URL (tableur, CRM, outil d'automatisation).
 * Si aucun des deux n'est configuré, le statut « unconfigured » permet d'afficher un repli honnête.
 */

export type DeliveryResult = "sent" | "unconfigured" | "failed";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/** Limitation de fréquence au mieux (mémoire locale de l'instance) : 5 envois par IP et par 10 minutes. */
export async function rateLimited(scope: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "inconnue";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** Pièges à robots : champ invisible rempli ou envoi en moins de 3 secondes. */
export function isBot(formData: FormData) {
  const honeypot = String(formData.get("website") ?? "");
  const startedAt = Number(formData.get("startedAt") ?? 0);
  return Boolean(honeypot) || (startedAt > 0 && Date.now() - startedAt < 3000);
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export async function deliverLead({
  kind,
  subject,
  replyTo,
  rows,
  message,
  messageLabel = "Message",
}: {
  kind: "contact" | "maquette";
  subject: string;
  replyTo: string;
  rows: [string, string][];
  message: string;
  messageLabel?: string;
}): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || contact.email;
  const webhook = process.env.LEADS_WEBHOOK_URL;

  if ((!apiKey || !from) && !webhook) {
    console.warn("[demandes] Envoi non configuré : définir RESEND_API_KEY et CONTACT_FROM_EMAIL (voir README).");
    return "unconfigured";
  }

  let ok = false;
  let failed = false;

  if (apiKey && from) {
    const text = `${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\n${messageLabel} :\n${message}\n\n— Envoyé depuis le site (consentement donné).`;
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
<h2 style="margin:0 0 16px">${escapeHtml(subject)}</h2>
<table style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`)
      .join("")}</table>
<p style="margin:20px 0 6px;color:#666">${escapeHtml(messageLabel)} :</p>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
<p style="margin:24px 0 0;color:#999;font-size:12px">Envoyé depuis le site. Le visiteur a accepté d'être recontacté.</p></div>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html }),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) ok = true;
      else {
        failed = true;
        console.error("[demandes] Échec Resend", res.status, await res.text().catch(() => ""));
      }
    } catch (err) {
      failed = true;
      console.error("[demandes] Erreur réseau Resend", err);
    }
  }

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: kind, subject, receivedAt: new Date().toISOString(), fields: Object.fromEntries(rows), message }),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) ok = true;
      else {
        failed = true;
        console.error("[demandes] Échec du webhook", res.status);
      }
    } catch (err) {
      failed = true;
      console.error("[demandes] Erreur réseau webhook", err);
    }
  }

  return ok ? "sent" : failed ? "failed" : "unconfigured";
}
