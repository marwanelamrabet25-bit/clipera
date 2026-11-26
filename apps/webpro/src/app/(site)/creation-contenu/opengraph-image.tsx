import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Création de contenus vidéo dans le Doubs — WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Service 03 · Contenus & vidéo", title: "Création de contenus vidéo et visuels pour les entreprises du Doubs." });
}
