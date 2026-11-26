/** Formulaire « maquette gratuite » : règles partagées navigateur / serveur. */
import { clean, EMAIL_RE, PHONE_RE } from "./contact-schema";

export const mockupFields = ["name", "company", "email", "phone", "sector", "description", "siteUrl", "extra", "consent"] as const;
export type MockupField = (typeof mockupFields)[number];
export type MockupValues = Record<MockupField, string>;
export type MockupErrors = Partial<Record<MockupField, string>>;

export const DESCRIPTION_MIN = 30;
export const DESCRIPTION_MAX = 3000;
export const EXTRA_MAX = 2000;

const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export function readMockup(get: (k: MockupField) => unknown): MockupValues {
  return {
    name: clean(get("name"), 120),
    company: clean(get("company"), 120),
    email: clean(get("email"), 160).toLowerCase(),
    phone: clean(get("phone"), 30),
    sector: clean(get("sector"), 120),
    description: clean(get("description"), DESCRIPTION_MAX + 1),
    siteUrl: clean(get("siteUrl"), 300),
    extra: clean(get("extra"), EXTRA_MAX + 1),
    consent: get("consent") ? "on" : "",
  };
}

export function validateMockup(v: MockupValues): MockupErrors {
  const e: MockupErrors = {};
  if (!v.name) e.name = "Indiquez votre nom.";
  if (!v.company) e.company = "Indiquez le nom de votre entreprise.";
  if (!v.email) e.email = "Indiquez votre adresse email.";
  else if (!EMAIL_RE.test(v.email)) e.email = "Cette adresse email ne semble pas valide.";
  if (v.phone && !PHONE_RE.test(v.phone)) e.phone = "Ce numéro de téléphone ne semble pas valide.";
  if (!v.sector) e.sector = "Indiquez votre secteur d'activité.";
  if (!v.description) e.description = "Présentez votre entreprise en quelques lignes.";
  else if (v.description.length < DESCRIPTION_MIN)
    e.description = `Quelques mots de plus nous aideront à préparer la maquette (au moins ${DESCRIPTION_MIN} caractères).`;
  else if (v.description.length > DESCRIPTION_MAX) e.description = `Votre description dépasse ${DESCRIPTION_MAX} caractères.`;
  if (v.siteUrl && !URL_RE.test(v.siteUrl)) e.siteUrl = "Cette adresse de site ne semble pas valide (ex. www.monentreprise.fr).";
  if (v.extra.length > EXTRA_MAX) e.extra = `Ce champ dépasse ${EXTRA_MAX} caractères.`;
  if ((`${v.description} ${v.extra}`.match(/https?:\/\//gi) ?? []).length > 4) e.extra = "Votre message contient trop de liens.";
  if (!v.consent) e.consent = "Votre accord est nécessaire pour que nous puissions traiter votre demande.";
  return e;
}
