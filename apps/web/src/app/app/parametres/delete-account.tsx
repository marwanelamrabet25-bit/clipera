"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const WORD = "SUPPRIMER";

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function confirm() {
    setPending(true);
    setError(undefined);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message ?? "La suppression a échoué. Réessaie.");
      router.replace("/connexion?compte=supprime");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "La suppression a échoué. Réessaie.");
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 /> Supprimer mon compte
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-4 rounded-md border border-danger/30 bg-danger-wash p-4">
      <p className="text-small text-fg">
        Cette action est <strong>définitive</strong> : ton compte, tes projets, tes vidéos et tes clips seront effacés et
        ne pourront pas être récupérés.
      </p>
      <Field
        label={`Pour confirmer, tape ${WORD}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        error={error}
      />
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" onClick={confirm} disabled={value !== WORD} loading={pending}>
          Supprimer définitivement
        </Button>
        <Button variant="ghost" onClick={() => (setOpen(false), setValue(""), setError(undefined))} disabled={pending}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
