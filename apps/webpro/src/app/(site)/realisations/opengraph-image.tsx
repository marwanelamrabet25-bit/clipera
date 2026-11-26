import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Réalisations de WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Portfolio", title: "Réalisations et projets de démonstration." });
}
