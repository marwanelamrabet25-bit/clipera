import { cn } from "@/lib/cn";

/** Étiquette éditoriale de section : « 01 — Expertises ». */
export function SectionLabel({ index, children, className }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("t-label flex items-center gap-3 text-mist", className)}>
      <span aria-hidden className="inline-block size-1.5 bg-electric" />
      {index && <span className="text-slate">{index}</span>}
      {index && <span aria-hidden className="h-px w-6 bg-line-strong" />}
      <span>{children}</span>
    </p>
  );
}
