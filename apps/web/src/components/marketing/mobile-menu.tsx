"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

/** Menu des petits écrans (< 1024 px) : panneau sous l'en-tête, fermé par Échap, un lien ou un changement de page. */
export function MobileMenu({ items }: { items: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden" key={pathname}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-fg [&_svg]:size-5"
      >
        {open ? <X /> : <Menu />}
      </button>
      <div
        id={id}
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-line bg-canvas/95 px-4 pt-2 pb-5 shadow-pop backdrop-blur-md sm:px-8"
      >
        <nav aria-label="Navigation mobile" className="mx-auto flex max-w-6xl flex-col">
          {items.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3.5 text-body text-fg last:border-b-0"
            >
              {label}
            </Link>
          ))}
          <Link href="/connexion" onClick={() => setOpen(false)} className="mt-3 py-2 text-small text-muted">
            Se connecter
          </Link>
        </nav>
      </div>
    </div>
  );
}
