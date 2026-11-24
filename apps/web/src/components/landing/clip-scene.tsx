import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Image de démonstration d'un clip (aucune vraie vidéo, aucun vrai visage) : un plateau de podcast flou,
 * éclairé, avec un intervenant en silhouette, et des sous-titres qui s'allument mot à mot comme dans le rendu réel.
 * Toujours accompagnée d'une mention « Démonstration » là où elle est utilisée.
 */
export type SceneTone = "amber" | "violet" | "teal" | "rose";

const TONES: Record<SceneTone, { key: string; rim: string; wall: string }> = {
  amber: { key: "rgb(255 170 90 / 0.42)", rim: "rgb(255 196 140 / 0.5)", wall: "#1d1610" },
  violet: { key: "rgb(139 92 246 / 0.5)", rim: "rgb(196 170 255 / 0.55)", wall: "#15111f" },
  teal: { key: "rgb(60 190 200 / 0.36)", rim: "rgb(150 230 235 / 0.5)", wall: "#0e1719" },
  rose: { key: "rgb(240 110 150 / 0.36)", rim: "rgb(255 175 200 / 0.5)", wall: "#1c1015" },
};

function Person({ x, scale = 1, rim, side }: { x: string; scale?: number; rim: string; side: "left" | "right" }) {
  const dir = side === "left" ? 1 : -1;
  const light = `inset ${10 * dir}px 0 16px -8px ${rim}, inset ${-6 * dir}px 0 22px -10px rgb(255 255 255 / 0.05)`;
  return (
    <div className="absolute bottom-0" style={{ left: x, width: `${34 * scale}%`, transform: "translateX(-50%)" }} aria-hidden>
      {/* Halo derrière la tête : détache la silhouette du fond */}
      <div
        className="absolute top-[-14%] left-1/2 aspect-square w-[95%] -translate-x-1/2 rounded-full opacity-60"
        style={{ background: `radial-gradient(closest-side, ${rim}, transparent)` }}
      />
      <div className="relative mx-auto aspect-[0.8] w-[44%] rounded-[48%_48%_44%_44%] bg-[#17171f]" style={{ boxShadow: light }} />
      <div className="relative mx-auto -mt-[4%] aspect-[1.3] w-full rounded-t-[46%] bg-[#17171f]" style={{ boxShadow: light }} />
    </div>
  );
}

export function ClipScene({
  tone = "violet",
  layout = "portrait",
  words,
  highlight = [],
  captionStyle = "modern",
  cycle = 6,
  className,
  delay = 0,
}: {
  tone?: SceneTone;
  layout?: "portrait" | "single" | "duo";
  words?: string[];
  highlight?: number[];
  captionStyle?: "modern" | "classic" | "minimal";
  cycle?: number;
  className?: string;
  delay?: number;
}) {
  const t = TONES[tone];
  const step = words ? (cycle * 0.7) / words.length : 0;
  return (
    <div
      className={cn("relative isolate overflow-hidden bg-[#0b0b10] [container-type:inline-size]", className)}
      style={{
        backgroundImage: `radial-gradient(70% 55% at 22% 18%, ${t.key}, transparent 70%), radial-gradient(60% 50% at 85% 30%, rgb(255 255 255 / 0.06), transparent 70%), linear-gradient(180deg, ${t.wall}, #0b0b10 85%)`,
      }}
    >
      {/* Bokeh : lumières floues du plateau */}
      <div aria-hidden className="absolute inset-0">
        {[
          [12, 22, 9],
          [74, 14, 6],
          [88, 40, 11],
          [30, 8, 5],
          [60, 30, 4],
        ].map(([x, y, s], i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${s * 1.6}%`,
              aspectRatio: "1",
              background: `radial-gradient(closest-side, ${i % 2 ? t.rim : "rgb(255 255 255 / 0.18)"}, transparent)`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
      {layout === "duo" ? (
        <>
          <Person x="30%" scale={0.62} rim={t.rim} side="left" />
          <Person x="72%" scale={0.6} rim={t.rim} side="right" />
          {/* Micros sur pied */}
          <span aria-hidden className="absolute bottom-0 left-[42%] h-[38%] w-[1.2%] rounded-full bg-[#1c1c24]" />
          <span aria-hidden className="absolute bottom-[34%] left-[39.5%] aspect-[0.6] w-[6%] rounded-full bg-[#22222c] ring-1 ring-white/10" />
          <span aria-hidden className="absolute bottom-0 left-[60%] h-[36%] w-[1.2%] rounded-full bg-[#1c1c24]" />
          <span aria-hidden className="absolute bottom-[32%] left-[57.5%] aspect-[0.6] w-[6%] rounded-full bg-[#22222c] ring-1 ring-white/10" />
        </>
      ) : (
        <>
          <Person x="54%" scale={layout === "portrait" ? 2.9 : 1.9} rim={t.rim} side="left" />
          <span aria-hidden className="absolute bottom-0 left-[16%] h-[30%] w-[2.5%] -rotate-12 rounded-full bg-[#1c1c24]" />
          <span aria-hidden className="absolute bottom-[26%] left-[11%] aspect-[0.58] w-[13%] -rotate-12 rounded-full bg-[#22222c] ring-1 ring-white/10" />
        </>
      )}
      {/* Assombrissement du bas : lisibilité des sous-titres, comme dans le rendu réel */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      {words && (
        <p
          className={cn(
            "absolute inset-x-[7%] bottom-[22%] text-center leading-[1.15] text-white [text-shadow:0_2px_6px_rgb(0_0_0/0.85)]",
            captionStyle === "modern" && "font-extrabold tracking-tight uppercase",
            captionStyle === "classic" && "font-bold",
            captionStyle === "minimal" && "font-medium",
          )}
          style={{ fontSize: "clamp(9px, 7.2cqw, 22px)" }}
        >
          {words.map((w, i) => (
            <span
              key={i}
              className={cn("caption-word", highlight.includes(i) && "text-[#a78bfa]")}
              style={
                {
                  animation: `word-in ${cycle}s ${delay + i * step}s infinite both`,
                } as CSSProperties
              }
            >
              {w}{" "}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

/** Cadre de téléphone sobre (pas de marque), pour présenter un clip vertical. */
export function Phone({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19.2] rounded-[2rem] bg-[#060609] p-[5px] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.85),0_0_0_1px_rgb(255_255_255/0.09)_inset]",
        className,
      )}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <div className="relative size-full overflow-hidden rounded-[1.7rem] [container-type:inline-size]">
        {children}
        <span aria-hidden className="absolute top-[2.2%] left-1/2 h-[2.6%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
