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

export type PasswordState = { status: "idle" | "error" | "confirm"; message?: string; email?: string };

const MIN_PASSWORD = 8;

function authErrorMessage(code: string | undefined, status: number | undefined, fallback: string) {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Ton adresse e-mail n'est pas encore confirmée. Clique sur le lien reçu par e-mail.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cette adresse. Connecte-toi.";
    case "weak_password":
      return `Mot de passe trop faible : au moins ${MIN_PASSWORD} caractères, avec des lettres et des chiffres.`;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de tentatives en peu de temps. Patiente quelques minutes avant de réessayer.";
  }
  if (status === 429) return "Trop de tentatives en peu de temps. Patiente quelques minutes avant de réessayer.";
  return fallback;
}

function readCredentials(form: FormData) {
  return {
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    password: String(form.get("password") ?? ""),
    next: safeNext(String(form.get("suite") ?? "")),
  };
}

/** Connexion par e-mail + mot de passe (aucun e-mail envoyé). */
export async function signInWithPassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const { email, password, next } = readCredentials(form);
  if (!EMAIL_RE.test(email)) return { status: "error", message: "Adresse e-mail invalide.", email };
  if (!password) return { status: "error", message: "Saisis ton mot de passe.", email };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      status: "error",
      email,
      message: authErrorMessage(error.code, error.status, "Connexion impossible pour le moment. Réessaie."),
    };
  }
  redirect(next);
}

/** Création de compte. Si Supabase exige une confirmation, un e-mail est envoyé une seule fois. */
export async function signUpWithPassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const { email, password, next } = readCredentials(form);
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", message: "Adresse e-mail invalide.", email };
  }
  if (password.length < MIN_PASSWORD) {
    return { status: "error", message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`, email };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteOrigin(await headers())}/auth/confirm?suite=${encodeURIComponent(next)}` },
  });
  if (error) {
    return {
      status: "error",
      email,
      message: authErrorMessage(error.code, error.status, "Création du compte impossible pour le moment. Réessaie."),
    };
  }
  // Compte créé et session ouverte directement (confirmation e-mail désactivée).
  if (data.session) redirect(next);
  // Supabase renvoie un utilisateur sans identité quand l'adresse existe déjà (pour ne pas la révéler).
  if (data.user && data.user.identities?.length === 0) {
    return { status: "error", email, message: "Un compte existe déjà avec cette adresse. Connecte-toi." };
  }
  return { status: "confirm", email };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
