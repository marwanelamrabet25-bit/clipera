"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

/**
 * Démonstration du moteur multi-clips (données d'exemple, clairement signalées).
 * Elle reproduit la logique réelle : la vidéo est découpée en sujets, un passage au plus par sujet, choisis par note,
 * et le nombre suit la demande (Auto ≈ 1 clip pour 6 min de parole, plafonné à 10).
 */
const DURATION = 64 * 60;
const CHAPTERS = [
  { label: "Premier client", start: 0, end: 380 },
  { label: "Pub ratée", start: 380, end: 760 },
  { label: "Routine", start: 760, end: 1120 },
  { label: "Recruter", start: 1120, end: 1500 },
  { label: "Prix", start: 1500, end: 1890 },
  { label: "Burn-out", start: 1890, end: 2300 },
  { label: "TikTok", start: 2300, end: 2690 },
  { label: "Banque", start: 2690, end: 3060 },
  { label: "App ratée", start: 3060, end: 3460 },
  { label: "Conseil final", start: 3460, end: DURATION },
];
// Passage retenu dans chaque sujet, classés par note (ordre de choix du moteur).
const CLIPS = [
  { ch: 5, at: 2010, len: 47, score: 88, hook: ["Je n'arrivais plus", "à ouvrir mon ordinateur"], hl: 1 },
  { ch: 1, at: 450, len: 52, score: 86, hook: ["8 000 € brûlés", "en quatre semaines"], hl: 0 },
  { ch: 7, at: 2760, len: 41, score: 85, hook: ["Le banquier m'a dit oui", "pour une seule raison"], hl: 1 },
  { ch: 0, at: 95, len: 58, score: 84, hook: ["Mon premier client\u00a0?", "Dans une boulangerie"], hl: 1 },
  { ch: 4, at: 1610, len: 39, score: 83, hook: ["«\u00a0Trop cher\u00a0»\u00a0?", "Par rapport à quoi\u00a0?"], hl: 1 },
  { ch: 8, at: 3180, len: 44, score: 81, hook: ["Onze mois de code", "pour 42 téléchargements"], hl: 1 },
  { ch: 6, at: 2420, len: 36, score: 80, hook: ["Ta première phrase", "décide de tout"], hl: 0 },
  { ch: 9, at: 3590, len: 35, score: 79, hook: ["Vends quelque chose", "avant de créer ta boîte"], hl: 0 },
  { ch: 3, at: 1230, len: 48, score: 77, hook: ["Recruter, c'est", "racheter du temps"], hl: 1 },
  { ch: 2, at: 840, len: 50, score: 75, hook: ["Copie les résultats,", "pas les horaires"], hl: 0 },
];
const MODES = ["auto", 3, 5, 7, 10] as const;
type Mode = (typeof MODES)[number];

function tc(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
}

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const q = window.matchMedia("(prefers-reduced-motion: reduce)");
      q.addEventListener("change", cb);
      return () => q.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function EngineDemo() {
  const [mode, setMode] = useState<Mode>("auto");
  const count = mode === "auto" ? Math.min(10, Math.round(DURATION / 60 / 6)) : mode;
  const chosen = useMemo(() => CLIPS.slice(0, count).sort((a, b) => a.at - b.at), [count]);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const ready = reduced ? count : Math.min(progress, count);

  // Montage simulé, clip par clip (démonstration) : rejoue à chaque changement du nombre de clips.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setProgress((r) => (r >= 10 ? r : r + 1)), 420);
    return () => clearInterval(id);
  }, [count, reduced]);

  function choose(m: Mode) {
    setMode(m);
    setProgress(0);
  }

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-pop" aria-label="Démonstration : une vidéo de 64 minutes transformée en clips">
      {/* Barre de fenêtre */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-overlay" />
            <span className="size-2.5 rounded-full bg-overlay" />
            <span className="size-2.5 rounded-full bg-overlay" />
          </span>
          <p className="truncate text-caption text-muted">
            <span className="text-fg">podcast-episode-12.mp4</span> · 1 h 04 min
            <span className="hidden sm:inline"> · 10 sujets repérés</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line-strong px-2.5 py-0.5 text-[11px] text-subtle">
          Démonstration<span className="hidden sm:inline"> · données d&apos;exemple</span>
        </span>
      </div>

      <div className="p-4 sm:p-6">
        {/* Timeline : sujets, onde, passages retenus */}
        <div className="relative">
          <div className="flex h-6 gap-px overflow-hidden rounded-t-md text-[10px] leading-6 text-subtle">
            {CHAPTERS.map((c, i) => {
              const on = chosen.some((k) => k.ch === i);
              return (
                <span
                  key={c.label}
                  className={cn(
                    "truncate px-1.5 transition-colors duration-500",
                    on ? "bg-elevated text-muted" : "bg-canvas/60",
                  )}
                  style={{ width: `${((c.end - c.start) / DURATION) * 100}%` }}
                >
                  <span className="hidden md:inline">{c.label}</span>
                </span>
              );
            })}
          </div>
          <div className="relative h-14 overflow-hidden rounded-b-md bg-canvas sm:h-16">
            <div className="absolute inset-0 flex items-center gap-[2px] px-1 sm:gap-[3px]" aria-hidden>
              {Array.from({ length: 140 }, (_, i) => (
                <span
                  key={i}
                  className={cn("w-full rounded-full bg-line-strong", i % 2 === 1 && "hidden sm:block")}
                  style={{ height: `${18 + ((i * 53 + (i % 7) * 11) % 64)}%` }}
                />
              ))}
            </div>
            {chosen.map((c, i) => (
              <span
                key={c.at}
                className="absolute inset-y-1 rounded-sm border-x-2 border-primary-soft bg-primary/30 transition-opacity duration-500"
                style={{
                  left: `${(c.at / DURATION) * 100}%`,
                  width: `max(6px, ${(c.len / DURATION) * 100}%)`,
                  opacity: i < ready ? 1 : 0.35,
                }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-subtle tabular-nums">
            <span>0:00</span>
            <span>32:00</span>
            <span>1:04:00</span>
          </div>
        </div>

        {/* Choix du nombre de clips, comme dans l'application */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid w-full grid-cols-5 gap-1 rounded-lg border border-line bg-canvas p-1 sm:w-auto" role="group" aria-label="Nombre de clips (démonstration)">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => choose(m)}
                className={cn(
                  "h-9 rounded-md px-3 text-small font-medium tabular-nums transition-colors sm:min-w-12",
                  mode === m ? "bg-elevated text-fg ring-1 ring-primary-line" : "text-muted hover:text-fg",
                )}
              >
                {m === "auto" ? "Auto" : m}
              </button>
            ))}
          </div>
          <p className="text-caption text-muted" aria-live="polite">
            {mode === "auto" ? "Auto : " : ""}
            <span className="text-fg tabular-nums">{count} clips</span>, {count} sujets différents ·{" "}
            <span className="tabular-nums">{ready}</span>/{count} prêts
          </p>
        </div>

        {/* Clips verticaux */}
        <ol
          className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(90deg,#000_88%,transparent)] [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6"
          aria-label="Clips obtenus (faire défiler)"
        >
          {chosen.map((c, i) => {
            const isReady = i < ready;
            return (
              <li key={c.at} className="w-[38%] shrink-0 snap-start sm:w-[150px]">
                <div className="relative aspect-[9/16] overflow-hidden rounded-lg border border-line-strong bg-[radial-gradient(120%_70%_at_50%_30%,#2a2a38_0%,#14141c_60%,#0b0b10_100%)]">
                  <div className="absolute inset-x-0 top-[22%] mx-auto aspect-square w-[38%] rounded-full bg-white/[0.07]" aria-hidden />
                  <div className="absolute inset-x-[18%] top-[46%] bottom-0 rounded-t-[48%] bg-white/[0.05]" aria-hidden />
                  <p className="absolute inset-x-2 bottom-[17%] text-center text-[10px] leading-tight font-extrabold tracking-tight text-fg uppercase [text-shadow:0_1px_3px_rgb(0_0_0/0.9)] sm:text-[11px]">
                    {c.hook.map((l, j) => (
                      <span key={l} className={cn("block", j === c.hl && "text-primary-soft")}>
                        {l}
                      </span>
                    ))}
                  </p>
                  <span className="absolute top-2 left-2 rounded bg-canvas/75 px-1.5 py-0.5 text-[10px] text-muted tabular-nums">
                    {c.len} s
                  </span>
                  {!isReady && (
                    <div className="absolute inset-0 grid place-items-center bg-canvas/70 backdrop-blur-[2px]">
                      <span className="flex items-center gap-1.5 text-[11px] text-muted">
                        <Loader2 className="size-3.5 animate-spin text-primary-soft" aria-hidden /> Montage
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-muted">{CHAPTERS[c.ch].label}</span>
                  {isReady ? (
                    <span className="flex shrink-0 items-center gap-1 text-primary-soft tabular-nums">
                      <Check className="size-3" aria-hidden /> {tc(c.at)}
                    </span>
                  ) : (
                    <span className="shrink-0 text-subtle tabular-nums">{tc(c.at)}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
