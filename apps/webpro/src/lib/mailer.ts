import "server-only";
import { headers } from "next/headers";
import { contact } from "@/config/site";
import { buildAutoReply, buildLeadEmail, type LeadKind, type Row } from "./email-templates";
import { HONEYPOT_FIELD } from "./form-status";

/**
 * ENVOI DES DEMANDES (formulaire de contact, maquette gratuite) — via l'API Resend, côté serveur uniquement.
 *
 * Variables d'environnement (jamais exposées au navigateur) :
 *  - RESEND_API_KEY      clé API Resend (obligatoire pour envoyer)
 *  - CONTACT_TO_EMAIL    destinataire des demandes (défaut : webproagency25@gmail.com)
 *  - CONTACT_FROM_EMAIL  expéditeur autorisé. Défaut : « WEBPRO AGENCY <onboarding@resend.dev> », l'adresse de test
 *                        de Resend, qui ne peut écrire QU'À l'adresse du compte Resend : créer le compte Resend avec
 *                        webproagency25@gmail.com, ou vérifier un domaine et y définir l'expéditeur.
 *  - CONTACT_AUTOREPLY   "true" pour envoyer un accusé de réception au prospect. Ignoré tant que l'expéditeur est
 *                        l'adresse de test resend.dev (Resend refuserait l'envoi vers une autre adresse).
 *
 * Règle : la demande n'est déclarée « envoyée » que si Resend a accepté l'email (réponse 2xx avec identifiant).
 */

export type DeliveryResult = { ok: true; id: string } | { ok: false; reason: "unconfigured" | "failed" };

const DEFAULT_FROM = "WEBPRO AGENCY <onboarding@resend.dev>";

export function mailConfig() {
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() || null,
    from,
    to: process.env.CONTACT_TO_EMAIL?.trim() || contact.email,
    testSender: /@resend\.dev>?$/i.test(from),
    autoReply: process.env.CONTACT_AUTOREPLY === "true",
  };
}

/* ─── Anti-abus ──────────────────────────────────────────────────────── */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Limitation de fréquence : 5 envois par adresse IP et par 10 minutes.
 * Mémoire locale de l'instance serveur : protection d'appoint (non partagée entre instances serverless).
 */
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


export function spamCheck(formData: FormData): "ok" | "honeypot" | "too-fast" {
  if (String(formData.get(HONEYPOT_FIELD) ?? "")) return "honeypot";
  const startedAt = Number(formData.get("startedAt") ?? 0);
  if (startedAt > 0 && Date.now() - startedAt < 2500) return "too-fast";
  return "ok";
}

/* ─── Envoi ──────────────────────────────────────────────────────────── */

async function resendSend(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as { id?: string; message?: string; name?: string } | null;
  return { ok: res.ok && Boolean(body?.id), status: res.status, id: body?.id, error: body?.message ?? body?.name };
}

export async function deliverLead({
  kind,
  subject,
  replyTo,
  prospectName,
  rows,
  blocks,
}: {
  kind: LeadKind;
  subject: string;
  replyTo: string;
  prospectName: string;
  rows: Row[];
  blocks: Row[];
}): Promise<DeliveryResult> {
  const cfg = mailConfig();
  if (!cfg.apiKey) {
    console.warn("[demandes] RESEND_API_KEY absente : la demande n'a pas été envoyée (voir README, section Formulaires).");
    return { ok: false, reason: "unconfigured" };
  }

  const { html, text } = buildLeadEmail({ kind, rows, blocks, replyTo });
  try {
    const r = await resendSend(cfg.apiKey, { from: cfg.from, to: [cfg.to], reply_to: replyTo, subject, html, text });
    if (!r.ok) {
      // Pas de données personnelles dans les journaux : seulement le statut et le message du fournisseur.
      console.error(`[demandes] Resend a refusé l'envoi (${kind}) : HTTP ${r.status} — ${r.error ?? "sans détail"}`);
      return { ok: false, reason: "failed" };
    }

    if (cfg.autoReply && !cfg.testSender) {
      const reply = buildAutoReply({ kind, name: prospectName });
      const a = await resendSend(cfg.apiKey, {
        from: cfg.from,
        to: [replyTo],
        reply_to: cfg.to,
        subject: reply.subject,
        html: reply.html,
        text: reply.text,
      }).catch(() => null);
      if (!a?.ok) console.warn(`[demandes] Accusé de réception non envoyé (${kind}) : HTTP ${a?.status ?? "—"}`);
    }
    return { ok: true, id: r.id! };
  } catch (err) {
    console.error(`[demandes] Erreur réseau vers Resend (${kind}) :`, err instanceof Error ? err.message : err);
    return { ok: false, reason: "failed" };
  }
}
