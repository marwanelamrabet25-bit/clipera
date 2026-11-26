import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

/** Fil d'Ariane visible + données structurées BreadcrumbList. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="t-meta text-slate">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="link-underline transition-colors hover:text-paper">
              Accueil
            </Link>
          </li>
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              <span aria-hidden className="text-line-strong">/</span>
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-mist">
                  {it.name}
                </span>
              ) : (
                <Link href={it.path} className="link-underline transition-colors hover:text-paper">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
