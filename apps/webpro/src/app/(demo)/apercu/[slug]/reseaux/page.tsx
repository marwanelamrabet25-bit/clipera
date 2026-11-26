import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demoSocial } from "@/components/demos/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(demoSocial).map((slug) => ({ slug }));
}

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Kit réseaux sociaux (démonstration)" };

/** Planche de visuels pour les réseaux sociaux, utilisée pour générer les images des fiches projets. */
export default async function SocialKit({ params }: PageProps<"/apercu/[slug]/reseaux">) {
  const { slug } = await params;
  const Social = demoSocial[slug];
  if (!Social) notFound();
  return (
    <div className="mx-auto aspect-[4/3] w-[1200px] font-[family-name:var(--font-manrope)]">
      <Social />
    </div>
  );
}
