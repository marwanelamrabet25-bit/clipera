import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";
import { CONTENT_TYPE_LABELS, CRITERIA_LABELS, clipDuration, type ClipLinks, type ClipRow, type ScoreDetails } from "@/lib/clips";
import { formatSize } from "@/lib/video-status";

const ASPECT: Record<string, string> = { "9:16": "aspect-[9/16]", "1:1": "aspect-square", "16:9": "aspect-video" };

function aspectOf(c: ClipRow) {
  if (!c.width || !c.height) return "9:16";
  const r = c.width / c.height;
  return r < 0.8 ? "9:16" : r > 1.2 ? "16:9" : "1:1";
}

function timecode(s: number) {
  const t = Math.floor(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/** Un clip livré : aperçu, note expliquée, téléchargement. */
export function ClipCard({ clip, links, actions }: { clip: ClipRow; links: ClipLinks; actions?: ReactNode }) {
  const details = (clip.score_details ?? {}) as ScoreDetails;
  // Ordre de lecture fixe (le stockage JSON ne conserve pas l'ordre des clés).
  const order = Object.keys(CRITERIA_LABELS);
  const criteria = Object.entries(details.criteria ?? {}).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
  return (
    <Card className="flex flex-col overflow-hidden" data-testid="clip-card">
      <div className={`${ASPECT[aspectOf(clip)]} max-h-[460px] w-full bg-canvas`}>
        {links.video ? (
          <video
            src={links.video}
            poster={links.thumbnail ?? undefined}
            controls
            playsInline
            preload="none"
            className="size-full object-contain"
            aria-label={`Aperçu du clip ${clip.rank}`}
          />
        ) : (
          <div className="grid size-full place-items-center p-6 text-center text-small text-subtle">
            Aperçu indisponible (stockage non configuré).
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-small font-semibold leading-snug">
            {clip.rank}. {clip.title ?? "Clip sans titre"}
          </h3>
          {clip.score_total !== null && (
            <Badge tone={clip.score_total >= 75 ? "success" : "primary"} className="shrink-0 tabular-nums">
              {clip.score_total}/100
            </Badge>
          )}
        </div>
        <p className="text-caption text-subtle tabular-nums">
          {clipDuration(clip)} · extrait de {timecode(clip.start_seconds)} à {timecode(clip.end_seconds)}
          {clip.width && clip.height ? ` · ${clip.width}×${clip.height}` : ""}
          {clip.size_bytes ? ` · ${formatSize(clip.size_bytes)}` : ""}
        </p>
        {(details.topic || details.content_type) && (
          <p className="flex flex-wrap gap-1.5 text-caption" data-testid="clip-topic">
            {details.content_type && CONTENT_TYPE_LABELS[details.content_type] && (
              <span className="rounded-full border border-line px-2 py-0.5 text-muted">
                {CONTENT_TYPE_LABELS[details.content_type]}
              </span>
            )}
            {details.topic && (
              <span className="rounded-full border border-line px-2 py-0.5 text-muted">Sujet : {details.topic}</span>
            )}
          </p>
        )}
        {clip.transcript_excerpt && (
          <p className="line-clamp-3 text-caption text-muted">« {clip.transcript_excerpt} »</p>
        )}
        {criteria.length > 0 && (
          <details className="text-caption">
            <summary className="cursor-pointer text-muted hover:text-fg">Pourquoi ce passage ?</summary>
            <ul className="mt-2 flex flex-col gap-1.5">
              {criteria.map(([k, v]) => (
                <li key={k} className="flex gap-2">
                  <span className="w-20 shrink-0 text-subtle">{CRITERIA_LABELS[k] ?? k}</span>
                  <span className="w-10 shrink-0 font-medium tabular-nums">{Math.round(v * 10) / 10}/10</span>
                  <span className="text-muted">{details.reasons?.[k] ?? ""}</span>
                </li>
              ))}
              {(details.flags ?? []).map((f) => (
                <li key={f} className="text-warning">
                  ⚠ {f}
                </li>
              ))}
            </ul>
          </details>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          {links.download && (
            <a href={links.download} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              <Download /> Télécharger le MP4
            </a>
          )}
          {actions}
        </div>
      </div>
    </Card>
  );
}
