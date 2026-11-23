"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { deleteProject, type DeleteState } from "./actions";

/** Suppression d'un projet, en deux temps (confirmation explicite, sans fenêtre du navigateur). */
export function DeleteProject({ projectId, clipCount }: { projectId: string; clipCount: number }) {
  const [state, action, pending] = useActionState<DeleteState, FormData>(deleteProject, { status: "idle" });
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {!confirming ? (
        <Button variant="ghost" size="sm" className="self-start text-muted" onClick={() => setConfirming(true)}>
          <Trash2 /> Supprimer ce projet
        </Button>
      ) : (
        <form action={action} className="flex flex-col gap-3 rounded-lg border border-danger/40 bg-danger-wash p-4">
          <input type="hidden" name="project_id" value={projectId} />
          <p className="text-small text-fg">
            Supprimer définitivement la vidéo source
            {clipCount > 0 ? ` et ${clipCount === 1 ? "son clip" : `ses ${clipCount} clips`}` : ""} ? Les fichiers seront
            effacés de nos serveurs. Pense à télécharger les clips que tu veux garder. Le quota déjà utilisé n&apos;est
            pas rendu.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="danger" size="sm" loading={pending}>
              <Trash2 /> Oui, supprimer
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
              Annuler
            </Button>
          </div>
        </form>
      )}
      {state.status === "error" && <Alert tone="danger" title="Suppression impossible">{state.message}</Alert>}
    </div>
  );
}
