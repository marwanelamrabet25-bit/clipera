"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { signInWithPassword, signUpWithPassword, type PasswordState } from "./actions";

export function PasswordForm({ mode, suite }: { mode: "signin" | "signup"; suite?: string }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    mode === "signin" ? signInWithPassword : signUpWithPassword,
    { status: "idle" },
  );

  if (state.status === "confirm") {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <div className="mb-5 grid size-12 place-items-center rounded-md border border-primary-line bg-primary-wash text-primary-soft">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <h2 className="text-h3 font-semibold">Confirme ton adresse e-mail</h2>
        <p className="mt-2 text-small text-muted">
          Ton compte est créé. Clique sur le lien envoyé à <span className="font-medium text-fg">{state.email}</span>,
          puis connecte-toi avec ton mot de passe.
        </p>
      </div>
    );
  }

  const error = state.status === "error" ? state.message : undefined;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="suite" value={suite ?? ""} />
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="toi@exemple.com"
        defaultValue={state.email}
        required
        autoFocus
      />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        minLength={mode === "signup" ? 8 : undefined}
        hint={mode === "signup" ? "8 caractères minimum." : undefined}
        error={error}
        required
      />
      <Button type="submit" size="lg" loading={pending} className="mt-1">
        {mode === "signin" ? "Se connecter" : "Créer mon compte"} <ArrowRight />
      </Button>
      {mode === "signup" && (
        <p className="text-center text-caption text-subtle">
          En créant un compte, tu acceptes les{" "}
          <Link href="/cgu" className="underline hover:text-fg">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="underline hover:text-fg">
            politique de confidentialité
          </Link>
          .
        </p>
      )}
      <p className="text-center text-small text-muted">
        {mode === "signin" ? (
          <>
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-medium text-primary-soft hover:underline">
              Créer un compte
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-medium text-primary-soft hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
