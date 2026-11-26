import Link from "next/link";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import {
  care,
  formatPrice,
  packMonthlySaving,
  vatNote,
  visibleOffers,
  type Offer,
} from "@/config/offers";
import { cn } from "@/lib/cn";

const contactHref = (o: Offer) => `/contact?offre=${encodeURIComponent(o.id)}`;

/** Bloc de prix : chaque ligne de facturation est affichée séparément (jamais additionnée). */
function Billing({ offer }: { offer: Offer }) {
  if (offer.billing.length === 1) {
    const l = offer.billing[0];
    return (
      <div className="mt-8">
        <p className="flex items-baseline gap-2">
          <span className="text-[3rem] leading-none font-bold tracking-[-0.045em] text-paper tabular-nums">{formatPrice(l.amount)}</span>
          {l.period === "month" && <span className="text-lg font-semibold text-mist">/&nbsp;mois</span>}
        </p>
        <p className="t-label mt-3 text-electric">
          {l.period === "once" ? "Paiement unique · sans abonnement obligatoire" : "Paiement mensuel"}
        </p>
      </div>
    );
  }
  return (
    <dl className="mt-8 divide-y divide-line border-y border-line">
      {offer.billing.map((l) => (
        <div key={l.label} className="flex items-baseline justify-between gap-4 py-4">
          <dt>
            <span className="block font-semibold text-paper">{l.label}</span>
            <span className="t-label mt-1 block text-electric">{l.period === "once" ? "Paiement unique" : "Paiement mensuel"}</span>
          </dt>
          <dd className="text-right">
            <span className="text-[1.6rem] leading-none font-bold tracking-[-0.04em] whitespace-nowrap text-paper tabular-nums sm:text-[1.9rem]">
              {formatPrice(l.amount)}
            </span>
            {l.period === "month" && <span className="ml-1 text-mist">/&nbsp;mois</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function OfferCard({
  offer,
  i = 0,
  headingLevel = "h3",
  instant,
}: {
  offer: Offer;
  i?: number;
  headingLevel?: "h2" | "h3";
  /** En haut de page : animation CSS immédiate (sans attendre le JavaScript), pour un affichage rapide. */
  instant?: boolean;
}) {
  const H = headingLevel;
  const featured = Boolean(offer.highlight);
  const saving = offer.id === "pack" ? packMonthlySaving() : 0;
  return (
    <article
      data-reveal={instant ? undefined : ""}
      style={{ "--d": i * 110 } as CSSProperties}
      aria-labelledby={`offer-${offer.id}`}
      className={cn(
        "relative flex h-full flex-col rounded-[6px] border p-7 md:p-8",
        instant && "enter-soft",
        featured ? "border-electric bg-ink-3/70 shadow-[0_40px_100px_-50px_rgba(8,123,255,0.55)]" : "border-line-strong bg-ink-2",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="t-label text-slate">{offer.index}</p>
        {offer.highlight && <p className="t-label rounded-[2px] bg-electric px-2 py-1 text-ink">{offer.highlight}</p>}
      </div>
      <H id={`offer-${offer.id}`} className="mt-5 text-[1.6rem] leading-tight font-bold tracking-[-0.035em] text-paper">
        {offer.name}
      </H>
      <p className="mt-3 text-mist">{offer.description}</p>

      <Billing offer={offer} />

      {saving > 0 && (
        <p className="mt-5 rounded-[3px] bg-electric/12 px-3 py-2.5 text-[0.92rem] text-paper">
          <strong className="font-semibold text-glow">{formatPrice(saving)} d&apos;économie par mois</strong> sur la gestion des
          réseaux sociaux par rapport à l&apos;offre seule.
        </p>
      )}
      {offer.billing.length > 1 && (
        <p className="mt-4 text-sm text-mist">
          Deux paiements distincts :{" "}
          {offer.billing.map((l, k) => (
            <span key={l.label}>
              {k > 0 && ", puis "}
              <span className="whitespace-nowrap text-paper">{formatPrice(l.amount)}</span> {l.period === "once" ? "une seule fois" : "chaque mois"}
            </span>
          ))}
          .
        </p>
      )}

      <ul className="mt-8 space-y-2.5 text-[0.95rem]">
        {offer.includes.map((it) => (
          <li key={it} className="flex gap-3 text-paper/90">
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-electric" />
            {it}
          </li>
        ))}
      </ul>

      {(offer.notIncluded.length > 0 || offer.conditions.length > 0) && (
        <ul className="mt-6 space-y-2 border-t border-line pt-5 text-[0.85rem] text-mist">
          {offer.notIncluded.map((n) => (
            <li key={n}>{n}</li>
          ))}
          {offer.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-8">
        <Link
          href={contactHref(offer)}
          className={cn(
            "group/btn flex h-12 items-center justify-between rounded-[3px] px-5 font-semibold transition-colors",
            featured ? "bg-electric text-ink hover:bg-glow" : "border border-line-strong text-paper hover:border-paper/60 hover:bg-paper/[0.04]",
          )}
        >
          Choisir cette offre
          <span aria-hidden className="transition-transform group-hover/btn:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

/** Les offres visibles, côte à côte. */
export function OfferGrid({ ids, headingLevel, instant }: { ids?: Offer["id"][]; headingLevel?: "h2" | "h3"; instant?: boolean }) {
  const list = visibleOffers().filter((o) => !ids || ids.includes(o.id));
  return (
    <div className={cn("grid gap-5", list.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
      {list.map((o, i) => (
        <OfferCard key={o.id} offer={o} i={i} headingLevel={headingLevel} instant={instant} />
      ))}
    </div>
  );
}

/** Option de maintenance WEBPRO CARE : facultative ; « sur demande » tant que ses conditions ne sont pas validées. */
export function CareOption({ className }: { className?: string }) {
  if (care.status === "hidden") return null;
  const published = care.status === "published";
  return (
    <aside
      data-reveal
      aria-labelledby="care-title"
      className={cn("grid gap-6 rounded-[6px] border border-dashed border-line-strong p-7 md:grid-cols-[1fr_auto] md:items-center md:p-8", className)}
    >
      <div>
        <p className="t-label text-slate">Option facultative</p>
        <h3 id="care-title" className="mt-3 text-[1.35rem] font-bold tracking-[-0.03em] text-paper">
          {published ? care.name : "Maintenance facultative — sur demande"}
        </h3>
        <p className="mt-2 max-w-[62ch] text-mist">
          {published
            ? care.description
            : `Une option de maintenance (${care.name}) peut compléter votre site. Elle n'est jamais obligatoire ; ses conditions vous sont précisées sur demande.`}
        </p>
        {published && (
          <ul className="mt-4 grid gap-x-6 gap-y-1.5 text-[0.92rem] text-paper/90 sm:grid-cols-2">
            {care.includes.map((it) => (
              <li key={it} className="flex gap-2.5">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-electric" />
                {it}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[0.85rem] text-mist">{care.notIncluded}</p>
      </div>
      <div className="md:text-right">
        {published && (
          <p className="mb-4">
            <span className="text-[2rem] font-bold tracking-[-0.04em] text-paper">{formatPrice(care.monthly)}</span>
            <span className="ml-1 text-mist">/&nbsp;mois</span>
          </p>
        )}
        <Link href="/contact?offre=care" className="link-underline font-semibold text-paper hover:text-glow">
          {published ? "Ajouter cette option" : "Se renseigner"} →
        </Link>
      </div>
    </aside>
  );
}

/** Mention fiscale (si renseignée) et rappel des frais externes. */
export function PricingFootnote() {
  return (
    <p className="mt-8 text-sm text-slate">
      {vatNote ? `${vatNote} · ` : ""}Les montants « par mois » sont facturés chaque mois ; les paiements uniques ne sont
      facturés qu&apos;une fois. Les frais externes (nom de domaine, hébergement, licences éventuelles) sont distincts et
      précisés avant la mise en ligne.
    </p>
  );
}
