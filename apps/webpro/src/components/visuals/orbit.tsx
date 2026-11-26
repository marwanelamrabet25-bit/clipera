import { cn } from "@/lib/cn";

/**
 * Trait d'orbite : signature graphique tirée du mouvement circulaire du logo.
 * Utilisé avec parcimonie (soulignement de mots clés, compositions).
 */
export function OrbitUnderline({ className, delay = 700 }: { className?: string; delay?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 48"
      preserveAspectRatio="none"
      className={cn("orbit-draw pointer-events-none absolute", className)}
      style={{ ["--od" as string]: `${delay}ms` }}
    >
      <defs>
        <linearGradient id="ou-g" x1="0" x2="1">
          <stop offset="0" stopColor="#087BFF" stopOpacity="0.15" />
          <stop offset="0.45" stopColor="#087BFF" />
          <stop offset="1" stopColor="#00A8FF" />
        </linearGradient>
      </defs>
      <path
        d="M6 34 C 120 48, 300 44, 414 8"
        pathLength={1}
        fill="none"
        stroke="url(#ou-g)"
        strokeWidth="5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Grande orbite elliptique, avec un point lumineux qui la parcourt lentement. */
export function OrbitRing({ className, id = "ring" }: { className?: string; id?: string }) {
  const d = "M40 300 A 360 150 -14 1 1 760 120 A 360 150 -14 1 1 40 300";
  return (
    <svg aria-hidden viewBox="0 0 800 420" className={cn("pointer-events-none", className)} fill="none">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#087BFF" stopOpacity="0" />
          <stop offset="0.35" stopColor="#087BFF" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#00A8FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#00A8FF" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id={`${id}-dot`}>
          <stop offset="0" stopColor="#E6F6FF" />
          <stop offset="0.35" stopColor="#00A8FF" />
          <stop offset="1" stopColor="#00A8FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={d} stroke={`url(#${id}-g)`} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <circle r="9" fill={`url(#${id}-dot)`} className="orbit-dot">
        <animateMotion dur="14s" repeatCount="indefinite" path={d} />
      </circle>
    </svg>
  );
}
