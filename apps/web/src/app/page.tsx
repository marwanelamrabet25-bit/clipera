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
import { Logo } from "@/components/brand/logo";
import { BeforeAfter, HeroVisual } from "@/components/landing/visuals";
import { SiteFooter } from "@/components/legal/site-footer";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PricingTable } from "@/components/pricing/pricing-table";
import { getPublicPlans } from "@/lib/public-plans";

export const metadata: Metadata = {
  title: { absolute: "Clipera — Transforme tes vidéos longues en clips courts grâce à l'IA" },
  description:
    "Importe une vidéo longue : Clipera repère les meilleurs passages, les recadre en vertical, ajoute des sous-titres synchronisés et te livre des clips prêts à publier sur TikTok, Shorts et Reels.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Clipera — Transforme tes vidéos. Multiplie tes opportunités.",
    description: "Des clips courts, naturels et prêts à publier, à partir de tes vidéos longues.",
    type: "website",
    locale: "fr_FR",
    siteName: "Clipera",
  },
};

const NAV = [
  ["#fonctionnement", "Fonctionnement"],
  ["#fonctionnalites", "Fonctionnalités"],
  ["#tarifs", "Tarifs"],
  ["#faq", "FAQ"],
] as const;

const STEPS = [
  { icon: Upload, title: "Importe ta vidéo", text: "Podcast, interview, live, vlog : un fichier MP4 ou MOV depuis ton ordinateur." },
  { icon: Wand2, title: "Choisis ton style", text: "Naturel, dynamique ou minimaliste. Sous-titres, recadrage et silences, option par option." },
  { icon: Download, title: "Récupère tes clips", text: "Prévisualise, ajuste si besoin, et télécharge des MP4 prêts à publier où tu veux." },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Sélection des meilleurs passages",
    text: "L'IA lit toute la transcription pour trouver les histoires, conseils et réactions qui tiennent debout seuls — pas un découpage toutes les 60 secondes.",
  },
  {
    icon: Captions,
    title: "Sous-titres synchronisés au mot",
    text: "Quatre styles (Classic, Highlight, Modern, Minimal), taille lisible, placés au-dessus des boutons des applications.",
  },
  {
    icon: Crop,
    title: "Recadrage 9:16, 1:1 et 16:9",
    text: "Le cadre suit la personne qui parle, sans à-coups. Correction manuelle possible si besoin.",
  },
  {
    icon: Scissors,
    title: "Coupes propres",
    text: "Début et fin calés sur les phrases, silences trop longs retirés, aucun passage coupé en plein milieu d'une idée.",
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
    q: "Clipera est-il déjà disponible ?",
    a: "Clipera est en accès anticipé. Tu peux créer ton compte et importer tes vidéos ; la génération automatique des clips est en cours de finalisation et sera ouverte progressivement.",
  },
  {
    q: "Quelles vidéos puis-je utiliser ?",
    a: "Des vidéos dont tu détiens les droits (tu en es l'auteur ou tu as l'autorisation de les exploiter), en MP4, MOV, M4V, MKV ou WEBM, avec de la parole. Clipera ne télécharge pas de vidéos depuis d'autres plateformes.",
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
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-8">
          <Link href="/" aria-label="Clipera — accueil">
            <Logo size={28} />
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-7 text-small text-muted md:flex">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-fg">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/connexion" className={buttonStyles({ variant: "ghost", size: "sm" })}>
              Se connecter
            </Link>
            <Link href="/inscription" className={cn(buttonStyles({ size: "sm" }), "hidden sm:inline-flex")}>
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

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
                <span className="size-1.5 rounded-full bg-primary-soft" /> Accès anticipé
              </span>
              <h1 className="mt-6 text-h1 font-bold text-balance sm:text-display">
                Transforme tes vidéos longues en <span className="text-primary-soft">clips courts</span> grâce à l&apos;IA.
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
              <p className="mt-4 text-small text-subtle">Offre gratuite · sans carte bancaire · génération de clips en cours d&apos;ouverture</p>
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
              text="Clipera est en accès anticipé : ces fonctionnalités ouvrent progressivement."
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
              text="Prix TTC. Mensuel sans engagement, ou annuel avec 2 mois offerts. L'offre gratuite est disponible dès maintenant ; le paiement en ligne des offres payantes ouvre très bientôt."
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
                Crée ton compte gratuit dès maintenant et sois parmi les premiers à générer tes clips.
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
