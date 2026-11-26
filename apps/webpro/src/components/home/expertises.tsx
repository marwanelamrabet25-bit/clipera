import type { CSSProperties, ReactNode } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { Words } from "@/components/ui/words";
import { ArrowLink } from "@/components/ui/button";
import { services, type Service } from "@/config/services";
import { cn } from "@/lib/cn";
import { ContentVisual, SocialVisual, WebVisual } from "@/components/visuals/service-visuals";

const visuals: Record<Service["slug"], ReactNode> = {
  "creation-site-web": <WebVisual />,
  "gestion-reseaux-sociaux": <SocialVisual />,
  "creation-contenu": <ContentVisual />,
};

const linkLabels: Record<Service["slug"], string> = {
  "creation-site-web": "Découvrir la création de sites",
  "gestion-reseaux-sociaux": "Voir l'accompagnement réseaux sociaux",
  "creation-contenu": "Explorer la création de contenus",
};

export function Expertises() {
  return (
    <section id="expertises" aria-labelledby="expertises-title" className="relative border-t border-line bg-ink-2/40 py-28 md:py-40">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-3">
            <SectionLabel index="02">Expertises</SectionLabel>
          </div>
          <div className="col-span-4 md:col-span-9 md:flex md:items-end md:justify-between md:gap-10">
            <Words id="expertises-title" className="t-h2 max-w-[14ch] text-paper" parts={["Trois expertises,", { text: "une même exigence.", className: "text-slate" }]} />
            <p data-reveal className="mt-6 max-w-[34ch] text-mist md:mt-0 md:mb-2">
              Un site, des réseaux sociaux et des contenus qui parlent d&apos;une même voix : la vôtre.
            </p>
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          {services.map((s, i) => {
            const reverse = i % 2 === 1;
            return (
              <article
                key={s.slug}
                aria-labelledby={`exp-${s.slug}`}
                className="grid-12 items-center gap-y-14 border-t border-line py-16 first:border-t-0 first:pt-0 md:py-24"
              >
                <div className={cn("col-span-4 md:col-span-12 lg:col-span-5", reverse && "lg:order-2 lg:col-start-8")}>
                  <p data-reveal className="flex items-baseline gap-4">
                    <span className="font-mono text-[clamp(3rem,2rem+3vw,5rem)] leading-none font-light tracking-[-0.06em] text-electric">{s.index}</span>
                    <span className="t-label text-slate">/ 03</span>
                  </p>
                  <h3 id={`exp-${s.slug}`} data-reveal className="mt-6 text-[clamp(1.9rem,1.4rem+1.8vw,3rem)] leading-[1.02] font-bold tracking-[-0.04em] text-paper">
                    {s.title}
                  </h3>
                  <p data-reveal className="t-lead mt-6 max-w-[40ch] text-mist" style={{ "--d": 80 } as CSSProperties}>
                    {s.pitch}
                  </p>
                  <ul data-reveal className="mt-8 grid gap-x-6 border-t border-line pt-6 text-[0.95rem] sm:grid-cols-2" style={{ "--d": 160 } as CSSProperties}>
                    {s.items.map((it) => (
                      <li key={it} className="flex items-baseline gap-2.5 py-1.5 text-paper/90">
                        <span aria-hidden className="h-px w-3 shrink-0 translate-y-[-0.3em] bg-electric" />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div data-reveal className="mt-10" style={{ "--d": 220 } as CSSProperties}>
                    <ArrowLink href={s.href}>{linkLabels[s.slug]}</ArrowLink>
                  </div>
                </div>
                <div className={cn("col-span-4 md:col-span-12 lg:col-span-6", reverse ? "lg:order-1 lg:col-start-1" : "lg:col-start-7")}>
                  {visuals[s.slug]}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
