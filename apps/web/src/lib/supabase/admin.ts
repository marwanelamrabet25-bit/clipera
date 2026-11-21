import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Accès « service » à la base, réservé au serveur (webhooks Stripe, création du client Stripe).
 * Ne jamais l'utiliser pour une action demandée par un utilisateur sans avoir vérifié sa session.
 */
export function adminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("supabase_admin_not_configured");
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
