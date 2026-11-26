import { SectionLabel } from "@/components/ui/section-label";
import { Words } from "@/components/ui/words";
import { ArrowLink } from "@/components/ui/button";
import { CareOption, OfferGrid, PricingFootnote } from "./offer-cards";
import type { Offer } from "@/config/offers";

/** Section « Tarifs » réutilisable (accueil, pages services). Tous les montants viennent de src/config/offers.ts. */
export function PricingSection({
  index,
  ids,
  title = ["Des tarifs clairs,", { text: "sans surprise.", className: "text-slate" }],
  showCare = true,
  showLink = true,
  id = "tarifs",
}: {
  index?: string;
  ids?: Offer["id"][];
  title?: (string | { text: string; className?: string })[];
  showCare?: boolean;
  showLink?: boolean;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative border-t border-line bg-ink-2/40 py-28 md:py-36">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-3">
            <SectionLabel index={index}>Tarifs</SectionLabel>
          </div>
          <div className="col-span-4 md:col-span-9 md:flex md:items-end md:justify-between md:gap-10">
            <Words id={`${id}-title`} className="t-h2 max-w-[15ch] text-paper" parts={title} />
            <p data-reveal className="mt-6 max-w-[38ch] text-mist md:mt-0 md:mb-2">
              Les paiements uniques et les paiements mensuels sont toujours affichés séparément.
            </p>
          </div>
        </div>
        <div className="mt-16">
          <OfferGrid ids={ids} />
          <PricingFootnote />
        </div>
        {showCare && <CareOption className="mt-10" />}
        {showLink && (
          <div className="mt-12">
            <ArrowLink href="/tarifs">Voir le détail des tarifs</ArrowLink>
          </div>
        )}
      </div>
    </section>
  );
}
