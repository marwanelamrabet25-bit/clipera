/**
 * Règles de validation du formulaire de contact, partagées entre le navigateur
 * (retour immédiat) et le serveur (seule validation qui fait foi).
 */
import { budgetOptions, offerFormOptions } from "@/config/offers";

export const fields = ["firstName", "lastName", "company", "email", "phone", "service", "budget", "message", "consent"] as const;
export type Field = (typeof fields)[number];
export type ContactValues = Record<Field, string>;
export type ContactErrors = Partial<Record<Field, string>>;

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 4000;

export const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
export const PHONE_RE = /^[+()\d\s.-]{6,30}$/;
/** Caractères de contrôle (hors retour à la ligne et tabulation). */
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Texte long (message) : caractères de contrôle retirés, retours à la ligne conservés. */
export function clean(v: unknown, max: number) {
  return String(v ?? "")
    .replace(CONTROL_RE, "")
    .trim()
    .slice(0, max);
}

/** Champ d'une ligne (nom, email, téléphone…) : aucun retour à la ligne possible (protection contre l'injection d'en-têtes). */
export function cleanLine(v: unknown, max: number) {
  return clean(v, max * 2)
    .replace(/[\r\n\t\u2028\u2029]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
}

export const serviceOptions = offerFormOptions();
export const budgetChoices: readonly string[] = budgetOptions;

export function readValues(get: (k: Field) => unknown): ContactValues {
  return {
    firstName: cleanLine(get("firstName"), 80),
    lastName: cleanLine(get("lastName"), 80),
    company: cleanLine(get("company"), 120),
    email: cleanLine(get("email"), 160).toLowerCase(),
    phone: cleanLine(get("phone"), 30),
    service: cleanLine(get("service"), 80),
    budget: cleanLine(get("budget"), 60),
    message: clean(get("message"), MESSAGE_MAX + 1),
    consent: get("consent") ? "on" : "",
  };
}

export function validate(v: ContactValues): ContactErrors {
  const e: ContactErrors = {};
  if (!v.firstName) e.firstName = "Indiquez votre prénom.";
  if (!v.lastName) e.lastName = "Indiquez votre nom.";
  if (!v.email) e.email = "Indiquez votre adresse email.";
  else if (!EMAIL_RE.test(v.email)) e.email = "Cette adresse email ne semble pas valide.";
  if (v.phone && !PHONE_RE.test(v.phone)) e.phone = "Ce numéro de téléphone ne semble pas valide.";
  if (!v.service) e.service = "Choisissez l'objet de votre demande.";
  else if (!serviceOptions.includes(v.service)) e.service = "Choisissez une option dans la liste.";
  if (v.budget && !budgetChoices.includes(v.budget)) e.budget = "Choisissez une tranche dans la liste.";
  if (!v.message) e.message = "Décrivez votre projet en quelques lignes.";
  else if (v.message.length < MESSAGE_MIN) e.message = `Quelques mots de plus nous aideront (au moins ${MESSAGE_MIN} caractères).`;
  else if (v.message.length > MESSAGE_MAX) e.message = `Votre message dépasse ${MESSAGE_MAX} caractères.`;
  else if ((v.message.match(/https?:\/\//gi) ?? []).length > 4) e.message = "Votre message contient trop de liens.";
  if (!v.consent) e.consent = "Votre accord est nécessaire pour que nous puissions vous répondre.";
  return e;
}
