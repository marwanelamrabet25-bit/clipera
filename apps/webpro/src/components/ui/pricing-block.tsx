import { offersFor, pricing } from "@/config/pricing";
import type { ServiceSlug } from "@/config/services";
import { SectionLabel } from "./section-label";
import { ButtonLink } from "./button";

/**
 * Bloc « Tarifs » piloté par src/config/pricing.ts.
 * Tant que les tarifs ne sont pas validés (enabled: false), il invite à demander un devis.
 */
export function PricingBlock({ service, index }: { service: ServiceSlug; index?: string }) {
  const offers = offersFor(service);
  return (
    <section aria-labelledby={`pricing-${service}`} className="border-t border-line py-24 md:py-32">
      <div className="shell grid-12 items-end gap-y-10">
        <div className="col-span-4 md:col-span-12 lg:col-span-7">
          <SectionLabel index={index}>Tarifs</SectionLabel>
          <h2 id={`pricing-${service}`} className="t-h2 mt-8 max-w-[18ch] text-paper">
            {offers.length ? "Nos formules" : "Un devis adapté"} <span className="text-slate">{offers.length ? "de départ." : "à votre projet."}</span>
          </h2>
          {!offers.length && (
            <p data-reveal className="t-lead mt-8 max-w-[52ch] text-mist">
              Chaque projet est différent : nombre de pages, fonctionnalités, contenus à créer. Plutôt qu&apos;un tarif générique,
              nous vous remettons un devis détaillé après avoir compris votre besoin.
            </p>
          )}
        </div>
        <div className="col-span-4 md:col-span-12 lg:col-span-4 lg:col-start-9 lg:justify-self-end">
          <ButtonLink href="/contact">Demander un devis</ButtonLink>
        </div>
        {offers.length > 0 && (
          <ul className="col-span-full mt-6 grid gap-6 md:grid-cols-3">
            {offers.map((o) => (
              <li key={o.name} className="border-t border-line-strong pt-6">
                <h3 className="text-xl font-semibold text-paper">{o.name}</h3>
                <p className="mt-2 text-2xl font-bold text-electric">{o.price}</p>
                <ul className="mt-5 space-y-2 text-mist">
                  {o.includes.map((it) => (
                    <li key={it}>— {it}</li>
                  ))}
                </ul>
                {o.note && <p className="mt-4 text-sm text-slate">{o.note}</p>}
              </li>
            ))}
            {pricing.vatNote && <li className="col-span-full text-sm text-slate">{pricing.vatNote}</li>}
          </ul>
        )}
      </div>
    </section>
  );
}
