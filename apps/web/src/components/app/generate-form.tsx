"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { generateClips, type GenerateState } from "@/app/app/projets/[id]/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { CAPTION_STYLES, FORMATS, FRAMINGS } from "@/lib/jobs";

type Props = {
  projectId: string;
  videoId: string;
  maxClips: number;
  exportHeight: number;
  watermark: boolean;
  quotaNote: string;
  defaultFraming?: string;
};

/** Options de génération. Les contrôles définitifs sont faits côté base (create_clip_job). */
export function GenerateForm({
  projectId,
  videoId,
  maxClips,
  exportHeight,
  watermark,
  quotaNote,
  defaultFraming = "stable",
}: Props) {
  const [state, action, pending] = useActionState<GenerateState, FormData>(generateClips, { status: "idle" });
  // Une clé par affichage du formulaire : un double clic ne lance jamais deux générations.
  const [key] = useState(() => crypto.randomUUID());
  // « Auto » : le moteur choisit selon la durée et la richesse de la vidéo, jusqu'au maximum de l'offre.
  const [mode, setMode] = useState<"auto" | number>("auto");
  const count = mode === "auto" ? maxClips : mode;
  const [format, setFormat] = useState<string>("9:16");
  const [captions, setCaptions] = useState(true);
  const [framing, setFraming] = useState<string>(defaultFraming);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="video_id" value={videoId} />
      <input type="hidden" name="idempotency_key" value={key} />
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="captions" value={captions ? "on" : "off"} />
      <input type="hidden" name="framing" value={framing} />

      <input type="hidden" name="requested_clips" value={count} />
      <input type="hidden" name="clip_mode" value={mode === "auto" ? "auto" : "fixed"} />
      <fieldset>
        <legend className="text-small font-medium">Nombre de clips</legend>
        <div className="mt-2 grid grid-cols-5 gap-1 rounded-lg border border-line bg-canvas p-1" data-testid="clip-count">
          {(["auto", 3, 5, 7, 10] as const).map((m) => {
            const locked = m !== "auto" && m > maxClips;
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                disabled={locked}
                onClick={() => setMode(m)}
                title={locked ? `Jusqu'à ${maxClips} clips avec ton offre` : undefined}
                className={cn(
                  "flex h-10 items-center justify-center gap-1 rounded-md text-small font-medium tabular-nums transition-colors",
                  active ? "bg-elevated text-fg shadow-sm ring-1 ring-primary-line" : "text-muted hover:text-fg",
                  locked && "cursor-not-allowed opacity-45 hover:text-muted",
                )}
              >
                {m === "auto" ? "Auto" : m}
                {locked && <Lock className="size-3" aria-hidden />}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-caption text-subtle">
          {mode === "auto"
            ? `Clipera choisit selon la durée et la richesse de ta vidéo (environ 1 clip pour 6 min de parole), jusqu'à ${maxClips}.`
            : `Jusqu'à ${mode} clips, sur des sujets différents. S'il y a moins de bons passages, tu en recevras moins : jamais de clip médiocre pour faire le nombre.`}
          {maxClips < 10 && (
            <>
              {" "}
              <Link href="/app/abonnement" className="text-primary-soft hover:underline">
                Jusqu&apos;à 10 clips avec les offres payantes.
              </Link>
            </>
          )}
        </p>
      </fieldset>

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

      {format !== "16:9" && (
        <fieldset>
          <legend className="text-small font-medium">Cadrage</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {FRAMINGS.map((f) => (
              <label
                key={f.value}
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-2.5 transition-colors",
                  framing === f.value ? "border-primary bg-primary-wash" : "border-line-strong hover:border-primary-line",
                )}
              >
                <input
                  type="radio"
                  name="framing_choice"
                  value={f.value}
                  checked={framing === f.value}
                  onChange={() => setFraming(f.value)}
                  className="sr-only"
                />
                <span className="block text-small font-medium">{f.label}</span>
                <span className="block text-caption text-subtle">{f.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

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
          {state.upgrade && (
            <>
              {" "}
              <a href="/app/abonnement" className="font-medium text-primary-soft underline">
                Voir les offres
              </a>
            </>
          )}
        </Alert>
      )}

      <Button type="submit" loading={pending} className="self-start">
        <Sparkles /> Générer les clips
      </Button>
    </form>
  );
}
