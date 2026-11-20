import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/account";
import { signOut } from "../../connexion/actions";
import { ChangePasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const { user, profile } = await getAccount();
  return (
    <>
      <PageHeader title="Paramètres" />
      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Connecté avec {user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <ProfileForm initialName={profile?.display_name ?? ""} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>Définis ou change le mot de passe de ton compte.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <ChangePasswordForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Session</CardTitle>
              <CardDescription>Déconnecte-toi de cet appareil.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                <LogOut /> Se déconnecter
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
