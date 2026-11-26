import type { CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { Words } from "@/components/ui/words";
import { DoubsMap } from "@/components/visuals/doubs-map";
import { ArrowLink } from "@/components/ui/button";

const points = [
  { t: "Une base", d: "Pierrefontaine-les-Varans, dans le Haut-Doubs." },
  { t: "Tout le département", d: "Des projets avec les professionnels de tout le Doubs et des communes environnantes." },
  { t: "Des échanges directs", d: "Un interlocuteur joignable, proche de votre territoire." },
  { t: "À distance si besoin", d: "Selon les projets, nous pouvons aussi avancer ensemble à distance." },
];

export function Local({ index = "06" }: { index?: string }) {
  return (
    <section aria-labelledby="local-title" className="relative overflow-clip border-t border-line bg-ink-2/40 py-28 md:py-40">
      <div className="shell grid-12 items-center gap-y-16">
        <div className="col-span-4 md:col-span-12 lg:col-span-6">
          <SectionLabel index={index}>Ancrage local</SectionLabel>
          <Words
            id="local-title"
            className="t-h2 mt-8 max-w-[17ch] text-paper"
            parts={["Une agence locale,", { text: "ouverte à tous les projets du Doubs.", className: "text-slate" }]}
          />
          <p data-reveal className="t-lead mt-8 max-w-[52ch] text-mist">
            Installée à Pierrefontaine-les-Varans, WEBPRO AGENCY accompagne les artisans, commerçants, indépendants et
            entreprises dans leurs projets digitaux. Notre ancrage local nous permet de privilégier des échanges directs et un
            accompagnement adapté aux professionnels du territoire.{" "}
            <span className="text-paper">Nous intervenons dans tout le Doubs et ses communes environnantes.</span>
          </p>
          <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {points.map((p, i) => (
              <div key={p.t} data-reveal className="border-t border-line pt-5" style={{ "--d": i * 90 } as CSSProperties}>
                <dt className="font-semibold tracking-[-0.01em] text-paper">{p.t}</dt>
                <dd className="mt-2 text-[0.95rem] text-mist">{p.d}</dd>
              </div>
            ))}
          </dl>
          <div data-reveal className="mt-12">
            <ArrowLink href="/a-propos">En savoir plus sur l&apos;agence</ArrowLink>
          </div>
        </div>
        <div className="col-span-4 md:col-span-10 md:col-start-2 lg:col-span-5 lg:col-start-8">
          <DoubsMap />
        </div>
      </div>
    </section>
  );
}
