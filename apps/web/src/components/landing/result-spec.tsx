import { ClipScene, Phone } from "./clip-scene";

/**
 * « Ce que tu obtiens » : un clip, annoté comme une fiche technique. Chaque annotation décrit une règle réelle du
 * moteur de rendu. Le clip lui-même est une démonstration (pas un vrai résultat d'utilisateur).
 */
const LEFT = [
  { t: "Commence au début d'une phrase", d: "Jamais au milieu d'une idée. Les « euh, bon » d'ouverture sont retirés." },
  { t: "Cadré sur la personne qui parle", d: "Visages détectés, cadre stable, aucune tête coupée." },
  { t: "Un sujet, une idée", d: "Chaque clip vient d'un moment différent de ta vidéo." },
];
const RIGHT = [
  { t: "Sous-titres au mot près", d: "Synchronisés sur la voix, lisibles au-dessus des boutons des applications." },
  { t: "MP4 vertical, prêt à publier", d: "1080 × 1920 avec les offres payantes. Son harmonisé, sans « clic » au début." },
  { t: "Une note expliquée", d: "Sur 100 : accroche, contexte, cohérence, conclusion, durée. Pour choisir quoi publier d'abord." },
];

function Note({ t, d, align }: { t: string; d: string; align: "left" | "right" }) {
  return (
    <li className={align === "left" ? "lg:text-right" : ""}>
      <div className={`hidden items-center gap-3 lg:flex ${align === "left" ? "lg:flex-row-reverse" : ""}`}>
        <span className="size-1.5 shrink-0 rounded-full bg-primary-soft" aria-hidden />
        <span className="h-px flex-1 bg-line-strong" aria-hidden />
      </div>
      <p className="flex items-center gap-2.5 text-body font-semibold text-fg lg:mt-3 lg:block">
        <span className="size-1.5 shrink-0 rounded-full bg-primary-soft lg:hidden" aria-hidden />
        {t}
      </p>
      <p className="mt-1 text-small text-muted">{d}</p>
    </li>
  );
}

export function ResultSpec() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(260px,300px)_1fr] lg:gap-10">
      <ul className="order-2 grid gap-8 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-14">
        {LEFT.map((n) => (
          <Note key={n.t} {...n} align="left" />
        ))}
      </ul>
      <div className="order-1 mx-auto w-[64%] max-w-[300px] sm:w-[260px] lg:order-2 lg:w-full">
        <Phone label="Démonstration d'un clip vertical sous-titré">
          <ClipScene tone="violet" words={["Il", "faut", "arrêter", "de", "voir", "un", "recrutement", "comme", "une", "dépense"]} highlight={[6]} className="size-full" cycle={7} />
          <span className="absolute top-[6%] left-[6%] rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white/85 tabular-nums">0:41</span>
          <span className="absolute top-[6%] right-[6%] rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">84/100</span>
        </Phone>
        <p className="mt-4 text-center text-caption text-subtle">Démonstration · données d&apos;exemple</p>
      </div>
      <ul className="order-3 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-14">
        {RIGHT.map((n) => (
          <Note key={n.t} {...n} align="right" />
        ))}
      </ul>
    </div>
  );
}
