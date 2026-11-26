/* Projet de démonstration — Atelier Sylve, menuiserie fictive. */

const C = { plaster: "#ECE7DF", coal: "#1C1B19", oak: "#B8875A", graphite: "#5C5A55" };
const cond = {
  fontFamily: "var(--font-archivo), 'Arial Narrow', sans-serif",
  fontStretch: "62%",
  fontWeight: 800,
} as const;

/** Texture de veinage générée (SVG), sans photo. */
export function Wood({ tone = "#B8875A", grain = "#5A3B22", seed = 3, vertical = false, className }: { tone?: string; grain?: string; seed?: number; vertical?: boolean; className?: string }) {
  const id = `wood-${seed}-${vertical ? "v" : "h"}`;
  return (
    <svg className={className} preserveAspectRatio="none" viewBox="0 0 400 500" aria-hidden>
      <defs>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={vertical ? "0.11 0.004" : "0.004 0.11"} numOctaves="4" seed={seed} result="n" />
          <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -0.78`} result="a" />
          <feFlood floodColor={grain} />
          <feComposite in2="a" operator="in" />
        </filter>
        <linearGradient id={`${id}-sheen`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={tone} />
      <rect width="400" height="500" filter={`url(#${id})`} opacity=".55" />
      <rect width="400" height="500" fill={`url(#${id}-sheen)`} />
    </svg>
  );
}

const crafts = [
  { t: "Escaliers", d: "Droits, quart ou demi-tournants, en bois massif.", tone: "#B8875A", grain: "#5A3B22", seed: 3 },
  { t: "Cuisines", d: "Façades, plans et rangements dessinés pour la pièce.", tone: "#6B4A33", grain: "#2B1A10", seed: 7 },
  { t: "Dressings", d: "Chaque centimètre exploité, jusque sous les combles.", tone: "#D8C3A0", grain: "#8A6B45", seed: 11 },
  { t: "Agencement", d: "Commerces et bureaux : comptoirs, vitrines, mobilier.", tone: "#C9A36B", grain: "#6E4C27", seed: 5 },
];

export function SylveDemo() {
  return (
    <div style={{ background: C.plaster, color: C.coal }} className="min-h-screen font-[family-name:var(--font-manrope)]">
      <header className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center" style={{ background: C.coal }}>
            <span className="block h-5 w-[3px]" style={{ background: C.oak, boxShadow: `6px 0 0 ${C.oak}, -6px 0 0 ${C.oak}` }} />
          </span>
          <span className="leading-none">
            <span className="block text-[26px] tracking-[0.02em] uppercase" style={cond}>
              Sylve
            </span>
            <span className="block text-[10px] tracking-[0.3em] uppercase opacity-60">atelier · menuiserie</span>
          </span>
        </a>
        <nav className="hidden gap-9 text-[14px] font-medium md:flex">
          <a href="#savoir-faire">Savoir-faire</a>
          <a href="#methode">Méthode</a>
          <a href="#realisations">Réalisations</a>
        </nav>
        <a href="#devis" className="px-5 py-3 text-[14px] font-semibold text-white" style={{ background: C.coal }}>
          <span className="sm:hidden">Devis</span>
          <span className="hidden sm:inline">Demander un devis</span>
        </a>
      </header>

      <section className="mx-auto grid max-w-[1360px] gap-10 px-6 pt-8 pb-20 md:grid-cols-[1.25fr_1fr] md:px-10 md:pt-12">
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-6 text-[12px] font-semibold tracking-[0.24em] uppercase" style={{ color: C.oak }}>
              Menuiserie & agencement sur mesure
            </p>
            <h1 className="text-[96px] leading-[0.86] tracking-[-0.01em] uppercase md:text-[176px]" style={cond}>
              Le bois,
              <br />
              <span style={{ color: C.oak }}>sur mesure.</span>
            </h1>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-[38ch] text-[18px] leading-[1.6]" style={{ color: C.graphite }}>
              Escaliers, cuisines, dressings et agencements dessinés, fabriqués et posés par la même équipe.
            </p>
            <a href="#devis" className="inline-flex items-center gap-4 px-7 py-4 text-[15px] font-semibold text-white" style={{ background: C.coal }}>
              Décrire mon projet <span aria-hidden>→</span>
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden">
          <Wood className="absolute inset-0 h-full w-full" vertical seed={9} tone="#B8875A" grain="#4E321C" />
          <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
            <g fill="none" stroke="#F4EEE6" strokeWidth="1.4" opacity=".9">
              {Array.from({ length: 9 }).map((_, i) => (
                <path key={i} d={`M${70 + i * 28} ${430 - i * 34} h28 v-34`} />
              ))}
              <path d="M70 430 L322 124" strokeDasharray="4 6" opacity=".7" />
              <path d="M60 456 H340" />
              <path d="M60 450 v12 M340 450 v12" />
              <path d="M360 124 V430" />
              <path d="M354 124 h12 M354 430 h12" />
            </g>
            <g fill="#F4EEE6" fontFamily="var(--font-archivo), sans-serif" fontSize="11" letterSpacing="1.5">
              <text x="168" y="476">2 740 MM</text>
              <text x="372" y="282" transform="rotate(90 372 282)">2 520 MM</text>
              <text x="40" y="52">ESCALIER DROIT — CHÊNE MASSIF</text>
              <text x="40" y="70" opacity=".75">MARCHES 40 MM · HUILE NATURELLE</text>
            </g>
          </svg>
        </div>
      </section>

      <section id="savoir-faire" className="px-6 py-24 md:px-10" style={{ background: C.coal, color: C.plaster }}>
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[64px] leading-[0.9] uppercase md:text-[96px]" style={cond}>
              Savoir-faire
            </h2>
            <p className="max-w-[40ch] text-[17px] opacity-75">
              Du relevé de mesures à la pose, chaque pièce est pensée pour l&apos;endroit où elle vivra.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {crafts.map((c, i) => (
              <article key={c.t} className="group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Wood className="absolute inset-0 h-full w-full" tone={c.tone} grain={c.grain} seed={c.seed} vertical={i % 2 === 0} />
                  <span className="absolute top-4 left-4 text-[12px] font-semibold tracking-[0.2em]" style={{ color: "#F4EEE6" }}>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-[34px] leading-none uppercase" style={cond}>
                  {c.t}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] opacity-70">{c.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="methode" className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-[1fr_2fr]">
          <h2 className="text-[56px] leading-[0.9] uppercase md:text-[80px]" style={cond}>
            Comment
            <br />
            ça se passe
          </h2>
          <ol className="grid border-t sm:grid-cols-2" style={{ borderColor: "rgba(28,27,25,.2)" }}>
            {[
              ["Visite & mesures", "On se rencontre sur place, on écoute, on mesure."],
              ["Plans & devis", "Un plan coté et un devis détaillé, poste par poste."],
              ["Fabrication", "Les pièces sont fabriquées et ajustées à l'atelier."],
              ["Pose & finitions", "Pose soignée, chantier propre, finitions vérifiées."],
            ].map(([t, d], i) => (
              <li key={t} className="border-b py-8 sm:odd:pr-10" style={{ borderColor: "rgba(28,27,25,.2)" }}>
                <span className="text-[13px] font-semibold" style={{ color: C.oak }}>
                  Étape {i + 1}
                </span>
                <p className="mt-3 text-[30px] leading-none uppercase" style={cond}>
                  {t}
                </p>
                <p className="mt-3 text-[16px]" style={{ color: C.graphite }}>
                  {d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="devis" className="px-6 pb-28 md:px-10">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-8 p-10 md:p-14" style={{ background: C.oak, color: C.coal }}>
          <p className="text-[48px] leading-[0.92] uppercase md:text-[72px]" style={cond}>
            Un projet ? Décrivez-le
            <br />
            en deux minutes.
          </p>
          <a href="#" className="px-7 py-4 text-[15px] font-semibold text-white" style={{ background: C.coal }}>
            Demander un devis →
          </a>
        </div>
      </section>
    </div>
  );
}
