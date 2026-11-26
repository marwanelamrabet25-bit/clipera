import { SectionLabel } from "@/components/ui/section-label";
import { Faq } from "@/components/ui/faq";
import { ArrowLink } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo";
import type { QA } from "@/content/faq";

export function FaqSection({
  items,
  index = "06",
  title = "Les questions que l'on nous pose",
  titleMuted = "avant de se lancer.",
}: {
  items: QA[];
  index?: string;
  title?: string;
  titleMuted?: string;
}) {
  return (
    <section aria-labelledby="faq-title" className="relative border-t border-line py-28 md:py-40">
      <div className="shell grid-12 gap-y-12">
        <div className="col-span-4 md:col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <SectionLabel index={index}>Questions fréquentes</SectionLabel>
            <h2 id="faq-title" className="t-h2 mt-8 max-w-[13ch] text-paper">
              {title} <span className="text-slate">{titleMuted}</span>
            </h2>
            <div className="mt-10">
              <ArrowLink href="/contact">Une autre question ? Écrivez-nous</ArrowLink>
            </div>
          </div>
        </div>
        <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-6">
          <Faq items={items} />
        </div>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
