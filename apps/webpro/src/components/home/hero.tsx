import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Words } from "@/components/ui/words";
import { ButtonLink } from "@/components/ui/button";
import { BrowserFrame, PhoneFrame } from "@/components/visuals/frames";
import { OrbitRing, OrbitUnderline } from "@/components/visuals/orbit";
import { ParallaxGroup } from "./parallax-group";
import { serviceArea } from "@/config/site";
import { services } from "@/config/services";
import { primaryCta } from "@/config/navigation";

const layer = (depth: number): CSSProperties => ({
  translate: `calc(var(--mx, 0) * ${depth}px) calc(var(--my, 0) * ${depth * 0.7}px)`,
});

function Tag({ children, className, style }: { children: React.ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <p className={`t-label pointer-events-none absolute z-20 items-center gap-2 text-[0.6875rem] text-mist ${className ?? ""}`} style={style}>
      <span aria-hidden className="h-px w-7 bg-paper/40" />
      {children}
    </p>
  );
}

const quickLinks = [
  ...services.map((s) => ({ href: s.href, index: s.index, label: s.name, accent: false })),
  { href: "/maquette-gratuite", index: "→", label: "Maquette gratuite", accent: true },
  { href: "/tarifs", index: "€", label: "Tarifs", accent: false },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-clip pt-[calc(var(--header-h)+2.75rem)] lg:pt-[calc(var(--header-h)+4.5rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-20%] h-[56rem] w-[70rem] opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(8,123,255,0.16), rgba(8,123,255,0.04) 55%, transparent 75%)" }}
      />

      <div className="shell grid-12 relative items-start gap-y-14">
        <div className="relative z-10 col-span-4 md:col-span-10 lg:col-span-7 xl:col-span-7">
          <p className="enter t-label flex items-center gap-3 text-mist" style={{ "--d": 80 } as CSSProperties}>
            <span aria-hidden className="inline-block size-1.5 bg-electric" />
            Agence digitale · Doubs (25)
          </p>

          <Words
            as="h1"
            id="hero-title"
            delay={150}
            auto
            className="mt-7 text-[clamp(2.6rem,1.1rem+4.7vw,5.6rem)] leading-[0.98] font-bold tracking-[-0.05em] text-paper"
            parts={[
              "Votre entreprise mérite une présence en ligne",
              {
                text: "à sa hauteur.",
                className: "text-electric",
                decoration: <OrbitUnderline className="-bottom-[0.24em] -left-[0.04em] h-[0.36em] w-[93%]" />,
              },
            ]}
          />

          <p className="enter t-lead mt-8 max-w-[42ch] text-mist" style={{ "--d": 520 } as CSSProperties}>
            Nous accompagnons les professionnels dans la création de leur site internet, leur communication digitale et la mise
            en valeur de leur activité.
          </p>

          <div className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ "--d": 640 } as CSSProperties}>
            <ButtonLink href={primaryCta.href}>{primaryCta.longLabel}</ButtonLink>
            <ButtonLink href="/tarifs" variant="outline">
              Voir les tarifs
            </ButtonLink>
          </div>

          <p className="enter t-meta mt-10 flex items-center gap-3 text-mist" style={{ "--d": 780 } as CSSProperties}>
            <span aria-hidden className="pulse-dot inline-block size-2 shrink-0 rounded-full bg-electric text-electric" />
            {serviceArea.summary}
          </p>
        </div>

        <ParallaxGroup className="relative col-span-4 h-[min(118vw,36rem)] md:col-span-12 lg:col-span-5 lg:h-[clamp(34rem,46vw,44rem)]">
          <div className="absolute -inset-x-[30%] -top-[6%] bottom-0 lg:-right-[40%] lg:-left-[38%]" style={layer(-6)}>
            <OrbitRing className="enter-fade absolute inset-0 h-full w-full -rotate-6" id="hero-ring" />
          </div>

          <div className="enter absolute top-[3%] left-0 w-[100%] lg:top-[4%] lg:left-[2%] lg:w-[132%]" style={{ "--d": 260, ...layer(10) } as CSSProperties}>
            <BrowserFrame
              src="/projects/oree/desktop.png"
              alt="Exemple de maquette de site vitrine pour un restaurant fictif : titre « Ce que la saison a de meilleur » et illustration d'une assiette"
              label="Exemple de maquette — restaurant (fictif)"
              sizes="(min-width: 1024px) 60vw, 92vw"
              preload
            />
          </div>

          <div className="enter absolute right-[4%] bottom-[2%] w-[38%] sm:w-[30%] lg:right-auto lg:bottom-[1%] lg:left-[3%] lg:w-[31%]" style={{ "--d": 480, ...layer(22) } as CSSProperties}>
            <PhoneFrame
              src="/projects/nacre/mobile.png"
              alt="Exemple de maquette mobile pour un institut de beauté fictif"
              sizes="(min-width: 1024px) 15vw, 36vw"
            />
          </div>

          <div className="enter absolute bottom-[10%] left-[2%] hidden w-[34%] sm:block lg:right-[-2%] lg:bottom-[4%] lg:left-auto lg:w-[34%]" style={{ "--d": 640, ...layer(16) } as CSSProperties}>
            <div className="overflow-hidden rounded-[12px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] ring-1 ring-paper/10">
              <Image
                src="/projects/oree/post-1.png"
                alt="Exemple de publication pour les réseaux sociaux d'un restaurant fictif : « L'automne s'invite à table »"
                width={714}
                height={714}
                sizes="(min-width: 1024px) 16vw, 34vw"
                className="h-auto w-full"
              />
            </div>
          </div>

          <Tag className="enter top-[-3%] left-[2%] hidden lg:flex" style={{ "--d": 900 } as CSSProperties}>
            Site vitrine
          </Tag>
          <Tag className="enter bottom-[-6%] left-[3%] hidden lg:flex" style={{ "--d": 1000 } as CSSProperties}>
            Version mobile
          </Tag>
          <Tag className="enter right-[-2%] bottom-[-3%] hidden xl:flex" style={{ "--d": 1100 } as CSSProperties}>
            Réseaux sociaux
          </Tag>
        </ParallaxGroup>
      </div>

      <div className="shell relative z-10 mt-14 lg:mt-20">
        <p className="t-label mb-4 text-slate lg:text-right">Exemples de maquettes · entreprises fictives</p>
        <nav aria-label="Accès rapides" className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-center justify-between gap-4 border-b border-line py-5 transition-colors hover:text-paper sm:pr-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="flex items-baseline gap-3">
                <span className="t-label text-electric">{l.index}</span>
                <span className={l.accent ? "font-semibold tracking-[-0.01em] text-glow" : "font-semibold tracking-[-0.01em] text-paper"}>{l.label}</span>
              </span>
              <span aria-hidden className="text-mist transition-transform duration-300 group-hover:translate-x-1 group-hover:text-electric">
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
