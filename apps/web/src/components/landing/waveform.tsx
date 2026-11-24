/**
 * Onde sonore décorative en UN seul tracé SVG (au lieu de dizaines d'éléments) : même rendu, rendu bien plus léger.
 * Hauteurs pseudo-aléatoires déterministes (identiques côté serveur et navigateur).
 */
export function Waveform({ bars, className, seed = 47 }: { bars: number; className?: string; seed?: number }) {
  const w = 100 / bars;
  let d = "";
  for (let i = 0; i < bars; i++) {
    const h = 20 + ((i * seed + (i % 5) * 13) % 62); // 20–82 % de la hauteur
    const x = i * w + w * 0.2;
    d += `M${x.toFixed(3)} ${((100 - h) / 2).toFixed(2)}h${(w * 0.6).toFixed(3)}v${h}h${(-w * 0.6).toFixed(3)}z`;
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  );
}
