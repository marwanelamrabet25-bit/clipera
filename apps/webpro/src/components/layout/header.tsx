"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { mainNav, primaryCta } from "@/config/navigation";
import { services } from "@/config/services";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ButtonLink } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermeture du menu Services : Échap, clic extérieur, perte du focus.
  useEffect(() => {
    if (!servicesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        servicesRef.current?.querySelector("button")?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [servicesOpen]);

  const openSoon = useCallback((open: boolean) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setServicesOpen(open), open ? 60 : 180);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const serviceActive = services.some((s) => pathname.startsWith(s.href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-line bg-ink/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "shell flex items-center justify-between gap-6 transition-[height] duration-500 ease-[var(--ease-out-expo)]",
          scrolled ? "h-16" : "h-[var(--header-h)]",
        )}
      >
        <Logo />

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) =>
              "children" in item ? (
                <li
                  key={item.label}
                  ref={servicesRef}
                  className="relative"
                  onPointerEnter={(e) => e.pointerType === "mouse" && openSoon(true)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && openSoon(false)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false);
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-controls={panelId}
                    onClick={() => setServicesOpen((o) => !o)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm px-3 py-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors xl:px-3.5",
                      serviceActive || servicesOpen ? "text-paper" : "text-mist hover:text-paper",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden
                      className={cn("size-3.5 transition-transform duration-300", servicesOpen && "rotate-180")}
                    />
                  </button>
                  <div
                    id={panelId}
                    hidden={!servicesOpen}
                    className="absolute top-full left-1/2 w-[34rem] -translate-x-1/2 pt-3"
                  >
                    <div className="enter-panel overflow-hidden rounded-[4px] border border-line bg-ink-2/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
                      <ul>
                        {item.children.map((s) => (
                          <li key={s.slug} className="border-b border-line last:border-b-0">
                            <Link
                              href={s.href}
                              onClick={() => setServicesOpen(false)}
                              aria-current={pathname.startsWith(s.href) ? "page" : undefined}
                              className="group/s grid grid-cols-[3rem_1fr_auto] items-center gap-2 px-5 py-4 transition-colors hover:bg-paper/[0.035]"
                            >
                              <span className="t-label text-slate">{s.index}</span>
                              <span>
                                <span className="block font-semibold tracking-[-0.01em] text-paper">{s.title}</span>
                                <span className="block text-sm text-mist">{s.menuHint}</span>
                              </span>
                              <span
                                aria-hidden
                                className="text-electric opacity-0 transition-all duration-300 group-hover/s:translate-x-1 group-hover/s:opacity-100"
                              >
                                →
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-sm px-3 py-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors xl:px-3.5",
                      isActive(item.href) ? "text-paper" : "text-mist hover:text-paper",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-px bg-electric xl:inset-x-3.5" />
                    )}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <ButtonLink href={primaryCta.href} size="md">
              {primaryCta.label}
            </ButtonLink>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
