import Image from "next/image";
import { cn } from "@/lib/cn";

/** Fenêtre de navigateur minimale (sans marque de navigateur) pour présenter un site. */
export function BrowserFrame({
  src,
  alt,
  label,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  preload,
  scrollOnHover,
  quality = 75,
}: {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
  /** Si renseigné : capture pleine page qui défile au survol. */
  scrollOnHover?: boolean;
  quality?: 75 | 90;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-line-strong bg-ink-2 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-line px-3 sm:h-8">
        <span className="size-2 rounded-full bg-paper/15" />
        <span className="size-2 rounded-full bg-paper/15" />
        <span className="size-2 rounded-full bg-paper/15" />
        {label && (
          <span className="mx-auto flex h-[1.15rem] max-w-[60%] min-w-0 items-center justify-center truncate rounded-[3px] bg-paper/[0.05] px-3 font-mono text-[0.625rem] text-mist sm:h-5">
            {label}
          </span>
        )}
        {label && <span className="w-[2.625rem]" aria-hidden />}
      </div>
      <div className={cn("relative aspect-[16/10] overflow-hidden", scrollOnHover && "scrollshot")}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          fetchPriority={preload ? "high" : undefined}
          quality={quality}
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

/** Téléphone stylisé (cadre neutre). */
export function PhoneFrame({
  src,
  alt,
  className,
  sizes = "240px",
  preload,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.1rem] border-[5px] border-[#1b2230] bg-black shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)] ring-1 ring-paper/10",
        className,
      )}
    >
      <div className="relative aspect-[390/844] overflow-hidden rounded-[1.75rem]">
        <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover object-top" />
        <span aria-hidden className="absolute top-2 left-1/2 h-[0.9rem] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
