import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SOCIAL_PROFILES, SOLUTION_PAGES } from "@/lib/seo";

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
      ["/cgv", "Conditions de vente"],
    ] as const,
  },
];

/** Pied de page commun : il relie toutes les pages publiques entre elles (utile aux visiteurs et à Google). */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      {/* Signature : la frise de montage, graduée comme une timeline */}
      <div aria-hidden className="mx-auto max-w-6xl px-4 pt-8 sm:px-8">
        <div className="relative h-5 bg-[repeating-linear-gradient(90deg,var(--color-line-strong)_0_1px,transparent_1px_70px),repeating-linear-gradient(90deg,var(--color-line)_0_1px,transparent_1px_7px)] bg-[length:100%_12px,100%_6px] bg-bottom bg-no-repeat">
          <span className="absolute bottom-0 left-[31%] h-5 w-px bg-primary-soft" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Logo size={24} />
          <p className="mt-4 max-w-xs text-small text-subtle">
            Clipera transforme tes vidéos longues en clips courts sous-titrés, prêts pour TikTok, YouTube Shorts et
            Instagram Reels.
          </p>
          {SOCIAL_PROFILES.length > 0 && (
            <ul aria-label="Clipera sur les réseaux sociaux" className="mt-4 flex flex-wrap gap-3 text-caption">
              {SOCIAL_PROFILES.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="me noopener" className="text-primary-soft hover:underline">
                    Clipera sur {p.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-caption font-medium tracking-wide text-fg uppercase">{c.title}</p>
            <ul className="mt-3 flex flex-col gap-2.5 text-small text-subtle">
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
        <p className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-5 text-caption text-subtle sm:px-8">
          <span>© 2026 Clipera · clipera.fr</span>
          <span className="tabular-nums">Fait en France · 00:00:00:00</span>
        </p>
      </div>
    </footer>
  );
}
