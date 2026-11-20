"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function siteOrigin(h: Headers) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Envoie un lien de connexion (le compte est créé à la première connexion). */
export async function sendMagicLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(String(form.get("suite") ?? ""));
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", message: "Adresse e-mail invalide.", email };
  }
  const supabase = await createClient();
  const redirectTo = `${siteOrigin(await headers())}/auth/confirm?suite=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) {
    const limited = error.status === 429 || /rate limit/i.test(error.message);
    return {
      status: "error",
      email,
      message: limited
        ? "Trop de demandes en peu de temps. Patiente quelques minutes avant de réessayer."
        : "Impossible d'envoyer le lien pour le moment. Réessaie dans un instant.",
    };
  }
  return { status: "sent", email };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
