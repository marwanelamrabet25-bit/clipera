import type { Metadata } from "next";
import { Suspense } from "react";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { AuthShell } from "./auth-shell";
import { PasswordForm } from "./password-form";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default function SignInPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <AuthShell title="Connexion" subtitle="Accède à ton espace Clipera.">
      <Suspense fallback={<Skeleton className="h-64" />}>
        <Forms searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Forms({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const sp = await searchParams;
  const suite = typeof sp.suite === "string" ? sp.suite : undefined;
  return (
    <div className="flex flex-col gap-6">
      {sp.erreur === "lien" && (
        <Alert tone="warning" title="Ce lien n'est plus valide">
          Il a peut-être expiré ou déjà été utilisé. Connecte-toi avec ton mot de passe.
        </Alert>
      )}
      <PasswordForm mode="signin" suite={suite} />
      <details className="group border-t border-line pt-5">
        <summary className="cursor-pointer list-none text-center text-small text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
          Pas de mot de passe ? Recevoir un lien de connexion par e-mail
        </summary>
        <div className="mt-5">
          <SignInForm suite={suite} />
        </div>
      </details>
    </div>
  );
}
