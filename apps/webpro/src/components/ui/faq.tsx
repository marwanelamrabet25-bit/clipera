import type { QA } from "@/content/faq";
import { cn } from "@/lib/cn";

/** Accordéon accessible basé sur <details> : fonctionne sans JavaScript. */
export function Faq({ items, className }: { items: QA[]; className?: string }) {
  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((it, i) => (
        <details key={it.q} className="faq group border-b border-line" name="faq">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left transition-colors hover:text-paper md:py-7">
            <span className="flex gap-5">
              <span className="t-label pt-1.5 text-slate tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[1.125rem] leading-snug font-semibold tracking-[-0.015em] text-paper md:text-[1.25rem]">{it.q}</span>
            </span>
            <span aria-hidden className="relative mt-2 size-4 shrink-0">
              <span className="absolute top-1/2 left-0 h-px w-4 bg-electric" />
              <span className="absolute top-1/2 left-0 h-px w-4 rotate-90 bg-electric transition-transform duration-500 ease-[var(--ease-out-expo)] group-open:rotate-0" />
            </span>
          </summary>
          <div className="pb-7 pl-[2.9rem] md:pr-16">
            <p className="max-w-[68ch] text-mist">{it.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
