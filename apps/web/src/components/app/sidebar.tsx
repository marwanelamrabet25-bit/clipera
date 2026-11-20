"use client";

import { CreditCard, Film, FolderOpen, LayoutDashboard, LogOut, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/nouveau", label: "Nouveau projet", icon: Plus },
  { href: "/app/projets", label: "Mes projets", icon: FolderOpen },
  { href: "/app/bibliotheque", label: "Bibliothèque", icon: Film },
  { href: "/app/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/app/parametres", label: "Paramètres", icon: Settings },
] as const;

export function SidebarSkeleton() {
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 pt-6 pb-8">
          <Logo size={28} />
        </div>
        <div className="flex flex-col gap-2 px-3">
          {NAV.map((n) => (
            <div key={n.href} className="h-10 animate-pulse rounded-md bg-elevated/60" />
          ))}
        </div>
      </aside>
      <div className="h-[92px] border-b border-line bg-surface lg:hidden" />
    </>
  );
}

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  displayName,
  email,
  planName,
  signOut,
}: {
  displayName: string;
  email: string | null;
  planName: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  return (
    <>
      {/* Ordinateur : barre latérale fixe */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 pt-6 pb-8">
          <Link href="/app" aria-label="Dashboard">
            <Logo size={28} />
          </Link>
        </div>
        <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ href, label, icon: Icon, ...rest }) => {
            const active = isActive(pathname, href, "exact" in rest ? rest.exact : false);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-small font-medium transition-colors",
                  active ? "bg-primary-wash text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon className={cn("size-4", active ? "text-primary-soft" : "text-subtle")} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-md border border-line bg-canvas p-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-elevated text-small font-semibold text-primary-soft uppercase">
              {displayName.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium">{displayName}</p>
              <p className="truncate text-caption text-subtle">{email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-caption text-subtle">Offre {planName}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-caption text-muted hover:text-fg"
              >
                <LogOut className="size-3.5" aria-hidden /> Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile et tablette : barre supérieure + navigation défilante */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/app" aria-label="Dashboard">
            <Logo size={24} />
          </Link>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-1.5 text-small text-muted hover:text-fg">
              <LogOut className="size-4" aria-hidden /> Déconnexion
            </button>
          </form>
        </div>
        <nav aria-label="Navigation principale" className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {NAV.map(({ href, label, ...rest }) => {
            const active = isActive(pathname, href, "exact" in rest ? rest.exact : false);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-small font-medium",
                  active ? "bg-primary-wash text-fg" : "text-muted",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
