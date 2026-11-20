import { cn } from "@/lib/cn";

/** Mention obligatoire sur les visuels qui ne sont pas des captures du produit. */
export function IllustrationTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border border-line-strong bg-canvas/80 px-2.5 py-1 text-caption text-subtle backdrop-blur",
        className,
      )}
    >
      Illustration
    </span>
  );
}

/** Une vidéo longue, ses passages forts repérés, puis les clips verticaux obtenus. */
export function HeroVisual() {
  const segments = [
    { left: "8%", width: "7%" },
    { left: "31%", width: "9%" },
    { left: "57%", width: "6%" },
    { left: "78%", width: "8%" },
  ];
  const clips = [
    { line: ["Le conseil qui a", "tout changé"], hl: 1 },
    { line: ["Personne ne", "parle de ça"], hl: 0 },
    { line: ["Voilà ce qu'il", "faut retenir"], hl: 1 },
  ];
  return (
    <div className="relative rounded-xl border border-line bg-surface p-5 shadow-pop sm:p-7" aria-hidden>
      <IllustrationTag className="absolute top-4 right-4" />
      <p className="text-caption font-medium tracking-wide text-subtle uppercase">Podcast · 58 min</p>
      <div className="relative mt-4 h-12 overflow-hidden rounded-md bg-elevated">
        <div className="absolute inset-0 flex items-center gap-[3px] px-2">
          {Array.from({ length: 64 }, (_, i) => (
            <span
              key={i}
              className="w-full rounded-full bg-line-strong"
              style={{ height: `${22 + ((i * 37) % 60)}%` }}
            />
          ))}
        </div>
        {segments.map((s, i) => (
          <span
            key={i}
            className="absolute inset-y-0 border-x-2 border-primary-soft bg-primary/25"
            style={{ left: s.left, width: s.width }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-caption text-subtle tabular-nums">
        <span>00:00</span>
        <span>4 passages forts repérés</span>
        <span>58:12</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        {clips.map((c, i) => (
          <div
            key={i}
            className="relative aspect-[9/16] overflow-hidden rounded-lg border border-line-strong bg-gradient-to-b from-overlay to-canvas"
          >
            <div className="absolute inset-x-0 top-[20%] mx-auto aspect-square w-[42%] rounded-full bg-line-strong" />
            <div className="absolute inset-x-[16%] top-[46%] bottom-0 rounded-t-[45%] bg-line" />
            <div className="absolute inset-x-2 bottom-[18%] text-center text-[10px] leading-tight font-bold text-fg [text-shadow:0_1px_3px_rgb(0_0_0/0.9)] sm:text-caption">
              {c.line.map((l, j) => (
                <span key={j} className={cn("block", j === c.hl && "text-primary-soft")}>
                  {l}
                </span>
              ))}
            </div>
            <span className="absolute top-2 left-2 rounded-sm bg-canvas/70 px-1.5 py-0.5 text-[10px] text-muted tabular-nums">
              0:{[38, 52, 41][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Avant : image horizontale. Après : cadrage vertical sur la personne qui parle, sous-titres lisibles. */
export function BeforeAfter() {
  return (
    <div className="relative grid items-center gap-6 sm:grid-cols-[1.6fr_auto_1fr]" aria-hidden>
      <IllustrationTag className="absolute -top-10 right-0" />
      <figure>
        <div className="relative aspect-video overflow-hidden rounded-lg border border-line-strong bg-gradient-to-br from-overlay to-surface">
          <div className="absolute top-[18%] left-[21%] aspect-square w-[12%] rounded-full bg-line-strong" />
          <div className="absolute top-[46%] left-[15%] bottom-0 w-[24%] rounded-t-[45%] bg-line" />
          <div className="absolute top-[20%] right-[21%] aspect-square w-[11%] rounded-full bg-line" />
          <div className="absolute top-[47%] right-[15%] bottom-0 w-[23%] rounded-t-[45%] bg-line/60" />
          <div className="absolute inset-y-0 left-[16%] w-[30%] rounded-sm border-2 border-dashed border-primary-soft/70" />
        </div>
        <figcaption className="mt-3 text-small text-muted">
          <strong className="text-fg">Avant</strong> · vidéo horizontale de 58 minutes
        </figcaption>
      </figure>
      <div className="hidden text-h2 text-primary-soft sm:block">→</div>
      <figure className="mx-auto w-40 sm:w-full sm:max-w-[200px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-lg border border-primary-line bg-gradient-to-b from-overlay to-canvas">
          <div className="absolute inset-x-0 top-[18%] mx-auto aspect-square w-[50%] rounded-full bg-line-strong" />
          <div className="absolute inset-x-[8%] top-[48%] bottom-0 rounded-t-[45%] bg-line" />
          <p className="absolute inset-x-3 bottom-[20%] text-center text-small leading-tight font-bold [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">
            Ce qui fait <span className="text-primary-soft">vraiment</span> la différence
          </p>
        </div>
        <figcaption className="mt-3 text-center text-small text-muted sm:text-left">
          <strong className="text-fg">Après</strong> · clip 9:16 de 41 s
        </figcaption>
      </figure>
    </div>
  );
}
