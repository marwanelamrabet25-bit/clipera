import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "WEBPRO AGENCY — agence web à Pierrefontaine-les-Varans, Doubs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Agence digitale · Doubs (25)", title: "Votre présence en ligne, notre métier.", subtitle: "Sites internet · Réseaux sociaux · Contenus vidéo" });
}
