import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

const NAV = [
  ["/#fonctionnement", "Fonctionnement"],
  ["/#moteur", "Le moteur"],
  ["/transformer-podcast-en-clips", "Podcasts"],
  ["/tarifs", "Tarifs"],
  ["/blog", "Blog"],
] as const;

/** En-tête des pages publiques (accueil, pages de contenu, blog). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" aria-label="Clipera — accueil">
          <Logo size={28} />
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-small text-muted md:flex">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-fg">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/connexion" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Se connecter
          </Link>
          <Link href="/inscription" className={buttonStyles({ size: "sm" })}>
            <span className="sm:hidden">Essayer</span>
            <span className="hidden sm:inline">Essayer gratuitement</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
