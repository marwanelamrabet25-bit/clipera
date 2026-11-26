"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { sendContact, type ContactState } from "@/app/(site)/contact/actions";
import { care, offers } from "@/config/offers";
import { contact } from "@/config/site";
import { MESSAGE_MAX, readValues, serviceOptions, validate, type ContactErrors, type Field } from "@/lib/contact-schema";
import { cn } from "@/lib/cn";
import { BotTraps, buildMailto, ConsentField, DeliveryAlert, FieldShell, inputCls, SubmitRow, SuccessPanel } from "@/components/forms/form-ui";

const initial: ContactState = { status: "idle" };

/** ?offre=site|social|pack|care (liens des cartes tarifaires) → option présélectionnée. */
function offerFromQuery() {
  const id = new URLSearchParams(window.location.search).get("offre");
  if (id === "care") return care.formValue;
  return offers.find((o) => o.id === id)?.formValue;
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
    const preset = offerFromQuery();
    if (preset) {
      const radio = formRef.current?.querySelector<HTMLInputElement>(`input[name="service"][value="${CSS.escape(preset)}"]`);
      if (radio) radio.checked = true;
    }
  }, []);

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
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
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
      <SuccessPanel ref={statusRef} title="Merci, votre message est bien parti.">
        <p>
          Nous l&apos;avons bien reçu et revenons vers vous pour échanger sur votre projet. Vous pouvez aussi appeler le{" "}
          <a href={`tel:${contact.phoneE164}`} className="link-inline whitespace-nowrap">
            {contact.phoneDisplay}
          </a>
          .
        </p>
        <Link href="/maquette-gratuite" className="mt-8 inline-flex items-center gap-2 font-semibold text-paper hover:text-glow">
          Découvrir la maquette gratuite <ArrowRight className="size-4" aria-hidden />
        </Link>
      </SuccessPanel>
    );
  }

  const mailto = buildMailto(`Demande de contact — ${v.service ?? ""}`, [
    `Nom : ${v.firstName ?? ""} ${v.lastName ?? ""}`,
    `Entreprise : ${v.company || "—"}`,
    `Email : ${v.email ?? ""}`,
    `Téléphone : ${v.phone || "—"}`,
    `Objet : ${v.service ?? ""}`,
    "",
    v.message ?? "",
  ]);

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} noValidate className="relative" aria-describedby="form-note">
      {(state.status === "unconfigured" || state.status === "failed" || state.status === "limited") && (
        <DeliveryAlert ref={statusRef} status={state.status} mailto={mailto} />
      )}
      <BotTraps ref={startedRef} />

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
            Votre demande concerne
            <span className="text-electric" aria-hidden>
              {" "}
              *
            </span>
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
            placeholder="Votre activité, ce que vous souhaitez créer ou améliorer, vos questions…"
            className={cn(inputCls, "min-h-40 resize-y leading-relaxed")}
            {...a11y("message")}
            onInput={(e) => {
              setMessageLength(e.currentTarget.value.length);
              clearError("message");
            }}
          />
        </FieldShell>

        <ConsentField
          error={errors.consent}
          defaultChecked={v.consent === "on"}
          text="J'accepte que les informations saisies soient utilisées par WEBPRO AGENCY pour répondre à ma demande et, le cas échéant, établir une proposition. Elles ne sont ni cédées ni utilisées à d'autres fins."
        />
      </div>

      <SubmitRow pending={pending} label="Envoyer ma demande" />
    </form>
  );
}
