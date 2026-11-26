import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { FeatureList } from "@/components/ui/feature-list";
import { DoubsMap } from "@/components/visuals/doubs-map";
import { OrbitUnderline } from "@/components/visuals/orbit";
import { ClosingCta } from "@/components/ui/closing-cta";
import { pageMetadata } from "@/lib/seo";
import { brand, serviceArea } from "@/config/site";
import { services } from "@/config/services";

export const metadata: Metadata = pageMetadata({
  title: "Agence digitale à Pierrefontaine-les-Varans",
  description:
    "WEBPRO AGENCY, agence digitale à Pierrefontaine-les-Varans : notre vision, nos valeurs et notre accompagnement des professionnels dans tout le Doubs.",
  path: "/a-propos",
});

const values = [
  { t: "Proximité", d: "Un interlocuteur joignable, qui prend le temps de comprendre votre activité et votre territoire." },
  { t: "Clarté", d: "Des explications simples, des propositions détaillées, aucun jargon inutile." },
  { t: "Exigence", d: "Le soin du détail, du premier écran au dernier pixel, sur ordinateur comme sur téléphone." },
  { t: "Honnêteté", d: "Pas de première place garantie sur Google ni d'abonnés promis : des engagements réalistes." },
];

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "À propos", path: "/a-propos" }]}
        eyebrow="L'agence"
        title={["Une agence digitale", { text: "à Pierrefontaine-les-Varans.", className: "text-slate" }]}
        lead={<p>{brand.referenceSentence}</p>}
        actions={<ButtonLink href="/contact">Faisons connaissance</ButtonLink>}
      />

      <section aria-labelledby="manifesto" className="relative border-t border-line py-32 md:py-44">
        <div className="shell grid-12">
          <div className="col-span-4 md:col-span-11 md:col-start-2">
            <p className="t-label text-mist">Notre conviction</p>
            <blockquote id="manifesto" className="mt-10">
              <p data-reveal className="text-[clamp(1.9rem,1.1rem+3.2vw,4.25rem)] leading-[1.08] font-bold tracking-[-0.04em] text-paper">
                <span className="text-slate">«&nbsp;</span>Nous pensons qu&apos;une présence en ligne de qualité ne devrait pas être réservée aux grandes
                entreprises. Chaque professionnel mérite une communication{" "}
                <span className="relative inline-block whitespace-nowrap text-electric" data-observe="">
                  à la hauteur
                  <OrbitUnderline className="-bottom-[0.2em] left-0 h-[0.32em] w-full" delay={500} />
                </span>{" "}
                de son savoir-faire.<span className="text-slate">&nbsp;»</span>
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-who" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            <SectionHead stacked index="01" label="Identité" id="about-who" title={["Deux métiers,", { text: "un même objectif.", className: "text-slate" }]} />
            <div data-reveal className="mt-8 max-w-[52ch] space-y-5 text-mist">
              <p>
                WEBPRO AGENCY accompagne les professionnels dans la création, l&apos;amélioration et le développement de leur
                présence numérique, autour de deux expertises complémentaires : la création de sites internet et la gestion des réseaux sociaux, vidéos comprises.
              </p>
              <p>
                Notre signature résume notre engagement :{" "}
                <strong className="font-semibold text-paper">« {brand.tagline} »</strong>
              </p>
            </div>
          </div>
          <ul className="col-span-4 md:col-span-12 lg:col-span-5 lg:col-start-8">
            {services.map((s, i) => (
              <li key={s.slug} data-reveal style={{ "--d": i * 100 } as CSSProperties} className="border-t border-line last:border-b">
                <Link href={s.href} className="group flex items-center justify-between gap-6 py-7">
                  <span>
                    <span className="t-label text-electric">{s.index}</span>
                    <span className="mt-2 block text-[1.5rem] leading-tight font-bold tracking-[-0.03em] text-paper transition-colors group-hover:text-glow">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-sm text-mist">{s.menuHint}</span>
                  </span>
                  <span aria-hidden className="text-xl text-mist transition-transform group-hover:translate-x-1 group-hover:text-electric">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-vision" className="border-t border-line py-28 md:py-36">
        <div className="shell">
          <SectionHead index="02" label="Vision" id="about-vision" title={["Le soin d'une grande marque,", { text: "la proximité en plus.", className: "text-slate" }]}>
            <p>
              Un artisan, un commerçant ou une PME du Doubs doit pouvoir compter sur une présence en ligne aussi soignée que celle
              d&apos;une grande enseigne, avec un interlocuteur proche, qui parle simplement et prend le temps de comprendre son
              métier.
            </p>
            <p className="text-paper">
              Notre rôle : traduire votre savoir-faire en une image claire, cohérente et crédible, sur votre site comme sur vos
              réseaux.
            </p>
          </SectionHead>
        </div>
      </section>

      <section aria-labelledby="about-values" className="border-t border-line bg-ink-2/40 py-28 md:py-36">
        <div className="shell">
          <SectionHead index="03" label="Valeurs" id="about-values" title={["Ce qui guide", { text: "notre travail.", className: "text-slate" }]} />
          <FeatureList items={values} columns={4} className="mt-16" />
        </div>
      </section>

      <section aria-labelledby="about-place" className="relative overflow-clip border-t border-line py-28 md:py-36">
        <div className="shell grid-12 items-center gap-y-16">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            <SectionHead stacked index="04" label="Implantation" id="about-place" title={["Basée dans le Haut-Doubs,", { text: "présente dans tout le département.", className: "text-slate" }]} />
            <div data-reveal className="mt-8 max-w-[52ch] space-y-5 text-mist">
              <p>
                Notre base est à Pierrefontaine-les-Varans. Nous accompagnons les entreprises, artisans, commerçants et
                indépendants partout dans le Doubs, sans nous limiter à un secteur.
              </p>
              <p>Quelques repères parmi les bassins où nous intervenons :</p>
            </div>
            <ul data-reveal className="mt-6 flex flex-wrap gap-2">
              {serviceArea.sectors.map((s) => (
                <li key={s} className="rounded-[3px] border border-line-strong px-3 py-1.5 text-sm text-paper">
                  {s}
                </li>
              ))}
              <li className="rounded-[3px] border border-dashed border-line-strong px-3 py-1.5 text-sm text-mist">et tout le Doubs</li>
            </ul>
          </div>
          <div className="col-span-4 md:col-span-10 md:col-start-2 lg:col-span-5 lg:col-start-8">
            <DoubsMap />
          </div>
        </div>
      </section>

      <ClosingCta title="Faisons" highlight="connaissance." text="Parlez-nous de votre activité : un premier échange suffit souvent à y voir plus clair." />
    </>
  );
}
