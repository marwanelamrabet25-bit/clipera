import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Alert } from "@/components/ui/feedback";
import { LEGAL, legalIsComplete } from "@/content/legal";
import { SiteFooter } from "./site-footer";

/** Affiche une valeur légale, ou une mention visible « à compléter » (jamais de valeur inventée). */
export function Value({ v }: { v: string | null }) {
  return v ? <>{v}</> : <mark className="rounded-sm bg-warning-wash px-1 text-warning">à compléter</mark>;
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-8">
          <Link href="/" aria-label="Accueil Clipera">
            <Logo size={26} />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-8">
        <h1 className="text-h1 font-bold">{title}</h1>
        <p className="mt-2 text-small text-subtle">Dernière mise à jour : {LEGAL.updatedAt}</p>
        {!legalIsComplete() && (
          <Alert tone="warning" title="Document en cours de finalisation" className="mt-6">
            Certaines informations sur l&apos;éditeur sont en cours de complétion.
          </Alert>
        )}
        <div className="legal mt-8 flex flex-col gap-8 text-body text-muted [&_a]:text-primary-soft [&_a]:underline [&_h2]:mb-3 [&_h2]:text-h3 [&_h2]:font-semibold [&_h2]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul+p]:mt-3 [&_strong]:text-fg [&_ul]:mt-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
