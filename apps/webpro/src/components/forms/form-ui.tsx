"use client";

import Link from "next/link";
import { forwardRef, type ReactNode } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { contact } from "@/config/site";

export const inputCls =
  "peer block w-full rounded-[3px] border border-line-strong bg-ink-2 px-4 py-3.5 text-[1rem] text-paper placeholder:text-slate transition-[border-color,background-color] duration-200 hover:border-paper/35 focus:border-electric focus:bg-ink-3 focus:outline-none aria-[invalid=true]:border-[#ff6b6b]";

export function FieldShell({
  id,
  label,
  optional,
  error,
  children,
  className,
  hint,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  hint?: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[0.9rem] font-medium text-paper">
        <span>
          {label}
          {!optional && (
            <span className="text-electric" aria-hidden>
              {" "}
              *
            </span>
          )}
        </span>
        {optional && <span className="t-label text-[0.65rem] text-slate">Facultatif</span>}
        {hint}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#ff8a8a]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Pièges à robots : champ invisible + horodatage posé au chargement. */
export const BotTraps = forwardRef<HTMLInputElement>(function BotTraps(_props, ref) {
  return (
    <>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website-trap">Site web (laisser vide)</label>
        <input id="website-trap" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={ref} type="hidden" name="startedAt" defaultValue="" />
    </>
  );
});

export function ConsentField({ error, defaultChecked, text }: { error?: string; defaultChecked?: boolean; text: ReactNode }) {
  return (
    <div className="sm:col-span-2">
      <label className="flex cursor-pointer items-start gap-3.5 text-[0.92rem] leading-relaxed text-mist">
        <input
          type="checkbox"
          name="consent"
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-error" : undefined}
          className="mt-1 size-[1.15rem] shrink-0 cursor-pointer accent-[#087BFF]"
        />
        <span>
          {text} En savoir plus :{" "}
          <Link href="/politique-confidentialite" className="link-inline">
            politique de confidentialité
          </Link>
          .
          <span className="text-electric" aria-hidden>
            {" "}
            *
          </span>
        </span>
      </label>
      {error && (
        <p id="consent-error" className="mt-2 text-sm text-[#ff8a8a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitRow({ pending, label }: { pending: boolean; label: string }) {
  return (
    <>
      <div className="mt-10 flex flex-col-reverse items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
        <p id="form-note" className="text-sm text-slate">
          <span className="text-electric">*</span> Champs obligatoires.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="group/btn inline-flex h-14 items-center justify-between gap-5 rounded-[3px] bg-electric pr-4 pl-6 font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-glow active:scale-[0.985] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Envoi en cours…" : label}
          {pending ? (
            <LoaderCircle className="size-[1.1rem] animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-[1.1rem] transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden />
          )}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? "Envoi du formulaire en cours." : ""}
      </p>
    </>
  );
}

/** Message affiché quand l'envoi en ligne n'est pas possible : le visiteur garde son message. */
export const DeliveryAlert = forwardRef<HTMLDivElement, { status: "unconfigured" | "failed" | "limited"; mailto: string }>(
  function DeliveryAlert({ status, mailto }, ref) {
    return (
      <div ref={ref} tabIndex={-1} role="alert" className="mb-10 border-l-2 border-electric bg-ink-3 p-6 outline-none">
        <p className="font-semibold text-paper">
          {status === "limited"
            ? "Plusieurs messages ont été envoyés depuis votre connexion en peu de temps."
            : status === "unconfigured"
              ? "L'envoi en ligne n'est pas encore activé sur ce site."
              : "Votre message n'a pas pu être envoyé pour le moment."}
        </p>
        <p className="mt-2 text-mist">
          Votre demande n&apos;est pas perdue : envoyez-la directement depuis votre messagerie, ou appelez-nous au{" "}
          <a href={`tel:${contact.phoneE164}`} className="link-inline whitespace-nowrap">
            {contact.phoneDisplay}
          </a>
          .
        </p>
        <a
          href={mailto}
          className="mt-5 inline-flex h-11 items-center gap-3 rounded-[3px] bg-paper px-4 font-semibold text-ink transition-colors hover:bg-glow"
        >
          Ouvrir ma messagerie avec ce message <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
    );
  },
);

export const SuccessPanel = forwardRef<HTMLDivElement, { title: string; children: ReactNode }>(function SuccessPanel({ title, children }, ref) {
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-[6px] border border-line bg-ink-2 p-8 outline-none md:p-12">
      <span className="grid size-12 place-items-center rounded-full bg-electric text-ink">
        <Check className="size-6" aria-hidden />
      </span>
      <h2 className="mt-8 text-[2rem] leading-tight font-bold tracking-[-0.035em] text-paper">{title}</h2>
      <div className="mt-4 max-w-[48ch] text-mist">{children}</div>
    </div>
  );
});

export function buildMailto(subject: string, lines: string[]) {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
