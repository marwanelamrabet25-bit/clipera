"use client";

import { Link2 } from "lucide-react";
import { useActionState, useState } from "react";
import { importFromLink, type LinkImportState } from "@/app/app/nouveau/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";

const YT_RE = /^\s*(https?:\/\/)?((www|m|music)\.)?(youtube\.com|youtu\.be)\/\S+/i;

/** Import d'une vidéo YouTube par son lien (téléchargée par nos serveurs, mêmes vérifications qu'un fichier). */
export function LinkImport({ maxMinutes }: { maxMinutes: number }) {
  const [state, action, pending] = useActionState<LinkImportState, FormData>(importFromLink, { status: "idle" });
  const [url, setUrl] = useState(state.url ?? "");
  const [rights, setRights] = useState(false);
  const looksValid = YT_RE.test(url);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Lien de la vidéo YouTube"
        name="url"
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder="https://www.youtube.com/watch?v=…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        hint={`Vidéo publique, ${maxMinutes} min maximum avec ton offre. Les directs, vidéos privées ou réservées aux membres ne peuvent pas être importés.`}
        error={url && !looksValid ? "Ce lien ne ressemble pas à un lien YouTube." : undefined}
      />
      <label className="flex cursor-pointer items-start gap-3 text-small text-muted">
        <input
          type="checkbox"
          name="rights"
          checked={rights}
          onChange={(e) => setRights(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
        />
        <span>
          Je confirme détenir les droits nécessaires sur cette vidéo (c&apos;est ma chaîne, ou j&apos;ai
          l&apos;autorisation de son auteur).
        </span>
      </label>
      {state.status === "error" && (
        <Alert tone="danger" title="Import non lancé">
          {state.message}
        </Alert>
      )}
      <div>
        <Button size="lg" type="submit" loading={pending} disabled={!looksValid || !rights}>
          <Link2 /> Importer depuis YouTube
        </Button>
      </div>
    </form>
  );
}
