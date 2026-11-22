import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, apiUser, readJson } from "@/lib/api";
import { customerFor } from "@/lib/billing";
import { hasReferralDiscount, REFERRAL_COUPON } from "@/lib/referral";
import { CGV_VERSION } from "@/content/legal";
import type { Billing } from "@/lib/pricing";
import { isStripeConfigured, siteOrigin, stripe, verifiedPrice } from "@/lib/stripe";

/**
 * Ouvre la page de paiement Stripe pour une offre. Le navigateur n'envoie que l'offre et la périodicité :
 * le prix est lu en base puis vérifié auprès de Stripe. Un abonné existant est envoyé vers son espace
 * Stripe pour changer d'offre (jamais deux abonnements en parallèle).
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) return apiError(503, "billing_unavailable", "Le paiement en ligne n'est pas encore ouvert.");
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const body = await readJson<{ plan?: string; billing?: string; acceptCgv?: boolean; startNow?: boolean }>(request);
  const planId = body?.plan ?? "";
  const billing: Billing | null = body?.billing === "annual" ? "annual" : body?.billing === "monthly" ? "monthly" : null;
  if (!/^[a-z_]+$/.test(planId) || !billing) return apiError(400, "invalid_request", "Offre invalide.");
  // Accords obligatoires (CGV + démarrage immédiat pendant le délai de rétractation), revérifiés ici.
  if (body?.acceptCgv !== true || body?.startNow !== true) {
    return apiError(400, "consent_required", "Coche les deux cases (CGV et démarrage immédiat) pour continuer.");
  }
  const consent = { cgv_version: CGV_VERSION, consent_at: new Date().toISOString() };

  const { supabase, userId } = auth;
  const [{ data: plan }, { data: sub }, { data: claims }] = await Promise.all([
    supabase.from("plans").select("*").eq("id", planId).eq("is_public", true).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    supabase.auth.getClaims(),
  ]);
  if (!plan || plan.price_cents === 0) return apiError(404, "plan_not_found", "Offre introuvable.");
  const origin = siteOrigin(await headers());

  try {
    const customer = await customerFor(userId, (claims?.claims?.email as string | undefined) ?? null);
    if (sub?.stripe_subscription_id && ["active", "trialing", "past_due"].includes(sub.status)) {
      const portal = await stripe().billingPortal.sessions.create({
        customer,
        return_url: `${origin}/app/abonnement`,
        locale: "fr",
      });
      return NextResponse.json({ url: portal.url, mode: "portal" });
    }
    const price = await verifiedPrice(plan, billing);
    const referral = billing === "monthly" && (await hasReferralDiscount(userId));
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: userId,
      line_items: [{ price, quantity: 1 }],
      ...(referral ? { discounts: [{ coupon: REFERRAL_COUPON }] } : {}),
      subscription_data: { metadata: { user_id: userId, plan_id: plan.id, billing, ...consent } },
      metadata: { user_id: userId, plan_id: plan.id, billing, ...consent },
      locale: "fr",
      customer_update: { address: "auto", name: "auto" },
      billing_address_collection: "auto",
      success_url: `${origin}/app/abonnement?paiement=ok`,
      cancel_url: `${origin}/app/abonnement/recapitulatif?offre=${plan.id}&periode=${billing === "annual" ? "annuel" : "mensuel"}`,
    });
    console.log(JSON.stringify({ event: "checkout_created", user: userId, plan: plan.id, billing, referral, session: session.id }));
    return NextResponse.json({ url: session.url, mode: "checkout" });
  } catch (e) {
    console.error(JSON.stringify({ event: "checkout_failed", user: userId, plan: plan.id, error: String(e) }));
    return apiError(502, "checkout_failed", "Impossible d'ouvrir le paiement pour le moment. Réessaie dans un instant.");
  }
}
