import { SectionLabel } from "@/components/ui/section-label";
import { Words } from "@/components/ui/words";
import { ButtonLink } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import { projects } from "@/content/projects";
import { cn } from "@/lib/cn";

export function Work() {
  return (
    <section aria-labelledby="work-title" className="relative py-28 md:py-40">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-3">
            <SectionLabel index="03">Réalisations</SectionLabel>
          </div>
          <div className="col-span-4 md:col-span-9">
            <Words id="work-title" className="t-h1 text-paper" parts={["Le savoir-faire", { text: "se voit.", className: "text-electric" }]} />
            <p data-reveal className="t-lead mt-8 max-w-[56ch] text-mist">
              Quatre projets de démonstration, imaginés pour des entreprises fictives, montrent notre façon de travailler : une
              direction artistique propre à chaque activité, une lecture claire et un parcours pensé pour le contact.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-x-6 gap-y-20 md:grid-cols-2 md:gap-y-28">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} className={cn(i % 2 === 1 && "md:mt-40")} />
          ))}
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-center">
          <p className="max-w-[48ch] text-mist">
            Chaque fiche détaille le contexte, l&apos;objectif et le travail réalisé, avec un aperçu navigable du site.
          </p>
          <ButtonLink href="/realisations" variant="outline">
            Toutes les réalisations
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
