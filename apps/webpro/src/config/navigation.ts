import { services } from "./services";

export const mainNav = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/#expertises", children: services },
  { label: "Tarifs", href: "/tarifs" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
] as const;

/** Appel à l'action principal : la maquette gratuite. */
export const primaryCta = { label: "Maquette gratuite", longLabel: "Demander ma maquette gratuite", href: "/maquette-gratuite" } as const;

export const contactCta = { label: "Parlons de votre projet", href: "/contact" } as const;

export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
] as const;
