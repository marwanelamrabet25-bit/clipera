"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "h-10 w-full rounded-md border bg-canvas px-3 text-small text-fg placeholder:text-subtle " +
  "transition-colors duration-150 hover:border-line-strong focus-visible:border-primary-soft " +
  "disabled:cursor-not-allowed disabled:opacity-50";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
};

/** Champ texte avec libellé, aide et message d'erreur reliés pour les lecteurs d'écran. */
export function Field({ label, hint, error, className, id, ...props }: FieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-small font-medium text-fg">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(control, error ? "border-danger/60" : "border-line", className)}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-caption text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
};

/** Interrupteur on/off pour les options de montage (sous-titres, musique, zooms…). */
export function Switch({ label, description, checked, onCheckedChange, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <label htmlFor={id} className="text-small font-medium text-fg">
          {label}
        </label>
        {description && <p className="text-caption text-subtle">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors duration-150",
          "disabled:opacity-45",
          checked ? "border-primary bg-primary" : "border-line-strong bg-overlay",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-4.5 rounded-full bg-fg shadow transition-transform duration-200 ease-out-soft",
            checked ? "translate-x-[18px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
}
