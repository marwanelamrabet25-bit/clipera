import "server-only";
import type Stripe from "stripe";
import { stripe, subscriptionPeriod } from "./stripe";
import { adminClient } from "./supabase/admin";

/** Abonnement Stripe → base (offre déduite du Price ID enregistré en base). Idempotent. */
export async function syncSubscription(sub: Stripe.Subscription, hintUserId?: string | null) {
  const db = adminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let userId = (sub.metadata?.user_id as string | undefined) || hintUserId || null;
  if (!userId) {
    const { data } = await db.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) throw new Error(`user_not_found_for_customer ${customerId}`);
  const { priceId, start, end } = subscriptionPeriod(sub);
  if (!priceId) throw new Error("subscription_without_price");
  const { data, error } = await db.rpc("stripe_apply_subscription", {
    p_user: userId,
    p_price_id: priceId,
    p_status: sub.status,
    p_period_start: start!,
    p_period_end: end!,
    p_cancel_at_period_end: sub.cancel_at_period_end || Boolean(sub.cancel_at),
    p_customer_id: customerId,
    p_subscription_id: sub.id,
  });
  if (error) throw new Error(`stripe_apply_failed ${error.message}`);
  return { userId, plan: data as string };
}

/** Client Stripe de l'utilisateur : réutilisé s'il existe, sinon créé une seule fois et mémorisé. */
export async function customerFor(userId: string, email: string | null) {
  const db = adminClient();
  const { data } = await db.from("subscriptions").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id;
  const customer = await stripe().customers.create(
    { email: email ?? undefined, metadata: { user_id: userId }, preferred_locales: ["fr"] },
    { idempotencyKey: `clipera-customer-${userId}` },
  );
  const { error } = await db.rpc("stripe_set_customer", { p_user: userId, p_customer_id: customer.id });
  if (error) throw new Error(`stripe_set_customer_failed ${error.message}`);
  return customer.id;
}
