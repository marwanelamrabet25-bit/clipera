import { cn } from "@/lib/cn";

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
