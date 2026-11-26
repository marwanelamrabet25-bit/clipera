import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockupExamples, mockupBySlug } from "@/content/mockups";
import { demoPages } from "@/components/demos/registry";
import { DemoBanner } from "@/components/demos/demo-banner";

export const dynamicParams = false;

export function generateStaticParams() {
  return mockupExamples.filter((m) => demoPages[m.slug]).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apercu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = mockupBySlug(slug);
  return {
    title: m ? `Exemple de maquette — ${m.sector} (entreprise fictive)` : "Exemple de maquette",
    robots: { index: false, follow: false },
  };
}

export default async function DemoPreview({ params }: PageProps<"/apercu/[slug]">) {
  const { slug } = await params;
  const m = mockupBySlug(slug);
  const Demo = demoPages[slug];
  if (!m || !Demo) notFound();
  return (
    <>
      <Demo />
      <DemoBanner name={m.name} />
    </>
  );
}
