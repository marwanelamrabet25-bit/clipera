import Image from "next/image";
import { cn } from "@/lib/cn";

/** Logo horizontal : symbole officiel + mot « Clipera » en Inter Bold. */
export function Logo({ className, size = 32, onLight = false }: { className?: string; size?: number; onLight?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={onLight ? "/brand/clipera-symbol-on-light.png" : "/brand/clipera-symbol-on-dark.png"}
        alt=""
        width={size}
        height={size}
        priority
      />
      <span
        className={cn("font-bold tracking-[-0.03em]", onLight ? "text-canvas" : "text-fg")}
        style={{ fontSize: size * 0.72 }}
      >
        Clipera
      </span>
    </span>
  );
}

export function AppIcon({ size = 40, className }: { size?: number; className?: string }) {
  return <Image src="/brand/clipera-app-icon.png" alt="Clipera" width={size} height={size} className={className} />;
}
