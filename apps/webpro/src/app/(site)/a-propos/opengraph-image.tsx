import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "À propos de WEBPRO AGENCY";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "L'agence", title: "Une agence digitale à Pierrefontaine-les-Varans.", subtitle: "Au service des professionnels de tout le Doubs" });
}
