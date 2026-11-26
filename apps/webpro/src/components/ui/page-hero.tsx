import type { CSSProperties, ReactNode } from "react";
import { Words } from "./words";
import { Breadcrumbs } from "./breadcrumbs";
import { cn } from "@/lib/cn";

type Part = string | { text: string; className?: string; decoration?: ReactNode };

/** En-tête des pages intérieures : fil d'Ariane, H1 révélé, chapô, actions et visuel optionnel. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  actions,
  aside,
  className,
  titleClassName,
  wide,
}: {
  crumbs: { name: string; path: string }[];
  eyebrow?: string;
  title: Part[];
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
  /** Titre sur toute la largeur (pas de visuel latéral). */
  wide?: boolean;
}) {
  return (
    <section className={cn("relative overflow-clip pt-[calc(var(--header-h)+2.5rem)] pb-20 md:pt-[calc(var(--header-h)+3.5rem)] md:pb-28", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-[-10%] h-[44rem] w-[60rem] opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(8,123,255,0.12), transparent 75%)" }}
      />
      <div className="shell relative">
        <div className="enter" style={{ "--d": 0 } as CSSProperties}>
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="grid-12 mt-12 items-end gap-y-14 md:mt-16">
          <div className={cn("col-span-4 md:col-span-12", wide ? "lg:col-span-11" : aside ? "lg:col-span-7" : "lg:col-span-10")}>
            {eyebrow && (
              <p className="enter t-label mb-7 flex items-center gap-3 text-mist" style={{ "--d": 60 } as CSSProperties}>
                <span aria-hidden className="inline-block size-1.5 bg-electric" />
                {eyebrow}
              </p>
            )}
            <Words as="h1" auto delay={60} parts={title} className={cn("t-h1 text-paper", titleClassName)} />
            {lead && (
              <div className="enter t-lead mt-8 max-w-[56ch] text-mist" style={{ "--d": 420 } as CSSProperties}>
                {lead}
              </div>
            )}
            {actions && (
              <div className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ "--d": 540 } as CSSProperties}>
                {actions}
              </div>
            )}
          </div>
          {aside && (
            <div className="enter col-span-4 md:col-span-12 lg:col-span-5" style={{ "--d": 300 } as CSSProperties}>
              {aside}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
