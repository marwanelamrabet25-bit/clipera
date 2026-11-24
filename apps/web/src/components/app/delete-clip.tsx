"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteClip, type DeleteClipState } from "@/app/app/projets/[id]/actions";
import { Button } from "@/components/ui/button";

/** Suppression d'un clip, avec confirmation (fichier effacé définitivement). */
export function DeleteClip({ clipId, projectId }: { clipId: string; projectId: string }) {
  const [state, action, pending] = useActionState<DeleteClipState, FormData>(deleteClip, { status: "idle" });
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)} aria-label="Supprimer ce clip">
        <Trash2 />
      </Button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="clip_id" value={clipId} />
      <input type="hidden" name="project_id" value={projectId} />
      <Button type="submit" variant="danger" size="sm" loading={pending}>
        Supprimer
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
        Annuler
      </Button>
      {state.status === "error" && <span className="text-caption text-danger">{state.message}</span>}
    </form>
  );
}
