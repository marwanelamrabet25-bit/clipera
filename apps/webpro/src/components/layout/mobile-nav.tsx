"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { contact, serviceArea } from "@/config/site";
import { services } from "@/config/services";
import { primaryCta } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

const links = [
  { label: "Accueil", href: "/" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Maquette gratuite", href: "/maquette-gratuite" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- le portail n'existe qu'après l'hydratation
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const toggle = toggleRef.current;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => setOpen(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  let i = 0;

  const panel = (
    <div
      ref={panelRef}
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-open={open ? "" : undefined}
      className={cn(
        "mnav fixed inset-0 z-50 flex flex-col bg-ink lg:hidden",
        open ? "visible" : "invisible",
      )}
    >
      <div className="shell flex h-[var(--header-h)] shrink-0 items-center justify-between">
        <Logo onClick={close} />
        <button
          type="button"
          onClick={close}
          className="t-label -mr-2 flex h-11 items-center gap-2.5 rounded-sm px-2 text-paper"
        >
          Fermer
          <span aria-hidden className="relative block size-4">
            <span className="absolute top-1/2 left-0 h-px w-4 rotate-45 bg-current" />
            <span className="absolute top-1/2 left-0 h-px w-4 -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <nav aria-label="Navigation mobile" className="shell flex-1 overflow-y-auto pt-6 pb-8">
        <ul className="border-t border-line">
          {links.slice(0, 1).map((l) => (
            <MobileItem key={l.href} l={l} i={i++} active={isActive(l.href)} onClick={close} />
          ))}
          <li className="mnav-item border-b border-line py-5" style={{ "--mi": i++ } as CSSProperties}>
            <p className="t-label mb-3 text-slate">Services</p>
            <ul className="space-y-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={s.href}
                    onClick={close}
                    aria-current={isActive(s.href) ? "page" : undefined}
                    className="flex items-baseline gap-3 py-1.5 text-xl font-semibold tracking-[-0.02em] text-paper"
                  >
                    <span className="t-label text-electric">{s.index}</span>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {links.slice(1).map((l) => (
            <MobileItem key={l.href} l={l} i={i++} active={isActive(l.href)} onClick={close} />
          ))}
        </ul>

        <div className="mnav-item mt-8 space-y-6" style={{ "--mi": i++ } as CSSProperties}>
          <Link
            href={primaryCta.href}
            onClick={close}
            className="flex h-14 items-center justify-between rounded-[3px] bg-electric px-5 font-semibold text-ink"
          >
            {primaryCta.longLabel}
            <span aria-hidden>→</span>
          </Link>
          <div className="grid gap-1 text-mist">
            <a href={`tel:${contact.phoneE164}`} className="py-1 text-paper">
              {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="py-1 break-all text-paper">
              {contact.email}
            </a>
            <p className="t-meta pt-2 text-slate">{serviceArea.summary}</p>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen(true)}
        className="t-label -mr-2 flex h-11 items-center gap-3 rounded-sm px-2 text-paper lg:hidden"
      >
        Menu
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="h-px w-5 bg-current" />
          <span className="h-px w-3.5 self-end bg-current" />
        </span>
      </button>
      {mounted && createPortal(panel, document.body)}
    </>
  );
}

function MobileItem({
  l,
  i,
  active,
  onClick,
}: {
  l: { label: string; href: string };
  i: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li className="mnav-item border-b border-line" style={{ "--mi": i } as CSSProperties}>
      <Link
        href={l.href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className="flex items-center justify-between py-5 text-[2rem] leading-none font-bold tracking-[-0.04em] text-paper"
      >
        {l.label}
        {active && <span aria-hidden className="size-2 bg-electric" />}
      </Link>
    </li>
  );
}
