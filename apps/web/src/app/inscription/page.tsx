import type { Metadata } from "next";
import { AuthShell } from "../connexion/auth-shell";
import { PasswordForm } from "../connexion/password-form";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell title="Créer un compte" subtitle="Commence gratuitement : 3 vidéos par mois, sans carte bancaire.">
      <PasswordForm mode="signup" />
    </AuthShell>
  );
}
