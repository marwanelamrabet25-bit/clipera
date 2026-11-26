import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { Expertises } from "@/components/home/expertises";
import { Work } from "@/components/home/work";
import { Method } from "@/components/home/method";
import { Local } from "@/components/home/local";
import { FaqSection } from "@/components/home/faq-section";
import { ClosingCta } from "@/components/ui/closing-cta";
import { homeFaq } from "@/content/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Agence web Doubs · WEBPRO AGENCY, Pierrefontaine-les-Varans",
  absoluteTitle: true,
  description:
    "Agence digitale à Pierrefontaine-les-Varans : création de sites internet, réseaux sociaux et contenus vidéo pour les professionnels de tout le Doubs.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Expertises />
      <Work />
      <Method />
      <Local />
      <FaqSection items={homeFaq} />
      <ClosingCta />
    </>
  );
}
