import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, apiUser } from "@/lib/api";
import { isStripeConfigured, siteOrigin, stripe } from "@/lib/stripe";

/** Espace client Stripe : factures, moyen de paiement, changement d'offre, résiliation. */
export async function POST() {
  if (!isStripeConfigured()) return apiError(503, "billing_unavailable", "Le paiement en ligne n'est pas encore ouvert.");
  const auth = await apiUser();
  if (!auth) return apiError(401, "not_authenticated", "Session expirée. Reconnecte-toi.");
  const { data: sub } = await auth.supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", auth.userId).maybeSingle();
  if (!sub?.stripe_customer_id) return apiError(404, "no_customer", "Aucun abonnement payant à gérer.");
  try {
    const portal = await stripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${siteOrigin(await headers())}/app/abonnement`,
      locale: "fr",
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error(JSON.stringify({ event: "portal_failed", user: auth.userId, error: String(e) }));
    return apiError(502, "portal_failed", "Impossible d'ouvrir ton espace de facturation pour le moment.");
  }
}
