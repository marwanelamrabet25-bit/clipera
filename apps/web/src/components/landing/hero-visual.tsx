import { ClipScene, Phone } from "./clip-scene";
import { Waveform } from "./waveform";

/**
 * Pièce maîtresse du Hero : la vidéo source (16:9) et sa frise, dont trois passages sélectionnés deviennent trois
 * clips verticaux sous-titrés. Données de démonstration, signalées comme telles.
 */
const PICKS = [
  { left: 14, width: 5, at: "08:12" },
  { left: 47, width: 6, at: "31:40" },
  { left: 79, width: 4.5, at: "52:05" },
];

const CLIPS = [
  { tone: "amber" as const, words: ["Mon", "premier", "client,", "je", "l'ai", "trouvé", "à", "dix", "mètres"], hl: [7, 8], rot: "-rotate-[7deg]", pos: "left-0 top-[16%]", z: "z-10", d: 0 },
  { tone: "violet" as const, words: ["Ta", "première", "phrase", "décide", "de", "tout"], hl: [3], rot: "rotate-0", pos: "left-1/2 -translate-x-1/2 top-[4%]", z: "z-20", d: 0.6 },
  { tone: "teal" as const, words: ["Copie", "les", "résultats,", "pas", "les", "horaires"], hl: [2], rot: "rotate-[7deg]", pos: "right-0 top-[16%]", z: "z-10", d: 1.2 },
];

export function HeroVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-[540px] lg:max-w-[620px]" aria-label="Démonstration : une vidéo longue devient trois clips verticaux">
      {/* Vidéo source */}
      <div className="relative rounded-2xl border border-line-strong bg-surface p-2.5 shadow-pop sm:p-3">
        <div className="flex items-center justify-between px-1 pb-2.5 text-[11px] text-subtle">
          <span className="truncate">
            <span className="text-muted">podcast-episode-12.mp4</span> · 1:04:12
          </span>
          <span className="shrink-0 rounded-full border border-line-strong px-2 py-0.5">Démonstration</span>
        </div>
        <ClipScene tone="amber" layout="duo" className="aspect-video rounded-lg" />
        {/* Frise : passages retenus + tête de lecture */}
        <div className="relative mt-2.5 h-9 overflow-hidden rounded-md bg-canvas">
          <Waveform bars={72} className="absolute inset-0 size-full px-1 text-line-strong" />
          {PICKS.map((p) => (
            <span
              key={p.at}
              className="absolute inset-y-1 rounded-[3px] border-x-2 border-primary-soft bg-primary/35"
              style={{ left: `${p.left}%`, width: `${p.width}%` }}
              aria-hidden
            />
          ))}
          <span
            aria-hidden
            className="absolute inset-y-0 w-px bg-white shadow-[0_0_10px_2px_rgb(167_139_250/0.8)] motion-reduce:hidden"
            style={{ animation: "scan 9s linear infinite" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between px-1 text-[10px] text-subtle tabular-nums" aria-hidden>
          {PICKS.map((p, i) => (
            <span key={p.at} className={i === 1 ? "invisible" : undefined}>
              {p.at}
            </span>
          ))}
        </div>
      </div>

      {/* Les clips obtenus */}
      <div className="relative mx-auto -mt-8 h-[300px] w-[92%] sm:-mt-10 sm:h-[360px]">
        {CLIPS.map((c, i) => (
          <div key={i} className={`absolute w-[31%] ${c.pos} ${c.z}`}>
            <div className={`${c.rot} transition-transform duration-500 ease-out-soft hover:rotate-0 hover:-translate-y-1`}>
              <Phone>
                <ClipScene tone={c.tone} words={c.words} highlight={c.hl} className="size-full" cycle={6} delay={c.d} />
                <span className="absolute inset-x-[10%] bottom-[5%] h-[2px] overflow-hidden rounded-full bg-white/25" aria-hidden>
                  <span className="block h-full w-1/3 bg-white/90" />
                </span>
              </Phone>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
