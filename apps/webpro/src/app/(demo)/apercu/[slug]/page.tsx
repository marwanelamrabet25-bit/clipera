import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, projectBySlug } from "@/content/projects";
import { demoPages } from "@/components/demos/registry";
import { DemoBanner } from "@/components/demos/demo-banner";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter((p) => p.demo && demoPages[p.slug]).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apercu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  return {
    title: p ? `Aperçu — ${p.name} (projet de démonstration)` : "Aperçu",
    robots: { index: false, follow: false },
  };
}

export default async function DemoPreview({ params }: PageProps<"/apercu/[slug]">) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  const Demo = demoPages[slug];
  if (!p || !Demo) notFound();
  return (
    <>
      <Demo />
      <DemoBanner slug={p.slug} name={p.name} />
    </>
  );
}
