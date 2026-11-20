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
