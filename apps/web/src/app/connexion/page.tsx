import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default function SignInPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex justify-center" aria-label="Accueil Clipera">
          <Logo size={36} />
        </Link>
        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="mb-1 text-h2 font-bold">Connexion</h1>
            <p className="mb-6 text-small text-muted">Accède à ton espace Clipera.</p>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <FormWithParams searchParams={searchParams} />
            </Suspense>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

async function FormWithParams({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const sp = await searchParams;
  const suite = typeof sp.suite === "string" ? sp.suite : undefined;
  return <SignInForm suite={suite} linkError={sp.erreur === "lien"} />;
}
