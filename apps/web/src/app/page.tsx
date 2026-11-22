import type { Metadata } from "next";
import {
  ArrowRight,
  AudioLines,
  Captions,
  Check,
  Crop,
  Download,
  Gauge,
  Scissors,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { BeforeAfter, HeroVisual } from "@/components/landing/visuals";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PricingTable } from "@/components/pricing/pricing-table";
import { getPublicPlans } from "@/lib/public-plans";
import { graph, organizationLd, SOLUTION_PAGES, softwareLd, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Clipera — Transforme tes vidéos longues en clips courts grâce à l'IA" },
  description:
    "Clipera transforme tes vidéos longues en clips courts : meilleurs passages, recadrage vertical et sous-titres synchronisés, prêts pour TikTok, Shorts et Reels.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Clipera — Transforme tes vidéos. Multiplie tes opportunités.",
    description: "Des clips courts, naturels et prêts à publier, à partir de tes vidéos longues.",
    type: "website",
    locale: "fr_FR",
    siteName: "Clipera",
  },
};

const STEPS = [
  {
    icon: Upload,
    title: "Importe ta vidéo",
    text: "Podcast, interview, live, vlog : un fichier MP4 ou MOV depuis ton ordinateur, ou un lien Google Drive ou Dropbox.",
  },
  {
    icon: Wand2,
    title: "Choisis tes réglages",
    text: "Format (9:16, 1:1 ou 16:9), cadrage (Stable, Suivi de l'intervenant ou Large), sous-titres et leur style.",
  },
  {
    icon: Download,
    title: "Récupère tes clips",
    text: "Prévisualise chaque clip, compare leurs notes et télécharge des MP4 prêts à publier où tu veux.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Sélection des meilleurs passages",
    text: "La parole est transcrite par IA au mot près, puis chaque passage est noté (accroche, cohérence, conclusion, énergie de la voix) pour garder ceux qui tiennent debout seuls — pas un découpage toutes les 60 secondes.",
  },
  {
    icon: Captions,
    title: "Sous-titres synchronisés au mot",
    text: "Quatre styles (Classique, Mot surligné, Moderne, Minimal), typographie française respectée, placés au-dessus des boutons des applications.",
  },
  {
    icon: Crop,
    title: "Recadrage 9:16, 1:1 et 16:9",
    text: "Les visages sont détectés par IA et le cadre se place sur la personne qui parle, sans à-coups et sans jamais couper une tête. Trois modes au choix.",
  },
  {
    icon: Scissors,
    title: "Coupes propres",
    text: "Début et fin calés sur les phrases, changements de caméra respectés, aucun passage coupé en plein milieu d'une idée.",
  },
  {
    icon: Gauge,
    title: "Clip Score indicatif",
    text: "Une note expliquée (accroche, clarté, rythme, conclusion) pour t'aider à choisir. Ce n'est pas une prédiction de vues.",
  },
  {
    icon: AudioLines,
    title: "Son équilibré",
    text: "Volume harmonisé pour les réseaux, fondus d'entrée et de sortie : pas de « clic » au début du clip.",
  },
];

const QUALITY = [
  "Pas de zoom permanent ni d'effets aléatoires",
  "Coupes en fin de phrase, jamais au milieu d'une idée",
  "Sous-titres sobres et lisibles sur mobile",
  "Résolution d'origine respectée, jamais agrandie artificiellement",
  "Si ta vidéo ne contient que 3 bons passages, tu obtiens 3 clips — pas 5 clips médiocres",
];

const FAQ = [
  {
    q: "Qu'est-ce que Clipera ?",
    a: "Clipera (clipera.fr) est un logiciel en ligne qui transforme tes vidéos longues en clips courts grâce à l'intelligence artificielle : il transcrit la vidéo, choisit les meilleurs passages, les recadre en vertical et ajoute des sous-titres synchronisés. Rien à installer : tout se passe dans ton navigateur.",
  },
  {
    q: "Clipera est-il déjà disponible ?",
    a: "Oui. Tu peux créer un compte gratuit, importer tes vidéos et générer tes clips dès maintenant. Les offres payantes se règlent par carte bancaire, sur la page sécurisée de Stripe.",
  },
  {
    q: "Quelles vidéos puis-je utiliser ?",
    a: "Des vidéos en français, avec de la parole, dont tu détiens les droits (tu en es l'auteur ou tu as l'autorisation de les exploiter) : fichiers MP4, MOV, M4V, MKV ou WEBM depuis ton ordinateur, ou lien de partage Google Drive ou Dropbox. Clipera ne télécharge pas de vidéos depuis YouTube, TikTok ou d'autres plateformes.",
  },
  {
    q: "Mes vidéos restent-elles privées ?",
    a: "Oui. Elles sont stockées dans un espace privé en Europe, accessibles uniquement par toi, et les vidéos sources sont supprimées automatiquement 30 jours après leur import. Elles ne servent jamais à entraîner des modèles d'IA.",
  },
  {
    q: "Clipera garantit-il des vues ?",
    a: "Non. Personne ne peut garantir des vues, la viralité ou des revenus. Clipera t'aide à produire plus vite des clips de qualité ; le Clip Score est une aide au choix, pas une prédiction.",
  },
  {
    q: "Et si un traitement échoue ?",
    a: "Si aucun clip n'est produit, ton quota n'est pas consommé : il t'est restitué automatiquement.",
  },
  {
    q: "Puis-je publier mes clips où je veux ?",
    a: "Oui : TikTok, YouTube Shorts, Instagram Reels ou ailleurs. Tu télécharges des fichiers MP4 et tu restes libre de leur utilisation.",
  },
  {
    q: "Puis-je supprimer mon compte ?",
    a: "À tout moment, depuis Paramètres. Tout est effacé immédiatement, fichiers compris.",
  },
];

function SectionTitle({ eyebrow, title, text, id }: { eyebrow: string; title: string; text?: string; id?: string }) {
  return (
    <div className="max-w-2xl" id={id}>
      <p className="text-small font-semibold text-primary-soft">{eyebrow}</p>
      <h2 className="mt-3 text-h1 font-bold text-balance">{title}</h2>
      {text && <p className="mt-4 text-body text-muted">{text}</p>}
    </div>
  );
}

export default async function Home() {
  const plans = await getPublicPlans();
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={graph(organizationLd(), websiteLd(), softwareLd(plans))} />
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-line bg-primary-wash px-3 py-1 text-caption font-medium text-primary-soft">
                <span className="size-1.5 rounded-full bg-primary-soft" /> Clipera · générateur de clips IA en français
              </span>
              <h1 className="mt-6 text-h1 font-bold text-balance sm:text-display">
                Clipera transforme tes vidéos longues en <span className="text-primary-soft">clips courts</span> grâce à
                l&apos;IA.
              </h1>
              <p className="mt-6 max-w-xl text-body text-muted sm:text-h3 sm:font-normal">
                Clipera repère les meilleurs passages de tes podcasts et interviews, les recadre en vertical et ajoute des
                sous-titres synchronisés. Des clips naturels, prêts pour TikTok, Shorts et Reels.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/inscription" className={buttonStyles({ size: "lg" })}>
                  Créer un compte gratuit <ArrowRight />
                </Link>
                <a href="#tarifs" className={buttonStyles({ size: "lg", variant: "secondary" })}>
                  Voir les tarifs
                </a>
              </div>
              <p className="mt-4 text-small text-subtle">Offre gratuite · sans carte bancaire · rien à installer</p>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* Avant / après */}
        <section className="border-t border-line bg-surface/40">
          <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <SectionTitle
              eyebrow="Avant / après"
              title="Une vidéo de 58 minutes. Plusieurs clips qui tiennent debout seuls."
              text="Clipera ne coupe pas au hasard : chaque clip commence par une accroche, garde le contexte nécessaire et se termine sur une phrase complète. Le cadre suit la personne qui parle."
            />
            <div className="pt-8">
              <BeforeAfter />
            </div>
          </div>
        </section>

        {/* Fonctionnement */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <SectionTitle id="fonctionnement" eyebrow="Fonctionnement" title="Trois étapes, aucune compétence de montage requise." />
            <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="bg-canvas p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full border border-primary-line bg-primary-wash text-small font-semibold text-primary-soft">
                      {i + 1}
                    </span>
                    <s.icon className="size-5 text-subtle" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-h3 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-small text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="border-t border-line bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <SectionTitle
              id="fonctionnalites"
              eyebrow="Fonctionnalités"
              title="Tout ce qu'il faut pour des clips propres, rien de superflu."
              text="Toutes ces fonctionnalités sont incluses dès l'offre gratuite."
            />
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <f.icon className="size-5 text-primary-soft" aria-hidden />
                  <h3 className="mt-4 text-body font-semibold text-fg">{f.title}</h3>
                  <p className="mt-2 text-small text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Qualité du montage */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-8 lg:grid-cols-2 lg:items-start">
            <SectionTitle
              eyebrow="Qualité du montage"
              title="Un montage naturel, pas un montage « fait par une IA »."
              text="Les clips doivent donner envie d'être regardés jusqu'au bout. Nos règles sont simples et appliquées à chaque rendu, avec un contrôle automatique du fichier final."
            />
            <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
              {QUALITY.map((q) => (
                <li key={q} className="flex gap-3 p-5 text-small text-fg">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary-soft" aria-hidden />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tarifs */}
        <section className="border-t border-line bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <SectionTitle
              id="tarifs"
              eyebrow="Tarifs"
              title="Des offres simples, sans engagement."
              text="Prix TTC. Mensuel sans engagement, ou annuel avec 2 mois offerts. Commence avec l'offre gratuite, sans carte bancaire."
            />
            {plans.length > 0 ? (
              <div className="mt-12">
                <PricingTable plans={plans} />
              </div>
            ) : (
              <p className="mt-10 text-muted">Les tarifs sont momentanément indisponibles.</p>
            )}
          </div>
        </section>

        {/* Pour qui : maillage vers les pages de contenu */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <SectionTitle
              eyebrow="Pour qui ?"
              title="Pour tous ceux qui parlent face caméra."
              text="Podcasteurs, coachs, formateurs, créateurs YouTube, entrepreneurs et agences : si ta vidéo contient de la parole, Clipera peut en tirer des clips courts. Découvre comment selon ton besoin."
            />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SOLUTION_PAGES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="flex h-full items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-5 py-4 text-small font-medium text-fg transition-colors hover:border-primary-line"
                  >
                    {p.label}
                    <ArrowRight className="size-4 shrink-0 text-primary-soft" aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="flex h-full items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-5 py-4 text-small font-medium text-fg transition-colors hover:border-primary-line"
                >
                  Guides et conseils (blog)
                  <ArrowRight className="size-4 shrink-0 text-primary-soft" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
            <SectionTitle id="faq" eyebrow="FAQ" title="Questions fréquentes" />
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-h3 text-subtle transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-small text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-primary-line bg-surface px-6 py-14 text-center sm:px-12">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-primary/15 blur-3xl" />
              <h2 className="relative text-h1 font-bold text-balance">
                Transforme tes vidéos. <span className="text-primary-soft">Multiplie tes opportunités.</span>
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-muted">
                Crée ton compte gratuit et génère tes premiers clips dès aujourd&apos;hui.
              </p>
              <Link href="/inscription" className={cn(buttonStyles({ size: "lg" }), "relative mt-8")}>
                Créer un compte gratuit <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
