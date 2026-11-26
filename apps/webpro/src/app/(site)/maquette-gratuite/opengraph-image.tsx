import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Maquette gratuite de votre futur site internet — WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "Offert · Première maquette",
    title: "Découvrez gratuitement une première maquette de votre futur site.",
  });
}
