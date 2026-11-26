import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrbitRing } from "@/components/visuals/orbit";
import { ButtonLink } from "@/components/ui/button";
import { services } from "@/config/services";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenu" className="relative overflow-clip">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 h-[34rem] opacity-70">
          <OrbitRing className="absolute left-1/2 h-full w-[90rem] max-w-none -translate-x-1/2 -rotate-6" id="nf-ring" />
        </div>
        <section className="shell relative flex min-h-[88svh] flex-col justify-center pt-[var(--header-h)] pb-20">
          <p className="t-label text-mist">Erreur 404</p>
          <h1 className="t-display mt-8 max-w-[11ch] text-paper">
            Cette page <span className="text-electric">s&apos;est égarée.</span>
          </h1>
          <p className="t-lead mt-8 max-w-[44ch] text-mist">
            L&apos;adresse a peut-être changé, ou la page n&apos;existe plus. Voici de quoi reprendre le fil.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Nous contacter
            </ButtonLink>
          </div>
          <ul className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-8">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={s.href} className="link-underline text-mist hover:text-paper">
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/maquette-gratuite" className="link-underline text-mist hover:text-paper">
                Maquette gratuite
              </Link>
            </li>
            <li>
              <Link href="/tarifs" className="link-underline text-mist hover:text-paper">
                Tarifs
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
