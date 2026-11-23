"use client";

import { Cloud, SquarePlay, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "youtube", label: "YouTube", icon: SquarePlay },
  { key: "file", label: "Fichier", icon: Upload },
  { key: "link", label: "Lien", icon: Cloud },
] as const;
type Key = (typeof TABS)[number]["key"];

/** Choix de la source d'import. Les panneaux restent montés (un envoi en cours n'est jamais interrompu). */
export function ImportTabs(panels: Record<Key, ReactNode>) {
  const [tab, setTab] = useState<Key>("youtube");
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Source de la vidéo" className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-canvas p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`panel-${key}`}
            onClick={() => setTab(key)}
            className={cn(
              "flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2.5 text-small font-medium transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
              tab === key ? "bg-elevated text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            <Icon aria-hidden className={tab === key ? "text-primary-soft" : undefined} />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      {TABS.map(({ key }) => (
        <div key={key} role="tabpanel" id={`panel-${key}`} aria-labelledby={`tab-${key}`} hidden={tab !== key}>
          {panels[key]}
        </div>
      ))}
    </div>
  );
}
