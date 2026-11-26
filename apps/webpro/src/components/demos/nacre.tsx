/* Exemple de maquette — Nacre, institut de beauté fictif (pas une réalisation client). */

const C = { pearl: "#F4ECE7", powder: "#E3C9C0", ink: "#2B2326", bronze: "#8A5D49" };
const serif = { fontFamily: "var(--font-fraunces), Georgia, serif" } as const;

/** Sphère nacrée : superposition de dégradés, sans image. */
export function Pearl({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div
        className="relative aspect-square w-full rounded-full"
        style={{
          background:
            "radial-gradient(38% 34% at 34% 28%, rgba(255,255,255,.95), rgba(255,255,255,0) 70%), radial-gradient(60% 60% at 70% 72%, rgba(196,170,214,.55), rgba(196,170,214,0) 70%), radial-gradient(55% 55% at 22% 76%, rgba(170,206,214,.5), rgba(170,206,214,0) 70%), radial-gradient(80% 80% at 60% 40%, #F7E3DA 0%, #E8C9BD 55%, #CFA796 100%)",
          boxShadow: "inset -30px -40px 80px rgba(120,80,70,.22), inset 20px 30px 60px rgba(255,255,255,.5), 0 60px 120px -40px rgba(80,50,45,.45)",
        }}
      >
        <div className="absolute inset-[6%] rounded-full opacity-70" style={{ background: "radial-gradient(60% 40% at 60% 80%, rgba(210,230,240,.35), transparent 70%), radial-gradient(40% 30% at 70% 30%, rgba(255,232,214,.4), transparent 70%)" }} />
      </div>
    </div>
  );
}

const families = [
  { f: "Visage", items: [["Soin éclat", "60 min"], ["Soin hydratant", "45 min"], ["Nettoyage de peau", "50 min"]] },
  { f: "Corps", items: [["Massage relaxant", "60 min"], ["Gommage & enveloppement", "75 min"]] },
  { f: "Mains & pieds", items: [["Beauté des mains", "45 min"], ["Beauté des pieds", "50 min"]] },
];

export function NacreDemo() {
  return (
    <div style={{ background: C.pearl, color: C.ink }} className="min-h-screen font-[family-name:var(--font-manrope)]">
      <header className="mx-auto grid max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-7 md:px-10">
        <nav className="hidden gap-8 text-[14px] md:flex">
          <a href="#soins">Les soins</a>
          <a href="#institut">L&apos;institut</a>
        </nav>
        <a href="#" className="col-start-2 flex items-center gap-2.5 text-[34px] italic leading-none" style={{ ...serif, fontWeight: 300 }}>
          <span className="inline-block size-3.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff, #E3C9C0 60%, #B98E80)" }} />
          Nacre
        </a>
        <a href="#rdv" className="col-start-3 justify-self-end rounded-full px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap sm:px-5 sm:py-3 sm:text-[14px]" style={{ background: C.ink, color: C.pearl }}>
          <span className="sm:hidden">Rendez-vous</span>
          <span className="hidden sm:inline">Prendre rendez-vous</span>
        </a>
      </header>

      <section className="relative mx-auto max-w-[1320px] overflow-hidden px-6 pt-10 pb-24 text-center md:px-10">
        <Pearl className="pointer-events-none absolute top-[4%] left-1/2 w-[440px] -translate-x-1/2 md:w-[560px]" />
        <div className="relative pt-[250px] md:pt-[330px]">
          <p className="text-[12px] tracking-[0.28em] uppercase" style={{ color: C.bronze }}>
            Institut de beauté
          </p>
          <h1 className="mx-auto mt-5 max-w-[14ch] text-[64px] leading-[0.95] tracking-[-0.03em] italic md:text-[112px]" style={{ ...serif, fontWeight: 300 }}>
            Prendre soin, simplement.
          </h1>
          <p className="mx-auto mt-7 max-w-[44ch] text-[18px] leading-[1.6] opacity-75">
            Des soins du visage et du corps dans un lieu calme, avec le temps qu&apos;il faut pour chacun.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#rdv" className="rounded-full px-7 py-4 text-[15px] font-semibold" style={{ background: C.ink, color: C.pearl }}>
              Prendre rendez-vous
            </a>
            <a href="#soins" className="rounded-full border px-7 py-4 text-[15px] font-semibold" style={{ borderColor: "rgba(43,35,38,.25)" }}>
              Découvrir les soins
            </a>
          </div>
        </div>
      </section>

      <section id="soins" className="px-6 py-24 md:px-10" style={{ background: "#FBF7F4" }}>
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[56px] leading-none italic md:text-[72px]" style={{ ...serif, fontWeight: 300 }}>
            La carte des soins
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {families.map((fam) => (
              <div key={fam.f}>
                <h3 className="border-b pb-4 text-[13px] font-semibold tracking-[0.2em] uppercase" style={{ borderColor: "rgba(43,35,38,.15)", color: C.bronze }}>
                  {fam.f}
                </h3>
                <ul>
                  {fam.items.map(([n, d]) => (
                    <li key={n} className="flex items-baseline justify-between border-b py-5" style={{ borderColor: "rgba(43,35,38,.1)" }}>
                      <span className="text-[22px]" style={{ ...serif, fontWeight: 400 }}>
                        {n}
                      </span>
                      <span className="text-[14px] opacity-60">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="institut" className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-3">
          {[
            ["Avant", "Un échange pour comprendre vos attentes et adapter le soin."],
            ["Pendant", "Un temps pour vous, sans précipitation, dans une cabine calme."],
            ["Après", "Des conseils simples pour prolonger les bienfaits à la maison."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-[200px_200px_24px_24px] p-10 pt-16 text-center" style={{ background: i === 1 ? C.powder : "#EFE2DB" }}>
              <p className="text-[44px] italic" style={{ ...serif, fontWeight: 300 }}>
                {t}
              </p>
              <p className="mx-auto mt-4 max-w-[26ch] text-[16px] leading-[1.6] opacity-75">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="rdv" className="px-6 pb-28 md:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-6 rounded-[32px] px-8 py-16 text-center" style={{ background: C.ink, color: C.pearl }}>
          <p className="text-[48px] leading-none italic md:text-[64px]" style={{ ...serif, fontWeight: 300 }}>
            Un moment rien qu&apos;à vous.
          </p>
          <a href="#" className="rounded-full px-7 py-4 text-[15px] font-semibold" style={{ background: C.pearl, color: C.ink }}>
            Prendre rendez-vous
          </a>
        </div>
      </section>
    </div>
  );
}
