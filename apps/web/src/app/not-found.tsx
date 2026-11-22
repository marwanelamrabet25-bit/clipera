import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/legal/site-footer";
import { buttonStyles } from "@/components/ui/button";
import { SOLUTION_PAGES } from "@/lib/seo";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

/** Page 404 en français, avec des liens utiles plutôt qu'une impasse. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 sm:px-8">
        <p className="text-small font-semibold text-primary-soft">Erreur 404</p>
        <h1 className="mt-3 text-h1 font-bold">Cette page est introuvable</h1>
        <p className="mt-4 text-body text-muted">
          L&apos;adresse est peut-être mal écrite, ou la page a été déplacée. Voici où continuer :
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonStyles({ size: "lg" })}>
            Retour à l&apos;accueil
          </Link>
          <Link href="/app" className={buttonStyles({ size: "lg", variant: "secondary" })}>
            Mon espace
          </Link>
        </div>
        <ul className="mt-12 grid gap-2 text-small sm:grid-cols-2">
          {[...SOLUTION_PAGES, { href: "/tarifs", label: "Tarifs" }, { href: "/blog", label: "Blog" }].map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="text-primary-soft hover:underline">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
