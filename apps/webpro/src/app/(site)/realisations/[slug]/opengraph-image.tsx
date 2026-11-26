import { ogImage, ogSize, ogContentType } from "@/lib/og";
import { projects, projectBySlug } from "@/content/projects";

export const alt = "Projet de démonstration — WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  return ogImage({ eyebrow: p?.demo ? "Projet de démonstration" : "Réalisation", title: p?.name ?? "Réalisation", subtitle: p?.sector });
}
