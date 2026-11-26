import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "light";

const base =
  "group/btn relative inline-flex items-center justify-between gap-5 rounded-[3px] font-semibold tracking-[-0.01em] transition-[background-color,color,border-color,transform] duration-200 ease-out active:scale-[0.985] select-none";

const variants: Record<Variant, string> = {
  primary: "bg-electric text-ink hover:bg-glow",
  outline: "border border-line-strong text-paper hover:border-paper/60 hover:bg-paper/[0.04]",
  light: "bg-paper text-ink hover:bg-glow",
};

const sizes = {
  md: "h-12 pl-5 pr-3.5 text-[0.95rem]",
  lg: "h-14 pl-6 pr-4 text-base",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "lg",
  icon = "right",
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  icon?: "right" | "up" | "none";
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const content = (
    <>
      <span>{children}</span>
      {icon !== "none" && (
        <span aria-hidden className="relative grid size-5 place-items-center overflow-hidden">
          {icon === "up" ? (
            <ArrowUpRight className="size-[1.1rem] transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" strokeWidth={2} />
          ) : (
            <ArrowRight className="size-[1.1rem] transition-transform duration-300 ease-out group-hover/btn:translate-x-1" strokeWidth={2} />
          )}
        </span>
      )}
    </>
  );
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {content}
    </Link>
  );
}

/** Lien texte avec flèche, pour les renvois internes. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/al inline-flex items-center gap-2 font-semibold text-paper transition-colors hover:text-glow",
        className,
      )}
    >
      <span className="link-underline pb-0.5">{children}</span>
      <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover/al:translate-x-1" />
    </Link>
  );
}
