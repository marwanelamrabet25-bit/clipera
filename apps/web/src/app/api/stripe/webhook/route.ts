import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { syncSubscription } from "@/lib/billing";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";

const HANDLED = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

/**
 * Webhook Stripe : seule source de vérité des droits d'accès (paiement, renouvellement, changement d'offre,
 * échec de paiement, résiliation). Signature vérifiée ; chaque événement n'est appliqué qu'une fois.
 * L'état est toujours relu chez Stripe (jamais tiré du seul contenu de l'événement).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }
  if (!HANDLED.has(event.type)) return NextResponse.json({ received: true, ignored: event.type });

  const db = adminClient();
  const { error: dup } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dup) {
    if (dup.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "db_unavailable" }, { status: 500 });
  }

  try {
    const obj = event.data.object as { subscription?: string | { id: string } | null; id: string; object: string;
      client_reference_id?: string | null; parent?: { subscription_details?: { subscription?: string } } };
    let subscriptionId: string | null = null;
    if (obj.object === "subscription") subscriptionId = obj.id;
    else if (typeof obj.subscription === "string") subscriptionId = obj.subscription;
    else if (obj.subscription && typeof obj.subscription === "object") subscriptionId = obj.subscription.id;
    else subscriptionId = obj.parent?.subscription_details?.subscription ?? null;

    if (subscriptionId) {
      const sub = await stripe().subscriptions.retrieve(subscriptionId);
      const res = await syncSubscription(sub, obj.client_reference_id ?? null);
      console.log(JSON.stringify({ event: "stripe_synced", type: event.type, id: event.id, ...res, status: sub.status }));
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    // Échec : on retire la trace pour que Stripe renvoie l'événement plus tard.
    await db.from("stripe_events").delete().eq("id", event.id);
    console.error(JSON.stringify({ event: "stripe_webhook_failed", type: event.type, id: event.id, error: String(e) }));
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
