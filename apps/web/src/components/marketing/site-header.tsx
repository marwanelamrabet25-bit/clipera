import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";

export const NAV = [
  ["/#resultat", "Le résultat"],
  ["/#moteur", "Le moteur"],
  ["/#fonctionnalites", "Fonctionnalités"],
  ["/tarifs", "Tarifs"],
  ["/blog", "Blog"],
] as const;

/** En-tête des pages publiques. Navigation complète dès 1024 px ; menu repliable en dessous. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" aria-label="Clipera — accueil" className="shrink-0">
          <Logo size={28} />
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 text-small lg:flex">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-muted transition-colors hover:bg-elevated hover:text-fg">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/connexion" className={buttonStyles({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}>
            Se connecter
          </Link>
          <Link href="/inscription" className={buttonStyles({ size: "sm" })}>
            <span className="sm:hidden">Essayer</span>
            <span className="hidden sm:inline">Essayer gratuitement</span>
          </Link>
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}
