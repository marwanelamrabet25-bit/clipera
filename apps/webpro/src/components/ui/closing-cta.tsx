import type { CSSProperties } from "react";
import { Words } from "./words";
import { ButtonLink } from "./button";
import { OrbitRing, OrbitUnderline } from "@/components/visuals/orbit";
import { contact } from "@/config/site";

/** Appel à l'action de fin de page, commun à tout le site. */
export function ClosingCta({
  title = "Votre prochain projet",
  highlight = "commence ici.",
  text = "Vous avez une idée, un besoin ou un projet à développer ? Échangeons ensemble sur la meilleure manière de le concrétiser.",
  cta = "Parlons de votre projet",
}: {
  title?: string;
  highlight?: string;
  text?: string;
  cta?: string;
}) {
  return (
    <section aria-labelledby="closing-title" className="relative overflow-clip border-t border-line py-32 md:py-48">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-[46rem] -translate-y-1/2 opacity-70">
        <OrbitRing className="absolute top-0 left-1/2 h-full w-[120rem] max-w-none -translate-x-1/2 -rotate-3" id="closing-ring" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(closest-side, rgba(8,123,255,0.12), transparent 70%)" }}
      />
      <div className="shell relative text-center">
        <p className="t-label text-mist">Contact & devis</p>
        <Words
          id="closing-title"
          className="t-display mx-auto mt-8 max-w-[12ch] text-paper"
          parts={[
            title,
            {
              text: highlight,
              className: "text-electric",
              decoration: <OrbitUnderline className="-bottom-[0.14em] left-0 h-[0.36em] w-full" delay={800} />,
            },
          ]}
        />
        <p data-reveal className="t-lead mx-auto mt-10 max-w-[46ch] text-mist" style={{ "--d": 200 } as CSSProperties}>
          {text}
        </p>
        <div data-reveal className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ "--d": 320 } as CSSProperties}>
          <ButtonLink href="/contact">{cta}</ButtonLink>
          <ButtonLink href={`tel:${contact.phoneE164}`} variant="outline" icon="up">
            {contact.phoneDisplay}
          </ButtonLink>
        </div>
        <p data-reveal className="mt-8 text-mist" style={{ "--d": 420 } as CSSProperties}>
          ou par email :{" "}
          <a href={`mailto:${contact.email}`} className="link-inline">
            {contact.email}
          </a>
        </p>
      </div>
    </section>
  );
}
