/* Exemple fictif — La Meule, fromagerie imaginaire : visuels de réseaux sociaux et formats vidéo de démonstration. */

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
