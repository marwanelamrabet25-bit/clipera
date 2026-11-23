"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { sendMagicLink, type SignInState } from "./actions";

export function SignInForm({ suite, linkError }: { suite?: string; linkError?: boolean }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <div className="mb-5 grid size-12 place-items-center rounded-md border border-primary-line bg-primary-wash text-primary-soft">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <h2 className="text-h3 font-semibold">Vérifie ta boîte mail</h2>
        <p className="mt-2 text-small text-muted">
          Nous avons envoyé un lien de connexion à <span className="font-medium text-fg">{state.email}</span>.
          Il est valable 1 heure. Pense à regarder dans les indésirables. Une fois connecté, tu peux choisir un
          nouveau mot de passe dans Paramètres.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {linkError && state.status === "idle" && (
        <Alert tone="warning" title="Ce lien n'est plus valide">
          Il a peut-être expiré ou déjà été utilisé. Demande un nouveau lien ci-dessous.
        </Alert>
      )}
      <input type="hidden" name="suite" value={suite ?? ""} />
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="toi@exemple.com"
        defaultValue={state.email}
        error={state.status === "error" ? state.message : undefined}
        required
      />
      <Button type="submit" variant="secondary" loading={pending}>
        Recevoir un lien de connexion <ArrowRight />
      </Button>
      <p className="text-center text-caption text-subtle">
        Le lien est valable 1 heure et ne fonctionne qu&apos;une fois.
      </p>
    </form>
  );
}
