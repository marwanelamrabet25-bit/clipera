/**
 * EXEMPLES DE MAQUETTES
 * ─────────────────────
 * Maquettes conçues par WEBPRO AGENCY pour des entreprises FICTIVES, afin de montrer à quoi peut
 * ressembler la maquette gratuite proposée aux prospects. Ce ne sont PAS des réalisations clients :
 * elles sont présentées uniquement comme des exemples, jamais comme des projets commandés.
 *
 * `showMockupExamples: false` masque la galerie d'exemples sur la page « Maquette gratuite ».
 *
 * Réalisations clients : aucune pour l'instant. La page /realisations a été retirée ; elle pourra être
 * recréée quand l'agence disposera de projets réels présentables (avec l'accord écrit des clients).
 */

export type MockupExample = {
  slug: "oree" | "atelier-sylve" | "nacre";
  name: string;
  /** Type d'activité imaginé pour l'exemple. */
  sector: string;
  previewHref: `/apercu/${string}`;
  /** `full` (page entière) n'est générée que pour l'exemple qui l'utilise. */
  images: { desktop: string; mobile: string; full?: string };
  palette: string[];
};

export const showMockupExamples = true;

const img = (slug: string, withFull = false) => ({
  desktop: `/projects/${slug}/desktop.png`,
  mobile: `/projects/${slug}/mobile.png`,
  ...(withFull ? { full: `/projects/${slug}/full.png` } : {}),
});

export const mockupExamples: MockupExample[] = [
  { slug: "oree", name: "Orée", sector: "Restaurant", previewHref: "/apercu/oree", images: img("oree"), palette: ["#1E2B23", "#F2EADC", "#C2603A", "#8FA588"] },
  {
    slug: "atelier-sylve",
    name: "Atelier Sylve",
    sector: "Menuiserie",
    previewHref: "/apercu/atelier-sylve",
    images: img("atelier-sylve", true),
    palette: ["#1C1B19", "#B8875A", "#ECE7DF", "#5C5A55"],
  },
  { slug: "nacre", name: "Nacre", sector: "Institut de beauté", previewHref: "/apercu/nacre", images: img("nacre"), palette: ["#F4ECE7", "#E3C9C0", "#2B2326", "#9A6B56"] },
];

export const mockupBySlug = (slug: string) => mockupExamples.find((m) => m.slug === slug);
