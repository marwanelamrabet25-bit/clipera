import type { ReactNode } from "react";

/** Valeur légale : affichée telle quelle si renseignée, sinon marquée « À compléter » de façon visible. */
export function LegalValue({ value, label }: { value: string | null | undefined; label: string }) {
  if (value) return <>{value}</>;
  return (
    <mark className="rounded-[2px] bg-[#ffb020]/15 px-1.5 py-0.5 font-mono text-[0.85em] text-[#ffc861]">
      [À compléter : {label}]
    </mark>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid-12 gap-y-4 border-t border-line py-12">
      <h2 id={id} className="col-span-4 text-[1.35rem] leading-tight font-bold tracking-[-0.025em] text-paper md:col-span-4">
        {title}
      </h2>
      <div className="col-span-4 space-y-4 text-mist md:col-span-8 [&_a]:link-inline [&_strong]:font-semibold [&_strong]:text-paper">
        {children}
      </div>
    </section>
  );
}
