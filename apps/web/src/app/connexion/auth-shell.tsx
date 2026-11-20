import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Card, CardBody } from "@/components/ui/card";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex justify-center" aria-label="Accueil Clipera">
          <Logo size={36} />
        </Link>
        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="mb-1 text-h2 font-bold">{title}</h1>
            <p className="mb-6 text-small text-muted">{subtitle}</p>
            {children}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
