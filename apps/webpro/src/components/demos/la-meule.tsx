/* Projet de démonstration — La Meule, fromagerie fictive (boutique en ligne). */

const C = { rind: "#3A2A1C", paste: "#F3D27A", milk: "#FBF6EA", meadow: "#5E7D4E", crust: "#C99A4B" };
const serif = { fontFamily: "var(--font-fraunces), Georgia, serif" } as const;

/** Meule entière, vue de trois quarts, avec une part découpée. Illustration vectorielle. */
export function Wheel({ className, idp = "w" }: { className?: string; idp?: string }) {
  return (
    <svg viewBox="0 0 420 320" className={className} role="img" aria-label="Illustration : meule de fromage entamée">
      <defs>
        <linearGradient id={`side-${idp}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8E6430" />
          <stop offset=".35" stopColor="#C99A4B" />
          <stop offset=".7" stopColor="#B4843D" />
          <stop offset="1" stopColor="#7A5428" />
        </linearGradient>
        <radialGradient id={`top-${idp}`} cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#E7BE69" />
          <stop offset="1" stopColor="#C9984A" />
        </radialGradient>
        <linearGradient id={`cut-${idp}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F8DC8E" />
          <stop offset="1" stopColor="#EEC462" />
        </linearGradient>
      </defs>
      <ellipse cx="210" cy="278" rx="190" ry="30" fill="#3A2A1C" opacity=".14" />
      {/* corps */}
      <path d="M30 150 v100 a180 44 0 0 0 360 0 v-100 z" fill={`url(#side-${idp})`} />
      <path d="M30 160 a180 44 0 0 0 360 0" fill="none" stroke="#6E4A22" strokeOpacity=".35" strokeWidth="2" />
      <path d="M30 236 a180 44 0 0 0 360 0" fill="none" stroke="#6E4A22" strokeOpacity=".25" strokeWidth="2" />
      {/* dessus avec part manquante */}
      <path d="M210 150 L390 150 A180 44 0 1 1 300 112 Z" fill={`url(#top-${idp})`} />
      {/* faces de coupe */}
      <path d="M210 150 L300 112 v100 L210 250 Z" fill={`url(#cut-${idp})`} />
      <path d="M210 150 L390 150 v100 L210 250 Z" fill="#F3D27A" />
      <path d="M210 150 L390 150 v100 L210 250 Z" fill="#000" opacity=".04" />
      {[
        [250, 190, 6], [320, 214, 4], [280, 228, 3.5], [356, 178, 3], [236, 222, 3],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.8} fill="#D9A93E" opacity=".55" />
      ))}
      <path d="M210 150 L390 150" stroke="#B88A3C" strokeWidth="5" />
      <path d="M210 150 L300 112" stroke="#B88A3C" strokeWidth="5" />
      {/* part posée devant */}
      <g transform="translate(300 182)">
        <path d="M0 52 L96 22 L96 66 L0 96 Z" fill="#E9BC5C" />
        <path d="M0 52 L96 22 L60 8 L-36 38 Z" fill="#F7D888" />
        <path d="M-36 38 L0 52 L0 96 L-36 82 Z" fill="#9E7034" />
        <circle cx="40" cy="58" r="4" fill="#D9A93E" opacity=".6" />
        <circle cx="66" cy="48" r="3" fill="#D9A93E" opacity=".6" />
      </g>
    </svg>
  );
}

/** Pictogrammes simples de fromages pour les fiches produits. */
function Cheese({ kind }: { kind: "comte" | "morbier" | "montdor" | "bleu" }) {
  if (kind === "morbier")
    return (
      <svg viewBox="0 0 200 140" className="w-[78%]" aria-hidden>
        <path d="M20 60 L150 30 L180 50 L180 110 L50 130 L20 110 Z" fill="#F1E1B5" />
        <path d="M20 60 L150 30 L180 50 L50 80 Z" fill="#F8EDCB" />
        <path d="M20 60 L50 80 L50 130 L20 110 Z" fill="#C8A46A" />
        <path d="M50 104 L180 80" stroke="#3B3A36" strokeWidth="4" />
        <path d="M20 85 L50 104" stroke="#3B3A36" strokeWidth="4" />
      </svg>
    );
  if (kind === "montdor")
    return (
      <svg viewBox="0 0 200 140" className="w-[78%]" aria-hidden>
        <ellipse cx="100" cy="98" rx="84" ry="30" fill="#B98A57" />
        <rect x="16" y="64" width="168" height="34" fill="#B98A57" />
        <ellipse cx="100" cy="64" rx="84" ry="30" fill="#D9AF7C" />
        <ellipse cx="100" cy="64" rx="70" ry="23" fill="#EBD2A7" />
        <path d="M44 62 q28 -16 56 0 t56 0" stroke="#D4B27C" strokeWidth="4" fill="none" />
      </svg>
    );
  if (kind === "bleu")
    return (
      <svg viewBox="0 0 200 140" className="w-[78%]" aria-hidden>
        <path d="M30 70 L170 40 L170 100 L30 128 Z" fill="#EFE8D6" />
        <path d="M30 70 L170 40 L140 26 L10 52 Z" fill="#F7F2E4" />
        <path d="M10 52 L30 70 L30 128 L10 108 Z" fill="#CFC3A6" />
        {[[60, 80], [90, 92], [120, 70], [150, 84], [70, 108], [130, 100], [100, 60]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#5B6E7A" opacity=".7" />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 200 140" className="w-[78%]" aria-hidden>
      <path d="M20 66 L170 30 L170 96 L20 130 Z" fill="#F3D27A" />
      <path d="M20 66 L170 30 L140 18 L-6 50 Z" fill="#F8E09A" />
      <path d="M-6 50 L20 66 L20 130 L-6 114 Z" fill="#A87B3C" />
      <circle cx="80" cy="90" r="5" fill="#D9A93E" opacity=".6" />
      <circle cx="130" cy="70" r="4" fill="#D9A93E" opacity=".6" />
    </svg>
  );
}

const products = [
  { n: "Comté AOP 18 mois", w: "250 g", p: "7,90 €", k: "comte" as const, bg: "#F6E7BE", tag: "Le plus demandé" },
  { n: "Morbier AOP", w: "250 g", p: "5,40 €", k: "morbier" as const, bg: "#EDE6D4" },
  { n: "Mont d'Or AOP", w: "pièce ~500 g", p: "15,00 €", k: "montdor" as const, bg: "#F1DFC6", tag: "De saison" },
  { n: "Bleu de Gex AOP", w: "200 g", p: "5,20 €", k: "bleu" as const, bg: "#E3E8E2" },
];

export function MeuleDemo() {
  return (
    <div style={{ background: C.milk, color: C.rind }} className="min-h-screen font-[family-name:var(--font-manrope)]">
      <p className="py-2.5 text-center text-[13px] font-medium" style={{ background: C.rind, color: C.milk }}>
        Commandez avant 17 h, retirez en boutique le jour même (exemple)
      </p>
      <header className="mx-auto flex max-w-[1320px] items-center gap-8 px-6 py-5 md:px-10">
        <a href="#" className="leading-none">
          <span className="block text-[30px] font-semibold tracking-[-0.02em]" style={serif}>
            La Meule
          </span>
          <span className="block text-[10px] tracking-[0.32em] uppercase opacity-60">fromagerie · épicerie fine</span>
        </a>
        <div className="hidden flex-1 items-center gap-3 rounded-full border px-5 py-3 text-[14px] opacity-80 md:flex" style={{ borderColor: "rgba(58,42,28,.18)" }}>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          Rechercher un fromage, une région…
        </div>
        <div className="ml-auto flex items-center gap-5 text-[14px] font-medium">
          <span className="hidden md:inline">Mon compte</span>
          <span className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: C.paste }}>
            Panier <span className="grid size-5 place-items-center rounded-full text-[11px] text-white" style={{ background: C.rind }}>2</span>
          </span>
        </div>
      </header>
      <nav className="mx-auto flex max-w-[1320px] gap-2 overflow-x-auto px-6 pb-6 text-[14px] md:px-10">
        {["Pâtes pressées", "Croûtes lavées", "Pâtes persillées", "Chèvres", "Crémerie", "Épicerie", "Plateaux"].map((c, i) => (
          <span key={c} className="shrink-0 rounded-full border px-4 py-2" style={{ borderColor: "rgba(58,42,28,.18)", background: i === 0 ? C.rind : "transparent", color: i === 0 ? C.milk : C.rind }}>
            {c}
          </span>
        ))}
      </nav>

      <section className="mx-auto grid max-w-[1320px] items-center gap-6 px-6 md:grid-cols-2 md:px-10">
        <div className="rounded-[28px] p-10 md:p-14" style={{ background: C.paste }}>
          <p className="text-[12px] font-semibold tracking-[0.22em] uppercase opacity-70">Retrait en boutique</p>
          <h1 className="mt-5 text-[56px] leading-[0.98] tracking-[-0.025em] md:text-[78px]" style={{ ...serif, fontWeight: 520, fontVariationSettings: '"opsz" 144' }}>
            Affinés avec patience, réservés en un clic.
          </h1>
          <p className="mt-6 max-w-[38ch] text-[17px] leading-[1.6] opacity-80">
            Choisissez vos fromages ce matin, on vous les prépare à la coupe pour ce soir.
          </p>
          <a href="#produits" className="mt-9 inline-flex rounded-full px-7 py-4 text-[15px] font-semibold" style={{ background: C.rind, color: C.milk }}>
            Commander pour ce soir
          </a>
        </div>
        <div className="relative grid aspect-[5/4] place-items-center overflow-hidden rounded-[28px]" style={{ background: "#EFE3C8" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 35%, #FFF7E2 0%, transparent 70%)" }} />
          <Wheel className="relative w-[82%]" idp="hero" />
          <p className="absolute top-6 right-6 rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: C.milk }}>
            Affinage 18 mois
          </p>
        </div>
      </section>

      <section id="produits" className="mx-auto max-w-[1320px] px-6 py-20 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="text-[40px] leading-none tracking-[-0.02em]" style={{ ...serif, fontWeight: 520 }}>
            Cette semaine à la coupe
          </h2>
          <span className="hidden text-[14px] font-semibold underline underline-offset-4 md:block">Tout le catalogue</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <article key={p.n} className="rounded-[22px] border p-3" style={{ borderColor: "rgba(58,42,28,.1)", background: "#FFFDF7" }}>
              <div className="relative grid aspect-square place-items-center rounded-[16px]" style={{ background: p.bg }}>
                <Cheese kind={p.k} />
                {p.tag && (
                  <span className="absolute top-3 left-3 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: C.milk }}>
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="px-2 pt-4 pb-2">
                <h3 className="text-[19px] font-semibold tracking-[-0.01em]">{p.n}</h3>
                <p className="mt-1 text-[14px] opacity-60">{p.w}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[18px] font-semibold">{p.p}</span>
                  <span className="rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: C.rind, color: C.milk }}>
                    Ajouter
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-28 md:px-10">
        <div className="grid gap-6 rounded-[28px] p-10 md:grid-cols-3 md:p-14" style={{ background: C.meadow, color: C.milk }}>
          {[
            ["1", "Vous commandez", "En ligne, jusqu'à 17 h."],
            ["2", "On prépare", "Coupe et emballage à la main."],
            ["3", "Vous retirez", "En boutique, sans attendre."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <p className="text-[56px] leading-none" style={{ ...serif, fontWeight: 400 }}>
                {n}
              </p>
              <p className="mt-4 text-[20px] font-semibold">{t}</p>
              <p className="mt-1 text-[15px] opacity-80">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Gabarits « arrivage de la semaine » pour les réseaux sociaux. */
export function MeuleSocial() {
  const post = "relative aspect-square overflow-hidden rounded-[14px]";
  return (
    <div className="grid h-full grid-cols-3 gap-6 p-10" style={{ background: "#EDE3CF" }}>
      <div data-tile="1" className={post} style={{ background: C.paste, color: C.rind }}>
        <p className="absolute top-7 left-7 text-[11px] font-semibold tracking-[0.22em] uppercase">Arrivage</p>
        <Wheel className="absolute right-[-6%] bottom-[16%] w-[88%]" idp="s1" />
        <p className="absolute bottom-7 left-7 text-[34px] leading-none" style={{ ...serif, fontWeight: 520 }}>
          Le Mont d&apos;Or est là.
        </p>
      </div>
      <div data-tile="2" className={post} style={{ background: C.rind, color: C.milk }}>
        <p className="absolute top-7 left-7 text-[11px] font-semibold tracking-[0.22em] uppercase opacity-70">À la coupe cette semaine</p>
        <ul className="absolute inset-x-7 bottom-7 grid gap-2.5 text-[22px]" style={serif}>
          <li className="flex justify-between border-b border-white/15 pb-2">Comté 18 mois <span>✓</span></li>
          <li className="flex justify-between border-b border-white/15 pb-2">Morbier <span>✓</span></li>
          <li className="flex justify-between">Bleu de Gex <span>✓</span></li>
        </ul>
      </div>
      <div data-tile="3" className={post} style={{ background: C.meadow, color: C.milk }}>
        <p className="absolute inset-7 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase opacity-80">Click & collect</span>
          <span className="text-[38px] leading-[1]" style={{ ...serif, fontWeight: 480 }}>
            Commandé le matin, retiré le soir.
          </span>
        </p>
      </div>
      <div data-tile="4" className={post} style={{ background: C.milk, color: C.rind }}>
        <div className="absolute inset-0 grid place-items-center" style={{ background: "#F1DFC6" }}>
          <Cheese kind="montdor" />
        </div>
        <p className="absolute bottom-6 left-6 rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: C.milk }}>
          Idée du week-end : Mont d&apos;Or au four
        </p>
      </div>
      <div data-tile="5" className={post} style={{ background: "#FFFDF7", color: C.rind }}>
        <p className="absolute top-7 left-7 text-[11px] font-semibold tracking-[0.22em] uppercase opacity-60">Accord du mois</p>
        <p className="absolute bottom-7 left-7 right-7 text-[30px] leading-[1.05]" style={{ ...serif, fontWeight: 480 }}>
          Comté fruité & noix fraîches.
        </p>
        <div className="absolute top-[22%] right-[10%] size-24 rounded-full" style={{ background: C.paste }} />
      </div>
      <div data-tile="6" className={post} style={{ background: C.paste, color: C.rind }}>
        <p className="absolute inset-7 flex items-end text-[36px] leading-[1]" style={{ ...serif, fontWeight: 520 }}>
          Plateaux pour vos fêtes : réservez dès maintenant.
        </p>
      </div>
    </div>
  );
}
