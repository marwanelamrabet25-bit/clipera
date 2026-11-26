import { services } from "./services";

export const mainNav = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/#expertises", children: services },
  { label: "Réalisations", href: "/realisations" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
] as const;

export const primaryCta = { label: "Parlons de votre projet", href: "/contact" } as const;

export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
] as const;
