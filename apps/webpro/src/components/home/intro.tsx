import type { CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { Words } from "@/components/ui/words";

const principles = [
  {
    t: "Comprendre avant de créer",
    d: "Votre métier, vos clients, vos objectifs : tout commence par une écoute attentive. Le design vient ensuite.",
  },
  {
    t: "Des échanges directs",
    d: "Un langage simple, sans jargon technique. Vous savez où en est votre projet à chaque étape.",
  },
  {
    t: "Le soin du détail",
    d: "Lisibilité, vitesse, affichage sur téléphone : chaque détail compte dans la première impression que vous laissez.",
  },
];

export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="relative py-28 md:py-40">
      <div className="shell grid-12 gap-y-10">
        <div className="col-span-4 md:col-span-3">
          <SectionLabel index="01">Approche</SectionLabel>
        </div>
        <div className="col-span-4 md:col-span-9">
          <Words
            id="intro-title"
            className="t-h2 max-w-[16ch] text-paper"
            parts={["Le digital, au service de", { text: "votre activité.", className: "text-slate" }]}
          />
          <p data-reveal className="t-lead mt-10 max-w-[58ch] text-mist" style={{ "--d": 150 } as CSSProperties}>
            Votre présence en ligne joue un rôle essentiel dans la manière dont vos clients découvrent votre entreprise,
            comprennent vos services et prennent contact avec vous.{" "}
            <span className="text-paper">
              WEBPRO AGENCY vous accompagne dans la création d&apos;une communication digitale cohérente, professionnelle et
              adaptée à vos objectifs.
            </span>
          </p>
          <ul className="mt-20 grid gap-10 md:grid-cols-3 md:gap-8">
            {principles.map((p, i) => (
              <li key={p.t} data-reveal className="border-t border-line-strong pt-6" style={{ "--d": 100 + i * 120 } as CSSProperties}>
                <p className="t-label text-electric">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-[1.25rem] leading-snug font-semibold tracking-[-0.02em] text-paper">{p.t}</h3>
                <p className="mt-3 text-[0.98rem] text-mist">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
