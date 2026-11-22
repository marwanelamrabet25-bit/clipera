import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SOLUTION_PAGES } from "@/lib/seo";

const COLUMNS = [
  { title: "Solutions", links: SOLUTION_PAGES.map((p) => [p.href, p.label] as const) },
  {
    title: "Clipera",
    links: [
      ["/tarifs", "Tarifs"],
      ["/blog", "Blog"],
      ["/inscription", "Créer un compte gratuit"],
      ["/connexion", "Se connecter"],
    ] as const,
  },
  {
    title: "Informations légales",
    links: [
      ["/mentions-legales", "Mentions légales"],
      ["/confidentialite", "Confidentialité"],
      ["/cgu", "Conditions d'utilisation"],
    ] as const,
  },
];

/** Pied de page commun : il relie toutes les pages publiques entre elles (utile aux visiteurs et à Google). */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo size={24} />
          <p className="mt-3 max-w-xs text-caption text-subtle">
            Clipera transforme tes vidéos longues en clips courts sous-titrés, prêts pour TikTok, YouTube Shorts et
            Instagram Reels.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-caption font-semibold text-fg">{c.title}</p>
            <ul className="mt-3 flex flex-col gap-2 text-caption text-subtle">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-caption text-subtle sm:px-8">© 2026 Clipera · clipera.fr</p>
      </div>
    </footer>
  );
}
