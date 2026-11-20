"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";

export type ProfileState = { status: "idle" | "saved" | "error"; message?: string };

export async function updateDisplayName(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireUser();
  const name = String(form.get("display_name") ?? "").trim();
  if (name.length > 80) return { status: "error", message: "80 caractères maximum." };
  const supabase = await createClient();
  // La RLS garantit qu'on ne peut modifier que son propre profil ; seule la colonne display_name est autorisée.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name || null })
    .eq("id", user.id);
  if (error) return { status: "error", message: "Enregistrement impossible. Réessaie." };
  revalidatePath("/app", "layout");
  return { status: "saved" };
}

/** Définir ou changer son mot de passe (session vérifiée côté serveur). */
export async function updatePassword(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  await requireUser();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("password_confirm") ?? "");
  if (password.length < 8) return { status: "error", message: "8 caractères minimum." };
  if (password !== confirm) return { status: "error", message: "Les deux mots de passe ne correspondent pas." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const message =
      error.code === "same_password"
        ? "Ce mot de passe est identique à l'actuel."
        : error.code === "weak_password"
          ? "Mot de passe trop faible : mélange lettres et chiffres."
          : error.code === "reauthentication_needed"
            ? "Pour des raisons de sécurité, reconnecte-toi puis réessaie."
            : "Modification impossible pour le moment. Réessaie.";
    return { status: "error", message };
  }
  return { status: "saved" };
}
