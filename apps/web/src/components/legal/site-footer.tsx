import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-caption text-subtle sm:px-8">
        <span>© 2026 Clipera</span>
        <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/mentions-legales" className="hover:text-fg">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-fg">
            Confidentialité
          </Link>
          <Link href="/cgu" className="hover:text-fg">
            Conditions d&apos;utilisation
          </Link>
        </nav>
      </div>
    </footer>
  );
}
