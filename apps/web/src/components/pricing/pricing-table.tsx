"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { type Billing, euros, planPerks, planPrice, type PricedPlan } from "@/lib/pricing";

type Props = {
  plans: PricedPlan[];
  /** Offre actuelle de l'utilisateur connecté (page Abonnement). */
  currentPlanId?: string;
  /** Lien d'action pour une offre payante (récapitulatif avant paiement). */
  freeHref?: string;
};

/** Sélecteur Mensuel / Annuel : changement instantané, sans rechargement. */
function BillingToggle({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Période de facturation"
      className="relative mx-auto grid w-full max-w-[420px] grid-cols-2 rounded-full border border-line-strong bg-surface p-1"
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary-strong shadow-[0_6px_20px_-8px_rgb(139_92_246/0.8)]",
          "transition-transform duration-300 ease-out-soft",
          value === "annual" && "translate-x-full",
        )}
      />
      {(["monthly", "annual"] as const).map((b) => (
        <button
          key={b}
          type="button"
          role="radio"
          aria-checked={value === b}
          onClick={() => onChange(b)}
          className={cn(
            "relative z-10 flex h-10 items-center justify-center gap-2 rounded-full px-3 text-small font-medium transition-colors",
            value === b ? "text-on-primary" : "text-muted hover:text-fg",
          )}
        >
          {b === "monthly" ? (
            "Mensuel"
          ) : (
            <>
              Annuel
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors",
                  value === "annual" ? "bg-white/20 text-white" : "bg-primary-wash text-primary-soft",
                )}
              >
                2 mois offerts
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, billing, current, freeHref }: {
  plan: PricedPlan;
  billing: Billing;
  current: boolean;
  freeHref: string;
}) {
  const price = planPrice(plan);
  const popular = plan.id === "pro";
  const annual = billing === "annual" && !price.free;
  const href = price.free ? freeHref : `/app/abonnement/recapitulatif?offre=${plan.id}&periode=${billing === "annual" ? "annuel" : "mensuel"}`;

  return (
    <div
      data-testid={`plan-${plan.id}`}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-6 transition-[border-color,box-shadow,transform] duration-300",
        popular
          ? "border-primary/60 bg-[linear-gradient(180deg,rgb(139_92_246/0.16),rgb(139_92_246/0.03)_45%,transparent)] shadow-[0_24px_60px_-28px_rgb(139_92_246/0.65)] lg:-translate-y-2"
          : "border-line bg-canvas hover:border-line-strong",
        current && "ring-1 ring-primary-soft/60",
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary-strong px-3 py-1 text-[11px] font-semibold tracking-wide text-on-primary whitespace-nowrap shadow-[0_8px_20px_-8px_rgb(139_92_246/0.9)]">
          <Sparkles className="size-3" aria-hidden /> Le plus populaire
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-small font-semibold tracking-[0.14em] uppercase text-primary-soft">{plan.name}</h3>
        {current ? (
          <span className="rounded-full border border-primary-line px-2 py-0.5 text-caption text-primary-soft">
            Offre actuelle
          </span>
        ) : annual ? (
          <span className="rounded-full bg-primary-wash px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary-soft">
            2 MOIS OFFERTS
          </span>
        ) : null}
      </div>

      {/* Prix principal : mensuel, ou équivalent mensuel en annuel */}
      <div className="mt-5 min-h-[76px]">
        <p className="flex items-baseline gap-1.5" data-testid="price-main">
          <span key={`${billing}-${plan.id}`} className="animate-[fadein_.25s_ease-out] text-[2.6rem] leading-none font-bold tracking-tight tabular-nums">
            {euros(annual ? price.equivalentMonthlyCents : price.monthlyCents)}
          </span>
          <span className="text-small text-subtle">/ mois</span>
        </p>
        <p className="mt-2 text-caption text-subtle" data-testid="price-note">
          {price.free ? (
            "Gratuit, pour toujours."
          ) : annual ? (
            <>
              au lieu de <s className="decoration-subtle">{euros(price.monthlyCents)}/mois</s>
            </>
          ) : (
            "Facturé chaque mois, sans engagement."
          )}
        </p>
      </div>

      {/* Montant réellement facturé en annuel : toujours visible, jamais caché */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin,visibility] duration-300 ease-out-soft",
          annual ? "visible mt-4 grid-rows-[1fr] opacity-100" : "invisible mt-0 grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!annual}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-primary-line bg-primary-wash/60 p-3.5" data-testid="annual-box">
            <p className="text-body font-semibold tabular-nums">
              {euros(price.annualCents)} <span className="text-small font-normal text-muted">/ an</span>
            </p>
            <p className="mt-0.5 text-caption text-muted">Montant total débité en une seule fois aujourd&apos;hui.</p>
            <p className="mt-2 text-caption font-medium text-success">
              Économisez {euros(price.savingsCents)} par an.
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {planPerks(plan).map((perk) => (
          <li key={perk} className="flex gap-2 text-small text-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-primary-soft" aria-hidden />
            {perk}
          </li>
        ))}
      </ul>

      {current ? (
        <span className={cn(buttonStyles({ variant: "secondary" }), "pointer-events-none mt-7 w-full opacity-70")}>
          Offre actuelle
        </span>
      ) : (
        <Link
          href={href}
          className={cn(buttonStyles({ variant: popular || price.free ? "primary" : "secondary" }), "mt-7 w-full")}
        >
          {price.free ? "Commencer gratuitement" : `Choisir ${plan.name}`}
        </Link>
      )}
    </div>
  );
}

export function PricingTable({ plans, currentPlanId, freeHref = "/inscription" }: Props) {
  const [billing, setBilling] = useState<Billing>("monthly");
  return (
    <div>
      <BillingToggle value={billing} onChange={setBilling} />
      <p className="mt-3 text-center text-caption text-subtle" aria-live="polite">
        {billing === "annual"
          ? "Paiement annuel en une seule fois : 12 mois d'accès pour le prix de 10."
          : "Paiement chaque mois, résiliable à tout moment."}
      </p>
      {/* Mobile : carrousel à faire glisser (4 offres sans défilement interminable) ; dès 640 px : grille. */}
      <div
        className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 lg:grid-cols-4"
        aria-label="Offres"
      >
        {plans.map((p) => (
          <div key={p.id} className="w-[84%] shrink-0 snap-start sm:w-auto">
            <PlanCard plan={p} billing={billing} current={p.id === currentPlanId} freeHref={freeHref} />
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-caption text-subtle sm:hidden">Fais glisser pour voir les {plans.length} offres →</p>
    </div>
  );
}
