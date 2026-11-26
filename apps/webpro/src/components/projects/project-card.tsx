import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/cn";

/** Carte de réalisation : écran posé sur un aplat à la couleur du projet. */
export function ProjectCard({
  project,
  index,
  className,
  sizes = "(min-width: 1024px) 45vw, 92vw",
  headingLevel = "h3",
}: {
  project: Project;
  index: number;
  className?: string;
  sizes?: string;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  return (
    <article className={cn("group relative", className)}>
      <Link href={`/realisations/${project.slug}`} className="block rounded-[6px] focus-visible:outline-offset-4">
        <div data-reveal="mask">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[6px]" style={{ background: project.tone } as CSSProperties}>
          <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(90% 70% at 70% 0%, rgba(255,255,255,0.14), transparent 60%)" }} />
          <div className="absolute inset-x-[7%] top-[9%] bottom-[-12%] overflow-hidden rounded-t-[8px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/20 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-3">
            <div className="flex h-5 items-center gap-1 bg-[#0B0E14] px-2.5">
              <span className="size-1.5 rounded-full bg-white/25" />
              <span className="size-1.5 rounded-full bg-white/25" />
              <span className="size-1.5 rounded-full bg-white/25" />
            </div>
            <div className="scrollshot relative h-full">
              <Image src={project.images.full} alt={`Aperçu du site ${project.name}`} fill sizes={sizes} className="object-cover object-top" />
            </div>
          </div>
          <span className="t-label absolute top-4 left-4 rounded-[2px] bg-black/45 px-2 py-1 text-[0.625rem] text-paper/90 backdrop-blur-sm">
            {project.demo ? "Projet de démonstration" : "Réalisation"}
          </span>
        </div>
        </div>
        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <p className="t-label text-slate">
              {String(index + 1).padStart(2, "0")} — {project.sectorShort}
            </p>
            <H className="mt-2 text-[1.75rem] leading-tight font-bold tracking-[-0.035em] text-paper transition-colors group-hover:text-glow">
              {project.name}
            </H>
            <p className="mt-1 text-mist">{project.sector}</p>
          </div>
          <span aria-hidden className="mt-7 grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-paper transition-all duration-500 group-hover:border-electric group-hover:bg-electric group-hover:text-ink">
            →
          </span>
        </div>
        <p className="mt-4 text-[0.9rem] text-slate">{project.categories.join(" / ")}</p>
      </Link>
    </article>
  );
}
