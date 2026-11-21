/**
 * Calculs de prix partagés (page tarifs, récapitulatif avant paiement).
 * Tous les montants sont en centimes, à partir des prix stockés en base (jamais d'un montant envoyé par le navigateur).
 */

export type Billing = "monthly" | "annual";

export type PricedPlan = {
  id: string;
  name: string;
  price_cents: number;
  annual_price_cents: number;
  monthly_source_videos: number;
  monthly_source_seconds: number;
  max_clips_per_video: number;
  export_max_height: number;
  watermark: boolean;
  priority: number;
};

export type PlanPrice = {
  free: boolean;
  monthlyCents: number; // prix mensuel normal
  annualCents: number; // prix annuel payé en une fois
  equivalentMonthlyCents: number; // prix annuel / 12, arrondi au centime
  savingsCents: number; // 12 mensualités − prix annuel
  freeMonths: number; // nombre de mois offerts (arrondi)
};

export function planPrice(p: Pick<PricedPlan, "price_cents" | "annual_price_cents">): PlanPrice {
  const free = p.price_cents === 0;
  const savings = free ? 0 : 12 * p.price_cents - p.annual_price_cents;
  return {
    free,
    monthlyCents: p.price_cents,
    annualCents: p.annual_price_cents,
    equivalentMonthlyCents: free ? 0 : Math.round(p.annual_price_cents / 12),
    savingsCents: savings,
    freeMonths: free ? 0 : Math.round(savings / p.price_cents),
  };
}

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** 1999 → « 19,99 € » ; 0 → « 0 € ». */
export function euros(cents: number) {
  return cents === 0 ? "0 €" : EUR.format(cents / 100);
}

export function planPerks(p: PricedPlan): string[] {
  return [
    `${p.monthly_source_videos} vidéos par mois`,
    `${Math.round(p.monthly_source_seconds / 60)} minutes de vidéo par mois`,
    `Jusqu'à ${p.max_clips_per_video} clips par vidéo`,
    `Export ${p.export_max_height}p`,
    p.watermark ? "Filigrane Clipera" : "Sans filigrane",
    ...(p.priority > 0 ? ["Traitement prioritaire"] : []),
  ];
}

/** Date du prochain renouvellement (1 mois ou 1 an après `from`), au format français. */
export function renewalDate(billing: Billing, from: Date = new Date()) {
  // Même jour du mois suivant (ou de l'année suivante) ; le 31 janvier donne le dernier jour de février.
  const y = from.getFullYear() + (billing === "annual" ? 1 : 0);
  const m = from.getMonth() + (billing === "annual" ? 0 : 1);
  const last = new Date(y, m + 1, 0).getDate();
  const d = new Date(y, m, Math.min(from.getDate(), last));
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);
}
