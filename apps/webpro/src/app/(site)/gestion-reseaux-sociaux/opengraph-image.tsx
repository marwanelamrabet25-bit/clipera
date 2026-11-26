import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Gestion des réseaux sociaux dans le Doubs — WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Service 02 · Réseaux sociaux", title: "Gestion des réseaux sociaux pour les entreprises du Doubs." });
}
