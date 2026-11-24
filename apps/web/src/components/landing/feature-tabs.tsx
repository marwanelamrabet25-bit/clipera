"use client";

import { Check, Download, FileVideo } from "lucide-react";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ClipScene, Phone } from "./clip-scene";

/** Fonctionnalités réelles, chacune avec sa propre mise en scène. Onglets accessibles (flèches, Début, Fin). */
const SAMPLE = ["Parle", "à", "tes", "clients", "avant", "de", "dépenser"];

function CaptionsPanel() {
  const styles = [
    { name: "Classique", style: "classic" as const, hl: [] as number[] },
    { name: "Mot surligné", style: "classic" as const, hl: [3] },
    { name: "Moderne", style: "modern" as const, hl: [3] },
    { name: "Minimal", style: "minimal" as const, hl: [] as number[] },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {styles.map((s, i) => (
        <figure key={s.name}>
          <Phone>
            <ClipScene tone={(["violet", "amber", "teal", "rose"] as const)[i]} words={SAMPLE} highlight={s.hl} captionStyle={s.style} className="size-full" cycle={6} delay={i * 0.3} />
          </Phone>
          <figcaption className="mt-2.5 text-center text-[11px] text-muted sm:text-caption">{s.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function FramingPanel() {
  const modes = [
    { name: "Stable", frame: "left-[17%]", note: "Posé sur l'intervenant principal." },
    { name: "Suivi de l'intervenant", frame: "left-[54%]", note: "Passe à la personne qui parle." },
    { name: "Large", frame: "", note: "Toute la scène, fond flouté." },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {modes.map((m) => (
        <figure key={m.name}>
          <div className="relative overflow-hidden rounded-lg border border-line-strong">
            <ClipScene tone="amber" layout="duo" className="aspect-video" />
            {m.frame ? (
              <span aria-hidden className={cn("absolute inset-y-[3%] aspect-[9/16] rounded-[4px] border-2 border-primary-soft shadow-[0_0_0_999px_rgb(0_0_0/0.5)]", m.frame)} />
            ) : (
              <span aria-hidden className="absolute inset-y-[3%] left-1/2 aspect-[9/16] -translate-x-1/2 rounded-[4px] border-2 border-primary-soft" />
            )}
          </div>
          <figcaption className="mt-3">
            <span className="block text-small font-semibold text-fg">{m.name}</span>
            <span className="text-caption text-muted">{m.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function FormatsPanel() {
  const formats = [
    { name: "9:16", use: "TikTok, Reels, Shorts", cls: "aspect-[9/16] w-[26%]" },
    { name: "1:1", use: "Fil d'actualité", cls: "aspect-square w-[38%]" },
    { name: "16:9", use: "YouTube, LinkedIn", cls: "aspect-video w-[52%]" },
  ];
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5">
      {formats.map((f, i) => (
        <figure key={f.name} className={f.cls}>
          <div className="overflow-hidden rounded-lg border border-line-strong">
            <ClipScene tone={(["violet", "teal", "amber"] as const)[i]} layout={i === 2 ? "duo" : i === 1 ? "single" : "portrait"} className={f.cls.split(" ")[0]} />
          </div>
          <figcaption className="mt-2.5 text-center">
            <span className="block text-small font-semibold text-fg tabular-nums">{f.name}</span>
            <span className="text-[11px] text-muted sm:text-caption">{f.use}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ScorePanel() {
  const criteria: [string, number, string][] = [
    ["Accroche", 9.1, "ouvre sur une question"],
    ["Contexte", 8.4, "début de prise de parole"],
    ["Cohérence", 8.0, "phrases complètes et consécutives"],
    ["Conclusion", 8.5, "se termine sur une conclusion explicite"],
    ["Durée", 10, "41 s, idéal pour un format court"],
  ];
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-line-strong bg-canvas p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-small font-semibold text-fg">3. Recruter, c&apos;est racheter du temps</p>
          <p className="mt-1 text-caption text-muted tabular-nums">41 s · extrait de 20:30 à 21:11 · 1080×1920</p>
        </div>
        <span className="shrink-0 rounded-full bg-success-wash px-2.5 py-1 text-caption font-semibold text-success tabular-nums">84/100</span>
      </div>
      <p className="mt-4 text-caption font-medium text-muted">Pourquoi ce passage ?</p>
      <ul className="mt-2.5 flex flex-col gap-2.5">
        {criteria.map(([k, v, why]) => (
          <li key={k} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-caption">
            <span className="text-muted">{k}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-overlay">
              <span className="block h-full rounded-full bg-primary-soft" style={{ width: `${v * 10}%` }} />
            </span>
            <span className="text-right font-medium text-fg tabular-nums">{v}</span>
            <span className="col-start-2 col-end-4 -mt-1.5 text-[11px] text-subtle">{why}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExportPanel() {
  const files = ["clipera-clip-01.mp4", "clipera-clip-02.mp4", "clipera-clip-03.mp4", "clipera-clip-04.mp4"];
  return (
    <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <ul className="divide-y divide-line rounded-xl border border-line-strong bg-canvas">
        {files.map((f, i) => (
          <li key={f} className="flex items-center gap-3 px-4 py-3 text-small">
            <FileVideo className="size-4 shrink-0 text-primary-soft" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-fg">{f}</span>
            <span className="hidden text-caption text-muted tabular-nums sm:inline">1080×1920 · {[11, 14, 9, 12][i]} Mo</span>
            <Download className="size-4 shrink-0 text-muted" aria-hidden />
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-primary-line bg-primary-wash p-4 text-small sm:w-56">
        <p className="font-semibold text-fg">Tout d&apos;un coup</p>
        <p className="mt-1 text-caption text-muted">Une archive ZIP avec tous les clips d&apos;une génération, nommés dans l&apos;ordre.</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-caption font-medium text-primary-soft">
          <Download className="size-3.5" aria-hidden /> clipera-clips.zip
        </span>
      </div>
    </div>
  );
}

const TABS: { key: string; label: string; title: string; text: string; points: string[]; panel: ReactNode }[] = [
  {
    key: "sous-titres",
    label: "Sous-titres",
    title: "Lisibles sans le son.",
    text: "La plupart des vidéos courtes se regardent en silencieux. Les sous-titres sont calés sur chaque mot prononcé.",
    points: ["4 styles : Classique, Mot surligné, Moderne, Minimal", "Placés au-dessus des boutons des applications", "Typographie française respectée"],
    panel: <CaptionsPanel />,
  },
  {
    key: "cadrage",
    label: "Cadrage",
    title: "Le bon visage au centre.",
    text: "Clipera détecte les visages et place le cadre vertical sur la bonne personne, sans zoom permanent ni secousse.",
    points: ["Stable, Suivi de l'intervenant ou Large", "Aucune tête coupée", "Changements de caméra respectés"],
    panel: <FramingPanel />,
  },
  {
    key: "formats",
    label: "Formats",
    title: "Un clip, trois formats.",
    text: "Vertical pour TikTok, Reels et Shorts ; carré pour le fil d'actualité ; horizontal pour YouTube et LinkedIn.",
    points: ["9:16, 1:1 et 16:9", "Jusqu'en 1080p selon l'offre", "Jamais agrandi au-delà de la qualité d'origine"],
    panel: <FormatsPanel />,
  },
  {
    key: "note",
    label: "Note",
    title: "Tu sais quoi publier d'abord.",
    text: "Chaque clip a une note sur 100 et le détail de ses critères. Elle compare les passages entre eux : ce n'est pas une prédiction de vues.",
    points: ["Accroche, contexte, cohérence, conclusion, durée", "Raison écrite pour chaque critère", "Alertes si un passage a un défaut"],
    panel: <ScorePanel />,
  },
  {
    key: "export",
    label: "Export",
    title: "Des fichiers, pas un abonnement à une plateforme.",
    text: "Tu télécharges des MP4 et tu les publies où tu veux. Clipera ne demande aucun accès à tes comptes.",
    points: ["MP4 un par un ou archive ZIP", "Import : fichier, lien Google Drive ou Dropbox", "Tes clips restent dans ta bibliothèque"],
    panel: <ExportPanel />,
  },
];

export function FeatureTabs() {
  const [active, setActive] = useState(0);
  const base = useId();
  const tab = TABS[active];

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const last = TABS.length - 1;
    const next = e.key === "ArrowRight" ? (active + 1) % TABS.length : e.key === "ArrowLeft" ? (active + last) % TABS.length
      : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`${base}-tab-${next}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Fonctionnalités"
        className="-mx-4 flex gap-1 overflow-x-auto px-4 [mask-image:linear-gradient(90deg,#000_85%,transparent)] [scrollbar-width:none] sm:mx-0 sm:inline-flex sm:rounded-full sm:border sm:border-line sm:bg-canvas sm:p-1 sm:[mask-image:none]"
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            id={`${base}-tab-${i}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`${base}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-small font-medium transition-colors",
              i === active ? "bg-elevated text-fg ring-1 ring-primary-line" : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${active}`}
        className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-center lg:gap-16"
      >
        <div key={tab.key} className="animate-[fadein_.35s_ease-out]">
          <h3 className="text-[1.75rem] leading-tight font-bold tracking-[-0.02em]">{tab.title}</h3>
          <p className="mt-3 text-body text-muted">{tab.text}</p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {tab.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-small text-fg">
                <Check className="mt-0.5 size-4 shrink-0 text-primary-soft" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div key={`${tab.key}-panel`} className="animate-[fadein_.35s_ease-out]">
          {tab.panel}
          <p className="mt-5 text-center text-caption text-subtle">Démonstration · images d&apos;illustration</p>
        </div>
      </div>
    </div>
  );
}
