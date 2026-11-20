"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { updateDisplayName, type ProfileState } from "./actions";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateDisplayName, { status: "idle" });
  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Field
          label="Nom affiché"
          name="display_name"
          defaultValue={initialName}
          maxLength={80}
          placeholder="Ton prénom ou pseudo"
          error={state.status === "error" ? state.message : undefined}
          hint={state.status === "saved" ? "Enregistré." : "Utilisé pour te saluer dans l'application."}
        />
      </div>
      <Button type="submit" loading={pending} className="sm:mb-[22px]">
        Enregistrer
      </Button>
    </form>
  );
}
