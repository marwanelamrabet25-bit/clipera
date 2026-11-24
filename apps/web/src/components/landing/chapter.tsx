import type { ReactNode } from "react";

/** En-tête de section façon « chapitre de montage » : numéro + timecode, puis titre. Signature visuelle de Clipera. */
export function Chapter({
  n,
  time,
  label,
  title,
  children,
  id,
}: {
  n: string;
  time: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <header className="max-w-3xl scroll-mt-24" id={id}>
      <p className="flex items-center gap-3 text-caption font-medium tracking-wide text-subtle uppercase tabular-nums">
        <span className="text-primary-soft">{n}</span>
        <span className="h-px w-8 bg-line-strong" aria-hidden />
        <span>{time}</span>
        <span aria-hidden>·</span>
        <span>{label}</span>
      </p>
      <h2 className="mt-5 text-[2rem] leading-[1.08] font-bold tracking-[-0.03em] text-balance sm:text-[2.75rem]">{title}</h2>
      {children && <div className="mt-5 max-w-2xl text-body text-muted sm:text-[1.0625rem]">{children}</div>}
    </header>
  );
}
