import type { ReactNode } from "react";
import { SectionLabel } from "./section-label";
import { Words } from "./words";
import { cn } from "@/lib/cn";

type Part = string | { text: string; className?: string };

/** En-tête de section standard : étiquette à gauche, titre et texte à droite. */
export function SectionHead({
  index,
  label,
  title,
  id,
  children,
  className,
  stacked,
}: {
  index?: string;
  label: string;
  title: Part[];
  id: string;
  children?: ReactNode;
  className?: string;
  /** Étiquette au-dessus du titre (colonnes étroites). */
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div className={className}>
        <SectionLabel index={index}>{label}</SectionLabel>
        <Words id={id} className="t-h2 mt-8 max-w-[16ch] text-paper" parts={title} />
        {children && (
          <div data-reveal className="t-lead mt-8 max-w-[52ch] space-y-5 text-mist">
            {children}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={cn("grid-12 gap-y-8", className)}>
      <div className="col-span-4 md:col-span-3">
        <SectionLabel index={index}>{label}</SectionLabel>
      </div>
      <div className="col-span-4 md:col-span-9">
        <Words id={id} className="t-h2 max-w-[18ch] text-paper" parts={title} />
        {children && (
          <div data-reveal className="t-lead mt-8 max-w-[58ch] space-y-5 text-mist">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
