import Link from "next/link";
import { brand } from "@/config/site";

/** Bandeau signalant qu'il s'agit d'un projet de démonstration (entreprise fictive). */
export function DemoBanner({ slug, name }: { slug: string; name: string }) {
  return (
    <div
      data-demo-banner
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-[4px] border border-white/15 bg-[#050608]/92 px-4 py-3 text-[13px] leading-snug text-[#F7F9FC] shadow-2xl backdrop-blur-md"
      style={{ fontFamily: "var(--font-manrope)" }}
    >
      <p>
        <strong className="font-semibold">Projet de démonstration</strong> — {name} est une entreprise fictive, imaginée par{" "}
        {brand.name}.
      </p>
      <Link
        href={`/realisations/${slug}`}
        className="shrink-0 rounded-[3px] bg-[#087BFF] px-3 py-2 font-semibold text-[#050608] hover:bg-[#00A8FF]"
      >
        La fiche projet
      </Link>
    </div>
  );
}
