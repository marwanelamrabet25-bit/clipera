import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Database } from "./database.types";

/** Client Supabase côté serveur, lié à la session (cookies) de l'utilisateur. Soumis à la RLS. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Appelé depuis un Server Component : le proxy se charge de rafraîchir la session.
          }
        },
      },
    },
  );
}

export type SessionUser = { id: string; email: string | null };

/**
 * Utilisateur vérifié (signature du jeton contrôlée par getClaims), ou redirection vers la connexion.
 * Mis en cache pour la durée d'une requête.
 */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/connexion");
  return { id: claims.sub, email: (claims.email as string | undefined) ?? null };
});
