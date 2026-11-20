import { Check, X } from "lucide-react";
import { PIPELINE_STEPS, stepStates, type JobStatus } from "@/lib/jobs";
import { cn } from "@/lib/cn";

/**
 * Suivi du traitement : affiche l'étape réelle en cours.
 * Volontairement sans pourcentage : on ne montre que ce que l'on sait.
 */
export function PipelineSteps({ status, failedAt }: { status: JobStatus | "upload"; failedAt?: JobStatus }) {
  const states = stepStates(status, failedAt);
  return (
    <ol className="flex flex-col gap-0" aria-label="Étapes du traitement">
      {PIPELINE_STEPS.map((step, i) => {
        const s = states[i];
        const last = i === PIPELINE_STEPS.length - 1;
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0" aria-current={s === "current" ? "step" : undefined}>
            {!last && (
              <span
                aria-hidden
                className={cn("absolute top-8 left-[15px] h-[calc(100%-2rem)] w-px", s === "done" ? "bg-primary" : "bg-line-strong")}
              />
            )}
            <span
              className={cn(
                "relative grid size-8 shrink-0 place-items-center rounded-full border text-caption font-semibold",
                s === "done" && "border-primary bg-primary text-on-primary",
                s === "current" && "border-primary-soft bg-primary-wash text-primary-soft",
                s === "pending" && "border-line-strong bg-surface text-subtle",
                s === "error" && "border-danger/50 bg-danger-wash text-danger",
              )}
            >
              {s === "done" ? <Check className="size-4" aria-hidden /> : s === "error" ? <X className="size-4" aria-hidden /> : i + 1}
              {s === "current" && (
                <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-primary-soft/60 [animation-duration:2s]" />
              )}
            </span>
            <div className="pt-1">
              <p className={cn("text-small font-medium", s === "pending" ? "text-subtle" : "text-fg")}>
                {step.label}
                <span className="sr-only">
                  {s === "done" ? " — terminé" : s === "current" ? " — en cours" : s === "error" ? " — échec" : " — à venir"}
                </span>
              </p>
              <p className="text-caption text-subtle">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
