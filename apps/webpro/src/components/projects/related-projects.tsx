import { projects } from "@/content/projects";
import { ProjectCard } from "./project-card";
import { SectionHead } from "@/components/ui/section-head";
import { ArrowLink } from "@/components/ui/button";

export function RelatedProjects({ slugs, index, title = ["Des exemples", { text: "concrets.", className: "text-slate" }] }: { slugs: string[]; index?: string; title?: (string | { text: string; className?: string })[] }) {
  const list = slugs.map((s) => projects.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <section aria-labelledby="related-title" className="border-t border-line py-28 md:py-36">
      <div className="shell">
        <SectionHead index={index} label="Réalisations" id="related-title" title={title}>
          <p>Projets de démonstration : entreprises fictives, imaginées pour illustrer notre savoir-faire.</p>
        </SectionHead>
        <div className="mt-16 grid gap-x-6 gap-y-16 md:grid-cols-2">
          {list.map((p) => (
            <ProjectCard key={p.slug} project={p} index={projects.indexOf(p)} />
          ))}
        </div>
        <div className="mt-14">
          <ArrowLink href="/realisations">Voir toutes les réalisations</ArrowLink>
        </div>
      </div>
    </section>
  );
}
