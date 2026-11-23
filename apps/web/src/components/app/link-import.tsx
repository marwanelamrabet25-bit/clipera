"use client";

import { Link2 } from "lucide-react";
import { useActionState, useState } from "react";
import { importFromLink, type LinkImportState } from "@/app/app/nouveau/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { looksLikeYouTube } from "@/lib/youtube-url";

const DRIVE_RE = /^\s*(https?:\/\/)?(drive|docs)\.google\.com\/\S+/i;
const DROPBOX_RE = /^\s*(https?:\/\/)?(www\.)?dropbox\.com\/(s|scl\/fi)\/\S+/i;
/** Import par lien de partage Google Drive / Dropbox. Vérifications identiques à un fichier. */
export function LinkImport({ maxMinutes }: { maxMinutes: number }) {
  const [state, action, pending] = useActionState<LinkImportState, FormData>(importFromLink, { status: "idle" });
  const [url, setUrl] = useState(state.url ?? "");
  const [rights, setRights] = useState(false);
  const isYoutube = looksLikeYouTube(url);
  const isFolder = /drive\.google\.com\/drive\/(u\/\d+\/)?folders\//i.test(url);
  const supported = DRIVE_RE.test(url) || DROPBOX_RE.test(url);
  const error = !url
    ? undefined
    : isFolder
      ? "C'est le lien d'un dossier : ouvre la vidéo voulue dans le dossier et copie le lien du fichier."
      : isYoutube
        ? undefined
        : !supported
          ? "Colle un lien de partage Google Drive ou Dropbox."
          : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Lien Google Drive ou Dropbox"
        name="url"
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder="https://drive.google.com/file/d/…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        hint={`Lien de partage d'un fichier vidéo, ${maxMinutes} min maximum avec ton offre.`}
        error={error}
      />
      {isYoutube && (
        <Alert tone="info" title="C'est un lien YouTube">
          Ici, il faut le lien Google Drive ou Dropbox du <strong>fichier</strong> vidéo. Pour partir d&apos;un lien
          YouTube, utilise l&apos;onglet <strong>YouTube</strong> : Clipera reconnaît la vidéo et te guide.
        </Alert>
      )}
      <label className="flex cursor-pointer items-start gap-3 text-small text-muted">
        <input
          type="checkbox"
          name="rights"
          checked={rights}
          onChange={(e) => setRights(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
        />
        <span>
          Je suis le créateur de cette vidéo, ou j&apos;ai son autorisation (par exemple dans le cadre d&apos;une
          campagne de clipping).
        </span>
      </label>
      {state.status === "error" && (
        <Alert tone="danger" title="Import non lancé">
          {state.message}
        </Alert>
      )}
      <div>
        <Button size="lg" type="submit" loading={pending} disabled={!supported || !!error || !rights}>
          <Link2 /> Importer depuis le lien
        </Button>
      </div>
    </form>
  );
}
