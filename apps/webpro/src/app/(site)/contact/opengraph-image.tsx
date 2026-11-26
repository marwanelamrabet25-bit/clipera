import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Contacter WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Contact & devis", title: "Parlons de votre projet.", subtitle: "07 68 35 50 56 · webproagency25@gmail.com" });
}
