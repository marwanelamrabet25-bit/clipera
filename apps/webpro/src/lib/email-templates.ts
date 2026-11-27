import "server-only";
import { brand, contact } from "@/config/site";

/**
 * Modèles d'emails : HTML en tableaux et styles en ligne (compatible Gmail, Outlook, Apple Mail),
 * accompagnés d'une version texte. Toutes les valeurs saisies par les visiteurs sont échappées.
 */

export type LeadKind = "contact" | "maquette";
export type Row = [label: string, value: string];

const KIND = {
  contact: { badge: "Demande de contact", color: "#087BFF", intro: "Un visiteur a envoyé une demande depuis le formulaire de contact du site." },
  maquette: {
    badge: "Demande de maquette gratuite",
    color: "#00A8FF",
    intro: "Un professionnel demande une maquette gratuite de son futur site internet.",
  },
} as const;

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const nl2br = (s: string) => escapeHtml(s).replace(/\r?\n/g, "<br>");

/** Date de réception lisible, heure de Paris. */
export function receivedAt(d = new Date()) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Paris" }).format(d);
}

export function buildLeadEmail({
  kind,
  rows,
  blocks,
  replyTo,
}: {
  kind: LeadKind;
  /** Informations courtes (nom, entreprise, email…). */
  rows: Row[];
  /** Textes longs (message, description…), affichés en entier. */
  blocks: Row[];
  replyTo: string;
}) {
  const k = KIND[kind];
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(k.badge)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
<tr><td style="background:#050608;padding:20px 24px;border-radius:6px 6px 0 0;">
<span style="font-size:16px;font-weight:bold;color:#F7F9FC;letter-spacing:0.5px;">${escapeHtml(brand.name)}</span>
<span style="display:inline-block;margin-left:10px;padding:3px 8px;border-radius:3px;background:${k.color};color:#050608;font-size:12px;font-weight:bold;">${escapeHtml(k.badge)}</span>
</td></tr>
<tr><td style="padding:24px 24px 8px;font-size:15px;line-height:1.5;color:#374151;">${escapeHtml(k.intro)}</td></tr>
<tr><td style="padding:8px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;line-height:1.5;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #f0f0f0;color:#6b7280;width:38%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#111827;vertical-align:top;word-break:break-word;">${value ? nl2br(value) : '<span style="color:#9ca3af;font-weight:normal;">Non renseigné</span>'}</td></tr>`,
  )
  .join("\n")}
</table>
</td></tr>
${blocks
  .map(
    ([label, value]) =>
      `<tr><td style="padding:16px 24px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(label)}</td></tr>
<tr><td style="padding:8px 24px 8px;"><div style="padding:14px 16px;background:#f9fafb;border-left:3px solid ${k.color};font-size:15px;line-height:1.6;color:#111827;word-break:break-word;">${value ? nl2br(value) : '<span style="color:#9ca3af;">Non renseigné</span>'}</div></td></tr>`,
  )
  .join("\n")}
<tr><td style="padding:20px 24px 24px;font-size:13px;line-height:1.5;color:#6b7280;">
Pour répondre au prospect, utilisez simplement « Répondre » : la réponse partira vers <a href="mailto:${escapeHtml(replyTo)}" style="color:#064FCB;">${escapeHtml(replyTo)}</a>.<br>
Le visiteur a accepté que ses informations soient utilisées pour traiter sa demande.
</td></tr>
</table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;margin:12px 0 0;">Email automatique envoyé par le site ${escapeHtml(brand.name)}.</p>
</td></tr></table>
</body></html>`;

  const text = [
    `${brand.name} — ${k.badge}`,
    "",
    k.intro,
    "",
    ...rows.map(([l, v]) => `${l} : ${v || "Non renseigné"}`),
    ...blocks.flatMap(([l, v]) => ["", `${l} :`, v || "Non renseigné"]),
    "",
    `Répondre à cet email répond directement au prospect (${replyTo}).`,
  ].join("\n");

  return { html, text };
}

/** Accusé de réception envoyé au prospect (si activé). Aucun délai n'est promis. */
export function buildAutoReply({ kind, name }: { kind: LeadKind; name: string }) {
  const subject =
    kind === "maquette" ? `Votre demande de maquette gratuite — ${brand.name}` : `Nous avons bien reçu votre message — ${brand.name}`;
  const what = kind === "maquette" ? "votre demande de maquette gratuite" : "votre message";
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;">
<tr><td style="background:#050608;padding:20px 24px;border-radius:6px 6px 0 0;color:#F7F9FC;font-size:16px;font-weight:bold;">${escapeHtml(brand.name)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px;">Bonjour ${escapeHtml(name)},</p>
<p style="margin:0 0 14px;">Nous avons bien reçu ${what} et nous vous remercions de votre confiance. Nous revenons vers vous pour en discuter.</p>
<p style="margin:0 0 14px;">Pour toute précision, vous pouvez répondre à cet email ou nous appeler au <span style="white-space:nowrap;">${escapeHtml(contact.phoneDisplay)}</span>.</p>
<p style="margin:0;">À bientôt,<br><strong>${escapeHtml(brand.name)}</strong><br><span style="color:#6b7280;">${escapeHtml(brand.tagline)}</span></p>
</td></tr></table></body></html>`;
  const text = `Bonjour ${name},\n\nNous avons bien reçu ${what} et nous vous remercions de votre confiance. Nous revenons vers vous pour en discuter.\n\nPour toute précision, répondez à cet email ou appelez le ${contact.phoneDisplay}.\n\nÀ bientôt,\n${brand.name}`;
  return { subject, html, text };
}
