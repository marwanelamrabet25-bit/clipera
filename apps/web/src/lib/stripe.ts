import "server-only";
import Stripe from "stripe";
import type { Billing } from "./pricing";
import type { Tables } from "./supabase/database.types";

let client: Stripe | null = null;

/** Paiement disponible seulement si la clé Stripe ET la base admin sont configurées côté serveur. */
export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.SUPABASE_SECRET_KEY);
}

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("stripe_not_configured");
  client ??= new Stripe(key, { maxNetworkRetries: 2, timeout: 20_000, appInfo: { name: "Clipera" } });
  return client;
}

/**
 * Price ID de l'offre, lu en base, puis VÉRIFIÉ auprès de Stripe : montant, devise et périodicité doivent
 * correspondre exactement aux prix affichés. Le navigateur n'envoie jamais de montant ni de Price ID.
 */
export async function verifiedPrice(plan: Tables<"plans">, billing: Billing): Promise<string> {
  const priceId = billing === "annual" ? plan.stripe_annual_price_id : plan.stripe_price_id;
  const expected = billing === "annual" ? plan.annual_price_cents : plan.price_cents;
  if (!priceId || expected <= 0) throw new Error("price_not_configured");
  const p = await stripe().prices.retrieve(priceId);
  const interval = billing === "annual" ? "year" : "month";
  if (!p.active || p.unit_amount !== expected || p.currency !== "eur" || p.recurring?.interval !== interval
      || (p.recurring?.interval_count ?? 1) !== 1) {
    console.error(JSON.stringify({ event: "stripe_price_mismatch", plan: plan.id, billing, priceId,
      stripe: { active: p.active, amount: p.unit_amount, currency: p.currency, interval: p.recurring?.interval } }));
    throw new Error("price_mismatch");
  }
  return priceId;
}

export function siteOrigin(h: Headers) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Période courante d'un abonnement (nouvelles versions de l'API : portée par l'élément d'abonnement). */
export function subscriptionPeriod(sub: Stripe.Subscription) {
  const item = sub.items.data[0] as Stripe.SubscriptionItem & { current_period_start?: number; current_period_end?: number };
  const legacy = sub as unknown as { current_period_start?: number; current_period_end?: number };
  const start = item?.current_period_start ?? legacy.current_period_start;
  const end = item?.current_period_end ?? legacy.current_period_end;
  return {
    priceId: item?.price?.id ?? null,
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}
