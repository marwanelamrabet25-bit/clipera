import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ProgressClip = {
  id: string;
  rank: number;
  title: string | null;
  start_seconds: number;
  end_seconds: number;
  status: string;
};

function tc(s: number) {
  const t = Math.floor(s);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  return `${h ? `${h}:${String(m).padStart(2, "0")}` : m}:${String(t % 60).padStart(2, "0")}`;
}

/** Montage en cours : progression globale + état réel de chaque clip (aucune estimation inventée). */
export function ClipProgress({ clips }: { clips: ProgressClip[] }) {
  const ready = clips.filter((c) => c.status === "ready").length;
  const failed = clips.filter((c) => c.status === "failed").length;
  const done = ready + failed;
  const pct = clips.length ? Math.round((done / clips.length) * 100) : 0;
  return (
    <div className="rounded-lg border border-line bg-canvas p-4" data-testid="clip-progress" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-small font-medium">
          Montage des clips · {ready}/{clips.length} prêt{ready > 1 ? "s" : ""}
        </p>
        <span className="text-caption text-subtle tabular-nums">{pct} %</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-overlay"
        role="progressbar"
        aria-label="Clips montés"
        aria-valuemin={0}
        aria-valuemax={clips.length}
        aria-valuenow={done}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-3 flex flex-col divide-y divide-line">
        {clips.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2 text-small" data-status={c.status}>
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-caption font-semibold tabular-nums",
                c.status === "ready" && "bg-primary-strong text-on-primary",
                c.status === "rendering" && "border border-primary-line text-primary-soft",
                c.status === "failed" && "bg-danger-wash text-danger",
              )}
            >
              {c.status === "ready" ? <Check className="size-3.5" aria-hidden /> : c.status === "failed" ? <X className="size-3.5" aria-hidden /> : c.rank}
            </span>
            <span className="min-w-0 flex-1 truncate">{c.title ?? `Clip ${c.rank}`}</span>
            <span className="hidden shrink-0 text-caption text-subtle tabular-nums sm:inline">
              {tc(c.start_seconds)} → {tc(c.end_seconds)}
            </span>
            <span className="flex w-24 shrink-0 items-center justify-end gap-1.5 text-caption">
              {c.status === "rendering" && (
                <>
                  <Loader2 className="size-3.5 animate-spin text-primary-soft motion-reduce:animate-none" aria-hidden />
                  <span className="text-muted">Montage</span>
                </>
              )}
              {c.status === "ready" && <span className="text-primary-soft">Prêt</span>}
              {c.status === "failed" && <span className="text-danger">Échec</span>}
            </span>
          </li>
        ))}
      </ol>
      {failed > 0 && (
        <p className="mt-2 text-caption text-subtle">
          Un clip en échec n&apos;empêche pas les autres : il a été réessayé une fois avec un cadrage centré.
        </p>
      )}
    </div>
  );
}
