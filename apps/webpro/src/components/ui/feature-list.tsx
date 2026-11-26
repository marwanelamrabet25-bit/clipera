import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Liste numérotée sur filets : prestations, types de sites, principes. */
export function FeatureList({
  items,
  columns = 3,
  className,
  numbered = true,
}: {
  items: { t: string; d: string }[];
  columns?: 2 | 3 | 4;
  className?: string;
  numbered?: boolean;
}) {
  return (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-12",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((it, i) => (
        <li key={it.t} data-reveal className="border-t border-line-strong pt-6" style={{ "--d": (i % columns) * 90 } as CSSProperties}>
          {numbered && <p className="t-label text-electric">{String(i + 1).padStart(2, "0")}</p>}
          <h3 className="mt-4 text-[1.3rem] leading-snug font-semibold tracking-[-0.02em] text-paper">{it.t}</h3>
          <p className="mt-3 text-mist">{it.d}</p>
        </li>
      ))}
    </ul>
  );
}
