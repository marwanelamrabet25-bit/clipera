import "server-only";
import { cookies } from "next/headers";
import { customerFor } from "./billing";
import { REFERRAL_CODE_RE, REFERRAL_COOKIE } from "./referral-shared";
import { stripe } from "./stripe";
import { adminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

/**
 * Programme de parrainage (règles appliquées par la base : voir la migration 20261122000100_referrals.sql).
 * - Lien : https://clipera.fr/?parrain=CODE → cookie posé par le proxy, rattachement à la première visite connectée.
 * - Filleul : coupon -50 % sur son premier mois (abonnement mensuel uniquement).
 * - Parrain : crédit Stripe d'un mois de son offre, versé quand le filleul a réellement payé.
 */
export const REFERRAL_COUPON = "clipera-parrainage-50";

/** Rattache l'utilisateur connecté au parrain mémorisé dans le cookie (sans effet si déjà fait ou non valable). */
export async function claimReferralFromCookie() {
  const code = (await cookies()).get(REFERRAL_COOKIE)?.value?.toUpperCase();
  if (!code || !REFERRAL_CODE_RE.test(code)) return;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_referral", { p_code: code });
  if (error) console.error(JSON.stringify({ event: "referral_claim_failed", error: error.message }));
  else if (data === "ok") console.log(JSON.stringify({ event: "referral_claimed" }));
}

/** Le filleul a-t-il encore droit à sa réduction de premier mois ? (parrainage en attente = jamais payé) */
export async function hasReferralDiscount(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("referrals").select("status").eq("referee_id", userId).maybeSingle();
  return data?.status === "pending";
}

/**
 * Appelé par le webhook après une facture payée (> 0 €) : récompense le parrain du payeur, une seule fois.
 * Le crédit est un solde négatif sur le client Stripe du parrain, déduit automatiquement de ses prochaines factures.
 */
export async function rewardReferrer(refereeId: string) {
  const db = adminClient();
  const { data, error } = await db.rpc("referral_reward", { p_referee: refereeId });
  if (error) throw new Error(`referral_reward_failed ${error.message}`);
  for (const r of data ?? []) {
    const { data: u } = await db.auth.admin.getUserById(r.referrer_id);
    const customer = await customerFor(r.referrer_id, u?.user?.email ?? null);
    await stripe().customers.createBalanceTransaction(
      customer,
      { amount: -r.credit_cents, currency: "eur", description: "Parrainage Clipera : 1 mois offert" },
      { idempotencyKey: `clipera-referral-credit-${r.referral_id}` },
    );
    const { error: markErr } = await db.rpc("referral_mark_credited", { p_referral: r.referral_id });
    if (markErr) throw new Error(`referral_mark_failed ${markErr.message}`);
    console.log(JSON.stringify({ event: "referral_credited", referral: r.referral_id, cents: r.credit_cents }));
  }
}
