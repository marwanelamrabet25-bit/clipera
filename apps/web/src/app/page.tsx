import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import { Chapter } from "@/components/landing/chapter";
import { SortingTable } from "@/components/landing/craft";
import { EngineDemo } from "@/components/landing/engine-demo";
import { FeatureTabs } from "@/components/landing/feature-tabs";
import { HeroVisual } from "@/components/landing/hero-visual";
import { ResultSpec } from "@/components/landing/result-spec";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { PricingTable } from "@/components/pricing/pricing-table";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { getPublicPlans } from "@/lib/public-plans";
import { graph, organizationLd, softwareLd, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Clipera — Générateur de clips IA : jusqu'à 10 clips à partir d'une vidéo longue" },
  description:
    "Clipera transforme tes vidéos longues en clips courts grâce à l'IA : jusqu'à 10 moments forts sur des sujets différents, recadrés en vertical et sous-titrés au mot près, pour TikTok, Reels et Shorts.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Clipera — Une vidéo longue. Jusqu'à 10 clips prêts à publier.",
    description: "Clipera repère les meilleurs moments de ta vidéo, les recadre en vertical et les sous-titre au mot près.",
    type: "website",
    locale: "fr_FR",
    siteName: "Clipera",
  },
};

/** Comparaison honnête : ce que chaque étape demande à la main, et ce que fait Clipera. */
const COMPARE: [string, string, string][] = [
  ["Trouver les bons moments", "Réécouter toute la vidéo, noter les timecodes", "Toute la vidéo est transcrite et découpée en sujets"],
  ["Couper proprement", "Chercher le début et la fin de chaque phrase", "Coupes calées sur les phrases, hésitations retirées"],
  ["Passer en vertical", "Recadrer plan par plan", "Cadre placé sur la personne qui parle"],
  ["Sous-titrer", "Taper ou corriger le texte, le caler sur la voix", "Sous-titres synchronisés au mot, 4 styles"],
  ["Choisir quoi publier", "À l'instinct", "Une note expliquée pour chaque clip"],
  ["Exporter 10 clips", "Dix exports, un par un", "Un ZIP, ou chaque MP4 séparément"],
];

const STEPS = [
  {
    title: "Importe ta vidéo",
    text: "Un fichier depuis ton ordinateur ou ton téléphone (MP4, MOV, MKV, WEBM), ou un lien de partage Google Drive ou Dropbox.",
    ui: (
      <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5 text-caption text-muted">
        <span className="size-1.5 rounded-full bg-primary-soft" aria-hidden /> podcast-episode-12.mp4 · 1,8 Go · envoi 100 %
      </div>
    ),
  },
  {
    title: "Choisis combien de clips",
    text: "Auto, 3, 5, 7 ou 10. Puis le format, le cadrage et le style des sous-titres. Clipera vérifie la vidéo avant de commencer.",
    ui: (
      <div className="grid grid-cols-5 gap-1 rounded-lg border border-line bg-canvas p-1 text-caption" aria-hidden>
        {["Auto", "3", "5", "7", "10"].map((m, i) => (
          <span key={m} className={i === 0 ? "rounded-md bg-elevated py-1.5 text-center text-fg ring-1 ring-primary-line" : "py-1.5 text-center text-subtle"}>
            {m}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Télécharge tes clips",
    text: "Tu suis le montage clip par clip ; chaque clip prêt est visible tout de suite. Un par un en MP4, ou tous dans une archive.",
    ui: (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5 text-caption" aria-hidden>
        <span className="text-muted">Montage · 7/10 prêts</span>
        <span className="h-1 w-24 overflow-hidden rounded-full bg-overlay">
          <span className="block h-full w-[70%] rounded-full bg-primary-strong" />
        </span>
      </div>
    ),
  },
];

const RULES = [
  ["Il lit toute la vidéo avant de choisir.", "Il repère où la conversation change de sujet, puis cherche le meilleur passage dans chacun. Pas seulement dans les dix premières minutes."],
  ["Un clip commence et finit sur une phrase.", "Jamais au milieu d'une idée. Et jamais sur la réplique de quelqu'un d'autre ajoutée après la conclusion."],
  ["Pas deux clips qui disent la même chose.", "Les passages trop proches d'un clip déjà retenu sont écartés, tout comme le bavardage et les formules répétées."],
  ["Le nombre suit la richesse de la vidéo.", "Une heure de podcast peut donner 10 clips ; 4 minutes, jamais. Trois bons moments ? Trois clips, avec une explication."],
];

const AUDIENCES = [
  ["Podcasteurs", "Un épisode d'une heure devient une semaine de formats courts, chacun sur un sujet différent de l'épisode.", "/transformer-podcast-en-clips", "Transformer un podcast en clips"],
  ["Créateurs YouTube", "Tes vidéos longues nourrissent tes Shorts, TikTok et Reels, en 9:16 et sous-titrées pour une lecture sans le son.", "/youtube-shorts-tiktok-reels", "Shorts, TikTok et Reels"],
  ["Formateurs et coachs", "Les meilleures explications de tes formations et lives, en clips qui se comprennent sans le reste du cours.", "/generateur-clips-ia", "Le générateur de clips IA"],
  ["Interviews et conférences", "Deux intervenants ou plus : le cadre suit la personne qui parle, sans couper de tête.", "/recadrage-vertical-automatique", "Recadrage vertical automatique"],
  ["Agences et campagnes de clipping", "Le créateur partage un lien Google Drive ou Dropbox : tu le colles, tu choisis le nombre de clips, tu livres.", "/sous-titres-automatiques", "Sous-titres automatiques"],
];

const FAQ = [
  ["Qu'est-ce que Clipera ?", "Clipera (clipera.fr) est un générateur de clips IA en français. Il transcrit ta vidéo longue, repère ses meilleurs moments sur des sujets différents, les recadre en vertical (9:16, 1:1 ou 16:9) et ajoute des sous-titres synchronisés au mot près. Tu obtiens jusqu'à 10 clips courts prêts pour TikTok, YouTube Shorts et Instagram Reels, sans rien installer."],
  ["Est-ce compliqué à utiliser ?", "Non : tu importes une vidéo, tu choisis le nombre de clips (ou « Auto ») et tu télécharges le résultat. Aucun logiciel à installer, aucune compétence de montage. Tout se passe dans le navigateur, sur ordinateur comme sur téléphone."],
  ["Combien de temps ça prend ?", "Quelques minutes. Mesuré sur un vrai traitement : une vidéo de 28 minutes analysée et montée en 5 clips en environ 2 minutes. Tu peux fermer la page pendant le traitement : tes clips t'attendent dans ton espace."],
  ["Combien de clips par vidéo ?", "Jusqu'à 10 avec les offres payantes, jusqu'à 5 avec l'offre gratuite. En mode « Auto », Clipera vise environ un clip pour 6 minutes de parole. Ce sont des maximums : Clipera ne fabrique jamais de clip médiocre pour atteindre un nombre."],
  ["Quelles vidéos puis-je importer ?", "Des vidéos en français, avec de la parole, dont tu détiens les droits : podcasts, interviews, vlogs, lives, formations. Fichiers MP4, MOV, M4V, MKV ou WEBM, ou liens de partage Google Drive et Dropbox. Pour une vidéo déjà publiée sur YouTube, télécharge ton fichier original depuis YouTube Studio puis importe-le."],
  ["Est-ce que je peux modifier les clips ?", "Tu choisis le format, le cadrage et le style des sous-titres avant la génération, et tu peux relancer avec d'autres réglages ou supprimer les clips que tu ne gardes pas. Il n'y a pas encore d'éditeur intégré pour retoucher un clip à la main : les MP4 s'ouvrent dans ton éditeur habituel si besoin."],
  ["Le résultat est-il de bonne qualité ?", "Export jusqu'en 1080p sans filigrane avec les offres payantes (720p avec filigrane en gratuit), sans jamais agrandir une vidéo au-delà de sa qualité d'origine. Son harmonisé, sous-titres calés au mot, contrôle automatique de chaque fichier. Clipera ne juge pas encore finement l'humour ou l'émotion : regarde chaque clip avant de le publier."],
  ["Clipera garantit-il des vues ?", "Non. Personne ne peut garantir des vues ni la viralité. La note de chaque clip sert à comparer les passages entre eux, pas à prédire leurs performances."],
  ["Que se passe-t-il si un traitement échoue ?", "Si aucun clip n'est produit, la vidéo ne compte pas dans ton quota : elle t'est restituée automatiquement. Si un seul clip échoue, les autres sont livrés normalement."],
  ["Mes vidéos restent-elles privées ?", "Oui. Elles sont stockées dans un espace privé en Europe, accessibles uniquement par toi. Les vidéos sources sont supprimées automatiquement 30 jours après l'import et ne servent jamais à entraîner des modèles d'IA."],
  ["Comment fonctionnent les abonnements ?", "Sans engagement : mensuel, ou annuel avec 2 mois offerts, débité en une seule fois. Paiement par carte sur la page sécurisée de Stripe, résiliation en quelques clics depuis ton espace. L'offre gratuite ne demande aucune carte bancaire."],
];

export default async function Home() {
  const plans = await getPublicPlans();
  const faqLd = {
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={graph(organizationLd(), websiteLd(), softwareLd(plans), faqLd)} />
      <SiteHeader />

      <main className="flex-1 overflow-x-clip">
        {/* ── Hero ── */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(50%_55%_at_78%_8%,rgb(139_92_246/0.16),transparent_72%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pt-12 pb-20 sm:px-8 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:gap-12 lg:pt-20 lg:pb-28">
            <div>
              <p className="flex items-center gap-3 text-caption font-medium tracking-wide text-subtle uppercase">
                <span className="text-primary-soft">Générateur de clips IA</span>
                <span className="h-px w-8 bg-line-strong" aria-hidden />
                <span>en français</span>
              </p>
              <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-bold tracking-[-0.04em] text-balance sm:text-[3.6rem] lg:text-[3.55rem] xl:text-[3.9rem]">
                <span className="text-muted lg:whitespace-nowrap">Une vidéo longue.</span>
                <br />
                Jusqu&apos;à 10 clips <br className="hidden sm:block lg:hidden" />
                prêts à publier.
              </h1>
              <p className="mt-6 max-w-lg text-body text-muted sm:text-[1.125rem] sm:leading-relaxed">
                Clipera écoute toute ta vidéo, garde les meilleurs moments <span className="text-fg">sur des sujets
                différents</span>, les recadre en vertical et les sous-titre au mot près.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/inscription" className={buttonStyles({ size: "lg", className: "justify-center" })}>
                  Essayer gratuitement <ArrowRight />
                </Link>
                <a href="#moteur" className={buttonStyles({ size: "lg", variant: "ghost", className: "justify-center" })}>
                  Voir le moteur en action
                </a>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-small text-subtle">
                {["Sans carte bancaire", "Rien à installer", "TikTok · Reels · Shorts"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary-soft" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ── 01 · Le résultat (papier) ── */}
        <section className="theme-paper" id="resultat">
          <div className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="01" time="00:00" label="Le résultat" title="Voilà ce que tu télécharges.">
                <p>
                  Pas un brouillon à retravailler : un clip vertical complet, cadré, sous-titré, coupé au bon endroit.
                  Jusqu&apos;à dix, chacun sur un moment différent de ta vidéo.
                </p>
              </Chapter>
            </Reveal>
            <Reveal delay={100} className="mt-16">
              <ResultSpec />
            </Reveal>
          </div>
        </section>

        {/* ── 02 · Le problème, comparé ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32" id="comparaison">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <Chapter n="02" time="02:30" label="À la main ou avec Clipera" title="Une heure à réécouter pour en garder trois minutes.">
                <p>
                  Le bon moment est quelque part dans ta vidéo. Le sortir à la main, c&apos;est six étapes, et il faut
                  les refaire pour chaque clip.
                </p>
                <p className="mt-4 text-small">
                  Mesuré sur un vrai traitement : <span className="text-fg">28 minutes</span> de vidéo analysées et
                  montées en 5 clips en <span className="text-fg">environ 2 minutes</span>.
                </p>
              </Chapter>
            </Reveal>
            <Reveal delay={100}>
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="grid grid-cols-[1fr_1fr] border-b border-line bg-surface text-caption font-medium tracking-wide uppercase sm:grid-cols-[9rem_1fr_1fr]">
                  <span className="hidden px-4 py-3 text-subtle sm:block">Étape</span>
                  <span className="px-4 py-3 text-subtle">À la main</span>
                  <span className="px-4 py-3 text-primary-soft">Avec Clipera</span>
                </div>
                <ul className="divide-y divide-line">
                  {COMPARE.map(([step, manual, auto]) => (
                    <li key={step} className="grid grid-cols-[1fr_1fr] text-small sm:grid-cols-[9rem_1fr_1fr]">
                      <span className="col-span-2 px-4 pt-3.5 text-caption font-semibold text-fg sm:col-span-1 sm:py-3.5 sm:text-small">{step}</span>
                      <span className="flex gap-2 px-4 py-3.5 text-subtle">
                        <Minus className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {manual}
                      </span>
                      <span className="flex gap-2 bg-primary-wash/40 px-4 py-3.5 text-fg">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary-soft" aria-hidden /> {auto}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 03 · Le moteur ── */}
        <section className="border-y border-line bg-surface/40" id="moteur">
          <div className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="03" time="05:10" label="Le moteur" title={<>Dix clips. Dix sujets.<br className="hidden sm:block" /> Aucun remplissage.</>}>
                <p>Change le nombre de clips : la frise montre quels moments Clipera garde, et pourquoi ils sont différents.</p>
              </Chapter>
            </Reveal>
            <Reveal delay={80} className="mt-12">
              <EngineDemo />
            </Reveal>
            <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <ol className="flex flex-col">
                {RULES.map(([t, d], i) => (
                  <Reveal key={t} delay={i * 70} as="li" className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-t border-line py-6 first:border-t-0 first:pt-0">
                    <span className="text-small font-semibold text-primary-soft tabular-nums">0{i + 1}</span>
                    <div>
                      <h3 className="text-body font-semibold text-fg">{t}</h3>
                      <p className="mt-1.5 text-small text-muted">{d}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
              <Reveal delay={120}>
                <SortingTable />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 04 · Fonctionnalités ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32" id="fonctionnalites">
          <Reveal>
            <Chapter n="04" time="08:45" label="Fonctionnalités" title="Pensé pour être regardé sur un téléphone." />
          </Reveal>
          <Reveal delay={80} className="mt-12">
            <FeatureTabs />
          </Reveal>
        </section>

        {/* ── 05 · Fonctionnement (papier) ── */}
        <section className="theme-paper" id="fonctionnement">
          <div className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="05" time="12:20" label="Fonctionnement" title="Trois étapes. Aucune compétence de montage." />
            </Reveal>
            <ol className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
              <span aria-hidden className="absolute top-[1.15rem] right-0 left-0 hidden h-px bg-line-strong md:block" />
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 100} as="li" className="relative flex flex-col">
                  <span className="relative grid size-9 place-items-center rounded-full border border-line-strong bg-canvas text-small font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-h3 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-small text-muted">{s.text}</p>
                  <div className="mt-5 md:mt-auto md:pt-5">{s.ui}</div>
                </Reveal>
              ))}
            </ol>
            <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/inscription" className={buttonStyles({ size: "lg", className: "justify-center" })}>
                Créer mon compte gratuit <ArrowRight />
              </Link>
              <span className="text-small text-muted">3 vidéos par mois offertes, sans carte bancaire.</span>
            </div>
          </div>
        </section>

        {/* ── 06 · Pour qui ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <Chapter n="06" time="15:00" label="Pour qui" title="Pour tous ceux qui parlent face caméra." />
          </Reveal>
          <ul className="mt-12 border-t border-line">
            {AUDIENCES.map(([who, text, href, link], i) => (
              <Reveal
                key={who}
                delay={i * 50}
                as="li"
                className="group grid gap-3 border-b border-line py-7 md:grid-cols-[15rem_1fr_auto] md:items-baseline md:gap-10"
              >
                <h3 className="text-h3 font-semibold">{who}</h3>
                <p className="text-small text-muted md:text-body">{text}</p>
                <Link href={href} className="inline-flex items-center gap-1 text-small font-medium text-primary-soft hover:underline">
                  {link} <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ── 07 · Tarifs ── */}
        <section className="border-y border-line bg-surface/40" id="tarifs">
          <div className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="07" time="18:40" label="Tarifs" title="Commence gratuitement. Passe à 10 clips quand tu veux.">
                <p>
                  Prix TTC. Mensuel sans engagement, ou annuel avec 2 mois offerts, débité en une seule fois. Le quota se
                  compte en vidéos et en minutes importées, jamais en clips.
                </p>
              </Chapter>
            </Reveal>
            {plans.length > 0 ? (
              <div className="mt-12">
                <PricingTable plans={plans} />
              </div>
            ) : (
              <p className="mt-10 text-muted">Les tarifs sont momentanément indisponibles.</p>
            )}
            <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
                {["Offre gratuite sans carte bancaire", "Résiliable en quelques clics", "Quota restitué si aucun clip n'est produit", "Paiement sécurisé par Stripe"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary-soft" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/tarifs" className="shrink-0 text-small font-medium text-primary-soft hover:underline">
                Comparer les offres en détail →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 08 · Questions ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-24 lg:self-start">
              <Chapter n="08" time="20:15" label="Questions" title="Ce que tu te demandes sûrement." id="faq">
                <p>
                  Une autre question ? Consulte nos{" "}
                  <Link href="/blog" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-primary-soft">
                    guides
                  </Link>
                  .
                </p>
              </Chapter>
            </Reveal>
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-body font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {q}
                    <span className="text-h3 font-light text-subtle transition-transform duration-300 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-small text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fin ── */}
        <section className="relative overflow-hidden border-t border-line">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(50%_60%_at_50%_100%,rgb(139_92_246/0.16),transparent_70%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
            <Reveal>
              <p className="text-caption font-medium tracking-wide text-subtle uppercase tabular-nums">
                <span className="text-primary-soft">Fin</span> · 22:00
              </p>
              <h2 className="mt-5 max-w-3xl text-[2.25rem] leading-[1.05] font-bold tracking-[-0.035em] text-balance sm:text-[3.5rem]">
                Ta prochaine vidéo contient déjà tes prochains clips.
              </h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/inscription" className={buttonStyles({ size: "lg", className: "justify-center" })}>
                  Essayer gratuitement <ArrowRight />
                </Link>
                <span className="text-small text-subtle">Sans carte bancaire · premiers clips en quelques minutes</span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
