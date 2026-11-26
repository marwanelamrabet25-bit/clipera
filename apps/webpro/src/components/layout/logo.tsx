import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/site";
import { cn } from "@/lib/cn";

/** Logo officiel (version horizontale) extrait de la planche d'identité, proportions conservées. */
export function Logo({ className, href = "/", onClick }: { className?: string; href?: string | null; onClick?: () => void }) {
  const { src, width, height } = brand.logo.horizontal;
  const img = (
    <Image
      src={src}
      width={width}
      height={height}
      alt={href ? `${brand.name} — accueil` : brand.name}
      loading="eager"
      quality={90}
      sizes="220px"
      className={cn("h-7 w-auto sm:h-[1.95rem]", className)}
    />
  );
  if (!href) return img;
  return (
    <Link href={href} onClick={onClick} className="inline-flex shrink-0 rounded-sm">
      {img}
    </Link>
  );
}
