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
  // Erreur fréquente : la clé publique (sb_publishable_…) collée à la place de la clé secrète (sb_secret_…).
  if (key.startsWith("sb_publishable_")) throw new Error("supabase_secret_key_is_publishable_key");
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
