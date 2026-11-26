/* Formats verticaux (Reels / stories) d’exemple, pour des entreprises fictives. */
import { OreePlate } from "./oree";
import { Wood } from "./atelier-sylve";
import { Pearl } from "./nacre";
import { Wheel } from "./la-meule";

const serif = { fontFamily: "var(--font-fraunces), Georgia, serif" } as const;
const cond = { fontFamily: "var(--font-archivo), sans-serif", fontStretch: "62%", fontWeight: 800 } as const;
const frame = "relative aspect-[9/16] w-[360px] overflow-hidden rounded-[18px]";

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="absolute inset-x-5 top-4 flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
          <span className="block h-full" style={{ width: i < value ? "100%" : i === value ? "45%" : "0%", background: color }} />
        </span>
      ))}
    </div>
  );
}

function Caption({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className="absolute inset-x-6 bottom-[16%] text-center text-[17px] leading-[1.5] font-semibold"
      style={{ fontFamily: "var(--font-manrope)" }}
    >
      <span className="box-decoration-clone px-2 py-0.5" style={{ background: light ? "rgba(255,255,255,.92)" : "rgba(0,0,0,.78)", color: light ? "#2B2326" : "#fff" }}>
        {children}
      </span>
    </p>
  );
}

export function Formats() {
  return (
    <div className="flex gap-8 bg-[#0B0E14] p-10">
      <div data-tile="oree" className={frame} style={{ background: "#1E2B23", color: "#F2EADC" }}>
        <Progress value={1} color="#F2EADC" />
        <OreePlate className="absolute top-[13%] left-1/2 w-[92%] -translate-x-1/2" idp="f1" />
        <p className="absolute inset-x-6 top-[62%] text-center text-[34px] leading-[1.02]" style={{ ...serif, fontWeight: 340 }}>
          3 nouveautés
          <br />
          <em className="italic" style={{ color: "#E7A57E" }}>cette semaine</em>
        </p>
        <Caption>Le velouté de courge revient à la carte.</Caption>
      </div>
      <div data-tile="sylve" className={frame} style={{ color: "#F4EEE6" }}>
        <Wood className="absolute inset-0 h-full w-full" vertical seed={9} tone="#A97B50" grain="#3E2715" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(28,27,25,.55), rgba(28,27,25,0) 40%, rgba(28,27,25,.65))" }} />
        <Progress value={0} color="#F4EEE6" />
        <p className="absolute inset-x-6 top-[10%] text-[64px] leading-[0.86] uppercase" style={cond}>
          Dans
          <br />
          l&apos;atelier
        </p>
        <p className="absolute top-[33%] left-6 text-[12px] font-semibold tracking-[0.2em] uppercase opacity-85">Épisode 2 — l&apos;escalier</p>
        <Caption>On commence par tracer le limon, au millimètre.</Caption>
      </div>
      <div data-tile="nacre" className={frame} style={{ background: "#F4ECE7", color: "#2B2326" }}>
        <Pearl className="absolute top-[8%] left-1/2 w-[86%] -translate-x-1/2" />
        <Progress value={2} color="#2B2326" />
        <p className="absolute inset-x-6 top-[60%] text-center text-[40px] leading-[0.98] italic" style={{ ...serif, fontWeight: 300 }}>
          Rituel éclat, en trois gestes
        </p>
        <Caption light>Geste 3 : masser du centre vers l&apos;extérieur.</Caption>
      </div>
      <div data-tile="meule" className={frame} style={{ background: "#F3D27A", color: "#3A2A1C" }}>
        <Progress value={1} color="#3A2A1C" />
        <p className="absolute inset-x-6 top-[10%] text-[42px] leading-[0.98]" style={{ ...serif, fontWeight: 520 }}>
          Comment servir un Mont d&apos;Or ?
        </p>
        <Wheel className="absolute top-[40%] left-1/2 w-[110%] -translate-x-1/2" idp="f4" />
        <Caption light>Au four, 20 minutes, avec un filet de vin blanc.</Caption>
      </div>
    </div>
  );
}
