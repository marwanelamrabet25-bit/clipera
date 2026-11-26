import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { PortfolioGrid } from "@/components/projects/portfolio-grid";
import { HonestNote } from "@/components/ui/honest-note";
import { ClosingCta } from "@/components/ui/closing-cta";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Réalisations et projets de démonstration",
  description:
    "Sites vitrines, boutique en ligne, identités visuelles, publications et vidéos : le savoir-faire de WEBPRO AGENCY, agence web dans le Doubs.",
  path: "/realisations",
});

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Réalisations", path: "/realisations" }]}
        eyebrow="Portfolio"
        wide
        title={["Réalisations", { text: "et projets de démonstration.", className: "text-slate" }]}
        lead={
          <p>
            Un restaurant, une menuiserie, une fromagerie, un institut de beauté : quatre entreprises fictives, quatre directions
            artistiques. Chaque fiche présente le contexte, l&apos;objectif, le travail réalisé et un aperçu navigable du site.
          </p>
        }
      />
      <section aria-label="Liste des réalisations" className="shell pb-28 md:pb-40">
        <PortfolioGrid projects={projects} />
        <HonestNote title="Projet de démonstration : qu'est-ce que c'est ?" className="mt-24 max-w-3xl">
          <p>
            Ce sont des projets complets, conçus par WEBPRO AGENCY pour des entreprises qui n&apos;existent pas. Ils montrent
            notre manière de travailler sans présenter comme réel ce qui ne l&apos;est pas : aucun client, résultat ou témoignage
            n&apos;est inventé. Cette page s&apos;enrichira au fil des projets.
          </p>
        </HonestNote>
      </section>
      <ClosingCta title="Et si le prochain projet" highlight="était le vôtre ?" />
    </>
  );
}
