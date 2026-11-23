"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { looksLikeYouTube } from "@/lib/youtube-url";

export type LinkImportState = { status: "idle" | "error"; message?: string; url?: string };

const ERRORS: Record<string, string> = {
  rights_not_confirmed: "Confirme que tu détiens les droits sur cette vidéo.",
  invalid_url: "Lien non reconnu. Colle le lien de partage d'un fichier vidéo Google Drive ou Dropbox.",
  quota_videos_exceeded: "Tu as utilisé toutes tes vidéos ce mois-ci.",
  too_many_pending_uploads: "Tu as déjà 3 imports en cours. Attends qu'ils se terminent.",
  not_authenticated: "Session expirée. Reconnecte-toi.",
};

/** Import par lien : la base reconnaît et reconstruit le lien, puis met le téléchargement en file pour le worker. */
export async function importFromLink(_prev: LinkImportState, form: FormData): Promise<LinkImportState> {
  const url = String(form.get("url") ?? "").trim();
  const rights = form.get("rights") === "on";
  if (!url) return { status: "error", message: "Colle le lien de la vidéo.", url };
  if (!rights) return { status: "error", message: ERRORS.rights_not_confirmed, url };
  // Pas de téléchargement direct depuis YouTube : interdit par ses conditions (voir docs/IMPORT_YOUTUBE.md).
  if (looksLikeYouTube(url)) {
    return { status: "error", message: "Pour une vidéo YouTube, utilise l'onglet YouTube en haut de la page.", url };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_url_import", { p_url: url, p_rights_confirmed: true });
  if (error || !data?.[0]) {
    const code = Object.keys(ERRORS).find((k) => error?.message.includes(k));
    return { status: "error", message: code ? ERRORS[code] : "Impossible de lancer l'import. Réessaie.", url };
  }
  redirect(`/app/projets/${data[0].project_id}`);
}
