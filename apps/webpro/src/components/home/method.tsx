"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { cn } from "@/lib/cn";

export const methodSteps = [
  {
    t: "Échange",
    d: "Un premier échange pour parler de votre activité, de vos clients et de ce que vous attendez de votre présence en ligne.",
  },
  {
    t: "Compréhension des besoins",
    d: "Nous clarifions ensemble les objectifs, les contenus disponibles, les fonctionnalités utiles et les priorités. Vous recevez ensuite une proposition détaillée.",
  },
  {
    t: "Direction créative",
    d: "Nous définissons l'univers visuel : couleurs, typographies, ton, mise en page. Une direction cohérente avec votre image et votre clientèle.",
  },
  {
    t: "Conception et ajustements",
    d: "Nous concevons les pages et les contenus, puis nous les ajustons avec vous jusqu'à un résultat qui vous ressemble.",
  },
  {
    t: "Livraison et accompagnement",
    d: "Mise en ligne, vérifications sur ordinateur et téléphone, prise en main. Nous restons disponibles pour faire évoluer votre présence en ligne.",
  },
];

/**
 * Méthode en 5 étapes. Le fil de progression suit le défilement de la page
 * (aucun détournement du défilement : la lecture reste libre).
 */
export function Method({ index = "04", headingId = "method-title" }: { index?: string; headingId?: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      setProgress(p);
      const items = Array.from(list.children) as HTMLElement[];
      let a = 0;
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top < mid) a = i;
      });
      setActive(a);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section aria-labelledby={headingId} className="relative border-t border-line py-28 md:py-40">
      <div className="shell grid-12 gap-y-14">
        <div className="col-span-4 md:col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <SectionLabel index={index}>Méthode</SectionLabel>
            <h2 id={headingId} className="t-h2 mt-8 max-w-[15ch] text-paper">
              Une méthode claire, <span className="text-slate">du premier échange à la mise en ligne.</span>
            </h2>
            <p className="mt-8 max-w-[38ch] text-mist">
              Cinq étapes, toujours dans le même ordre. Vous savez ce qui a été fait, ce qui vient ensuite et ce que nous
              attendons de vous.
            </p>
            <p className="mt-12 hidden font-mono text-[4.5rem] leading-none font-light tracking-[-0.06em] text-paper lg:block" aria-hidden>
              <span className="text-electric tabular-nums">{String(active + 1).padStart(2, "0")}</span>
              <span className="text-slate">/05</span>
            </p>
          </div>
        </div>

        <div className="relative col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7">
          <div aria-hidden className="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-line-strong">
            <div className="w-px origin-top bg-electric" style={{ height: "100%", transform: `scaleY(${progress})` }} />
          </div>
          <ol ref={listRef} className="space-y-16 md:space-y-24">
            {methodSteps.map((s, i) => (
              <li key={s.t} className="relative pl-14" style={{ "--i": i } as CSSProperties}>
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1.5 left-0 grid size-[1.4rem] place-items-center rounded-full border transition-colors duration-500",
                    i <= active ? "border-electric bg-electric" : "border-line-strong bg-ink",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", i <= active ? "bg-ink" : "bg-slate")} />
                </span>
                <p className="t-label text-slate">Étape {String(i + 1).padStart(2, "0")}</p>
                <h3
                  className={cn(
                    "mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.5rem)] leading-[1.05] font-bold tracking-[-0.035em] transition-colors duration-500",
                    i === active ? "text-paper" : "text-paper/55",
                  )}
                >
                  {s.t}
                </h3>
                <p className={cn("mt-4 max-w-[46ch] transition-colors duration-500", i === active ? "text-mist" : "text-mist/70")}>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
