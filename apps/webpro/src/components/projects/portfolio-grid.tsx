"use client";

import { startTransition, useState, ViewTransition } from "react";
import { categories, type Category, type Project } from "@/content/projects";
import { ProjectCard } from "./project-card";
import { cn } from "@/lib/cn";

/** Grille filtrable des réalisations. Le filtrage s'anime avec les View Transitions natives quand le navigateur les gère. */
export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Category | "Tous">("Tous");
  const list = filter === "Tous" ? projects : projects.filter((p) => p.categories.includes(filter));
  const counts = Object.fromEntries(categories.map((c) => [c, projects.filter((p) => p.categories.includes(c)).length])) as Record<Category, number>;

  return (
    <div>
      <div role="group" aria-label="Filtrer les réalisations par catégorie" className="flex flex-wrap gap-2">
        {(["Tous", ...categories] as const).map((c) => {
          const count = c === "Tous" ? projects.length : counts[c];
          const active = filter === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              disabled={count === 0}
              onClick={() => startTransition(() => setFilter(c))}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[3px] border px-4 text-[0.9rem] font-medium transition-colors disabled:opacity-40",
                active ? "border-paper bg-paper text-ink" : "border-line-strong text-mist hover:border-paper/50 hover:text-paper",
              )}
            >
              {c}
              <span className={cn("font-mono text-[0.7rem]", active ? "text-ink/60" : "text-slate")}>{count}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {list.length} projet{list.length > 1 ? "s" : ""} affiché{list.length > 1 ? "s" : ""}
      </p>

      <div className="mt-14 grid gap-x-6 gap-y-20 md:grid-cols-2">
        {list.map((p) => (
          <ViewTransition key={p.slug} name={`card-${p.slug}`}>
            <ProjectCard project={p} index={projects.indexOf(p)} headingLevel="h2" />
          </ViewTransition>
        ))}
      </div>
    </div>
  );
}
