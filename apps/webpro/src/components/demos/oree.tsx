/* Exemple de maquette — Orée, restaurant fictif (pas une réalisation client). */

const C = { pine: "#1E2B23", pine2: "#26362C", cream: "#F2EADC", clay: "#C2603A", sage: "#8FA588" };
const serif = { fontFamily: "var(--font-fraunces), Georgia, serif" } as const;

export function OreePlate({ className, idp = "a" }: { className?: string; idp?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Illustration : assiette de velouté vue de dessus">
      <defs>
        <radialGradient id={`plate-${idp}`} cx="45%" cy="40%" r="62%">
          <stop offset="0" stopColor="#FFFCF6" />
          <stop offset=".75" stopColor="#F1E8D8" />
          <stop offset="1" stopColor="#DCCFB9" />
        </radialGradient>
        <radialGradient id={`well-${idp}`} cx="50%" cy="50%" r="50%">
          <stop offset=".82" stopColor="#F7F1E5" />
          <stop offset="1" stopColor="#E2D6C1" />
        </radialGradient>
        <radialGradient id={`soup-${idp}`} cx="42%" cy="38%" r="65%">
          <stop offset="0" stopColor="#EBA56A" />
          <stop offset=".55" stopColor="#D27340" />
          <stop offset="1" stopColor="#A9502C" />
        </radialGradient>
        <filter id={`sh-${idp}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <ellipse cx="212" cy="222" rx="182" ry="182" fill="#0d140f" opacity=".35" filter={`url(#sh-${idp})`} />
      <circle cx="200" cy="200" r="184" fill={`url(#plate-${idp})`} />
      <circle cx="200" cy="200" r="184" fill="none" stroke="#CDBFA6" strokeOpacity=".5" />
      <circle cx="200" cy="200" r="128" fill={`url(#well-${idp})`} />
      <circle cx="200" cy="200" r="100" fill={`url(#soup-${idp})`} />
      <path
        d="M200 200m-6 0a6 6 0 1 1 12 0a14 14 0 1 1-28 0a24 24 0 1 1 48 0a36 36 0 1 1-72 0a48 48 0 1 1 96 0"
        fill="none"
        stroke="#F6EEDF"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity=".92"
      />
      {[
        [150, 168, 18],
        [238, 150, -30],
        [252, 236, 60],
        [172, 252, 140],
        [206, 132, 100],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 0c6-10 18-12 26-6c-6 10-18 12-26 6z"
          fill={i % 2 ? "#6E8C4E" : "#86A465"}
          transform={`translate(${x} ${y}) rotate(${r})`}
        />
      ))}
      {[
        [182, 220], [228, 196], [214, 238], [168, 196], [244, 214], [196, 164], [226, 172],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="3.2" ry="2" fill="#6B3F22" transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      {[
        [160, 230], [240, 178], [222, 254], [178, 150],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#4E6B35" opacity=".85" />
      ))}
    </svg>
  );
}

const menu = [
  {
    title: "Pour commencer",
    dishes: [
      { n: "Velouté de courge, noisettes torréfiées", d: "huile d'herbes, crème crue", p: "11" },
      { n: "Truite fumée maison", d: "pickles d'oignon rouge, aneth", p: "14" },
    ],
  },
  {
    title: "Au cœur du repas",
    dishes: [
      { n: "Volaille rôtie, jus au vin jaune", d: "champignons des bois, purée fumée", p: "26" },
      { n: "Risotto d'épeautre", d: "courges, sauge, vieux fromage", p: "21" },
    ],
  },
  {
    title: "Pour finir",
    dishes: [
      { n: "Poire pochée, sabayon", d: "biscuit au sarrasin", p: "10" },
      { n: "Tarte fine aux pommes", d: "caramel au beurre salé", p: "9" },
    ],
  },
];

export function OreeDemo() {
  return (
    <div style={{ background: C.pine, color: C.cream }} className="min-h-screen font-[family-name:var(--font-manrope)]">
      {/* Navigation */}
      <header className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="text-[30px] italic leading-none" style={serif}>
          Orée
        </a>
        <nav className="hidden gap-9 text-[14px] tracking-wide text-[#F2EADC]/80 md:flex">
          <a href="#carte">La carte</a>
          <a href="#lieu">Le lieu</a>
          <a href="#infos">Infos pratiques</a>
        </nav>
        <a href="#infos" className="rounded-full px-5 py-2.5 text-[14px] font-semibold" style={{ background: C.clay, color: "#FFF6EC" }}>
          Réserver
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 pt-6 pb-20 md:grid-cols-[1.15fr_1fr] md:px-10 md:pt-10">
        <div>
          <p className="mb-7 flex items-center gap-3 text-[12px] tracking-[0.22em] uppercase" style={{ color: C.sage }}>
            <span className="h-px w-10" style={{ background: C.sage }} /> Cuisine de saison · midi & soir
          </p>
          <h1
            className="text-[64px] leading-[0.98] tracking-[-0.03em] md:text-[104px]"
            style={{ ...serif, fontWeight: 340, fontVariationSettings: '"opsz" 144' }}
          >
            Ce que la saison a de <em className="italic" style={{ color: "#E7A57E" }}>meilleur</em>.
          </h1>
          <p className="mt-8 max-w-[34ch] text-[18px] leading-[1.6] text-[#F2EADC]/80">
            Une petite carte qui change au rythme des producteurs du coin. Des assiettes généreuses, sans chichis.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#infos" className="rounded-full px-7 py-4 text-[15px] font-semibold" style={{ background: C.clay, color: "#FFF6EC" }}>
              Réserver une table
            </a>
            <a href="#carte" className="rounded-full border px-7 py-4 text-[15px] font-semibold" style={{ borderColor: "rgba(242,234,220,.35)" }}>
              Voir la carte
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div
            className="relative aspect-[4/5] overflow-hidden"
            style={{ background: C.sage, borderRadius: "999px 999px 18px 18px" }}
          >
            <div className="absolute inset-0" style={{ background: "radial-gradient(120% 70% at 30% 20%, rgba(255,255,255,.22), transparent 60%)" }} />
            <OreePlate className="absolute top-[18%] left-1/2 w-[92%] -translate-x-1/2" idp="hero" />
            <svg viewBox="0 0 40 300" className="absolute top-[24%] right-[3%] h-[52%]" aria-hidden>
              <rect x="17" y="0" width="6" height="300" rx="3" fill="#E9E1D2" />
              <rect x="10" y="0" width="3" height="70" rx="1.5" fill="#E9E1D2" />
              <rect x="27" y="0" width="3" height="70" rx="1.5" fill="#E9E1D2" />
            </svg>
          </div>
          <p
            className="absolute -bottom-5 -left-4 rotate-[-4deg] rounded-full px-5 py-3 text-[15px] italic md:-left-10"
            style={{ ...serif, background: C.cream, color: C.pine }}
          >
            Nouvelle carte d&apos;automne
          </p>
        </div>
      </section>

      {/* Carte */}
      <section id="carte" style={{ background: C.cream, color: C.pine }} className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-14 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[12px] tracking-[0.22em] uppercase" style={{ color: C.clay }}>
              La carte du moment
            </p>
            <h2 className="mt-4 text-[48px] leading-[1.02] md:text-[64px]" style={{ ...serif, fontWeight: 360 }}>
              Automne, <em className="italic">au marché</em>
            </h2>
            <p className="mt-6 max-w-[36ch] text-[17px] leading-[1.65] opacity-80">
              Menu du midi en semaine : entrée, plat ou plat, dessert. Le soir, la carte complète.
            </p>
          </div>
          <div className="grid gap-12">
            {menu.map((m) => (
              <div key={m.title}>
                <h3 className="mb-5 border-b pb-3 text-[13px] tracking-[0.18em] uppercase" style={{ borderColor: "rgba(30,43,35,.18)" }}>
                  {m.title}
                </h3>
                <ul className="grid gap-6">
                  {m.dishes.map((d) => (
                    <li key={d.n} className="flex items-baseline gap-4">
                      <div>
                        <p className="text-[24px] leading-tight" style={{ ...serif, fontWeight: 420 }}>
                          {d.n}
                        </p>
                        <p className="mt-1 text-[15px] opacity-70">{d.d}</p>
                      </div>
                      <span className="mb-1.5 flex-1 border-b border-dotted" style={{ borderColor: "rgba(30,43,35,.3)" }} />
                      <span className="text-[20px]" style={serif}>
                        {d.p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lieu */}
      <section id="lieu" className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-3">
          {[
            { t: "Les producteurs", d: "Légumes, viandes et fromages viennent de fermes voisines. La carte suit leurs récoltes.", bg: C.pine2 },
            { t: "La salle", d: "Vingt-huit couverts, une grande table d'hôtes et une terrasse aux beaux jours.", bg: "#2E4034" },
            { t: "Les groupes", d: "Repas de famille ou d'équipe : un menu partagé sur demande.", bg: C.pine2 },
          ].map((b) => (
            <div key={b.t} className="rounded-[18px] p-9" style={{ background: b.bg }}>
              <p className="text-[34px] italic leading-tight" style={serif}>
                {b.t}
              </p>
              <p className="mt-4 text-[16px] leading-[1.65] text-[#F2EADC]/75">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Infos */}
      <section id="infos" className="px-6 pb-32 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-10 rounded-[24px] p-10 md:grid-cols-3 md:p-14" style={{ background: C.clay, color: "#FFF6EC" }}>
          <div>
            <p className="text-[40px] leading-[1.05]" style={{ ...serif, fontWeight: 360 }}>
              Réserver une table
            </p>
            <p className="mt-4 text-[16px] opacity-85">Par téléphone, ou directement en ligne.</p>
          </div>
          <div className="text-[16px] leading-[1.9]">
            <p className="font-semibold">Horaires (exemple)</p>
            <p>Mardi – samedi : 12 h – 14 h</p>
            <p>Jeudi – samedi : 19 h – 21 h 30</p>
          </div>
          <div className="text-[16px] leading-[1.9]">
            <p className="font-semibold">Accès (exemple)</p>
            <p>Place du village</p>
            <p>Parking à 50 m</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Planche de publications d’exemple (entreprise fictive) : annonce de carte, reel. */
export function OreeSocial() {
  const post = "relative aspect-square overflow-hidden rounded-[14px]";
  return (
    <div className="grid h-full grid-cols-[1fr_1fr_0.75fr] gap-6 p-10" style={{ background: "#E9E1D2" }}>
      <div data-tile="1" className={post} style={{ background: C.pine, color: C.cream }}>
        <p className="absolute top-7 left-7 text-[11px] tracking-[0.22em] uppercase" style={{ color: C.sage }}>
          Nouvelle carte
        </p>
        <p className="absolute bottom-7 left-7 text-[46px] leading-[0.98]" style={{ ...serif, fontWeight: 340 }}>
          L&apos;automne
          <br />
          <em className="italic" style={{ color: "#E7A57E" }}>
            s&apos;invite
          </em>
          <br />à table.
        </p>
      </div>
      <div data-tile="2" className={post} style={{ background: C.sage }}>
        <OreePlate className="absolute inset-[8%]" idp="post" />
        <p className="absolute right-6 bottom-6 rounded-full px-4 py-2 text-[13px] italic" style={{ ...serif, background: C.cream, color: C.pine }}>
          Velouté de courge
        </p>
      </div>
      <div data-tile="3" className="row-span-2 overflow-hidden rounded-[14px]" style={{ background: C.pine, color: C.cream }}>
        <div className="relative h-full">
          <div className="absolute inset-x-0 top-[14%] flex justify-center">
            <OreePlate className="w-[86%]" idp="reel" />
          </div>
          <p className="absolute inset-x-6 bottom-[22%] text-center text-[30px] leading-[1.05]" style={{ ...serif, fontWeight: 340 }}>
            3 nouveautés
            <br />
            <em className="italic">cette semaine</em>
          </p>
          <div className="absolute inset-x-6 bottom-8 h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[38%]" style={{ background: C.clay }} />
          </div>
          <p className="absolute top-5 left-6 text-[11px] tracking-[0.22em] uppercase opacity-70">Reel · 0:12</p>
        </div>
      </div>
      <div data-tile="4" className={post} style={{ background: C.cream, color: C.pine }}>
        <p className="absolute top-7 left-7 text-[11px] tracking-[0.22em] uppercase" style={{ color: C.clay }}>
          Cette semaine
        </p>
        <ul className="absolute inset-x-7 bottom-7 grid gap-2 text-[20px]" style={serif}>
          <li className="border-b pb-2" style={{ borderColor: "rgba(30,43,35,.15)" }}>Mar · Velouté & noisettes</li>
          <li className="border-b pb-2" style={{ borderColor: "rgba(30,43,35,.15)" }}>Jeu · Volaille au vin jaune</li>
          <li>Sam · Poire pochée</li>
        </ul>
      </div>
      <div data-tile="5" className={post} style={{ background: C.clay, color: "#FFF6EC" }}>
        <p className="absolute inset-7 flex items-end text-[40px] leading-[1]" style={{ ...serif, fontWeight: 340 }}>
          Ce soir, il reste 2 tables.
        </p>
      </div>
    </div>
  );
}
