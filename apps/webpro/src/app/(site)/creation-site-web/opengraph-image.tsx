import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Création de sites internet dans le Doubs — WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Service 01 · Sites internet", title: "Création de sites internet pour les professionnels du Doubs." });
}
