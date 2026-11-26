import Image from "next/image";
import type { CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { Words } from "@/components/ui/words";
import { ButtonLink } from "@/components/ui/button";
import { primaryCta } from "@/config/navigation";
import { mockupExamples } from "@/content/mockups";
import { cn } from "@/lib/cn";

export const mockupSteps = [
  { t: "Vous présentez votre entreprise", d: "Votre activité, vos services, votre clientèle : quelques informations suffisent pour commencer." },
  { t: "Nous préparons une première proposition", d: "Une maquette visuelle pensée pour votre entreprise et votre activité, conçue par nos soins." },
  { t: "Nous en parlons ensemble", d: "Nous vous présentons la maquette et échangeons sur la suite, si elle vous plaît." },
];

/** Pile de trois exemples de maquettes (entreprises fictives), décalés. */
export function MockupStack({ className }: { className?: string }) {
  const order = [mockupExamples[1], mockupExamples[2], mockupExamples[0]].filter(Boolean);
  return (
    <figure className={cn("relative", className)}>
      <div className="relative aspect-[16/13.5]">
        {order.map((m, i) => (
          <div
            key={m.slug}
            data-reveal
            className="absolute overflow-hidden rounded-[8px] ring-1 ring-paper/10 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]"
            style={
              {
                "--d": i * 140,
                width: `${76 + i * 6}%`,
                left: `${i * 9}%`,
                top: `${i * 13}%`,
                zIndex: i,
                filter: i === order.length - 1 ? undefined : `brightness(${0.5 + i * 0.15})`,
              } as CSSProperties
            }
          >
            <div className="flex h-5 items-center gap-1 bg-ink-2 px-2.5">
              <span className="size-1.5 rounded-full bg-paper/25" />
              <span className="size-1.5 rounded-full bg-paper/25" />
              <span className="size-1.5 rounded-full bg-paper/25" />
              <span className="ml-auto font-mono text-[0.55rem] text-mist">Exemple — {m.sector.toLowerCase()}</span>
            </div>
            <div className="relative aspect-[16/10]">
              <Image src={m.images.desktop} alt={`Exemple de maquette pour un ${m.sector.toLowerCase()} (entreprise fictive)`} fill sizes="(min-width: 1024px) 40vw, 80vw" className="object-cover object-top" />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="t-label mt-6 text-slate">Exemples de maquettes · entreprises fictives, pas des réalisations clients</figcaption>
    </figure>
  );
}

/** Section d'accueil : l'offre de maquette gratuite. */
export function MockupOffer({ index = "03" }: { index?: string }) {
  return (
    <section id="maquette-gratuite" aria-labelledby="mockup-title" className="relative overflow-clip border-t border-line py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-[-15%] h-[40rem] w-[60rem] opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(8,123,255,0.12), transparent 75%)" }}
      />
      <div className="shell grid-12 relative items-center gap-y-16">
        <div className="col-span-4 md:col-span-12 lg:col-span-6">
          <SectionLabel index={index}>Maquette gratuite</SectionLabel>
          <Words
            id="mockup-title"
            className="t-h2 mt-8 max-w-[17ch] text-paper"
            parts={["Découvrez", { text: "gratuitement", className: "text-electric" }, "une première maquette de votre futur site internet."]}
          />
          <p data-reveal className="t-lead mt-8 max-w-[50ch] text-mist">
            Vous souhaitez savoir à quoi pourrait ressembler votre futur site internet ? WEBPRO AGENCY vous propose de découvrir
            gratuitement une première maquette visuelle adaptée à votre entreprise et à votre activité.
          </p>
          <ol className="mt-10 border-t border-line">
            {mockupSteps.map((s, i) => (
              <li key={s.t} data-reveal style={{ "--d": i * 100 } as CSSProperties} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-5">
                <span className="font-mono text-sm text-electric">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-semibold text-paper">{s.t}</span>
                  <span className="mt-1 block text-[0.95rem] text-mist">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p data-reveal className="mt-6 text-sm text-slate">
            Il s&apos;agit d&apos;une première proposition visuelle, préparée par nos soins : ce n&apos;est pas la création
            gratuite d&apos;un site complet.
          </p>
          <div data-reveal className="mt-10">
            <ButtonLink href={primaryCta.href}>{primaryCta.longLabel}</ButtonLink>
          </div>
        </div>
        <div className="col-span-4 md:col-span-12 lg:col-span-6">
          <MockupStack />
        </div>
      </div>
    </section>
  );
}

/** Bandeau court de rappel, pour les pages intérieures. */
export function MockupBand({ className }: { className?: string }) {
  return (
    <section aria-label="Maquette gratuite" className={cn("border-t border-line py-20", className)}>
      <div className="shell">
        <div data-reveal className="flex flex-col gap-8 rounded-[6px] border border-electric/50 bg-ink-3/60 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="t-label text-electric">Offert</p>
            <p className="mt-3 max-w-[30ch] text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] leading-tight font-bold tracking-[-0.035em] text-paper">
              Découvrez gratuitement une première maquette de votre futur site.
            </p>
            <p className="mt-3 max-w-[56ch] text-mist">Une première proposition visuelle, adaptée à votre entreprise et à votre activité.</p>
          </div>
          <div className="shrink-0">
            <ButtonLink href={primaryCta.href}>{primaryCta.longLabel}</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
