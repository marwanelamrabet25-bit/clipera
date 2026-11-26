"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { requestMockup, type MockupState } from "@/app/(site)/maquette-gratuite/actions";
import { contact } from "@/config/site";
import { DESCRIPTION_MAX, readMockup, validateMockup, type MockupErrors, type MockupField } from "@/lib/mockup-schema";
import { cn } from "@/lib/cn";
import { BotTraps, buildMailto, ConsentField, DeliveryAlert, FieldShell, inputCls, SubmitRow, SuccessPanel } from "./form-ui";

const initial: MockupState = { status: "idle" };

const sectorSuggestions = [
  "Artisan du bâtiment",
  "Menuiserie, charpente",
  "Commerce de proximité",
  "Restaurant, café",
  "Coiffure, beauté",
  "Santé, bien-être",
  "Services aux entreprises",
  "Industrie",
  "Association",
];

export function MockupForm() {
  const [state, action, pending] = useActionState(requestMockup, initial);
  const [clientErrors, setClientErrors] = useState<MockupErrors>({});
  const [descLength, setDescLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "invalid" && state.errors) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(state.errors)[0]}"]`)?.focus();
    } else {
      statusRef.current?.focus();
    }
  }, [state]);

  const errors: MockupErrors = { ...(state.status === "invalid" ? state.errors : {}), ...clientErrors };
  const v = state.values ?? {};

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const errs = validateMockup(readMockup((k: MockupField) => fd.get(k)));
    setClientErrors(errs);
    if (Object.keys(errs).length) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
    }
  };

  const clearError = (k: MockupField) => {
    if (clientErrors[k])
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
  };

  const a11y = (k: MockupField) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
    onInput: () => clearError(k),
  });

  if (state.status === "sent") {
    return (
      <SuccessPanel ref={statusRef} title="Merci, votre demande de maquette est bien arrivée.">
        <p>
          Nous étudions les informations sur votre entreprise, puis nous revenons vers vous pour échanger et vous présenter une
          première proposition visuelle. Une question en attendant ? Appelez le{" "}
          <a href={`tel:${contact.phoneE164}`} className="link-inline whitespace-nowrap">
            {contact.phoneDisplay}
          </a>
          .
        </p>
      </SuccessPanel>
    );
  }

  const mailto = buildMailto(`Demande de maquette gratuite — ${v.company ?? ""}`, [
    `Nom : ${v.name ?? ""}`,
    `Entreprise : ${v.company ?? ""}`,
    `Secteur d'activité : ${v.sector ?? ""}`,
    `Email : ${v.email ?? ""}`,
    `Téléphone : ${v.phone || "—"}`,
    `Site existant : ${v.siteUrl || "—"}`,
    "",
    "Description de l'entreprise :",
    v.description ?? "",
    "",
    `Informations complémentaires : ${v.extra || "—"}`,
  ]);

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} noValidate className="relative" aria-describedby="form-note">
      {(state.status === "unconfigured" || state.status === "failed" || state.status === "limited") && (
        <DeliveryAlert ref={statusRef} status={state.status} mailto={mailto} />
      )}
      <BotTraps ref={startedRef} />

      <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2">
        <FieldShell id="name" label="Nom" error={errors.name}>
          <input id="name" name="name" autoComplete="name" defaultValue={v.name} maxLength={120} className={inputCls} {...a11y("name")} />
        </FieldShell>
        <FieldShell id="mk-company" label="Entreprise" error={errors.company}>
          <input id="mk-company" name="company" autoComplete="organization" defaultValue={v.company} maxLength={120} className={inputCls} {...a11y("company")} aria-describedby={errors.company ? "mk-company-error" : undefined} />
        </FieldShell>
        <FieldShell id="mk-email" label="Adresse email" error={errors.email}>
          <input id="mk-email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={v.email} maxLength={160} className={inputCls} {...a11y("email")} aria-describedby={errors.email ? "mk-email-error" : undefined} />
        </FieldShell>
        <FieldShell id="mk-phone" label="Téléphone" optional error={errors.phone}>
          <input id="mk-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} maxLength={30} className={inputCls} {...a11y("phone")} aria-describedby={errors.phone ? "mk-phone-error" : undefined} />
        </FieldShell>
        <FieldShell id="sector" label="Secteur d'activité" error={errors.sector} className="sm:col-span-2">
          <input id="sector" name="sector" list="sector-list" defaultValue={v.sector} maxLength={120} placeholder="Ex. menuiserie, restaurant, salon de coiffure…" className={inputCls} {...a11y("sector")} />
          <datalist id="sector-list">
            {sectorSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </FieldShell>
        <FieldShell
          id="description"
          label="Description de votre entreprise"
          error={errors.description}
          className="sm:col-span-2"
          hint={
            <span className={cn("ml-auto font-mono text-[0.7rem]", descLength > DESCRIPTION_MAX ? "text-[#ff8a8a]" : "text-slate")} aria-hidden>
              {descLength}/{DESCRIPTION_MAX}
            </span>
          }
        >
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={v.description}
            placeholder="Votre activité, vos services, votre clientèle, ce qui vous distingue, où vous intervenez…"
            className={cn(inputCls, "min-h-36 resize-y leading-relaxed")}
            {...a11y("description")}
            onInput={(e) => {
              setDescLength(e.currentTarget.value.length);
              clearError("description");
            }}
          />
        </FieldShell>
        <FieldShell id="siteUrl" label="Site existant" optional error={errors.siteUrl} className="sm:col-span-2">
          <input id="siteUrl" name="siteUrl" type="text" inputMode="url" autoComplete="url" defaultValue={v.siteUrl} maxLength={300} placeholder="www.votre-entreprise.fr" className={inputCls} {...a11y("siteUrl")} />
        </FieldShell>
        <FieldShell id="extra" label="Informations complémentaires" optional error={errors.extra} className="sm:col-span-2">
          <textarea id="extra" name="extra" rows={3} defaultValue={v.extra} placeholder="Couleurs ou logo existants, sites que vous aimez, pages souhaitées…" className={cn(inputCls, "resize-y leading-relaxed")} {...a11y("extra")} />
        </FieldShell>

        <ConsentField
          error={errors.consent}
          defaultChecked={v.consent === "on"}
          text="J'accepte que les informations saisies soient utilisées par WEBPRO AGENCY pour préparer ma maquette et me recontacter à ce sujet. Elles ne sont ni cédées ni utilisées à d'autres fins."
        />
      </div>

      <SubmitRow pending={pending} label="Demander ma maquette gratuite" />
    </form>
  );
}
