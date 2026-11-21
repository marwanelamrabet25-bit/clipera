"use client";

import { Link2 } from "lucide-react";
import { useActionState, useState } from "react";
import { importFromLink, type LinkImportState } from "@/app/app/nouveau/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";

const DRIVE_RE = /^\s*(https?:\/\/)?(drive|docs)\.google\.com\/\S+/i;
const DROPBOX_RE = /^\s*(https?:\/\/)?(www\.)?dropbox\.com\/(s|scl\/fi)\/\S+/i;
const YT_RE = /^\s*(https?:\/\/)?((www|m|music)\.)?(youtube\.com|youtu\.be)\/\S+/i;

/** Import par lien de partage Google Drive / Dropbox (et YouTube si activé). Vérifications identiques à un fichier. */
export function LinkImport({ maxMinutes, youtube }: { maxMinutes: number; youtube: boolean }) {
  const [state, action, pending] = useActionState<LinkImportState, FormData>(importFromLink, { status: "idle" });
  const [url, setUrl] = useState(state.url ?? "");
  const [rights, setRights] = useState(false);
  const isYoutube = YT_RE.test(url);
  const isFolder = /drive\.google\.com\/drive\/(u\/\d+\/)?folders\//i.test(url);
  const supported = DRIVE_RE.test(url) || DROPBOX_RE.test(url) || (youtube && isYoutube);
  const error = !url
    ? undefined
    : isFolder
      ? "C'est le lien d'un dossier : ouvre la vidéo voulue dans le dossier et copie le lien du fichier."
      : isYoutube && !youtube
        ? undefined
        : !supported
          ? "Colle un lien de partage Google Drive ou Dropbox."
          : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label={youtube ? "Lien Google Drive, Dropbox ou YouTube" : "Lien Google Drive ou Dropbox"}
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
      {isYoutube && !youtube && (
        <Alert tone="warning" title="L'import direct depuis YouTube n'est pas encore disponible">
          YouTube bloque les téléchargements depuis les serveurs. Si c&apos;est ta vidéo, télécharge-la depuis YouTube
          Studio (voir le guide ci-dessous), puis importe le fichier. Si elle est à quelqu&apos;un d&apos;autre,
          demande-lui le fichier ou un lien Google Drive.
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
