"use client";

import { Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { generateClips, type GenerateState } from "@/app/app/projets/[id]/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { CAPTION_STYLES, FORMATS } from "@/lib/jobs";

type Props = {
  projectId: string;
  videoId: string;
  maxClips: number;
  exportHeight: number;
  watermark: boolean;
  quotaNote: string;
};

/** Options de génération. Les contrôles définitifs sont faits côté base (create_clip_job). */
export function GenerateForm({ projectId, videoId, maxClips, exportHeight, watermark, quotaNote }: Props) {
  const [state, action, pending] = useActionState<GenerateState, FormData>(generateClips, { status: "idle" });
  // Une clé par affichage du formulaire : un double clic ne lance jamais deux générations.
  const [key] = useState(() => crypto.randomUUID());
  const [count, setCount] = useState(Math.min(3, maxClips));
  const [format, setFormat] = useState<string>("9:16");
  const [captions, setCaptions] = useState(true);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="video_id" value={videoId} />
      <input type="hidden" name="idempotency_key" value={key} />
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="captions" value={captions ? "on" : "off"} />

      <div>
        <label htmlFor="requested_clips" className="text-small font-medium">
          Nombre de clips souhaité
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="requested_clips"
            name="requested_clips"
            type="range"
            min={1}
            max={maxClips}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="w-8 text-right text-small font-semibold tabular-nums">{count}</span>
        </div>
        <p className="mt-1.5 text-caption text-subtle">
          C&apos;est un maximum : si la vidéo contient moins de bons passages, tu recevras moins de clips plutôt que des
          clips médiocres.
        </p>
      </div>

      <fieldset>
        <legend className="text-small font-medium">Format</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {FORMATS.map((f) => (
            <label
              key={f.value}
              className={cn(
                "cursor-pointer rounded-md border px-3 py-2.5 transition-colors",
                format === f.value ? "border-primary bg-primary-wash" : "border-line-strong hover:border-primary-line",
              )}
            >
              <input
                type="radio"
                name="format_choice"
                value={f.value}
                checked={format === f.value}
                onChange={() => setFormat(f.value)}
                className="sr-only"
              />
              <span className="block text-small font-medium">{f.label}</span>
              <span className="block text-caption text-subtle">{f.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <Switch
          label="Sous-titres"
          description="Synchronisés au mot près, en bas de l'image."
          checked={captions}
          onCheckedChange={setCaptions}
        />
        {captions && (
          <div>
            <label htmlFor="caption_style" className="text-caption text-subtle">
              Style des sous-titres
            </label>
            <select
              id="caption_style"
              name="caption_style"
              defaultValue="highlight"
              className="mt-1 h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-small"
            >
              {CAPTION_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="text-caption text-subtle">
        Export {exportHeight}p maximum (jamais au-dessus de la qualité de ta vidéo)
        {watermark ? " · filigrane Clipera inclus avec l'offre Free" : ""} · {quotaNote}
      </p>

      {state.status === "error" && (
        <Alert tone="danger" title="Génération non lancée">
          {state.message}
        </Alert>
      )}

      <Button type="submit" loading={pending} className="self-start">
        <Sparkles /> Générer les clips
      </Button>
    </form>
  );
}
