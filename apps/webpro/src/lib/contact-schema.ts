/**
 * Règles de validation du formulaire de contact, partagées entre le navigateur
 * (retour immédiat) et le serveur (seule validation qui fait foi).
 */
import { budgetRanges } from "@/config/pricing";

export const serviceOptions = [
  "Création de site internet",
  "Refonte de site",
  "Réseaux sociaux",
  "Contenus vidéo & visuels",
  "Plusieurs besoins",
  "Autre",
] as const;

export const fields = ["firstName", "lastName", "company", "email", "phone", "service", "budget", "message", "consent"] as const;
export type Field = (typeof fields)[number];
export type ContactValues = Record<Field, string>;
export type ContactErrors = Partial<Record<Field, string>>;

const LIMITS = { name: 80, company: 120, email: 160, phone: 30, message: 4000 } as const;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = LIMITS.message;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[+()\d\s.-]{6,30}$/;
/** Caractères de contrôle (hors retour à la ligne et tabulation). */
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function clean(v: unknown, max: number) {
  return String(v ?? "")
    .replace(CONTROL_RE, "")
    .trim()
    .slice(0, max);
}

export function readValues(get: (k: Field) => unknown): ContactValues {
  return {
    firstName: clean(get("firstName"), LIMITS.name),
    lastName: clean(get("lastName"), LIMITS.name),
    company: clean(get("company"), LIMITS.company),
    email: clean(get("email"), LIMITS.email).toLowerCase(),
    phone: clean(get("phone"), LIMITS.phone),
    service: clean(get("service"), 60),
    budget: clean(get("budget"), 60),
    message: clean(get("message"), LIMITS.message + 1),
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
  if (!v.service) e.service = "Choisissez le type de prestation.";
  else if (!(serviceOptions as readonly string[]).includes(v.service)) e.service = "Choisissez une prestation dans la liste.";
  if (v.budget && !(budgetRanges as readonly string[]).includes(v.budget)) e.budget = "Choisissez une tranche dans la liste.";
  if (!v.message) e.message = "Décrivez votre projet en quelques lignes.";
  else if (v.message.length < MESSAGE_MIN) e.message = `Quelques mots de plus nous aideront (au moins ${MESSAGE_MIN} caractères).`;
  else if (v.message.length > LIMITS.message) e.message = `Votre message dépasse ${LIMITS.message} caractères.`;
  else if ((v.message.match(/https?:\/\//gi) ?? []).length > 4) e.message = "Votre message contient trop de liens.";
  if (!v.consent) e.consent = "Votre accord est nécessaire pour que nous puissions vous répondre.";
  return e;
}
