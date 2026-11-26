"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { sendContact, type ContactState } from "@/app/(site)/contact/actions";
import { budgetRanges } from "@/config/pricing";
import { contact } from "@/config/site";
import { MESSAGE_MAX, readValues, serviceOptions, validate, type ContactErrors, type Field } from "@/lib/contact-schema";
import { cn } from "@/lib/cn";

const initial: ContactState = { status: "idle" };

const inputCls =
  "peer block w-full rounded-[3px] border border-line-strong bg-ink-2 px-4 py-3.5 text-[1rem] text-paper placeholder:text-slate transition-[border-color,background-color] duration-200 hover:border-paper/35 focus:border-electric focus:bg-ink-3 focus:outline-none aria-[invalid=true]:border-[#ff6b6b]";

function FieldShell({
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
          {!optional && <span className="text-electric" aria-hidden> *</span>}
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

function mailtoFallback(v: ContactState["values"]) {
  if (!v) return `mailto:${contact.email}`;
  const subject = `Demande de contact — ${v.service ?? ""}`;
  const body = [
    `Nom : ${v.firstName ?? ""} ${v.lastName ?? ""}`,
    `Entreprise : ${v.company || "—"}`,
    `Email : ${v.email ?? ""}`,
    `Téléphone : ${v.phone || "—"}`,
    `Prestation : ${v.service ?? ""}`,
    `Budget : ${v.budget || "Non précisé"}`,
    "",
    v.message ?? "",
  ].join("\n");
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);
  const [clientErrors, setClientErrors] = useState<ContactErrors>({});
  const [messageLength, setMessageLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // Après une réponse du serveur : focus sur le message d'état ou le premier champ en erreur.
  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "invalid" && state.errors) {
      const first = Object.keys(state.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    } else {
      statusRef.current?.focus();
    }
  }, [state]);

  const errors: ContactErrors = { ...(state.status === "invalid" ? state.errors : {}), ...clientErrors };
  const v = state.values ?? {};

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const errs = validate(readValues((k: Field) => fd.get(k)));
    setClientErrors(errs);
    if (Object.keys(errs).length) {
      e.preventDefault();
      const first = Object.keys(errs)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  };

  const clearError = (k: Field) => {
    if (clientErrors[k])
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
  };

  const a11y = (k: Field) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
    onInput: () => clearError(k),
  });

  if (state.status === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-[6px] border border-line bg-ink-2 p-8 outline-none md:p-12">
        <span className="grid size-12 place-items-center rounded-full bg-electric text-ink">
          <Check className="size-6" aria-hidden />
        </span>
        <h2 className="mt-8 text-[2rem] leading-tight font-bold tracking-[-0.035em] text-paper">Merci, votre message est bien parti.</h2>
        <p className="mt-4 max-w-[46ch] text-mist">
          Nous l&apos;avons bien reçu et revenons vers vous pour échanger sur votre projet. Pour toute urgence, vous pouvez aussi
          appeler le{" "}
          <a href={`tel:${contact.phoneE164}`} className="link-inline whitespace-nowrap">
            {contact.phoneDisplay}
          </a>
          .
        </p>
        <Link href="/realisations" className="mt-10 inline-flex items-center gap-2 font-semibold text-paper hover:text-glow">
          En attendant, découvrir nos réalisations <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} noValidate className="relative" aria-describedby="form-note">
      {(state.status === "unconfigured" || state.status === "failed" || state.status === "limited") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="mb-10 border-l-2 border-electric bg-ink-3 p-6 outline-none">
          <p className="font-semibold text-paper">
            {state.status === "limited"
              ? "Plusieurs messages ont été envoyés depuis votre connexion en peu de temps."
              : state.status === "unconfigured"
                ? "L'envoi en ligne n'est pas encore activé sur ce site."
                : "Votre message n'a pas pu être envoyé pour le moment."}
          </p>
          <p className="mt-2 text-mist">
            Votre message n&apos;est pas perdu : envoyez-le directement depuis votre messagerie, ou appelez-nous au{" "}
            <a href={`tel:${contact.phoneE164}`} className="link-inline whitespace-nowrap">
              {contact.phoneDisplay}
            </a>
            .
          </p>
          <a
            href={mailtoFallback(state.values)}
            className="mt-5 inline-flex h-11 items-center gap-3 rounded-[3px] bg-paper px-4 font-semibold text-ink transition-colors hover:bg-glow"
          >
            Ouvrir ma messagerie avec ce message <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
      )}

      {/* Pièges à robots : invisibles pour les visiteurs et les lecteurs d'écran */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Site web (laisser vide)</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2">
        <FieldShell id="firstName" label="Prénom" error={errors.firstName}>
          <input id="firstName" name="firstName" autoComplete="given-name" defaultValue={v.firstName} maxLength={80} className={inputCls} {...a11y("firstName")} />
        </FieldShell>
        <FieldShell id="lastName" label="Nom" error={errors.lastName}>
          <input id="lastName" name="lastName" autoComplete="family-name" defaultValue={v.lastName} maxLength={80} className={inputCls} {...a11y("lastName")} />
        </FieldShell>
        <FieldShell id="company" label="Entreprise" optional error={errors.company} className="sm:col-span-2">
          <input id="company" name="company" autoComplete="organization" defaultValue={v.company} maxLength={120} placeholder="Nom de votre entreprise ou activité" className={inputCls} {...a11y("company")} />
        </FieldShell>
        <FieldShell id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={v.email} maxLength={160} className={inputCls} {...a11y("email")} />
        </FieldShell>
        <FieldShell id="phone" label="Téléphone" optional error={errors.phone}>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} maxLength={30} className={inputCls} {...a11y("phone")} />
        </FieldShell>

        <fieldset className="sm:col-span-2" aria-describedby={errors.service ? "service-error" : undefined}>
          <legend className="mb-3 text-[0.9rem] font-medium text-paper">
            Type de prestation<span className="text-electric" aria-hidden> *</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((opt) => (
              <label key={opt} className="relative">
                <input
                  type="radio"
                  name="service"
                  value={opt}
                  defaultChecked={v.service === opt}
                  onChange={() => clearError("service")}
                  className="peer absolute inset-0 cursor-pointer opacity-0"
                />
                <span className="inline-flex h-11 cursor-pointer items-center rounded-[3px] border border-line-strong px-4 text-[0.92rem] text-mist transition-colors peer-checked:border-electric peer-checked:bg-electric peer-checked:text-ink peer-hover:border-paper/50 peer-hover:text-paper peer-checked:peer-hover:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-glow">
                  {opt}
                </span>
              </label>
            ))}
          </div>
          {errors.service && (
            <p id="service-error" className="mt-2 text-sm text-[#ff8a8a]">
              {errors.service}
            </p>
          )}
        </fieldset>

        <FieldShell id="budget" label="Budget envisagé" optional error={errors.budget} className="sm:col-span-2">
          <div className="relative">
            <select id="budget" name="budget" defaultValue={v.budget ?? ""} className={cn(inputCls, "appearance-none pr-10")} {...a11y("budget")}>
              <option value="">Sélectionner une tranche</option>
              {budgetRanges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-mist">
              ▾
            </span>
          </div>
        </FieldShell>

        <FieldShell
          id="message"
          label="Votre projet"
          error={errors.message}
          className="sm:col-span-2"
          hint={
            <span className={cn("ml-auto font-mono text-[0.7rem]", messageLength > MESSAGE_MAX ? "text-[#ff8a8a]" : "text-slate")} aria-hidden>
              {messageLength}/{MESSAGE_MAX}
            </span>
          }
        >
          <textarea
            id="message"
            name="message"
            rows={6}
            defaultValue={v.message}
            placeholder="Votre activité, ce que vous souhaitez créer ou améliorer, vos éventuelles échéances…"
            className={cn(inputCls, "min-h-40 resize-y leading-relaxed")}
            {...a11y("message")}
            onInput={(e) => {
              setMessageLength(e.currentTarget.value.length);
              clearError("message");
            }}
          />
        </FieldShell>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3.5 text-[0.92rem] leading-relaxed text-mist">
            <input
              type="checkbox"
              name="consent"
              defaultChecked={v.consent === "on"}
              className="mt-1 size-[1.15rem] shrink-0 cursor-pointer accent-[#087BFF]"
              {...a11y("consent")}
            />
            <span>
              J&apos;accepte que les informations saisies soient utilisées par WEBPRO AGENCY pour répondre à ma demande et, le
              cas échéant, établir un devis. Elles ne sont ni cédées ni utilisées à d&apos;autres fins. En savoir plus :{" "}
              <Link href="/politique-confidentialite" className="link-inline">
                politique de confidentialité
              </Link>
              .<span className="text-electric" aria-hidden> *</span>
            </span>
          </label>
          {errors.consent && (
            <p id="consent-error" className="mt-2 text-sm text-[#ff8a8a]">
              {errors.consent}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col-reverse items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
        <p id="form-note" className="text-sm text-slate">
          <span className="text-electric">*</span> Champs obligatoires.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="group/btn inline-flex h-14 items-center justify-between gap-5 rounded-[3px] bg-electric pr-4 pl-6 font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-glow active:scale-[0.985] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Envoi en cours…" : "Envoyer ma demande"}
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
    </form>
  );
}
