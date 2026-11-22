import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import type { Database, Tables } from "./supabase/database.types";

/**
 * Offres publiques, lues dans la base (source de vérité) et mises en cache une heure.
 * En cas d'échec, l'erreur est levée (donc jamais mise en cache) : voir getPublicPlansSafe.
 */
async function fetchPublicPlans(): Promise<Tables<"plans">[]> {
  "use cache";
  cacheLife("hours");
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase.from("plans").select("*").eq("is_public", true).order("sort_order");
  if (error) throw new Error(error.message);
  return data;
}

/** Version sûre pour les pages : une base momentanément injoignable donne une liste vide, sans casser la page. */
export async function getPublicPlans(): Promise<Tables<"plans">[]> {
  try {
    return await fetchPublicPlans();
  } catch (e) {
    console.error(JSON.stringify({ event: "public_plans_failed", error: String(e) }));
    return [];
  }
}
