import Image from "next/image";
import type { CSSProperties } from "react";
import { BrowserFrame, PhoneFrame } from "./frames";

/** 01 — Sites : de la structure (maquette filaire) au site fini. La capture défile au survol. */
export function WebVisual() {
  return (
    <div className="group relative pt-10 pl-6 sm:pt-14 sm:pl-14">
      {/* Maquette filaire en arrière-plan */}
      <div data-reveal="fade" aria-hidden className="absolute top-0 left-0 w-[78%] rounded-[10px] border border-dashed border-line-strong p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="h-2 w-16 rounded-full bg-paper/15" />
          <span className="flex gap-2">
            <span className="h-2 w-8 rounded-full bg-paper/10" />
            <span className="h-2 w-8 rounded-full bg-paper/10" />
            <span className="h-2 w-10 rounded-full bg-electric/50" />
          </span>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-3">
          <div className="col-span-3 space-y-2">
            <span className="block h-4 w-[90%] rounded-sm bg-paper/12" />
            <span className="block h-4 w-[70%] rounded-sm bg-paper/12" />
            <span className="block h-2 w-[60%] rounded-full bg-paper/8" />
          </div>
          <div className="col-span-2 aspect-[4/5] rounded-sm border border-line-strong" />
        </div>
        <p className="t-label mt-4 text-slate">Structure</p>
      </div>
      <div data-reveal style={{ "--d": 150 } as CSSProperties} className="relative">
        <BrowserFrame
          src="/projects/atelier-sylve/full.png"
          alt="Exemple de maquette de site vitrine pour une menuiserie fictive : la page complète défile au survol"
          label="Exemple de maquette — menuiserie (fictive)"
          sizes="(min-width: 1024px) 52vw, 92vw"
          scrollOnHover
        />
      </div>
      <div data-reveal style={{ "--d": 300 } as CSSProperties} className="absolute -right-2 -bottom-10 w-[26%] sm:right-6 sm:w-[22%]">
        <PhoneFrame src="/projects/atelier-sylve/mobile.png" alt="Version mobile de l'exemple de maquette pour une menuiserie fictive" sizes="(min-width: 1024px) 12vw, 26vw" />
      </div>
      <p className="t-label mt-14 hidden max-w-[60%] text-slate lg:block">Survolez l&apos;écran pour parcourir la page</p>
    </div>
  );
}

const feed = [
  "/projects/oree/post-1.png",
  "/projects/la-meule/post-1.png",
  "/projects/oree/post-2.png",
  "/projects/la-meule/post-3.png",
  "/projects/oree/post-4.png",
  "/projects/la-meule/post-2.png",
  "/projects/oree/post-5.png",
  "/projects/la-meule/post-6.png",
  "/projects/la-meule/post-5.png",
];

const plan: { day: string; items: { t: string; c: string }[] }[] = [
  { day: "Lun", items: [{ t: "Coulisses", c: "bg-paper/10" }] },
  { day: "Mar", items: [{ t: "Nouveauté", c: "bg-electric/80 text-ink" }] },
  { day: "Mer", items: [] },
  { day: "Jeu", items: [{ t: "Reel", c: "bg-glow/80 text-ink" }] },
  { day: "Ven", items: [{ t: "Offre", c: "bg-paper/10" }] },
  { day: "Sam", items: [{ t: "Story", c: "bg-paper/10" }] },
  { day: "Dim", items: [] },
];

/** 02 — Réseaux sociaux : un fil cohérent + un calendrier de publication. */
export function SocialVisual() {
  return (
    <div className="relative grid grid-cols-12 items-end gap-4">
      <div data-reveal className="col-span-7 sm:col-span-6">
        <div className="rounded-[2rem] border-[5px] border-[#1b2230] bg-[#0d1118] p-3 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)] ring-1 ring-paper/10">
          <div className="flex items-center gap-3 px-1 pt-3 pb-4">
            <span className="size-9 rounded-full bg-[conic-gradient(from_200deg,#087BFF,#00A8FF,#F7F9FC,#087BFF)] p-[2px]">
              <span className="block size-full rounded-full bg-[#1E2B23]" />
            </span>
            <span>
              <span className="block text-[0.8rem] font-semibold text-paper">Fil d&apos;actualité</span>
              <span className="block font-mono text-[0.625rem] text-slate">exemples fictifs</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-[3px] overflow-hidden rounded-[0.9rem]">
            {feed.map((src, i) => (
              <div key={src} className="relative aspect-square">
                <Image src={src} alt="" fill sizes="(min-width: 1024px) 9vw, 22vw" className="object-cover" style={{ transitionDelay: `${i * 40}ms` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div data-reveal style={{ "--d": 200 } as CSSProperties} className="col-span-5 mb-8 sm:col-span-6 sm:mb-16">
        <div className="rounded-[8px] border border-line bg-ink-2 p-3 shadow-2xl shadow-black/60 sm:p-5">
          <p className="t-label flex items-center justify-between gap-2 text-mist">
            <span>
              Calendrier<span className="hidden xl:inline"> éditorial</span>
            </span>
            <span className="hidden text-slate xl:inline">sem. 46</span>
          </p>
          <ul className="mt-4 grid gap-1.5">
            {plan.map((d) => (
              <li key={d.day} className="grid grid-cols-[2.2rem_1fr] items-center gap-2 border-t border-line pt-1.5">
                <span className="font-mono text-[0.6875rem] text-slate">{d.day}</span>
                <span className="flex min-h-6 gap-1.5">
                  {d.items.map((it) => (
                    <span key={it.t} className={`rounded-[3px] px-2 py-1 text-[0.6875rem] leading-none font-semibold ${it.c}`}>
                      {it.t}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const reels = [
  { src: "/projects/formats/reel-oree.png", alt: "Exemple de format vertical (entreprise fictive) : annonce de la nouvelle carte d'un restaurant", t: "0:12" },
  { src: "/projects/formats/reel-sylve.png", alt: "Exemple de format vertical (entreprise fictive) : coulisses d'un atelier de menuiserie, sous-titré", t: "0:28" },
  { src: "/projects/formats/reel-nacre.png", alt: "Exemple de format vertical (entreprise fictive) : rituel de soin en trois gestes", t: "0:20" },
  { src: "/projects/formats/reel-meule.png", alt: "Exemple de format vertical (entreprise fictive) : conseil de dégustation d'une fromagerie", t: "0:15" },
];

/** 03 — Contenus : formats verticaux + timeline de montage. */
export function ContentVisual() {
  return (
    <div className="relative">
      <div className="grid grid-cols-4 items-start gap-2 sm:gap-4">
        {reels.map((r, i) => (
          <figure key={r.src} data-reveal style={{ "--d": i * 110, marginTop: i % 2 ? "2.5rem" : 0 } as CSSProperties} className="relative">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[10px] ring-1 ring-paper/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
              <Image src={r.src} alt={r.alt} fill sizes="(min-width: 1024px) 12vw, 23vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 flex justify-between font-mono text-[0.625rem] text-slate">
              <span>9:16</span>
              <span>{r.t}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {/* Timeline de montage */}
      <div data-reveal="fade" className="mt-8 rounded-[6px] border border-line bg-ink-2 p-3 sm:p-4" aria-hidden>
        <div className="flex justify-between font-mono text-[0.625rem] text-slate">
          <span>00:00</span>
          <span>00:05</span>
          <span>00:10</span>
          <span>00:15</span>
        </div>
        <div className="relative mt-2 grid gap-1.5">
          <div className="flex h-5 gap-1">
            <span className="w-[28%] rounded-[2px] bg-electric/70" />
            <span className="w-[22%] rounded-[2px] bg-electric/45" />
            <span className="w-[34%] rounded-[2px] bg-electric/70" />
            <span className="w-[16%] rounded-[2px] bg-electric/45" />
          </div>
          <div className="flex h-3 gap-1">
            <span className="ml-[8%] w-[30%] rounded-[2px] bg-paper/25" />
            <span className="ml-[12%] w-[26%] rounded-[2px] bg-paper/25" />
          </div>
          <div className="h-3 rounded-[2px] bg-[repeating-linear-gradient(90deg,rgba(183,192,206,.35)_0_2px,transparent_2px_5px)] opacity-60" />
          <span className="playhead absolute -top-1 -bottom-1 w-px bg-glow shadow-[0_0_8px_#00A8FF]" />
        </div>
      </div>
    </div>
  );
}
