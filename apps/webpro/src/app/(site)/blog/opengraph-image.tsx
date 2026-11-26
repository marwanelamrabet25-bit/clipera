import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Conseils de WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Conseils", title: "Des conseils clairs pour votre présence en ligne." });
}
