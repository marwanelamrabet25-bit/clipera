import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { Expertises } from "@/components/home/expertises";
import { Method } from "@/components/home/method";
import { Local } from "@/components/home/local";
import { FaqSection } from "@/components/home/faq-section";
import { MockupOffer } from "@/components/offers/mockup-offer";
import { PricingSection } from "@/components/offers/pricing-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { homeFaq } from "@/content/faq";
import { offerCatalogJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Agence web Doubs · WEBPRO AGENCY, Pierrefontaine-les-Varans",
  absoluteTitle: true,
  description:
    "Agence digitale à Pierrefontaine-les-Varans : création de sites internet et gestion des réseaux sociaux pour les professionnels du Doubs. Maquette gratuite.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Expertises />
      <MockupOffer index="03" />
      <PricingSection index="04" />
      <Method index="05" />
      <Local index="06" />
      <FaqSection items={homeFaq} index="07" />
      <ClosingCta />
      <JsonLd data={offerCatalogJsonLd()} />
    </>
  );
}
