import type { CSSProperties } from "react";
import { doubsMap } from "@/content/doubs-map";

const base = "Pierrefontaine-les-Varans";
const sectors: { name: string; label?: string; dx: number; dy: number; anchor?: "start" | "end" }[] = [
  { name: "Besançon", dx: -12, dy: -12, anchor: "end" },
  { name: "Baume-les-Dames", dx: -12, dy: -10, anchor: "end" },
  { name: "Montbéliard", dx: -12, dy: 4, anchor: "end" },
  { name: "Ornans", dx: -12, dy: 16, anchor: "end" },
  { name: "Valdahon", dx: -12, dy: 18, anchor: "end" },
  { name: "Maîche", dx: 12, dy: 4 },
  { name: "Morteau", dx: 12, dy: 6 },
  { name: "Pontarlier", dx: 12, dy: 6 },
];

/**
 * Le Doubs, commune par commune. Pierrefontaine-les-Varans est la base ; les traits rejoignent
 * des repères du département sans tracer de rayon : la zone d'intervention est le département entier.
 */
export function DoubsMap({ className }: { className?: string }) {
  const [bx, by] = doubsMap.places[base];
  return (
    <figure className={className}>
      <svg viewBox={doubsMap.viewBox} className="h-auto w-full overflow-visible" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">Carte du Doubs</title>
        <desc id="map-desc">
          Chaque point représente une commune du Doubs. WEBPRO AGENCY est basée à Pierrefontaine-les-Varans et intervient dans
          tout le département, notamment vers Besançon, Baume-les-Dames, Montbéliard, Ornans, Valdahon, Maîche, Morteau et
          Pontarlier.
        </desc>
        <defs>
          <radialGradient id="map-glow">
            <stop offset="0" stopColor="#087BFF" stopOpacity="0.45" />
            <stop offset="1" stopColor="#087BFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={doubsMap.outline} fill="rgba(16,23,34,0.55)" stroke="rgba(183,192,206,0.32)" strokeWidth="1.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <g data-reveal="fade">
          <path d={doubsMap.communes} stroke="rgba(183,192,206,0.42)" strokeWidth="3.2" strokeLinecap="round" />
        </g>
        <circle cx={bx} cy={by} r="90" fill="url(#map-glow)" />
        <g className="orbit-draw" data-observe="" style={{ "--od": "300ms" } as CSSProperties}>
          {sectors.map((s) => {
            const [x, y] = doubsMap.places[s.name];
            const mx = (bx + x) / 2;
            const my = (by + y) / 2 - Math.hypot(x - bx, y - by) * 0.18;
            return (
              <path
                key={s.name}
                d={`M${bx} ${by} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x} ${y}`}
                pathLength={1}
                fill="none"
                stroke="#087BFF"
                strokeOpacity="0.55"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
        {sectors.map((s) => {
          const [x, y] = doubsMap.places[s.name];
          return (
            <g key={s.name}>
              <circle cx={x} cy={y} r="4.5" fill="#F7F9FC" />
              <text
                x={x + s.dx}
                y={y + s.dy}
                textAnchor={s.anchor ?? "start"}
                className="fill-mist font-mono"
                style={{ fontSize: 15, letterSpacing: "0.02em" }}
              >
                {s.label ?? s.name}
              </text>
            </g>
          );
        })}
        <g>
          <circle cx={bx} cy={by} r="16" fill="none" stroke="#087BFF" strokeWidth="1.5" className="map-pulse" style={{ transformOrigin: `${bx}px ${by}px` }} />
          <circle cx={bx} cy={by} r="8" fill="#087BFF" stroke="#050608" strokeWidth="3" />
          <text x={bx} y={by - 54} textAnchor="middle" className="fill-electric font-mono" style={{ fontSize: 13, letterSpacing: "0.1em" }}>
            NOTRE BASE
          </text>
          <text x={bx} y={by - 30} textAnchor="middle" className="fill-paper" style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Pierrefontaine-les-Varans
          </text>
        </g>
      </svg>
      <figcaption className="t-meta mt-6 text-slate">
        Chaque point représente une commune du Doubs. Données cartographiques : IGN / INSEE (Licence Ouverte), via france-geojson.
      </figcaption>
    </figure>
  );
}
