import { Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { ClipScene, Phone } from "@/components/landing/clip-scene";

const PERKS = ["Jusqu'à 10 clips par vidéo, sur des sujets différents", "Sous-titres au mot près, cadrage vertical", "Offre gratuite, sans carte bancaire"];

/**
 * Pages de connexion et d'inscription : formulaire à droite, univers Clipera à gauche (grands écrans).
 * Les formulaires eux-mêmes ne changent pas.
 */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_10%,rgb(139_92_246/0.16),transparent_70%)]" />
        <Link href="/" aria-label="Accueil Clipera" className="relative w-fit">
          <Logo size={30} />
        </Link>
        <div className="relative grid grid-cols-[1fr_auto] items-end gap-10">
          <div>
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              <span className="text-primary-soft">Clipera</span> · générateur de clips IA
            </p>
            <p className="mt-5 text-[2.4rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
              Ta prochaine vidéo contient déjà tes prochains clips.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {PERKS.map((p) => (
                <li key={p} className="flex gap-2.5 text-small text-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary-soft" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-[170px] rotate-[4deg]">
            <Phone>
              <ClipScene tone="violet" words={["Ta", "première", "phrase", "décide", "de", "tout"]} highlight={[3]} className="size-full" />
            </Phone>
          </div>
        </div>
        <p className="relative text-caption text-subtle">Image de démonstration · clipera.fr</p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <Link href="/" aria-label="Accueil Clipera" className="mb-10 w-fit lg:hidden">
          <Logo size={30} />
        </Link>
        <div className="m-auto w-full max-w-sm">
          <h1 className="text-[2rem] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
          <p className="mt-2 mb-8 text-body text-muted">{subtitle}</p>
          {children}
        </div>
        <nav aria-label="Liens légaux" className="mx-auto mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-caption text-subtle">
          <Link href="/tarifs" className="hover:text-fg">Tarifs</Link>
          <Link href="/confidentialite" className="hover:text-fg">Confidentialité</Link>
          <Link href="/cgu" className="hover:text-fg">Conditions d&apos;utilisation</Link>
          <Link href="/mentions-legales" className="hover:text-fg">Mentions légales</Link>
        </nav>
      </main>
    </div>
  );
}
