import { cn } from "@/lib/cn";

/** Rendu indicatif des 4 styles de sous-titres disponibles (mêmes noms et principes que le moteur de rendu). */
const STYLES = [
  { name: "Classique", words: ["parle", "à", "tes", "clients"], hl: -1, cls: "font-bold normal-case" },
  { name: "Mot surligné", words: ["parle", "à", "tes"], hl: 2, cls: "font-bold normal-case" },
  { name: "Moderne", words: ["PARLE", "À", "TES"], hl: 0, cls: "font-extrabold uppercase tracking-tight" },
  { name: "Minimal", words: ["parle", "à", "tes", "clients", "avant"], hl: -1, cls: "font-medium normal-case" },
];

export function CaptionStyles() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Les 4 styles de sous-titres">
      {STYLES.map((s) => (
        <figure key={s.name}>
          <div className="relative aspect-[9/16] overflow-hidden rounded-lg border border-line-strong bg-[radial-gradient(110%_70%_at_50%_28%,#2b2b3a_0%,#15151e_62%,#0b0b10_100%)]">
            <div className="absolute inset-x-0 top-[20%] mx-auto aspect-square w-[40%] rounded-full bg-white/[0.07]" aria-hidden />
            <div className="absolute inset-x-[16%] top-[45%] bottom-0 rounded-t-[48%] bg-white/[0.05]" aria-hidden />
            <p
              className={cn(
                "absolute inset-x-1.5 bottom-[24%] text-center text-[9px] leading-tight text-fg sm:inset-x-3 sm:text-[13px] [text-shadow:0_1px_3px_rgb(0_0_0/0.95)]",
                s.cls,
              )}
            >
              {s.words.map((w, i) => (
                <span key={i} className={cn(i === s.hl && "text-primary-soft")}>
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
          <figcaption className="mt-2 text-[11px] text-muted sm:text-caption">{s.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Les 3 modes de cadrage, en schéma : où se place le cadre vertical dans l'image d'origine. */
const FRAMES = [
  { name: "Stable", text: "Cadre posé sur l'intervenant principal, changements rares et justifiés.", frame: "left-[18%]", wide: false },
  { name: "Suivi de l'intervenant", text: "Le cadre passe à la personne qui parle, après confirmation, sans à-coups.", frame: "left-[56%]", wide: false },
  { name: "Large", text: "Toute la scène reste visible sur un fond flouté. Aucun mouvement.", frame: "", wide: true },
];

export function FramingModes() {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:gap-5">
      {FRAMES.map((f) => (
        <li key={f.name}>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line-strong bg-[linear-gradient(160deg,#22222e,#111118)]" aria-hidden>
            <div className="absolute top-[22%] left-[24%] aspect-square w-[11%] rounded-full bg-white/[0.08]" />
            <div className="absolute top-[48%] left-[19%] bottom-0 w-[21%] rounded-t-[45%] bg-white/[0.06]" />
            <div className="absolute top-[24%] right-[24%] aspect-square w-[10%] rounded-full bg-white/[0.08]" />
            <div className="absolute top-[49%] right-[19%] bottom-0 w-[20%] rounded-t-[45%] bg-white/[0.06]" />
            {f.wide ? (
              <div className="absolute inset-y-0 left-1/2 w-[31%] -translate-x-1/2 rounded-sm border-2 border-primary-soft/80 bg-[linear-gradient(transparent_30%,rgb(139_92_246/0.12)_30%,rgb(139_92_246/0.12)_70%,transparent_70%)]" />
            ) : (
              <div className={cn("absolute inset-y-0 w-[31%] rounded-sm border-2 border-primary-soft/80", f.frame)} />
            )}
          </div>
          <p className="mt-3 text-caption font-semibold sm:text-small">{f.name}</p>
          <p className="mt-1 text-[11px] text-muted sm:text-small">{f.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Comment le moteur trie : passages retenus, et passages écartés avec leur raison (comme dans l'application). */
const ROWS = [
  { t: "04:12", topic: "Premier client", text: "« Mon premier client, je l'ai trouvé dans une boulangerie… »", verdict: "Retenu", score: 84, ok: true },
  { t: "05:30", topic: "Premier client", text: "« …et du coup il m'a rappelé la semaine suivante. »", verdict: "Écarté : commence au milieu d'une idée", ok: false },
  { t: "07:41", topic: "Pub ratée", text: "« J'ai brûlé 8 000 € en publicité en quatre semaines. »", verdict: "Retenu", score: 86, ok: true },
  { t: "11:02", topic: "—", text: "« Ouais, ouais… attends, je regarde l'heure. »", verdict: "Écarté : bavardage", ok: false },
  { t: "33:20", topic: "Burn-out", text: "« Je n'arrivais plus à ouvrir mon ordinateur. »", verdict: "Retenu", score: 88, ok: true },
  { t: "48:55", topic: "Pub ratée", text: "« Comme je disais, la pub m'a coûté très cher… »", verdict: "Écarté : redit le clip de 07:41", ok: false },
];

export function SortingTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-line" aria-label="Exemple de tri des passages">
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 text-caption text-subtle">
        <span>Passages analysés</span>
        <span>Exemple</span>
      </div>
      <ul className="divide-y divide-line">
        {ROWS.map((r) => (
          <li key={r.t} className="grid grid-cols-[3.25rem_1fr] gap-x-3 gap-y-1 px-4 py-3 sm:grid-cols-[3rem_6.5rem_1fr_9.5rem] sm:items-center">
            <span className="text-caption text-subtle tabular-nums">{r.t}</span>
            <span className="hidden text-caption text-muted sm:block">{r.topic}</span>
            <span className={cn("text-small", r.ok ? "text-fg" : "text-subtle line-through decoration-line-strong")}>{r.text}</span>
            <span
              className={cn(
                "col-start-2 text-caption sm:col-start-auto sm:text-right",
                r.ok ? "text-primary-soft" : "text-subtle",
              )}
            >
              {r.verdict}
              {r.score ? <span className="tabular-nums"> · {r.score}/100</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
