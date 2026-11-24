import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { Chapter } from "@/components/landing/chapter";
import { CaptionStyles, FramingModes, SortingTable } from "@/components/landing/craft";
import { EngineDemo } from "@/components/landing/engine-demo";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { PricingTable } from "@/components/pricing/pricing-table";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
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

const MANUAL = [
  "Réécouter l'épisode en entier",
  "Noter les timecodes des bons moments",
  "Couper sans trancher une phrase",
  "Recadrer chaque plan en vertical",
  "Taper ou corriger les sous-titres",
  "Exporter… et recommencer pour chaque clip",
];

const STEPS = [
  {
    n: "1",
    title: "Importe ta vidéo",
    text: "Un fichier depuis ton ordinateur ou ton téléphone (MP4, MOV, MKV, WEBM), ou un lien Google Drive ou Dropbox. Tu as un lien YouTube ? Clipera reconnaît la vidéo et te mène à ton fichier original.",
    ui: (
      <div className="flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-caption text-muted">
        <span className="size-1.5 rounded-full bg-primary-soft" aria-hidden /> podcast-episode-12.mp4 · 1,8 Go
      </div>
    ),
  },
  {
    n: "2",
    title: "Choisis combien de clips",
    text: "Auto, 3, 5, 7 ou 10. Puis le format (9:16, 1:1, 16:9), le cadrage et le style des sous-titres.",
    ui: (
      <div className="grid grid-cols-5 gap-1 rounded-md border border-line bg-canvas p-1 text-caption" aria-hidden>
        {["Auto", "3", "5", "7", "10"].map((m, i) => (
          <span key={m} className={cn("rounded py-1 text-center", i === 0 ? "bg-elevated text-fg ring-1 ring-primary-line" : "text-subtle")}>
            {m}
          </span>
        ))}
      </div>
    ),
  },
  {
    n: "3",
    title: "Récupère tes clips",
    text: "Tu suis le montage clip par clip, et chaque clip prêt est visible tout de suite. Télécharge-les un par un en MP4, ou tous d'un coup dans une archive.",
    ui: (
      <div className="flex items-center justify-between rounded-md border border-line bg-canvas px-3 py-2 text-caption" aria-hidden>
        <span className="text-muted">Montage · 7/10 prêts</span>
        <span className="h-1 w-20 overflow-hidden rounded-full bg-overlay">
          <span className="block h-full w-[70%] rounded-full bg-primary" />
        </span>
      </div>
    ),
  },
];

const RULES = [
  {
    title: "Il lit toute la vidéo avant de choisir.",
    text: "Clipera repère où la conversation change de sujet, puis cherche le meilleur passage dans chacun. Pas seulement les dix premières minutes.",
  },
  {
    title: "Un clip commence au début d'une phrase et finit sur une conclusion.",
    text: "Jamais au milieu d'une idée. Les « euh, bon, alors » d'ouverture sont retirés, et un clip ne se termine pas sur la réplique de quelqu'un d'autre.",
  },
  {
    title: "Pas deux clips qui racontent la même chose.",
    text: "Les passages trop proches d'un clip déjà retenu sont écartés, comme le bavardage et les formules répétées. Chaque clip apporte une idée différente.",
  },
  {
    title: "Le nombre suit la richesse de ta vidéo.",
    text: "Une heure de podcast peut donner 10 clips. Une vidéo de 4 minutes n'en donnera jamais 10. Et si ta vidéo ne contient que 3 bons moments, tu reçois 3 clips, avec une explication claire.",
  },
];

const AUDIENCES = [
  {
    who: "Podcasteurs",
    text: "Un épisode d'une heure devient une semaine de contenus courts, chacun sur un sujet différent de l'épisode.",
    href: "/transformer-podcast-en-clips",
    link: "Transformer un podcast en clips",
  },
  {
    who: "Créateurs YouTube",
    text: "Tes vidéos longues alimentent tes Shorts, TikTok et Reels, recadrés en 9:16 et sous-titrés pour une lecture sans le son.",
    href: "/youtube-shorts-tiktok-reels",
    link: "Shorts, TikTok et Reels",
  },
  {
    who: "Interviews, coachs, formateurs",
    text: "Les meilleures réponses de tes interviews, lives et formations, en clips qui se comprennent sans avoir vu le reste.",
    href: "/recadrage-vertical-automatique",
    link: "Recadrage vertical automatique",
  },
  {
    who: "Campagnes de clipping",
    text: "Le créateur te partage un lien Google Drive ou Dropbox : colle-le, choisis le nombre de clips, publie.",
    href: "/generateur-clips-ia",
    link: "Le générateur de clips IA",
  },
];

const FAQ = [
  {
    q: "Qu'est-ce que Clipera ?",
    a: "Clipera (clipera.fr) est un générateur de clips IA en français. Il transcrit ta vidéo longue, repère ses meilleurs moments sur des sujets différents, les recadre en vertical (9:16, 1:1 ou 16:9) et ajoute des sous-titres synchronisés au mot près. Tu obtiens jusqu'à 10 clips courts prêts pour TikTok, YouTube Shorts et Instagram Reels, sans rien installer.",
  },
  {
    q: "Est-ce compliqué à utiliser ?",
    a: "Non : tu importes une vidéo, tu choisis le nombre de clips (ou « Auto ») et tu télécharges le résultat. Aucun logiciel à installer, aucune compétence de montage. Tout se passe dans le navigateur, sur ordinateur comme sur téléphone.",
  },
  {
    q: "Combien de temps ça prend ?",
    a: "Quelques minutes. Mesuré sur un vrai traitement : une vidéo de 28 minutes analysée et montée en 5 clips en environ 2 minutes. La durée dépend de la longueur de la vidéo et du nombre de clips ; tu peux fermer la page pendant le traitement.",
  },
  {
    q: "Combien de clips par vidéo ?",
    a: "Jusqu'à 10 avec les offres payantes, et jusqu'à 5 avec l'offre gratuite. En mode « Auto », Clipera vise environ un clip pour 6 minutes de parole. Ce sont des maximums : Clipera ne fabrique jamais de clip médiocre pour atteindre un nombre.",
  },
  {
    q: "Quels types de vidéos sont pris en charge ?",
    a: "Des vidéos en français, avec de la parole, dont tu détiens les droits : podcasts, interviews, vlogs, lives, formations. Fichiers MP4, MOV, M4V, MKV ou WEBM, ou liens Google Drive et Dropbox. Pour YouTube, Clipera reconnaît ton lien et t'emmène à ta vidéo dans YouTube Studio : les règles de YouTube interdisent aux services tiers de télécharger les vidéos à ta place.",
  },
  {
    q: "Est-ce que je peux modifier les clips ?",
    a: "Tu choisis le format, le cadrage et le style des sous-titres avant la génération, et tu peux relancer avec d'autres réglages. Tu peux aussi supprimer les clips que tu ne gardes pas. Il n'y a pas encore d'éditeur intégré pour retoucher un clip à la main : les MP4 s'ouvrent dans ton éditeur habituel si besoin.",
  },
  {
    q: "Le résultat est-il de bonne qualité ?",
    a: "Export jusqu'en 1080p sans filigrane avec les offres payantes (720p avec filigrane en gratuit), sans jamais agrandir une vidéo au-delà de sa qualité d'origine. Son harmonisé, sous-titres synchronisés au mot, contrôle automatique de chaque fichier. Clipera ne juge pas encore finement l'humour ou l'émotion : regarde chaque clip avant de le publier.",
  },
  {
    q: "Clipera garantit-il des vues ?",
    a: "Non. Personne ne peut garantir des vues ni la viralité. La note de chaque clip sert à comparer les passages entre eux, pas à prédire leurs performances.",
  },
  {
    q: "Que se passe-t-il si un traitement échoue ?",
    a: "Si aucun clip n'est produit, la vidéo ne compte pas dans ton quota : elle t'est restituée automatiquement. Si un seul clip échoue, les autres sont livrés normalement.",
  },
  {
    q: "Mes vidéos restent-elles privées ?",
    a: "Oui. Elles sont stockées dans un espace privé en Europe, accessibles uniquement par toi. Les vidéos sources sont supprimées automatiquement 30 jours après l'import et ne servent jamais à entraîner des modèles d'IA.",
  },
  {
    q: "Comment fonctionnent les abonnements ?",
    a: "Sans engagement : mensuel, ou annuel avec 2 mois offerts. Paiement par carte sur la page sécurisée de Stripe, résiliation en quelques clics depuis ton espace. L'offre gratuite ne demande aucune carte bancaire.",
  },
];

export default async function Home() {
  const plans = await getPublicPlans();
  const faqLd = {
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={graph(organizationLd(), websiteLd(), softwareLd(plans), faqLd)} />
      <SiteHeader />

      <main className="flex-1 overflow-x-clip">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(60%_50%_at_70%_0%,rgb(139_92_246/0.14),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
            <p className="flex items-center gap-3 text-caption font-medium tracking-wide text-subtle uppercase">
              <span className="text-primary-soft">Générateur de clips IA</span>
              <span className="h-px w-8 bg-line-strong" aria-hidden />
              <span>en français</span>
            </p>
            <h1 className="mt-6 max-w-4xl text-[2.6rem] leading-[1.02] font-bold tracking-[-0.04em] text-balance sm:text-[4rem] lg:text-[4.75rem]">
              <span className="text-muted">Une vidéo longue.</span>
              <br />
              Jusqu&apos;à 10 clips <br className="hidden sm:block" />
              prêts à publier.
            </h1>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <p className="max-w-xl text-body text-muted sm:text-[1.125rem] sm:leading-relaxed">
                Clipera écoute toute ta vidéo, repère les meilleurs moments <span className="text-fg">sur des sujets
                différents</span>, puis les recadre en vertical et les sous-titre au mot près. Pour TikTok, Reels et Shorts.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/inscription" className={buttonStyles({ size: "lg", className: "justify-center" })}>
                  Essayer gratuitement <ArrowRight />
                </Link>
                <a href="#moteur" className={buttonStyles({ size: "lg", variant: "ghost", className: "justify-center" })}>
                  Comment il choisit
                </a>
              </div>
            </div>
            <p className="mt-5 text-small text-subtle">
              Sans carte bancaire · 5 clips par vidéo en gratuit, 10 avec les offres payantes · rien à installer
            </p>

            <div className="mt-12 sm:mt-16">
              <EngineDemo />
            </div>
          </div>
        </section>

        {/* ── 01 · Le problème ───────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <Reveal>
              <Chapter n="01" time="00:00" label="Le problème" title="Une heure à réécouter pour en garder trois minutes.">
                <p>
                  Le bon moment est là, quelque part dans ta vidéo. Pour le sortir à la main, il faut tout réécouter,
                  noter les timecodes, couper proprement, recadrer, sous-titrer. Et recommencer pour chaque clip.
                </p>
                <p className="mt-4">
                  Avec Clipera, ces gestes sont faits pour toi. Tu gardes le seul choix qui compte : publier, ou pas.
                </p>
              </Chapter>
            </Reveal>
            <Reveal delay={120}>
              <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                <div className="bg-canvas p-6">
                  <p className="text-caption font-medium tracking-wide text-subtle uppercase">À la main</p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {MANUAL.map((m) => (
                      <li key={m} className="text-small text-subtle line-through decoration-line-strong">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface p-6">
                  <p className="text-caption font-medium tracking-wide text-primary-soft uppercase">Avec Clipera</p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {["Importer la vidéo", "Choisir le nombre de clips", "Télécharger"].map((m) => (
                      <li key={m} className="flex items-center gap-2 text-small text-fg">
                        <Check className="size-4 text-primary-soft" aria-hidden /> {m}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-line pt-4 text-caption text-muted">
                    Mesuré sur un vrai traitement : une vidéo de <span className="text-fg">28 minutes</span>, analysée et
                    montée en 5 clips en <span className="text-fg">environ 2 minutes</span>.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 02 · Fonctionnement ────────────────────────────── */}
        <section className="border-y border-line bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="02" time="02:30" label="Fonctionnement" title="Trois étapes. Aucune compétence de montage." id="fonctionnement" />
            </Reveal>
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 100} as="li" className="flex h-full flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-[2.5rem] leading-none font-bold tracking-tight text-line-strong tabular-nums">{s.n}</span>
                      <span className="h-px flex-1 bg-line-strong" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-h3 font-semibold">{s.title}</h3>
                    <p className="mt-2 text-small text-muted">{s.text}</p>
                    <div className="mt-5 md:mt-auto md:pt-5">{s.ui}</div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 03 · Le moteur ─────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <Chapter n="03" time="05:10" label="Le moteur" title={<>Dix clips. Dix sujets.<br className="hidden sm:block" /> Aucun remplissage.</>} id="moteur">
              <p>
                Augmenter le nombre de clips n&apos;a d&apos;intérêt que si chacun vaut la peine d&apos;être publié. Le
                moteur de Clipera suit quatre règles, appliquées à chaque vidéo.
              </p>
            </Chapter>
          </Reveal>
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <ol className="flex flex-col">
              {RULES.map((r, i) => (
                <Reveal
                  key={r.title}
                  delay={i * 80}
                  as="li"
                  className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-t border-line py-6 first:border-t-0 first:pt-0"
                >
                    <span className="text-small font-semibold text-primary-soft tabular-nums">0{i + 1}</span>
                    <div>
                      <h3 className="text-body font-semibold text-fg">{r.title}</h3>
                      <p className="mt-1.5 text-small text-muted">{r.text}</p>
                    </div>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={120}>
              <SortingTable />
              <p className="mt-4 text-caption text-subtle">
                Dans l&apos;application, chaque clip affiche sa note sur 100 et le détail de ses critères (accroche,
                contexte, cohérence, conclusion, durée). La note compare les passages entre eux : ce n&apos;est pas une
                prédiction de vues.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── 04 · Le rendu ──────────────────────────────────── */}
        <section className="border-y border-line bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="04" time="08:45" label="Le rendu" title="Fait pour être regardé sur un téléphone." id="fonctionnalites">
                <p>
                  Des sous-titres synchronisés au mot, lisibles au-dessus des boutons des applications. Un cadre qui suit
                  la bonne personne, sans zoom permanent ni effets gratuits. Un son harmonisé, sans « clic » au début.
                </p>
              </Chapter>
            </Reveal>
            <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <h3 className="text-small font-semibold">Quatre styles de sous-titres</h3>
                <p className="mt-1 mb-5 text-small text-muted">Synchronisés au mot près, typographie française respectée.</p>
                <CaptionStyles />
              </Reveal>
              <Reveal delay={120}>
                <h3 className="text-small font-semibold">Trois modes de cadrage</h3>
                <p className="mt-1 mb-5 text-small text-muted">
                  Les visages sont détectés ; le cadre ne coupe jamais une tête. Formats 9:16, 1:1 et 16:9.
                </p>
                <FramingModes />
              </Reveal>
            </div>
            <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-caption text-subtle">
              <span>Schémas indicatifs : ils illustrent les options, ce ne sont pas des captures de clips.</span>
              <Link href="/sous-titres-automatiques" className="text-primary-soft hover:underline">
                Les sous-titres automatiques en détail →
              </Link>
            </p>
          </div>
        </section>

        {/* ── 05 · Pour qui ──────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <Chapter n="05" time="12:20" label="Pour qui" title="Pour tous ceux qui parlent face caméra." />
          </Reveal>
          <ul className="mt-12 border-t border-line">
            {AUDIENCES.map((a, i) => (
              <Reveal
                key={a.who}
                delay={i * 60}
                as="li"
                className="grid gap-3 border-b border-line py-7 md:grid-cols-[14rem_1fr_auto] md:items-baseline md:gap-10"
              >
                  <h3 className="text-h3 font-semibold">{a.who}</h3>
                  <p className="text-small text-muted md:text-body">{a.text}</p>
                  <Link
                    href={a.href}
                    className="inline-flex items-center gap-1 text-small font-medium text-primary-soft hover:underline"
                  >
                    {a.link} <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ── 06 · Tarifs ────────────────────────────────────── */}
        <section className="border-y border-line bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-28">
            <Reveal>
              <Chapter n="06" time="15:00" label="Tarifs" title="Commence gratuitement. Passe à 10 clips quand tu veux." id="tarifs">
                <p>
                  Prix TTC. Mensuel sans engagement, ou annuel avec 2 mois offerts. Le quota se compte en vidéos et en
                  minutes importées, jamais en clips.
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
            <ul className="mt-10 grid gap-3 text-small text-muted sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Offre gratuite sans carte bancaire",
                "Résiliable en quelques clics",
                "Quota restitué si aucun clip n'est produit",
                "Paiement sécurisé par Stripe",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-primary-soft" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 07 · Questions ─────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-24 lg:self-start">
              <Chapter n="07" time="18:40" label="Questions" title="Ce que tu te demandes sûrement." id="faq">
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
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-h3 font-light text-subtle transition-transform duration-300 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-small text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fin ────────────────────────────────────────────── */}
        <section className="border-t border-line">
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-8 sm:py-32">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(50%_60%_at_50%_100%,rgb(139_92_246/0.14),transparent_70%)]"
            />
            <Reveal className="relative">
              <p className="text-caption font-medium tracking-wide text-subtle uppercase tabular-nums">
                <span className="text-primary-soft">FIN</span> · 20:00
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
