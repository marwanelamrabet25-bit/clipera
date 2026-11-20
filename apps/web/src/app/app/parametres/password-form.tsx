"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { updatePassword, type ProfileState } from "./actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updatePassword, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "saved") formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nouveau mot de passe" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <Field
          label="Confirmation"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          error={state.status === "error" ? state.message : undefined}
          hint={state.status === "saved" ? "Mot de passe mis à jour." : undefined}
        />
      </div>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          Mettre à jour le mot de passe
        </Button>
      </div>
    </form>
  );
}
