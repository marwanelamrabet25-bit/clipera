import { ogImage, ogSize, ogContentType } from "@/lib/og";
import { formatPrice, offerById } from "@/config/offers";

export const alt = "Tarifs WEBPRO AGENCY — site internet et réseaux sociaux";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  const site = offerById("site").billing[0];
  const social = offerById("social").billing[0];
  return ogImage({
    eyebrow: "Tarifs",
    title: "Des tarifs clairs, sans surprise.",
    subtitle: `Site internet ${formatPrice(site.amount)} (paiement unique) · Réseaux sociaux ${formatPrice(social.amount)}/mois`,
  });
}
