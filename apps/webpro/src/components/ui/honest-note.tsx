import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Encadré d'honnêteté : ce que nous promettons… et ce que nous ne promettons pas. */
export function HonestNote({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <aside data-reveal className={cn("relative border-l-2 border-electric bg-ink-3/60 py-7 pr-6 pl-7 md:pl-9", className)}>
      <p className="t-label text-electric">{title}</p>
      <div className="mt-3 max-w-[62ch] text-mist">{children}</div>
    </aside>
  );
}
